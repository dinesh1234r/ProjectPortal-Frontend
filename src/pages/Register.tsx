
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { register } from "../services/authService";
import type { RegisterRequest } from "../types/auth";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const registerRequest: RegisterRequest = {
      name: name.trim(),
      email: email.trim(),
      password,
      role: "Employee",
    };

    try {
      await register(registerRequest);

      setSuccessMessage(
        "Your account has been created successfully. You can now log in."
      );

      setName("");
      setEmail("");
      setPassword("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        if (typeof responseData === "string") {
          setErrorMessage(responseData);
        } else if (responseData?.errors) {
          const validationErrors = Object.values(
            responseData.errors as Record<string, string[]>
          ).flat();

          setErrorMessage(
            validationErrors[0] ?? "Please check your input."
          );
        } else {
          setErrorMessage(
            responseData?.title ??
              "Registration failed. Please try again."
          );
        }
      } else {
        setErrorMessage(
          "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-header">
          <h1>ProjectPortal</h1>
          <h2>Create your account</h2>
          <p>Get started by creating your ProjectPortal account.</p>
        </div>

        {errorMessage && (
          <div className="register-message register-error" role="alert">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            className="register-message register-success"
            role="status"
          >
            {successMessage}
            <p>
              <Link to="/login">Continue to login</Link>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              maxLength={101}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="register-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              maxLength={101}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="register-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              disabled={isSubmitting}
            />
            <small>Use at least 8 characters.</small>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="register-button"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
