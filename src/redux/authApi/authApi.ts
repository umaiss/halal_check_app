import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../services/baseQuery";
import { LoginRequest, RegisterRequest, AuthResponse } from "../services/types";
import { API_ENDPOINTS, BASE_URL } from "../../utils/constant";

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
    }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
