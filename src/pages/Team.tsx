
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { getCurrentUserRole } from "../services/roleService";
import { logout } from "../services/authService";
import {
  createTeamUser,
  fetchTeamUsers,
  updateTeamUser,
  type CreatedUser,
  type TeamUser,
} from "../services/userService";

import Sidebar from "../components/Sidebar";

import "./Dashboard.css";
import "./Team.css";

type EditableRole = "Manager" | "Employee";

function Team() {
  const navigate = useNavigate();
  const role = getCurrentUserRole();
  const isAdmin = role === "Admin";

  const [users, setUsers] = useState<TeamUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] =
    useState<EditableRole>("Employee");

  const [createdUser, setCreatedUser] =
    useState<CreatedUser | null>(null);

  const [editingUserId, setEditingUserId] =
    useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] =
    useState<EditableRole>("Employee");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;

      if (typeof data === "string") {
        return data;
      }

      if (typeof data?.message === "string") {
        return data.message;
      }

      if (error.response?.status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (error.response?.status === 401) {
        return "Your session has expired. Please sign in again.";
      }
    }

    return error instanceof Error ? error.message : fallback;
  };

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
        getErrorMessage(error, "Unable to load team members."),
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
        "Account created successfully. Copy the temporary password now; it will not be shown again.",
      );

      setName("");
      setEmail("");
      setNewRole("Employee");

      await loadUsers();
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, "Unable to create the account."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (user: TeamUser) => {
    if (user.role === "Admin") {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditRole(user.role);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditName("");
    setEditRole("Employee");
    setErrorMessage("");
  };

  const handleUpdateUser = async (
    event: React.FormEvent<HTMLFormElement>,
    userId: number,
  ) => {
    event.preventDefault();

    const trimmedName = editName.trim();

    if (!trimmedName) {
      setErrorMessage("Name is required.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsUpdating(true);

    try {
      await updateTeamUser(userId, {
        name: trimmedName,
        role: editRole,
      });

      setEditingUserId(null);
      setEditName("");
      setEditRole("Employee");
      setSuccessMessage("User updated successfully.");

      await loadUsers();
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, "Unable to update this user."),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!createdUser) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        createdUser.temporaryPassword,
      );

      setCopyMessage("Temporary password copied.");
    } catch {
      setCopyMessage(
        "Automatic copy is unavailable. Select the password and copy it manually.",
      );
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p className="breadcrumb">Workspace / Team</p>
              <h1>Team management</h1>
            </div>
          </header>

          <section className="team-denied">
            <h2>Access restricted</h2>
            <p>Only administrators can manage team accounts.</p>
            <Link to="/dashboard">Return to dashboard</Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="breadcrumb">Workspace / Team</p>
            <h1>Team management</h1>
            <p className="header-description">
              Create accounts and manage workspace access.
            </p>
          </div>
        </header>

        <section className="team-content">
          <section className="team-panel">
            <h2>Create an account</h2>

            <p className="team-panel-description">
              Create a Manager or Employee account. A temporary
              password will be generated automatically.
            </p>

            <form className="team-form" onSubmit={handleCreateUser}>
              <div className="team-form-field">
                <label htmlFor="team-name">Full name</label>
                <input
                  id="team-name"
                  type="text"
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
                    setNewRole(event.target.value as EditableRole)
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
                <p><strong>Name:</strong> {createdUser.name}</p>
                <p><strong>Email:</strong> {createdUser.email}</p>
                <p><strong>Role:</strong> {createdUser.role}</p>

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
                  Share this password securely. The user must change it
                  at first login. Do not store it in source control.
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
                disabled={isLoading || isUpdating}
              >
                {isLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {errorMessage && (
              <div className="team-alert team-alert-error" role="alert">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="team-alert team-alert-success" role="status">
                {successMessage}
              </div>
            )}

            {isLoading ? (
              <p className="team-state" role="status">
                Loading team members...
              </p>
            ) : users.length === 0 ? (
              <p className="team-state">
                {errorMessage
                  ? "Unable to display team members."
                  : "No team members found."}
              </p>
            ) : (
              <div className="team-table-wrapper">
                <table className="team-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          {editingUserId === user.id ? (
                            <form
                              id={`edit-user-${user.id}`}
                              className="team-edit-form"
                              onSubmit={(event) =>
                                void handleUpdateUser(event, user.id)
                              }
                            >
                              <label htmlFor={`edit-name-${user.id}`}>
                                Name
                              </label>
                              <input
                                id={`edit-name-${user.id}`}
                                value={editName}
                                onChange={(event) =>
                                  setEditName(event.target.value)
                                }
                                maxLength={101}
                                required
                                disabled={isUpdating}
                              />
                            </form>
                          ) : (
                            user.name
                          )}
                        </td>

                        <td>{user.email}</td>

                        <td>
                          {editingUserId === user.id ? (
                            <div className="team-edit-role">
                              <label htmlFor={`edit-role-${user.id}`}>
                                Role
                              </label>
                              <select
                                id={`edit-role-${user.id}`}
                                value={editRole}
                                onChange={(event) =>
                                  setEditRole(
                                    event.target.value as EditableRole,
                                  )
                                }
                                disabled={isUpdating}
                              >
                                <option value="Employee">Employee</option>
                                <option value="Manager">Manager</option>
                              </select>
                            </div>
                          ) : (
                            <span
                              className={`team-role role-${user.role.toLowerCase()}`}
                            >
                              {user.role}
                            </span>
                          )}
                        </td>

                        <td>
                          {user.role === "Admin" ? (
                            <span className="team-protected-label">
                              Protected
                            </span>
                          ) : editingUserId === user.id ? (
                            <div className="team-row-actions">
                              <button
                                type="submit"
                                form={`edit-user-${user.id}`}
                                className="team-primary-button"
                                disabled={isUpdating}
                              >
                                {isUpdating ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                className="team-secondary-button"
                                onClick={cancelEditing}
                                disabled={isUpdating}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="team-secondary-button"
                              onClick={() => startEditing(user)}
                              disabled={isUpdating}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>

        <footer className="dashboard-footer">
          ProjectPortal · Manage work, together.
        </footer>
      </main>
    </div>
  );
}

export default Team;
