import React from 'react'
import { Icon } from '..'
import styles from './inlinesearch.module.scss'

export default function InlineSearchBox(props) {
    const { inputValue,onButtonClick, inputPlaceholder, inputName, inputType, icon, loading = false,onInputChange} = props
    
    return (
        <div className={[styles.inline_search_box,props.align==="left"?styles.left:""].join(" ")}>
            {/* <h4>{label}</h4> */}
            <div className={styles.input_wrapper}>
                <input type={inputType ? inputType : 'text'} name={inputName} value={inputValue} placeholder={inputPlaceholder ? inputPlaceholder : ""} onChange={onInputChange} />

                <button 
                    className='btn-success' 
                    disabled={loading}
                    onClick={onButtonClick}> 
                    <Icon icon={`fa fa-${icon ? icon : 'search'}`} />
                    </button>
                {props.showCloseButton && <button onClick={props.onClearSearch} className={styles.clear_input_btn}> X </button>}

            </div>
        </div>
    )
}
