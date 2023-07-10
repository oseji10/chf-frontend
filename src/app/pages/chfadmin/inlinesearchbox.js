import React from 'react'
import styles from '../coestaff/coestaff.module.scss'

export default function InlineSearchBox(props) {
    const { inputValue,onButtonClick, inputPlaceholder, inputName, inputType, icon} = props
    
    return (
        <div className={styles.inline_search_box}>
            {/* <h4>{label}</h4> */}
            <div className={styles.input_wrapper}>
                <input type={inputType ? inputType : 'text'} name={inputName} value={inputValue} placeholder={inputPlaceholder ? inputPlaceholder : ""} onChange={props.onInputChange} />
                <button className='btn-success' onClick={onButtonClick}> <i className={`fa fa-${icon ? icon : ''}`}></i> </button>
                {props.showCloseButton && <button onClick={props.onClearSearch} className={styles.clear_input_btn}> X </button>}
            </div>
        </div>
    )
}
