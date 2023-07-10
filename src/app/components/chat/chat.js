import React, { useEffect, useRef } from 'react';
import chatStyles from './chat.module.scss'
import ChatList from './chatList';

const Chat = ({chats}) => {
    
    return <div className={chatStyles.chat}>
        <ChatList chats={chats} />
    </div>
}

export default Chat;