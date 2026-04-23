import PageHeader from "@/components/layout/PageHeader";
import { Library, LineChart, UserCircle2, Lock } from "lucide-react";

const PREVIEW_BLOCKS = [
  {
    title: "My Content",
    description: "Books, protocols, and sessions you have unlocked.",
    icon: Library,
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
  return (
    <div data-testid="page-portal">
      <PageHeader
        tone="portal"
        eyebrow="User Portal · Your Personal Area"
        title="A structured space"
        italicWord="that stays yours."
        description="The User Portal is where your journey through Matrix Aurin lives — your content, your progress, your account. Accounts are not yet open. What you see below is a preview of the shape the space will take."
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            data-testid="portal-sign-in"
            disabled
            aria-disabled="true"
            className="aurin-btn aurin-btn-primary opacity-60 cursor-not-allowed"
            title="Sign in is not yet available"
          >
            Sign In
            <Lock size={13} />
          </button>
          <button
            data-testid="portal-register"
            disabled
            aria-disabled="true"
            className="aurin-btn aurin-btn-ghost opacity-60 cursor-not-allowed"
            title="Registration is not yet available"
          >
            Register
          </button>
          <span
            className="aurin-chip"
            data-testid="portal-availability-chip"
          >
            · Access opens soon
          </span>
        </div>
      </PageHeader>

      {/* PURPOSE */}
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
              When accounts open, the Portal will give you access to your
              purchased content, personal area, and progress through the
              Genesis Protocols. It stays quiet and intentional — the same
              tone as the rest of the system.
            </p>
            <p className="mt-5">
              For now, nothing is active here. This page exists so the
              structure is visible, and so you know where your space will be.
            </p>
          </div>
        </div>
      </section>

      {/* STRUCTURAL PREVIEW */}
      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="aurin-eyebrow mb-5">Structural Preview</div>
          <h2 className="aurin-display text-3xl md:text-4xl max-w-[22ch] mb-12">
            The shape of the{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sand))]">
              Portal.
            </span>
          </h2>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            data-testid="portal-preview-grid"
          >
            {PREVIEW_BLOCKS.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  data-testid={`portal-preview-${i}`}
                  className="aurin-card p-8 relative"
                >
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

                  {/* Visual stand-in lines */}
                  <div className="mt-7 space-y-2.5" aria-hidden="true">
                    <div className="h-[6px] w-full rounded-full bg-[hsl(var(--aurin-border-soft))]" />
                    <div className="h-[6px] w-3/4 rounded-full bg-[hsl(var(--aurin-border-soft))]" />
                    <div className="h-[6px] w-2/3 rounded-full bg-[hsl(var(--aurin-border-soft))]" />
                  </div>
                </div>
              );
            })}
          </div>

          <p
            className="mt-10 text-[13px] text-[hsl(var(--aurin-text-muted))]"
            data-testid="portal-preview-note"
          >
            These are structural placeholders. No data, no dashboards, no
            account logic yet — only the architecture reserved for what comes
            next.
          </p>
        </div>
      </section>
    </div>
  );
}
