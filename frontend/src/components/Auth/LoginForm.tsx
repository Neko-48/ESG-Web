import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

interface AuthError extends Error {
  response?: {
    data: {
      message: string;
    };
  };
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Please enter your password";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await login(formData);
        // Navigation will be handled by the protected route logic
      } catch (error: unknown) {
        console.error('Login error:', error);
        
        let errorMessage = 'Login failed. Please try again.';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          const authError = error as AuthError;
          if (authError?.response?.data?.message) {
            errorMessage = authError.response.data.message;
          }
        }
        
        setErrors({ general: errorMessage });
      }
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px',
    border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: 'white',
    color: '#111827',
    boxSizing: 'border-box'
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '16px'
  };

  const eyeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px'
  };

  const errorTextStyle: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '4px',
    margin: '4px 0 0 0'
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '500',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    backgroundColor: isLoading ? '#9ca3af' : '#A9DEF9',
    color: 'black',
    opacity: isLoading ? 0.7 : 1
  };

  return (
    <>
      <h2 style={{ 
        fontSize: '30px', 
        fontWeight: '600', 
        textAlign: 'center', 
        color: '#1f2937', 
        marginBottom: '24px',
        margin: '0 0 24px 0'
      }}>
        Log In
      </h2>
      
      {errors.general && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          {errors.general}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            style={inputStyle(!!errors.email)}
            disabled={isLoading}
          />
          {errors.email && (
            <p style={errorTextStyle}>{errors.email}</p>
          )}
        </div>
        
        <div style={fieldStyle}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              style={inputStyle(!!errors.password)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeButtonStyle}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p style={errorTextStyle}>{errors.password}</p>
          )}
        </div>
        
        <div style={{ textAlign: 'left', color: '#000', marginBottom: '16px'}}>
          <span>Not registered? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#0E8AC8',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0',
              fontSize: 'inherit'
            }}
            disabled={isLoading}
          >
            Register
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          style={submitButtonStyle}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    </>
  );
}