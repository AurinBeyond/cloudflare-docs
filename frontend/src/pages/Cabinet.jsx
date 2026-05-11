/**
 * Cabinet.jsx — Holographic Booking Cabinet (§10).
 *
 * Wrapper page for /cabinet/booking. Hosts HolographicCalendar between
 * the two guide hologram presence cues. Wrapped at App-level by
 * <WandererGate scope="private"> so first-time visitors must accept
 * the agreement before entering.
 */
import HolographicCalendar from "@/components/HolographicCalendar";

export default function Cabinet() {
  return (
    <div data-testid="page-cabinet-booking" className="min-h-screen">
      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[960px]">
          <header className="text-center mb-10 space-y-4">
            <div className="text-xs uppercase tracking-[0.22em] opacity-60">
              The Cabinet · Quiet hours
            </div>
            <h1 className="aurin-display text-3xl md:text-4xl leading-tight">
              Hold a time. The room will be ready.
            </h1>
            <p className="aurin-body max-w-[560px] mx-auto opacity-80">
              Choose a guide, a shape, and an hour. Nothing is locked. You may release a held
              hour at any time without explanation.
            </p>
          </header>

          <HolographicCalendar />

          <footer className="mt-16 text-center text-xs opacity-60 max-w-[520px] mx-auto leading-relaxed">
            The mentor is not a clinician. If the wave grows bigger than the room can hold,
            see the Wanderer's Agreement for the human supports listed there.
          </footer>
        </div>
      </section>
    </div>
  );
}
