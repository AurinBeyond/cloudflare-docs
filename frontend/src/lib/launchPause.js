/**
 * §LAUNCH-PAUSE 2026-02 — single source of truth for the site-wide
 * Launch Pause Mode. While this is `true`, every active checkout CTA
 * (Gumroad + LemonSqueezy) renders as a calm "Coming soon" pill via
 * <LaunchPauseButton />. Flip to `false` and the entire site returns
 * to its prior behaviour with no other code changes.
 *
 * Founder mandate (2026-02): "Ükski külastaja ei saa enne lõplikku
 * PSP/valuuta otsust kogemata osta valest süsteemist ega ka valet
 * toodet, vöi toodet mida ei ole olemas."
 *
 * Nothing else is deleted. Pages, prices, copy, and the underlying
 * Gumroad/LemonSqueezy URLs all stay in the codebase, just hidden
 * behind this flag.
 */
export const LAUNCH_PAUSE = true;

/* Default copy beneath the "Coming soon" pill on the four headline
 * Gumroad pages (Seven Quiet Nights, The Hearth, Family Bundle).
 * Alistair uses its own variant — see `PAUSE_SUBTEXT_ALISTAIR` below. */
export const PAUSE_SUBTEXT_DEFAULT =
  "Purchases are paused while we finish the catalogue. " +
  "Write to info@prulesoul.site to be the first to know when they re-open.";

/* Alistair-specific copy: 21 letters are not yet authored, so we do
 * not even invite a waitlist. */
export const PAUSE_SUBTEXT_ALISTAIR =
  "We are finishing the letters before we open the shelf. " +
  "When the 21 transmissions are ready, the door will open quietly.";
