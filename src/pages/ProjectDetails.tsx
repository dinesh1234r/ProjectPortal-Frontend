import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { logout } from "../services/authService";
import { getCurrentUserRole } from "../services/roleService";
import {
  fetchProjects,
  type Project,
} from "../services/projectService";
import {
  createTask,
  fetchTasksByProject,
  type TaskItem,
} from "../services/taskService";
import "./Dashboard.css";
import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const projectId = Number(id);
  const userRole = getCurrentUserRole();
  const canCreateTasks =
    userRole === "Admin" || userRole === "Manager";

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

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

  const handleCreateTask = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!canCreateTasks) {
      setErrorMessage("You do not have permission to create tasks.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsCreatingTask(true);

    try {
      await createTask({
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        projectId,
      });

      const refreshedTasks = await fetchTasksByProject(projectId);

      setTasks(refreshedTasks);
      setTaskTitle("");
      setTaskDescription("");
      setShowTaskForm(false);
      setSuccessMessage("Task created successfully.");
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
          "You do not have permission to create tasks.",
        );
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create the task.",
      );
    } finally {
      setIsCreatingTask(false);
    }
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

          {successMessage && (
            <div className="projects-message success" role="status">
              {successMessage}
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

                  <div className="project-task-actions">
                    <span className="task-count">
                      {tasks.length}{" "}
                      {tasks.length === 1 ? "task" : "tasks"}
                    </span>

                    {canCreateTasks && (
                      <button
                        className="create-project-button"
                        type="button"
                        onClick={() => {
                          setErrorMessage("");
                          setSuccessMessage("");
                          setShowTaskForm((current) => !current);
                        }}
                      >
                        {showTaskForm ? "Cancel" : "+ New task"}
                      </button>
                    )}
                  </div>
                </div>

                {showTaskForm && canCreateTasks && (
                  <section className="task-form-card">
                    <h3>Create a task</h3>

                    <form onSubmit={handleCreateTask}>
                      <div className="project-form-field">
                        <label htmlFor="task-title">
                          Task title
                        </label>

                        <input
                          id="task-title"
                          type="text"
                          value={taskTitle}
                          onChange={(event) =>
                            setTaskTitle(event.target.value)
                          }
                          placeholder="e.g. Design the login page"
                          maxLength={101}
                          required
                          disabled={isCreatingTask}
                        />
                      </div>

                      <div className="project-form-field">
                        <label htmlFor="task-description">
                          Description
                        </label>

                        <textarea
                          id="task-description"
                          value={taskDescription}
                          onChange={(event) =>
                            setTaskDescription(event.target.value)
                          }
                          placeholder="Describe what needs to be done"
                          maxLength={1001}
                          rows={4}
                          disabled={isCreatingTask}
                        />

                        <span className="character-count">
                          {taskDescription.length}/1001
                        </span>
                      </div>

                      <div className="project-form-actions">
                        <button
                          className="cancel-project-button"
                          type="button"
                          onClick={() => setShowTaskForm(false)}
                          disabled={isCreatingTask}
                        >
                          Cancel
                        </button>

                        <button
                          className="create-project-button"
                          type="submit"
                          disabled={
                            isCreatingTask || !taskTitle.trim()
                          }
                        >
                          {isCreatingTask
                            ? "Creating..."
                            : "Create task"}
                        </button>
                      </div>
                    </form>
                  </section>
                )}

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
                      {canCreateTasks
                        ? "Create the first task for this project."
                        : "Tasks for this project will appear here."}
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