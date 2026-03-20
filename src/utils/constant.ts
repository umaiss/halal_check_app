
export const BaseUrl = `www.google.com`;
export const PhoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
export const EmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const NameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/

// export const BASE_URL = 'https://halal-check-backend-production.up.railway.app';
export const BASE_URL = 'http://192.168.18.111:3000/';
// export const BASE_URL = 'http://192.168.4.50:3000';


export const SUPABASE_URL = 'https://sletzrzevdlipasppsms.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_DmQMMgGA3Z141BsF75c0HQ_imYafzmT';

export const API_ENDPOINTS = {
    LOGIN: "api/auth/login",
    REGISTER: "api/auth/signup",

    // PRODUCTS: "/products",
    HALAL_CHECK: "api/check-halal",
};