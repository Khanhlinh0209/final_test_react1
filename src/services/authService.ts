import { axiosClient } from "./axiosClient";
import type { LoginResponse, User } from "../types/auth";

type LoginRecord = {
  id: string;
  email: string;
  role: string;
  name: string;
  accessToken: string;
  message: string;
};

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await axiosClient.get<LoginRecord>("/login/1");
    const normalizedInputEmail = email.trim().toLowerCase();
    const normalizedApiEmail = data.email.trim().toLowerCase();
    const isValidPassword = password === "123456";

    if (normalizedApiEmail !== normalizedInputEmail || !isValidPassword) {
      throw new Error("Invalid email or password.");
    }

    return {
      accessToken: data.accessToken,
      message: data.message,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      },
    };
  },
  getMe: async (): Promise<User> => {
    const { data } = await axiosClient.get<LoginRecord>("/login/1");

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
  },
};