import React, { useEffect, useState } from "react";
import API, { CHFBackendAPI } from "../../../config/chfBackendApi";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
import styles from "../../patient/billingHistory.module.scss";
import { timestampToRegularTime } from "../../../utils/date.util";
import { formatAsMoney } from "../../../utils/money.utils";
import HistoryHeader from "../../patient/TableTop";
import { connect } from "react-redux";
import axios from "axios";
import { transactionTotal } from "../../../utils/db.utils";
import MUIDataTable from 'mui-datatables';
import { COE_ADMIN_TRANSACTION_TABLE_COLUMNS } from "../../../utils/table-constants/transaction-table.constant";
import { formatName } from "../../../utils/dataFormat.util";
import { ButtonLoader, PageTitle, Modal, ModalHeader, ModalBody, Button, SingleActionModal, Textarea, AuthorizedOnlyComponent, } from "../../../components";
import { errorAlert, successAlert } from "../../../utils/alert.util";
import { errorHandler } from "../../../utils/error.utils";
import DrugService from "../../../services/drug.service";
import { GENERATE_INVOICE } from "../../../utils/permissions.constant";

const initial_state = {
  transactions: [],
  activeTransaction: null,
  currentCoeDetails: null,
  showGenerateInvoiceModal: false,
  startDate: "",
  endDate: "",
  pagination: {
    per_page: 10000,
    currentPage: 1,
    totalPages: 1,
    links: null,
  },
  showDisputeModal: false,
  showTransactionDetailModal: false,
  drugs: [],
};

