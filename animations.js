/* animations.js — améliorations d'animations complémentaires */
document.addEventListener('DOMContentLoaded', () => {

  // ─── TYPEWRITER sur "Yassine Dahbi" ──────────────────────────────────────
  const highlightEl = document.querySelector('h1 .highlight');
  if (highlightEl) {
    const fullText = highlightEl.textContent.replace(/\s+/g, ' ').trim();
    highlightEl.textContent = '';
    highlightEl.classList.add('typewriter-cursor');

    let i = 0;
    function typeNext() {
      if (i < fullText.length) {
        highlightEl.textContent += fullText[i++];
        setTimeout(typeNext, 90);
      } else {
        // Curseur clignote 2s puis disparaît
        setTimeout(() => highlightEl.classList.remove('typewriter-cursor'), 2200);
      }
    }

    // Démarrer après le preloader (~1s)
    window.addEventListener('load', () => setTimeout(typeNext, 1000));
  }

  // ─── ICÔNES ORBITALES autour de la photo de profil ───────────────────────
  // Injection dans le <header #header-content> pour éviter tout overflow:hidden
  const orbitIconsData = [
    { icon: 'fa-stethoscope', delay: '0s',      label: 'Maintenance biomédicale' },
    { icon: 'fa-microchip',   delay: '-4.67s',  label: 'Électronique & Prototypage' },
    { icon: 'fa-heartbeat',   delay: '-9.33s',  label: 'Monitorage patient' },
  ];

  function buildOrbitIcons() {
    const profilePic = document.querySelector('.profile-pic');
    const section    = document.querySelector('#header-content');
    if (!profilePic || !section) return;

    // Retirer les anciens pivots si on recalcule (resize)
    section.querySelectorAll('.orbit-pivot').forEach(el => el.remove());

    // S'assurer que la section est un parent de positionnement
    section.style.position = 'relative';

    const sRect = section.getBoundingClientRect();
    const pRect = profilePic.getBoundingClientRect();

    // Centre de la photo de profil, relatif à la section
    const cx = pRect.left + pRect.width  / 2 - sRect.left;
    const cy = pRect.top  + pRect.height / 2 - sRect.top;

    orbitIconsData.forEach(({ icon, delay, label }) => {
      const pivot = document.createElement('div');
      pivot.className = 'orbit-pivot';
      pivot.style.top  = cy + 'px';
      pivot.style.left = cx + 'px';
      pivot.style.animationDelay = delay;

      const badge = document.createElement('div');
      badge.className = 'orbit-badge';
      badge.setAttribute('data-label', label);
      badge.title = label;
      badge.style.animationDelay = delay;
      badge.innerHTML = `<i class="fas ${icon}"></i>`;

      pivot.appendChild(badge);
      section.appendChild(pivot);
    });
  }

  // Lancer après le chargement complet (images, polices) pour que les positions soient justes
  window.addEventListener('load', () => {
    setTimeout(buildOrbitIcons, 400);
  });

  // Recalculer si la fenêtre est redimensionnée
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildOrbitIcons, 200);
  });

  // ─── A2 : FLÈCHE REBONDISSANTE dans le hero ──────────────────────────────
  const headerContent = document.querySelector('#header-content');
  if (headerContent) {
    const arrow = document.createElement('div');
    arrow.id = 'scroll-hint';
    arrow.innerHTML = '<i class="fas fa-chevron-down"></i>';
    headerContent.appendChild(arrow);

    // Disparaît au premier scroll
    const hideArrow = () => {
      arrow.classList.add('hidden');
      window.removeEventListener('scroll', hideArrow);
    };
    window.addEventListener('scroll', hideArrow, { passive: true });
  }

  // ─── A3 : STAGGER d'entrée sur les why-cards ─────────────────────────────
  const whySection = document.getElementById('pourquoi-moi');
  if (whySection) {
    const whyObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.why-card').forEach((card, i) => {
            setTimeout(() => card.classList.add('why-card-visible'), i * 120);
          });
          whyObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    whyObs.observe(whySection);
  }

  // ─── EFFET RIPPLE sur les boutons ────────────────────────────────────────
  document.querySelectorAll('.cta-button, .audio-control-btn, .btn-view-project, .filter-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top  = (e.clientY - rect.top)  + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // ─── PARTICULES flottantes dans le hero ──────────────────────────────────
  const heroBg = document.querySelector('#header-content') || document.querySelector('header.animated-section');
  if (heroBg) {
    const container = document.createElement('div');
    container.className = 'hero-particles';
    heroBg.style.position = 'relative';
    heroBg.appendChild(container);

    const colors = ['#00e5ff', '#00ffcc', 'rgba(0,229,255,0.5)'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('span');
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        bottom: ${Math.random() * 30}%;
        width: ${2 + Math.random() * 3}px;
        height: ${2 + Math.random() * 3}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration: ${5 + Math.random() * 8}s;
        animation-delay: ${Math.random() * 6}s;
        opacity: 0;
      `;
      container.appendChild(p);
    }
  }

  // ─── ANIMATION COMPTEURS (chiffres dans badges) ──────────────────────────
  function animateCounter(el, target, duration = 1200) {
    const start = performance.now();
    const startVal = 0;
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      el.textContent = current + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        const target = parseInt(entry.target.dataset.target, 10);
        animateCounter(entry.target, target);
      }
    });
  }, { threshold: 0.5 });

  // Trouver les éléments de type chiffre dans le header
  document.querySelectorAll('.count-badge').forEach(badge => {
    // Extraire le numéro du texte du badge
    const match = badge.textContent.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      const suffix = badge.textContent.replace(/^\d+/, '');
      badge.dataset.target = num;
      badge.dataset.suffix = suffix;
      badge.textContent = '0' + suffix;
      countObserver.observe(badge);
    }
  });

  // ─── TIMELINE LINE DRAW ──────────────────────────────────────────────────
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const timelineObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('anim-visible');
          timelineObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    timelineObs.observe(timeline);
  }

  // ─── SKILLS GRID observer ────────────────────────────────────────────────
  const skillsGrid = document.querySelector('.skills-grid');
  if (skillsGrid) {
    const skillsObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          skillsObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    skillsObs.observe(skillsGrid);
  }

  // ─── CURSOR MAGNÉTIQUE sur les boutons CTA ───────────────────────────────
  document.querySelectorAll('.cta-button').forEach(btn => {
    btn.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      this.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', function () {
      this.style.transform = '';
    });
  });

  // ─── TILT 3D sur les why-cards ───────────────────────────────────────────
  document.querySelectorAll('.why-card').forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      this.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', function () {
      this.style.transform = '';
      this.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', function () {
      this.style.transition = 'none';
    });
  });

  // ─── HOVER GLOW sur les skill items ──────────────────────────────────────
  document.querySelectorAll('.skill-item').forEach(item => {
    item.addEventListener('mouseenter', function () {
      this.style.boxShadow = '0 0 16px rgba(0, 229, 255, 0.25)';
    });
    item.addEventListener('mouseleave', function () {
      this.style.boxShadow = '';
    });
  });

  // ─── BADGE "NOUVEAU" ─────────────────────────────────────────────────────
  document.querySelectorAll('.new-badge, [class*="new"]').forEach(el => {
    if (el.textContent.toLowerCase().includes('nouveau') || el.classList.contains('new-badge')) {
      el.classList.add('new-badge-anim');
    }
  });

  // ─── SMOOTH REVEAL pour les certif + project cards ──────────────────────
  // Les cartes sont toujours visibles (pas d'opacity:0 initial), elles reçoivent
  // une animation CSS légère quand elles entrent dans le viewport.
  function revealCards(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.classList.contains('card-revealed')) {
          e.target.classList.add('card-revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0 });

    function observeAll() {
      grid.querySelectorAll('.card:not(.card-revealed)').forEach(c => obs.observe(c));
    }
    observeAll();
    new MutationObserver(observeAll).observe(grid, { childList: true });
  }

  revealCards('certifications-grid');
  revealCards('project-grid');

  // ─── CURSOR CUSTOM (optionnel, subtil) ───────────────────────────────────
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.style.cssText = `
    position: fixed; pointer-events: none; z-index: 99999;
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--primary-color, #00e5ff);
    transform: translate(-50%, -50%);
    transition: width 0.2s ease, height 0.2s ease, opacity 0.2s ease;
    mix-blend-mode: difference;
    opacity: 0;
  `;
  document.body.appendChild(cursor);

  const cursorRing = document.createElement('div');
  cursorRing.id = 'cursor-ring';
  cursorRing.style.cssText = `
    position: fixed; pointer-events: none; z-index: 99998;
    width: 30px; height: 30px; border-radius: 50%;
    border: 1.5px solid rgba(0, 229, 255, 0.4);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
    opacity: 0;
  `;
  document.body.appendChild(cursorRing);

  let cx = 0, cy = 0, rlx = 0, rly = 0;
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    cursor.style.opacity = '1';
    cursorRing.style.opacity = '1';
  });

  // Lag pour le ring
  function animRing() {
    rlx += (cx - rlx) * 0.12;
    rly += (cy - rly) * 0.12;
    cursorRing.style.left = rlx + 'px';
    cursorRing.style.top  = rly + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  // Agrandir le ring sur les éléments interactifs
  document.querySelectorAll('a, button, .card, .skill-item, .copyable').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.style.width  = '50px';
      cursorRing.style.height = '50px';
      cursorRing.style.borderColor = 'rgba(0, 229, 255, 0.6)';
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.style.width  = '30px';
      cursorRing.style.height = '30px';
      cursorRing.style.borderColor = 'rgba(0, 229, 255, 0.4)';
    });
  });

  // Masquer les curseurs sur mobile
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    cursorRing.style.display = 'none';
  }

});
