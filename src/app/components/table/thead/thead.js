const THead = props => {
    return <thead>
        <tr>
        {props.columns.map((column, index) => <th key={index} colSpan={column.colSpan || 1}>
            {column.column_name}
        </th>)}
        </tr>
    </thead>
}

export default THead;