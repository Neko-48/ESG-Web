export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  token: string;
}