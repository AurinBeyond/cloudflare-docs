/**
 * PolarstarRoom.jsx — /kids-universe/polarstar/:ageId
 *
 * §POLARSTAR 2026-02-13 — Per-age room inside Polarstar. Same world,
 * same atmosphere; only the activities change. Stubs only — clicking
 * a Day/activity does not yet do anything. Backend wiring (chrono-
 * lock, story stars, Tomorrow's Adventure countdown) lands in
 * Phase 2.
 */
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Compass, Star, Moon, Mail, Sparkles } from "lucide-react";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import { findAgeGroup } from "@/data/polarstarAgeGroups";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

function RoomHero({ group }) {
  const { Icon, title } = group;
  const enterLabel = title.replace(" Path", "");
  return (
    <section className="ps-room-hero" data-testid="polarstar-room-hero">
      <Link
        to="/kids-universe/polarstar"
        className="ps-back-link"
        data-testid="polarstar-room-back"
        style={{ fontFamily: SERIF }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        <span>Back to Polarstar</span>
      </Link>

      <div className="ps-room-headicon" aria-hidden="true">
        <Icon size={30} />
      </div>

      <p
        className="ps-eyebrow"
        data-testid={`polarstar-room-age-${group.id}`}
        style={{ fontFamily: SERIF }}
      >
        {group.age}
      </p>
      <h1
        className="ps-room-title"
        data-testid={`polarstar-room-title-${group.id}`}
        style={{ fontFamily: SERIF }}
      >
        {enterLabel} <span className="ps-italic">Journey</span>
      </h1>
      <p
        className="ps-room-sub"
        data-testid={`polarstar-room-sub-${group.id}`}
        style={{ fontFamily: SERIF }}
      >
        {group.subtitle}
      </p>
      <p
        className="ps-room-desc"
        style={{ fontFamily: SERIF }}
      >
        {group.description}
      </p>
    </section>
  );
}

function DayPath({ group }) {
  return (
    <section
      className="ps-room-map"
      data-testid={`polarstar-room-map-${group.id}`}
    >
      <div className="ps-room-map-head">
        <p className="ps-eyebrow">Today&apos;s Journey</p>
        <h2 className="ps-room-map-title" style={{ fontFamily: SERIF }}>
          Walk it gently. <span className="ps-italic">One step at a time.</span>
        </h2>
      </div>

      <div
        className={`ps-day-grid ps-day-grid--${group.activities.length}`}
        data-testid={`polarstar-day-grid-${group.id}`}
      >
        {group.activities.map((a, i) => {
          const ActivityIcon = a.Icon;
          const isToday = i === 0;
          return (
            <button
              type="button"
              key={a.id}
              className={`ps-day-card ${isToday ? "ps-day-card--today" : ""}`}
              data-testid={`polarstar-day-${group.id}-${a.id}`}
              style={{ fontFamily: SERIF }}
            >
              <span className="ps-day-index">Day {i + 1}</span>
              <span className="ps-day-icon" aria-hidden="true">
                <ActivityIcon size={22} />
              </span>
              <strong className="ps-day-title">{a.label}</strong>
              <small className="ps-day-blurb">{a.blurb}</small>
              {isToday && (
                <span className="ps-day-flag" aria-hidden="true">
                  <Star size={11} />
                  <em>today</em>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RoomRail({ group }) {
  return (
    <aside className="ps-room-rail" data-testid={`polarstar-room-rail-${group.id}`}>
      <div className="ps-card ps-card--tomorrow">
        <span className="ps-rail-icon" aria-hidden="true">
          <Compass size={22} />
        </span>
        <p className="ps-eyebrow">Tomorrow&apos;s Adventure</p>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>
          A new story <span className="ps-italic">awakens softly.</span>
        </h3>
      </div>

      <div className="ps-card">
        <span className="ps-rail-icon" aria-hidden="true">
          <Sparkles size={22} />
        </span>
        <p className="ps-eyebrow">Family Moment</p>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>
          Share one small memory from today.
        </h3>
      </div>

      <div className="ps-card">
        <span className="ps-rail-icon" aria-hidden="true">
          <Moon size={22} />
        </span>
        <p className="ps-eyebrow">Evening Room</p>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>
          Read together. <span className="ps-italic">Rest together.</span>
        </h3>
        <p className="ps-card-blurb">Close the day gently.</p>
      </div>

      <div className="ps-card">
        <span className="ps-rail-icon" aria-hidden="true">
          <Mail size={22} />
        </span>
        <p className="ps-eyebrow">Memory Box</p>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>
          A keepsake for <span className="ps-italic">tomorrow&apos;s self.</span>
        </h3>
      </div>
    </aside>
  );
}

export default function PolarstarRoom() {
  const { ageGroup } = useParams();
  const group = findAgeGroup(ageGroup);
  if (!group) {
    return <Navigate to="/kids-universe/polarstar" replace />;
  }
  return (
    <PolarstarAtmosphere testid={`polarstar-room-${group.id}`}>
      {() => (
        <>
          <RoomHero group={group} />
          <div className="ps-room-shell" data-testid={`polarstar-room-shell-${group.id}`}>
            <DayPath group={group} />
            <RoomRail group={group} />
          </div>
          <footer className="ps-footer" data-testid="polarstar-room-footer">
            <p style={{ fontFamily: SERIF }}>
              Small moments. <span className="ps-italic">Big memories.</span> Forever.
            </p>
          </footer>
        </>
      )}
    </PolarstarAtmosphere>
  );
}
