import { useAuth } from "../hooks/useAuth";

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="card">
      <h1>Home</h1>
      <p className="welcome">{user ? `Hello ${user.name}` : "Hello"}</p>
    </section>
  );
}
