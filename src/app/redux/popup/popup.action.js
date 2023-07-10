import { ADD_NEW_POPUP, DISMISS_POPUP } from "../action.types";

export const addPopup = popup => {
    return {
        type: ADD_NEW_POPUP,
        popup,
    }
};

export const dismissPopup = popup_id => {
    return {
        type: DISMISS_POPUP,
        popup_id,
    }
}

export const propagatePopup = (popup_obj) => {

    const popup = {
        ...popup_obj,
        id: Math.floor(Math.random() * 5000),
    }
    return dispatch => {
        dispatch(addPopup(popup))
        setTimeout(() => dispatch(dismissPopup(popup.id)), popup_obj.timeout | 10000);
    }
}