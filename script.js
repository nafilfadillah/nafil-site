/* =========================================================
   AOS
========================================================= */
AOS.init({ duration: 800, once: true, offset: 60 });

/* =========================================================
   LOADER
========================================================= */
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 800);
        }
    }, 900);
});

/* =========================================================
   THEME TOGGLE (persisted)
========================================================= */
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}
setThemeIcon();

themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    setThemeIcon();
});

function setThemeIcon() {
    const icon = themeToggle?.querySelector('i');
    if (!icon) return;
    const isLight = document.body.classList.contains('light-mode');
    icon.classList.toggle('fa-moon', !isLight);
    icon.classList.toggle('fa-sun', isLight);
}

/* =========================================================
   TYPING EFFECT
========================================================= */
const typingEl = document.getElementById('typing');
const roles = ['Network Engineer', 'Linux Enthusiast', 'Web Developer', 'IoT Developer'];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (typingEl) {
    if (prefersReducedMotion) {
        typingEl.textContent = roles[0];
    } else {
        let roleIndex = 0, charIndex = 0, deleting = false;

        function typeLoop() {
            const current = roles[roleIndex];

            if (!deleting) {
                charIndex++;
                typingEl.textContent = current.slice(0, charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(typeLoop, 1400);
                    return;
                }
            } else {
                charIndex--;
                typingEl.textContent = current.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                }
            }
            setTimeout(typeLoop, deleting ? 45 : 90);
        }
        typeLoop();
    }
}

/* =========================================================
   STATS — auto-computed from actual page content
   (no hardcoded numbers to keep out of sync with reality)
========================================================= */
function computeStats() {
    const projectCount = document.querySelectorAll('#projects .project-card').length;

    const techNames = new Set();
    document.querySelectorAll('.logo-item span').forEach(el => techNames.add(el.textContent.trim()));

    const startYear = 2020; // SMK TKJ start — adjust if you want "years coding" instead
    const years = new Date().getFullYear() - startYear;

    animateCount('statProjects', projectCount);
    animateCount('statTech', techNames.size);
    animateCount('statYears', years);
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    if (prefersReducedMotion || target === 0) { el.textContent = target; return; }

    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

const statsSection = document.getElementById('stats');
if (statsSection && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                computeStats();
                io.disconnect();
            }
        });
    }, { threshold: .4 });
    io.observe(statsSection);
} else {
    computeStats();
}

/* =========================================================
   TILT EFFECT ON CARDS (skip on touch devices)
========================================================= */
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('.skill-card, .project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = (y - rect.height / 2) / 22;
            const rotateY = (rect.width / 2 - x) / 22;
            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* =========================================================
   CUSTOM CURSOR (desktop / mouse only)
========================================================= */
if (!isTouch) {
    document.body.classList.add('has-custom-cursor');
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    if (dot && outline) {
        document.addEventListener('mousemove', e => {
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';
            outline.animate(
                { left: e.clientX + 'px', top: e.clientY + 'px' },
                { duration: 300, fill: 'forwards' }
            );
        });

        document.querySelectorAll('.skill-card, .project-card, .btn, .contact-card, .nav-links a, .cv-btn, .view-pdf-btn')
            .forEach(el => {
                el.addEventListener('mouseenter', () => {
                    outline.style.width = '58px';
                    outline.style.height = '58px';
                    outline.style.borderColor = 'var(--signal)';
                });
                el.addEventListener('mouseleave', () => {
                    outline.style.width = '34px';
                    outline.style.height = '34px';
                    outline.style.borderColor = 'rgba(240,180,41,.5)';
                });
            });
    }
}

/* =========================================================
   BACKGROUND PARTICLES (lightweight canvas)
========================================================= */
(function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function makeParticles() {
        const count = Math.min(60, Math.floor((w * h) / 22000));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.4 + 0.4
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(240,180,41,0.55)';
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    resize();
    makeParticles();
    draw();
    window.addEventListener('resize', () => { resize(); makeParticles(); });
})();
