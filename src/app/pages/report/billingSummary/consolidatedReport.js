import React, { useEffect, useState } from "react";
import API, { CAPBackendAPI } from "../../../config/chfBackendApi";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
import { formatAsMoney } from "../../../utils/money.utils";
import { timestampToRegularTime } from "../../../utils/date.util";
import HistoryHeader from "../../patient/TableTop";
import { Spinner } from "react-bootstrap";
import logostyles from "../../coestaff/coestaff.module.scss";
import logo from "../../../../assets/images/logo.png";
import PageTitle from "../infographics/pageTitle";
import { Link } from "react-router-dom";
import Title from "../../../components/utilities/title/title";
import TransactionsTable from "../../../components/transactionsTable/transactionsTable";
import TransactionDetailModal from "../../../components/transaction-detail-modal/transaction-detail-modal";
import { consolidatedTransactionTotal } from "../../../utils/db.utils";
import Modal from "../../../components/modal/modal";
import ModalHeader from "../../../components/modal/modalHeader";
import ModalFooter from "../../../components/modal/modalFooter";
import ModalBody from "../../../components/modal/modalBody";
import Button from '../../../components/form/button'
import { useDispatch } from "react-redux";
import { propagateAlert } from "../../../redux/alertActions";

const initial_state = {
  billing_summary: [],
  startDate: "",
  endDate: "",
  dataLoading: false,
  coes: [],
  selectedCOE: "",
  selectedCategory: '',
  consolidatedData: [],
  showInitiateModal: false,
  showApprovalModal: false,
  showRecommendationModal: false,
  showPermsecApprovalModal: false,
  showDFAApprovalModal: false,
  activeTransaction: null,
  isApprovingPayment: false,
  isRecommendingPayment: false,
  isInitiatingPayment: false,
  actionableTransaction: null, //Transaction to initiate,recommend or approve
};

