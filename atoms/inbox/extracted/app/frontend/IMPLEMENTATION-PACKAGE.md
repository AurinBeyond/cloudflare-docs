# MATRIX AURIN — FINAL IMPLEMENTATION PACKAGE

## STATUS: APPROVED FOR PREVIEW IMPLEMENTATION

**Package Version:** 1.0  
**Date:** 2026-05-17  
**Source:** Atoms Development Environment  
**Target:** Emergent Production Environment (prulesoul.site)  

---

## Table of Contents

1. [Homepage Structure](#1-homepage-structure)
2. [Final Copy (All Text Verbatim)](#2-final-copy-all-text-verbatim)
3. [Pricing Section](#3-pricing-section)
4. [Four Doors Section](#4-four-doors-section)
5. [Visual Tokens (CSS Variables)](#5-visual-tokens-css-variables)
6. [Complete CSS](#6-complete-css)
7. [Complete HTML Structure](#7-complete-html-structure)
8. [Entrance Animation Code](#8-entrance-animation-code)
9. [Mobile Responsiveness Notes](#9-mobile-responsiveness-notes)
10. [Emergent Integration Notes](#10-emergent-integration-notes)

---

## 1. Homepage Structure

The page follows a strict vertical flow with extreme whitespace between sections. Each section is semantically marked and designed to create emotional deceleration as the visitor scrolls.

### Section Order (top to bottom):

| # | Section | HTML Element | ID | Purpose |
|---|---------|-------------|-----|---------|
| 0 | Page Veil | `<div>` | `page-veil` | Cinematic 2s fade-in entrance overlay |
| 1 | Navigation | `<nav>` | `nav` | Fixed top bar — brand + 3 links + CTA |
| 2 | Hero | `<section>` | `hero` | Full-viewport visual anchor with headline |
| 3 | House Principles | `<section>` | `house` | Three-column grid: Privacy, Presence, Silence |
| 4 | The Four Doors | `<section>` | `doors` | 2×2 grid of room entry points |
| 5 | Offerings / Pricing | `<section>` | `offerings` | Three-tier pricing cards |
| 6 | Threshold / Entry | `<section>` | `threshold` | Emotional invitation + final CTA |
| 7 | Footer | `<footer>` | — | Brand, trust statement, room links, meta |

### Semantic HTML Notes:
- All sections use `<section>` with descriptive IDs
- Navigation uses `<nav>` with internal anchor links
- Footer uses `<footer>`
- Pricing cards use `<div>` with `<ul>` for feature lists
- Four Doors use `<a>` elements (entire card is clickable)
- Hero image uses `<img>` with descriptive `alt` text

---

## 2. Final Copy (All Text Verbatim)

### Navigation
- Brand: `Matrix Aurin`
- Links: `House` | `Rooms` | `Offerings`
- CTA: `Enter`

### Hero Section
- Whisper: `Matrix Aurin`
- Headline: `Welcome back to yourself.`
- Subtext: `You do not have to perform here.`
- CTA: `Step inside`

### House Principles

**Section whisper:** `What this place holds`

**Principle I — Privacy:**
> No pixels watch you here. No data leaves this room. Your journey stays yours — that is part of the design.

**Principle II — Presence:**
> A room that listens more than it speaks. What you bring here is met with calm attention, not performance.

**Principle III — Silence:**
> The noise stops working here. In the quiet, you begin to hear what you have always known.

### The Four Doors

**Section whisper:** `The doors`  
**Headline:** `Four entries. One quiet place.`  
**Subtext:** `Each one has its own tone. None of them rush you. Walk through the one that calls.`

| # | Title | Subtitle | Hint | Link |
|---|-------|----------|------|------|
| 01 | The Beginning | Where you slow down and listen inward | Find your own rhythm. | prulesoul.site/the-beginning |
| 02 | Body Room | Where the body remembers what the mind forgot | Let the body speak. | prulesoul.site/body-room |
| 03 | Parents' Room | Where inherited patterns become visible | What was inherited. What is yours. | prulesoul.site/parents-room |
| 04 | Course Room | Where growth happens without pressure | Mastery without performance. | prulesoul.site/course-room |

### Offerings / Pricing

**Section whisper:** `Ways to be here`  
**Headline:** `Choose how you wish to arrive.`  
**Subtext:** `There is no wrong door. Each path holds space for you differently.`  
**Footer note:** `All paths include complete privacy. No data shared. No tracking. Cancel with a single word.`

*(Full pricing details in Section 3 below)*

### Threshold / Entry

**Section whisper:** `A quiet invitation`  
**Headline:** `You are welcome here.`

**Primary text:**
> I want you to know — this is not a place you have to earn.  
> It is a place you recognize. A place that has been waiting.

**Secondary text (italic, Cormorant Garamond):**
> Something inside you already knows.  
> Not everything you carry was chosen by you.  
>  
> This is where you begin to see that clearly —  
> gently, without rush — and from there, choose what stays.

**CTA:** `Begin gently`  
**CTA link:** `https://prulesoul.site/the-beginning`

### Footer
- Brand: `Matrix Aurin`
- Trust statement: `No social-media pixels. No tracking cookies. No public feed. Your journey through this work stays yours — that is part of the design.`
- Warmth line: `Built with care. Held with silence.`
- Room links: The Beginning | Body Room | Parents' Room | Course Room
- Meta: `Est. 2026` · `Quiet by design` · `Privacy`

---

## 3. Pricing Section

Three tiers displayed in a horizontal grid (stacks vertically on mobile). The middle tier ("A Steady Presence") is visually featured with a subtle brass top-line accent.

### Tier 1: A First Step

| Field | Value |
|-------|-------|
| Label | A First Step |
| Title | One session. One quiet hour. |
| Description | No commitment. Just curiosity. Enter one room, stay as long as you need, leave when you're ready. This is simply a beginning. |
| Includes | • Access to one room of your choosing |
| | • A guided session at your pace |
| | • No subscription, no follow-up pressure |
| Price | €45 |
| Period | one session |
| CTA text | Begin quietly |
| CTA link | `https://prulesoul.site/join?tier=first-step` |

### Tier 2: A Steady Presence (Featured)

| Field | Value |
|-------|-------|
| Label | A Steady Presence |
| Title | All rooms. Monthly companionship. |
| Description | Return as often as you need. Move freely between all rooms, with a monthly voice session to ground your journey. You are welcome here, always. |
| Includes | • Unlimited access to all four rooms |
| | • One private voice session per month |
| | • Priority access to new spaces |
| | • The quiet community thread |
| Price | €120 |
| Period | per month |
| CTA text | Step in |
| CTA link | `https://prulesoul.site/join?tier=steady` |

### Tier 3: Your Own Room

| Field | Value |
|-------|-------|
| Label | Your Own Room |
| Title | A space held only for you. |
| Description | For those ready for sustained, intimate work. Weekly voice sessions, unlimited room access, and a private channel — your own corner of this house. |
| Includes | • Unlimited access to all rooms |
| | • Weekly private AI voice sessions |
| | • Priority presence and response |
| | • Early access to future sanctuaries |
| | • Direct channel for quiet requests |
| Price | €380 |
| Period | per month |
| CTA text | Enter gently |
| CTA link | `https://prulesoul.site/join?tier=own-room` |

---

## 4. Four Doors Section

Each door is a full clickable `<a>` element linking to its respective prulesoul.site subpage. The grid is 2×2 on desktop, single column on mobile.

### Door 01: The Beginning
- **Number:** 01
- **Title:** The Beginning
- **Subtitle:** Where you slow down and listen inward
- **Hint:** Find your own rhythm.
- **Link:** `https://prulesoul.site/the-beginning`

### Door 02: Body Room
- **Number:** 02
- **Title:** Body Room
- **Subtitle:** Where the body remembers what the mind forgot
- **Hint:** Let the body speak.
- **Link:** `https://prulesoul.site/body-room`

### Door 03: Parents' Room
- **Number:** 03
- **Title:** Parents' Room
- **Subtitle:** Where inherited patterns become visible
- **Hint:** What was inherited. What is yours.
- **Link:** `https://prulesoul.site/parents-room`

### Door 04: Course Room
- **Number:** 04
- **Title:** Course Room
- **Subtitle:** Where growth happens without pressure
- **Hint:** Mastery without performance.
- **Link:** `https://prulesoul.site/course-room`

### Interaction Behavior:
- On hover: border brightens to `--brass-muted`, subtle brass gradient overlay fades in, title color shifts to `--brass-warm`, subtitle opacity increases to 1
- Transition: `0.5s cubic-bezier(0.16, 1, 0.3, 1)`

---

## 5. Visual Tokens (CSS Variables)

All design tokens are defined as CSS custom properties on `:root`. These can be overridden in the Emergent environment if needed.

```css
:root {
    /* Colors */
    --black: #000000;
    --dark: #0A0A0A;
    --ivory: #F5F5F3;
    --ivory-soft: #E8E6E3;
    --brass: #C5A059;
    --brass-warm: #D4AD60;
    --brass-muted: rgba(197, 160, 89, 0.15);
    --brass-subtle: rgba(197, 160, 89, 0.08);
    --brass-glow: rgba(197, 160, 89, 0.04);
    --brass-hover: rgba(212, 173, 96, 0.1);
    --text-secondary: #8A8580;
    --text-muted: #4A4540;
    --border: rgba(197, 160, 89, 0.1);
    --border-strong: rgba(197, 160, 89, 0.25);

    /* Spacing System */
    --space-xs: 8px;
    --space-sm: 16px;
    --space-md: 24px;
    --space-lg: 40px;
    --space-xl: 64px;
    --space-2xl: 100px;
    --space-3xl: 160px;
}
```

### Color Semantics:
| Token | Usage |
|-------|-------|
| `--black` | Page background |
| `--dark` | Slightly lighter black (unused currently, reserved) |
| `--ivory` | Primary text color |
| `--ivory-soft` | Brand text, slightly warmer |
| `--brass` | Accent color — whispers, labels, CTAs, dots |
| `--brass-warm` | Hover state accent |
| `--brass-muted` | Border default state (15% opacity) |
| `--brass-subtle` | Card borders at rest (8% opacity) |
| `--brass-glow` | Card hover background (4% opacity) |
| `--brass-hover` | CTA/button hover background (10% opacity) |
| `--text-secondary` | Body text, descriptions |
| `--text-muted` | Lowest-emphasis text, meta info |
| `--border` | Decorative vertical lines (10% opacity) |
| `--border-strong` | Stronger border emphasis (25% opacity) |

### Typography:
| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Headlines, titles, whispers | Cormorant Garamond | 300, 400 | Serif, editorial feel |
| Body text, navigation, CTAs | Inter | 300, 400 | Clean sans-serif |

### Font Loading:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400&display=swap" rel="stylesheet">
```

---

## 6. Complete CSS

```css
/* ===================================
   MATRIX AURIN — Silent Luxury Homepage
   Premium house with human warmth
   =================================== */

:root {
    /* Colors */
    --black: #000000;
    --dark: #0A0A0A;
    --ivory: #F5F5F3;
    --ivory-soft: #E8E6E3;
    --brass: #C5A059;
    --brass-warm: #D4AD60;
    --brass-muted: rgba(197, 160, 89, 0.15);
    --brass-subtle: rgba(197, 160, 89, 0.08);
    --brass-glow: rgba(197, 160, 89, 0.04);
    --brass-hover: rgba(212, 173, 96, 0.1);
    --text-secondary: #8A8580;
    --text-muted: #4A4540;
    --border: rgba(197, 160, 89, 0.1);
    --border-strong: rgba(197, 160, 89, 0.25);

    /* Spacing System */
    --space-xs: 8px;
    --space-sm: 16px;
    --space-md: 24px;
    --space-lg: 40px;
    --space-xl: 64px;
    --space-2xl: 100px;
    --space-3xl: 160px;
}

/* Reset */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
    font-size: 16px;
}

body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--black);
    color: var(--ivory);
    line-height: 1.7;
    font-weight: 300;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 4px;
}
::-webkit-scrollbar-track {
    background: var(--black);
}
::-webkit-scrollbar-thumb {
    background: var(--text-muted);
    border-radius: 2px;
}

/* ===================================
   NAVIGATION
   =================================== */

.nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 28px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav.scrolled {
    padding: 18px 48px;
    background: rgba(0, 0, 0, 0.92);
    backdrop-filter: blur(20px);
}

.nav-brand-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem;
    font-weight: 400;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--ivory-soft);
    text-decoration: none;
    opacity: 0;
    animation: fadeIn 2s 0.3s ease forwards;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    opacity: 0;
    animation: fadeIn 2s 0.5s ease forwards;
}

.nav-link {
    font-size: 0.68rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;
}

.nav-link:hover {
    color: var(--ivory);
}

.nav-cta {
    font-size: 0.68rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--brass);
    text-decoration: none;
    padding: 10px 28px;
    border: 1px solid var(--brass-muted);
    transition: all 0.4s ease;
}

.nav-cta:hover {
    background: var(--brass-hover);
    border-color: var(--brass-warm);
    box-shadow: 0 0 20px rgba(197, 160, 89, 0.06);
}

/* ===================================
   HERO SECTION
   =================================== */

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.hero-visual {
    position: absolute;
    inset: 0;
    z-index: 1;
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
    opacity: 0;
    filter: brightness(0.55) contrast(1.05);
}

.hero-image-overlay {
    position: absolute;
    inset: 0;
    background: 
        linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.95) 100%),
        linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(0,0,0,0.4) 100%);
    z-index: 2;
}

.hero-content {
    position: relative;
    z-index: 3;
    text-align: center;
    padding: var(--space-lg);
    max-width: 700px;
}

.hero-whisper {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.72rem;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: var(--brass);
    margin-bottom: var(--space-lg);
    opacity: 0;
}

.hero-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.8rem, 7vw, 5rem);
    font-weight: 300;
    line-height: 1.15;
    color: var(--ivory);
    margin-bottom: var(--space-md);
    opacity: 0;
}

