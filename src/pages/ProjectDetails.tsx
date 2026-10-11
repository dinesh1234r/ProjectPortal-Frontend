import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { logout } from "../services/authService";
import {
  fetchProjects,
  type Project,
} from "../services/projectService";
import {
  fetchTasksByProject,
  type TaskItem,
} from "../services/taskService";
import "./Dashboard.css";
import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProjectDetails = async () => {
      if (!Number.isInteger(projectId) || projectId <= 0) {
        setErrorMessage("Invalid project ID.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const [projects, projectTasks] = await Promise.all([
          fetchProjects(),
          fetchTasksByProject(projectId),
        ]);

        if (!isMounted) {
          return;
        }

        const selectedProject =
          projects.find((item) => item.id === projectId) ?? null;

        if (!selectedProject) {
          setErrorMessage("Project not found.");
          return;
        }

        setProject(selectedProject);
        setTasks(projectTasks);
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

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
            : "Unable to load project details.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProjectDetails();

    return () => {
      isMounted = false;
    };
  }, [projectId, navigate]);

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

  const completedTasks = tasks.filter(
    (task) => task.isCompleted,
  ).length;

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
              <Link to="/projects">Projects</Link>
              {" / "}
              Details
            </p>

            <h1>{project?.name ?? "Project details"}</h1>

            <p className="header-description">
              View project information and its tasks.
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

        <section className="dashboard-content project-details-content">
          <Link className="back-to-projects" to="/projects">
            ← Back to projects
          </Link>

          {errorMessage && (
            <div className="projects-message error" role="alert">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="projects-state" role="status">
              Loading project details...
            </div>
          ) : project ? (
            <>
              <section className="project-summary-card">
                <div className="project-summary-heading">
                  <div className="project-card-icon">▤</div>

                  <div>
                    <p className="project-summary-label">
                      PROJECT #{project.id}
                    </p>
                    <h2>{project.name}</h2>
                  </div>
                </div>

                <p className="project-summary-description">
                  {project.description ||
                    "No description provided."}
                </p>

                <p className="project-summary-date">
                  Created {formatDate(project.createdAt)}
                </p>
              </section>

              <section className="project-tasks-section">
                <div className="project-tasks-heading">
                  <div>
                    <h2>Project tasks</h2>
                    <p>Tasks associated with this project.</p>
                  </div>

                  <span className="task-count">
                    {tasks.length}{" "}
                    {tasks.length === 1 ? "task" : "tasks"}
                  </span>
                </div>

                {tasks.length > 0 && (
                  <div className="task-progress-card">
                    <div className="task-progress-labels">
                      <span>Completion</span>
                      <strong>
                        {completedTasks} of {tasks.length}
                      </strong>
                    </div>

                    <div
                      className="task-progress-track"
                      role="progressbar"
                      aria-label="Task completion"
                      aria-valuemin={0}
                      aria-valuemax={tasks.length}
                      aria-valuenow={completedTasks}
                    >
                      <div
                        className="task-progress-value"
                        style={{
                          width: `${
                            (completedTasks / tasks.length) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {tasks.length === 0 ? (
                  <div className="project-tasks-empty">
                    <div className="projects-empty-icon">✓</div>
                    <h3>No tasks yet</h3>
                    <p>
                      Tasks for this project will appear here.
                      Task creation is the next step.
                    </p>
                  </div>
                ) : (
                  <div className="project-task-list">
                    {tasks.map((task) => (
                      <article
                        className="project-task-card"
                        key={task.id}
                      >
                        <div
                          className={`task-status-dot ${
                            task.isCompleted ? "completed" : ""
                          }`}
                          aria-hidden="true"
                        />

                        <div className="project-task-main">
                          <h3
                            className={
                              task.isCompleted
                                ? "task-title-completed"
                                : ""
                            }
                          >
                            {task.title}
                          </h3>

                          <p>
                            {task.description ||
                              "No description provided."}
                          </p>

                          <span className="project-task-date">
                            Created {formatDate(task.createdAt)}
                          </span>
                        </div>

                        <span
                          className={`task-status-badge ${
                            task.isCompleted
                              ? "completed"
                              : "pending"
                          }`}
                        >
                          {task.isCompleted
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </section>

        <footer className="dashboard-footer">
          ProjectPortal · Manage work, together.
        </footer>
      </main>
    </div>
  );
}

export default ProjectDetails;