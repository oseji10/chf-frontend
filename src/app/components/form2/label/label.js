import labelStyles from './label.module.scss';

const Label = ({label, ...rest}) => {
    return <>
        <label {...rest} className={labelStyles.label}>{label}</label>
    </>
}

export default Label;