.hero-subtext {
    font-size: 0.95rem;
    color: var(--text-secondary);
    font-weight: 300;
    margin-bottom: 48px;
    opacity: 0;
}

.hero-cta {
    display: inline-block;
    font-size: 0.68rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--brass);
    text-decoration: none;
    padding: 14px 40px;
    border: 1px solid var(--brass-muted);
    transition: all 0.5s ease;
    opacity: 0;
}

.hero-cta:hover {
    background: var(--brass-hover);
    border-color: var(--brass-warm);
    box-shadow: 0 0 24px rgba(197, 160, 89, 0.08);
    transform: translateY(-1px);
}

/* ===================================
   SANCTUARY PRINCIPLES
   =================================== */

.principles {
    padding: var(--space-3xl) 48px;
    position: relative;
}

.principles-inner {
    max-width: 1000px;
    margin: 0 auto;
}

.section-whisper {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.68rem;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: var(--brass);
    text-align: center;
    margin-bottom: 80px;
}

.principles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-xl);
}

.principle {
    text-align: center;
    padding: var(--space-lg) 20px;
}

.principle-number {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.8rem;
    letter-spacing: 3px;
    color: var(--text-muted);
    display: block;
    margin-bottom: var(--space-md);
}

.principle-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem;
    font-weight: 400;
    color: var(--ivory);
    margin-bottom: 20px;
    letter-spacing: 1px;
}

