
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import {
  fetchDashboardData,
  type DashboardData,
} from "../services/dashboardService";
import {
  fetchRecentActivity,
  type ActivityItem,
} from "../services/activityService";
import "./Dashboard.css";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [recentActivity, setRecentActivity] =
    useState<ActivityItem[]>([]);
  const [isActivityLoading, setIsActivityLoading] =
    useState(true);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const handleUnauthorized = (error: unknown): boolean => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        logout();
        navigate("/login", { replace: true });
        return true;
      }

      return false;
    };

    const loadDashboard = async () => {
      try {
        const data = await fetchDashboardData();

        if (isMounted) {
          setDashboardData(data);
        }
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

        if (handleUnauthorized(error)) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const loadRecentActivity = async () => {
      try {
        const items = await fetchRecentActivity(8);

        if (isMounted) {
          setRecentActivity(items);
          setActivityError("");
        }
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

        if (handleUnauthorized(error)) {
          return;
        }

        setActivityError(
          error instanceof Error
            ? error.message
            : "Unable to load recent activity.",
        );
      } finally {
        if (isMounted) {
          setIsActivityLoading(false);
        }
      }
    };

    void loadDashboard();
    void loadRecentActivity();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const totalProjects =
    dashboardData?.projects.length ?? 0;

  const totalTasks =
    dashboardData?.tasks.length ?? 0;

  const completedTasks =
    dashboardData?.tasks.filter(
      (task) => task.isCompleted,
    ).length ?? 0;

  const formatActivityDate = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getActivityIcon = (action: string): string => {
    switch (action.toLowerCase()) {
      case "created":
        return "+";
      case "deleted":
        return "−";
      default:
        return "↻";
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="breadcrumb">
              Workspace / Overview
            </p>

            <h1>Dashboard</h1>

            <p className="header-description">
              Track your projects and tasks in one place.
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

        <section className="dashboard-content">
          <div className="welcome-banner">
            <div>
              <p className="welcome-eyebrow">
                YOUR WORKSPACE
              </p>

              <h2>Welcome to ProjectPortal</h2>

              <p>
                Your workspace for organizing projects,
                managing tasks and collaborating with your team.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="dashboard-error" role="alert">
              <strong>Unable to load dashboard</strong>
              <p>{errorMessage}</p>
            </div>
          )}

          <section
            className="stats-section"
            aria-labelledby="stats-heading"
          >
            <div className="section-heading">
              <h2 id="stats-heading">
                Workspace overview
              </h2>
              <span>Summary</span>
            </div>

            <div className="stats-grid">
              <article className="stat-card">
                <div className="stat-icon projects-icon">
                  ▤
                </div>

                <p>Total projects</p>

                <strong>
                  {isLoading ? "…" : totalProjects}
                </strong>

                <span>
                  Projects in your workspace
                </span>
              </article>

              <article className="stat-card">
                <div className="stat-icon tasks-icon">
                  ✓
                </div>

                <p>Total tasks</p>

                <strong>
                  {isLoading ? "…" : totalTasks}
                </strong>

                <span>
                  Tasks across your workspace
                </span>
              </article>

              <article className="stat-card">
                <div className="stat-icon completed-icon">
                  ↗
                </div>

                <p>Completed tasks</p>

                <strong>
                  {isLoading ? "…" : completedTasks}
                </strong>

                <span>
                  Tasks marked as completed
                </span>
              </article>
            </div>
          </section>

          <section className="activity-section">
            <div className="section-heading">
              <h2>Recent activity</h2>
              <span>Latest updates</span>
            </div>

            {activityError && (
              <div className="dashboard-error" role="alert">
                <strong>Unable to load recent activity</strong>
                <p>{activityError}</p>
              </div>
            )}

            {isActivityLoading ? (
              <div className="activity-empty" role="status">
                <p>Loading recent activity...</p>
              </div>
            ) : activityError ? null : recentActivity.length === 0 ? (
              <div className="activity-empty">
                <div className="empty-icon">◷</div>

                <h3>No activity yet</h3>

                <p>
                  Create or update a project or task.
                  Your latest changes will appear here.
                </p>
              </div>
            ) : (
              <div className="activity-list" role="list">
                {recentActivity.map((activity) => (
                  <article
                    className="activity-item"
                    key={activity.id}
                    role="listitem"
                  >
                    <div
                      className={`activity-item-icon ${activity.action.toLowerCase()}`}
                      aria-hidden="true"
                    >
                      {getActivityIcon(activity.action)}
                    </div>

                    <div className="activity-item-main">
                      <p>{activity.description}</p>

                      <span>
                        {activity.actorRole}
                      </span>
                    </div>

                    <time dateTime={activity.createdAt}>
                      {formatActivityDate(activity.createdAt)}
                    </time>
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

export default Dashboard;
