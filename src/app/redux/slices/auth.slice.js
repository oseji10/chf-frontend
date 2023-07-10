import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
}
const authSlice = createSlice({
    name: 'auth-slice',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {

        },
        logoutSuccess: (state, action) => {

        }
    }
})

export const { loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;