import { ADD_NEW_POPUP, DISMISS_POPUP } from "../action.types";

const initial_state=[]

  const popupReducer = (state = initial_state, action) => {
    switch (action.type) {
        case ADD_NEW_POPUP: 
            return [...state,action.popup]

        case DISMISS_POPUP: {
            return state.filter(popup => popup.id !== action.popup_id);
        }
            
        default:
            return state;
    }
}

export default popupReducer;
