import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Library as LibraryIcon, LineChart, UserCircle2, LogIn, LogOut, ShieldCheck, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { resetAgeConfirmation } from "@/components/AgeGate";
import StudentCabinet from "@/components/StudentCabinet";
import { useEffect, useState } from "react";
import { track } from "@/lib/telemetry";
import { api } from "@/lib/api";

const PREVIEW_BLOCKS = [
  {
    title: "My Content",
    description: "Books, readings, and quiet sessions you have unlocked.",
    icon: LibraryIcon,
  },
  {
    title: "My Progress",
    description: "A quiet overview of what you have moved through.",
    icon: LineChart,
  },
  {
    title: "Account",
    description: "Your profile, preferences, and access.",
    icon: UserCircle2,
  },
];

export default function UserPortal() {
  const { user, loading, logout } = useAuth();
  const [resetMsg, setResetMsg] = useState("");
  const [params] = useSearchParams();
  const next = params.get("next");

  // After sign-in, if a `?next=` was requested, send the user there.
  useEffect(() => {
    track("portal_open");
    if (!loading && user && next) {
      // Only follow same-origin paths.
      if (next.startsWith("/") && !next.startsWith("//")) {
        track("signed_in");
        window.location.replace(next);
      }
    }
  }, [user, loading, next]);

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  // §Phase 1 2026-02-14 — Google OAuth button removed from the
  // portal per founder mandate (email-only entry). handleSignIn
  // retained as dead code in case the founder ever re-opens Google
  // auth as a fallback; not referenced from any rendered JSX.
  // eslint-disable-next-line no-unused-vars
  const handleSignIn = () => {
    const target = next && next.startsWith("/") && !next.startsWith("//")
      ? `/portal?next=${encodeURIComponent(next)}`
      : "/portal";
    const redirectUrl = window.location.origin + target;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  const handleResetAge = () => {
    resetAgeConfirmation();
    setResetMsg("18+ confirmation cleared on this device.");
    setTimeout(() => setResetMsg(""), 3500);
  };

  return (
    <div data-testid="page-portal">
      <PageHeader
        tone="portal"
        eyebrow="Portal"
        title={user ? "Welcome back," : "A small place"}
        italicWord={user ? user.name?.split(" ")[0] || "friend" : "that stays yours."}
        description={
          user
            ? "This is yours. As things open, they will quietly appear here."
            : "What you read, what you write, what you keep — held in one place. Enter your email below to receive a quiet access link."
        }
      >
        {loading ? (
          <span className="aurin-chip" data-testid="portal-loading">checking session…</span>
        ) : user ? (
          <div className="flex flex-wrap items-center gap-3" data-testid="portal-signed-in">
            <span className="aurin-chip">{user.email}</span>
            <span className="aurin-chip">role · {user.role || "member"}</span>
            <button
              onClick={logout}
              data-testid="portal-logout"
              className="aurin-btn aurin-btn-ghost"
            >
              Sign out <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div className="space-y-4" data-testid="portal-signed-out">
            <MagicLinkEntry next={next} />
            <p
              data-testid="portal-consent-line"
              className="text-[12px] text-[hsl(var(--aurin-text-muted))] max-w-[58ch] leading-relaxed"
            >
              By continuing, you agree that your account may be used to send
              occasional updates. You can opt out at any time. Your reflections
              and personal inputs are private and stored securely using
              industry-standard protection.
            </p>
          </div>
        )}
      </PageHeader>

      {/* Purpose */}
      <section className="aurin-section-sm border-b border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="aurin-eyebrow mb-5">Purpose</div>
            <h2 className="aurin-display text-3xl md:text-4xl max-w-[18ch]">
              Everything you need,{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                in one place.
              </span>
            </h2>
          </div>
          <div className="md:col-span-7 text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
            <p>
              When members' content opens, this is where it lives. Books you've
              bought, what you've written, what you've returned to. Quiet,
              private, and yours.
            </p>
          </div>
        </div>
      </section>

      {/* Signed-in: Student Cabinet · Signed-out: gentle preview */}
      <section className="aurin-section-sm">
        <div className="aurin-container">
          {user ? (
            <>
              <div className="aurin-eyebrow mb-5">Your room</div>
              <h2 className="aurin-display text-3xl md:text-4xl max-w-[22ch] mb-12">
                You don't have to{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  start over.
                </span>
              </h2>
              <StudentCabinet user={user} />
            </>
          ) : (
            <>
              <div className="aurin-eyebrow mb-5">A small preview</div>
              <h2 className="aurin-display text-3xl md:text-4xl max-w-[22ch] mb-12">
                What will quietly live{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sand))]">
                  here.
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5" data-testid="portal-preview-grid">
                {PREVIEW_BLOCKS.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title} data-testid={`portal-preview-${i}`} className="aurin-card p-8 relative">
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-text-muted))]">
                          <Icon size={18} strokeWidth={1.4} />
                        </div>
                        <span className="text-[10.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                          Placeholder
                        </span>
                      </div>
                      <h3 className="aurin-display text-2xl mt-7">{b.title}</h3>
                      <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                        {b.description}
                      </p>
                      <div className="mt-7 space-y-2.5" aria-hidden="true">
                        <div className="h-[6px] w-full rounded-full bg-[hsl(var(--aurin-border-soft))]" />
                        <div className="h-[6px] w-3/4 rounded-full bg-[hsl(var(--aurin-border-soft))]" />
                        <div className="h-[6px] w-2/3 rounded-full bg-[hsl(var(--aurin-border-soft))]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="aurin-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={14} className="text-[hsl(var(--aurin-sage))]" />
                <div className="aurin-eyebrow !mb-0">Adult sections · 18+</div>
              </div>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                Learning and Meditations are gated by a one-time confirmation
                stored on this device. You can clear it any time:
              </p>
              <button
                onClick={handleResetAge}
                data-testid="portal-reset-age"
                className="aurin-btn aurin-btn-ghost mt-4"
              >
                Forget my 18+ confirmation
              </button>
              {resetMsg && (
                <div data-testid="portal-reset-age-msg" className="mt-3 text-[12.5px] text-[hsl(var(--aurin-sage))]">
                  {resetMsg}
                </div>
              )}
            </div>

            <Link to="/legal" className="aurin-card p-6 hover:border-[hsl(var(--aurin-sage))] transition-colors" data-testid="portal-legal-link">
              <div className="aurin-eyebrow mb-3">Trust</div>
              <h3 className="aurin-display text-xl">Read the Legal · Responsibility</h3>
              <p className="mt-3 text-[14px] text-[hsl(var(--aurin-text-muted))] leading-relaxed">
                Terms, user responsibility, and the refund policy that backs the
                Bookstore.
              </p>
              <div className="mt-4 text-[13px] text-[hsl(var(--aurin-sage))]">Open →</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MagicLinkEntry({ next }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/magic-link/request", {
        email: email.trim().toLowerCase(),
        redirect_to: next && next.startsWith("/") && !next.startsWith("//") ? next : "/portal",
      });
      track("portal_magic_link_request");
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not send the link. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div data-testid="portal-magic-sent" className="aurin-card p-5 max-w-[480px]">
        <p className="aurin-display text-[18px] mb-2">A quiet link is on its way.</p>
        <p className="text-[13px] text-[hsl(var(--aurin-text-muted))] leading-relaxed">
          Open the email we just sent and click the link to step into your
          private layer. The link is valid for 30 minutes and works once.
        </p>
        {/* §Phase 1 2026-02-14 — visible, friendlier spam hint. Several
            inbox providers (mail.com, AOL, outlook.com) sometimes route
            new-sender transactional mail to Junk for the first 1-2
            messages until the sender's domain reputation settles.
            Surfacing this prevents wanderers from feeling abandoned. */}
        <div
          data-testid="portal-magic-spam-hint"
          className="mt-4 p-3 rounded-sm bg-[hsl(var(--aurin-sage))/0.06] border border-[hsl(var(--aurin-sage))/0.18] text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text))]"
        >
          <p className="mb-1.5">
            <strong className="font-semibold">If you don't see it within a minute,</strong>{" "}
            please check your <strong>Spam</strong> or <strong>Junk</strong> folder —
            some email providers route new senders there briefly.
          </p>
          <p className="text-[hsl(var(--aurin-text-muted))]">
            The link itself is safe to open. Marking the message as
            "Not spam" helps it land in your inbox next time.
          </p>
        </div>
        <p className="mt-3 text-[12px] text-[hsl(var(--aurin-text-muted))/0.7]">
          Still nothing?{" "}
          <button
            type="button"
            onClick={() => setDone(false)}
            className="aurin-link"
            data-testid="portal-magic-send-again"
          >
            Send another
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      data-testid="portal-magic-form"
      className="flex flex-col sm:flex-row gap-2 max-w-[480px]"
    >
      <div className="relative flex-1">
        <Mail
          size={14}
          strokeWidth={1.6}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--aurin-text-muted))]"
          aria-hidden
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email"
          data-testid="portal-magic-email"
          className="w-full bg-transparent border border-[hsl(var(--aurin-sage))/0.4] rounded-sm pl-9 pr-3 py-2.5 text-[14px] focus:outline-none focus:border-[hsl(var(--aurin-sage))]"
        />
      </div>
      <button
        type="submit"
        disabled={busy || !email.includes("@")}
        data-testid="portal-magic-send"
        className="aurin-btn aurin-btn-primary"
      >
        {busy ? "Sending…" : "Send a quiet link"}
        <LogIn size={13} />
      </button>
      {error && (
        <span
          className="text-[12.5px] text-[#c97070] sm:ml-2 sm:self-center"
          data-testid="portal-magic-error"
        >
          {error}
        </span>
      )}
    </form>
  );
}
