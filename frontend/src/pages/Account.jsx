/**
 * Account.jsx — `/account`  (§GDPR 2026-02-29)
 *
 * Wanderer-facing account home. Exposes:
 *   · Signed-in identity
 *   · GDPR Art. 15 — Download my data (JSON)
 *   · GDPR Art. 17 — Delete my account (with confirmation gate)
 *   · Quiet links to /legal, /pricing
 *
 * No analytics, no marketing copy. This is the place a regulator
 * (and the wanderer) lands when they want to exercise their rights.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { BACKEND_URL } from "@/lib/backendUrl";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function Account() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (cancelled) return;
        if (res.status === 401) {
          navigate(`/login?next=${encodeURIComponent("/account")}`, { replace: true });
          return;
        }
        const data = await res.json();
        setMe(data);
      } catch {
        setError("Could not load your account. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/account/data-export`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`export_${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aurin-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setFeedback("Your data file has been downloaded.");
    } catch (e) {
      setError("Export failed. Please try again or write to info@prulesoul.site.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== "delete my account") return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/account/delete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "delete-my-account" }),
      });
      if (!res.ok) throw new Error(`delete_${res.status}`);
      // Sign-out happens server-side. Move to home with a calm note.
      navigate("/?account=deleted", { replace: true });
    } catch (e) {
      setError("Deletion failed. Please write to info@prulesoul.site and we will remove your data manually.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div data-testid="page-account-loading" className="aurin-section">
        <div className="aurin-container max-w-[700px] py-20">
          <p className="text-[14px] italic text-[hsl(var(--aurin-text-muted))]">
            Opening your account…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="page-account">
      <PageHeader
        tone="default"
        eyebrow="Your account"
        title="Your room key,"
        italicWord="and your rights."
        description="Sign-in details, your subscription, and the EU GDPR rights you can exercise directly from this page."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[700px] space-y-10">
          {/* ── Identity card ──────────────────────────────────── */}
          <article
            className="aurin-card p-7"
            data-testid="account-identity-card"
          >
            <p className="aurin-eyebrow mb-3">Signed in</p>
            <p
              className="text-[20px] font-light mb-1"
              style={{ fontFamily: SERIF }}
            >
              {me?.email || me?.name || "You"}
            </p>
            <p className="text-[13px] text-[hsl(var(--aurin-text-muted))]">
              User ID · <span className="font-mono">{me?.user_id?.slice(0, 18)}…</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/pricing"
                data-testid="account-pricing-link"
                className="aurin-btn aurin-btn-ghost text-[12.5px]"
              >
                Manage subscription
              </Link>
              <Link
                to="/legal"
                data-testid="account-legal-link"
                className="aurin-btn aurin-btn-ghost text-[12.5px]"
              >
                Read the legal page
              </Link>
            </div>
          </article>

          {/* ── GDPR Art. 15 ──────────────────────────────────── */}
          <article
            className="aurin-card p-7"
            data-testid="account-export-card"
          >
            <p className="aurin-eyebrow mb-3">GDPR · Article 15</p>
            <h2
              className="text-[22px] font-light mb-3"
              style={{ fontFamily: SERIF }}
            >
              Download my data
            </h2>
            <p className="text-[14px] leading-[1.75] text-[hsl(var(--aurin-text))/0.82] mb-5">
              You can download a JSON file containing every row we
              hold tied to your account — your intake answers, voice-
              minute ledger, support messages, and any other record
              connected to your user ID. It is yours to keep.
            </p>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              data-testid="account-export-btn"
              className="aurin-btn aurin-btn-primary text-[13px] disabled:opacity-60"
            >
              {exporting ? "Preparing your file…" : "Download my data (.json)"}
            </button>
            {feedback && (
              <p
                className="mt-3 text-[12.5px] text-[hsl(var(--aurin-sage))]"
                data-testid="account-export-feedback"
              >
                {feedback}
              </p>
            )}
          </article>

          {/* ── GDPR Art. 17 ──────────────────────────────────── */}
          <article
            className="aurin-card p-7 border border-rose-500/30"
            data-testid="account-delete-card"
          >
            <p className="aurin-eyebrow mb-3">GDPR · Article 17</p>
            <h2
              className="text-[22px] font-light mb-3"
              style={{ fontFamily: SERIF }}
            >
              Delete my account
            </h2>
            <p className="text-[14px] leading-[1.75] text-[hsl(var(--aurin-text))/0.82] mb-5">
              This irreversibly removes your account, your room memory,
              your voice-minute balance, and every row tied to your
              user ID. Payment records required by EU accounting law
              (Art. 6(1)(c)) are kept in anonymised form for the
              statutory 7 years; nothing else is.
            </p>

            {!confirmOpen ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                data-testid="account-delete-open-btn"
                className="aurin-btn aurin-btn-ghost text-[13px]"
                style={{
                  borderColor: "rgba(244, 113, 113, 0.5)",
                  color: "#f47171",
                }}
              >
                Begin deletion
              </button>
            ) : (
              <div data-testid="account-delete-confirm-block" className="space-y-4">
                <p className="text-[13px] text-[hsl(var(--aurin-text))/0.78]">
                  Type{" "}
                  <code className="px-2 py-0.5 bg-[hsl(var(--aurin-bg))/0.6] text-[hsl(var(--aurin-text))]">
                    delete my account
                  </code>{" "}
                  to confirm. This cannot be undone.
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete my account"
                  data-testid="account-delete-confirm-input"
                  className="w-full px-3 py-2 bg-[hsl(var(--aurin-bg))/0.6] border border-[hsl(var(--aurin-border-soft))] text-[14px] outline-none focus:border-rose-400/60"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || confirmText !== "delete my account"}
                    data-testid="account-delete-confirm-btn"
                    className="aurin-btn text-[13px] disabled:opacity-50"
                    style={{
                      background: "#9a3a3a",
                      color: "#fff",
                      borderColor: "#9a3a3a",
                    }}
                  >
                    {deleting ? "Deleting…" : "Delete forever"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmOpen(false);
                      setConfirmText("");
                    }}
                    disabled={deleting}
                    data-testid="account-delete-cancel-btn"
                    className="aurin-btn aurin-btn-ghost text-[13px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </article>

          {error && (
            <p
              className="text-[13px] text-rose-400"
              data-testid="account-error"
            >
              {error}
            </p>
          )}

          <p className="text-[12.5px] italic text-[hsl(var(--aurin-text-muted))] text-center">
            Prefer to talk to a person? Write to{" "}
            <a
              href="mailto:info@prulesoul.site"
              className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
            >
              info@prulesoul.site
            </a>
            . We answer within five working days.
          </p>
        </div>
      </section>
    </div>
  );
}
