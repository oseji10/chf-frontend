import React from 'react'
import styles from './modal.module.scss'

export default function ModalFooter({children, className, ...rest}) {
    return (
        <div className={[styles.modal_footer, className].join(' ')} {...rest}>
            
            {children}
        </div>
    )
}
