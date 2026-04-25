import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Library as LibraryIcon, LineChart, UserCircle2, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { resetAgeConfirmation } from "@/components/AgeGate";
import { useEffect, useState } from "react";

const PREVIEW_BLOCKS = [
  {
    title: "My Content",
    description: "Books, protocols, and sessions you have unlocked.",
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
    if (!loading && user && next) {
      // Only follow same-origin paths.
      if (next.startsWith("/") && !next.startsWith("//")) {
        window.location.replace(next);
      }
    }
  }, [user, loading, next]);

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
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
        eyebrow="User Portal · Your Personal Area"
        title={user ? "Welcome back," : "A structured space"}
        italicWord={user ? user.name?.split(" ")[0] || "friend" : "that stays yours."}
        description={
          user
            ? "This is your personal area. As content unlocks become available, they will appear here under My Content."
            : "Your journey through Matrix Aurin lives here — your content, your progress, your account. Sign in with Google to begin."
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
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSignIn}
              data-testid="portal-sign-in"
              className="aurin-btn aurin-btn-primary"
            >
              Sign in with Google <LogIn size={13} />
            </button>
            <span className="aurin-chip" data-testid="portal-availability-chip">
              · Email-based, via Emergent Auth
            </span>
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
              When member content opens, the Portal will give you access to your
              purchased content, personal area, and progress through the Genesis
              Protocols. Sign-in is wired today; member-only unlocks turn on as
              the Bookstore goes live.
            </p>
          </div>
        </div>
      </section>

      {/* Structural preview */}
      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="aurin-eyebrow mb-5">Structural Preview</div>
          <h2 className="aurin-display text-3xl md:text-4xl max-w-[22ch] mb-12">
            The shape of the{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sand))]">
              Portal.
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
                      {user ? "Reserved" : "Placeholder"}
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
