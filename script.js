/* ========================================
   DEXTER TALENT - Avant-Garde JavaScript
   Smooth reveals, parallax, and interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Scroll Reveal (Intersection Observer) ----
    const revealElements = document.querySelectorAll(
        '.about-header, .bento-card, .services-header, .services-showcase, .service-item, ' +
        '.roster-header, .roster-item, .scroll-block, .contact-center-box, .footer-main, .footer-bottom-bar'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger siblings
                const siblings = Array.from(entry.target.parentElement.children)
                    .filter(c => c.classList.contains('reveal'));
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, idx * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- Navigation active state ----
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    function updateNav() {
        const scrollPos = window.scrollY + 200;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(a => {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === '#' + id) {
                        a.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateNav, { passive: true });

    // ---- Smooth scroll ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ---- Hero parallax on mouse (subtle) ----
    const hero = document.querySelector('.hero');
    const heroTitle = document.querySelector('.hero-title');

    if (hero && heroTitle) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
            
            heroTitle.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
        });

        hero.addEventListener('mouseleave', () => {
            heroTitle.style.transform = '';
            heroTitle.style.transition = 'transform 0.6s ease';
            setTimeout(() => { heroTitle.style.transition = ''; }, 600);
        });
    }

    // ---- Showcase cards parallax ----
    const showcaseCards = document.querySelectorAll('.showcase-card');
    const showcase = document.querySelector('.services-showcase');

    if (showcase) {
        showcase.addEventListener('mousemove', (e) => {
            const rect = showcase.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 30;
            const y = (e.clientY - rect.top - rect.height / 2) / 30;

            showcaseCards.forEach((card, i) => {
                const factor = (i - 1.5) * 0.6;
                const baseRotation = [-15, -5, 5, 15][i] || 0;
                const baseX = [60, 20, -20, -60][i] || 0;
                const baseY = [20, 0, 0, 20][i] || 0;

                if (!card.matches(':hover')) {
                    card.style.transform = `
                        rotate(${baseRotation + x * factor * 0.2}deg) 
                        translateX(${baseX + x * factor}px) 
                        translateY(${baseY + y * Math.abs(factor)}px)
                    `;
                }
            });
        });
    }

    // ---- Roster item hover effect - reveal stats ----
    document.querySelectorAll('.roster-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const img = item.querySelector('.roster-img img');
            if (img) img.style.filter = 'grayscale(0%)';
        });
        item.addEventListener('mouseleave', () => {
            const img = item.querySelector('.roster-img img');
            if (img) img.style.filter = '';
        });
    });

    // ---- Magnetic star decoration ----
    const stars = document.querySelectorAll('.star-decoration');
    stars.forEach(star => {
        document.addEventListener('mousemove', (e) => {
            const rect = star.getBoundingClientRect();
            const starX = rect.left + rect.width / 2;
            const starY = rect.top + rect.height / 2;
            const dx = e.clientX - starX;
            const dy = e.clientY - starY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 200) {
                const pull = (200 - dist) / 200;
                star.style.transform = `translate(${dx * pull * 0.15}px, ${dy * pull * 0.15}px)`;
            } else {
                star.style.transform = '';
            }
        });
    });

    // ---- Title letter animation on load ----
    const titleLines = document.querySelectorAll('.hero-title .title-top, .hero-title .title-bottom');
    titleLines.forEach((line, i) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(80px)';
        line.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
        
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 300 + i * 200);
    });

    // ---- Bottom links fade in ----
    const heroBottom = document.querySelector('.hero-bottom');
    if (heroBottom) {
        heroBottom.style.opacity = '0';
        heroBottom.style.transition = 'opacity 1s ease 1s';
        setTimeout(() => { heroBottom.style.opacity = '1'; }, 100);
    }
});
