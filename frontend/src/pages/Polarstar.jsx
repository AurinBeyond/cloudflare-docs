/**
 * Polarstar v7 — exact reference-image-match world map.
 *
 * §POLARSTAR v7 2026-02-13 — Founder lock-in. Every UI element is
 * an absolutely-positioned SIBLING inside one world container.
 * Nothing is nested in a big panel. Reference image:
 *   /app/memory/POLARSTAR_REFERENCE.png
 *
 * Layout map (proportional):
 *   • header centered top
 *   • 3 age fairies + paths at top (Discovery left, Exploration center,
 *     Creation right) — fairies stand BESIDE their path
 *   • "Our Family Library" tiny shelf left middle
 *   • "Adventure Hub" floating panel left-middle
 *   • "Tomorrow's Adventure" with compass and lantern left-bottom
 *   • Tent silhouette bottom-left corner (in background)
 *   • Center: Collect Story Stars chest + My Story Space +
 *     Family Connection Zone + 5–6 stone activity buttons on the path
 *   • Evening Room floating right-middle
 *   • Our Keepsakes right-middle-lower
 *   • "You are never alone" fairy + speech right
 *   • Treehouse silhouette bottom-right
 *   • Bottom rail with Calm Music / Breathing Together / Sleep Well /
 *     Forever tagline / Parent Corner / Guides & Tips / Help & Support
 */
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Palette, Mic, Hammer, Heart, Star, Wind, Sparkles,
  Compass, Moon, MessageCircle, Image as ImageIcon, Mail, Book,
  Music, HelpCircle, Users, Leaf, Trees, Waves, Mountain, Rocket,
  PenTool, Pencil, Gem, Sun, Bell, User,
} from "lucide-react";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const FAIRY_DISCOVERY   = "/polarstar/guide-discovery.png";
const FAIRY_EXPLORATION = "/polarstar/guide-exploration.png";
const FAIRY_CREATION    = "/polarstar/guide-creation.png";

/* ─────────── HEADER ─────────── */
function Header() {
  return (
    <>
      <header className="pw-header" data-testid="pw-header">
        <h1 className="pw-title" style={{ fontFamily: SERIF }}>Kids Universe Journey</h1>
        <p className="pw-subtitle" style={{ fontFamily: SERIF }}>
          A calm world of stories, creativity and connection<br />
          for the whole family <span className="pw-heart">♥</span>
        </p>
      </header>
      <div className="pw-top-right" data-testid="pw-top-right">
        <button className="pw-icon-btn" data-testid="pw-toggle-mode" aria-label="Toggle day"><Sun size={16} /></button>
        <button className="pw-icon-btn" data-testid="pw-bell" aria-label="Notifications"><Bell size={16} /></button>
        <button className="pw-icon-btn" data-testid="pw-profile" aria-label="Profile"><User size={16} /></button>
      </div>
      <div className="pw-moon" aria-hidden="true" />
    </>
  );
}

/* ─────────── AGE ZONE (fairy + label + path tiles) ─────────── */
function AgeZone({ side, age, label, fairy, speech, pathTitle, tiles, route }) {
  const navigate = useNavigate();
  return (
    <>
      <div className={`pw-fairy pw-fairy--${side}`} aria-hidden="true" data-testid={`pw-fairy-${side}`}>
        <img src={`${process.env.PUBLIC_URL || ""}${fairy}`} alt="" loading="lazy" />
      </div>
      <p className={`pw-age-label pw-age-label--${side}`} style={{ fontFamily: SERIF }}>
        {age}<br /><em>({label})</em>
      </p>
      {speech && (
        <div className={`pw-bubble pw-bubble--${side}`} data-testid={`pw-bubble-${side}`}>
          <p style={{ fontFamily: SERIF }}>{speech}</p>
        </div>
      )}
      <button
        type="button"
        className={`pw-path pw-path--${side}`}
        onClick={() => navigate(route)}
        data-testid={`pw-path-${side}`}
        style={{ fontFamily: SERIF }}
      >
        <h3>{pathTitle}</h3>
        <div className="pw-path-tiles">
          {tiles.map(({ id, Icon, label, day }) => (
            <div key={id} className="pw-tile" data-testid={`pw-tile-${side}-${id}`}>
              {day && <span className="pw-tile-day">Day {day}</span>}
              <Icon size={20} />
              <small>{label}</small>
            </div>
          ))}
        </div>
      </button>
    </>
  );
}

