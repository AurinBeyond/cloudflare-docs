# Architecture Design

## System Overview
Single-page React application with tab-based navigation between 5 house wings. No backend needed - pure frontend product showcase.

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Shell | Global navigation, wing switching | src/pages/Index.tsx |
| LuxuryLanding | Premium entry point | src/components/LuxuryLanding.tsx |
| OpenLibrary | Free content directory | src/components/OpenLibrary.tsx |
| KidsUniverse | Kids content zone | src/components/KidsUniverse.tsx |
| QuietStore | Premium store portal | src/components/QuietStore.tsx |
| VoiceHouse | Audio interaction portal | src/components/VoiceHouse.tsx |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Navigation | State-based tabs | Zero reload, fluid transitions |
| Styling | Tailwind + custom CSS vars | Two-layer design system |
| Icons | Lucide React | Clean, minimal icon set |

## File Tree Plan
```
src/
├── pages/
│   └── Index.tsx (main shell with navigation)
├── components/
│   ├── LuxuryLanding.tsx
│   ├── OpenLibrary.tsx
│   ├── KidsUniverse.tsx
│   ├── QuietStore.tsx
│   └── VoiceHouse.tsx
└── index.css (global styles with house theme)
```

## Implementation Guide
1. Build Index.tsx as the dashboard shell with persistent nav
2. Implement each wing as a self-contained component
3. Use state to switch between wings
4. Apply two-layer design system via Tailwind classes