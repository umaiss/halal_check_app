
export const BaseUrl = `www.google.com`;
export const PhoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
export const EmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const NameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/

// export const BASE_URL = 'https://halal-check-backend-production.up.railway.app';
export const BASE_URL = 'https://api.scanbazar.com/';
// export const BASE_URL = 'http://192.168.4.50:3000';




export const API_ENDPOINTS = {
    LOGIN: "api/auth/login",
    REGISTER: "api/auth/signup",

    HALAL_CHECK: "api/check-halal",
    UPLOAD_IMAGES: "api/check-halal/upload-image",
    HISTORY: "api/check-halal/history",
};