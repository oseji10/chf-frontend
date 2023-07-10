import React from 'react'
import styles from './coestaff.module.scss'

export default function BillingFooter(props) {
    // console.log(props)
    return (
        <div className={styles.billing_footer   }>
            <button onClick={() => props.onPreviewBilling(true)} className={`btn btn-sm btn-success `}>Preview</button>
            <button className='btn btn-outline-success btn-sm' onClick={() => props.onChangeStateValue('showFileUploadModal',true)}>Attach File</button>
            <button className={`btn btn-sm btn-secondary`} onClick={props.onCancelBilling}>Cancel</button>
        </div>
    )
}
