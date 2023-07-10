import { SET_NEW_USER, SET_ENROLLMENT_MSG, CLEAR_NEW_USER } from "./action.types"
import { CAP_IMAS_BACKEND_HOST } from "../config/api-config";
import { formatErrors } from "../utils/error.utils";
import axios from "axios";

export const loadNewUserToState = user => {
    localStorage.setItem('newUser',JSON.stringify(user));
    return {
        type: SET_NEW_USER,
        user
    }
}

export const loadEnrolMsgToState = msg => {
    return {
        type: SET_ENROLLMENT_MSG,
        msg
    }
}

export const clearNewUser= () => {
    return {
        type: CLEAR_NEW_USER,
    }
}

export const loadUserOnCapInfo = capId => {
    return async dispatch => {
        try{
            const res = await axios.get(`${CAP_IMAS_BACKEND_HOST}/api/user/${capId}`);
            if(!res){
                dispatch(loadEnrolMsgToState({ message: "Invalid CAP account details provided", variant: "danger" }));
                return true;
            }
            dispatch(loadNewUserToState(res.data));
        }catch(e){
            
            dispatch(loadEnrolMsgToState({ message: formatErrors(e) || "Unable to verify CAP account", variant: "danger" }))
        }
    }
    
}

export const loadUserFullApplicationToState = newuser => {
    return async dispatch => {
        try{  
            dispatch(loadNewUserToState(newuser));
        }catch(e){
        }
    }
}




