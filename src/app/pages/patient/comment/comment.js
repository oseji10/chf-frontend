import { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router';
import Icon from '../../../components/icon/icon';
import PageTitle from '../../../components/pageTitle/pageTitle';
import API from '../../../config/chfBackendApi';
import { timestampToRegularTime } from '../../../utils/date.util';
import commentStyles from './comment.module.scss';
import { Spinner } from 'react-bootstrap';
import Modal from '../../../components/modal/modal';
import ModalHeader from '../../../components/modal/modalHeader';
import ModalBody from '../../../components/modal/modalBody';
import TransactionDocumentsModal from '../../../components/transactionDocumentsModal/transactionDocumentsModal';


const Comment = props => {
    const {comment_id, patient_id} = useRouteMatch().params;
    // console.log(match)
    const initial_state = {
        comment: null,
        files: null,
        loadingComment: true,
        comment_id: null,
        patient_id: null,

        showDocumentsModal: false,
    }

    const [state, setState] = useState(initial_state)

    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            comment_id,
            patient_id
        }), loadComment());

        // loadComment();
    },[state.comment_id])

    const changeStateValue = (key, value) => {
        return setState(prevState => ({
            ...prevState,
            [key]: value
        }))
    }


    const loadComment = async () => {
        try{
            // console.log(`/api/patients/${state.patient_id}/comments/${state.comment_id}`)
            const res = await API.get(`/api/patients/${state.patient_id}/comments/${state.comment_id}`)
            console.log(res)
            setState(prevState => ({
                ...prevState,
                comment: res.data.data,
            }))
        }catch(e){
            console.log(e.response)
        }finally{
            setState(prevState => ({
                ...prevState,
                loadingComment: false,
            }))
        }
    }

    return <div className='container'>
        <PageTitle icon='fa fa-comments' title="Patient Comment" />
        <div className={commentStyles.comments_wrapper}>
            {/*  */}
            {(state.loadingComment && <Spinner animation='border' variant='success' />) || <div className={commentStyles.comment}>
            {(state.comment && <>
                <h3><Icon icon='fa fa-user' /> Physician: {state.comment.commented_by} <span className='float-right badge badge-success'>{timestampToRegularTime(state.comment.created_at)}</span> </h3>
                <h2>{state.comment.coe_name}</h2>
                 <p>
                    {state.comment.comment}
                </p>
                {
                    state.comment.documents.length ? <button onClick={() => changeStateValue('showDocumentsModal',true)} className='btn btn-sm btn-outline-success float-right'>Documents</button> : ""
                }
                </>) || <> <h1><i className="fa fa-exclamation-triangle"> </i></h1> <p>  No comment loaded</p></> }
            </div>}
        </div>

        
        {state.comment && state.comment.documents && 
        <TransactionDocumentsModal 
        showDocumentsModal={state.showDocumentsModal} 
        documents={state.comment.documents}
        onModalClose={() => changeStateValue('showDocumentsModal',false)}  />}

    </div>
}


export default Comment;