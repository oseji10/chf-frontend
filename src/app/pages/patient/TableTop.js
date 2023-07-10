// import React, {useState} from 'react'
// import Button from '../../components/button'
// import { formatAsMoney } from '../../utils/money.utils'
import styles from '../coestaff/coestaff.module.scss'

export default function TableTop(props) {    
    return (
        <div className={`row `+ styles.service_table}>
            {props.children}

        </div>
    )
}
