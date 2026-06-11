import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../services/baseQuery";
import { HalalCheckRequest, HalalCheckResponse, ImproveCheckRequest } from "../services/types";
import { API_ENDPOINTS } from "../../utils/constant";
import { updateUserPoints } from "../slices/auth/authSlice";

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
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data && typeof data.updated_points === 'number') {
                        dispatch(updateUserPoints(data.updated_points));
                    }
                } catch (err) {
                    console.error("Failed to update points from scan response:", err);
                }
            }
        }),
        improveCheck: builder.mutation<any, { id: number; data: ImproveCheckRequest }>({
            query: ({ id, data }) => ({
                url: `${API_ENDPOINTS.HALAL_CHECK}/${id}/improve`,
                method: "PATCH",
                data,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data && typeof data.updated_points === 'number') {
                        dispatch(updateUserPoints(data.updated_points));
                    }
                } catch (err) {
                    console.error("Failed to update points from improve response:", err);
                }
            }
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
