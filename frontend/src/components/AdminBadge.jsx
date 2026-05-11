import { useAdmin } from "@/hooks/useAdmin";

/**
 * AdminBadge — small fixed strip shown only when an admin token is in
 * localStorage. Lets the founder visually confirm she's currently
 * browsing the LIVE site as an admin (every "May 18" button is
 * unlocked, every paid PDF streams directly).
 */
export default function AdminBadge() {
  const { isAdmin } = useAdmin();
  if (!isAdmin) return null;

  const handleExit = () => {
    try {
      localStorage.removeItem("aurin_admin_token");
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <div
      data-testid="admin-badge"
      className="fixed bottom-3 right-3 z-[60] aurin-card !py-1.5 !px-3 flex items-center gap-3 text-[11px]"
      style={{ borderColor: "hsl(var(--aurin-sage) / 0.55)" }}
    >
      <span className="font-mono uppercase tracking-[0.18em] text-[hsl(var(--aurin-sage))]">
        admin · live preview
      </span>
      <button
        onClick={handleExit}
        className="text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-text))] transition-colors"
        data-testid="admin-badge-exit"
        title="Stop previewing as admin in this browser"
      >
        exit
      </button>
    </div>
  );
}