function CoeAdminBillingHistory({ user }) {
  const [state, setState] = useState(initial_state);
  const [isLoading, setIsLoading] = useState(false);

  const loadTransactions = async () => {
    if (!state.startDate || !state.endDate) {
      return errorAlert("You must select a start date and end date range.")
    }
    try {
      setIsLoading(true);
      const res = await API.get(
        `/api/coes/${user.user?.coe_id}/billings?per_page=${state.pagination.per_page}&page=${state.pagination.page}&start_date=${state.startDate}&end_date=${state.endDate}`
      );
      setState((prevState) => ({
        ...prevState,
        transactions: res?.data?.data?.data ?? [],
        currentCoeDetails: res?.data?.data?.data?.length
          ? res.data.data.data[0]?.coe
          : null,
      }));
    } catch (e) {
      errorHandler(e);
    } finally {
      setIsLoading(false)
    }
  };

  const getDrugs = async () => {
    try {
      const res = await DrugService.getAllCAPProduct();

      setState((prev) => ({
        ...prev,
        drugs: res.data.data,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getDrugs();
    if (state.startDate && state.endDate) {
      // return loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const renderTransactions = () => {
    return (
      (state.transactions.length &&
        state.transactions.map((transaction, index) => {
          return (
            <tr key={index} onClick={() => handleTransactionClick(index)}>
              <td>{index + 1}</td>
              <td>{transaction.transaction_id}</td>
              <td>
                <span className={styles.time_badge}>
                  {timestampToRegularTime(transaction.created_at)}
                </span>
              </td>
              <td>{transaction.user.patient.chf_id}</td>
              <td>{transaction.transactions.length}</td>
              <td><del>N</del>{formatAsMoney(transactionTotal(transaction.transactions))}</td>
              <td>
                {transaction.biller.first_name} {transaction.biller.last_name}
              </td>
            </tr>
          );
        })) || (
        <tr>
          <td colSpan="7">You do not have any billing yet</td>
        </tr>
      )
    );
  };

  /* The actual price of a service should be the COE price */
  const renderTransactionServices = () => {
    return state.activeTransaction.transactions.map((transaction, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{transaction.service.service_name}</td>
          <td>{transaction.service.category.category_name}</td>
          <td>NGN {formatAsMoney(transaction.cost)}</td>
          <td>{transaction.quantity}</td>
        </tr>
      );
    });
  };

  const handleCloseModal = () => {
    setState((prevState) => ({
      ...prevState,
      activeTransaction: null,
      showTransactionDetailModal: false,
    }));
  };

  const handleTransactionClick = (__, indexData, _) => {
    const clickedTransaction = state.transactions[indexData.rowIndex];

    setState((prevState) => ({
      ...prevState,
      showTransactionDetailModal: true,
      activeTransaction: {
        ...clickedTransaction,
        totalCost: transactionTotal(clickedTransaction.transactions)
      },
    }));
  };

  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const getDrug = (drug_id) => {
    return state.drugs.find((drug) => drug.productId === drug_id);
  };

  const renderTransactionDrugs = () => {
    return state.activeTransaction.transactions.map((transaction, index) => {
      const drug = getDrug(transaction.drug_id);
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{drug.productName}</td>
          <td>{drug.description}</td>
          <td>{drug.manufacturerId}</td>
          <td>NGN {formatAsMoney(parseFloat(drug.price))}</td>
          <td>{transaction.quantity}</td>
        </tr>
      );
    });
  };
  const setStateValue = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  }

  const handleShowGenerateInvoiceModal = () => {
    if (!state.startDate || !state.endDate) {
      return errorAlert('You must select a start and end date to generate invoice')
    }

    return setStateValue('showGenerateInvoiceModal', true)
  }

  const handleGenerateInvoice = async () => {
    setStateValue('isLoading', true)
    try {
      const res = await CHFBackendAPI.post('/coes/invoice', {
        startDate: state.startDate,
        endDate: state.endDate
      });

      setState(prevState => ({
        ...prevState,
        showGenerateInvoiceModal: false,
      }));

      successAlert("Invoice generated successfully")
      return loadTransactions();

    } catch (error) {
      console.log(error)
      errorHandler(error)
    } finally {
      setStateValue('isLoading', false)
    }
  }

  return (
    <>
      <div className={["container", chfstyles.application_wrapper].join(" ")}>
        <div className="row">
          <div className="col-sm-12 text-right">
            {/* <small>
               {user && user.wallet && <strong>Allocation Wallet: <del>N</del>{`${formatAsMoney(parseFloat((state.currentCoeDetails && state.currentCoeDetails.fund_allocation) || 100000000))}`}</strong>}
            </small> */}
            <small style={{ display: 'block' }}>
              {/* {user && user.wallet && <strong>Allocation Wallet: <del>N</del>{`${formatAsMoney(parseFloat((state.currentCoeDetails && state.currentCoeDetails.fund_allocation) || 0))}`}</strong>} */}
              {user && user.wallet && <strong>Billing Total: <del>N</del>{`${formatAsMoney(parseFloat(user.wallet.balance))}`}</strong>}
            </small>
          </div>
        </div>
        <PageTitle
          title={
            state.currentCoeDetails
              ? `${state.currentCoeDetails.coe_name} Billing History`
              : "COE Billing History"
          }
        />
        <div className={chfstyles.application_table}>
          <HistoryHeader>
            <div className="col-md-3 mt-2">
              <label className="text-secondary">Start Date</label>
              <input
                type="date"
                onChange={handleInputChange}
                value={state.startDate}
                name="startDate"
              />
            </div>

            <div className="col-md-3 mt-2">
              <label className="text-secondary">End Date</label>
              <input
                type="date"
                name="endDate"
                onChange={handleInputChange}
                value={state.endDate}
              />
            </div>
            <div className="col-md-3 mt-2">
              <span className="d-block">-</span>
              <Button
                onClick={loadTransactions}
                loading={isLoading}
                text="Pull Record"
                variant='success' />
            </div>
            <div className="col-md-3 mt-2">
              <span className="d-block">-</span>
              {state.transactions?.length &&
                <AuthorizedOnlyComponent requiredPermission={GENERATE_INVOICE} >
                  <Button
                    onClick={handleShowGenerateInvoiceModal}
                    loading={isLoading}
                    text="Generate Invoice"
                    variant='info' />
                </AuthorizedOnlyComponent>
                || null}
            </div>
          </HistoryHeader>
          <MUIDataTable
            columns={COE_ADMIN_TRANSACTION_TABLE_COLUMNS}
            data={state.transactions.map((transaction, index) => [
              index + 1,
              transaction.transaction_id,
              timestampToRegularTime(transaction.created_at),
              transaction.user.patient.chf_id,
              transaction.transactions.length,
              formatAsMoney(transactionTotal(transaction.transactions)),
              formatName(transaction.biller),
              (!transaction.status && !transaction.is_disputed && <Button variant='danger' onClick={() => setStateValue('showDisputeModal', true)} > Dispute </Button>) || null
            ])}
            title={isLoading ? <ButtonLoader /> : null}
            options={{
              elevation: 0,
              selectableRows: false,
              onRowClick: handleTransactionClick
            }}
          />

        </div>
      </div>

      {state.showTransactionDetailModal && (
        <Modal fullscreen={true}>
          <ModalHeader
            modalTitle={"Transaction Detail"}
            onModalClose={handleCloseModal}
          ></ModalHeader>
          <ModalBody>
            <div className={["row", styles.billing_details].join(" ")}>
              <div className="col-md-6">
                <h5>
                  <strong>Transaction Reference</strong>
                </h5>
                <span>{state.activeTransaction.transaction_id}</span>
              </div>
              <div className="col-md-6">
                <h5>
                  <strong>COE VISITED</strong>
                </h5>
                <span>{state.activeTransaction.coe.coe_name}</span>
              </div>
              <div className="col-md-6">
                <h5>
                  <strong>Patient</strong>
                </h5>
                {/* <span>{`${state.activeTransaction.user.first_name} ${state.activeTransaction.user.last_name}`}</span>
                <br /> */}
                <span>
                  CHF ID: {state.activeTransaction.user.patient.chf_id}
                </span>
              </div>
              <div className="col-md-6">
                <h6>
                  <i className="fas fa-calendar"></i> Date Visited:{" "}
                </h6>
                <small>
                  {timestampToRegularTime(state.activeTransaction.created_at)}
                </small>
              </div>
              <div className="col-md-12">
                <h6>
                  <i className="fas fa-user"></i> Attendant Physician:{" "}
                </h6>
                <small>
                  {formatName(state.activeTransaction?.biller)}
                  {/*{state.activeTransaction.biller.first_name}{" "}*/}
                  {/*{state.activeTransaction.biller.last_name}{" "}*/}
                </small>
              </div>
              <div className="col-sm-12">
                <h6 className={[styles.underlined, "text-success"].join(" ")}>
                  Services Rendered
                </h6>
                <table className="table table-responsive-sm">
                  <thead>
                    {state.activeTransaction &&
                      !state.activeTransaction.is_drug ? (
                      <tr>
                        <th>#</th>
                        <th>Service Name</th>
                        <th>Service Category</th>
                        <th>Service Unit Cost</th>
                        <th>Quantity</th>
                        {/* <th>#</th> */}
                      </tr>
                    ) : (
                      <tr>
                        <th>#</th>
                        <th>Drug Name</th>
                        <th>Drug Description</th>
                        <th>Manufacturer</th>
                        <th>Cost</th>
                        <th>Quantity</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {(state.activeTransaction.transactions &&
                      !state.activeTransaction.is_drug) ?
                      renderTransactionServices() : (
                        state.activeTransaction.transactions &&
                        state.activeTransaction.is_drug) ?
                        renderTransactionDrugs() : ""}
                    <tr>
                      <th>Total</th>
                      {(state.activeTransaction.transactions && !state.activeTransaction.is_drug) ?
                        <td colSpan="3">&nbsp;</td>
                        : <td colSpan="4">&nbsp;</td>}
                      <td>
                        <strong>
                          NGN{" "}
                          {state.activeTransaction.transactions &&
                            formatAsMoney(parseFloat(state.activeTransaction.totalCost))}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-sm-12">
                <h6>Physician Comment:</h6>
                {(state.activeTransaction.comment && (
                  <p> {state.activeTransaction.comment.comment}</p>
                )) || <p>No Comment available</p>}
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}

      <SingleActionModal
        show={state.showDisputeModal}
        variant='danger'
        modalTitle="Dispute Transaction"
        content={<>
          <p>Reason for dispute</p>
          <Textarea placeholder="Reason for dispute" />

        </>}
        onConfirm={() => null}
        onModalClose={() => setStateValue('showDisputeModal', false)}

      />
      <SingleActionModal
        show={state.showGenerateInvoiceModal}
        variant='success'
        modalTitle="Generate invoice"
        content={<>
          <p>You are about to generate an invoice for {state.startDate} and {state.endDate}</p>
          <p>Please note that billings between this range that are disputed or have already been invoiced will not be a part of this invoice</p>
          {/* <Textarea placeholder="Reason for dispute" /> */}

        </>}
        loading={state.isLoading}
        onConfirm={handleGenerateInvoice}
        onModalClose={() => setStateValue('showGenerateInvoiceModal', false)}

      />

    </>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps)(CoeAdminBillingHistory);
