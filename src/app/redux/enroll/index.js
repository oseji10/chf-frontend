import { CAP_ID_CHANGED, IS_ON_CAP_OPTION_SELECTED, LOAD_CAP_USER_TO_STATE, LOAD_NEW_USER_TO_STATE, LOAD_REGISTRATION_FORM_DATA } from "../action.types";

const initial_state = {
    is_on_cap: null,
    cap_id: null, 
    cap_user: null,
    coes: [],
    states: [],
    lgas: [],
    identification_documents: [],
}


export const enrollmentReducer = (state = initial_state, action) => {
    switch (action.type) {
        case IS_ON_CAP_OPTION_SELECTED:{
            return {
                ...state,
                is_on_cap: action.is_on_cap,
                cap_id: !action.is_on_cap ? null : state.cap_id,
                cap_user: !action.is_on_cap ? null : state.cap_user,
            }
        }
        case CAP_ID_CHANGED: {
            return {
                ...state,
                cap_id: action.cap_id,
            }
        }
        case LOAD_CAP_USER_TO_STATE: {
            return {
                ...state,
                cap_user: action.cap_user
            }
        }
        case LOAD_REGISTRATION_FORM_DATA:{
            return {
                ...state,
                coes: action.data.coes,
                identification_documents: action.data.identification_documents,
            }
        }
        case LOAD_NEW_USER_TO_STATE: {
            return {
                ...state,
                cap_user: action.user
            }
        }
    
        default:
            return state;
    }
}
