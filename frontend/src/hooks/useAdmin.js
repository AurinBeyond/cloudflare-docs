import { useEffect, useState } from "react";

/**
 * useAdmin — true if a valid ADMIN_TOKEN is present in localStorage
 * (or in the current URL as ?token=...). Once present, the token is
 * remembered for this browser only.
 *
 * Usage:
 *   const { isAdmin, token } = useAdmin();
 *   if (isAdmin) {
 *     // unlock "May 18" buttons, render preview download links, etc.
 *   }
 */
export function useAdmin() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("aurin_admin_token") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = (params.get("token") || "").trim();
      if (t && t.length >= 16) {
        setToken(t);
        try {
          localStorage.setItem("aurin_admin_token", t);
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // We never validate the token client-side — only the backend can do
  // that. Treat presence-of-non-empty-string as "claim of admin"; the
  // backend will reject any actual admin API call with the wrong value.
  return { isAdmin: Boolean(token), token };
}
