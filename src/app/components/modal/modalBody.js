import React from 'react'
import styles from './modal.module.scss'

export default function ModalBody({children, ...rest}) {
    return (
        <div className={styles.modal_body} {...rest}>
            {children}
        </div>
    )
}
