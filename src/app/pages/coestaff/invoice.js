import React from 'react'
import styles from './coestaff.module.scss';
import logo from './../../../assets/images/logo.png';
import { formatAsMoney } from '../../utils/money.utils';

export default function Invoice(props) {
    const {patient, isCompletingBilling,onCompleteBilling, selectedServices, comment, onPreviewBilling,} = props;
    let total = 0;
    let discount_percentage = 0.25; //25%
    return (
        <div className={styles.invoice_container} >
            <div className={`row ${styles.invoice_header}`}>
                <img src={logo} alt="" />
                <div>
                    <span>Billing Invoice</span>
                    <span>Reference generated after transaction is completed</span>
                </div>
            </div>
            <div className={`row ${styles.row}`}>
                <div className='col-md-6'>
                    <h4>To</h4>
                    <p>
                        {patient.first_name} {patient.middle_name} {patient.last_name}
                    </p>
                    <p>{patient.address}</p>
                    <p>{patient.phone_number}</p>
                </div>
                <div className='col-md-6'>
                    <h4>From</h4>
                    <p>New Federal Secretariat Complex,</p>
                    <p>Ahmadu Bello Way, Phase III</p>
                    <p>FCT, Abuja.</p>

                </div>
            </div>
            <div className={`table table-responsive-sm row  ${styles.row}`}>
                <div className='col-12'>
                    <div className='row'>
                        <div className='col-3'>
                            <h4>Service Type</h4>                    
                        </div>
                        <div className='col-3'>
                            <h4>Category</h4>                    
                        </div>
                        <div className='col-3'>
                            <h4>Price</h4>
                        </div>
                        <div className='col-3'>
                            <h4>Quantity</h4>
                        </div>
                    </div>
                </div>
                 {/* The actual price of a service should be the COE price */}

                {selectedServices.map( service => {
                    total += (service.service.coes[0].pivot.price * service.quantity)
                    return (<div className='col-12'>
                    
                    <div className='row'>
                        <div className='col-3'>
                            <p>{service.service.service_name}</p>                    
                        </div>
                        <div className='col-3'>
                            <p>{service.category_name}</p>                    
                        </div>
                        <div className='col-3'>
                            <p><del>N</del> {formatAsMoney(service.service.coes[0].pivot.price)}</p>
                        </div>
                        <div className='col-3'>
                            <p>{service.quantity}</p>
                        </div>
                        {/* <div className='col-3'>
                            <p><del>N</del> {service.quantity * service.service.price}</p>
                        </div> */}
                    </div>
                </div>)})}

            </div>
            <div className={`row  ${styles.row} ${styles.scrollable_x}`}>
                <div className='col-12'>
                    <h4> Amout chargable from e-wallet</h4>
                    <p> <del>N</del> {formatAsMoney(total)}</p>
                </div>
                {/* <div className='col-4'>
                    <h4>Discount ({discount_percentage * 100}%)</h4>
                    <p> <del>N</del> {formatAsMoney(total * discount_percentage)}</p>
                </div> */}
                {/* <div className='col-4'>
                    <h4>Net Payable</h4>
                    <p> <del>N</del> {formatAsMoney(total - (total * discount_percentage))}</p>
                </div> */}
            </div>
            <div className={`row  ${styles.row}`}>
                <div className='col-md-6 text-danger'>
                    {/* <h4 className='text-danger'>DUMMY - Billing account</h4>
                    <h4 className='text-danger'>Ahmadu Bello University Teaching Hospital (ABUTH)</h4>
                    <p>22 Bello road, KM 3</p>
                    <p>Zaria Road, Zaria LGA</p>
                    <p>Kaduna State</p> */}
                </div>
                <div className='col-12'>
                    <small>
                        <strong>
                            {/* <em>Note: The total payable for this invoice has a {discount_percentage * 100}% discount from the CHF program. This might change at anytime subjective to program values.</em> */}
                        </strong>
                    </small>
                </div>
            </div>
            <div className={`row  ${styles.row}`}>
            <div className='col-12'>
                    <small>
                        <strong>
                            <em>Comment: {comment ? comment:'No comment'}</em>
                        </strong>
                    </small>
                </div>
            </div>
            <div className={`row  ${styles.invoice_footer}`}>
                <button className='btn btn-sm btn-success' onClick={/* onCompleteBilling */ () => props.onChangeStateValue('showFinalPrompt', true)} disabled={isCompletingBilling}>
                    {isCompletingBilling ? "Please wait while billing is processed" : "Complete"}
                    </button>
                <button className='btn btn-sm btn-secondary'  onClick={() => onPreviewBilling(false)} disabled={isCompletingBilling}>Cancel</button>
            </div>
        </div>
    )
}
