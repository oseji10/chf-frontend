import React, { useEffect, useState } from "react";
import API from "../../../config/chfBackendApi";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
import styles from "../../patient/billingHistory.module.scss";
import Modal from "../../../components/modal/modal";
import ModalHeader from "../../../components/modal/modalHeader";
import ModalBody from "../../../components/modal/modalBody";
import { timestampToRegularTime, todayDate } from "../../../utils/date.util";
import { formatAsMoney } from "../../../utils/money.utils";
import HistoryHeader from "../../patient/TableTop";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import { transactionTotal } from "../../../utils/db.utils";
import PageTitle from "../../report/infographics/pageTitle";
import { useParams, useLocation  } from "react-router";
import { parseQueryParams} from "../../../utils/route.utils";

const initial_state = {
  transactions: [],
  activeTransaction: null,
  currentCoeDetails: null,
  startDate: "",
  endDate: "",
  isDrug:"",
  dataLoading: true,
  drugs: [],
  cap_transaction:[],
  coe_cap_id:""
};

function DrugBillingHistory() {
  const [state, setState] = useState(initial_state);
  const coe_id = useParams().coe_id;
  let location = useLocation();
  const queryParams=parseQueryParams(location.search);
 
  const loadTransactions = async () => {
    try {
      setStateValue("dataLoading", true);
      console.log(state.coe_cap_id);
      const res = await Promise.all([
        API.get(
          `/api/coes/${coe_id}/billings?&start_date=${state.startDate}&end_date=${state.endDate}&is_drug=${state.isDrug}&is_paginate=0`
        ),
        API.get(`/api/coes/${coe_id}`),
        axios.get(
            `https://emge.emgeresources.com/api/v1.0/coe_transactions.php?start_date=${state.startDate}&end_date=${state.endDate}&loc_id=${state.coe_cap_id}`
          ),
      ]);
      // console.log(res[0].data)
      setState((prevState) => ({
        ...prevState,
        transactions: res[0].data.data,
        currentCoeDetails: res[1].data.data,
        cap_transaction: res[2].data,
        pagination: {
          ...prevState.pagination,
          links: res[0].data.data.links,
          currentPage: res[0].data.data.current_page,
          totalPages: res[0].data.data.last_page,
        },
        dataLoading: false,
      }));
    } catch (e) {
        console.log(e.message)
    }
  };

  const getDrugs = async () => {
    try {
      const res = await axios.get(
        "https://emge.emgeresources.com/api/v1.0/products.php"
      );

      setState((prev) => ({
        ...prev,
        drugs: res.data,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const getDrug = (drug_id) => {
    return state.drugs.filter((drug) => drug.prod_id === drug_id)[0];
  };

  const getTransactions = (order_id) => {
    return state.transactions.filter((transaction) => transaction.transaction_id === order_id)[0];
  };

  const renderTransactionDrugs = () => {
    return state.activeTransaction.transactions.map((transaction, index) => {
      const drug = getDrug(transaction.drug_id);
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{drug.prod_name}</td>
          <td>{drug.description}</td>
          <td>{drug.short_name}</td>
          <td>NGN {formatAsMoney(parseFloat(drug.retail_cost))}</td>
          <td>{transaction.quantity}</td>
        </tr>
      );
    });
  };

  useEffect(() => {
    getDrugs();
    if(queryParams)
      setState(prevState=>({
        ...prevState,
        startDate: queryParams.start_date?queryParams.start_date:todayDate(),
        endDate: queryParams.end_date?queryParams.end_date:todayDate(),
        coe_cap_id: queryParams.coe_cap_id?queryParams.coe_cap_id:"",
        isDrug: queryParams.is_drug?queryParams.is_drug:""
      }));
    if (state.startDate && state.endDate) {
      return loadTransactions();
    }

    loadTransactions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startDate,state.endDate]);

  const renderTransactions = () => {
    return (
      (state.transactions.length &&
        state.cap_transaction.map((transaction, index) => {
            const drug = getDrug(transaction.prod_id);
            const orderTransactions=getTransactions(transaction.order_id);
            if(!orderTransactions) return <></>;
            else  return (
            <tr key={index} onClick={() => handleTransactionClick(index)}>
              <td>{index + 1}</td>
              <td>{transaction.order_id}</td>
              <td>
                <span className={styles.time_badge}>
                  {timestampToRegularTime(transaction.order_date)}
                </span>
              </td>
              <td>
                {orderTransactions.biller.first_name} {orderTransactions.biller.last_name}
              </td>
              <td>{drug && drug.prod_name}</td>
              <td>{drug && drug.short_name}</td>
              <td><del>N</del>{formatAsMoney(parseFloat(transaction.cost)*parseFloat(transaction.qty))}</td>
              <td><del>N</del>{formatAsMoney(parseFloat(transaction.coe)*parseFloat(transaction.qty))}</td>
              <td>
              <del>N</del>{formatAsMoney(parseFloat(transaction.bank)*parseFloat(transaction.qty))}
              </td>
              <td>
              <del>N</del>{formatAsMoney((parseFloat(transaction.manufacturer_cost)+parseFloat(transaction.wwcv))*parseFloat(transaction.qty))}
              </td>
              <td>
              <del>N</del>{formatAsMoney(parseFloat(transaction.emge)*parseFloat(transaction.qty))}
              </td>
            </tr>
          );
        })) || (
        <tr>
          <td colSpan="7">
            There is no billing for this coe today. Select a start date and end
            date to view previous billings
          </td>
        </tr>
      )
    );
  };

  const handleCloseModal = () => {
    setState((prevState) => ({
      ...prevState,
      activeTransaction: null,
    }));
  };

  const handleTransactionClick = (index) => {
    const clickedTransaction = state.transactions[index];

    setState((prevState) => ({
      ...prevState,
      activeTransaction: {
        ...clickedTransaction,
        totalCost: transactionTotal(clickedTransaction.transactions),
      },
    }));
  };

  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const setStateValue = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  return (
    <>
      <div className={["container", chfstyles.application_wrapper].join(" ")}>
        <div className="row">
          <div className="col-sm-12 text-right">
            <small>
              {state.currentCoeDetails && state.currentCoeDetails.wallet && (
                <strong>
                  Wallet: <del>N</del>
                  {`${formatAsMoney(
                    parseFloat(state.currentCoeDetails.wallet.balance)
                  )}`}
                </strong>
              )}
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
          </HistoryHeader>
          <table
            className={[
              "table table-responsive-sm",
              chfstyles.application_table,
            ].join(" ")}
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Transaction ID</th>
                <th>Transaction Date</th>
                <th>Attendant Staff</th>
                <th>Product</th>
                <th>Product Manufacturer</th>
                <th>Total Cost</th>
                <th>COE</th>
                <th>Bank</th>
                <th>Manufacturer / Distributor</th>
                <th>EMGE</th>
              </tr>
            </thead>
            <tbody>
              {(state.dataLoading && (
                <tr>
                  <td colSpan="7">
                    <Spinner animation="border" variant="success" />
                  </td>
                </tr>
              )) ||
                renderTransactions()}
            </tbody>
          </table>
        </div>
      </div>

      {state.activeTransaction && (
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
                  {state.activeTransaction.biller.first_name}{" "}
                  {state.activeTransaction.biller.last_name}{" "}
                </small>
              </div>
              <div className="col-sm-12">
                <h6 className={[styles.underlined, "text-success"].join(" ")}>
                  Services Rendered
                </h6>
                <table className="table table-responsive-sm">
                  <thead>
                      <tr>
                        <th>#</th>
                        <th>Drug Name</th>
                        <th>Drug Description</th>
                        <th>Manufacturer</th>
                        <th>Cost</th>
                        <th>Quantity</th>
                      </tr>
                  </thead>
                  <tbody>
                    {state.activeTransaction.transactions &&
                        state.activeTransaction.is_drug
                      ? renderTransactionDrugs()
                      : ""}
                    <tr>
                      <th>Total</th>
                        <td colSpan="4">&nbsp;</td>
                      <td>
                        <strong>
                          NGN{" "}
                          {state.activeTransaction.transactions &&
                            formatAsMoney(
                              parseFloat(state.activeTransaction.totalCost)
                            )}
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
    </>
  );
}

export default DrugBillingHistory;
