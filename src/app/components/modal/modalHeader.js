import React from 'react'
import styles from './modal.module.scss'

export default function ModalHeader({children, modalTitle, onModalClose, variant}) {
    return (
        <div className={[styles.modal_header, styles[variant]].join(' ')}>
            <div className={styles.title_container}>
                <h4>{modalTitle}</h4>
                <span  onClick={onModalClose}>x</span>
            </div>
            {children}
        </div>
    )
}
