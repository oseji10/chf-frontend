import React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route } from 'react-router'
import { canActivate } from '../utils/menu.utils'
import Protected from './protected'


function AuthorizedOnlyRoute(props) {
    const {user, requiredPermission, path, children} = props
    return (
        <Protected path={path}>
            {
                (user && canActivate(user.permissions, requiredPermission) 
                && 
                <Route {...props} path={path} >
                    {children}
                </Route> ) || <Redirect to='/dashboard' />
            }
        </Protected>
    )
}

const mapStateToProps = state => {
    return {
        user: state.auth.user,
    }
}

export default connect(mapStateToProps)(AuthorizedOnlyRoute)