import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import {
  createProject,
  fetchProjects,
  type Project,
} from "../services/projectService";
import "./Dashboard.css";
import "./Projects.css";

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
              <span>ProjectPortal user</span>
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
            <p className="breadcrumb">
              Workspace / Projects
            </p>

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

            <button
              className="create-project-button"
              type="button"
              onClick={() => {
                setErrorMessage("");
                setSuccessMessage("");
                setShowForm((current) => !current);
              }}
            >
              {showForm ? "Cancel" : "+ New project"}
            </button>
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

          {showForm && (
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
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Website redesign"
                    maxLength={100}
                    required
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
                    {isCreating
                      ? "Creating..."
                      : "Create project"}
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
                Create your first project to start organizing
                your work.
              </p>

              {!showForm && (
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
                <article
                  className="project-card"
                  key={project.id}
                >
                  <div className="project-card-icon">▤</div>

                  <h3>{project.name}</h3>

                  <p className="project-description">
                    {project.description || "No description provided."}
                  </p>

                  <div className="project-card-footer">
                    <span>Project #{project.id}</span>
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
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
