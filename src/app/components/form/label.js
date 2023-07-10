import React from 'react';
import styles from './label.module.scss'

const Label = ({label, className, ...rest}) => {
    return <label className={styles.label} {...rest}>{label}</label>
}

export default Label;