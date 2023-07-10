import React from 'react'
import styles from './infographics.module.scss'
import { Link } from 'react-router-dom'

export default function SmallTable(props) {
    
    return (
        <div className={props.className}>
             {props.children}
        </div>
    )
}