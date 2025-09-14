import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

interface AuthError extends Error {
  response?: {
    data: {
      message: string;
    };
  };
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Password validation rules
  const isMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasUpperCase = /[A-Z]/.test(formData.password);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Please enter your first name";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Please enter your last name";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Please enter a password";
    } else if (!isMinLength || !hasNumber || !hasUpperCase) {
      newErrors.password = "Password does not meet the requirements";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await register(formData);
        // Navigation will be handled by the protected route logic
      } catch (error: unknown) {
        console.error('Registration error:', error);
        
        let errorMessage = 'Registration failed. Please try again.';
        
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

  const handleInputChange = (field: keyof RegisterFormData, value: string): void => {
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
        Register
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
          <label style={labelStyle}>First name</label>
          <input
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            style={inputStyle(!!errors.firstName)}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p style={errorTextStyle}>{errors.firstName}</p>
          )}
        </div>
        
        <div style={fieldStyle}>
          <label style={labelStyle}>Last name</label>
          <input
            type="text"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            style={inputStyle(!!errors.lastName)}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p style={errorTextStyle}>{errors.lastName}</p>
          )}
        </div>
        
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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '8px' 
          }}>
            <label style={labelStyle}>Password</label>
            <button
              type="button"
              onClick={() => setShowPasswordRules(!showPasswordRules)}
              style={{
                fontSize: '12px',
                color: '#0E8AC8',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0'
              }}
              disabled={isLoading}
            >
              Show requirements
            </button>
          </div>
          
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
          
          {showPasswordRules && (
            <div style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#1e40af', marginBottom: '8px', margin: '0 0 8px 0' }}>
                Password requirements:
              </p>
              <div style={{ fontSize: '12px' }}>
                <p style={{ color: isMinLength ? '#16a34a' : '#6b7280', margin: '4px 0' }}>
                  • At least 8 characters {isMinLength && "✓"}
                </p>
                <p style={{ color: hasNumber ? '#16a34a' : '#6b7280', margin: '4px 0' }}>
                  • At least 1 number {hasNumber && "✓"}
                </p>
                <p style={{ color: hasUpperCase ? '#16a34a' : '#6b7280', margin: '4px 0' }}>
                  • At least 1 uppercase letter {hasUpperCase && "✓"}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div style={fieldStyle}>
          <label style={labelStyle}>Confirm Password</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              style={inputStyle(!!errors.confirmPassword)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={eyeButtonStyle}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={errorTextStyle}>{errors.confirmPassword}</p>
          )}
        </div>
        
        <div style={{ textAlign: 'left', color: '#000', marginBottom: '16px' }}>
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
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
            Log In
          </button>
        </div>
        
        <button
          type="button"
          onClick={handleSubmit}
          style={submitButtonStyle}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </div>
    </>
  );
}