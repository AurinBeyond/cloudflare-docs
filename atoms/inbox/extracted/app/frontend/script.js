// Matrix Aurin — Quiet interactions

// ===================================
// PAGE ENTRANCE — Cinematic 2s arrival
// ===================================

const pageVeil = document.getElementById('page-veil');
const heroSection = document.getElementById('hero');

// Trigger the calm entrance after page loads
window.addEventListener('load', () => {
    // Small delay to ensure paint is ready
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

// ===================================
// NAVBAR — Scroll behavior
// ===================================

const nav = document.getElementById('nav');

const handleScroll = () => {
    if (window.scrollY > 80) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
};

window.addEventListener('scroll', handleScroll, { passive: true });

// ===================================
// SCROLL REVEAL — Sections below hero
// ===================================

const revealElements = document.querySelectorAll(
    '.principle, .door, .doors-headline, .doors-subtext, .threshold-headline, .threshold-text, .threshold-cta, .section-whisper, .offering-card, .offerings-headline, .offerings-subtext, .offerings-note'
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
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
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