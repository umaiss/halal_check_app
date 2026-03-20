import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../services/baseQuery";
import { HalalCheckRequest, HalalCheckResponse } from "../services/types";
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
    }),
});

export const { useHalalCheckMutation } = scanApi;
