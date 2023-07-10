// import React, {useState} from 'react'
import Button from '../../components/button'
import { formatAsMoney } from '../../utils/money.utils'
import styles from './coestaff.module.scss'


export default function ServiceHeader(props) {
    // console.log('The propd s ',props)
    const {services, currentService, categories, onAddService,onCategoryChange,onSelectChange, quantity} = props
    
    return (
        <div className={`row `+ styles.service_table}>
            <div className='col-md-6 mt-2'>
            <select onChange={onCategoryChange}>
                <option value="">Select service category</option>
                    {Object.values(categories).map((category, index) => {
                        return  (category.services.length)?
                        <option key={index} value={category.id}>{category.category_name} </option>:""
                    }) }
                </select>
                {services && <select onChange={onSelectChange}>
                    <option value="">Select service type</option>
                    {Object.values(services).map((service, index) => {
                        return <option key={index} value={service.id}>{service.service_name}</option>
                    }) }
                </select>}
            </div>
            {currentService && <div className='col-md-3 mt-2'>
                <input type='number' name='quantity' value={quantity} placeholder='Quantity' min='1' onChange={props.onQuantityChange} />
                {/* The actual price of a service should be the COE price */}
                <input type='text' name='price' value={`NGN ${formatAsMoney(currentService.coes[0].pivot.price)}`} placeholder='Price' min='1' readOnly />
            </div>}
            <div className='col-md-3 mt-2'>
                {currentService && <Button 
                 value="Add" 
                 onClick={onAddService}
                 btnClass='btn btn-success'
                 type='text'
                 />}
            </div>
        </div>
    )
}
