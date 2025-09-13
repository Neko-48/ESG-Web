import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
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
      newErrors.firstName = "กรุณากรอกชื่อ";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "กรุณากรอกนามสกุล";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    
    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    } else if (!isMinLength || !hasNumber || !hasUpperCase) {
      newErrors.password = "รหัสผ่านไม่ตรงตามเงื่อนไข";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }
    
    return newErrors;
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log("Registration successful", formData);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
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
        Register
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>First name</label>
          <input
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            style={inputStyle(!!errors.firstName)}
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
            >
              Show info
            </button>
          </div>
          
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
                  • อย่างน้อย 8 ตัวอักษร {isMinLength && "✓"}
                </p>
                <p style={{ color: hasNumber ? '#16a34a' : '#6b7280', margin: '4px 0' }}>
                  • ต้องมีตัวเลขอย่างน้อย 1 ตัว {hasNumber && "✓"}
                </p>
                <p style={{ color: hasUpperCase ? '#16a34a' : '#6b7280', margin: '4px 0' }}>
                  • ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว {hasUpperCase && "✓"}
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
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={eyeButtonStyle}
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
          >
            Log In
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
          Register
        </button>
      </div>
    </>
  );
}