function ConsolidatedReport() {
  const dispatch = useDispatch()
  const [state, setState] = useState(initial_state);
  //   let coeTotal = 0;
  //   let emgeTotal = 0;
  let total = 0;

  const loadCoes = async () => {
    try {
      const res = await Promise.all([
        API.get('/api/coes'),
        CAPBackendAPI.get('/api/v1.0/products.php'),
      ]);
      setStateValue('drugs', res[1].data)
      return setStateValue('coes', res[0].data.data);
    } catch (error) {

    }
  }

  const loadSummary = async () => {
    try {
      setStateValue("dataLoading", true);
      const transactionUrl =
        state.selectedCOE === "all"
          ? `/api/report/billing/summary/billings?start_date=${state.startDate}&end_date=${state.endDate}`
          : `/api/report/billing/summary/billings?start_date=${state.startDate}&end_date=${state.endDate}&coe=${state.selectedCOE}`;

      const consolidated_data_url = `/api/report/transactions/consolidated?start_date=${state.startDate}&end_date=${state.endDate}`;

      const res = await Promise.all([
        API.get(transactionUrl),
        API.get(`/api/coes`),
        API.get(consolidated_data_url),
      ]);


      setState((prevState) => ({
        ...prevState,
        billing_summary: res[0].data.data,
        coes: res[1].data.data,
        dataLoading: false,
        consolidatedData: res[2].data.data,
        showInitiateModal: false,
        showRecommendationModal: false,
        showApprovalModal: false,
        showDFAApprovalModal: false,
        showPermsecApprovalModal: false,
      }));
    } catch (e) {
      // console.log(e);
    } finally {
      setStateValue("dataLoading", false);
    }
  };

  const setStateValue = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (state.startDate && state.endDate) {
      return loadSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startDate, state.endDate, state.selectedCOE]);

  /* THIS GUY RUNS JUST ONCE TO LOAD COE DATA */
  useEffect(() => {
    loadCoes();
  }, [])

  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };
  const printReport = () => {
    window.print();
  };

  const handleShowInitiateModal = (transaction, modal = 'showInitiateModal') => {
    return setState(prevState => ({
      ...prevState,
      actionableTransaction: transaction,
      [modal]: true,
    }))
  }

  const handlePayment = async (url, success_message, flag) => {

    setStateValue(flag, true)

    try {
      const res = await API.post(url, {
        coe_id: state.actionableTransaction.coe.id,
        start_date: state.actionableTransaction.created_at,
        end_date: state.actionableTransaction.created_at,
        transactions: [state.actionableTransaction],
        initiated_on: state.actionableTransaction.payment_initiated_on,
      });

      dispatch(propagateAlert({
        variant: 'success',
        alert: success_message,
      }))

      loadSummary();
    } catch (error) {
      // console.log(error.response)
    } finally {
      setStateValue(flag, false)

    }
  }


  const handleInitiatePayment = async () => {

    try {
      const res = await API.post('/api/fanda/payment/initiate', {
        coe_id: state.actionableTransaction.coe.id,
        start_date: state.actionableTransaction.created_at,
        end_date: state.actionableTransaction.created_at,
        transactions: [state.actionableTransaction],
      });

      dispatch(propagateAlert({
        variant: 'success',
        alert: 'Payment approval has been initated. ',
      }))

      loadSummary();
    } catch (error) {
      // console.log(error.response)
    } finally {

    }
  }

  const handleChangeCategory = async e => {
    const filter = e.target.value;
    await loadSummary();
    if (!filter) {
      return;
    }

    setState(prevState => ({
      ...prevState,
      [e.target.name]: filter,
      consolidatedData: prevState.consolidatedData.map(consolidation => ({
        ...consolidation,
        transactions: consolidation.transactions.filter(trx => trx.is_drug === parseInt(filter))
      }))
    }))
  }

  const handleCoeChange = e => {
    if (!state.consolidatedData.length) return
    return handleInputChange(e);
  }

  const handleDFAApproval = async () => {
    await handlePayment('/api/fanda/payment/dfa/approve', "Payment has been approved", 'isApprovingPayment');
  }

  const handlePermSecApproval = async () => {
    return await handlePayment('/api/fanda/payment/permsec/approve', "Payment has been approved.", 'isApprovingPayment');
  }

  const handleRecommendPayment = async () => {
    handlePayment('/api/fanda/payment/recommend', "Payment has been recommended for approval", 'isRecommendingPayment')
  }

  const handleApprovePayment = async () => {
    handlePayment('/api/fanda/payment/approve', "Payment has been approved for disbursement", 'isApprovingPayment')

  }

  const renderTransactions = () => {
    if (state.selectedCOE) {
      const selectedCOEData = state.consolidatedData.find(consolidation => consolidation.coe.id == state.selectedCOE);
      return <> <Title text={selectedCOEData.coe.coe_name} />
        <TransactionsTable
          onRowClick={idx => setStateValue('activeTransaction', selectedCOEData.transactions[idx])}
          transactions={selectedCOEData.transactions} />
      </>
    }

    return state.consolidatedData.length && state.consolidatedData.map((consolidation, index) => {

      return <div key={index}>
        <Title text={`${consolidation.coe.coe_name}`} />
        <TransactionsTable
          onInitiate={handleShowInitiateModal}
          onRecommend={transaction => handleShowInitiateModal(transaction, 'showRecommendationModal')}
          onApprove={transaction => handleShowInitiateModal(transaction, 'showApprovalModal')}
          onDFAApproval={transaction => handleShowInitiateModal(transaction, 'showDFAApprovalModal')}
          onPermsecApproval={transaction => handleShowInitiateModal(transaction, 'showPermsecApprovalModal')}
          onRowClick={idx => setStateValue('activeTransaction', state.consolidatedData[index].transactions[idx])}
          transactions={consolidation.transactions} />
      </div>

    }) || <></>
  }

  return (
    <>
      <div className={["container", chfstyles.application_wrapper].join(" ")}>
        <PageTitle
          title={`Sec. Approval Sub committee Consolidated Billing Summary Report`}
          titleClass={chfstyles.no_print}
        />
        <div className={chfstyles.application_table}>
          <HistoryHeader>
            <div className={`col-md-2 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">Select COE</label>
              <select
                className="custom"
                onChange={handleCoeChange}
                value={state.selectedCOE}
                name="selectedCOE"
              >
                <option value="">All</option>
                {state.coes.map((coe, index) => (
                  <option key={`${index}${coe.id}`} value={coe.id}>
                    {coe.coe_name}
                  </option>
                ))}
              </select>
            </div>
            <div className={`col-md-2 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">Category</label>
              <select
                className="custom"
                onChange={handleChangeCategory}
                value={state.selectedCategory}
                name="selectedCategory"
              >
                <option value="">All</option>
                <option value='0'>CHF Services</option>
                <option value='1'>Drugs</option>
              </select>
            </div>
            <div className={`col-md-2 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">Start Date</label>
              <input
                type="date"
                onChange={handleInputChange}
                value={state.startDate}
                name="startDate"
              />
            </div>

            <div className={`col-md-2 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">End Date</label>
              <input
                type="date"
                name="endDate"
                onChange={handleInputChange}
                value={state.endDate}
              />
            </div>
            <div className={`col-md-2 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">&nbsp;</label>
              <input
                type="button"
                className="btn btn-light"
                value="Print Report"
                onClick={printReport}
              />
            </div>
          </HistoryHeader>
          <div className={logostyles.invoice_container}>
            <div className={`my-2 ${chfstyles.no_print}`}>
              <small>Click on a row to view details of billings</small>
            </div>
            <div className={`row ${logostyles.invoice_header}`}>
              <img src={logo} alt="" />
              <div>
                <span>Billing Summary Report</span>
                <span>From: {state.startDate}</span>
                <span>To: {state.endDate}</span>
              </div>
            </div>

            {
              renderTransactions()
            }

            <TransactionDetailModal
              show={state.activeTransaction}
              drugs={state.drugs}
              transaction={state.activeTransaction}
              handleCloseModal={() => setStateValue('activeTransaction', null)} />
          </div>
        </div>
      </div>

      {state.showInitiateModal && <Modal>
        <ModalHeader
          onModalClose={() => setStateValue('showInitiateModal', false)}
          modalTitle="Initiate Payment" />
        <ModalBody>
          <p>You are about to initiate payment for this transaction </p>
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

      {state.showRecommendationModal && <Modal>
        <ModalHeader
          onModalClose={() => setStateValue('showRecommendationModal', false)}
          modalTitle="Recommend Payment" />
        <ModalBody>
          <p>You are about to recommend this payment to the DFA for approval </p>
          <p>Continue?</p>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleRecommendPayment}
            text={state.isRecommendingPayment ? "Please wait..." : 'Confirm'}
            disabled={state.isRecommendingPayment}
            variant='success' />
        </ModalFooter>
      </Modal>}

      {state.showApprovalModal && <Modal>
        <ModalHeader
          onModalClose={() => setStateValue('showApprovalModal', false)}
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

      {state.showDFAApprovalModal && <Modal>
        <ModalHeader
          onModalClose={() => setStateValue('showDFAApprovalModal', false)}
          modalTitle="Approve Payment" />
        <ModalBody>
          <p>You are about to approve this payment for disbursement. A notificaton will be sent to the Perm. Sec. for final approval </p>
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

export default ConsolidatedReport;
