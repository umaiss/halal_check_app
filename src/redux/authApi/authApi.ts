import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../services/baseQuery";
import { LoginRequest, RegisterRequest, AuthResponse, User } from "../services/types";
import { API_ENDPOINTS } from "../../utils/constant";
import { updateUser } from "../slices/auth/authSlice";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: axiosBaseQuery({ baseUrl: "" }),
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: API_ENDPOINTS.LOGIN,
                method: "POST",
                data: credentials,
            }),
        }),
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (userData) => ({
                url: API_ENDPOINTS.REGISTER,
                method: "POST",
                data: userData,
            }),
        }),
        googleLogin: builder.mutation<AuthResponse, { idToken: string }>({
            query: (body) => ({
                url: "api/auth/google",
                method: "POST",
                data: body,
            }),
        }),
        appleLogin: builder.mutation<AuthResponse, { identityToken: string; name?: string; email?: string }>({
            query: (body) => ({
                url: "api/auth/apple",
                method: "POST",
                data: body,
            }),
        }),
        forgotPassword: builder.mutation<{ message: string; email: string }, { email: string }>({
            query: (body) => ({
                url: API_ENDPOINTS.FORGOT_PASSWORD,
                method: "POST",
                data: body,
            }),
        }),
        resetPassword: builder.mutation<{ message: string }, { email: string; code: string; password: string }>({
            query: (body) => ({
                url: API_ENDPOINTS.RESET_PASSWORD,
                method: "POST",
                data: body,
            }),
        }),
        deleteAccount: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: API_ENDPOINTS.DELETE_ACCOUNT,
                method: "DELETE",
            }),
        }),
        getProfile: builder.query<User, void>({
            query: () => ({
                url: "api/auth/me",
                method: "GET",
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(updateUser(data));
                } catch (err) {
                    console.error("Failed to fetch profile:", err);
                }
            }
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGoogleLoginMutation,
    useAppleLoginMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useDeleteAccountMutation,
    useGetProfileQuery,
} = authApi;
