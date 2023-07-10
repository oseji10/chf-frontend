import { useEffect } from 'react'
import { useState } from 'react'
import PageTitle from '../../../components/pageTitle/pageTitle'
import chfstyles from '../../chfadmin/chfadmin.module.scss'
import THead from '../../../components/table/thead/thead'
import API from '../../../config/chfBackendApi'
import { timestampToRegularTime } from '../../../utils/date.util'
import { Link, useRouteMatch } from 'react-router-dom'
const CommentList = props => {

    const url = useRouteMatch().url
    // console.log(match)


    const table_columns = [
        {
            column_name: "#",
        },
        {
            column_name: "Date"
        },
        {
            column_name: "Physician/Staff"
        },
        {
            column_name: "Hospital",
        },
        {
            column_name: ""
        }
    ]

    const initial_state = {
        comments: [],
        pagination: {
            currentPage: 1,
            pages: 1,
            links: [],
        }
    }

    const [state, setState] = useState(initial_state)

    useEffect(() => {
        loadComments();
    },[])

    const loadComments = async () => {
        try{
            const res = await API.get(`/api${url}`);
            console.log(res)
            setState(prevState => ({
                ...prevState,
                comments: res.data.data.data
            }));
        }catch(e){
            console.log(e.response)
        }
    }

    const renderComments = () => {
        return (
            state.comments && state.comments.map((comment, index) =>  <tr key={index}>
                <td>{index +1}</td>
                <td>{timestampToRegularTime(comment.created_at)}</td>
                <td>Chinedu Ukpe</td>
                <td>Federal Teaching Hospital Gombe</td>
                <td><Link to={`${url}/${comment.id}`} className='text-success'>Details</Link>
                </td>
            </tr> )
        )
    }

    return (<div className='container'>
        <PageTitle title='Comments' />
        <div className={chfstyles.application_table}>
            <table className='table table-responsive-sm'>
                <THead columns={table_columns} />
                <tbody>
                    {renderComments()}
                </tbody>
            </table>
        </div>
    </div>)
}

export default CommentList;