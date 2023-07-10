import React, { useRef } from 'react'
import styles from './infographics.module.scss'

export default function SmallCard(props) {
    
    return (
        <div className={styles.small_card}>
            {props.children}
        </div>
    )
}
