import { createContext, useReducer, useEffect } from "react";
// import { useHistory } from "react-router-dom";
// import API from "./../config/chfBackendApi";


export const AppContext = createContext();

// reducer function
function reducer(state, action) {

  // create a copy of your state
  let stateCopy = { ...state };

  // set the name on our state copy to action
  stateCopy.action = action;

  if(action.type==="START_ENROL"){
    stateCopy.user = action.payload;
    localStorage.setItem("user",JSON.stringify(action.payload));
  }

  if(action.type==="RESET_ENROL"){
    localStorage.setItem("user",null);
    stateCopy.user = action.payload;
  }

  if (action.type === "ENROL_COMPLETE") {
    stateCopy.user.patient = action.payload;
    localStorage.setItem("user",JSON.stringify(action.payload));
  }

  return stateCopy;

}

const initialState = {
  isLoggedIn: false,
  user: null
};
 
function StateProvider({ children }) {
  const [appstate, dispatch] = useReducer(reducer, initialState);

  const contextObject = {
    state: appstate,
    dispatch: dispatch,
  };

  useEffect(() => {
    try{
      const user = JSON.parse(localStorage.getItem("user"));
      if(user){
        dispatch({
          type: "LOGIN",
          payload: user
      });
      }
    }catch(e){

    }
  }, [])

  return (
    <AppContext.Provider value={contextObject}>{children}</AppContext.Provider>
  );
}

export default StateProvider;
