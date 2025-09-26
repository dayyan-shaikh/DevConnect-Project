import axiosInstance from "./axios";
import { useMutation } from "@tanstack/react-query";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

/* ------------------- API CALLS ------------------- */
const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>("/auth/register", data);
  return res.data;
};

const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>("/auth/login", data);
  return res.data;
};

export const useRegister = (
  onSuccess?: (data: AuthResponse) => void, 
  onError?: (err: any) => void
) =>
  useMutation({
    mutationFn: registerUser,
    onSuccess,
    onError,
  });

export const useLogin = (
  onSuccess?: (data: AuthResponse) => void,
  onError?: (err: any) => void
) =>
  useMutation({
    mutationFn: loginUser,
    onSuccess,
    onError,
  });
