import { useSelector } from "react-redux";
import { ADD_ALERT, ADD_NEW_ALERT, DISMISS_ALERT } from "./action.types";

export const addAlert = alert => {
    return {
        type: ADD_ALERT,
        alert,
    }
};

export const dismissAlert = alert_id => {
    return {
        type: DISMISS_ALERT,
        alert_id,
    }
}

export const propagateAlert = (prop_alert) => {

    const alert = {
        ...prop_alert,
        id: Math.floor(Math.random() * 5000),
    }
    return dispatch => {
        dispatch(addAlert(alert))
        setTimeout(() => dispatch(dismissAlert(alert.id)), prop_alert.timeout | 10000);
    }
}