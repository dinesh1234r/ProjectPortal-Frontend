import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="brand-icon">P</span>
          <span>ProjectPortal</span>
        </div>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <p className="nav-label">WORKSPACE</p>

          <a
            href="/dashboard"
            className="nav-item active"
            aria-current="page"
          >
            <span aria-hidden="true">▦</span>
            Overview
          </a>

          <div className="nav-item nav-placeholder">
            <span aria-hidden="true">▤</span>
            Projects
            <span className="nav-coming-soon">Soon</span>
          </div>

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
            <p className="breadcrumb">Workspace / Overview</p>
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
              <p className="welcome-eyebrow">YOUR WORKSPACE</p>
              <h2>Welcome to ProjectPortal</h2>
              <p>
                Your workspace for organizing projects,
                managing tasks and collaborating with your team.
              </p>
            </div>
          </div>

          <section className="stats-section" aria-labelledby="stats-heading">
            <div className="section-heading">
              <h2 id="stats-heading">Workspace overview</h2>
              <span>Summary</span>
            </div>

            <div className="stats-grid">
              <article className="stat-card">
                <div className="stat-icon projects-icon">▤</div>
                <p>Total projects</p>
                <strong>—</strong>
                <span>Project data coming soon</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon tasks-icon">✓</div>
                <p>Total tasks</p>
                <strong>—</strong>
                <span>Task data coming soon</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon completed-icon">↗</div>
                <p>Completed tasks</p>
                <strong>—</strong>
                <span>Completion data coming soon</span>
              </article>
            </div>
          </section>

          <section className="activity-section">
            <div className="section-heading">
              <h2>Recent activity</h2>
              <span>Latest updates</span>
            </div>

            <div className="activity-empty">
              <div className="empty-icon">◷</div>
              <h3>No activity yet</h3>
              <p>
                Project and task updates will appear here
                once your workspace is connected.
              </p>
            </div>
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
