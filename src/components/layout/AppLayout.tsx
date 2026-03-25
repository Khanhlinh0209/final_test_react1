import { Outlet } from "react-router-dom";
import { Header } from "../common/Header";

type AppLayoutProps = {
  isAuthenticated: boolean;
  onAuthClick: () => void;
};

export function AppLayout({ isAuthenticated, onAuthClick }: AppLayoutProps) {
  return (
    <div className="page">
      <Header isAuthenticated={isAuthenticated} onAuthClick={onAuthClick} />
      <main className="app">
        <Outlet />
      </main>
    </div>
  );
}
