
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main>
      <h1>ProjectPortal Dashboard</h1>
      <p>You are logged in successfully.</p>

      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}

export default Dashboard;
