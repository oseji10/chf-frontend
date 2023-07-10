import { connect } from 'react-redux'
import { canActivate } from '../utils/menu.utils'


function AuthorizedOnlyComponent(props) {
    const {user, requiredPermission, children, showError} = props

    return ( user && canActivate(user.permissions, requiredPermission) 
                            && 
                            children )
                   
}

const mapStateToProps = state => {
    return {
        user: state.auth.user,
    }
}

export default connect(mapStateToProps)(AuthorizedOnlyComponent);