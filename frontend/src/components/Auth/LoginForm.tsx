import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    
    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    }
    
    return newErrors;
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log("Login successful", formData);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '12px',
    border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: 'white',
    color: '#111827',
    boxSizing: 'border-box' as const
  });

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  };

  const fieldStyle = {
    marginBottom: '16px'
  };

  const eyeButtonStyle = {
    position: 'absolute' as const,
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

  const errorTextStyle = {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '4px',
    margin: '4px 0 0 0'
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
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            style={inputStyle(!!errors.email)}
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeButtonStyle}
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
          >
            Register
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
            backgroundColor: '#A9DEF9',
            color: 'black'
          }}
        >
          Log In
        </button>
      </div>
    </>
  );
}