import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "../utils/constant";
import { store } from "../redux/store";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // Increased timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = store.getState().auth?.token;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request details for debugging
        console.log('🚀 Axios Request:', {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            headers: config.headers,
            data: config.data,
        });

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Axios Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        });
        return response;
    },
    (error) => {
        // Enhanced error logging
        console.error('❌ Axios Response Error:', {
            message: error.message,
            code: error.code,
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
        });

        // Here you can refresh token if needed
        return Promise.reject(error);
    }
);

export default axiosInstance;
