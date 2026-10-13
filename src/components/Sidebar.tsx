import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { getCurrentUserRole } from "../services/roleService";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentRole = getCurrentUserRole();

  const isActive = (section: string) => {
    if (section === "/projects") {
      return location.pathname.startsWith("/projects");
    }

    return location.pathname === section;
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-brand">
        <span className="brand-icon">P</span>
        <span>ProjectPortal</span>
      </div>

      <nav className="dashboard-nav" aria-label="Main navigation">
        <p className="nav-label">WORKSPACE</p>

        <Link
          to="/dashboard"
          className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
          aria-current={isActive("/dashboard") ? "page" : undefined}
        >
          <span aria-hidden="true">▦</span>
          Overview
        </Link>

        <Link
          to="/projects"
          className={`nav-item ${isActive("/projects") ? "active" : ""}`}
          aria-current={isActive("/projects") ? "page" : undefined}
        >
          <span aria-hidden="true">▤</span>
          Projects
        </Link>

        <Link
          to="/tasks"
          className={`nav-item ${isActive("/tasks") ? "active" : ""}`}
          aria-current={isActive("/tasks") ? "page" : undefined}
        >
          <span aria-hidden="true">✓</span>
          Tasks
        </Link>

        <div className="nav-item nav-placeholder">
          <span aria-hidden="true">♙</span>
          Team
          <span className="nav-coming-soon">Soon</span>
        </div>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">
            {(currentRole ?? "U").charAt(0)}
          </div>

          <div className="user-details">
            <strong>My Account</strong>
            <span>{currentRole ?? "ProjectPortal user"}</span>
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
  );
}

export default Sidebar;