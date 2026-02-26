import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../services/baseQuery";
import { LoginRequest, RegisterRequest, AuthResponse, HalalCheckRequest, HalalCheckResponse } from "../services/types";
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
        halalCheck: builder.mutation<HalalCheckResponse, HalalCheckRequest>({
            query: (halalCheckData) => ({
                url: API_ENDPOINTS.HALAL_CHECK,
                method: "POST",
                data: halalCheckData,
            }),
        }),
    }),
});

export const { useLoginMutation, useHalalCheckMutation, useRegisterMutation } = authApi;
