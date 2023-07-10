import React, { useState, useEffect } from 'react';
import PageTitle from '../report/infographics/pageTitle';
import InlineSearchBox from '../../components/form/inlinesearchbox';
import { useDispatch } from 'react-redux';
import { propagateAlert } from '../../redux/alertActions';
import API from '../../config/chfBackendApi';
import { formatErrors } from '../../utils/error.utils';
import chfStyles from '../chfadmin/chfadmin.module.scss'
import THead from '../../components/table/thead/thead';
import { timestampToRegularTime } from '../../utils/date.util';
import Modal from '../../components/modal/modal';
import ModalHeader from '../../components/modal/modalHeader';
import ModalBody from '../../components/modal/modalBody';
import ModalFooter from '../../components/modal/modalFooter';
import TextArea from '../../components/form/textarea';
import AuthorizedOnlyComponent from '../../components/authorizedOnlyComponent';

const Transactions = ({}) => {

    const table_columns = [
        {
            column_name: 'Transaction ID'
        },
        {
            column_name: 'Patient'
        },
        {
            column_name: 'COE'
        },
        {
            column_name: 'Service Count'
        },
        {
            column_name: 'Date'
        },
        {
            column_name: 'Status'
        },
        {
            column_name: 'Action'
        },
    ]

    const dispatch = useDispatch();
    const initial_state = {
        transactionId: '',
        transaction: null,
        showDisputeModal: false,
        showResolveModal: false,
        isFormSubmitting: false,
        comment: '',
        total: 0,
    }

    const [state, setState] = useState(initial_state)

    const setStateValue = (key, value) => {
        return setState(prevState => ({
            ...prevState,
            [key] : value
        }))
    }

    useEffect(async () =>{
        const res = await API.get('/api/transactions/dispute');
        console.log(res)
    },[])

    const handleTransactionSearch = async () => {
        try {
            const res = await API.get(`/api/transactions/${state.transactionId}`)
            
            return setState(prevState => ({
                ...prevState,
                transaction: res.data.data,
                // total
            }));
        } catch (e) {
            if (!e.response ||  !e.response.data) {
                return dispatch(propagateAlert({
                    variant: 'danger',
                    alert: "A possible server error occured. Also make sure you have a stable internet before trying again."
                }))
            }
            return dispatch(propagateAlert({
                variant: "danger",
                alert: formatErrors(e)
            }))
        }
    }

    const handleResolveDispute = async () => {
        setStateValue('isFormSubmitting', true)
        try{
            const res = await API.put(`/api/transactions/dispute/${state.transactionId}`,{
                transaction_id: state.transactionId
            })
            console.log(res)
            
            setState(prevState => ({
                ...prevState,
                showDisputeModal: false,
                showResolveModal: false,
                transaction: {
                    ...prevState.transaction,
                    status: 'resolved',
                }
            }))
            dispatch(propagateAlert({
                variant: 'success',
                alert: res.data.message
            }))
        }catch(e){
            console.log(e.response)
            dispatch(propagateAlert({
                variant: 'danger',
                alert: formatErrors(e)
            }))
        }finally{
            setStateValue('isFormSubmitting', false)
            
        }
    }
    
    const handleDispute = async () => {
        setStateValue('isFormSubmitting', true)
        try {
            const res = await API.post('/api/transactions/dispute',{
                transaction_id: state.transactionId,
                status: 'disputed',
                comment: state.comment,
            });
            
            setState(prevState => ({
                ...prevState,
                showDisputeModal: false,
                showResolveModal: false,
                transaction: {
                    ...prevState.transaction,
                    status: 'disputed',
                }
            }))

            dispatch(propagateAlert({
                variant: 'success',
                alert: res.data.message
            }))

        } catch (e) {
            dispatch(propagateAlert({
                variant: 'danger',
                alert: formatErrors(e)
            }))
            console.log(e)
        }finally{
            setStateValue('isFormSubmitting', false)

        }
    }
    

    return <>
        <div className='container'>
            <PageTitle title="Transactions" />
            <InlineSearchBox 
                inputValue={state.transactionId}
                inputName='searchKey'
                inputPlaceholder="Enter transaction ID to search"
                onInputChange={e => setStateValue('transactionId', e.target.value)}
                onButtonClick={handleTransactionSearch}
            />
            <div className={chfStyles.application_table}>
                <div className={chfStyles.xScrollable}>
                    {state.transaction && <table className='table table-responsive-sm'>
                        <THead columns={table_columns}/>
                        <tbody>
                            <tr>
                                <td>{state.transaction.transaction_id}</td>
                                <td>{state.transaction.user.first_name} {state.transaction.user.last_name}</td>
                                <td>{state.transaction.coe.coe_name}</td>
                                <td>{state.transaction.transactions.length}</td>
                                <td>{timestampToRegularTime(state.transaction.created_at)}</td>
                                <td>{state.transaction.status}</td>
                                {/* <td>{state.total}</td> */}
                                <td>
                                    <AuthorizedOnlyComponent requiredPermission="FLAG_TRANSACTION">
                                    {
                                       !state.transaction.status ? 
                                       <button onClick={() => setStateValue('showDisputeModal', true)}  className='btn btn-sm btn-danger'>Dispute</button> 
                                       : state.transaction.status === 'disputed' ?
                                       <button onClick={() => setStateValue('showResolveModal', true)}  className='btn btn-sm btn-success'>Resolve</button> : null 
                                    }  
                                    </AuthorizedOnlyComponent>
                                </td>
                            </tr>
                        </tbody>
                    </table>}
                </div>
            </div>
        </div>

        {state.showDisputeModal && <Modal>
            <ModalHeader modalTitle='Dispute Transaction' onModalClose={() => setStateValue('showDisputeModal', false)} />
            <ModalBody>
                <p>You are about to raise a dispute for this transaction. All stakeholders involved will recieve an email notification.  </p>
                <p>Dispute Comment</p>
                <TextArea
                    placeholder="Transaction dispute comment"
                    value={state.comment}
                    name='comment'
                    onChange={e => setStateValue('comment', e.target.value)}
                />
            </ModalBody>
            <ModalFooter>
                <button className='btn btn-sm btn-danger' disabled={state.isFormSubmitting} onClick={handleDispute}>{state.isFormSubmitting ? "please wait..." : "Raise Dispute"}</button>
            </ModalFooter>
        </Modal>}

        {state.showResolveModal && <Modal>
            <ModalHeader modalTitle='Resolve Transaction Dispute' onModalClose={() => setStateValue('showResolveModal', false)} />
            <ModalBody>
                <p>You are about to mark this disputed transaction as resolved. All stakeholders involved will recieve an email notification. </p>
                <p>By clicking the button below you agree that all due processes had been followed and you have authorization to mark this transaction as resolved</p>
                <p>Continue?</p>
            </ModalBody>
            <ModalFooter>
                <button className='btn btn-sm btn-success' onClick={handleResolveDispute} disabled={state.isFormSubmitting}>{state.isFormSubmitting ? "please wait..." : "Resolve Dispute"}</button>
            </ModalFooter>
        </Modal>}
    </>
}

export default Transactions;