import styles from './keyValueText.module.scss';

const KeyValueText = ({label, value}) => {
    return <p className={styles.key_value_text}><strong>{label}:</strong> {value}</p>
}
export default KeyValueText;