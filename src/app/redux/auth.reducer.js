import {
  LOGIN_FAILED,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  REFRESH_PROFILE,
  SET_PROFILE,
} from "./action.types";

const initial_state = {
  is_authenticated: false,
  user: null,
};

const authReducer = (state = initial_state, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS: {
      return {
        ...state,
        is_authenticated: true,
        user: action.user,
      };
    }
    case LOGIN_FAILED: {
      return {
        ...initial_state,
      };
    }
    case LOGOUT_SUCCESS: {
      localStorage.removeItem("user");
      return {
        ...initial_state,
      };
    }

    case SET_PROFILE: {
      localStorage.setItem("user", JSON.stringify(action.user));
      return {
        ...state,
        user: action.user,
      };
    }

    case REFRESH_PROFILE: {
      return {
        ...state,
        is_authenticated: true,
        user: action.user,
      }
    }

    default:
      return state;
  }
};

export default authReducer;
