import React from "react";
import {ButtonLoader} from '../../components'

const Button = ({text, children, variant, size,className, loading = false, ...rest}) => {
    return <button 
        disabled={loading}
        className={`btn btn-${variant} 
        ${className}`} 
        {...rest} >
            {
                loading && <ButtonLoader /> 
                || 
                <>
                    {text}{children}
                </>
            }
        </button>
}

export default Button;