import { CAP_ID_CHANGED, IS_ON_CAP_OPTION_SELECTED, LOAD_CAP_USER_TO_STATE, LOAD_NEW_USER_TO_STATE, LOAD_REGISTRATION_FORM_DATA } from "../action.types"

export const changeIsOnCapOption = is_on_cap => {
    return {
        type: IS_ON_CAP_OPTION_SELECTED,
        is_on_cap,
    }
}

export const handleCapIDChange = e => {
    return {
        type: CAP_ID_CHANGED,
        cap_id: e.target.value
    }
}

export const handleLoadCapUserToState = cap_user => {
    return {
        type: LOAD_CAP_USER_TO_STATE,
        cap_user,
    }
}

export const handleLoadRegistrationFormData = data => {
    return {
        type: LOAD_REGISTRATION_FORM_DATA,
        data,
    }
}

export const loadNewUserToReduxState = user => {
    console.log("user in load new user action ", user)
    return {
        type: LOAD_NEW_USER_TO_STATE,
        user,
    }
}