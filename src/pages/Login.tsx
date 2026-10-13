import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import type { LoginRequest } from "../types/auth";
import { login } from "../services/authService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const successMessage = (
    location.state as { message?: string } | null
  )?.message;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const request: LoginRequest = {
      email: email.trim(),
      password,
    };

    try {
      const result = await login(request);

      navigate(
        result.mustChangePassword
          ? "/change-password"
          : "/dashboard",
        { replace: true },
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setErrorMessage("Invalid email or password.");
        } else if (!error.response) {
          setErrorMessage(
            "Unable to connect to the server. Please try again.",
          );
        } else {
          setErrorMessage("Login failed. Please try again later.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <header className="login-header">
          <h1>ProjectPortal</h1>
          <h2>Welcome back</h2>
          <p>Sign in to manage your projects and tasks.</p>
        </header>

        {successMessage && (
          <div className="login-success" role="status">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="login-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          Need an account? Contact your administrator.
        </p>
      </section>
    </main>
  );
}

export default Login;