import PageTitle from "../../../components/pageTitle/pageTitle";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
import THead from "../../../components/table/thead/thead";
import { useEffect, useState } from "react";
import API from "../../../config/chfBackendApi";
import { connect } from "react-redux";
import { timestampToRegularTime } from "../../../utils/date.util";
import Modal from "../../../components/modal/modal";
import ModalHeader from "../../../components/modal/modalHeader";
import ModalBody from "../../../components/modal/modalBody";
import { formatAsMoney } from "../../../utils/money.utils";
import TablePagination from "../../../components/tablePagination";
import { Spinner } from "react-bootstrap";
import TableTop from "../../patient/TableTop";
import axios from "axios";
import { getAuthStorageUser } from "../../../utils/storage.util";
import { transactionTotal } from "../../../utils/db.utils";
import DrugService from "../../../services/drug.service";
import { errorAlert } from "../../../utils/alert.util";
import { Button } from "../../../components";
import { errorHandler } from "../../../utils/error.utils";
import MUIDataTable from 'mui-datatables';
import { UserService } from "../../../services";
import { AiFillEye } from "react-icons/ai";

const initial_state = {
  transactions: [],
  activeTransaction: null,
  isTransactionsLoading: true,
  startDate: "",
  endDate: "",
  pagination: {
    currentPage: 1,
    totalPages: 1,
    links: null,
    perPage: 1000,
  },
  drugs: [],
  userProfile: null, //Logged In User. Consider getting loggin in used more efficiently
};

