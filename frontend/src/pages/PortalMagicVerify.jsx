/**
 * PortalMagicVerify.jsx — §Phase 1 Identity / Entry.
 *
 * Handles the email magic-link landing URL: /portal/magic?token=...
 *
 * Calls the backend `/api/auth/magic-link/verify` (which sets the
 * httpOnly session cookie AND returns a session_token), stores the
 * token in our localStorage shim for non-cookie clients, refreshes
 * AuthProvider, and redirects to the original `redirect_to` (or
 * /portal as a calm default).
 *
 * No new architecture — this is the missing landing page that makes
 * the magic-link flow operational end-to-end.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, setSessionToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthProvider";

export default function PortalMagicVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [status, setStatus] = useState("verifying"); // verifying | ok | error
  const [errorDetail, setErrorDetail] = useState("");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setErrorDetail("This link is missing its token. Request a fresh one.");
      return;
    }
    (async () => {
      try {
        const r = await api.post(
          `/auth/magic-link/verify?token=${encodeURIComponent(token)}`
        );
        if (r.data?.session_token) {
          setSessionToken(r.data.session_token);
        }
        await refresh();
        setStatus("ok");
        const next = r.data?.redirect_to || "/portal";
        // Brief pause so the human sees the calm confirmation.
        setTimeout(() => navigate(next, { replace: true }), 900);
      } catch (e) {
        setStatus("error");
        const code = e?.response?.status;
        const detail =
          e?.response?.data?.detail ||
          (code === 410 ? "This link has expired or already been used."
            : code === 404 ? "This link could not be found."
            : "We couldn't verify this link. Please request a fresh one.");
        setErrorDetail(detail);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className="aurin-section min-h-[60vh] flex items-center justify-center"
      data-testid="portal-magic-verify"
    >
      <div className="aurin-container max-w-[480px] text-center">
        <div className="aurin-eyebrow">Portal</div>
        {status === "verifying" && (
          <>
            <h1
              className="aurin-display text-2xl md:text-3xl mt-2"
              data-testid="portal-magic-verifying"
            >
              Opening the door…
            </h1>
            <p className="mt-3 text-[13.5px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
              One small breath.
            </p>
          </>
        )}
        {status === "ok" && (
          <>
            <h1
              className="aurin-display text-2xl md:text-3xl mt-2"
              data-testid="portal-magic-ok"
            >
              You are in.
            </h1>
            <p className="mt-3 text-[13.5px] text-[hsl(var(--aurin-text-muted))]">
              Quietly stepping you through…
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1
              className="aurin-display text-2xl md:text-3xl mt-2"
              data-testid="portal-magic-error"
            >
              The link did not open.
            </h1>
            <p className="mt-3 text-[13.5px] text-[hsl(var(--aurin-text-muted))]">
              {errorDetail}
            </p>
            <a
              href="/portal"
              className="aurin-btn aurin-btn-primary mt-5"
              data-testid="portal-magic-retry"
            >
              Request a fresh link
            </a>
          </>
        )}
      </div>
    </section>
  );
}