/* ─────────── FLOATING PANELS ─────────── */
function FloatingPanel({ className, eyebrow, title, children, testid, onClick }) {
  return (
    <div className={`pw-panel ${className}`} onClick={onClick} data-testid={testid}>
      {eyebrow && <p className="pw-eyebrow" style={{ fontFamily: SERIF }}>{eyebrow}</p>}
      {title && <h4 className="pw-panel-title" style={{ fontFamily: SERIF }}>{title}</h4>}
      {children}
    </div>
  );
}

/* ─────────── ROOT ─────────── */
export default function Polarstar() {
  const navigate = useNavigate();
  return (
    <PolarstarAtmosphere testid="polarstar-root">
      {() => (
        <div className="pw-world" data-testid="pw-world">
          <Header />

          <AgeZone
            side="left"
            age="4–6 YEARS"
            label="DISCOVERY"
            fairy={FAIRY_DISCOVERY}
            pathTitle="Discovery Path"
            route="/kids-universe/polarstar/discovery"
            tiles={[
              { id: "story",    Icon: BookOpen, label: "Story Time" },
              { id: "calm",     Icon: Moon,     label: "Calm Moments" },
              { id: "world",    Icon: Star,     label: "My World" },
              { id: "gentle",   Icon: Leaf,     label: "Gentle Learning" },
              { id: "creative", Icon: Palette,  label: "Creative Time" },
            ]}
          />

          <AgeZone
            side="center"
            age="7–10 YEARS"
            label="EXPLORATION"
            fairy={FAIRY_EXPLORATION}
            speech="Shall we go on an adventure?"
            pathTitle="Exploration Path"
            route="/kids-universe/polarstar/exploration"
            tiles={[
              { id: "d1", Icon: BookOpen, label: "A New Story",     day: 1 },
              { id: "d2", Icon: Sparkles, label: "Imagine Together",day: 2 },
              { id: "d3", Icon: Pencil,   label: "Draw & Create",   day: 3 },
              { id: "d4", Icon: Leaf,     label: "Explore Nature",  day: 4 },
              { id: "d5", Icon: Heart,    label: "Kindness Quest",  day: 5 },
              { id: "d6", Icon: Music,    label: "Music & Move",    day: 6 },
              { id: "d7", Icon: Moon,     label: "Reflection Time", day: 7 },
            ]}
          />

          <AgeZone
            side="right"
            age="11–13 YEARS"
            label="CREATION"
            fairy={FAIRY_CREATION}
            speech="What will you create tonight?"
            pathTitle="Creation Path"
            route="/kids-universe/polarstar/creation"
            tiles={[
              { id: "story",  Icon: BookOpen, label: "Story Studio" },
              { id: "art",    Icon: Palette,  label: "Art Studio" },
              { id: "voice",  Icon: Mic,      label: "Voice Studio" },
              { id: "build",  Icon: Hammer,   label: "Build Something" },
              { id: "share",  Icon: Heart,    label: "Share Your Story" },
            ]}
          />

          {/* Family Library small shelf */}
          <button type="button" className="pw-library" data-testid="pw-library" style={{ fontFamily: SERIF }}>
            <Book size={26} />
            <small>Our Family<br />Library</small>
          </button>

          {/* Adventure Hub */}
          <FloatingPanel className="pw-adventure" eyebrow="Adventure Hub" testid="pw-adventure">
            <div className="pw-adventure-tiles">
              {[
                { id: "forest",   Icon: Trees,     label: "Forest Walk" },
                { id: "ocean",    Icon: Waves,     label: "Ocean Tales" },
                { id: "mountain", Icon: Mountain,  label: "Mountain Path" },
                { id: "desert",   Icon: Sun,       label: "Desert Journey" },
                { id: "space",    Icon: Rocket,    label: "Space Dreams" },
              ].map(({ id, Icon, label }) => (
                <div key={id} className="pw-adv-tile" data-testid={`pw-adv-${id}`}>
                  <Icon size={18} />
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </FloatingPanel>

          {/* Tomorrow's Adventure */}
          <FloatingPanel className="pw-tomorrow" eyebrow="Tomorrow's Adventure" testid="pw-tomorrow">
            <p className="pw-tomorrow-line" style={{ fontFamily: SERIF }}>A new story <em>awakens.</em></p>
            <div className="pw-compass" aria-hidden="true"><Compass size={28} /></div>
          </FloatingPanel>

          {/* Collect Story Stars chest */}
          <button type="button" className="pw-chest" data-testid="pw-chest" style={{ fontFamily: SERIF }}>
            <span className="pw-chest-star" aria-hidden="true"><Star size={20} /></span>
            <span>Collect<br />Story Stars</span>
          </button>

          {/* My Story Space */}
          <FloatingPanel className="pw-story-space" eyebrow="My Story Space" testid="pw-story-space">
            <div className="pw-story-tiles">
              {[
                { id: "journal",   Icon: PenTool, label: "My Journal" },
                { id: "drawings",  Icon: Palette, label: "My Drawings" },
                { id: "voice",     Icon: Mic,     label: "My Voice" },
                { id: "treasures", Icon: Gem,     label: "My Treasures" },
              ].map(({ id, Icon, label }) => (
                <div key={id} className="pw-story-tile" data-testid={`pw-story-${id}`}>
                  <Icon size={18} />
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </FloatingPanel>

          {/* Family Connection Zone */}
          <FloatingPanel className="pw-family" eyebrow="Family Connection Zone" testid="pw-family">
            <p style={{ fontFamily: SERIF }}>
              Share moments,<br />create memories,<br /><em>grow together ♥</em>
            </p>
          </FloatingPanel>

          {/* Evening Room */}
          <FloatingPanel className="pw-evening" eyebrow="Evening Room" testid="pw-evening">
            <ul>
              <li><BookOpen size={14} /> <span style={{ fontFamily: SERIF }}>Read Together</span></li>
              <li><MessageCircle size={14} /> <span style={{ fontFamily: SERIF }}>Talk &amp; Listen</span></li>
              <li><Heart size={14} /> <span style={{ fontFamily: SERIF }}>Gratitude Circle</span></li>
              <li><Moon size={14} /> <span style={{ fontFamily: SERIF }}>Hug &amp; Rest</span></li>
            </ul>
          </FloatingPanel>

          {/* You are never alone */}
          <div className="pw-never-alone" data-testid="pw-never-alone">
            <div className="pw-na-fairy" aria-hidden="true">
              <img src={`${process.env.PUBLIC_URL || ""}${FAIRY_CREATION}`} alt="" loading="lazy" />
            </div>
            <div className="pw-na-bubble">
              <p style={{ fontFamily: SERIF }}>You are <em>never alone</em> <span>♥</span></p>
            </div>
          </div>

          {/* Our Keepsakes */}
          <FloatingPanel className="pw-keepsakes" eyebrow="Our Keepsakes" testid="pw-keepsakes">
            <div className="pw-keep-tiles">
              {[
                { id: "photo",   Icon: ImageIcon, label: "Photo Album" },
                { id: "memory",  Icon: Star,      label: "Memory Box" },
                { id: "letters", Icon: Mail,      label: "Letters to Tomorrow" },
              ].map(({ id, Icon, label }) => (
                <div key={id} className="pw-keep-tile" data-testid={`pw-keep-${id}`}>
                  <Icon size={18} />
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </FloatingPanel>

          {/* Bottom rail */}
          <footer className="pw-rail" data-testid="pw-rail">
            <button className="pw-rail-btn" data-testid="pw-rail-music"><Music size={16} /><span style={{ fontFamily: SERIF }}>Calm Music</span></button>
            <button className="pw-rail-btn" data-testid="pw-rail-breath"><Wind size={16} /><span style={{ fontFamily: SERIF }}>Breathing Together</span></button>
            <button className="pw-rail-btn" data-testid="pw-rail-sleep"><Moon size={16} /><span style={{ fontFamily: SERIF }}>Sleep Well</span></button>
            <p className="pw-rail-tag" style={{ fontFamily: SERIF }}>
              Small moments. <em>Big memories.</em> Forever.
            </p>
            <button className="pw-rail-btn" data-testid="pw-rail-parent"><Users size={16} /><span style={{ fontFamily: SERIF }}>Parent Corner</span></button>
            <button className="pw-rail-btn" data-testid="pw-rail-guides"><Leaf size={16} /><span style={{ fontFamily: SERIF }}>Guides &amp; Tips</span></button>
            <button className="pw-rail-btn" data-testid="pw-rail-help"><HelpCircle size={16} /><span style={{ fontFamily: SERIF }}>Help &amp; Support</span></button>
          </footer>
        </div>
      )}
    </PolarstarAtmosphere>
  );
}
