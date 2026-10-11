import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { getCurrentUserRole } from "../services/roleService";
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
  type Project,
} from "../services/projectService";
import "./Dashboard.css";
import "./Projects.css";

function Projects() {
  const navigate = useNavigate();
  const userRole = getCurrentUserRole();
  const isAdmin = userRole === "Admin";

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<
    number | null
  >(null);

  const [showForm, setShowForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<
    number | null
  >(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchProjects();
      setProjects(data);
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
          : "Unable to load projects.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!isAdmin) {
      setErrorMessage(
        "Only administrators can create projects.",
      );
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsCreating(true);

    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
      });

      setName("");
      setDescription("");
      setShowForm(false);
      setSuccessMessage("Project created successfully.");

      await loadProjects();
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 403
      ) {
        setErrorMessage(
          "You do not have permission to create projects.",
        );
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create the project.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (project: Project) => {
    if (
      !isAdmin ||
      isSaving ||
      deletingProjectId !== null
    ) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setShowForm(false);
    setEditingProjectId(project.id);
    setEditName(project.name);
    setEditDescription(project.description ?? "");
  };

  const handleCancelEdit = () => {
    if (isSaving) {
      return;
    }

    setEditingProjectId(null);
    setEditName("");
    setEditDescription("");
    setErrorMessage("");
  };

  const handleSaveEdit = async (
    event: React.FormEvent<HTMLFormElement>,
    projectId: number,
  ) => {
    event.preventDefault();

    if (
      !isAdmin ||
      isSaving ||
      !editName.trim() ||
      deletingProjectId !== null
    ) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      await updateProject(projectId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      setEditingProjectId(null);
      setEditName("");
      setEditDescription("");
      setSuccessMessage("Project updated successfully.");

      await loadProjects();
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 403
      ) {
        setErrorMessage(
          "You do not have permission to update projects.",
        );
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the project.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (
      !isAdmin ||
      deletingProjectId !== null ||
      isSaving
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${project.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setDeletingProjectId(project.id);

    try {
      await deleteProject(project.id);

      setProjects((currentProjects) =>
        currentProjects.filter(
          (item) => item.id !== project.id,
        ),
      );

      if (editingProjectId === project.id) {
        setEditingProjectId(null);
        setEditName("");
        setEditDescription("");
      }

      setSuccessMessage("Project deleted successfully.");
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 403
      ) {
        setErrorMessage(
          "You do not have permission to delete projects.",
        );
        return;
      }

      setErrorMessage(
        "Unable to delete this project. It may contain tasks or be referenced by other records.",
      );
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const formatDate = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="brand-icon">P</span>
          <span>ProjectPortal</span>
        </div>

        <nav
          className="dashboard-nav"
          aria-label="Main navigation"
        >
          <p className="nav-label">WORKSPACE</p>

          <Link className="nav-item" to="/dashboard">
            <span aria-hidden="true">▦</span>
            Overview
          </Link>

          <Link
            className="nav-item active"
            to="/projects"
            aria-current="page"
          >
            <span aria-hidden="true">▤</span>
            Projects
          </Link>

          <div className="nav-item nav-placeholder">
            <span aria-hidden="true">✓</span>
            Tasks
            <span className="nav-coming-soon">Soon</span>
          </div>

          <div className="nav-item nav-placeholder">
            <span aria-hidden="true">♙</span>
            Team
            <span className="nav-coming-soon">Soon</span>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">U</div>
            <div className="user-details">
              <strong>My Account</strong>
              <span>{userRole ?? "ProjectPortal user"}</span>
            </div>
          </div>

          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="breadcrumb">Workspace / Projects</p>
            <h1>Projects</h1>
            <p className="header-description">
              View and manage your workspace projects.
            </p>
          </div>

          <button
            className="header-logout"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        <section className="dashboard-content projects-content">
          <div className="projects-toolbar">
            <div>
              <h2>Your projects</h2>
              <p>
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </p>
            </div>

            {isAdmin && (
              <button
                className="create-project-button"
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  setSuccessMessage("");
                  setShowForm((current) => !current);
                  setEditingProjectId(null);
                }}
                disabled={isCreating || isSaving}
              >
                {showForm ? "Cancel" : "+ New project"}
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="projects-message error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="projects-message success" role="status">
              {successMessage}
            </div>
          )}

          {showForm && isAdmin && (
            <section className="project-form-card">
              <h2>Create a project</h2>

              <form onSubmit={handleCreateProject}>
                <div className="project-form-field">
                  <label htmlFor="project-name">
                    Project name
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="e.g. Website redesign"
                    maxLength={100}
                    required
                    disabled={isCreating}
                  />
                </div>

                <div className="project-form-field">
                  <label htmlFor="project-description">
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="What is this project about?"
                    maxLength={500}
                    rows={4}
                    disabled={isCreating}
                  />
                  <span className="character-count">
                    {description.length}/500
                  </span>
                </div>

                <div className="project-form-actions">
                  <button
                    className="cancel-project-button"
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>

                  <button
                    className="create-project-button"
                    type="submit"
                    disabled={isCreating || !name.trim()}
                  >
                    {isCreating ? "Creating..." : "Create project"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {isLoading ? (
            <div className="projects-state" role="status">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="projects-empty">
              <div className="projects-empty-icon">▤</div>
              <h3>No projects yet</h3>
              <p>
                {isAdmin
                  ? "Create your first project to start organizing your work."
                  : "Projects will appear here when they are available."}
              </p>

              {isAdmin && !showForm && (
                <button
                  className="create-project-button"
                  type="button"
                  onClick={() => setShowForm(true)}
                >
                  Create your first project
                </button>
              )}
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  {editingProjectId === project.id ? (
                    <form
                      className="project-edit-form"
                      onSubmit={(event) =>
                        void handleSaveEdit(event, project.id)
                      }
                    >
                      <h3>Edit project</h3>

                      <div className="project-form-field">
                        <label htmlFor={`edit-project-name-${project.id}`}>
                          Project name
                        </label>
                        <input
                          id={`edit-project-name-${project.id}`}
                          type="text"
                          value={editName}
                          onChange={(event) =>
                            setEditName(event.target.value)
                          }
                          maxLength={100}
                          required
                          disabled={isSaving}
                        />
                      </div>

                      <div className="project-form-field">
                        <label
                          htmlFor={`edit-project-description-${project.id}`}
                        >
                          Description
                        </label>
                        <textarea
                          id={`edit-project-description-${project.id}`}
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          maxLength={500}
                          rows={4}
                          disabled={isSaving}
                        />
                        <span className="character-count">
                          {editDescription.length}/500
                        </span>
                      </div>

                      <div className="project-form-actions">
                        <button
                          className="cancel-project-button"
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button
                          className="create-project-button"
                          type="submit"
                          disabled={isSaving || !editName.trim()}
                        >
                          {isSaving ? "Saving..." : "Save changes"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="project-card-icon">▤</div>

                      <h3>
                        <Link
                          className="project-card-title-link"
                          to={`/projects/${project.id}`}
                        >
                          {project.name}
                        </Link>
                      </h3>

                      <p className="project-description">
                        {project.description ||
                          "No description provided."}
                      </p>

                      <div className="project-card-footer">
                        <span>Project #{project.id}</span>
                        <span>{formatDate(project.createdAt)}</span>
                      </div>

                      <Link
                        className="open-project-label"
                        to={`/projects/${project.id}`}
                      >
                        Open project →
                      </Link>

                      {isAdmin && (
                        <div className="project-management-actions">
                          <button
                            className="project-action-button"
                            type="button"
                            onClick={() => handleStartEdit(project)}
                            disabled={
                              editingProjectId !== null ||
                              isSaving ||
                              deletingProjectId !== null
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="project-action-button danger"
                            type="button"
                            onClick={() =>
                              void handleDeleteProject(project)
                            }
                            disabled={
                              editingProjectId !== null ||
                              isSaving ||
                              deletingProjectId !== null
                            }
                          >
                            {deletingProjectId === project.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="dashboard-footer">
          ProjectPortal · Manage work, together.
        </footer>
      </main>
    </div>
  );
}

export default Projects;