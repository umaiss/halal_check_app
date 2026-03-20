import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/slices/auth/authSlice";
import scanHistoryReducer from "../redux/slices/scanHistory/scanHistorySlice";
import { authApi } from "./authApi/authApi";
import { scanApi } from "./scanApi/scanApi";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        scanHistory: scanHistoryReducer,
        [authApi.reducerPath]: authApi.reducer,
        [scanApi.reducerPath]: scanApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(scanApi.middleware)
});

// Types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
