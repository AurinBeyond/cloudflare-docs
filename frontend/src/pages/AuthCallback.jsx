import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setSessionToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthProvider";

/**
 * Handles the Emergent Google Auth callback.
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    const sessionId = m ? decodeURIComponent(m[1]) : null;

    if (!sessionId) {
      navigate("/portal", { replace: true });
      return;
    }

    (async () => {
      try {
        const res = await api.post("/auth/session", { session_id: sessionId });
        if (res.data?.session_token) setSessionToken(res.data.session_token);
        await refresh();
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/portal", { replace: true });
      } catch (e) {
        setError("Sign-in could not be completed. Please try again.");
      }
    })();
  }, [navigate, refresh]);

  return (
    <div
      data-testid="auth-callback"
      className="aurin-container py-40 text-center text-[hsl(var(--aurin-text-muted))]"
    >
      {error ? error : "Signing you in…"}
    </div>
  );
}
