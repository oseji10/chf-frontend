import { useDispatch } from "react-redux";
import { ADD_ALERT, ADD_NEW_ALERT, DISMISS_ALERT } from "./action.types";

const initial_state = [

]

const alertReducer = (state = initial_state, action) => {
    switch (action.type) {
        case ADD_ALERT: 
            return [...state,action.alert]

        case DISMISS_ALERT: {
            return state.filter(alert => alert.id !== action.alert_id);
        }
            
        default:
            return state;
    }
}

export default alertReducer;