---
last_updated: 2026-05-16T20:16:40Z
---

# Architecture Design

## System Overview
Static premium landing page for Matrix Aurin (prulesoul.site). Pure frontend — no backend logic. Designed as a visual/structural layer that integrates into the existing Emergent production environment.

## Tech Stack
- HTML5 / CSS3 / Vanilla JavaScript
- Vite (build tool)
- Google Fonts (Cormorant Garamond, Inter)
- No framework dependencies

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Landing Page | Full homepage structure with hero, principles, doors, pricing, threshold, footer | index.html |
| Styling | Premium dark theme, responsive layout, animations | style.css |
| Interactions | Scroll reveal, nav state, smooth scrolling | script.js |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| No framework | Pure HTML/CSS/JS | Integration-ready for Emergent backend, minimal overhead |
| Vite build | Static asset bundling | Fast builds, simple config, production-ready output |
| CSS custom properties | Design tokens in :root | Easy theme adjustment when integrating into production |
| IntersectionObserver | Scroll-based reveals | Performant, no library dependency |

## File Tree Plan
```
frontend/
├── index.html          # Main landing page with integration notes
├── style.css           # All styles (dark luxury theme + responsive)
├── script.js           # Scroll interactions + smooth navigation
├── package.json        # Vite dev/build config
└── image_manifest.json # Generated image references
```

## Implementation Guide
The built output (dist/) can be dropped into the Emergent production environment. See the HTML comment block at the top of index.html for specific integration instructions. All links point to prulesoul.site subpages. The CSS uses custom properties for easy theme token adjustment.

