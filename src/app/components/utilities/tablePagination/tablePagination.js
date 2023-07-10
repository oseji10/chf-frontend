import { green } from 'jest-matcher-utils/node_modules/chalk'
import React from 'react'
// import colors from './misc/_config.scss'

function TablePagination(props) {
    const styles = {
        pagination_links: {
            left: '0',
            boxShadow: 'none',
            width: '100%',
            display: 'table',
            overflowX: 'scroll'
        },
        link: {
            color: 'grey',
            padding: '5px',
            fontSize: '10pt',
            cursor: 'pointer'

        },
        active: {
            color: green,
        },
        active_link: {
            color: 'white',
            backgroundColor: 'green',
            padding: '5px',
            fontSize: '10pt',
        },
        per_page: {
            width: '40px',
            backgroundColor: '#888'
        }
    }

    const renderPageNumbers = () => {

        return Array.apply(null, Array(props.pagesCount)).map(function (_, index) {
            return <span
                key={index}
                onClick={() => props.onPageChange(index + 1)}
                // eslint-disable-next-line eqeqeq
                style={index + 1 == props.currentPage ? styles.active_link : styles.link}
            >{index + 1}</span>
        });

    }
    return (
        <tr style={styles.pagination_links}>
            <td colSpan='6'>
                {`page ${props.currentPage} of ${props.pagesCount}`}
            </td>
            <td colSpan='4' className='d-flex'>
                <select onChange={props.onPerPageChange} style={{ outline: 'none' }}>
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                </select>
                {
                    renderPageNumbers()
                }
                {props.links && <span style={{ display: 'inline-block ml-3' }}>
                    {/* OUTPUT PAGINATION FROM BACKEND */}
                    {/* {props.links.map((link, index) => 
                            
                            !isNaN(link.label) && <span 
                            // eslint-disable-next-line no-script-url
                            key={index}
                            onClick={() => props.onPageChange(link.label)}
                            // eslint-disable-next-line eqeqeq
                            style={link.label == props.currentPage ? styles.active_link : styles.link}
                            >{link.label}</span>
                    )} */}
                </span>}
            </td>
        </tr>
    )
}

export default TablePagination;