import api from "./api";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/auth";

export const login = async (
  request: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/api/Auth/login",
    request,
  );

  localStorage.setItem("token", response.data.token);

  return response.data;
};

export const register = async (
  request: RegisterRequest,
): Promise<void> => {
  await api.post("/api/Auth/register", request);
};

export const changePassword = async (
  request: ChangePasswordRequest,
): Promise<void> => {
  await api.post("/api/Auth/change-password", request);
};

export const logout = (): void => {
  localStorage.removeItem("token");
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};