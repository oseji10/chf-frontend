import { Col, Row } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router";
import API from '../../config/chfBackendApi';
import { timestampToRegularTime } from "../../utils/date.util";
import { formatAsMoney } from "../../utils/money.utils";
import { useDispatch } from "react-redux";
import { propagateAlert } from '../../redux/alertActions'
import { AuthorizedOnlyComponent, Textarea, Icon, Modal, ModalHeader, ModalBody, ModalFooter, MDTCommentList, PageSpinner, TableRow, TableData, Title, CHFTable, THead, Container, Input, Label, PageTitle, Button } from '../../components'


const CarePlan = () => {
  const dispatch = useDispatch()

  const router = useRouteMatch()

  const initial_state = {
    transactions: [],
    patient: null,
    isLoadingData: false,
    showAddCommentModal: false,
    showSelectedMDTComment: false,
    isCreatingComment: false,
    activeComment: null,
    newComment: '',
    comments: [],
    activeTransactions: null,
    mdtAmount: 0,
    isUpdatingMDTAmount: false,
    showEditMDTFund: false,
    drugs: [],
    searchDate: `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}`,
  }


  const [state, setState] = useState(initial_state);

  const table_columns = [
    {
      column_name: "#"
    },
    {
      column_name: "Visitation Date"
    },
    {
      column_name: "Attendant staff"
    },
    {
      column_name: "Hospital of Treatment"
    },

  ];

  const loadData = async () => {
    setStateValue('isLoadingData', true)
    try {
      const res = await Promise.all([
        API.get(`/api/patients/billing_history/${router.params.chf_id}/range?start_date=${state.searchDate}&end_date=${state.searchDate}`),
        API.get(`/api/mdt/comments/${router.params.chf_id}`),
        API.get('/api/patients/' + router.params.chf_id),
        // CAPBackendAPI.get('/api/v1.0/products.php')
      ]);

      return setState(prevState => ({
        ...prevState,
        transactions: res[0].data.data,
        comments: res[1].data.data,
        // drugs: res[2].data,
        showAddCommentModal: false,
        patient: res[2].data.data,
        mdtAmount: res[2].data && res[2].data.data ? res[2].data.data.patient.mdt_recommended_amount : 0
      }))
    } catch (error) {
      console.log(error)
    } finally {
      setStateValue('isLoadingData', false)
    }
  }


  const setStateValue = (key, value) => {
    return setState(prevState => ({
      ...prevState,
      [key]: value
    }))
  }

  useEffect(() => {
    loadData()

  }, [state.searchDate])

  const handleTransactionClick = transaction => {
    setStateValue('activeTransactions', transaction)
    return console.log(transaction)

  }

  const handleUpdateMDTAmount = async () => {
    try {
      setStateValue('isUpdatingMDTAmount', true)
      await API.post('/api/mdt/recommend_fund', {
        patient_id: state.patient.patient.id,
        amount: state.mdtAmount
      });

      dispatch(propagateAlert({
        variant: 'success',
        alert: "Recommended Amount Updated",
      }))

      setStateValue('showEditMDTFund', false)
    } catch (error) {
      console.log(error.response)
    } finally {
      setStateValue('isUpdatingMDTAmount', false)

    }
  }

  const renderTransaction = () => {

    if (!Object.keys(state.transactions).length) {
      return <TableRow>
        <TableData colSpan={4} data='No care available for this patient' />
      </TableRow>
    }

    return Object.keys(state.transactions).map((transaction, index) => <TableRow
      onRowClick={() => handleTransactionClick(state.transactions[transaction])}
      key={index}>
      <TableData data={index + 1} />
      <TableData data={timestampToRegularTime(state.transactions[transaction][0].created_at)} />
      <TableData data={`${state.transactions[transaction][0].biller.first_name} ${state.transactions[transaction][0].biller.last_name} `} />
      <TableData data={` ${state.transactions[transaction][0].coe.coe_name} `} />
    </TableRow>)
  }

  const findDrug = drug_id => {
    return state.drugs.find(drug => drug.prod_id === drug_id);
  }

  const renderTransactionDrugs = () => {
    return state.activeTransactions.map((trx, index) => {
      return <tr key={index}>
        <td>{index + 1}</td>
        <td>{findDrug(trx.drug_id).prod_name}</td>
        <td>Drug</td>
        <td>{trx.quantity}</td>
      </tr>
    })
  }

  const renderTransactionServices = () => {
    return state.activeTransactions.map((trx, index) => {
      return <tr key={index}>
        <td>{index + 1}</td>
        <td>{trx.service.service_name}</td>
        <td>{trx.service.category.category_name}</td>
        {/* <td> <del>N</del>{formatAsMoney(trx.service.coes[0].pivot.price)}</td> */}
        <td>{trx.quantity}</td>
      </tr>
    })
  }

  const handleCommentClick = (comment) => {
    return setState(prevState => ({
      ...prevState,
      activeComment: comment,
      showSelectedMDTComment: true,
    }))
  }

  const handleCreateMDTComment = async () => {
    if (state.newComment === '') {
      return dispatch(propagateAlert({
        variant: 'danger',
        alert: 'Comment cannot be empty.'
      }));
    }
    try {
      setStateValue('isCreatingComment', true);
      await API.post('/api/mdt/comments', {
        // visitation_date: state.searchDate,
        visitation_date: state.searchDate ? state.searchDate : new Date(),
        patient_id: router.params.chf_id,
        comment: state.newComment
      })
      dispatch(propagateAlert({
        variant: 'success',
        alert: "MDT comment has been created successfully"
      }))
      loadData();
    } catch (error) {
      console.log(error.response)
    } finally {
      setStateValue('isCreatingComment', false)
    }
  }

  const handleCancelEditMDTFund = () => {
    return setState(prevState => ({
      ...prevState,
      showEditMDTFund: false,
      mdtAmount: prevState.patient.patient.mdt_recommended_amount,
    }))
    // setStateValue('showEditMDTFund', false)
  }

  return <Container>
    <PageTitle title="Care Plan" />
    <Row>
      <Col sm={12} md={4}>
        <Label label='Date' />
        <Input
          onChange={e => setStateValue('searchDate', e.target.value)}
          value={state.searchDate}
          type='date' />
      </Col>
      <Col sm={12} md={4}>
        <Label label='MDT Recommended Fund: ' className='d-block' />
        <Label label={`NGN ${formatAsMoney(state.mdtAmount)}`} />
        {!state.mdtAmount && <AuthorizedOnlyComponent requiredPermission="UPDATE_MDT_FUND">
          <Icon icon='fa fa-edit ml-2 text-success' onClick={() => setStateValue('showEditMDTFund', true)} />
        </AuthorizedOnlyComponent>}
      </Col>
    </Row>
    <Row>
      <Col md={8} >
        <Title text="Hospital Visitations" />

        <CHFTable>
          <THead columns={table_columns} />
          <tbody>
            {(state.isLoadingData && <PageSpinner />) || renderTransaction()}
          </tbody>
        </CHFTable>
      </Col>
      <Col md={4} className='bg-white shadow-sm'>
        <Title text="MDT Comments" >
          <AuthorizedOnlyComponent requiredPermission="CREATE_MDT_COMMENT"><Button
            onClick={() => setStateValue('showAddCommentModal', true)}
            className='float-right'
            variant='success' on>
            <Icon icon='fa fa-plus' />
          </Button>  </AuthorizedOnlyComponent>
        </Title>

        <MDTCommentList
          onCommentClick={handleCommentClick}
          comments={state.comments} />
      </Col>
    </Row>

    {state.activeTransactions && <Modal fullscreen={true}>
      <ModalHeader
        modalTitle={"Transaction Detail"}
        onModalClose={() => setStateValue('activeTransactions', null)}
      />
      <ModalBody>
        <div className={["row", /* chfstyles.billing_details */].join(" ")}>
          <div className="col-md-6">
            <h5>
              <strong>Transaction Reference</strong>
            </h5>
            <span>{state.activeTransactions[0].transaction_id}</span>
          </div>
          <div className="col-md-6">
            <h5>
              <strong>COE VISITED</strong>
            </h5>
            <span>{state.activeTransactions[0].coe.coe_name}</span>
          </div>
          <div className="col-md-12">&nbsp;</div>
          <div className="col-md-6">
            <h6>
              <i className="fas fa-user"></i> Patient:{" "}
            </h6>
            <small>
              {state.activeTransactions[0].user.patient.chf_id}
            </small>
          </div>
          <div className="col-md-6">
            <h6>
              <i className="fas fa-calendar"></i> Date Visited:{" "}
            </h6>
            <small>
              {timestampToRegularTime(state.activeTransactions[0].created_at)}
            </small>
          </div>
          <div className="col-sm-12">
            <br />
            <h6
              className={[/* chfstyles.underlined, */ "text-success"].join(" ")}
            >
              Services Rendered
            </h6>
            <table className="table table-responsive-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service Name</th>
                  <th>Service Category</th>
                  {/* <th>Unit Price</th> */}
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {state.activeTransactions &&
                  !state.activeTransactions[0].is_drug
                  ? renderTransactionServices()
                  : state.activeTransactions &&
                    state.activeTransactions[0].is_drug
                    ? renderTransactionDrugs()
                    : ""}

              </tbody>
            </table>
          </div>
          <div className="col-sm-12 mb-2">
            <h6>Documents</h6>
            {/* {transaction.documents.length ? (
                  transaction.documents.map((document, index) => (
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
                )} */}
          </div>

          {/* <div className="col-sm-12 ">
                <h6>Physician Comment:</h6>
                {(transaction.comment && (
                  <p> {transaction.comment.comment}</p>
                )) || <p className="text-muted">No Comment available</p>}
              </div> */}
        </div>
      </ModalBody>
    </Modal>}

    {state.showAddCommentModal && <Modal fullscreen>
      <ModalHeader
        onModalClose={() => setStateValue('showAddCommentModal', null)}
        modalTitle='Create Comment' />
      <ModalBody>
        <p>You can comment on the {`patient's`} careplan or care received by this patient </p>
        {/* <p><strong>{state.searchDate}</strong> </p> */}
        <Textarea
          placeholder="Enter comment"
          name='newComment'
          onChange={e => setStateValue('newComment', e.target.value)}
          value={state.newComment}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={handleCreateMDTComment}
          disabled={state.isCreatingComment}
          variant='success'> {state.isCreatingComment ? "Please wait..." : "Create comment"} <Icon icon='fa fa-check' /></Button>
      </ModalFooter>

    </Modal>}

    {
      state.showSelectedMDTComment && <Modal fullscreen>
        <ModalHeader
          onModalClose={() => setStateValue('showSelectedMDTComment', false)}
          modalTitle={`MDT Comment - ${timestampToRegularTime(state.activeComment.created_at)}`} />
        <ModalBody>
          <Title text={`${state.activeComment.mdt_user.last_name} ${state.activeComment.mdt_user.first_name} - ${timestampToRegularTime(state.activeComment.created_at)}`} />
          <p> <Icon icon='fa fa-calendar' /> Care Date: {timestampToRegularTime(state.activeComment.visitation_date)}</p>
          <p>
            {state.activeComment.comment}
          </p>
        </ModalBody>
      </Modal>
    }


    {
      state.showEditMDTFund && <Modal >
        <ModalHeader
          onModalClose={handleCancelEditMDTFund}
          modalTitle='Edit Fund' />
        <ModalBody>
          <Label label="MDT Fund" />
          <Input value={state.mdtAmount} onChange={e => setStateValue('mdtAmount', parseFloat(e.target.value))} />
          <Label label={`MDT Recommended Fund: N${formatAsMoney(state.mdtAmount)}`} className="d-block" />
          <Label label={`Please note that this value can only be changed once`} className="d-block text-danger" />
        </ModalBody>
        <ModalFooter>
          <Button
            disabled={state.isUpdatingMDTAmount}
            onClick={handleUpdateMDTAmount}
            variant="success">{state.isUpdatingMDTAmount ? 'Please wait...' : 'Update'}</Button>
        </ModalFooter>
      </Modal>
    }
  </Container>
}

export default CarePlan;