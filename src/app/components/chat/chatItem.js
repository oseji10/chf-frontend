import React from 'react'
import { timestampToRegularDateTime } from '../../utils/date.util';
import chatStyles from './chat.module.scss';


const ChatItem = ({chat}) => {
    const firstname = chat.username.split(' ')[0];
    const lastname = chat.username.split(' ')[1];
    return <div className={[chatStyles.chat_item, chatStyles.right].join(' ')}>
        <span className={chatStyles.user_abbr}>{firstname.slice(0,1)} {lastname.slice(0,1)}</span>
        <div className={chatStyles.comment}>
            <span className={chatStyles.username}>{chat.username}</span>
            <p dangerouslySetInnerHTML={{__html: chat.comment}}></p>
            <span className={chatStyles.timestamp}>{timestampToRegularDateTime(chat.timestamp)}</span>
        </div>

    </div>
}

export default ChatItem;