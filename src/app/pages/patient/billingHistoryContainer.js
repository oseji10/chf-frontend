import React, { useEffect, useState } from "react";
import API, { CAPBackendAPI } from "../../config/chfBackendApi";
import axios from "axios";
import chfstyles from "../chfadmin/chfadmin.module.scss";
import styles from "./billingHistory.module.scss";
import Modal from "../../components/modal/modal";
import ModalHeader from "../../components/modal/modalHeader";
import ModalBody from "../../components/modal/modalBody";
import { timestampToRegularTime } from "../../utils/date.util";
import { formatAsMoney } from "../../utils/money.utils";
import HistoryHeader from "./TableTop";
import { Spinner } from "react-bootstrap";
import { transactionTotal } from "../../utils/db.utils";
import MUIDataTables from 'mui-datatables';
import { formatName } from "../../utils/dataFormat.util";
import { PageTitle, Textarea } from "../../components";
import { Button, Grid, Typography } from "@material-ui/core";
import { toast } from "react-toastify";
import APIResponseHelper from "../../utils/apiResponse.util";
import { formatErrors, formatErrorsToString } from "../../utils/error.utils";

const initial_state = {
  transactions: [],
  activeTransaction: null,
  startDate: "",
  endDate: "",
  dataLoading: true,
  drugs: [],
  transactionToDispute: null,
  showTransactionToDisputeModal: false,
};

const tableColumns = [
  {
    name: "#",
    options: {
      filter: false,
    }
  },
  {
    name: "Transaction ID",
    options: {
      filter: false,
    }
  },
  {
    name: "Transaction Date",
    options: {
      filter: false,
      customBodyRender: date => <span className={styles.time_badge}>
        {date}
      </span>
    }
  },
  {
    name: "COE",
    options: {
      filter: false,
    }
  },
  {
    name: "Transaction Count",
    options: {
      filter: false,
    }
  },
  {
    name: "Total Cost",
    options: {
      filter: false,
    }
  },
  {
    name: "Attendant",
  },
  {
    name: "Action",
    options: {
      filter: false,
      sort: false
    }
  },
  {
    name: "Action",
    options: {
      filter: false,
      sort: false
    }
  },
  {
    name: "Disputed",
    options: {
      filter: false,
      sort: false,
      display: false,
    }
  },

];

function BillingHistoryContainer() {
  // let pageLoaded = false;

  const loadTransactions = async () => {
    try {
      setStateValue("dataLoading", true);
      const res = await Promise.all([
        API.get(
          `/api/patients/billing_history?start_date=${state.startDate}&end_date=${state.endDate}`
        ),
        CAPBackendAPI.get('/product')
      ]);
      // console.log(res[1])
      setState((prevState) => ({
        ...prevState,
        transactions: res[0].data.data.data,
        drugs: res[1].data.data,
        dataLoading: false,
      }));
    } catch (e) {
      // console.log(e)
    }
  };

  const [state, setState] = useState(initial_state);
  const [isLoading, setIsLoading] = useState(false);
  const [disputeComment, setDisputeComment] = useState('');

  useEffect(() => {
    loadTransactions();
    if (state.startDate && state.endDate) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.endDate]);

  /* The actual price of a service should be the COE price */
  const renderTransactionServices = () => {
    return state.activeTransaction.transactions.map((transaction, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{transaction.service.service_name}</td>
          <td>{transaction.service.category.category_name}</td>
          <td>NGN {formatAsMoney(transaction.service.coes[0].pivot.price)}</td>
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

    setState((prevState) => ({
      ...prevState,
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

  const setStateValue = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  }

  const handleShowDisputeModal = (transaction) => {
    return setState(prevState => ({
      ...prevState,
      showTransactionToDisputeModal: true,
      transactionToDispute: transaction,
    }))
  }

  const handleCompleteDispute = async () => {
    try {
      setIsLoading(true)
      await API.post('/api/transactions/dispute', {
        transaction_id: state.transactionToDispute?.transaction_id,
        comment: disputeComment,
      });
      setState(prev => ({
        ...prev,
        transactionToDispute: null,
        showTransactionToDisputeModal: false,
        transactions: prev.transactions.map(transaction => {
          if (transaction.transaction_id != prev.transactionToDispute?.transaction_id) return transaction;

          transaction.is_disputed = true;
          return transaction;
        })
      }));

      setDisputeComment('');
      return toast.success('Dispute has been raised on the transaction')
    } catch (error) {
      toast.error(formatErrorsToString(error))
    } finally {
      return setIsLoading(false)
    }
  }

  const handleCloseDisputeModal = () => {
    return setState(prev => ({
      ...prev,
      showTransactionToDisputeModal: false,
      transactionToDispute: null,
    }))
  }

  return (
    <>
      <div className={["container", chfstyles.application_wrapper].join(" ")}>

        <PageTitle title="Patient Billing History" />
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
          <MUIDataTables
            title={state.dataLoading ? <Spinner animation="border" variant="success" /> : "Transactions"}
            columns={tableColumns}
            options={{
              elevation: false,
              selectableRows: 'none',
              setRowProps: (row) => {
                if (row[9])
                  return {
                    style: {
                      backgroundColor: '#FFCCCB'
                    }
                  }
              }

            }}
            data={state.transactions.map((transaction, index) => [
              index + 1,
              transaction.transaction_id,
              timestampToRegularTime(transaction.created_at),
              transaction.coe?.coe_name,
              transaction.transactions?.length,
              formatAsMoney(transactionTotal(transaction.transactions)),
              formatName(transaction.biller),
              <Button
                variant="contained"
                color="default"
                onClick={() => handleTransactionClick(index)}
                size="small" >Detail</Button>,
              (!transaction.is_disputed && <Button
                variant="contained"
                color="secondary"
                onClick={() => handleShowDisputeModal(transaction)}
                size="small" >Dispute</Button>),
              transaction.is_disputed,
            ])}
          />
        </div>
      </div>

      {
        state.showTransactionToDisputeModal && (
          <Modal>
            <ModalHeader
              modalTitle={`Dispute Transaction - ${state.transactionToDispute?.transaction_id}`}
              onModalClose={handleCloseDisputeModal}
            ></ModalHeader>
            <ModalBody>
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Reason for Dispute</Typography>
                  <Textarea
                    value={disputeComment}
                    onChange={e => setDisputeComment(e.target.value)}
                    name=""

                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    onClick={handleCompleteDispute}
                    variant='contained'
                    color="secondary"
                    size='small'
                    disabled={isLoading}
                    endIcon={isLoading ? <Spinner variant="default" animation="border" /> : null}
                  >Submit Dispute </Button>
                </Grid>
              </Grid>
            </ModalBody>
          </Modal>
        )
      }

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
                        <td colSpan="3">&nbsp;</td>
                      ) : (
                        <td colSpan="4">&nbsp;</td>
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