const COEStaffBillingHistory = (props) => {
  // console.log('proops', props)
  const columns = [
    {
      name: "#",
      options: {filter: false}
    },
    {
      name: "Transaction ID",
      options: {filter: false}
    },
    {
      name: "Date of Visit",
      options: {filter: false}
    },
    {
      name: "Service Count",
      options: {filter: false}
    },
    {
      name: "Total Cost",
      options: {filter: false}
    },
    {
      name: "",
      options: {filter: false, sort: false}
    },
    
  ];

  const [state, setState] = useState(initial_state);
  const [isLoading, setIsLoading] = useState(false)

  const loadTransactions = async () => {
    if (!state.startDate || !state.endDate) {
      return errorAlert("You must select start date and end date")
    }
    setIsLoading(true)
    const url = `/api/coestaff/${state.userProfile?.id}/transactions?per_page=${state.pagination.perPage}&start_date=${state.startDate}&end_date=${state.endDate}`;

    try {
      const res = await API.get(url);
      const { current_page, data, last_page, links } = res.data.data;

      setState((prevState) => ({
        ...prevState,
        transactions: data,
        activeTransaction: data[0],
        pagination: {
          ...prevState.pagination,
          currentPage: current_page,
          totalPages: last_page,
          links,
        },
      }));
    } catch (e) {
      errorHandler(e)
    } finally {
      setIsLoading(false)
    }
  };

  const getDrugs = async () => {
    try {
      const res = await DrugService.getAllCAPProduct();
      
      setState((prev) => ({
        ...prev,
        drugs: res.data?.data ?? [],
      }));
    } catch (e) {
      console.log(e);
    }
  };

  let pageLoading = true;
  useEffect(async () => {
    getDrugs();
    const userRequest = await UserService.getProfile()
    setState(prevState => ({
      ...prevState,
      userProfile: userRequest.data.data.user,
    }))
    // loadTransactions();
    // if (state.startDate && state.endDate) {
    //   loadTransactions();
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pageLoading = false;
  }, [pageLoading]);

  const renderTableData = () => {
    return state.transactions.map((transaction, index) => (
      <tr onClick={() => handleTransactionClick(transaction.id)} key={index}>
        <td>{index + 1}</td>
        <td>{transaction.transaction_id}</td>
        <td>{timestampToRegularTime(transaction.created_at)}</td>
        <td>{transaction.transactions.length}</td>
        <td><del>N</del>{formatAsMoney(transactionTotal(transaction.transactions))}</td>
        <td>
          {transaction.biller.first_name} {transaction.biller.last_name}
        </td>
        <td>
          <button className="btn btn-sm btn-success">Detail</button>
        </td>
      </tr>
    ));
  };

  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCloseModal = () => {
    setState((prevState) => ({
      ...prevState,
      transactionsModalOpen: false,
    }));
  };

  const handleTransactionClick = (id) => {
    const clickedTransaction = state.transactions.filter(
      (transaction) => transaction.id === id
    )[0];
    
    setState((prevState) => ({
      ...prevState,
      activeTransaction: {
        ...clickedTransaction,
        totalCost: transactionTotal(clickedTransaction.transactions),
      },
      transactionsModalOpen: true,
    }));
  };

  /* The actual price of a service should be the COE price */
  const renderTransactionServices = () => {
    return state.activeTransaction.transactions.map((transaction, index) => {
      return (
        <tr key={transaction.id}>
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
        <tr key={transaction.id}>
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

  const handlePageChange = (page) => {
    setState((prevState) => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        currentPage: page,
      },
    }));

    loadTransactions();
  };

  const handlePerPageChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        perPage: e.target.value,
      },
    }));
    loadTransactions();
  };

  return (
    <>
      <div className="container">
        <PageTitle title="Billing History" />
        <div className={chfstyles.application_wrapper}>
          <div className={chfstyles.application_table}>
            <TableTop>
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
                  text='Pull records'
                  onClick={loadTransactions}
                  variant="success"
                  loading={isLoading}
                />
              </div>
            </TableTop>
            <MUIDataTable 
              columns={columns}
              title={isLoading ? <Spinner variant="success" animation="border" /> : null}
              options={{
                elevation: 0,
                selectableRows: 'none',
                filter: false,
              }}
              data={state.transactions.map((transaction, index) => [
                index + 1, 
                transaction.transaction_id,
                timestampToRegularTime(transaction.created_at),
                // transaction.patient_id,
                transaction.transactions?.length,
                formatAsMoney(transactionTotal(transaction.transactions)),
                <div className="btn btn-success btn-sm" onClick={() => handleTransactionClick(transaction.id)}>
                  Detail 
                  <AiFillEye size={14} className='ml-2'  />
                </div>
              ])}
            />
          </div>
        </div>
      </div>

      {state.transactionsModalOpen && (
        <Modal fullscreen={true}>
          <ModalHeader
            modalTitle={"Transaction Detail"}
            onModalClose={handleCloseModal}
          ></ModalHeader>
          <ModalBody>
            <div className={["row", chfstyles.billing_details].join(" ")}>
              <div className="col-md-6">
                <h5 className="text-success">
                  <strong>Transaction Reference</strong>
                </h5>
                <span >{state.activeTransaction.transaction_id}</span>
              </div>
              <div className="col-md-6">
                <h5 className="text-success">
                  <strong>COE VISITED</strong>
                </h5>
                <span>{state.activeTransaction.coe.coe_name}</span>
              </div>
              <div className="col-md-12">&nbsp;</div>
              <div className="col-md-6">
                <h6>
                  <i className="fas fa-user text-success"></i> Patient:{" "}
                </h6>
                <small>
                  {state.activeTransaction.user.patient.chf_id}
                </small>
              </div>
              <div className="col-md-6">
                <h6>
                  <i className="fas fa-calendar text-success"></i> Date Visited:{" "}
                </h6>
                <small>
                  {timestampToRegularTime(state.activeTransaction.created_at)}
                </small>
              </div>
              <div className="col-sm-12">
                <br />
                <h6
                  className={[chfstyles.underlined, "text-success"].join(" ")}
                >
                  Services Rendered
                </h6>
                <table className="table table-responsive-sm">
                  <thead>
                    {state.activeTransaction &&
                    !state.activeTransaction.is_drug ? (
                      <tr className="bg-success">
                        <th>#</th>
                        <th>Service Name</th>
                        <th>Service Category</th>
                        <th>Service Unit Cost</th>
                        <th>Quantity</th>
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
              <div className="col-sm-12 mb-2">
                <h6>Documents</h6>
                {state.activeTransaction.documents.length ? (
                  state.activeTransaction.documents.map((document, index) => (
                    <a
                      key={index}
                      className="mr-2 text-muted text-10"
                      target="_blank"
                      rel="noreferrer"
                      href={document.document_url}
                    >
                      {index + 1} - {document.document_name}
                    </a>
                  ))
                ) : (
                  <p className="text-muted">No attached document</p>
                )}
              </div>

              <div className="col-sm-12 ">
                <h6>Physician Comment:</h6>
                {(state.activeTransaction.comment && (
                  <p> {state.activeTransaction.comment.comment}</p>
                )) || <p className="text-muted">No Comment available</p>}
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    user: getAuthStorageUser(),
  };
};
export default connect(mapStateToProps)(COEStaffBillingHistory);
