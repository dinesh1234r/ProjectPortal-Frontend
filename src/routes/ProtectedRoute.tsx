import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../services/authService";

function requiresPasswordChange(token: string): boolean {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return true;
    }

    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      atob(
        normalized.padEnd(
          Math.ceil(normalized.length / 4) * 4,
          "=",
        ),
      ),
    ) as Record<string, unknown>;

    return (
      String(payload.must_change_password).toLowerCase() === "true"
    );
  } catch {
    return true;
  }
}

function ProtectedRoute() {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const mustChangePassword = requiresPasswordChange(token);

  if (
    mustChangePassword &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  if (
    !mustChangePassword &&
    location.pathname === "/change-password"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;