import React, { useEffect, useState } from "react";
import API, { CAPBackendAPI } from "../../../config/chfBackendApi";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
import { formatAsMoney } from "../../../utils/money.utils";
import HistoryHeader from "../../patient/TableTop";
import { Spinner } from "react-bootstrap";
import logostyles from "../../coestaff/coestaff.module.scss";
import logo from "../../../../assets/images/logo.png";
import PageTitle from "../../report/infographics/pageTitle";
import {Link} from "react-router-dom";
import CHFTable from "../../../components/table/thead/table";
import TableRow from "../../../components/table/tableRow/tableRow";
import TableData from "../../../components/table/tableData/tableData";
import { consolidatedTransactionTotal, paymentTotal, transactionTotal } from "../../../utils/db.utils";
import Icon from "../../../components/icon/icon";
import Button from '../../../components/form/button';
import Modal from "../../../components/modal/modal";
import ModalBody from "../../../components/modal/modalBody";
import ModalHeader from "../../../components/modal/modalHeader";
import ModalFooter from "../../../components/modal/modalFooter";
import { useDispatch } from "react-redux";
import { propagateAlert } from "../../../redux/alertActions";
import THead from "../../../components/table/thead/thead";
import { timestampToRegularTime } from "../../../utils/date.util";
import Title from "../../../components/utilities/title/title";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import { AlertUtility } from "../../../utils";
import MUIDataTable from "mui-datatables";

const initial_state = {
  startDate: "",
  endDate: "",
  dataLoading: false,
  payments: [],
  showRecommendPaymentModal: false,
  showApprovePaymentModal: false,
  showWarningModal: false,
  showPaymentDetailModal: false,
  showPermsecApprovalModal: false,
  showDFAApprovalModal: false,
  activePayment: null,
  warningMessage: '',
  paymentHospital: null,
  paymentAmount: 0,
  isInitiatingPayment: false,
  isRecommendingPayment: false,
  isApprovingPayment: false,
  initiated_on: null,
  coe_id: null,
};

