import React from 'react'

export default function AlertText({message, alertType, color}) {
    switch (alertType) {
        case 'danger':
            alertType = '#df2222'
            break;
        case 'success':
            alertType = '#45da78'
            break;
        case 'warning':
            alertType = '#dada45'
            break;
        case undefined:
            alertType = '#333'
            break;
        default:
            break;
    }
    
    const styles = { 
        display: 'block',
        padding: "3px 10px",
        width: '100%',
        fontSize: '9pt', 
        backgroundColor: alertType,
        color: color ? color : '#fff',
        fontWeight: '600'
    }
    return (
        <span style={styles}>
            {message}
        </span>
    )
}
