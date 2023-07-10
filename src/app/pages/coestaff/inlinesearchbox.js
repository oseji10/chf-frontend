import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import MessageAlert from '../../components/message/messageAlert'
import { formatAsMoney } from '../../utils/money.utils';
import styles from './coestaff.module.scss'

function InlineSearchBox(props) {
    const {patient, inputValue,onButtonClick, onPatientSelect, alert, patientLoaded} = props

    return (
        <div className={styles.inline_search_box + `${patientLoaded ? styles.inline_search_box : ''}`}>
            {props.hasAlert && <MessageAlert 
                alertMessage={alert.alertMessage}
                alertVariant={alert.alertVariant}
            />}
            <h4>Search Patient</h4>
            <div className={styles.input_wrapper}>
                <input type='text' name='searchID' value={inputValue} placeholder='Enter patient ID or email' onChange={props.onInputChange} />
                <button className='btn-success' onClick={onButtonClick}> <i className='fa fa-search'></i> </button>
                {props.showDropdown && patient && <div className={styles.searchbox_dropdown}>
                    <Link to='' className='text-success' onClick={onPatientSelect}>{patient.first_name} {patient.last_name}</Link>
                    <small className='d-block'>Wallet Balance: <del>N</del> {formatAsMoney(patient.wallet.balance)}</small>
                    {(props.user.coe_id === patient.patient.coe_id && <Link className='text-secondary' href={`/patients/${patient.id}/history`}>History</Link>) || <Link to={`/patients/${patient.patient.chf_id}/comments`} className='text-success'>Medical History</Link>}
                </div>}
            </div>
        </div>
    )
}


const mapStateToProps = state => {
    return {
        user: state.auth.user,
    }
}

export default connect(mapStateToProps)(InlineSearchBox);