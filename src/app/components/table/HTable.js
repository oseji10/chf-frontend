import styles from './table.module.scss';

function HTable(props) {
  
    return (
        <div className={styles.wrapper}>
        <table className={styles.table}>
            {props.children}
        </table>
        </div>
    )
}

export default HTable;