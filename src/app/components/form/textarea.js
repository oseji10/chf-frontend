import React from 'react'
import styles from './input.module.scss'

function TextArea(props) {
    const { classes, value, onChange, placeholder, wrapperClasses, inputName} = props
    return (
        <div className={[styles.input_wrapper,styles.textarea, wrapperClasses].join(' ')}>  
            <textarea 
            onChange={onChange} 
            placeholder={placeholder} 
            name={inputName}
            value={value}
            className={[classes,styles.textarea].join(' ')}></textarea>
        </div>
    )
}

export default TextArea;