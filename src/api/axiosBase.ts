import axios, { AxiosInstance } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../utils/constant";
import { store } from "../redux/store";
import ASYNC_KEYS from "../utils/async-keys";
import { logout, setCredentials } from "../redux/slices/auth/authSlice";

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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Axios Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Enhanced error logging
        console.error('❌ Axios Response Error:', {
            message: error.message,
            code: error.code,
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
        });

        // Check if error is 401 and we haven't retried this request yet
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            
            // If the 401 happened on the refresh endpoint itself, do not retry
            if (originalRequest.url?.includes('auth/refresh')) {
                store.dispatch(logout());
                await AsyncStorage.removeItem(ASYNC_KEYS.USER_TOKEN);
                await AsyncStorage.removeItem(ASYNC_KEYS.USER_REFRESH_TOKEN);
                await AsyncStorage.removeItem("UserInfo");
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const state = store.getState();
                const refreshToken = state.auth?.refreshToken || await AsyncStorage.getItem(ASYNC_KEYS.USER_REFRESH_TOKEN);

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call refresh endpoint directly using raw axios (to avoid this interceptor trigger)
                const refreshResponse = await axios.post(`${BASE_URL}api/auth/refresh`, {
                    refresh_token: refreshToken
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const { access_token, refresh_token, user } = refreshResponse.data;

                // Store new credentials
                await AsyncStorage.setItem(ASYNC_KEYS.USER_TOKEN, access_token);
                if (refresh_token) {
                    await AsyncStorage.setItem(ASYNC_KEYS.USER_REFRESH_TOKEN, refresh_token);
                }
                if (user) {
                    await AsyncStorage.setItem("UserInfo", JSON.stringify(user));
                }

                store.dispatch(setCredentials({
                    token: access_token,
                    refreshToken: refresh_token || refreshToken,
                    user: user || state.auth?.user
                }));

                // Process queued requests
                processQueue(null, access_token);

                // Retry original request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Clear credentials and logout
                store.dispatch(logout());
                await AsyncStorage.removeItem(ASYNC_KEYS.USER_TOKEN);
                await AsyncStorage.removeItem(ASYNC_KEYS.USER_REFRESH_TOKEN);
                await AsyncStorage.removeItem("UserInfo");

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
