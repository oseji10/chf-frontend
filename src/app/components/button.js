
const Button=({value, btnClass, type = 'button', children, onClick,...rest})=>{

    return(
        <button 
        {...rest}
        className={btnClass} 
        type={type} 
        onClick={onClick}
        style={{borderRadius: '3px', fontSize: '10pt'}}>{value}{children}</button>
    );


}

export default Button;