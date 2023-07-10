/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import API, { CAPBackendAPI } from '../../../config/chfBackendApi'
import chfstyles from '../../chfadmin/chfadmin.module.scss'
import styles from '../../patient/billingHistory.module.scss'
import Modal from '../../../components/modal/modal'
import ModalHeader from '../../../components/modal/modalHeader'
import ModalBody from '../../../components/modal/modalBody'
import { timestampToRegularTime } from '../../../utils/date.util'
import { formatAsMoney } from '../../../utils/money.utils'
import HistoryHeader from '../../patient/TableTop'
import { Spinner } from 'react-bootstrap'
import { useParams } from 'react-router'
import axios from 'axios'

const initial_state = {
  transactions: [],
  activeTransaction: null,
  startDate: "",
  endDate: "",
  dataLoading: true,
  drugs: [],
};

function BillingHistoryContainer() {
  // let pageLoaded = false;
  const patient_id = useParams().patient_id
  console.log(patient_id);
  const loadTransactions = async () => {
    try {
      const res = await Promise.all([
        API.get(
          `/api/patients/billing_history/${patient_id}?start_date=${state.startDate}&end_date=${state.endDate}`
        ),
        CAPBackendAPI.get('/product'),
      ]);
      console.log(res)
      setState((prevState) => ({
        ...prevState,
        transactions: res[0].data.data,
        drugs: res[1].data.data,
        dataLoading: false,
      }));
    } catch (e) {
      // console.log(e)
    }
  };

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    loadTransactions();
    if (state.startDate && state.endDate) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.endDate]);

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
              <td>{transaction.coe.coe_name}</td>
              <td>{transaction.transactions.length}</td>
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

  const renderTransactionServices = () => {
    return state.activeTransaction.transactions.map((transaction, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{transaction.service.service_name}</td>
          <td>{transaction.service.category.category_name}</td>
          <td>NGN {formatAsMoney(transaction.service.price)}</td>
          <td>{transaction.quantity}</td>
        </tr>
      );
    });
  };

  const getDrug = (drug_id) => {
    return state.drugs.filter((drug) => drug.productId === drug_id)[0];
  };

  const renderTransactionDrugs = () => {
    return state.activeTransaction.transactions.map((transaction, index) => {
      const drug = getDrug(transaction.drug_id);
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{drug.productName}</td>
          <td>{drug.description}</td>
          <td>{drug.manufacturer?.manufacturerName}</td>
          <td>NGN {formatAsMoney(parseFloat(drug.price))}</td>
          <td>{transaction.quantity}</td>
        </tr>
      );
    });
  };

  const handleCloseModal = () => {
    setState((prevState) => ({
      ...prevState,
      activeTransaction: null,
    }));
  };

  const handleTransactionClick = (index) => {
    const clickedTransaction = state.transactions[index];
    let sum = 0;
    let qty = 0;
    for (let transaction of clickedTransaction.transactions) {
      sum += transaction.cost;
      qty += transaction.quantity;
    }
    setState((prevState) => ({
      ...prevState,
      activeTransaction: {
        ...clickedTransaction,
        totalCost: sum,
        totalQuantity: qty,
      },
    }));
  };

  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <div className={["container", chfstyles.application_wrapper].join(" ")}>
        <h4>
          {" "}
          <i className="fa fa-arrow-left"></i> Billing History
        </h4>
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
              <label className="text-secondary">Start End</label>
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
                <th>COE</th>
                <th>Service Count</th>
                <th>Physician</th>
              </tr>
            </thead>
            <tbody>
              {(state.dataLoading && (
                <Spinner animation="border" variant="success" />
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
              <div className="col-md-12">
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
                    {state.activeTransaction.transactions &&
                    !state.activeTransaction.is_drug
                      ? renderTransactionServices()
                      : state.activeTransaction.transactions &&
                        state.activeTransaction.is_drug
                      ? renderTransactionDrugs()
                      : ""}
                    <tr>
                      <th>Total</th>
                      {state.activeTransaction.transactions &&
                      !state.activeTransaction.is_drug ? (
                        <td colSpan="2">&nbsp;</td>
                      ) : (
                        <td colSpan="3">&nbsp;</td>
                      )}
                      <td>
                        <strong>
                          NGN{" "}
                          {state.activeTransaction.transactions &&
                            formatAsMoney(
                              parseFloat(state.activeTransaction.totalCost)
                            )}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {state.activeTransaction.transactions &&
                            state.activeTransaction.totalQuantity}
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
export default BillingHistoryContainer;
