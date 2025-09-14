// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// Auth related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    user_id: number;
    username: string;
    email?: string;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user_id: number;
  username: string;
  email: string;
}

// Error types
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}