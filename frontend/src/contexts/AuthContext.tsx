import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User, LoginFormData, RegisterFormData, AuthContextType } from '../types/authType';
import type { ApiResponse } from '../types/apiType';
import { apiRequest } from '../services/apiService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

interface AuthError extends Error {
  success?: boolean;
  response?: {
    data: {
      message: string;
    };
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const checkExistingAuth = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          const user = JSON.parse(userData) as User;
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkExistingAuth();
  }, []);

  const login = async (credentials: LoginFormData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiRequest<{ user: User; token: string }>('POST', '/auth/login', credentials as Record<string, unknown>);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: unknown) {
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Handle different error types
      const authError = error as AuthError | ApiResponse<never>;
      
      if ('success' in authError && authError.success === false) {
        // This is an API response error
        throw new Error(authError.message || 'Login failed');
      } else if ('response' in authError && authError.response?.data) {
        // This is an axios error with response data
        throw new Error(authError.response.data.message || 'Login failed');
      } else if (authError instanceof Error) {
        // This is a regular Error object
        throw authError;
      } else {
        // Unknown error type
        throw new Error('An unexpected error occurred during login');
      }
    }
  };

  const register = async (userData: RegisterFormData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = userData;
      const response = await apiRequest<{ user: User; token: string }>('POST', '/auth/register', registerData as Record<string, unknown>);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: unknown) {
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Handle different error types
      const authError = error as AuthError | ApiResponse<never>;
      
      if ('success' in authError && authError.success === false) {
        // This is an API response error
        throw new Error(authError.message || 'Registration failed');
      } else if ('response' in authError && authError.response?.data) {
        // This is an axios error with response data
        throw new Error(authError.response.data.message || 'Registration failed');
      } else if (authError instanceof Error) {
        // This is a regular Error object
        throw authError;
      } else {
        // Unknown error type
        throw new Error('An unexpected error occurred during registration');
      }
    }
  };

  const logout = (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    dispatch({ type: 'LOGOUT' });
  };

  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};