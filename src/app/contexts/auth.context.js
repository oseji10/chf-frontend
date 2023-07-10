import { createContext } from 'react';

const initialState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
}

const AuthContext = createContext(initialState);

export default AuthContext;