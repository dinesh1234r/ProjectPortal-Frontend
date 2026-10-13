import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getCurrentUserRole } from "../services/roleService";
import { logout } from "../services/authService";
import {
  createTeamUser,
  fetchTeamUsers,
  type CreatedUser,
  type TeamUser,
} from "../services/userService";
import "./Team.css";

function Team() {
  const navigate = useNavigate();
  const role = getCurrentUserRole();
  const isAdmin = role === "Admin";

  const [users, setUsers] = useState<TeamUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] =
    useState<"Manager" | "Employee">("Employee");
  const [createdUser, setCreatedUser] =
    useState<CreatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const loadUsers = useCallback(async () => {
    setErrorMessage("");

    try {
      const result = await fetchTeamUsers();
      setUsers(result);
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load team members.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      void loadUsers();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, loadUsers]);

  const handleCreateUser = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setCopyMessage("");
    setCreatedUser(null);
    setIsSubmitting(true);

    try {
      const result = await createTeamUser({
        name: name.trim(),
        email: email.trim(),
        role: newRole,
      });

      setCreatedUser(result);
      setSuccessMessage(
        "Account created. Copy the temporary password now; it will not be shown again.",
      );
      setName("");
      setEmail("");
      setNewRole("Employee");

      await loadUsers();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        setErrorMessage(
          typeof data === "string"
            ? data
            : data?.message ?? "Unable to create the account.",
        );
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to create the account.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!createdUser) return;

    try {
      await navigator.clipboard.writeText(
        createdUser.temporaryPassword,
      );
      setCopyMessage("Temporary password copied.");
    } catch {
      setCopyMessage(
        "Copy is unavailable in this browser. Select the password and copy it manually.",
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!isAdmin) {
    return (
      <main className="team-denied">
        <h1>Access restricted</h1>
        <p>Only administrators can manage team accounts.</p>
        <Link to="/dashboard">Return to dashboard</Link>
      </main>
    );
  }

  return (
    <div className="team-page">
      <header className="team-header">
        <div>
          <Link to="/dashboard" className="team-back-link">
            ← Dashboard
          </Link>
          <h1>Team management</h1>
          <p>Create accounts and manage workspace access.</p>
        </div>
        <button
          type="button"
          className="team-secondary-button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      <main className="team-content">
        <section className="team-panel">
          <h2>Create an account</h2>
          <p className="team-panel-description">
            Create a Manager or Employee account. A temporary
            password will be generated automatically.
          </p>

          {errorMessage && (
            <div className="team-alert team-alert-error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              className="team-alert team-alert-success"
              role="status"
            >
              {successMessage}
            </div>
          )}

          <form className="team-form" onSubmit={handleCreateUser}>
            <div className="team-form-field">
              <label htmlFor="team-name">Full name</label>
              <input
                id="team-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={101}
                required
                disabled={isSubmitting}
                placeholder="Enter full name"
              />
            </div>

            <div className="team-form-field">
              <label htmlFor="team-email">Email address</label>
              <input
                id="team-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={101}
                required
                disabled={isSubmitting}
                placeholder="employee@example.com"
              />
            </div>

            <div className="team-form-field">
              <label htmlFor="team-role">Role</label>
              <select
                id="team-role"
                value={newRole}
                onChange={(event) =>
                  setNewRole(
                    event.target.value as "Manager" | "Employee",
                  )
                }
                disabled={isSubmitting}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <button
              type="submit"
              className="team-primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          {createdUser && (
            <section className="temporary-password-card">
              <h3>Account created</h3>
              <p>
                <strong>Name:</strong> {createdUser.name}
              </p>
              <p>
                <strong>Email:</strong> {createdUser.email}
              </p>
              <p>
                <strong>Role:</strong> {createdUser.role}
              </p>

              <label htmlFor="temporary-password">
                Temporary password
              </label>
              <input
                id="temporary-password"
                type="text"
                value={createdUser.temporaryPassword}
                readOnly
                onFocus={(event) => event.target.select()}
              />

              <button
                type="button"
                className="team-primary-button"
                onClick={() => void handleCopyPassword()}
              >
                Copy temporary password
              </button>

              {copyMessage && (
                <p className="team-copy-message" role="status">
                  {copyMessage}
                </p>
              )}

              <p className="team-security-note">
                Share this password securely. The new user must
                change it at first login. Do not save it in notes
                or commit it to source control.
              </p>
            </section>
          )}
        </section>

        <section className="team-panel">
          <div className="team-list-heading">
            <div>
              <h2>Team members</h2>
              <p className="team-panel-description">
                Accounts registered in ProjectPortal.
              </p>
            </div>
            <button
              type="button"
              className="team-secondary-button"
              onClick={() => void loadUsers()}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <p className="team-state">Loading team members...</p>
          ) : users.length === 0 ? (
            <p className="team-state">No team members found.</p>
          ) : (
            <div className="team-table-wrapper">
              <table className="team-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`team-role role-${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Team;
