import styles from './table.module.scss';

function Table(props) {
    const {headers, tableData} = props;
    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
            <thead>
                <tr>
                    <th>SN</th>
                    {headers && headers.map((header,index) => <th key={`h-${index}`}>{header.value}</th>)}
                </tr>
            </thead>
            <tbody>
                {tableData && tableData.map((data, index) => <tr key={index}>
                    <td>{++index}</td>
                    {Object.keys(data).map( dataKey => <td key={dataKey}>{data[dataKey]}</td>)}
                </tr>)
                }
            </tbody>
        </table>
        </div>

    )
}

export default Table;