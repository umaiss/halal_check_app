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
        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        updateUserPoints: (state, action: PayloadAction<number>) => {
            if (state.user) {
                state.user.points = action.payload;
            }
        },
        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.user = null;
        },
    },
});

export const { setCredentials, updateUser, updateUserPoints, logout } = authSlice.actions;
export default authSlice.reducer;
