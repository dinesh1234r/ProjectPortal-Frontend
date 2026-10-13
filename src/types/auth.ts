export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  mustChangePassword: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}