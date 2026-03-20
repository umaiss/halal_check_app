// Auth
export interface LoginRequest {
    email: string;
    password: string;

}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

// User
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface UpdateUserRequest {
    id: string;
    name?: string;
    email?: string;
}

// Halal Check
export interface HalalCheckRequest {
    text: string;
    ingredients_hash: string;
    front_image?: string;
    back_image?: string;
    ingredients_image?: string;
}

export interface IngredientStatus {
    name?: string;
    ingredient?: string;
    status: 'halal' | 'haram' | 'doubtful' | 'mushbooh';
    reason?: string;
}

export interface HalalCheckResponse {
    overall_status?: 'halal' | 'haram' | 'doubtful' | 'mushbooh';
    reasoning?: string;
    ingredients_analysis?: IngredientStatus[];
}
