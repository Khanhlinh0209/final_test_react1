import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";
import { EmployeesPage } from "../pages/EmployeesPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";

type AppRoutesProps = {
  isAuthenticated: boolean;
  onHeaderAuthClick: () => void;
};

export function AppRoutes({ isAuthenticated, onHeaderAuthClick }: AppRoutesProps) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<AppLayout isAuthenticated={isAuthenticated} onAuthClick={onHeaderAuthClick} />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees"
          element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={() => navigate("/")} />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Route>
    </Routes>
  );
}
