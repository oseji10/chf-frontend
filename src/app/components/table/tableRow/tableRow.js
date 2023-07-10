import styles from '../table.module.scss';

const TableRow = ({onRowClick=() => null,variant, children, ...rest}) => {
    return <tr {...rest} className={[styles[variant]].join(' ')} onClick={onRowClick}>
        {children}
    </tr>
}

export default TableRow;