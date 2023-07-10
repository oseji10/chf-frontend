import API from "../config/chfBackendApi"
import { LOGIN_SUCCESS, LOGOUT_SUCCESS, REFRESH_PROFILE, SET_PROFILE } from "./action.types"
import { loadSideMenu } from "./sidemenulist.action"
import { resetApplication } from "./application/application.action"

export const loadLoggedInUserToState = user => {
    localStorage.setItem('user', JSON.stringify(user))
    return {
        type: LOGIN_SUCCESS,
        user
    }
}

export const logUserIn = user => {
    return async dispatch => {
        dispatch(loadLoggedInUserToState(user))
        try {
            const res = await API.get('/api/uimenu');
            dispatch(loadSideMenu(user.permissions, res.data.data))
        } catch (e) {
        }
    }

}

export const refreshProfile = user => {
    return {
        type: REFRESH_PROFILE,
        user,
    }
}

export const performLogout = () => {
    return {
        type: LOGOUT_SUCCESS,
    }
}

export const logoutUser = () => {
    return async dispatch => {
        dispatch(performLogout())
        try {
            dispatch(resetApplication())
        } catch (e) {
        }
    }

}

export const setLoggedInUserProfile = profile => {
    let user = JSON.parse(localStorage.getItem("user"));
    user.user = profile;
    return {
        type: SET_PROFILE,
        user
    }
}