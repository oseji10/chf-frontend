import blockButtonStyles from './block-button.module.scss';

const BlockButton = ({children,type, text, onClick, variant, ...rest}) => {
    return <button 
        className={[blockButtonStyles.block_button, blockButtonStyles[variant]].join(' ')}
        type={type ? type : 'button'}
        onClick={onClick}
        {...rest}
    >
        {text}
        {children}
    </button>
} 

export default BlockButton;