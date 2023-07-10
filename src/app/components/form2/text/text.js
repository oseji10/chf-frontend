import styles from './text.module.scss';

const Text = ({value, ...rest}) => {
    return <>
        <span {...rest} className={styles.text}>{value}</span>
    </>
}

export default Text;