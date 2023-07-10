import styles from './select.module.scss';

const Select = ({options = [], ...rest}) => {
    return <select className={styles.select} {...rest} >
        {
            options.map((option, index) => <option value={option.value}>
                {option.label}
            </option>)
        }
    </select>
}

export default Select;