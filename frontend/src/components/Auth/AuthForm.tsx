import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthFormType = "login" | "register";

export default function AuthForm() {
  const [formType, setFormType] = useState<AuthFormType>("login");

  const containerStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    margin: 0,
    overflow: 'auto'
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '384px',
    maxWidth: '100%'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {formType === "login" ? (
          <LoginForm onSwitchToRegister={() => setFormType("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setFormType("login")} />
        )}
      </div>
    </div>
  );
}