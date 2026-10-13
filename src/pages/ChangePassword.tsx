import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { changePassword, logout } from "../services/authService";
import "./Login.css";

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("The new passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Use at least 8 characters for your new password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      logout();
      navigate("/login", {
        replace: true,
        state: {
          message: "Password changed successfully. Please log in with your new password.",
        },
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        setErrorMessage(
          typeof data === "string"
            ? data
            : data?.message ?? "Unable to change your password.",
        );
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
          <h2>Change your password</h2>
          <p>
            For your security, set a new password before continuing.
          </p>
        </header>

        {errorMessage && (
          <div className="login-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="currentPassword">
              Temporary password
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              minLength={8}
              maxLength={128}
              required
              disabled={isSubmitting}
            />
            <small>Use at least 8 characters.</small>
          </div>

          <div className="login-field">
            <label htmlFor="confirmPassword">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              minLength={8}
              maxLength={128}
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating password..." : "Change password"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ChangePassword;