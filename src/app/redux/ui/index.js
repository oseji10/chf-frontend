import { combineReducers } from "redux";
import { pageLoaderReducer } from "./pageLoader.reducer";


const uiReducer = combineReducers({
    pageLoading: pageLoaderReducer,
});

export default uiReducer;