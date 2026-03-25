import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import "./App.css";

function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleHeaderAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate("/login");
      return;
    }

    navigate("/login");
  };

  return (
    <AppRoutes isAuthenticated={isAuthenticated} onHeaderAuthClick={handleHeaderAuthClick} />
  );
}

export default App;
