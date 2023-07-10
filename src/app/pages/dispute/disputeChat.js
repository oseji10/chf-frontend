import React, { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useRouteMatch } from 'react-router';
import Chat from '../../components/chat/chat';
import TextArea from '../../components/form/textarea';
import PageTitle from '../../components/pageTitle/pageTitle';
import API from '../../config/chfBackendApi';

const DisputeChat = ({ }) => {
    const transaction_id = useRouteMatch().params.transaction_id;

    const initial_state = {
        newComment: '',
        comments: [],
        isSendingComment: false,
    }
    const [state, setState] = useState(initial_state)

    const loadComments = async () => {
        try {
            const res = await API.get(`/api/transactions/${transaction_id}/dispute/comments`);
            return setStateValue('comments', res.data.data);
        } catch (e) {
            console.log(e.response);
        }
    }

    useEffect(() => {
        loadComments();
    }, []);


    const setStateValue = (key, value) => {
        return setState(prevState => ({
            ...prevState,
            [key]: value
        }))
    }

    const handleAddChat = async () => {
        console.log('sending chat...')
        setStateValue('isSendingComment', true)
        try {
            const res = await API.post(`/api/transactions/${transaction_id}/dispute/comments`, {
                transaction_id,
                comment: state.newComment,
            });
            console.log(res.data.data);
            return setState(prevState => ({
                ...prevState,
                newComment: '',
                comments: [
                    ...prevState.comments,
                    res.data.data,
                ]
            }))
        } catch (e) {
            console.log(e);
        } finally {
            setStateValue('isSendingComment', false);
        }
    }


    return <div className='container'>
        <PageTitle title="Dispute Chat" icon='fa fa-comments' />
        {state.comments.length ? <Chat chats={state.comments.map(comment => ({
            username: `${comment.user.first_name} ${comment.user.last_name}`,
            comment: comment.comment,
            timestamp: comment.created_at,
            id: comment.id,
        }))} /> : <p className='p-2 text-secondary'>No comments on this dispute yet. Be the first to comment.</p>}

        <TextArea
            placeholder="Chat"
            value={state.newComment}
            inputName='newComment'
            onChange={e => setStateValue(e.target.name, e.target.value)}
        />
        <Button disabled={state.isSendingComment} onClick={handleAddChat} variant='success' >{state.isSendingComment ? 'Sending...' : 'Send'} <i className='fa fa-comment' style={{ marginLeft: '5px' }}> </i></Button>
    </div>
}

export default DisputeChat;