function FandAPayments() {

  const new_table_columns = [
    {name: "SN", options: {filter: false}},
    "Hospital",
    {name:"Payment Due", options: {filter: false}},
    "Status",
    {name: "Bank Account Name", options: {filter: false, sort: false}},
    {name: "Account Number",options: {filter: false, sort: false}},
    {name:"Bank Code",options: {filter: false, sort: false}},
    {name: "Bank Name", options: {filter: false, sort: false}},
    {name: "Action",options: {filter: false,sort: false}},
    {name:"", options: {sort: false, filter: false}}
  ]
  const table_columns = [
    {
      column_name: "#"
    },
    {
      column_name: "Hospital"
    },
    {
      column_name: "Payment due"
    },
    // {
    //   column_name: "From"
    // },
    // {
    //   column_name: "To"
    // },
    {
      column_name: "Status"
    },
    {
      column_name: "Bank Account Name"
    },
    {
      column_name: "Account Number"
    },
    {
      column_name: "Sort Code"
    },
    {
      column_name: "Bank Name"
    },
    {
      column_name: "Action"
    },
    {
      column_name: ""
    },
  ]

  const [state, setState] = useState(initial_state);
  
  const dispatch = useDispatch();

  const loadSummary = async () => {
    try {
      setStateValue("dataLoading", true);
      
      const res = await API.get(`/api/fanda/payment`)

      setState((prevState) => ({
          ...prevState,
          showApprovePaymentModal: false,
          showDFAApprovalModal: false,
          showPaymentDetailModal: false,
          showPermsecApprovalModal: false,
          showRecommendPaymentModal: false,
          showWarningModal: false,
          payments: res.data.data,
          dataLoading:false
        }));
    } catch (e) {
      
        setStateValue("dataLoading", false);        
    }finally{
    }
  };

  const setStateValue = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };
  
  useEffect(() => {
    loadSummary();
  },[])

  const calculateTotalPayable = () => {
    let total = 0;
    
    if(!state.consolidatedData.length){
      return total;
    }

    for(let consolidation of state.consolidatedData){
      total += transactionTotal(consolidation.transactions).total;
    }

    return total;
  }

  const handleApprovePayment = async () => {
    setStateValue('isApprovingPayment',true);
    try {
      const res = await API.post('/api/fanda/payment/approve',{
        coe_id: state.coe_id,
        initiated_on: state.initiated_on,
      });

      AlertUtility.successAlert('Payment has been approved for disbursement')

      setState(prevState => ({
        ...prevState,
        showApprovePaymentModal: false,
      }));
      loadSummary()
    } catch (error) {
      console.log(error.response)
    }finally{
      setStateValue('isApprovingPayment',false);
    }
  }

  const handleRecommendPayment = async () => {
    setStateValue('isApprovingPayment',true);
    try {
      const res = await API.post('/api/fanda/payment/recommend',{
        coe_id: state.coe_id,
        initiated_on: state.initiated_on,
      });

      AlertUtility.successAlert("Payment has been recommended for approval")
      
      setState(prevState => ({
        ...prevState,
        showRecommendPaymentModal: false,
      }))
      loadSummary()
    } catch (error) {
      console.log(error.response)
    }finally{
      setStateValue('isApprovingPayment',false);
    }
  }

  const handlePayment = async (url, success_message, flag) => {
    
    setStateValue(flag,true)
    setStateValue('isApprovingPayment',true)
    try {
      const res = await API.post(url,{
        coe_id: state.coe_id,
        start_date: state.startDate,
        end_date: state.endDate,
        initiated_on: state.initiated_on,
      });

      AlertUtility.successAlert(success_message)
      
      loadSummary();
    } catch (error) {
      console.log(error.response)
    }finally{
      setStateValue('isApprovingPayment',false)
      setStateValue(flag,false)

    }
  }


  const handleDFAApproval = async () => {
    await handlePayment('/api/fanda/payment/dfa/approve',"Payment has been disbursed", 'isApprovingPayment');
  }

  const handlePermSecApproval = async () => {
    return await handlePayment('/api/fanda/payment/permsec/approve',"Payment has been approved.",'isApprovingPayment');
  }

  
  const showRecommendModal = (initiated_on, coe_id, modal = 'showRecommendPaymentModal') => {
    return setState(prevState => ({
      ...prevState,
      initiated_on,
      coe_id,
      [modal]: true,
    }))
  }

  const handleShowWarningModal = (warningMessage) => {
    return setState(prevState => ({
      ...prevState,
      warningMessage,
      showWarningModal: true
    }));
  }

  const showPaymentButton = (payment,consolidation_total, coe) => {
    
    if (!consolidation_total.total) {
      return <>N/A</>
    }

    if(consolidation_total.has_split && consolidation_total.has_unsplit){
      return <Button
      onClick={() => handleShowWarningModal("The selected range contain transactions that have been paid. You may need to select a different Range for payment")} 
      variant='danger'> <Icon icon='fa fa-exclamation-circle' /> </Button> 
    }

    if (consolidation_total.has_split) {
      <p className='text-success'>Paid</p>
    }

    /* START WITH REVERSE APPROVAL CHAIN */
    if (payment.payment_transactions[0].dfa_approved_on) {
      return <Icon icon='fa fa-check text-success' />
    }

    if (payment.payment_transactions[0].permsec_approved_on) {
      return <AuthorizedOnlyComponent requiredPermission="DFA_APPROVAL">
          <Button
          text={state.isApprovingPayment ? "Please wait..." : 'Disburse'}
          variant='success'
          disabled={state.isApprovingPayment} 
          onClick={() => showRecommendModal(payment.payment_transactions[0].payment_initiated_on, coe.id,'showDFAApprovalModal')} />
      </AuthorizedOnlyComponent>
    }

    if (payment.payment_transactions[0].payment_approved_on) {
      return <AuthorizedOnlyComponent requiredPermission="PERMSEC_APPROVAL">
          <Button
          text={state.isApprovingPayment ? "Please wait..." : 'Approve (PS)'}
          variant='success'
          disabled={state.isApprovingPayment} 
          onClick={() => showRecommendModal(payment.payment_transactions[0].payment_initiated_on, coe.id,'showPermsecApprovalModal')} />
      </AuthorizedOnlyComponent>
    }

    if (payment.payment_transactions[0].payment_recommended_by) {
      return <AuthorizedOnlyComponent requiredPermission="APPROVE_PAYMENT">
          <Button
          text={state.isApprovingPayment ? "Please wait..." : 'Approve'}
          variant='success'
          disabled={state.isApprovingPayment} 
          onClick={() => showRecommendModal(payment.payment_transactions[0].payment_initiated_on, coe.id,'showApprovePaymentModal')} />
      </AuthorizedOnlyComponent>
      }
      
      if (payment.payment_transactions[0].payment_initiated_by) {
      return <AuthorizedOnlyComponent requiredPermission='RECOMMEND_PAYMENT'>
        <Button
        text={state.isApprovingPayment ? "Please wait..." : 'Recommend'}
        variant='success'
        disabled={state.isApprovingPayment} 
        onClick={() => showRecommendModal(payment.payment_transactions[0].payment_initiated_on, coe.id)} />
      </AuthorizedOnlyComponent>
    }

    return <AuthorizedOnlyComponent requiredPermission="INITIATE_PAYMENT">
      <Button 
        onClick={() => handleShowPaymentModal(coe, consolidation_total.total)}
        variant='success'> Initiate Payment <Icon icon='fa fa-check' /> </Button>
    </AuthorizedOnlyComponent>

  }

  const handleShowPaymentModal = (paymentHospital = '', paymentAmount = 0) => {
    return setState(prevState => ({
      ...prevState,
      paymentHospital,
      paymentAmount,
      showPaymentModal: true,
    }))
  }

  const handleShowPaymentDetail = payment => {
    
    return setState(prevState => ({
      ...prevState,
      activePayment: payment,
      showPaymentDetailModal: true,
    }))
  }

  /* INITATE PAYMENT TO COE */
  // const handleInitiatePayment = async () => {
  //   setStateValue('isInitiatingPayment', true)
  //   try {
  //     const res = await API.post('/api/fanda/payment/initiate',{
  //       coe_id: state.paymentHospital.id,
  //       start_date: state.startDate,
  //       end_date: state.endDate,
  //       transactions: state.consolidatedData.find(consolidation => consolidation.coe.id === state.paymentHospital.id).transactions,
  //     });
  //     loadSummary();
  //     console.log(res)
  //   } catch (error) {
  //     console.log(error.response)
  //   }finally{
  //     setStateValue('isInitiatingPayment', false)      
  //   }
  // }

  const renderSummary = () => {
    if (!state.payments.length) {
      return <tr>
      <td colSpan="7">
        No Payment initiated at this time
      </td>
    </tr>
    }
    return <MUIDataTable 
      columns={new_table_columns}
      data={
        state.payments.map((payment, index) => {
        const consolidated_transaction_total = paymentTotal(payment);
          
        return [
          index + 1,
          payment.coe.coe_name,
          `NGN ${formatAsMoney(consolidated_transaction_total.total)}`,
          payment.status,
          payment.coe.bank_account_name,
          payment.coe.bank_account_number,
          payment.coe.bank_sort_code,
          payment.coe.bank_name,
          showPaymentButton(payment, consolidated_transaction_total, payment.coe),
          <Button 
          variant='secondary'
          onClick={() => handleShowPaymentDetail(payment)} 
          text='Detail' />,

        ]})
        
      }

      options={
        {
          elevation: 0,
          selectableRows: false,
          
        }
      }
    />
    
  };
  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };


  const printReport = () => {
    window.print();
  };



  return (
    <>
      <div className={["container", chfstyles.application_wrapper].join(" ")}>
        <PageTitle
          title={`Finance and Accounting Payment Report`}
          titleClass={chfstyles.no_print}
        />
        <div className={chfstyles.application_table}>
          <HistoryHeader>
           
            {/* <div className={`col-md-3 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">&nbsp;</label>
              <input
                type="button"
                className="btn btn-light"
                value="Print Report"
                onClick={printReport}
              />
            </div> */}
          </HistoryHeader>
          <div className={logostyles.invoice_container}>
          <div className={`my-2 ${chfstyles.no_print}`}>
            {/* <small>Click on a row to view details of billings</small> */}
          </div>
            <div className={`row ${logostyles.invoice_header}`}>
              <img src={logo} alt="" />
              <div>
                <span>Billing Payment Report</span>
                {/* <span>From: {state.startDate}</span>
                <span>To: {state.endDate}</span> */}
              </div>
            </div>
            {/* <CHFTable>
              <THead columns={table_columns} />
              <tbody> */}

                {
                  state.dataLoading && <Spinner animation="border" variant="success" /> || renderSummary()
                }
                {/* </tbody>
            </CHFTable> */}
          </div>
        </div>
      </div>
     {state.showRecommendPaymentModal && <Modal>
      <ModalHeader
        onModalClose={() => setStateValue('showRecommendPaymentModal', false)} 
        modalTitle="Recommend Payment" />
        <ModalBody>
          <p>You are about to recommend this payment for approval </p>
          <p>Continue?</p>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleRecommendPayment} 
            text={state.isInitiatingPayment ? "Please wait..." : 'Confirm'}
            disabled={state.isInitiatingPayment} 
            variant='success' />
        </ModalFooter>
     </Modal>}

     {state.showApprovePaymentModal && <Modal>
      <ModalHeader
        onModalClose={() => setStateValue('showApprovePaymentModal', false)} 
        modalTitle="Approve Payment" />
        <ModalBody>
          <p>You are about to approve this payment for disbursement </p>
          <p>Continue?</p>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleApprovePayment} 
            text={state.isApprovingPayment ? "Please wait..." : 'Confirm'}
            disabled={state.isApprovingPayment} 
            variant='success' />
        </ModalFooter>
     </Modal>}

     {state.showPaymentDetailModal && <Modal>
      <ModalHeader 
        onModalClose={() => setStateValue('showPaymentDetailModal', false)}
        // variant='danger' 
        modalTitle="Payment Detail" />
        <ModalBody>
          <p className='text-success'><strong>Payment Details:</strong></p>
          <hr />
          <small className='text-muted'>Payment Initiated By:</small>
          {/* <p>Payment Initiated By:</p> */}
          <p>{state.activePayment.initiated_by ? `${state.activePayment.initiated_by.first_name} ${state.activePayment.initiated_by.last_name} - ${timestampToRegularTime(state.activePayment.payment_initiated_on)}`  : 'N/A'}</p>
          <small className='text-muted'>Payment Recommended By:</small>
          <p>{state.activePayment.recommended_by ? `${state.activePayment.recommended_by.first_name} ${state.activePayment.recommended_by.last_name} - ${timestampToRegularTime(state.activePayment.payment_recommended_on)}`  : 'N/A'}</p>
          {/* <p>Payment Approved By:</p> */}
          <small className='text-muted'>Payment Approved By:</small>
          <p>{state.activePayment.approved_by ? `${state.activePayment.approved_by.first_name} ${state.activePayment.approved_by.last_name} - ${timestampToRegularTime(state.activePayment.payment_approved_on)}`  : 'N/A'}</p>
        </ModalBody>
     </Modal>}


     {state.showDFAApprovalModal && <Modal>
      <ModalHeader
        onModalClose={() => setStateValue('showDFAApprovalModal', false)} 
        modalTitle="Approve Payment" />
        <ModalBody>
          <p>You are about to mark this payment as disbursed. A notificaton will be sent to the Permanent Secretary. </p>
          <p>Continue?</p>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleDFAApproval} 
            text={state.isApprovingPayment ? "Please wait..." : 'Confirm'}
            disabled={state.isApprovingPayment} 
            variant='success' />
        </ModalFooter>
     </Modal>}

      {state.showPermsecApprovalModal && <Modal>
      <ModalHeader
        onModalClose={() => setStateValue('showPermsecApprovalModal', false)} 
        modalTitle="Approve Payment" />
        <ModalBody>
          <p>You are about to approve this payment for disbursement. </p>
          <p>Continue?</p>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handlePermSecApproval} 
            text={state.isApprovingPayment ? "Please wait..." : 'Confirm'}
            disabled={state.isApprovingPayment} 
            variant='success' />
        </ModalFooter>
     </Modal>}
    </>
  );
}

export default FandAPayments;
