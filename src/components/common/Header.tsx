import { Link } from "react-router-dom";

type HeaderProps = {
  isAuthenticated: boolean;
  onAuthClick: () => void;
};

export function Header({ isAuthenticated, onAuthClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="brand">HRM Lite</div>
      <nav className="nav">
        <Link to="/" className="nav-link">
          Home
        </Link>
        {isAuthenticated ? (
          <Link to="/employees" className="nav-link">
            Employee
          </Link>
        ) : null}
        <button className="ghost-btn" onClick={onAuthClick}>
          {isAuthenticated ? "Logout" : "Login"}
        </button>
      </nav>
    </header>
  );
}
