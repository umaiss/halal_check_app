import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../services/types";

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
}

const initialState: AuthState = {
    token: null,
    refreshToken: null,
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string; refreshToken?: string | null; user: User }>) => {
            state.token = action.payload.token;
            if (action.payload.refreshToken !== undefined) {
                state.refreshToken = action.payload.refreshToken;
            }
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.user = null;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
