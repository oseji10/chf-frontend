import {
  IS_FIRST_PATIENT_APPLICATION,
  SET_PATIENT_APPLICATIONS,
  SET_CURRENT_APPLICATION,
  RESET_APPLICATION,
} from "../action.types";

const initial_state = {
  is_first_patient_application: false,
  patientApplications: [],
  currentApplication: null,
};

const applicationReducer = (state = initial_state, action) => {
  //   console.log(action);
  switch (action.type) {
    case IS_FIRST_PATIENT_APPLICATION: {
      return {
        ...state,
        is_first_patient_application: true,
        patientApplications: action.patientApplications,
      };
    }

    case SET_PATIENT_APPLICATIONS: {
      //CHECK AND SET CURRENT APPLICATION
      const currentApplication = action.patientApplications.find(
        (currentApplication) =>
          currentApplication.applicationReview.status === "In Progress"
      );
      return {
        ...state,
        is_first_patient_application: false,
        currentApplication: currentApplication,
        patientApplications: action.patientApplications,
      };
    }

    case SET_CURRENT_APPLICATION: {
      //SET CURRENT APPLICATION
      return {
        ...state,
        is_first_patient_application: false,
        currentApplication: action.currentApplication,
      };
    }

    case RESET_APPLICATION: {
      return {
        ...initial_state,
      };
    }

    default:
      return state;
  }
};

export default applicationReducer;
