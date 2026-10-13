import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import {
  fetchAllTasks,
  type TaskItem,
} from "../services/taskService";
import {
  fetchProjects,
  type Project,
} from "../services/projectService";
import "./Dashboard.css";
import "./Tasks.css";
import Sidebar from "../components/Sidebar";

type TaskFilter = "All" | "Pending" | "Completed";

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [taskData, projectData] = await Promise.all([
          fetchAllTasks(),
          fetchProjects(),
        ]);

        setTasks(taskData);
        setProjects(projectData);
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
            : "Unable to load tasks.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [navigate]);

  const projectNames = useMemo(
    () =>
      new Map(
        projects.map((project) => [
          project.id,
          project.name,
        ]),
      ),
    [projects],
  );

  const filteredTasks = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !searchTerm ||
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        (projectNames.get(task.projectId) ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        (task.assignedUser?.name ?? "")
          .toLowerCase()
          .includes(searchTerm) ||
        (task.assignedUser?.email ?? "")
          .toLowerCase()
          .includes(searchTerm);

      const matchesFilter =
        filter === "All" ||
        (filter === "Completed" && task.isCompleted) ||
        (filter === "Pending" && !task.isCompleted);

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter, projectNames]);

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

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const completedCount = tasks.filter(
    (task) => task.isCompleted,
  ).length;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="breadcrumb">Workspace / Tasks</p>
            <h1>Tasks</h1>
            <p className="header-description">
              Find and track tasks across all your projects.
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

        <section className="dashboard-content tasks-content">
          <div className="tasks-summary">
            <article className="tasks-summary-card">
              <span>Total tasks</span>
              <strong>{tasks.length}</strong>
            </article>

            <article className="tasks-summary-card">
              <span>Pending</span>
              <strong>{tasks.length - completedCount}</strong>
            </article>

            <article className="tasks-summary-card">
              <span>Completed</span>
              <strong>{completedCount}</strong>
            </article>
          </div>

          <section className="tasks-panel">
            <div className="tasks-toolbar">
              <div>
                <h2>All tasks</h2>
                <p>
                  Showing {filteredTasks.length} of {tasks.length} tasks
                </p>
              </div>

              <input
                className="tasks-search"
                type="search"
                aria-label="Search tasks"
                placeholder="Search tasks, projects, or assignees..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div
              className="tasks-filters"
              aria-label="Filter tasks"
            >
              {(["All", "Pending", "Completed"] as const).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    className={`tasks-filter-button ${
                      filter === option ? "active" : ""
                    }`}
                    aria-pressed={filter === option}
                    onClick={() => setFilter(option)}
                  >
                    {option}
                  </button>
                ),
              )}
            </div>

            {errorMessage && (
              <div
                className="projects-message error"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            {isLoading ? (
              <div className="projects-state" role="status">
                Loading tasks...
              </div>
            ) : errorMessage ? null : filteredTasks.length === 0 ? (
              <div className="projects-empty">
                <div className="projects-empty-icon">✓</div>
                <h3>No tasks found</h3>
                <p>
                  {tasks.length === 0
                    ? "Tasks will appear here when they are created."
                    : "Try another search term or filter."}
                </p>
              </div>
            ) : (
              <div className="tasks-list">
                {filteredTasks.map((task) => (
                  <article
                    className="tasks-list-item"
                    key={task.id}
                  >
                    <div
                      className={`tasks-status-indicator ${
                        task.isCompleted
                          ? "completed"
                          : "pending"
                      }`}
                      aria-hidden="true"
                    />

                    <div className="tasks-list-main">
                      <h3>{task.title}</h3>

                      <p>
                        {task.description ||
                          "No description provided."}
                      </p>

                      <span className="tasks-created-date">
                        Created {formatDate(task.createdAt)}
                      </span>

                      <div className="task-assignee">
                        <span className="task-assignee-label">
                          Assigned to:
                        </span>

                        {task.assignedUser ? (
                          <span
                            className="task-assignee-details"
                            title={task.assignedUser.email}
                          >
                            <strong>
                              {task.assignedUser.name}
                            </strong>
                            <span>
                              {task.assignedUser.email}
                            </span>
                          </span>
                        ) : (
                          <span className="task-unassigned">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="tasks-list-meta">
                      <span
                        className={`tasks-status-badge ${
                          task.isCompleted
                            ? "completed"
                            : "pending"
                        }`}
                      >
                        {task.isCompleted
                          ? "Completed"
                          : "Pending"}
                      </span>

                      <Link
                        className="tasks-project-link"
                        to={`/projects/${task.projectId}`}
                      >
                        {projectNames.get(task.projectId) ??
                          `Project #${task.projectId}`}
                        <span aria-hidden="true"> →</span>
                      </Link>
                    </div>
                  </article>
                ))}
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

export default Tasks;