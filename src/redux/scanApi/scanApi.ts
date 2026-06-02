import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../services/baseQuery";
import { HalalCheckRequest, HalalCheckResponse, ImproveCheckRequest } from "../services/types";
import { API_ENDPOINTS } from "../../utils/constant";

export const scanApi = createApi({
    reducerPath: "scanApi",
    baseQuery: axiosBaseQuery({ baseUrl: "" }),
    endpoints: (builder) => ({
        halalCheck: builder.mutation<HalalCheckResponse, HalalCheckRequest>({
            query: (halalCheckData) => ({
                url: API_ENDPOINTS.HALAL_CHECK,
                method: "POST",
                data: halalCheckData,
            }),
        }),
        improveCheck: builder.mutation<any, { id: number; data: ImproveCheckRequest }>({
            query: ({ id, data }) => ({
                url: `${API_ENDPOINTS.HALAL_CHECK}/${id}/improve`,
                method: "PATCH",
                data,
            }),
        }),
        getHistory: builder.query<any, void>({
            query: () => ({
                url: API_ENDPOINTS.HISTORY,
                method: "GET",
            }),
        }),
        searchProducts: builder.query<any[], string>({
            query: (searchQuery) => ({
                url: API_ENDPOINTS.SEARCH_PRODUCTS,
                method: "GET",
                params: { q: searchQuery },
            }),
        }),
    }),
});

export const { 
    useHalalCheckMutation, 
    useGetHistoryQuery, 
    useImproveCheckMutation,
    useSearchProductsQuery,
    useLazySearchProductsQuery,
} = scanApi;
