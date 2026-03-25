import { isAxiosError } from "axios";
import { useState, type SubmitEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../validations/auth";

type LoginPageProps = {
  onLoginSuccess?: () => void;
};

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      await login(payload.email, payload.password);
    },
    onSuccess: () => {
      onLoginSuccess?.();
    },
    
  });

  const handleLogin = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({
      email,
      password,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid login form data.");
      return;
    }

    loginMutation.mutate(validation.data);
  };

  return (
    <section className="card">
      <h1>Login</h1>
      <form id="login-form" className="form" noValidate onSubmit={(event) => void handleLogin(event)}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="test@gmail.com"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="123456"
            required
          />
        </label>
        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
