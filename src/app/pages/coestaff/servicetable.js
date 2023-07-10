/* eslint-disable no-script-url */
import React from 'react'
import styles from './coestaff.module.scss'

export default function ServiceTable(props) {
    // console.log("services in services table ", props.selectedServices)
    const renderSelectedServices = () => {
        if (props.selectedServices && props.selectedServices.length) {
            return props.selectedServices.map((service, index) => {
                return (<tr key={index} > 
                    <td>{index + 1}</td>
                    <td>{service.service.service_name}</td>
                    <td>{service.category_name}</td>
                     {/* The actual price of a service should be the COE price */}
                    <td><del>N</del> {service.service.coes[0].pivot.price}</td>
                    <td>{service.quantity}</td>
                    <td> <span className="btn" onClick={() => props.onRemoveService(service.service.id)}> <i className='fa fa-trash text-secondary'></i> </span> </td>
                </tr>)
            })
        }

        return (<tr>
                    <td colSpan='7'>No services yet.Add new services to bill.</td>
                </tr>)
    }
    return (
        <table className={`table table-responsive-sm table-striped ` + styles.service_table}>
            <thead>
               <tr>
                <th> SN </th>
                    <th>Service</th>
                    <th>Service Category</th>
                    <th>Cost</th>
                    <th>Quantity</th>
                    <th></th>
               </tr>
            </thead>
            <tbody>
                {renderSelectedServices()
                }
                
            </tbody>
        </table>
    )
}
