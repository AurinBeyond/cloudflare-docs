// Matrix Aurin — Quiet interactions

// ===================================
// PAGE ENTRANCE — Cinematic 2.5s arrival
// ===================================

const pageVeil = document.getElementById('page-veil');
const heroSection = document.getElementById('hero');

// Trigger the calm entrance after page loads
window.addEventListener('load', () => {
    // Small delay to ensure paint is ready
    requestAnimationFrame(() => {
        // Lift the veil over 2.5 seconds
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
        }, 2800);
    });
});

// ===================================
// NAVBAR — Scroll behavior
// ===================================

const nav = document.getElementById('nav');

const handleScroll = () => {
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
};

window.addEventListener('scroll', handleScroll, { passive: true });

// ===================================
// HERO PARALLAX — Subtle opacity fade on scroll
// ===================================

const heroImage = document.querySelector('.hero-image');

const handleHeroParallax = () => {
    if (!heroImage) return;
    const scrollY = window.scrollY;
    const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
    const progress = Math.min(scrollY / heroHeight, 1);
    // Gently dim the hero image as user scrolls away
    const opacity = 1 - progress * 0.6;
    heroImage.style.opacity = Math.max(opacity, 0.3);
};

window.addEventListener('scroll', handleHeroParallax, { passive: true });

// ===================================
// SCROLL REVEAL — Sections below hero
// ===================================

const revealElements = document.querySelectorAll(
    '.principle, .door, .doors-headline, .doors-subtext, .threshold-headline, .threshold-text, .threshold-cta, .section-whisper, .offering-card, .offerings-headline, .offerings-subtext, .offerings-note, .house-wings-inner'
);

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px',
    }
);

revealElements.forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// ===================================
// SMOOTH SCROLL — Anchor links
// ===================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    });
});