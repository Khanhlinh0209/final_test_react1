import { create } from "zustand";
import { authService } from "../services/authService";
import type { User } from "../types/auth";

type AuthStoreState = {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<User | null>;
};

type AuthContextValue = AuthStoreState & {
  isAuthenticated: boolean;
};

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

function getStoredUser(): User | null {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function saveSession(accessToken: string, user: User) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const useAuthStore = create<AuthStoreState>((set) => ({
  user: getStoredUser(),
  accessToken: getStoredAccessToken(),
  login: async (email: string, password: string) => {
    const response = await authService.login(email, password);
    saveSession(response.accessToken, response.user);
    set({
      user: response.user,
      accessToken: response.accessToken,
    });
  },
  logout: () => {
    clearSession();
    set({
      user: null,
      accessToken: null,
    });
  },
  getCurrentUser: async () => {
    const storedUser = getStoredUser();
    if (storedUser) {
      return storedUser;
    }

    try {
      const me = await authService.getMe();
      localStorage.setItem(USER_KEY, JSON.stringify(me));
      set({ user: me });
      return me;
    } catch {
      return null;
    }
  },
}));

export function useAuth(): AuthContextValue {
  const { user, accessToken, login, logout, getCurrentUser } = useAuthStore();

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    login,
    logout,
    getCurrentUser,
  };
}
