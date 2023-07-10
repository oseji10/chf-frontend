import { HIDE_PAGE_LOADER } from "../action.types";

const initial_state = true;

export const pageLoaderReducer = (state = initial_state, action) => {
    switch (action.type) {
        case HIDE_PAGE_LOADER:{
            return false
        }
    
        default:
            return state;
    }
}