.principle-text {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.9;
    font-weight: 300;
}

/* ===================================
   THE FOUR DOORS
   =================================== */

.doors {
    padding: 120px 48px var(--space-3xl);
    position: relative;
}

.doors::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 80px;
    background: linear-gradient(to bottom, transparent, var(--border));
}

.doors-inner {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
}

.doors-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 300;
    line-height: 1.3;
    color: var(--ivory);
    margin-bottom: 20px;
}

.doors-subtext {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 80px;
    font-weight: 300;
}

.doors-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
}

.door {
    display: block;
    padding: 56px 40px;
    text-decoration: none;
    text-align: left;
    border: 1px solid var(--brass-subtle);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
}

.door::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(197, 160, 89, 0.03), transparent);
    opacity: 0;
    transition: opacity 0.5s ease;
}

.door:hover {
    border-color: var(--brass-muted);
    box-shadow: 0 4px 24px rgba(197, 160, 89, 0.04);
}

.door:hover::before {
    opacity: 1;
}

.door-number {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.75rem;
    letter-spacing: 2px;
    color: var(--text-muted);
    display: block;
    margin-bottom: var(--space-sm);
}

.door-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--ivory);
    margin-bottom: var(--space-xs);
    letter-spacing: 0.5px;
    transition: color 0.4s ease;
}

