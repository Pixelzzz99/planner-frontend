import { api } from "@/shared/api/api";
import { LoginDTO, RegisterDTO, AuthResponse, User } from "../model/auth.dto";

export const userApi = {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`/auth/login`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`/auth/register`, data);
    return response.data;
  },

  async checkAuth(token: string): Promise<User> {
    const response = await api.get<User>(`/auth/me`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
