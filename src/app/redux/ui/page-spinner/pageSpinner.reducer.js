import { TOGGLE_PAGE_SPINNER } from "../../action.types";


const initial_state = false;

export const pageSpinnerReducer = (state = initial_state, action) => {
    switch(action.type){
        case TOGGLE_PAGE_SPINNER: {
            return action.payload;
        }
        default: 
            return state;
    }
} 