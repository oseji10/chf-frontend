import API from "../../config/chfBackendApi";
import { IS_FIRST_PATIENT_APPLICATION, SET_PATIENT_APPLICATIONS,  SET_CURRENT_APPLICATION, RESET_APPLICATION } from "../action.types";

export const setFirstApplication = applicationData => {
    // console.log('Dispatching first...')
    return {
        type: IS_FIRST_PATIENT_APPLICATION,
        patientApplications: applicationData
    }
}

export const setPatientApplications = applicationData => {
    return {
        type: SET_PATIENT_APPLICATIONS,
        patientApplications: applicationData
    }
}

export const setCurrentApplication = applicationData => {
    return {
        type: SET_CURRENT_APPLICATION,
        currentApplication: applicationData
    }
}

export const resetApplication = () => {
    return {
        type: RESET_APPLICATION,
    }
}

export const handleSetCurrentApplication = (currentApplication)=>{
    console.log(currentApplication)
    return async dispatch =>{
         dispatch(setCurrentApplication(currentApplication));
    }    
}

export const getUserApplications = (user_id) => {
    // console.log('Getting user...')
    return async dispatch => {
        try{
            const res = await API.get(`/api/application/reviews/${user_id}`);

            // A USER WITH FIRST APPLICATION WILL HAVE 0 NUMBER OF APPLICATION REVIEWS
            if(!res.data.data.length){
                // console.log('User is first...')
                return dispatch(setFirstApplication(res.data.data));
            }
              // SET ALL APPLICATIONS
             dispatch(setPatientApplications(res.data.data));
        }catch(e){
        }
    }
    
}
