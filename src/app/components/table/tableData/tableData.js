const TableData = ({children, data, ...rest}) => {
    return <td {...rest}>
        {data}
        {children}
    </td>
}

export default TableData;

