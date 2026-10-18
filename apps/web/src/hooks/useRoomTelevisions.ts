"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";

export type RoomTelevision = {
  id: string;
  roomId: string | null;
  online: boolean;
  hideGuestName: boolean;
  forceStandard: boolean;
  content: { guest: { displayName: string } | null };
};
type TvState = { devices: RoomTelevision[] };
export type TvMutation = (path: string, method: "POST" | "PATCH", body?: unknown) => Promise<boolean>;

export function useRoomTelevisions() {
  const [state, setState] = useState<TvState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const invalidate = useCallback(() => { generation.current++; }, []);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    try {
      const result = await apiRequest<TvState>("/admin/tv/devices");
      if (current === generation.current) { setState(result); setError(""); }
    } catch (e) {
      if (current === generation.current) {
        setState(null);
        setError(e instanceof Error ? e.message : "Informațiile TV nu sunt disponibile.");
      }
    }
  }, []);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => void refresh(), 30000);
    return () => { invalidate(); clearTimeout(initial); clearInterval(timer); };
  }, [refresh, invalidate]);
  const mutate: TvMutation = async (path, method, body) => {
    setBusy(true); setError(""); generation.current++;
    try {
      await apiRequest(path, { method, body });
      await refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operația TV a eșuat.");
      return false;
    } finally { setBusy(false); }
  };
  return { devices: state?.devices ?? [], loaded: state !== null, error, busy, refresh, mutate };
}
