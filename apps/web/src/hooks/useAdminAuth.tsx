"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ApiError } from "@/lib/api";
import {
  getAdminAccessToken,
  removeAdminAccessToken,
  setAdminAccessToken,
} from "@/lib/admin-auth";
import {
  getCurrentAdmin,
  loginAdmin,
} from "@/services/auth.service";
import type { AdminUser, LoginRequest } from "@/types/auth";

type AdminAuthContextValue = {
  admin: AdminUser | null;
  error: string | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<boolean>;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
  clearError: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

type AdminAuthProviderProps = {
  children: ReactNode;
};

export function AdminAuthProvider({
  children,
}: AdminAuthProviderProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshAdmin = useCallback(async () => {
    const accessToken = getAdminAccessToken();

    if (!accessToken) {
      setAdmin(null);
      setIsInitialized(true);
      return;
    }

    setIsLoading(true);

    try {
      const currentAdmin = await getCurrentAdmin(accessToken);

      setAdmin(currentAdmin);
      setError(null);
    } catch {
      removeAdminAccessToken();
      setAdmin(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    void refreshAdmin();
  }, [refreshAdmin]);

  const login = useCallback(
    async (payload: LoginRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loginAdmin(payload);

        setAdminAccessToken(response.accessToken);
        setAdmin(response.admin);
        setIsInitialized(true);

        return true;
      } catch (caughtError) {
        const message =
          caughtError instanceof ApiError
            ? caughtError.message
            : "Autentificarea a eșuat.";

        removeAdminAccessToken();
        setAdmin(null);
        setError(message);

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    removeAdminAccessToken();
    setAdmin(null);
    setError(null);
    setIsInitialized(true);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      error,
      isInitialized,
      isAuthenticated: admin !== null,
      isLoading,
      login,
      logout,
      refreshAdmin,
      clearError,
    }),
    [
      admin,
      error,
      isInitialized,
      isLoading,
      login,
      logout,
      refreshAdmin,
      clearError,
    ],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth trebuie folosit în interiorul AdminAuthProvider.",
    );
  }

  return context;
}