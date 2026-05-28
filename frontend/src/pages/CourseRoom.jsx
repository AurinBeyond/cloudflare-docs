import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import FirstLetterWidget from "@/components/FirstLetterWidget";
import RoomConvaiChat from "@/components/RoomConvaiChat"; // eslint-disable-line no-unused-vars
// §AUDIT-SCALE 2026-05-20 — Course Room joins Clarity in tracking
// presence_seconds so Alistair's voice sessions decrement credits.
import ConvaiPresenceTracker from "@/components/ConvaiPresenceTracker";
import AlistairModeSelector from "@/components/AlistairModeSelector";
import CuratorIntroCard, { CURATOR_PALETTES } from "@/components/CuratorIntroCard";
import SpatialCompass from "@/components/SpatialCompass";
import { fetchCourses } from "@/lib/api";
import { useAuth } from "@/contexts/AuthProvider";
import {
  ArrowRight,
  Mail,
  Headphones,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { track } from "@/lib/telemetry";

/**
 * /course-room — Quiet Letters.
 *
 * A reading + writing room. Each course is 7 short letters delivered
 * one-per-day. Letter 1 is always free preview. Each course pairs
 * with a single looping audio companion — meant to be played on soft
 * repeat (5–7 cycles) while the wanderer reads or writes.
 *
 * Soft conversion architecture (not pushy):
 *   - Free letter 1 = the open door
 *   - Audio companion = a small gift before the threshold
 *   - "Begin gently" = enrollment for beta users (free 14-day window)
 *
 * The Course Room is intentionally structured as a quiet shelf, not a
 * marketplace. Readers pick the letter series whose title resonates,
 * not the cheapest. Pricing is small ($20–$25) and visible only at
 * the bottom of each card.
 */

const COURSE_ICON = {
  "letting-the-old-stories-rest": Sparkles,
  "the-language-you-forgot": Mail,
  "seven-quiet-evenings-with-children": HeartHandshake,
  "the-body-knows-first": Headphones,
};

export default function CourseRoom() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    track("course_room_open");
    let alive = true;
    (async () => {
      try {
        const data = await fetchCourses();
        if (alive) setCourses(data.courses || []);
      } catch {
        if (alive) setCourses([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-testid="course-room-page" className="sanctuary-room relative">
      <PageHeader
        eyebrow="W · 270° · Alistair"
        title="Strategic"
        italicWord="Architecture"
        description="Not a course shelf. A protocol library. Each transmission is a single short letter, released on a 24-hour cadence-lock — no binge, no dopamine loop. You read one. You sit with it. The next will not arrive before its hour. This is how high-bandwidth operators retrain their own operating system."
        testid="course-room-header"
      />

      {/* §CURATOR-INTRO 2026-05-28 — Alistair's pre-recorded 15s hello. */}
      <section className="aurin-section-sm" data-testid="course-room-alistair-intro">
        <div className="aurin-container max-w-[760px]">
          <CuratorIntroCard slug="alistair" eyebrow="✦ Meet your curator" {...CURATOR_PALETTES.alistair} />
        </div>
      </section>

      {/* §Phase B (2026-02-15) — Alistair ConvAI is mounted at the
          top of Course Room. Alistair is the dedicated learning-
          orientation voice agent configured by founder in the
          ElevenLabs UI; he is strictly isolated from Grace / Kaelan
          / Sara. */}
      <section className="aurin-section-sm" data-testid="course-room-alistair">
        <div className="aurin-container max-w-[760px]">
          {/* §AUDIT-SCALE 2026-05-20 — Tracker wraps RoomConvaiChat
              internally so we do not double-mount the SDK. */}
          <ConvaiPresenceTracker room="courses" />
        </div>
      </section>

      {/* §ALISTAIR-PERSONA 2026-02-09 — Adult-clarity persona MVP.
          Optional pre-session focus selector for Alistair. */}
      <section className="aurin-section-sm" data-testid="course-room-mode-section">
        <div className="aurin-container max-w-[760px]">
          <AlistairModeSelector />
        </div>
      </section>

      {/* §SPATIAL-COMPASS 2026-05-28 — Three ancient principles of
          spatial biomechanics, on Alistair's shelf. Anti-wellness:
          structural nervous-system hygiene for high-performers. */}
      <section className="aurin-section-sm" data-testid="course-room-spatial-compass">
        <div className="aurin-container max-w-[1080px]">
          <SpatialCompass />
        </div>
      </section>

      <section className="aurin-section-sm" data-testid="course-room-intro">
        <div className="aurin-container max-w-[760px]">
          <div className="aurin-card p-6 md:p-8">
            <p className="aurin-eyebrow text-[10.5px] tracking-[0.36em] uppercase text-[hsl(var(--aurin-sage))] mb-3">
              Protocol structure
            </p>
            <p className="text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))]">
              This is not a course. It is a quiet command sequence. Each
              transmission is a single short letter — one page, one precise
              question, one structural lever. Read once. Sit. Execute one
              line if the body permits. The next letter is locked behind a
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]"> 24-hour cadence-gate</span> —
              not because the system is slow, but because cognitive
              integration is.
            </p>
            <p className="mt-4 text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))]">
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                Anti-dopamine by design.
              </span>{" "}
              You cannot binge a re-architecture. The first transmission is
              always open — read it before deciding anything.
            </p>
            {/* §CHRONO-LOCK 2026-02-11 — Visualise the 24-hour cadence
                gate so high-net-worth users understand the constraint
                is the feature, not a limitation. */}
            <div
              className="mt-6 grid grid-cols-3 gap-2 text-center"
              data-testid="course-room-chrono-strip"
            >
              {[
                { code: "T-0", label: "Read" },
                { code: "+24h", label: "Integrate" },
                { code: "+48h", label: "Next gate opens" },
              ].map((s) => (
                <div
                  key={s.code}
                  className="border border-[hsl(var(--aurin-sage))]/30 py-2 px-3"
                  data-testid={`chrono-step-${s.code.toLowerCase()}`}
                >
                  <p className="text-[10px] tracking-[0.22em] uppercase text-[hsl(var(--aurin-sage))]">
                    {s.code}
                  </p>
                  <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="aurin-section-sm" data-testid="course-room-list">
        <div className="aurin-container">
          {loading && (
            <p
              className="text-[14px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]"
              data-testid="course-room-loading"
            >
              A small breath…
            </p>
          )}
          {!loading && courses.length === 0 && (
            <p
              className="text-[14px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]"
              data-testid="course-room-empty"
            >
              The shelf is being prepared. Come back soon.
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((c) => {
              const Icon = COURSE_ICON[c.slug] || Mail;
              return (
                <article
                  key={c.slug}
                  data-testid={`course-card-${c.slug}`}
                  className="aurin-card p-6 md:p-7 flex flex-col"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-full border border-[hsl(var(--aurin-sage))]/40">
                      <Icon
                        size={18}
                        strokeWidth={1.4}
                        className="text-[hsl(var(--aurin-sage))]"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="aurin-eyebrow text-[11px]">
                        {c.duration_days} letters · {c.audience}
                      </div>
                      <h3
                        className="aurin-display mt-1 text-[22px] leading-[1.25]"
                        data-testid={`course-title-${c.slug}`}
                      >
                        {c.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-[14px] leading-[1.8] text-[hsl(var(--aurin-text-muted))]">
                    {c.blurb}
                  </p>
                  <p
                    className="mt-3 text-[12.5px] leading-[1.7] text-[hsl(var(--aurin-text-muted))/0.75] aurin-serif-italic"
                    data-testid={`course-format-${c.slug}`}
                  >
                    {`${c.duration_days} transmissions · 24-hour cadence-lock between each · Audio sub-channel runs in parallel.`}
                  </p>
                  {c.audio_title && (
                    <div
                      className="mt-4 inline-flex items-center gap-2 text-[12px] text-[hsl(var(--aurin-text-muted))]"
                      data-testid={`course-audio-tag-${c.slug}`}
                    >
                      <Headphones
                        size={12}
                        strokeWidth={1.4}
                        className="text-[hsl(var(--aurin-sage))]"
                      />
                      Audio companion · {c.audio_title}
                    </div>
                  )}
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-[hsl(var(--aurin-border-soft))] mt-6">
                    <span
                      className="text-[13px] text-[hsl(var(--aurin-text-muted))]"
                      data-testid={`course-price-${c.slug}`}
                    >
                      {c.price ? `$${c.price.toFixed(0)}` : "Free"}
                      <span className="opacity-70"> · transmission 1 open</span>
                    </span>
                    <Link
                      to={`/course-room/${c.slug}`}
                      data-testid={`course-open-${c.slug}`}
                      className="aurin-link inline-flex items-center gap-1 text-[13px]"
                    >
                      Activate sequence
                      <ArrowRight size={14} strokeWidth={1.4} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="aurin-section-sm"
        data-testid="course-room-bridge"
      >
        <div className="aurin-container max-w-[680px]">
          <div className="aurin-card p-6 md:p-8 text-center">
            <p className="aurin-serif-italic text-[15px] text-[hsl(var(--aurin-text))]">
              Architecture is not always cognitive.
            </p>
            <p className="mt-3 text-[13.5px] text-[hsl(var(--aurin-text-muted))]">
              When a transmission triggers something structural in the
              hardware, the adjacent compass headings handle it directly:
              {" "}<Link className="aurin-link" to="/body-room">N · Body Architecture</Link>{" "}
              for somatic-load discharge, or{" "}
              <Link className="aurin-link" to="/clarity-release">S · Clarity Release</Link>{" "}
              for cognitive-load extraction. Same compass. Different vector.
            </p>
          </div>
        </div>
      </section>

      {!user && (
        <section
          className="aurin-section-sm"
          data-testid="course-room-newsletter"
        >
          <div className="aurin-container max-w-[640px]">
            <FirstLetterWidget testidPrefix="course-room-first-letter" />
          </div>
        </section>
      )}
    </div>
  );
}