.door:hover .door-title {
    color: var(--brass-warm);
}

.door-subtitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.88rem;
    font-style: italic;
    color: var(--brass);
    opacity: 0.7;
    margin-bottom: 12px;
    line-height: 1.5;
    transition: opacity 0.4s ease;
}

.door:hover .door-subtitle {
    opacity: 1;
}

.door-hint {
    font-size: 0.82rem;
    color: var(--text-secondary);
    font-weight: 300;
}

/* ===================================
   OFFERINGS / PRICING
   =================================== */

.offerings {
    padding: var(--space-3xl) 48px;
    position: relative;
}

.offerings::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: var(--space-2xl);
    background: linear-gradient(to bottom, transparent, var(--border));
}

.offerings-inner {
    max-width: 1100px;
    margin: 0 auto;
    text-align: center;
}

.offerings-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 300;
    line-height: 1.3;
    color: var(--ivory);
    margin-bottom: 20px;
}

.offerings-subtext {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 80px;
    font-weight: 300;
}

.offerings-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
}

.offering-card {
    text-align: left;
    padding: 48px 36px;
    border: 1px solid var(--brass-subtle);
    border-radius: 2px;
    position: relative;
    display: flex;
    flex-direction: column;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.offering-card:hover {
    border-color: var(--brass-muted);
    background: var(--brass-glow);
    box-shadow: 0 8px 32px rgba(197, 160, 89, 0.04);
}

.offering-card--featured {
    border-color: var(--brass-muted);
    background: rgba(197, 160, 89, 0.03);
}

.offering-card--featured::after {
    content: '';
    position: absolute;
    top: -1px;
    left: 24px;
    right: 24px;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--brass), transparent);
}

.offering-header {
    margin-bottom: 28px;
}

.offering-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.68rem;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--brass);
    display: block;
    margin-bottom: var(--space-sm);
}

.offering-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1.35;
    color: var(--ivory);
    letter-spacing: 0.3px;
}

.offering-body {
    flex: 1;
    margin-bottom: var(--space-md);
}

.offering-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: var(--space-md);
    font-weight: 300;
}

.offering-includes {
    list-style: none;
    padding: 0;
}

.offering-includes li {
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.6;
    padding: var(--space-xs) 0;
    padding-left: var(--space-sm);
    position: relative;
    font-weight: 300;
}

.offering-includes li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--brass);
    opacity: 0.5;
}

.offering-footer {
    padding-top: 28px;
    border-top: 1px solid var(--brass-subtle);
}

.offering-price {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 400;
    color: var(--ivory);
    display: block;
    margin-bottom: 4px;
}

.offering-period {
    font-size: 0.72rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    display: block;
    margin-bottom: var(--space-md);
}

.offering-cta {
    display: inline-block;
    font-size: 0.68rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--brass);
    text-decoration: none;
    padding: 12px 36px;
    border: 1px solid var(--brass-muted);
    transition: all 0.4s ease;
}

.offering-cta:hover {
    background: var(--brass-hover);
    border-color: var(--brass-warm);
    box-shadow: 0 0 20px rgba(197, 160, 89, 0.06);
}

.offerings-note {
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 300;
    font-style: italic;
    font-family: 'Cormorant Garamond', serif;
    letter-spacing: 0.3px;
}

/* ===================================
   THRESHOLD / ENTRY
   =================================== */

.threshold {
    padding: 180px 48px;
    text-align: center;
    position: relative;
}

.threshold::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: var(--space-2xl);
    background: linear-gradient(to bottom, transparent, var(--border));
}

.threshold-inner {
    max-width: 600px;
    margin: 0 auto;
}

.threshold-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 300;
    color: var(--ivory);
    margin-bottom: var(--space-lg);
}

.threshold-text {
    font-size: 0.92rem;
    color: var(--text-secondary);
    line-height: 2;
    margin-bottom: var(--space-md);
    font-weight: 300;
}

.threshold-text-secondary {
    color: var(--text-muted);
    font-style: italic;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.05rem;
    line-height: 2.2;
    margin-bottom: 56px;
}

.threshold-cta {
    display: inline-block;
    font-size: 0.68rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--brass);
    text-decoration: none;
    padding: 14px 44px;
    border: 1px solid var(--brass-muted);
    transition: all 0.5s ease;
}

.threshold-cta:hover {
    background: var(--brass-hover);
    border-color: var(--brass-warm);
    box-shadow: 0 0 24px rgba(197, 160, 89, 0.08);
    transform: translateY(-1px);
}

/* ===================================
   FOOTER
   =================================== */

.footer {
    padding: 80px 48px;
    border-top: 1px solid var(--brass-subtle);
}

.footer-inner {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

.footer-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--ivory-soft);
    margin-bottom: var(--space-md);
}

.footer-trust {
    font-size: 0.78rem;
    color: var(--text-muted);
    line-height: 1.9;
    margin-bottom: var(--space-sm);
}

.footer-warmth {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.85rem;
    font-style: italic;
    color: var(--text-secondary);
    margin-bottom: var(--space-lg);
    letter-spacing: 0.5px;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
    flex-wrap: wrap;
}

.footer-link {
    font-size: 0.72rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-link:hover {
    color: var(--brass-warm);
}

.footer-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    font-size: 0.68rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
}

.footer-meta-link {
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-meta-link:hover {
    color: var(--brass-warm);
}

.footer-dot {
    width: 3px;
    height: 3px;
    background: var(--brass);
    border-radius: 50%;
}

/* ===================================
   PAGE ENTRANCE — Quiet Arrival
   Felt emotionally, not noticed consciously.
   =================================== */

.page-veil {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--black);
    opacity: 1;
    transition: opacity 2s ease;
    pointer-events: none;
}

