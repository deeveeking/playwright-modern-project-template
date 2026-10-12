export interface UserAddressRequest {
    street?: string;
    house_number?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
}

export interface UserAddressResponse {
    street: string;
    house_number: string | null;
    city: string;
    state: string | null;
    country: string;
    postal_code: string | null;
}

export interface UserResponse {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    address?: UserAddressResponse;
    phone?: string | null;
    dob?: string;
    provider?: string | null;
    totp_enabled?: boolean;
    enabled?: boolean;
    failed_login_attempts?: number | null;
    created_at?: string;
}

export interface RegisterUserRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    address?: UserAddressRequest;
    phone?: string;
    dob?: string;
}

export interface RegisterUserResponse extends UserResponse {}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface LoginUserResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface ChangeUserPasswordRequest {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export interface ChangeUserPasswordResponse {
    success: boolean;
}

export interface MeUserResponse extends UserResponse {}

export interface DeleteUserRequest {
    userId: string;
}

export type DeleteUserResponse = void;

export interface LogoutUserResponse {
    message: string;
}

export interface SearchUserRequest {
    q: string;
    page?: number;
}

export type SearchUserResponse = UserResponse[];

// Swagger uses the same request schema for registration and PUT /users/{userId}.
export interface UpdateUserRequest extends RegisterUserRequest {}

export interface UpdateUserResponse {
    success: boolean;
}
