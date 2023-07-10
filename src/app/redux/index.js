import { combineReducers } from "redux";
import alertReducer from "./alertReducer";
import authReducer from "./auth.reducer";
import enrolReducer from "./enrol.reducer";
import { enrollmentReducer } from "./enroll";
import sideMenuReducer from "./sidemenulist.reducer";
import applicationReducer from "./application/application.reducer";
import popupReducer from "./popup/popup.reducer";
import { pageSpinnerReducer } from "./ui/page-spinner/pageSpinner.reducer";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/auth.slice";

const rootReducer = combineReducers({
    auth: authReducer,
    sideMenuList: sideMenuReducer,
    enrol: enrolReducer,
    enroll: enrollmentReducer,
    alerts: alertReducer,
    application: applicationReducer,
    popups: popupReducer,
    loggedInUser: null,
    isPageSpinnerVisible: pageSpinnerReducer,
});

export const storeConfig = configureStore({
    reducer: {
        auth: authSlice,
    }
})

export default rootReducer;