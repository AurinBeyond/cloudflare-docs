/**
 * Polarstar — /kids-universe/polarstar (preview-only)
 *
 * §POLARSTAR 2026-02-13 — Founder directive: one living world.
 * Three age paths (Discovery 4–6, Exploration 7–10, Creation 11–13)
 * each lead into their own room, but every room shares the same
 * atmosphere, typography and visual hush.
 *
 * Preview sandbox only. Do NOT deploy. Do NOT touch billing.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, ArrowRight, Sunrise } from "lucide-react";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import { POLARSTAR_AGE_GROUPS } from "@/data/polarstarAgeGroups";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const TIME_LABELS = {
  morning: "The world wakes gently",
  day:     "The path is open",
  evening: "Lanterns are lighting",
  night:   "Even the night carries light",
};

function HeroBlock({ mode }) {
  return (
    <section className="ps-hero" data-testid="polarstar-hero">
      <p
        className="ps-time-badge"
        data-testid="polarstar-time-badge"
        style={{ fontFamily: SERIF }}
      >
        {TIME_LABELS[mode]}
      </p>
      <h1
        className="ps-hero-title"
        style={{ fontFamily: SERIF }}
        data-testid="polarstar-headline"
      >
        Welcome to <span className="ps-italic">Polarstar.</span>
      </h1>
      <p
        className="ps-hero-line"
        style={{ fontFamily: SERIF }}
        data-testid="polarstar-tagline"
      >
        Here, even the night carries light.
      </p>
      <p
        className="ps-hero-sub"
        style={{ fontFamily: SERIF }}
        data-testid="polarstar-subcopy"
      >
        A calm family world for stories, creativity, memories
        and small daily adventures.
      </p>
    </section>
  );
}

function GatewayHeading() {
  return (
    <div className="ps-gateway-heading" data-testid="polarstar-gateway-heading">
      <p className="ps-eyebrow">Choose a path</p>
      <h2 className="ps-gateway-title" style={{ fontFamily: SERIF }}>
        One world. <span className="ps-italic">Three paths.</span> One family.
      </h2>
      <p className="ps-gateway-sub" style={{ fontFamily: SERIF }}>
        Each age group enters the same calm Polarstar world, with activities
        shaped for their season of growth.
      </p>
    </div>
  );
}

function AgeGatewayCard({ group, hovered, onHover }) {
  const navigate = useNavigate();
  const { id, age, title, subtitle, description, route, Icon, activities,
          guideImage, guideSpeech } = group;
  const enterLabel = title.replace(" Path", "");
  return (
    <div
      className={`ps-gateway-slot ${hovered === id ? "ps-gateway-slot--hover" : ""}`}
      data-testid={`polarstar-gateway-slot-${id}`}
    >
      {/* Fairy guide + comic-style speech bubble above the card */}
      <div className="ps-guide" aria-hidden="true" data-testid={`polarstar-guide-${id}`}>
        <img
          src={`${process.env.PUBLIC_URL || ""}${guideImage}`}
          alt=""
          className="ps-guide-img"
          loading="lazy"
        />
        <div className="ps-speech" data-testid={`polarstar-speech-${id}`}>
          <p style={{ fontFamily: '"Cormorant Garamond", "EB Garamond", Georgia, serif' }}>
            {guideSpeech}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(route)}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        className={`ps-gateway-card ${hovered === id ? "ps-gateway-card--hover" : ""}`}
        data-testid={`polarstar-gateway-${id}`}
        style={{ fontFamily: '"Cormorant Garamond", "EB Garamond", Georgia, serif' }}
      >
        <div className="ps-gateway-icon" aria-hidden="true">
          <Icon size={24} />
        </div>
        <p className="ps-eyebrow ps-gateway-age">{age}</p>
        <h3 className="ps-gateway-cardtitle">
          {title.replace(" Path", " ")}<span className="ps-italic">Path</span>
        </h3>
        <p className="ps-gateway-subtitle">{subtitle}</p>
        <p className="ps-gateway-desc">{description}</p>

        <div className="ps-gateway-tags" aria-hidden="true">
          {activities.slice(0, 3).map((a) => (
            <span key={a.id} className="ps-gateway-tag">{a.label}</span>
          ))}
        </div>

        <div className="ps-gateway-cta">
          <span>Enter {enterLabel}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </div>
      </button>
    </div>
  );
}

function AgeGateway() {
  const [hovered, setHovered] = useState(null);
  return (
    <section className="ps-gateway" data-testid="polarstar-gateway">
      <GatewayHeading />
      <div className="ps-gateway-grid">
        {POLARSTAR_AGE_GROUPS.map((g) => (
          <AgeGatewayCard
            key={g.id}
            group={g}
            hovered={hovered}
            onHover={setHovered}
          />
        ))}
      </div>
    </section>
  );
}

function SideStack() {
  return (
    <section className="ps-rail" data-testid="polarstar-rail">
      <div className="ps-card ps-card--aurin">
        <div className="ps-avatar ps-avatar--aurin" aria-hidden="true">
          <Sparkles size={26} />
        </div>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>Aurin</h3>
        <p className="ps-card-blurb">Your gentle story guide.</p>
      </div>
      <div className="ps-card ps-card--stars">
        <p className="ps-eyebrow">Story Stars</p>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>
          24 <span className="ps-of">/ 50</span>
        </h3>
        <div className="ps-progress" aria-hidden="true">
          <span style={{ width: "48%" }} />
        </div>
      </div>
      <div className="ps-card ps-card--family">
        <p className="ps-eyebrow">Family Moment</p>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>
          Share one small <span className="ps-italic">memory</span> today.
        </h3>
      </div>
      <div className="ps-card ps-card--sunrise">
        <span className="ps-sunrise-icon" aria-hidden="true">
          <Sunrise size={22} />
        </span>
        <p className="ps-card-blurb">
          The atmosphere shifts with the hour of your day.
        </p>
      </div>
    </section>
  );
}

export default function Polarstar() {
  return (
    <PolarstarAtmosphere testid="polarstar-root">
      {(mode) => (
        <>
          <HeroBlock mode={mode} />

          <div className="ps-home-shell" data-testid="polarstar-shell">
            <AgeGateway />
            <SideStack />
          </div>

          <footer className="ps-footer" data-testid="polarstar-footer">
            <p style={{ fontFamily: SERIF }}>
              <Star size={14} className="ps-footer-icon" aria-hidden="true" />
              Small moments. <span className="ps-italic">Big memories.</span> Forever.
            </p>
          </footer>
        </>
      )}
    </PolarstarAtmosphere>
  );
}
