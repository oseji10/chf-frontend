import styles from '../table.module.scss';

const CHFTable = ({children}) => {
    return <div className={styles.application_table}>
        <table className={[styles.table,'table table-responsive-sm'].join(' ')}>
            {children}
        </table>
    </div>
}

export default CHFTable;