import React from 'react'
import styles from './coestaff.module.scss'

export default function SearchBox() {
    return (
        <div className={styles.billing_search_card + ' card'}>
            <div className={'form-group'}>
                <label>Search Patient</label>
                <input type='text' name='patient_id' placeholder="Enter patient ID to search" />
                <button className="btn btn-block btn-success mt-3">Search <i className='fa fa-search'></i> </button>
            </div>
        </div>
    )
}
