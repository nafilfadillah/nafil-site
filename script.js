/* =========================================================
   LANGUAGE TOGGLE (ID / EN)
========================================================= */
(function initLangToggle() {
    const langToggle = document.getElementById('langToggle');
    if (!langToggle) return;

    const saved = localStorage.getItem('lang') || 'id';
    applyLang(saved);

    langToggle.addEventListener('click', () => {
        const current = document.documentElement.lang === 'en' ? 'en' : 'id';
        const next = current === 'id' ? 'en' : 'id';
        applyLang(next);
        localStorage.setItem('lang', next);
    });

    function applyLang(lang) {
        document.documentElement.lang = lang;
        langToggle.textContent = lang.toUpperCase();

        document.querySelectorAll('[data-i18n-id][data-i18n-en]').forEach(el => {
            el.textContent = lang === 'en' ? el.dataset.i18nEn : el.dataset.i18nId;
        });

        document.querySelectorAll('[data-i18n-placeholder-id][data-i18n-placeholder-en]').forEach(el => {
            el.setAttribute('placeholder', lang === 'en' ? el.dataset.i18nPlaceholderEn : el.dataset.i18nPlaceholderId);
        });
    }
})();

/* =========================================================
   SCROLL PROGRESS BAR + BACK TO TOP
========================================================= */
(function initScrollUtils() {
    const progress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    function onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progress) progress.style.width = pct + '%';
        if (backToTop) backToTop.classList.toggle('is-visible', scrollTop > 500);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotionSafe() ? 'auto' : 'smooth' });
    });

    function prefersReducedMotionSafe() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
})();

/* =========================================================
   GITHUB LIVE STATS
   Fetch data publik dari GitHub REST API (nggak butuh auth/token).
========================================================= */
(function initGitHubStats() {
    const repoEl = document.getElementById('ghRepos');
    const followersEl = document.getElementById('ghFollowers');
    const followingEl = document.getElementById('ghFollowing');
    if (!repoEl) return;

    fetch('https://api.github.com/users/nafilfadillah')
        .then(res => { if (!res.ok) throw new Error('GitHub API error'); return res.json(); })
        .then(data => {
            repoEl.textContent = data.public_repos ?? '—';
            followersEl.textContent = data.followers ?? '—';
            followingEl.textContent = data.following ?? '—';
        })
        .catch(() => {
            [repoEl, followersEl, followingEl].forEach(el => { if (el) el.textContent = 'N/A'; });
        })
        .finally(() => {
            [repoEl, followersEl, followingEl].forEach(el => el?.classList.remove('is-loading'));
        });
})();

