import { SET_NEW_USER, SET_ENROLLMENT_MSG, CLEAR_NEW_USER} from "./action.types";

const initial_state = {
    newUser: null,
    msg: null
}

const enrolReducer = (state = initial_state, action) => {
    switch (action.type) {
        case SET_NEW_USER:{
            return {
                ...state,
                newUser: action.user
            }
        }
    
        case SET_ENROLLMENT_MSG:{
            localStorage.removeItem('newUser');
            return {
                ...state,
                msg:action.msg
            }
        }

        case CLEAR_NEW_USER: {
            localStorage.removeItem('newUser');
            return {
                ...state,
                newUser: null
            }
        }
            
        default:
            return state;
    }
}

export default enrolReducer;