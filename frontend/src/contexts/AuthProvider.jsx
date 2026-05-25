import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getSessionToken, setSessionToken } from "@/lib/api";

const AuthCtx = createContext({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getSessionToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      setSessionToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    }
    setSessionToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // §REFERRAL 2026-02-09 — Capture ?ref=AURIN... from any landing
    // URL into localStorage. Auto-claim it the moment the user has
    // a valid session (via the secondary effect below). This keeps
    // the share link click → reward chain unbroken across the
    // OAuth / magic-link round-trips.
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref && /^AURIN[A-Z0-9]+$/i.test(ref)) {
        localStorage.setItem("aurin_pending_ref", ref.toUpperCase());
      }
    } catch {}

    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      // AuthCallback will handle it.
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh]);

  // Once we have an authenticated user, fire any pending referral
  // claim ONCE. Fail-soft: the user never sees a referral error.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    try {
      const pending = localStorage.getItem("aurin_pending_ref");
      if (!pending) return;
      api.post("/referral/claim", { code: pending })
        .catch(() => {})
        .finally(() => {
          if (alive) localStorage.removeItem("aurin_pending_ref");
        });
    } catch {}
    return () => { alive = false; };
  }, [user]);

  return (
    <AuthCtx.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
