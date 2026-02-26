import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/slices/auth/authSlice";
import scanHistoryReducer from "../redux/slices/scanHistory/scanHistorySlice";
import { authApi } from "./authApi/authApi";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        scanHistory: scanHistoryReducer,
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
});

// Types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