.page-veil.lifted {
    opacity: 0;
}

/* Hero entrance — pure opacity, barely-there drift */
.hero-content,
.hero-image {
    opacity: 0;
}

.hero-arrived .hero-image {
    animation: heroReveal 2.2s ease forwards;
}

.hero-arrived .hero-whisper {
    animation: gentleAppear 1.6s 0.6s ease forwards;
}

.hero-arrived .hero-headline {
    animation: gentleAppear 1.6s 0.8s ease forwards;
}

.hero-arrived .hero-subtext {
    animation: gentleAppear 1.6s 1.0s ease forwards;
}

.hero-arrived .hero-cta {
    animation: gentleAppear 1.4s 1.2s ease forwards;
}

/* Reduced motion — instant reveal, no animation */
@media (prefers-reduced-motion: reduce) {
    .page-veil {
        transition: none;
        opacity: 0;
    }
    .hero-arrived .hero-image,
    .hero-arrived .hero-whisper,
    .hero-arrived .hero-headline,
    .hero-arrived .hero-subtext,
    .hero-arrived .hero-cta {
        animation: none;
        opacity: 1;
        transform: none;
    }
    .reveal {
        opacity: 1;
        transform: none;
        transition: none;
    }
}

/* ===================================
   ANIMATIONS
   =================================== */

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeUp {
    from { 
        opacity: 0; 
        transform: translateY(16px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

@keyframes heroReveal {
    from { 
        opacity: 0; 
    }
    to { 
        opacity: 1; 
    }
}

@keyframes gentleAppear {
    from {
        opacity: 0;
        transform: translateY(6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Scroll reveal */
.reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
}

.reveal.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Staggered reveal for offering cards */
.offering-card.reveal:nth-child(1) { transition-delay: 0s; }
.offering-card.reveal:nth-child(2) { transition-delay: 0.15s; }
.offering-card.reveal:nth-child(3) { transition-delay: 0.3s; }

/* ===================================
   RESPONSIVE
   =================================== */

@media (max-width: 1024px) {
    .offerings-grid {
        grid-template-columns: 1fr;
        max-width: 480px;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: var(--space-xl);
    }

    .offering-card--featured::after {
        display: none;
    }
}

@media (max-width: 768px) {
    :root {
        --space-3xl: 100px;
        --space-2xl: 72px;
        --space-xl: 48px;
    }

    .nav {
        padding: 20px 24px;
    }

    .nav.scrolled {
        padding: 14px 24px;
    }

    .nav-links {
        gap: var(--space-sm);
    }

    .nav-link {
        display: none;
    }

    .hero-content {
        padding: var(--space-md);
    }

    .hero-headline {
        font-size: 2.4rem;
    }

    .principles {
        padding: var(--space-2xl) 24px;
    }

    .principles-grid {
        grid-template-columns: 1fr;
        gap: 48px;
    }

    .section-whisper {
        margin-bottom: 56px;
    }

    .doors {
        padding: 80px 24px 120px;
    }

    .doors-grid {
        grid-template-columns: 1fr;
        gap: 1px;
    }

    .door {
        padding: var(--space-lg) 28px;
    }

    .offerings {
        padding: var(--space-2xl) 24px;
    }

    .offerings-grid {
        gap: var(--space-sm);
    }

    .offering-card {
        padding: 36px 28px;
    }

    .threshold {
        padding: var(--space-2xl) 24px;
    }

    .footer {
        padding: 56px 24px;
    }

    .footer-links {
        gap: var(--space-sm);
    }
}

@media (max-width: 480px) {
    .hero-headline {
        font-size: 2rem;
    }

    .doors-headline {
        font-size: 1.8rem;
    }

    .offerings-headline {
        font-size: 1.8rem;
    }

    .threshold-headline {
        font-size: 1.8rem;
    }

    .offering-card {
        padding: 32px 24px;
    }

    .offering-title {
        font-size: 1.3rem;
    }
}
```

---

## 7. Complete HTML Structure

The full `<body>` content below is React-compatible (no `class` → `className` conversion needed for static deployment; for React, replace `class` with `className` and `for` with `htmlFor`).

```html
<body>
    <!-- Page Entrance Veil — cinematic 2s fade-in -->
    <div class="page-veil" id="page-veil"></div>

    <!-- Navigation -->
    <nav class="nav" id="nav">
        <div class="nav-brand">
            <a href="https://prulesoul.site" class="nav-brand-text">Matrix Aurin</a>
        </div>
        <div class="nav-links">
            <a href="#house" class="nav-link">House</a>
            <a href="#doors" class="nav-link">Rooms</a>
            <a href="#offerings" class="nav-link">Offerings</a>
            <a href="#threshold" class="nav-cta">Enter</a>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="hero">
        <div class="hero-visual">
            <img 
                src="https://mgx-backend-cdn.metadl.com/generate/images/1238580/2026-05-17/owrskiyaagoq/hero-removing-digital-mask-authentic-self.png" 
                alt="A person gently removing a digital mask, revealing their authentic self" 
                class="hero-image"
            >
            <div class="hero-image-overlay"></div>
        </div>
        <div class="hero-content">
            <p class="hero-whisper">Matrix Aurin</p>
            <h1 class="hero-headline">Welcome back<br>to yourself.</h1>
            <p class="hero-subtext">You do not have to perform here.</p>
            <a href="#threshold" class="hero-cta">Step inside</a>
        </div>
    </section>

    <!-- House Principles -->
    <section class="principles" id="house">
        <div class="principles-inner">
            <p class="section-whisper">What this place holds</p>
            <div class="principles-grid">
                <div class="principle">
                    <span class="principle-number">I</span>
                    <h3 class="principle-title">Privacy</h3>
                    <p class="principle-text">No pixels watch you here. No data leaves this room. Your journey stays yours — that is part of the design.</p>
                </div>
                <div class="principle">
                    <span class="principle-number">II</span>
                    <h3 class="principle-title">Presence</h3>
                    <p class="principle-text">A room that listens more than it speaks. What you bring here is met with calm attention, not performance.</p>
                </div>
                <div class="principle">
                    <span class="principle-number">III</span>
                    <h3 class="principle-title">Silence</h3>
                    <p class="principle-text">The noise stops working here. In the quiet, you begin to hear what you have always known.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- The Four Doors -->
    <section class="doors" id="doors">
        <div class="doors-inner">
            <p class="section-whisper">The doors</p>
            <h2 class="doors-headline">Four entries.<br>One quiet place.</h2>
            <p class="doors-subtext">Each one has its own tone. None of them rush you.<br>Walk through the one that calls.</p>
            
            <div class="doors-grid">
                <a href="https://prulesoul.site/the-beginning" class="door">
                    <span class="door-number">01</span>
                    <h3 class="door-title">The Beginning</h3>
                    <p class="door-subtitle">Where you slow down and listen inward</p>
                    <p class="door-hint">Find your own rhythm.</p>
                </a>
                <a href="https://prulesoul.site/body-room" class="door">
                    <span class="door-number">02</span>
                    <h3 class="door-title">Body Room</h3>
                    <p class="door-subtitle">Where the body remembers what the mind forgot</p>
                    <p class="door-hint">Let the body speak.</p>
                </a>
                <a href="https://prulesoul.site/parents-room" class="door">
                    <span class="door-number">03</span>
                    <h3 class="door-title">Parents' Room</h3>
                    <p class="door-subtitle">Where inherited patterns become visible</p>
                    <p class="door-hint">What was inherited. What is yours.</p>
                </a>
                <a href="https://prulesoul.site/course-room" class="door">
                    <span class="door-number">04</span>
                    <h3 class="door-title">Course Room</h3>
                    <p class="door-subtitle">Where growth happens without pressure</p>
                    <p class="door-hint">Mastery without performance.</p>
                </a>
            </div>
        </div>
    </section>

    <!-- Offerings / Pricing -->
    <section class="offerings" id="offerings">
        <div class="offerings-inner">
            <p class="section-whisper">Ways to be here</p>
            <h2 class="offerings-headline">Choose how you wish to arrive.</h2>
            <p class="offerings-subtext">There is no wrong door. Each path holds space for you differently.</p>

            <div class="offerings-grid">
                <!-- Tier 1 -->
                <div class="offering-card">
                    <div class="offering-header">
                        <span class="offering-label">A First Step</span>
                        <h3 class="offering-title">One session.<br>One quiet hour.</h3>
                    </div>
                    <div class="offering-body">
                        <p class="offering-description">No commitment. Just curiosity. Enter one room, stay as long as you need, leave when you're ready. This is simply a beginning.</p>
                        <ul class="offering-includes">
                            <li>Access to one room of your choosing</li>
                            <li>A guided session at your pace</li>
                            <li>No subscription, no follow-up pressure</li>
                        </ul>
                    </div>
                    <div class="offering-footer">
                        <span class="offering-price">€45</span>
                        <span class="offering-period">one session</span>
                        <a href="https://prulesoul.site/join?tier=first-step" class="offering-cta">Begin quietly</a>
                    </div>
                </div>

                <!-- Tier 2 -->
                <div class="offering-card offering-card--featured">
                    <div class="offering-header">
                        <span class="offering-label">A Steady Presence</span>
                        <h3 class="offering-title">All rooms.<br>Monthly companionship.</h3>
                    </div>
                    <div class="offering-body">
                        <p class="offering-description">Return as often as you need. Move freely between all rooms, with a monthly voice session to ground your journey. You are welcome here, always.</p>
                        <ul class="offering-includes">
                            <li>Unlimited access to all four rooms</li>
                            <li>One private voice session per month</li>
                            <li>Priority access to new spaces</li>
                            <li>The quiet community thread</li>
                        </ul>
                    </div>
                    <div class="offering-footer">
                        <span class="offering-price">€120</span>
                        <span class="offering-period">per month</span>
                        <a href="https://prulesoul.site/join?tier=steady" class="offering-cta">Step in</a>
                    </div>
                </div>

                <!-- Tier 3 -->
                <div class="offering-card">
                    <div class="offering-header">
                        <span class="offering-label">Your Own Room</span>
                        <h3 class="offering-title">A space held<br>only for you.</h3>
                    </div>
                    <div class="offering-body">
                        <p class="offering-description">For those ready for sustained, intimate work. Weekly voice sessions, unlimited room access, and a private channel — your own corner of this house.</p>
                        <ul class="offering-includes">
                            <li>Unlimited access to all rooms</li>
                            <li>Weekly private AI voice sessions</li>
                            <li>Priority presence and response</li>
                            <li>Early access to future sanctuaries</li>
                            <li>Direct channel for quiet requests</li>
                        </ul>
                    </div>
                    <div class="offering-footer">
                        <span class="offering-price">€380</span>
                        <span class="offering-period">per month</span>
                        <a href="https://prulesoul.site/join?tier=own-room" class="offering-cta">Enter gently</a>
                    </div>
                </div>
            </div>

            <p class="offerings-note">All paths include complete privacy. No data shared. No tracking. Cancel with a single word.</p>
        </div>
    </section>

    <!-- Threshold / Entry -->
    <section class="threshold" id="threshold">
        <div class="threshold-inner">
            <p class="section-whisper">A quiet invitation</p>
            <h2 class="threshold-headline">You are welcome here.</h2>
            <p class="threshold-text">
                I want you to know — this is not a place you have to earn.<br>
                It is a place you recognize. A place that has been waiting.
            </p>
            <p class="threshold-text threshold-text-secondary">
                Something inside you already knows.<br>
                Not everything you carry was chosen by you.<br><br>
                This is where you begin to see that clearly —<br>
                gently, without rush — and from there, choose what stays.
            </p>
            <a href="https://prulesoul.site/the-beginning" class="threshold-cta">Begin gently</a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-inner">
            <div class="footer-brand">Matrix Aurin</div>
            <p class="footer-trust">No social-media pixels. No tracking cookies. No public feed.<br>Your journey through this work stays yours — that is part of the design.</p>
            <p class="footer-warmth">Built with care. Held with silence.</p>
            <div class="footer-links">
                <a href="https://prulesoul.site/the-beginning" class="footer-link">The Beginning</a>
                <a href="https://prulesoul.site/body-room" class="footer-link">Body Room</a>
                <a href="https://prulesoul.site/parents-room" class="footer-link">Parents' Room</a>
                <a href="https://prulesoul.site/course-room" class="footer-link">Course Room</a>
            </div>
            <div class="footer-meta">
                <span>Est. 2026</span>
                <span class="footer-dot"></span>
                <span>Quiet by design</span>
                <span class="footer-dot"></span>
                <a href="https://prulesoul.site/privacy" class="footer-meta-link">Privacy</a>
            </div>
        </div>
    </footer>

    <script type="module" src="./script.js"></script>
</body>
```

---

## 8. Entrance Animation Code

The page uses a cinematic 2-second fade-in entrance system. The visitor sees pure black, then the page slowly reveals — creating an emotional "arrival" rather than a page load.

### System Components:

**1. HTML — The Veil Element (first child of `<body>`):**
```html
<div class="page-veil" id="page-veil"></div>
```

**2. CSS — Veil Styles + Hero Animation Keyframes:**
```css
/* Page Entrance — Quiet Arrival */
.page-veil {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--black);
    opacity: 1;
    transition: opacity 2s ease;
    pointer-events: none;
}

.page-veil.lifted {
    opacity: 0;
}

/* Hero entrance — pure opacity, barely-there drift */
.hero-content,
.hero-image {
    opacity: 0;
}

.hero-arrived .hero-image {
    animation: heroReveal 2.2s ease forwards;
}

.hero-arrived .hero-whisper {
    animation: gentleAppear 1.6s 0.6s ease forwards;
}

.hero-arrived .hero-headline {
    animation: gentleAppear 1.6s 0.8s ease forwards;
}

.hero-arrived .hero-subtext {
    animation: gentleAppear 1.6s 1.0s ease forwards;
}

.hero-arrived .hero-cta {
    animation: gentleAppear 1.4s 1.2s ease forwards;
}

@keyframes heroReveal {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes gentleAppear {
    from {
        opacity: 0;
        transform: translateY(6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Reduced motion — instant reveal, no animation */
@media (prefers-reduced-motion: reduce) {
    .page-veil {
        transition: none;
        opacity: 0;
    }
    .hero-arrived .hero-image,
    .hero-arrived .hero-whisper,
    .hero-arrived .hero-headline,
    .hero-arrived .hero-subtext,
    .hero-arrived .hero-cta {
        animation: none;
        opacity: 1;
        transform: none;
    }
    .reveal {
        opacity: 1;
        transform: none;
        transition: none;
    }
}
```

**3. JavaScript — Entrance Trigger:**
```javascript
const pageVeil = document.getElementById('page-veil');
const heroSection = document.getElementById('hero');

window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        // Lift the veil over 2 seconds
        if (pageVeil) {
            pageVeil.classList.add('lifted');
        }

        // Trigger hero content animations
        if (heroSection) {
            heroSection.classList.add('hero-arrived');
        }

        // Remove veil from DOM after transition completes
        setTimeout(() => {
            if (pageVeil) {
                pageVeil.remove();
            }
        }, 2200);
    });
});
```

### Animation Timeline:
| Time | Event |
|------|-------|
| 0ms | Page loads — black veil covers everything |
| ~16ms | `requestAnimationFrame` fires — veil begins 2s fade, hero image begins 2.2s reveal |
| 600ms | Hero whisper begins appearing (1.6s duration) |
| 800ms | Hero headline begins appearing (1.6s duration) |
| 1000ms | Hero subtext begins appearing (1.6s duration) |
| 1200ms | Hero CTA begins appearing (1.4s duration) |
| 2000ms | Veil fully transparent |
| 2200ms | Veil element removed from DOM |

### Accessibility:
- `prefers-reduced-motion: reduce` media query disables all animations
- Veil has `pointer-events: none` so it never blocks interaction
- All content is in the DOM from the start (no JS-dependent rendering)

---

## 9. Mobile Responsiveness Notes

The design uses three breakpoints with a mobile-first degradation approach.

### Breakpoints:

| Breakpoint | Target | Key Changes |
|-----------|--------|-------------|
| ≤ 1024px | Tablets | Pricing grid → single column (max-width 480px centered) |
| ≤ 768px | Mobile | Full mobile layout — reduced spacing, hidden nav links, single-column grids |
| ≤ 480px | Small phones | Further headline size reduction, tighter card padding |

### What Changes at ≤ 1024px:
- Offerings grid: 3 columns → 1 column (centered, max-width 480px)
- Featured card top-line accent: hidden

### What Changes at ≤ 768px:
- **Spacing tokens reduced:**
  - `--space-3xl`: 160px → 100px
  - `--space-2xl`: 100px → 72px
  - `--space-xl`: 64px → 48px
- **Navigation:** padding reduced (20px 24px), nav-link items hidden (only brand + "Enter" CTA visible)
- **Hero:** headline shrinks to 2.4rem, content padding reduced
- **Principles:** single column grid, 48px gap
- **Doors:** single column grid, reduced padding
- **Offerings:** reduced card padding (36px 28px), smaller gap
- **Threshold:** reduced padding
- **Footer:** reduced padding, smaller link gaps

### What Changes at ≤ 480px:
- Hero headline: 2rem
- Doors headline: 1.8rem
- Offerings headline: 1.8rem
- Threshold headline: 1.8rem
- Offering cards: padding 32px 24px
- Offering title: 1.3rem

### Fluid Typography:
Headlines use `clamp()` for smooth scaling:
- Hero: `clamp(2.8rem, 7vw, 5rem)`
- Doors: `clamp(2rem, 4vw, 3rem)`
- Offerings: `clamp(2rem, 4vw, 2.8rem)`
- Threshold: `clamp(2rem, 4vw, 2.8rem)`

### Touch Considerations:
- All interactive elements (doors, CTAs) have generous padding for touch targets
- No hover-dependent content (hover enhances but doesn't reveal)
- Smooth scroll behavior via CSS `scroll-behavior: smooth`

---

## 10. Emergent Integration Notes

### From the HTML Integration Comment Block:

1. **Copy the `<body>` contents** into your Emergent page template, preserving section order.
2. **Include style.css** in your asset pipeline or inline the CSS variables into your global stylesheet.
3. **Include script.js** as a module script at body end.
4. **Google Fonts** (Cormorant Garamond + Inter) must be loaded via `<link>` in `<head>` or your font pipeline.
5. **All internal links** point to prulesoul.site subpages. Adjust paths if your routing differs.
6. **Pricing CTAs** link to `prulesoul.site/join` with tier query params. Connect to your payment processor.
7. **Hero image** is served from CDN. Replace `src` with your own asset URL if self-hosting.

### Asset Dependencies:

| Asset | Source | Notes |
|-------|--------|-------|
| Hero image | `https://mgx-backend-cdn.metadl.com/generate/images/1238580/2026-05-17/owrskiyaagoq/hero-removing-digital-mask-authentic-self.png` | Can be self-hosted; update `src` accordingly |
| Cormorant Garamond | Google Fonts | Weights: 300, 400, 500, italic 300/400 |
| Inter | Google Fonts | Weights: 300, 400 |
| Favicon | `https://public-frontend-cos.metadl.com/mgx/img/favicon_atoms.ico` | Replace with prulesoul.site favicon |

### Link Map:

| Element | Destination |
|---------|-------------|
| Nav brand | `https://prulesoul.site` |
| Door 1 | `https://prulesoul.site/the-beginning` |
| Door 2 | `https://prulesoul.site/body-room` |
| Door 3 | `https://prulesoul.site/parents-room` |
| Door 4 | `https://prulesoul.site/course-room` |
| Tier 1 CTA | `https://prulesoul.site/join?tier=first-step` |
| Tier 2 CTA | `https://prulesoul.site/join?tier=steady` |
| Tier 3 CTA | `https://prulesoul.site/join?tier=own-room` |
| Threshold CTA | `https://prulesoul.site/the-beginning` |
| Footer links | Same as Door 1–4 |
| Privacy link | `https://prulesoul.site/privacy` |

### Build Output:
The Vite build produces a `dist/` folder containing:
- `index.html` (minified)
- `assets/` (bundled CSS + JS with content hashes)

This `dist/` folder can be deployed directly as a static site or integrated into the Emergent server's static file serving.

---

## Atoms → Emergent Workflow Protocol

### Rules of Engagement:

1. **Atoms may ONLY update the preview/staging environment.** Atoms never touches production directly.

2. **Preview deployment** means the built output is placed in a staging URL or preview branch for review. It does NOT go live on prulesoul.site until explicitly approved.

3. **Production deployment requires a separate label:** `APPROVED FOR PRODUCTION DEPLOY`. This document carries only `APPROVED FOR PREVIEW IMPLEMENTATION`.

4. **No new ideas, effects, sections, or improvements** are introduced in this package. It documents exactly what exists in the approved codebase — nothing more, nothing less.

5. **No backend/auth/payment/voice/route changes** are included. The pricing CTAs link to `prulesoul.site/join` with query params; the actual payment processing is handled by the Emergent backend independently.

6. **Change control:** Any modification to this package after approval requires a new version number, a change log entry, and re-approval before preview deployment.

### Deployment Checklist:

- [ ] Font links added to `<head>` (or font pipeline configured)
- [ ] CSS variables integrated (either via style.css or inlined into global stylesheet)
- [ ] Hero image URL confirmed (CDN or self-hosted)
- [ ] Favicon replaced with prulesoul.site favicon
- [ ] All internal links verified against Emergent routing
- [ ] Payment processor connected to `/join` endpoint with tier params
- [ ] script.js loaded as module at body end
- [ ] Preview URL generated and shared for review
- [ ] Visual QA completed on desktop + mobile
- [ ] `prefers-reduced-motion` behavior verified
- [ ] Production deploy approval obtained (separate from this document)

---

*End of Implementation Package*