import PageHeader from "@/components/layout/PageHeader";
import { Wind, Waves, Moon, Sun } from "lucide-react";
import VideoCard from "@/components/VideoCard";

const SESSIONS = [
  {
    title: "First Breath",
    length: "6 minutes",
    tag: "Grounding",
    description:
      "A short, quiet entry. For any moment you want to slow down, right where you are.",
    icon: Wind,
  },
  {
    title: "Still Water",
    length: "14 minutes",
    tag: "Stillness",
    description:
      "A guided settling practice. For clearing noise and finding the edges of attention again.",
    icon: Waves,
  },
  {
    title: "Evening Return",
    length: "18 minutes",
    tag: "Release",
    description:
      "A slower closing practice. For the end of the day, before the mind picks up tomorrow.",
    icon: Moon,
  },
  {
    title: "Morning Field",
    length: "10 minutes",
    tag: "Orientation",
    description:
      "A gentle beginning. For setting the tone before the day carries you away.",
    icon: Sun,
  },
];

export default function MeditationCorner() {
  return (
    <div data-testid="page-meditation">
      <PageHeader
        tone="meditation"
        eyebrow="Meditation Corner · Slow, Quiet"
        title="A room for"
        italicWord="returning to yourself."
        description="This is the slowest corner of Matrix Aurin. More breathing room. Less visual density. A quiet rhythm, so you can hear your own."
      />

      {/* Breathing element */}
      <section className="relative border-b border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container py-24 md:py-32 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-[360px] h-[360px] rounded-full border border-[hsl(var(--aurin-sage))/0.15]" />
            <div className="absolute w-[280px] h-[280px] rounded-full border border-[hsl(var(--aurin-sage))/0.25]" />
            <div
              className="w-[200px] h-[200px] rounded-full aurin-breathe"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--aurin-sage) / 0.35), hsl(var(--aurin-sage) / 0.05) 70%, transparent 80%)",
              }}
              data-testid="meditation-breath-orb"
            />
          </div>
          <p
            className="aurin-serif-italic text-center mt-14 text-2xl md:text-3xl text-[hsl(var(--aurin-text))/0.9] max-w-[28ch] leading-snug"
            data-testid="meditation-quote"
          >
            Nothing to reach for. Nothing to perform.
          </p>
          <p className="mt-4 text-[13px] uppercase tracking-[0.24em] text-[hsl(var(--aurin-text-muted))]">
            Breathe
          </p>
        </div>
      </section>

      {/* SESSIONS */}
      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="aurin-eyebrow mb-5">Sessions</div>
          <h2 className="aurin-display text-3xl md:text-4xl max-w-[22ch] mb-16">
            Four quiet practices.{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              Open one.
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SESSIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  data-testid={`meditation-session-${i}`}
                  className="aurin-card p-8 md:p-10 flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
                      <Icon size={18} strokeWidth={1.3} />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text-muted))]">
                      {s.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="aurin-display text-2xl md:text-3xl">
                      {s.title}
                    </h3>
                    <p className="mt-4 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[48ch]">
                      {s.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--aurin-border-soft))]">
                    <span className="text-[13px] text-[hsl(var(--aurin-text-muted))]">
                      {s.length}
                    </span>
                    <button
                      data-testid={`meditation-session-${i}-begin`}
                      className="text-[13px] text-[hsl(var(--aurin-text))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
                    >
                      Begin →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OPTIONAL VISUAL CARD — small, calm, click to watch */}
      <section className="aurin-section-sm">
        <div className="aurin-container flex justify-center">
          <VideoCard
            src="/assets/videos/weight-of-stillness.mp4"
            eyebrow="A quiet visual"
            title="The weight of stillness."
            description="A small loop. Watch only if you feel like it."
            maxWidthCls="max-w-lg"
            testId="meditation-video-card"
          />
        </div>
      </section>

      {/* CLOSING NOTE */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container max-w-[720px]">
          <p className="aurin-serif-italic text-2xl md:text-[30px] leading-snug text-[hsl(var(--aurin-text))/0.92]">
            “The quiet you are looking for is not somewhere else. It is the
            room you are already in, once it stops being rushed.”
          </p>
          <div className="mt-6 text-xs tracking-[0.2em] uppercase text-[hsl(var(--aurin-text-muted))]">
            — A note from the Meditation Corner
          </div>
        </div>
      </section>
    </div>
  );
}