/* =========================================================
   VCARD DOWNLOAD ("Save Contact")
========================================================= */
document.getElementById('saveContactBtn')?.addEventListener('click', () => {
    const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Fadillah;Nafil;;;',
        'FN:Nafil Fadillah',
        'TITLE:Network Engineer & Web Developer',
        'EMAIL;TYPE=INTERNET:nafilfadillah09@gmail.com',
        'TEL;TYPE=CELL:+6281573903440',
        'URL:https://github.com/nafilfadillah',
        'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Nafil_Fadillah.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});

/* =========================================================
   CONTACT FORM — builds a prefilled mailto: (no backend needed)
========================================================= */
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    const subject = encodeURIComponent(`Halo dari ${name} — via portofolio`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:nafilfadillah09@gmail.com?subject=${subject}&body=${body}`;
});

/* =========================================================
   NAVBAR — scrolled state, mobile menu, scrollspy
========================================================= */
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navbar) {
        const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 30);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (navToggle && navLinks) {
        const closeMenu = () => {
            navToggle.classList.remove('is-open');
            navLinks.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        };
        navToggle.addEventListener('click', () => {
            const open = navLinks.classList.toggle('is-open');
            navToggle.classList.toggle('is-open', open);
            navToggle.setAttribute('aria-expanded', String(open));
        });
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    }

    const sections = Array.from(document.querySelectorAll('section[id]'));
    const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (sections.length && links.length && 'IntersectionObserver' in window) {
        const setActive = (id) => {
            links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
        };
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        sections.forEach(s => spy.observe(s));
    }
})();

/* =========================================================
   PROJECT DETAIL DATA
   Edit di sini kalau mau update isi modal "Details" per project.
   key harus sama persis dengan data-project di HTML.
========================================================= */
const PROJECTS = {
    'air-quality': {
        icon: 'fa-wind',
        caseStudy: 'case-study-air-quality.html',
        problem: 'Kabin/ruangan tertutup nggak punya cara otomatis buat deteksi udara kotor (CO/VOC, PM2.5) dan langsung merespons tanpa campur tangan manual.',
        arch: 'ESP32 baca sensor MQ135 (CO/VOC), GP2Y1010AU0F (PM2.5), DHT22 (suhu/kelembapan), dan PIR (kehadiran orang). Logic hysteresis berbasis flag (F1/F2/F3) menentukan kapan fan, ionizer, dan servo ventilasi aktif. Status ditampilkan di OLED SH1106.',
        tools: ['ESP32', 'MQ135', 'GP2Y1010AU0F', 'DHT22', 'PIR', 'SH1106 OLED', 'Relay'],
        outcome: 'Sistem otomatis membersihkan &amp; memventilasi udara kabin berdasarkan kondisi real-time, jadi bagian dari skripsi Sistem Komputer.'
    },
    'hospital': {
        icon: 'fa-notes-medical',
        problem: 'Pencatatan data pasien, dokter, dan rekam medis manual rawan hilang dan lambat direkap.',
        arch: 'Aplikasi berbasis Python dengan database MySQL untuk menyimpan data pasien, dokter, obat, dan rekam medis, plus modul laporan.',
        tools: ['Python', 'MySQL', 'Database Design'],
        outcome: 'Sistem terpusat untuk mengelola data rumah sakit dan menghasilkan laporan otomatis.'
    },
    'mail-server': {
        icon: 'fa-envelope-open-text',
        problem: 'Butuh mail server sendiri yang aman dan nggak gampang ditandai spam oleh penyedia email lain.',
        arch: 'Postfix sebagai MTA dan Dovecot sebagai IMAP/POP3 server di atas Ubuntu Server, dikonfigurasi dengan SPF, DKIM, dan DMARC untuk validasi pengirim.',
        tools: ['Ubuntu Server', 'Postfix', 'Dovecot', 'SPF/DKIM/DMARC'],
        outcome: 'Mail server mandiri dengan deliverability yang lebih terjaga karena email terverifikasi dengan benar.'
    },
    'dns-server': {
        icon: 'fa-sitemap',
        problem: 'Jaringan lokal butuh resolusi nama domain sendiri tanpa bergantung ke DNS publik.',
        arch: 'BIND9 dikonfigurasi dengan forward zone dan reverse zone untuk resolusi nama ke IP dan sebaliknya di jaringan lab.',
        tools: ['Ubuntu Server', 'BIND9', 'DNS Zones'],
        outcome: 'Resolusi nama domain internal berjalan mandiri dan konsisten di jaringan lokal.'
    },
    'vpn': {
        icon: 'fa-shield-halved',
        problem: 'Anggota lab perlu akses aman ke jaringan laboratorium dari luar kampus tanpa membuka port yang berisiko.',
        arch: 'WireGuard di-setup sebagai VPN server ringan dengan enkripsi modern, key-pair per client untuk kontrol akses.',
        tools: ['WireGuard', 'Linux', 'Networking Security'],
        outcome: 'Akses remote yang aman dan cepat ke jaringan lab dari mana saja.'
    },
    'monitoring': {
        icon: 'fa-chart-line',
        problem: 'Nggak ada visibilitas real-time terhadap kondisi bandwidth, uptime, dan trafik server.',
        arch: 'Dashboard yang menarik data bandwidth, uptime, dan trafik jaringan, ditampilkan dalam grafik yang di-update berkala.',
        tools: ['Linux', 'Monitoring Tools', 'Dashboard'],
        outcome: 'Tim bisa memantau kesehatan jaringan secara real-time dan lebih cepat merespons anomali.'
    },
    'cyberlab': {
        icon: 'fa-user-secret',
        problem: 'Perlu ruang aman buat belajar teknik penetration testing dasar tanpa menyentuh sistem produksi.',
        arch: 'Lab tertutup menggunakan Kali Linux untuk simulasi serangan, Wireshark untuk analisis paket, Nmap untuk network scanning, dan Metasploit untuk exploit testing dasar.',
        tools: ['Kali Linux', 'Wireshark', 'Nmap', 'Metasploit'],
        outcome: 'Pemahaman praktis soal alur penetration testing dan cara membaca trafik jaringan yang mencurigakan.'
    },
    'portfolio': {
        icon: 'fa-globe',
        problem: 'Butuh satu tempat terpusat untuk menampilkan project, sertifikasi, dan cara dihubungi.',
        arch: 'Website statis HTML/CSS/JS, di-host di GitHub Pages dengan Cloudflare sebagai DNS & CDN, custom domain.',
        tools: ['HTML', 'CSS', 'JavaScript', 'Cloudflare', 'GitHub Pages'],
        outcome: 'Portofolio yang cepat diakses, gratis di-hosting, dan gampang di-update lewat Git.'
    }
};

/* =========================================================
   PROJECT MODAL
========================================================= */
const modalOverlay = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');

function openProjectModal(key) {
    const data = PROJECTS[key];
    if (!data || !modalOverlay) return;

    const card = document.querySelector(`.project-card[data-project="${key}"]`);
    const title = card?.querySelector('h3')?.textContent ?? key;
    const repoLink = card?.querySelector('.card-repo')?.getAttribute('href') ?? '#';

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalVisual').innerHTML = `<i class="fas ${data.icon}"></i>`;
    document.getElementById('modalProblem').textContent = data.problem;
    document.getElementById('modalArch').textContent = data.arch;
    document.getElementById('modalOutcome').innerHTML = data.outcome;
    document.getElementById('modalRepo').setAttribute('href', repoLink);

    const toolsEl = document.getElementById('modalTools');
    toolsEl.innerHTML = data.tools.map(t => `<span class="tag">${t}</span>`).join('');

    const caseStudyBtn = document.getElementById('modalCaseStudy');
    if (caseStudyBtn) {
        if (data.caseStudy) {
            caseStudyBtn.href = data.caseStudy;
            caseStudyBtn.style.display = '';
        } else {
            caseStudyBtn.style.display = 'none';
        }
    }

    modalOverlay.classList.add('is-open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    modalOverlay?.classList.remove('is-open');
    modalOverlay?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

document.querySelectorAll('.card-details').forEach(btn => {
    btn.addEventListener('click', () => openProjectModal(btn.dataset.project));
});

modalClose?.addEventListener('click', closeProjectModal);
modalOverlay?.addEventListener('click', e => {
    if (e.target === modalOverlay) closeProjectModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProjectModal();
});

/* =========================================================
   PROJECT CATEGORY FILTER
========================================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('#projectsGrid .project-card');
const filterEmpty = document.getElementById('filterEmpty');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.dataset.filter;
        let visibleCount = 0;

        projectCards.forEach(card => {
            const match = filter === 'all' || card.dataset.category === filter;
            card.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });

        if (filterEmpty) filterEmpty.hidden = visibleCount !== 0;
    });
});

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
========================================================= */
function computeStats() {
    const projectCount = document.querySelectorAll('#projects .project-card').length;

    const techNames = new Set();
    document.querySelectorAll('.logo-item span').forEach(el => techNames.add(el.textContent.trim()));

    const startYear = 2020;
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
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    if (dot && outline) {
        document.body.classList.add('has-custom-cursor');
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
