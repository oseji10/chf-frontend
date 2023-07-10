import React from 'react'
import styles from './input.module.scss'

function Input(props) {
    const {type, classes, value, onChange, placeholder, label, inputName, ...rest} = props
    return (
        // <div className={styles.input_wrapper}>
            <input 
            type={type ? type : 'text'} 
            name={inputName}
            className={[classes, styles.input_field].join(' ')} 
            value={value ? value : ''} 
            placeholder={placeholder ? placeholder : ""}
            onChange={onChange} 
            {...rest}/>
        // </div>
    )
}

export default Input;