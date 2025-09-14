import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthForm from "./components/Auth/AuthForm";
import Dashboard from "./components/Dashboard/Dashboard";
import ProjectDetails from "./components/ProjectDetails/ProjectDetails";

// ProtectedRoute component - ไม่แสดงหน้าโหลด
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// PublicRoute component - ไม่แสดงหน้าโหลด
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthForm />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div
                style={{
                  minHeight: "100vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f9fafb",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "48px",
                      color: "#ef4444",
                      margin: "0 0 16px 0",
                    }}
                  >
                    404
                  </h1>
                  <p
                    style={{
                      fontSize: "18px",
                      color: "#6b7280",
                      margin: "0 0 24px 0",
                    }}
                  >
                    Page not found
                  </p>
                  <button
                    onClick={() => (window.location.href = "/dashboard")}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;