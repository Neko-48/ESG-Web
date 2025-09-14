// Define ApiResponse interface directly in this file if not imported properly
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Custom error class for API errors
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.success = false;
  }
}

export const apiRequest = async <T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: Record<string, unknown>
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`Making ${method} request to: ${API_BASE_URL}${endpoint}`);
    if (data) {
      console.log('Request data:', { ...data, password: data.password ? '***' : undefined });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    let responseData: ApiResponse<T>;
    
    try {
      responseData = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response JSON:', parseError);
      throw new ApiError('Invalid response from server', response.status);
    }

    console.log('API Response:', {
      status: response.status,
      success: responseData.success,
      message: responseData.message
    });

    // Check if the response was successful
    if (!response.ok) {
      // Server returned an error status code
      const errorMessage = responseData.message || `HTTP Error ${response.status}`;
      throw new ApiError(errorMessage, response.status);
    }

    // Check if the API response indicates failure
    if (!responseData.success) {
      throw new ApiError(responseData.message || 'Request failed', response.status);
    }

    return responseData;

  } catch (error) {
    console.error('API request failed:', error);
    
    // If it's already an ApiError, re-throw it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors or other fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error: Unable to connect to server. Please check if the server is running.');
    }
    
    // Handle other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
};