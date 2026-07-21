"use client";

import { useCallback, useEffect, useState } from "react";

import { getAdminDashboard } from "@/services/admin-dashboard.service";

import type {
  AdminDashboardResponse,
} from "@/types/admin-dashboard";

type UseAdminDashboardResult = {
  dashboard: AdminDashboardResponse | null;

  isLoading: boolean;
  error: string | null;

  refresh: () => Promise<void>;
};

export function useAdminDashboard(): UseAdminDashboardResult {
  const [dashboard, setDashboard] =
    useState<AdminDashboardResponse | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await getAdminDashboard();

      setDashboard(response);
    } catch (error) {
      console.error(error);

      setError(
        "Dashboard-ul nu a putut fi încărcat.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    dashboard,
    isLoading,
    error,
    refresh: load,
  };
}