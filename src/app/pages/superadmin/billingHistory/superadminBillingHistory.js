import React, { useEffect, useState } from "react";
import API, { CAPBackendAPI } from "../../../config/chfBackendApi";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
import styles from "../../patient/billingHistory.module.scss";
import { timestampToRegularTime, todayDate } from "../../../utils/date.util";
import { formatAsMoney } from "../../../utils/money.utils";
import HistoryHeader from "../../patient/TableTop";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import { transactionTotal } from "../../../utils/db.utils";
import PageTitle from "../../report/infographics/pageTitle";
import TablePagination from "../../../components/tablePagination";
import { useParams, useLocation } from "react-router";
import { parseQueryParams } from "../../../utils/route.utils";
import TransactionsTable from "../../../components/transactionsTable/transactionsTable";
import TransactionDetailModal from "../../../components/transaction-detail-modal/transaction-detail-modal";
import { CircularProgress } from "@material-ui/core";

const initial_state = {
  transactions: [],
  activeTransaction: null,
  currentCoeDetails: null,
  startDate: "",
  endDate: "",
  isDrug: false,
  dataLoading: true,
  pagination: {
    per_page: 10000,
    links: null,
    currentPage: 1,
    totalPages: 1,
  },
  drugs: [],
};

function SuperAdminBillingHistory() {
  const [state, setState] = useState(initial_state);
  const coe_id = useParams().coe_id;
  let location = useLocation();
  const queryParams = parseQueryParams(location.search);

  const loadTransactions = async () => {
    try {
      setStateValue("dataLoading", true);
      const res = await Promise.all([
        API.get(
          `/api/coes/${coe_id}/billings?per_page=${state.pagination.per_page}&page=${state.pagination.page}&start_date=${state.startDate}&end_date=${state.endDate}&is_drug=${state.isDrug}`
        ),
        API.get(`/api/coes/${coe_id}`),
        // API.get(`/api/coes/${coe_id}/billings/consolidated?per_page=${state.pagination.per_page}&page=${state.pagination.page}&start_date=${state.startDate}&end_date=${state.endDate}`)
      ]);
      setState((prevState) => ({
        ...prevState,
        transactions: res[0].data.data.data,
        currentCoeDetails: res[1].data.data,
        pagination: {
          ...prevState.pagination,
          links: res[0].data.data.links,
          currentPage: res[0].data.data.current_page,
          totalPages: res[0].data.data.last_page,
        },
        dataLoading: false,
      }));
    } catch (e) {
      console.log(e)
    } finally {
      setStateValue("dataLoading", false);
    }
  };

  const getDrugs = async () => {
    try {
      const res = await CAPBackendAPI.get('/product');
      setState((prev) => ({
        ...prev,
        drugs: res.data.data,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const getDrug = (drug_id) => {
    return state.drugs.filter((drug) => drug.productId === drug_id)[0];
  };

  const renderTransactionDrugs = () => {
    return state.activeTransaction.transactions.map((transaction, index) => {
      const drug = getDrug(transaction.drug_id);
      return (
        <tr key={index}>
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

  useEffect(() => {
    getDrugs();

    if (queryParams)
      setState(prevState => ({
        ...prevState,
        startDate: queryParams.start_date ? queryParams.start_date : todayDate(),
        endDate: queryParams.end_date ? queryParams.end_date : todayDate(),
        isDrug: queryParams.is_drug ? queryParams.is_drug : ""
      }));
    if (state.startDate && state.endDate) {
      return loadTransactions();
    }
  }, [state.startDate, state.endDate]);

  useEffect(() => {
    loadTransactions();
  }, [])

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
              <td>
                <del>N</del>
                {formatAsMoney(transactionTotal(transaction.transactions))}
              </td>
              <td>
                {transaction.biller.first_name} {transaction.biller.last_name}
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

  const renderTransactionServices = () => {
    return state.activeTransaction.transactions.map((transaction, index) => {
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{transaction.service.service_name}</td>
          <td>{transaction.service.category.category_name}</td>
          <td>NGN {formatAsMoney(transaction.service.coes[0].pivot.price)}</td>
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

  const handlePageChange = (page) => {
    setState((prevState) => ({
      ...prevState,
      dataLoading: true,
      pagination: {
        ...prevState.pagination,
        page,
      },
    }));
    loadTransactions();
  };

  const handlePerPageChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      dataLoading: true,
      pagination: {
        ...prevState.pagination,
        per_page: e.target.value,
      },
    }));

    loadTransactions();
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
            {state.dataLoading && <CircularProgress color="primary" />}
          </HistoryHeader>
          <TransactionsTable

            onRowClick={index => handleTransactionClick(index)}
            transactions={state.transactions} />
        </div>
      </div>

      {state.transactions && <TransactionDetailModal
        show={state.activeTransaction}
        handleCloseModal={handleCloseModal}
        transaction={state.activeTransaction}
        drugs={state.drugs} />}
    </>
  );
}

export default SuperAdminBillingHistory;
