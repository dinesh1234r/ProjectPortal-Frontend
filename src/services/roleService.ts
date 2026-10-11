export type UserRole = "Admin" | "Manager" | "Employee";

const ROLE_CLAIM_URI =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export const getCurrentUserRole = (): UserRole | null => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedPayload = base64Payload.padEnd(
      Math.ceil(base64Payload.length / 4) * 4,
      "=",
    );

    const payload = JSON.parse(
      atob(paddedPayload),
    ) as Record<string, unknown>;

    const roleValue =
      payload[ROLE_CLAIM_URI] ??
      payload["role"] ??
      payload["roles"];

    const role = Array.isArray(roleValue)
      ? roleValue[0]
      : roleValue;

    if (typeof role !== "string") {
      return null;
    }

    switch (role.toLowerCase()) {
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "employee":
        return "Employee";
      default:
        return null;
    }
  } catch {
    return null;
  }
};