import React, { useEffect, useState } from "react";
import API, { CAPBackendAPI } from "../../../config/chfBackendApi";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
import { formatAsMoney } from "../../../utils/money.utils";
import HistoryHeader from "../../patient/TableTop";
import { Spinner } from "react-bootstrap";
import logostyles from "../../coestaff/coestaff.module.scss";
import logo from "../../../../assets/images/logo.png";
import TableRow from "../../../components/table/tableRow/tableRow";
import TableData from "../../../components/table/tableData/tableData";
import { consolidatedTransactionTotal } from "../../../utils/db.utils";
import { useDispatch } from "react-redux";
import { propagateAlert } from "../../../redux/alertActions";
import {Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, PageTitle} from '../../../components';
import DrugService from "../../../services/drug.service";
import { errorAlert } from "../../../utils/alert.util";
import MUIDataTable from 'mui-datatables';
import { FANDA_TRANSACTION_TABLE_COLUMNS } from "../../../utils/table-constants/transaction-table.constant";
import TransactionService from "../../../services/transaction.service";
import { errorHandler } from "../../../utils/error.utils";
import { timestampToRegularTime } from "../../../utils/date.util";
import { AiFillCheckCircle, AiOutlineCheckCircle, AiOutlineHeatMap } from "react-icons/ai";
import UserService from "../../../services/user.service";
import { APPROVE_PAYMENT, DFA_APPROVAL, INITIATE_PAYMENT, PERMSEC_APPROVAL, RECOMMEND_PAYMENT } from "../../../utils/permissions.constant";
import { APPROVED, DFA_RECOMMENDED, INITIATED, RECOMMENDED } from "../../../utils/constant.util";

const initial_state = {
  billing_summary: [],
  startDate: "",
  endDate: "",
  category: '',
  dataLoading: false,
  transactions: [],
  consolidatedData: [],
  showPaymentModal: false,
  showWarningModal: false,
  warningMessage: '',
  paymentHospital: null,
  paymentAmount: 0,
  isInitiatingPayment: false,
  drugs:[],
  authUser: null,
};

