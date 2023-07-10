import inputStyles from './input.module.scss';
import { useState } from 'react';

const Input = ({type, value, placeholder,onChange,icon,altIcon,iconClick, ...rest}) => {
    const [isIcon, setIsIcon]=useState(true);
    const toggleIcon=()=>{
        setIsIcon(!isIcon);
        iconClick();
    }

    const renderInput = ()=>{
        if(type==="radio" || type==="checkbox") return <div className={inputStyles.radio_wrapper}>
        <input
            type={type ? type : 'text'}
            value={value}
            onChange={onChange}
            {...rest}
        />  <span>{placeholder}</span>
    </div>
        else return <div className={inputStyles.input_wrapper}>
        <input
            type={type ? type : 'text'}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            {...rest}
        />
        {icon && <div className={inputStyles.icon_wrapper} onClick={toggleIcon}>{isIcon?icon:altIcon}</div>}
    </div>
    }

    return <>{renderInput()}</>
}

export default Input;