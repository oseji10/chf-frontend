/* eslint-disable no-script-url */
import React from 'react'
import { formatAsMoney } from '../../utils/money.utils'
import styles from './coestaff.module.scss'

export default function DrugsTable(props) {
    const renderSelectedDrugs = () => {
        if (props.selectedDrugs && props.selectedDrugs.length) {
            return props.selectedDrugs.map((drug, index) => {
                return (<tr key={index} > 
                    <td>{index + 1}</td>
                    <td>{drug.drug?.productName}</td>
                    <td>{drug.drug?.description} ({drug.drug?.manufacturer?.manufacturerName})</td>
                    <td><del>N</del> {formatAsMoney(drug.drug?.price ?? 0)}</td>
                    <td>{drug.quantity}</td>
                    <td> <span onClick={() => props.onRemoveDrug(index,drug.drug?.productId)}> <i className='fa fa-trash text-secondary'></i> </span> </td>
                </tr>)
            })
        }

        return (<tr>
                    <td colSpan='7'>No drug added yet.Add new drug to bill.</td>
                </tr>)
    }
    return (
        <table className={`table table-responsive-sm table-striped ` + styles.service_table}>
            <thead>
               <tr>
                <th> SN </th>
                    <th>Drug</th>
                    <th>Description</th>
                    <th>Cost</th>
                    <th>Quantity</th>
                    <th></th>
               </tr>
            </thead>
            <tbody>
                {renderSelectedDrugs()
                }
                
            </tbody>
        </table>
    )
}
