import React from 'react'
import styles from './spinner.module.scss'

const ComponentSpinner = () => {
    return (
        <div className={styles.component_spinner_wrapper}>
            <svg className={styles.component_spinner}>
                <circle cy='10' cx='10' r='20'></circle>
            </svg>
        </div>
    )
}

export default ComponentSpinner;