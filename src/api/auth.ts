import apiClient from "./client";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  portal: string; // "ADMIN" | "FACULTY" | "STUDENT" | "FINANCE"
}

export interface LoginResponse {
  user: User;
}

// API Functions 


export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
};


export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
};