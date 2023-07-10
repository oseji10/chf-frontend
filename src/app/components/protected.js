import React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route } from 'react-router'


/*  SINCE YOU ALREADY HAVE ProtectedRoute COMPONENT, 
*   LET ME JUST CREATE THIS   
 */

function Protected(props) {
    return (
        (props.user && <Route path={props.path}> {props.childern} </Route>) || <Redirect to='/login' />

    )
}

const mapStateToProps = state => {
    return {
        user: state.auth.user,
    }
}

export default connect(mapStateToProps)(Protected);