function BillingSummaryReport() {

  const dispatch = useDispatch();

  const [state, setState] = useState(initial_state);
  const loadSummary = async () => {
    if (!state.startDate || !state.endDate) {
      return errorAlert("You must select a start and end date")
    }
    try {
      setStateValue("dataLoading", true);

      const consolidated_data_url = `/api/report/transactions/consolidated?start_date=${state.startDate}&end_date=${state.endDate}`;
      const transactionsRequest = await TransactionService.getAllTransactions(`startDate=${state.startDate}&endDate=${state.endDate}`)
      const res = await API.get(consolidated_data_url)
      setState((prevState) => ({
        ...prevState,
        showPaymentModal: false,
        consolidatedData: res.data.data,
        transactions: transactionsRequest.data.data,
      }));
    } catch (e) {
      console.log(e)
      errorHandler(e)
    }finally{
      setStateValue('dataLoading',false)
    }
  };

  const setStateValue = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  useEffect(async () => {

    const drugsRequest = await DrugService.getAllCAPProduct();
    const profileRequest = await UserService.getProfile()
    console.log(profileRequest.data?.data)
    setStateValue('authUser', profileRequest.data?.data);
    return setStateValue('drugs',drugsRequest.data?.data ?? []);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  const handleChangeCategory = async e => {
    const filter = e.target.value;
    await loadSummary()
    if (!filter) {
      return;
    }
    return setState(prevState => ({
      ...prevState,
      category: filter,
      consolidatedData: prevState.consolidatedData.map(consolidation => ({
        ...consolidation,
        transactions: consolidation.transactions.filter(trx => trx.is_drug === parseInt(filter))
      }))
    }))
  }

  const calculateTotalPayable = () => {
    let total = 0;
    
    if(!state.consolidatedData.length){
      return total;
    }

    for(let consolidation of state.consolidatedData){
      total += consolidatedTransactionTotal(consolidation.transactions).total;
    }

    return total;
  }

  const handleShowWarningModal = (warningMessage) => {
    return setState(prevState => ({
      ...prevState,
      warningMessage,
      showWarningModal: true
    }));
  }

  const showPaymentButton = (consolidation,consolidation_total, coe) => {
    if (!consolidation_total.total) {
      return <>N/A</>
    }

    if(consolidation_total.has_split && consolidation_total.has_unsplit){
      return <Button
      onClick={() => handleShowWarningModal("The selected range contain transactions that have been paid or being processed. You may need to select a different Range for payment")} 
      variant='danger'> <Icon icon='fa fa-exclamation-circle' /> </Button> 
    }

    if (consolidation_total.has_split) {
      <p className='text-success'>Paid</p>
    }

    /* START WITH REVERSE APPROVAL CHAIN */
    if (consolidation.transactions[0].payment_approved_by) {
      return <Icon icon='fa fa-check' />
    }

    // if (consolidation.transactions[0].payment_recommended_by) {
    //   return <Button
    //     text={state.isApprovingPayment ? "Please wait..." : 'Approve'}
    //     variant='success'
    //     disabled={state.isApprovingPayment} 
    //     onClick={() => null} />
    //   }
      
    //   if (consolidation.transactions[0].payment_initiated_by) {
    //   return <Button
    //     text={state.isApprovingPayment ? "Please wait..." : 'Recommend'}
    //     variant='success'
    //     disabled={state.isRecommendingPayment} 
    //     onClick={() => null} />
    // }
      
      if (consolidation.transactions[0].payment_initiated_by) {
      return <p>{consolidation.transactions[0].status}</p>
    }

    return <Button 
        onClick={() => handleShowPaymentModal(coe, consolidation_total.total)}
        variant='success'> Initiate Payment <Icon icon='fa fa-check' /> </Button>

  }

  const handleShowPaymentModal = (paymentHospital = '', paymentAmount = 0) => {
    return setState(prevState => ({
      ...prevState,
      paymentHospital,
      paymentAmount,
      showPaymentModal: true,
    }))
  }

  /* INITATE PAYMENT TO COE */
  const handleInitiatePayment = async () => {
    setStateValue('isInitiatingPayment', true)
    try {
      const res = await API.post('/api/fanda/payment/initiate',{
        coe_id: state.paymentHospital.id,
        start_date: state.startDate,
        end_date: state.endDate,
        transactions: state.consolidatedData.find(consolidation => consolidation.coe.id === state.paymentHospital.id).transactions,
      });

      dispatch(propagateAlert({
        variant: 'success',
        alert: 'Payment approval has been initated. ',
      }))

      loadSummary();
      
    } catch (error) {
      console.log(error.response)
    }finally{
      setStateValue('isInitiatingPayment', false)      
    }
  }


  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const renderCustomToolbarSelect = () => {
    
    return (
    UserService.isAuthorized(state.authUser?.permissions,INITIATE_PAYMENT) && <AiFillCheckCircle size={30} className='text-success' style={{cursor: 'pointer'}} />) 
    ||
    (UserService.isAuthorized(state.authUser?.permissions,INITIATE_PAYMENT) && <AiFillCheckCircle size={30} className='text-success' style={{cursor: 'pointer'}} />) 
    ||
    (UserService.isAuthorized(state.authUser?.permissions,INITIATE_PAYMENT) && <AiFillCheckCircle size={30} className='text-success' style={{cursor: 'pointer'}} />) 
    ||
    (UserService.isAuthorized(state.authUser?.permissions,INITIATE_PAYMENT) && <AiFillCheckCircle size={30} className='text-success' style={{cursor: 'pointer'}} />) 
    ||
    (UserService.isAuthorized(state.authUser?.permissions,INITIATE_PAYMENT) && <AiFillCheckCircle size={30} className='text-success' style={{cursor: 'pointer'}} />) 
  }

  const isRowSelectable = (index) => {
      const transaction = state.transactions[index];
      return !transaction.is_disputed && (
      (
        !transaction.status && UserService.isAuthorized(state.authUser?.permissions ?? [], INITIATE_PAYMENT) 
      )
        ||
      (
       transaction.status === INITIATED && UserService.isAuthorized(state.authUser?.permissions ?? [], RECOMMEND_PAYMENT) 
      )
        ||
      (
       transaction.status === RECOMMENDED && UserService.isAuthorized(state.authUser?.permissions ?? [], APPROVE_PAYMENT) 
      )
        ||
      (
       transaction.status === APPROVED && UserService.isAuthorized(state.authUser?.permissions ?? [], DFA_APPROVAL) 
      )
        ||
      (
       transaction.status === DFA_RECOMMENDED && UserService.isAuthorized(state.authUser?.permissions ?? [], PERMSEC_APPROVAL) 
      )
      )
  }


  return (
    <>
      <div className={["container", chfstyles.application_wrapper].join(" ")}>
        <PageTitle
          title={`Finance and Accounting Billing Summary Report`}
          titleClass={chfstyles.no_print}
        />
        <div className={chfstyles.application_table}>
          <HistoryHeader>
            {/* <div className={`col-md-1 mt-2 ${chfstyles.no_print}`}></div> */}


            <div className={`col-md-3 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">Start Date</label>
              <input
                type="date"
                onChange={handleInputChange}
                value={state.startDate}
                name="startDate"
              />
            </div>

            <div className={`col-md-3 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">End Date</label>
              <input
                type="date"
                name="endDate"
                onChange={handleInputChange}
                value={state.endDate}
              />
            </div>
              <div className={`col-md-3 mt-2 ${chfstyles.no_print}`}>
                <label className="text-secondary">Category</label>
                <select
                  onChange={handleChangeCategory}
                  value={state.category}
                  name="category"
                >
                  <option>All</option>
                  <option value='0'>CHF Services</option>
                  <option value='1'>Drug</option>
                </select>
            </div>
            {/* <div className="col-md-3">&nbsp;</div> */}
            <div className={`col-md-3 ${chfstyles.no_print}`}>
              <label className="text-secondary">&nbsp;</label>
              <Button
                type="button"
                className="btn btn-success btn-block py-2"
                text="Pull record"
                loading={state.dataLoading}
                onClick={loadSummary}
              />
            </div>
          </HistoryHeader>
          <div className={logostyles.invoice_container}>
          <div className={`my-2 ${chfstyles.no_print}`}>
            {/* <small>Click on a row to view details of billings</small> */}
          </div>
            <div className={`row ${logostyles.invoice_header}`}>
              <img src={logo} alt="" />
              <div>
                <span>Billing Summary Report</span>
                <span>From: {state.startDate}</span>
                <span>To: {state.endDate}</span>
              </div>
            </div>

            <MUIDataTable 
              columns={FANDA_TRANSACTION_TABLE_COLUMNS}
              data={state.transactions.map((transaction, index) => [
                index +1,
                transaction.transaction_id,
                transaction.service.service_name,
                transaction.quantity,
                formatAsMoney(transaction.cost),
                transaction.coe?.coe_name,
                timestampToRegularTime(transaction.created_at),
                transaction.status,
                !transaction.is_disputed && <Button className='btn btn-sm btn-danger' >
                  <AiOutlineHeatMap/>Dispute 
                </Button>
              ])}
              options={{
                elevation: 0,
                fixedHeader: 'fixed',
                isRowSelectable: isRowSelectable,
                customToolbarSelect: renderCustomToolbarSelect,
                setRowProps: (row, index) => {
                  return {
                    style: {
                      backgroundColor: state.transactions[index].is_disputed ? '#ff000033' : null,
                    }
                  }
                }
              }}
            />
            <div className="py-2 bg-success">&nbsp;</div>

            <MUIDataTable
              columns={["SN","Hospital","Total service"]}
              options={{
                elevation: 0,    
                filter: false, 
                sort: false,
                viewColumns: false,
                selectableRows: 'none',
                search: false,
                pagination: false,
                download: false,
                print: false
              }}
              title={state.dataLoading ? <Spinner animation="border" variant="success" /> : `Total: NGN ${formatAsMoney(calculateTotalPayable())}`}
              data={state.consolidatedData.map((data, index) => {
                const consolidated_transaction_total = consolidatedTransactionTotal(data.transactions)
                return [
                  index + 1,
                  data.coe.coe_name,
                  formatAsMoney(consolidated_transaction_total.total ?? 0),
                ]

              })}
            />

            {/* <table
              className={[
                "table table-responsive-sm",
                chfstyles.application_table,
              ].join(" ")}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>COE Name</th>
                  <th>Total Service Cost</th>
                  <th className={`${chfstyles.no_print}`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(state.dataLoading && (
                  <tr>
                    <td>
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                )) ||
                  renderSummary()}
                <tr>
                  <th colSpan="2">Totals:</th>
                  <th>NGN {formatAsMoney(calculateTotalPayable())}</th>
                </tr>
              </tbody>
            </table> */}
          </div>
        </div>
      </div>
     {state.showPaymentModal && <Modal>
      <ModalHeader
        onModalClose={() => setStateValue('showPaymentModal', false)} 
        modalTitle="Payment" />
        <ModalBody>
          <p>You are about to intiate payment of <strong>NGN {formatAsMoney(state.paymentAmount)}</strong> to <strong> {state.paymentHospital.coe_name}</strong> </p>
          <p>Continue?</p>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleInitiatePayment} 
            text={state.isInitiatingPayment ? "Please wait..." : 'Confirm'}
            disabled={state.isInitiatingPayment} 
            variant='success' />
        </ModalFooter>
     </Modal>}

     {state.showWarningModal && <Modal>
      <ModalHeader 
        onModalClose={() => setStateValue('showWarningModal', false)}
        variant='danger' 
        modalTitle="Warning" />
        <ModalBody>
          <p>{state.warningMessage}</p>
        </ModalBody>
     </Modal>}
    </>
  );
}

export default BillingSummaryReport;
