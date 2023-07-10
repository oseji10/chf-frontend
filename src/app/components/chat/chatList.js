import React from 'react';
import chatStyles from './chat.module.scss'
import ChatItem from './chatItem';

const ChatList = ({chats}) => {
    return <div className={chatStyles.chat_list}>
        {chats.map((chat, index) => <ChatItem key={index} chat={chat} />)}
    </div>
}

export default ChatList;