document.addEventListener('DOMContentLoaded', () => {

  // ─── UTILS ─────────────────────────────────────────────────────────────────
  function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  // ─── PRELOADER ──────────────────────────────────────────────────────────────
  window.addEventListener('load', () => {
    const el = document.getElementById('preloader');
    if (el) setTimeout(() => el.classList.add('hidden'), 300);
  });

  // ─── PROGRESS BAR ───────────────────────────────────────────────────────────
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  // ─── NAVBAR ─────────────────────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('nav-links');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // Scroll effect
  const handleNavScroll = () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Mobile menu
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        allNavLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-20% 0px -75% 0px' });
  sections.forEach(s => navObserver.observe(s));

  // ─── THEME TOGGLE ───────────────────────────────────────────────────────────
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    localStorage.setItem('theme', theme);
  };

  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ─── SCROLL ANIMATIONS ──────────────────────────────────────────────────────
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Stagger children
        e.target.querySelectorAll('.reveal-item').forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 100);
        });
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ─── SCROLL TO TOP ──────────────────────────────────────────────────────────
  const scrollTopBtn = document.getElementById('scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', debounce(() => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, 100), { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── SMOOTH SCROLL ──────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length <= 1) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── FAB ────────────────────────────────────────────────────────────────────
  const fabGroup = document.getElementById('fab-group');
  const fabToggle = document.getElementById('fab-toggle');
  if (fabToggle && fabGroup) {
    fabToggle.addEventListener('click', () => {
      const isOpen = fabGroup.classList.toggle('open');
      fabToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // ─── AUDIO PLAYER ───────────────────────────────────────────────────────────
  const audio = document.getElementById('cv-audio');
  const audioBtn = document.getElementById('audio-btn');
  if (audio && audioBtn) {
    const setPlaying = () => {
      audioBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
      audioBtn.classList.add('playing');
    };
    const setPaused = () => {
      audio.pause();
      audioBtn.innerHTML = '<i class="fas fa-headphones"></i> Intro Audio';
      audioBtn.classList.remove('playing');
    };

    audioBtn.addEventListener('click', () => {
      if (audio.paused) { audio.play().then(setPlaying).catch(setPaused); }
      else setPaused();
    });
    audio.addEventListener('ended', setPaused);
  }

  // ─── TYPING ANIMATION ───────────────────────────────────────────────────────
  const nameSpan = document.getElementById('typing-name');
  const nameCursor = document.querySelector('.cursor-name');
  const roleSpan = document.getElementById('typing-role');

  if (nameSpan && roleSpan) {
    const fullName = 'Yassine Dahbi';
    const roles = [
      'Technicien Biomédical',
      'Expert en Maintenance',
      'Passionné d\'Innovation'
    ];

    function typeName(cb) {
      let i = 0;
      const t = setInterval(() => {
        nameSpan.textContent = fullName.slice(0, ++i);
        if (i >= fullName.length) {
          clearInterval(t);
          setTimeout(() => {
            if (nameCursor) nameCursor.style.display = 'none';
            cb();
          }, 500);
        }
      }, 100);
    }

    function typeRoles() {
      let roleIdx = 0, charIdx = 0, deleting = false;
      function tick() {
        const role = roles[roleIdx];
        if (deleting) roleSpan.textContent = role.slice(0, --charIdx);
        else roleSpan.textContent = role.slice(0, ++charIdx);

        let speed = deleting ? 40 : 90;
        if (!deleting && charIdx === role.length) { speed = 2200; deleting = true; }
        else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; speed = 400; }
        setTimeout(tick, speed);
      }
      setTimeout(tick, 300);
    }

    setTimeout(() => typeName(typeRoles), 600);
  }

  // ─── COPY TO CLIPBOARD ──────────────────────────────────────────────────────
  const tooltip = document.getElementById('copy-tooltip');
  document.querySelectorAll('.copyable').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const text = el.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        if (tooltip) {
          tooltip.classList.add('visible');
          setTimeout(() => tooltip.classList.remove('visible'), 1800);
        }
      });
    });
  });

  // ─── CERTIFICATIONS DATA + RENDER ───────────────────────────────────────────
  const certifications = [
    // Getinge
    { title: "Ventilation : Guide de démarrage Servo-air (OUS, Anglais)", date: "06 mai 2025", organisme: "Getinge", image: "assets/certificates/respirateur-reanimation-certificate.webp", alt: "Certificat Servo-air", description: `<ul><li>✅ Principes de fonctionnement du respirateur Servo-air</li><li>✅ Montage et vérification avant utilisation (Pre-use check)</li><li>✅ Gestion des alarmes et dépannage de premier niveau</li><li>✅ Maintenance préventive et remplacement des consommables</li><li>✅ Calibration des capteurs de débit et d'O2</li></ul>`, link: "assets/certificates/respirateur-reanimation-certificate.webp", category: "resuscitation ventilation" },
    { title: "Anesthésie : Vue d'ensemble du système Flow-c (OUS, Anglais)", date: "19 mai 2025", organisme: "Getinge", image: "assets/certificates/respirateur-anesthesie-certificate.webp", alt: "Certificat Flow-c", description: `<ul><li>✅ Architecture du système d'anesthésie Flow-c</li><li>✅ Préparation et test automatique du système</li><li>✅ Gestion des gaz médicaux et vaporisateurs</li><li>✅ Maintenance du circuit patient et système respiratoire</li><li>✅ Diagnostic et résolution des codes d'erreur courants</li></ul>`, link: "assets/certificates/respirateur-anesthesie-certificate.webp", category: "anesthesia ventilation" },
    { title: "Ventilation : Modes de Ventilation Module 1 – Réglages et Courbes", date: "02 décembre 2025", organisme: "Getinge", image: "assets/certificates/Modes-of-Ventilation-Module-One.webp", alt: "Certificat Modes ventilation M1", description: `<ul><li>✅ Compréhension des courbes de pression, débit et volume</li><li>✅ Réglages de base : PEEP, Fréquence, Volume courant</li><li>✅ Modes contrôlés vs assistés</li><li>✅ Interprétation des boucles pression-volume</li><li>✅ Synchronisation patient-ventilateur</li></ul>`, link: "assets/certificates/Modes%20of%20Ventilation%20Module%20One.pdf", category: "resuscitation ventilation" },
    { title: "Ventilation : Prise en main du respirateur Servo-u", date: "20 décembre 2025", organisme: "Getinge", image: "assets/certificates/Ventilation eLearning Servo-u.webp", alt: "Certificat Servo-u", description: `<ul><li>✅ Interface utilisateur et configuration des écrans</li><li>✅ Tests fonctionnels étendus et calibration</li><li>✅ Maintenance de la cassette expiratoire et inspiratoire</li><li>✅ Outils de diagnostic avancés et historique des pannes</li><li>✅ Mise à jour logicielle et gestion des options</li></ul>`, link: "assets/certificates/Ventilation eLearning Servo-u.pdf", category: "resuscitation ventilation" },
    { title: "Anesthésie : Vue d'ensemble du système Flow-i (OUS, Anglais)", date: "02 janvier 2026", organisme: "Getinge", image: "assets/certificates/Anesthesia eLearning Flow-i System Overview (OUS, English).webp", alt: "Certificat Flow-i", description: `<ul><li>✅ Présentation complète du système Flow-i</li><li>✅ Configuration et paramétrage des modes ventilatoires</li><li>✅ Gestion des alarmes et sécurités du système</li><li>✅ Maintenance préventive et diagnostics de pannes</li><li>✅ Utilisation du circuit respiratoire et des vaporisateurs</li></ul>`, link: "assets/certificates/Anesthesia eLearning Flow-i System Overview (OUS, English).webp", category: "anesthesia ventilation" },
    { title: "Ventilation : Nettoyage Servo-u/n/air", date: "02 janvier 2026", organisme: "Getinge", image: "assets/certificates/Servo-u n air cleaning.webp", alt: "Certificat nettoyage Servo", description: `<ul><li>✅ Démontage sécurisé des canaux inspiratoires et expiratoires</li><li>✅ Protocoles de désinfection et stérilisation (Autoclave)</li><li>✅ Nettoyage des capteurs sans endommagement</li><li>✅ Remontage et tests d'étanchéité</li><li>✅ Prévention des infections nosocomiales</li></ul>`, link: "assets/certificates/Servo-u n air cleaning.pdf", category: "resuscitation ventilation" },
    { title: "Ventilation : Modes de Ventilation Module 2 – Modes Contrôlés", date: "19 janvier 2026", organisme: "Getinge", image: "assets/certificates/Modes of Ventilation Module Two.webp", alt: "Certificat Modes ventilation M2", description: `<ul><li>✅ Modes contrôlés en Pression (PC) et Volume (VC)</li><li>✅ Réglages avancés : I:E ratio, temps de pause, trigger</li><li>✅ Ventilation assistée contrôlée intermittente (VACI)</li><li>✅ Gestion des patients sédatés vs actifs</li><li>✅ Optimisation de l'oxygénation et ventilation minute</li></ul>`, link: "assets/certificates/Modes of Ventilation Module Two.pdf", category: "resuscitation ventilation", isNew: true },
    { title: "Tables d'opération : Formation Utilisateur Maquet Yuno", date: "20 janvier 2026", organisme: "Getinge", image: "assets/certificates/Operating tables eLearning User Training Maquet Yuno (OUS, English).webp", alt: "Certificat Maquet Yuno", description: `<ul><li>✅ Fonctionnalités et mouvements de la table Maquet Yuno</li><li>✅ Positionnement patient pour diverses chirurgies</li><li>✅ Utilisation de la télécommande et commandes de secours</li><li>✅ Maintenance préventive des vérins et batteries</li><li>✅ Nettoyage et désinfection des matelas et surfaces</li></ul>`, link: "assets/certificates/Operating tables eLearning User Training Maquet Yuno (OUS, English).pdf", category: "operating-tables", isNew: true },
    { title: "Anesthésie : Modes de Ventilation Famille Flow Module 1", date: "20 janvier 2026", organisme: "Getinge", image: "assets/certificates/Modes of Ventilation Flow Family Module 1, waveforms & settings.webp", alt: "Certificat Flow M1", description: `<ul><li>✅ Spécificités de la ventilation en anesthésie</li><li>✅ Analyse des courbes de capnographie (EtCO2)</li><li>✅ Réglages des volumes et pressions en circuit fermé</li><li>✅ Compliance et résistance du circuit respiratoire</li><li>✅ Monitorage des gaz anesthésiques</li></ul>`, link: "assets/certificates/Modes of Ventilation Flow Family Module 1, waveforms & settings.pdf", category: "resuscitation ventilation anesthesia", isNew: true },
    { title: "Anesthésie : Modes de Ventilation Famille Flow Module 2", date: "20 janvier 2026", organisme: "Getinge", image: "assets/certificates/Modes of Ventilation Flow Family Module 2, controlled modes.webp", alt: "Certificat Flow M2", description: `<ul><li>✅ Ventilation Contrôlée en Volume (VCV) en anesthésie</li><li>✅ Ventilation Contrôlée en Pression (PCV) et PCV-VG</li><li>✅ Gestion du recrutement alvéolaire per-opératoire</li><li>✅ Modes de soutien pression (PSV) pour le réveil</li><li>✅ Sécurité et alarmes de ventilation</li></ul>`, link: "assets/certificates/Modes of Ventilation Flow Family Module 2, controlled modes.pdf", category: "resuscitation ventilation anesthesia", isNew: true },
    // Siemens Healthineers
    { title: "Vue d'ensemble du système ACUSON Maple™", date: "28 juin 2025", organisme: "Siemens Healthineers", image: "assets/certificates/acuson-maple-certificate.webp", alt: "Certificat ACUSON Maple", description: `<ul><li>✅ Architecture matérielle et logicielle du système ACUSON Maple</li><li>✅ Configuration des sondes et optimisation d'image</li><li>✅ Modes d'imagerie : 2D, Doppler, M-Mode</li><li>✅ Maintenance préventive et tests de performance</li><li>✅ Gestion des données patient et connectivité DICOM</li></ul>`, link: "assets/certificates/acuson-maple-certificate.webp", category: "ultrasound" },
    { title: "MAMMOMAT B.brilliant - Présentation du système", date: "12 octobre 2025", organisme: "Siemens Healthineers", image: "assets/certificates/mammomat-b-brilliant-certificate.webp", alt: "Certificat MAMMOMAT", description: `<ul><li>✅ Système de mammographie numérique et tomosynthèse</li><li>✅ Contrôle qualité : fantômes, doses, résolution</li><li>✅ Compression, positionnement et protocoles d'acquisition</li><li>✅ Maintenance préventive et étalonnage du tube RX</li><li>✅ Radioprotection et normes de sécurité</li></ul>`, link: "assets/certificates/mammomat-b-brilliant-certificate.webp", category: "mammography" },
    { title: "Essentiels CT - Formation en ligne sur les bases du scanner", date: "26 octobre 2025", organisme: "Siemens Healthineers", image: "assets/certificates/UserCertificate_CTBasics.webp", alt: "Certificat CT Basics", description: `<ul><li>✅ Principes physiques du scanner : rayons X, détecteurs, reconstruction</li><li>✅ Paramètres d'acquisition : kV, mAs, pitch, collimation</li><li>✅ Qualité d'image et artefacts courants</li><li>✅ Contrôle qualité quotidien et maintenance préventive</li><li>✅ Radioprotection et optimisation des doses</li></ul>`, link: "assets/certificates/UserCertificate_CTBasics.pdf", category: "ct-scan" },
    { title: "Principes fondamentaux de l'échographie : Introduction physique", date: "07 décembre 2025", organisme: "Siemens Healthineers", image: "assets/certificates/UserCertificate_UltrasoundFundamentalsAPhysicsPrimer.webp", alt: "Certificat Échographie", description: `<ul><li>✅ Principes physiques des ultrasons et interaction avec les tissus</li><li>✅ Fonctionnement des sondes et transducteurs piézoélectriques</li><li>✅ Modes d'imagerie : B-Mode, M-Mode et Doppler</li><li>✅ Optimisation de l'image et résolution spatiale/temporelle</li><li>✅ Artefacts d'image courants et leur identification</li></ul>`, link: "assets/certificates/UserCertificate_UltrasoundFundamentalsAPhysicsPrimer.pdf", category: "ultrasound" },
    { title: "Analyseur Série CA-600 - Vue d'ensemble du système", date: "02 janvier 2026", organisme: "Siemens Healthineers", image: "assets/certificates/UserCertificate_SysmexCA600SeriesSystemOverview.webp", alt: "Certificat CA-600", description: `<ul><li>✅ Architecture complète du système d'hémostase CA-600</li><li>✅ Navigation et configuration logicielle avancée</li><li>✅ Gestion des réactifs, contrôles et maintenance utilisateur</li><li>✅ Optimisation des flux de travail et gestion des erreurs</li><li>✅ Calibration et procédures de contrôle qualité</li></ul>`, link: "assets/certificates/UserCertificate_SysmexCA600SeriesSystemOverview.webp", category: "laboratory" },
    { title: "Physique IRM - Génération et acquisition du signal", date: "07 janvier 2026", organisme: "Siemens Healthineers", image: "assets/certificates/Physique RM - Génération et acquisition de la formation en ligne sur le signal RM.webp", alt: "Certificat IRM", description: `<ul><li>✅ Principes de la résonance magnétique nucléaire (RMN)</li><li>✅ Génération du signal RM : Excitation et Relaxation T1/T2</li><li>✅ Séquences d'impulsions fondamentales (Spin Echo, Gradient Echo)</li><li>✅ Encodage spatial et formation de l'image (Espace K)</li><li>✅ Sécurité en environnement IRM et champs magnétiques</li></ul>`, link: "assets/certificates/Physique RM - Génération et acquisition de la formation en ligne sur le signal RM.pdf", category: "mri" },
    { title: "Physique de base pour le radiographe", date: "08 janvier 2026", organisme: "Siemens Healthineers", image: "assets/certificates/UserCertificate_BasicPhysicsfortheRadiographer.webp", alt: "Certificat physique radiologie", description: `<ul><li>✅ Production et propriétés des rayons X</li><li>✅ Interaction rayonnement-matière et atténuation</li><li>✅ Qualité de l'image : Contraste, Résolution, Bruit</li><li>✅ Facteurs géométriques et flou d'image</li><li>✅ Principes de radioprotection et dosimétrie</li></ul>`, link: "assets/certificates/UserCertificate_BasicPhysicsfortheRadiographer.pdf", category: "radiology" },
    { title: "Radiographie : Passé et Présent (Fluoroscopie)", date: "09 janvier 2026", organisme: "Siemens Healthineers", image: "assets/certificates/UserCertificate_FluoroscopyPastandPresentOUS.webp", alt: "Certificat Fluoroscopie", description: `<ul><li>✅ Évolution historique des technologies de fluoroscopie</li><li>✅ Fonctionnement des amplificateurs de brillance d'image (I.I.)</li><li>✅ Transition vers les détecteurs plans dynamiques (Flat Panel)</li><li>✅ Avantages cliniques et technologiques des systèmes modernes</li><li>✅ Optimisation de la dose en radioscopie interventionnelle</li></ul>`, link: "assets/certificates/UserCertificate_FluoroscopyPastandPresentOUS.pdf", category: "fluoroscopy" },
    { title: "Cios Spin - Vue d'ensemble du système (Arceau 3D)", date: "10 janvier 2026", organisme: "Siemens Healthineers", image: "assets/certificates/Cios Spin Hardware Overview Online Training.webp", alt: "Certificat Cios Spin", description: `<ul><li>✅ Architecture complète du système Cios Spin (Arceau 3D mobile)</li><li>✅ Systèmes de sécurité, anticollision et freins électromagnétiques</li><li>✅ Positionnement isocentrique et manœuvrabilité</li><li>✅ Interface utilisateur tactile et gestion des protocoles</li><li>✅ Intégration en bloc opératoire et navigation chirurgicale</li></ul>`, link: "assets/certificates/Cios Spin Hardware Overview Online Training.pdf", category: "fluoroscopy" },
    // Présentation du système ESG-400
    { title: "Présentation du système ESG-400", date: "18 avril 2025", organisme: "Olympus Continuum", image: "assets/certificates/esg-400-certificate.webp", alt: "Certificat ESG-400", description: `<ul><li>✅ Architecture du générateur d'électrochirurgie ESG-400</li><li>✅ Modes de coupe et coagulation multifonctionnels</li><li>✅ Intégration avec les systèmes endoscopiques Olympus</li><li>✅ Paramétrage et sécurité du système</li><li>✅ Maintenance et dépannage de base</li></ul>`, link: "assets/certificates/esg-400-certificate.webp", category: "electrosurgery testing" },
    // AREP
    { title: "Cours Essentiels HD (Hémodialyse)", date: "03 novembre 2025", organisme: "AREP", image: "assets/certificates/HD-Essentials-CE_Hemodialysis-Essentials-EMEA-Course.webp", alt: "Certificat Hémodialyse", description: `<ul><li>✅ Principes physiologiques de l'hémodialyse et fonction rénale</li><li>✅ Fonctionnement du dialyseur et membranes semi-perméables</li><li>✅ Traitement de l'eau pour dialyse et préparation du dialysat</li><li>✅ Types d'accès vasculaires (fistule, cathéter) et gestion</li><li>✅ Gestion des complications per-dialytiques et sécurité patient</li></ul>`, link: "assets/certificates/HD%20Essentials%20CE_Hemodialysis%20Essentials%20EMEA%20Course.pdf", category: "dialysis" },
    // Olympus
    { title: "E-learning EVIS EXERA III (Endoscopie)", date: "29 juin 2025", organisme: "Olympus Continuum", image: "assets/certificates/evis-exera-iii-certificate.webp", alt: "Certificat EVIS EXERA III", description: `<ul><li>✅ Architecture complète de la colonne vidéo EVIS EXERA III</li><li>✅ Source de lumière LED/Xénon et réglages d'illumination</li><li>✅ Processeur vidéo CV-190 et technologies NBI/Dual Focus</li><li>✅ Maintenance et manipulation correcte des endoscopes</li><li>✅ Protocoles de nettoyage, désinfection et stérilisation</li></ul>`, link: "assets/certificates/evis-exera-iii-certificate.webp", category: "endoscopy" },
    // Erbe Academy
    { title: "Électrochirurgie - Principes fonctionnels et utilisation sûre", date: "01 novembre 2025", organisme: "Erbe Academy", image: "assets/certificates/Electrosurgery - Functional principles and safe use DAHBI Certificate.webp", alt: "Certificat Électrochirurgie", description: `<ul><li>✅ Physique de l'électrochirurgie (HF) : Coupe vs Coagulation</li><li>✅ Techniques monopolaires vs bipolaires et applications cliniques</li><li>✅ Effets tissulaires et réglages de puissance optimaux</li><li>✅ Sécurité patient : Prévention des brûlures et placement de l'électrode neutre</li><li>✅ Gestion des interférences et sécurité au bloc opératoire</li></ul>`, link: "assets/certificates/Electrosurgery - Functional principles and safe use DAHBI Certificate.pdf", category: "electrosurgery" },
    // Sysmex
    { title: "Formation de base en ligne XN-L (XN-550)", date: "10 novembre 2025", organisme: "Sysmex", image: "assets/certificates/confirmation_xn-550_basic_online_training.webp", alt: "Certificat XN-550", description: `<ul><li>✅ Présentation du système XN-L (XN-550) et ses composants</li><li>✅ Procédures de démarrage, arrêt et maintenance quotidienne</li><li>✅ Gestion des réactifs et consommables Sysmex</li><li>✅ Interprétation des données : CBC, DIFF, RET</li><li>✅ Contrôle qualité et gestion des erreurs courantes</li></ul>`, link: "assets/certificates/confirmation_xn-550_basic_online_training.pdf", category: "laboratory" },
    // Concepts de pacing
    { title: "Vue d'ensemble des concepts de base en stimulation cardiaque", date: "16 décembre 2025", organisme: "Formation spécialisée", image: "assets/certificates/Basic-Pacing-Concepts-Overview.webp", alt: "Certificat pacing cardiaque", description: `<ul><li>✅ Principes fondamentaux de la stimulation cardiaque (pacing)</li><li>✅ Anatomie du système de conduction cardiaque</li><li>✅ Types de stimulateurs cardiaques et modes de stimulation</li><li>✅ Paramètres de programmation et gestion des alarmes</li><li>✅ Sécurité et contre-mesures en environnement biomédical</li></ul>`, link: "assets/certificates/Basic Pacing Concepts Overview.pdf", category: "cardiology" },
    // Intro ESA-620
    { title: "Introduction au testeur de sécurité ESA620", date: "20 décembre 2025", organisme: "Fluke Biomedical", image: "assets/certificates/Intro to Using the ESA620_Advantage Training Certificate.webp", alt: "Certificat ESA620", description: `<ul><li>✅ Présentation du testeur de sécurité électrique ESA620</li><li>✅ Réalisation des tests de courant de fuite et résistance de terre</li><li>✅ Conformité aux normes CEI 60601 et IEC 62353</li><li>✅ Génération et interprétation des rapports de test</li><li>✅ Bonnes pratiques de sécurité électrique des DM</li></ul>`, link: "assets/certificates/Intro to Using the ESA620_Advantage Training Certificate.pdf", category: "testing" },
    // Medical Device QA
    { title: "Assurance Qualité des Dispositifs Médicaux – Moniteurs Patients", date: "21 décembre 2025", organisme: "Fluke Biomedical", image: "assets/certificates/Medical Device Quality Assurance-Patient Monitors.webp", alt: "Certificat QA Moniteurs", description: `<ul><li>✅ Protocoles de test de performance pour moniteurs patients</li><li>✅ Tests des paramètres : ECG, SpO2, NIBP, Température</li><li>✅ Normes IEC 60601 et exigences réglementaires</li><li>✅ Utilisation des équipements de test Fluke Biomedical</li><li>✅ Documentation et traçabilité des maintenances préventives</li></ul>`, link: "assets/certificates/Medical Device Quality Assurance-Patient Monitors.pdf", category: "testing" },
  ];

  function renderCertifications(list) {
    const grid = document.getElementById('certifications-grid');
    if (!grid) return;
    grid.innerHTML = '';

    list.forEach(cert => {
      const card = document.createElement('article');
      card.className = 'cert-card' + (cert.isNew ? ' is-new' : '');
      card.dataset.category = cert.category;
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="cert-img">
          <img src="${cert.image}" alt="${cert.alt}" loading="lazy">
        </div>
        <div class="cert-info">
          <div class="cert-header">
            <span class="cert-org">${cert.organisme}</span>
            ${cert.isNew ? '<span class="cert-new-badge">Nouveau</span>' : ''}
          </div>
          <h3>${cert.title}</h3>
          <span class="cert-date"><i class="fas fa-calendar-alt"></i> ${cert.date}</span>
        </div>
      `;
      card.addEventListener('click', () => openCertModal(cert));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openCertModal(cert); });
      grid.appendChild(card);
    });

    updateCertCount();
  }

  function openCertModal(cert) {
    const modal = document.getElementById('certification-modal');
    if (!modal) return;
    document.getElementById('cert-modal-title').textContent = cert.title;
    const img = document.getElementById('cert-modal-img');
    img.src = cert.image;
    img.alt = cert.alt;
    document.getElementById('cert-modal-desc').innerHTML = cert.description;
    modal.showModal();
  }

  renderCertifications(certifications);

  function updateCertCount() {
    const badge = document.getElementById('certification-count-badge');
    if (!badge) return;
    const total = document.querySelectorAll('#certifications-grid .cert-card:not(.hidden)').length;
    badge.textContent = `${total} Certification${total > 1 ? 's' : ''}`;
  }

  // ─── CERTIFICATION FILTERS ───────────────────────────────────────────────────
  const certSearch = document.getElementById('certification-search');
  const clearCertSearch = document.getElementById('clear-cert-search');
  const certFilterContainer = document.querySelector('.cert-filters');

  function filterCertCards() {
    const search = certSearch ? certSearch.value.toLowerCase().trim() : '';
    const pills = certFilterContainer ? certFilterContainer.querySelectorAll('.pill') : [];
    let activeFilter = 'all';
    pills.forEach(p => { if (p.classList.contains('active')) activeFilter = p.dataset.filter; });

    document.querySelectorAll('#certifications-grid .cert-card').forEach(card => {
      const matchFilter = activeFilter === 'all' || card.dataset.category.includes(activeFilter);
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const org = card.querySelector('.cert-org')?.textContent.toLowerCase() || '';
      const matchSearch = !search || title.includes(search) || org.includes(search);
      card.classList.toggle('hidden', !(matchFilter && matchSearch));
    });
    updateCertCount();

    if (clearCertSearch) clearCertSearch.classList.toggle('hidden', !search);
  }

  if (certFilterContainer) {
    certFilterContainer.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        certFilterContainer.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterCertCards();
      });
    });
  }

  if (certSearch) certSearch.addEventListener('input', debounce(filterCertCards, 250));
  if (clearCertSearch) clearCertSearch.addEventListener('click', () => {
    certSearch.value = '';
    filterCertCards();
    certSearch.focus();
  });

  // ─── PROJECT FILTERS ─────────────────────────────────────────────────────────
  const projectSearch = document.getElementById('project-search');
  const clearProjectSearch = document.getElementById('clear-project-search');
  const projectFilters = document.querySelector('#projects .filter-pills');

  function updateProjectCount() {
    const badge = document.getElementById('project-count-badge');
    if (!badge) return;
    const visible = document.querySelectorAll('#project-grid .project-card:not(.hidden)').length;
    badge.textContent = `${visible} Réalisation${visible > 1 ? 's' : ''} Technique${visible > 1 ? 's' : ''}`;
  }

  function filterProjects() {
    const search = projectSearch ? projectSearch.value.toLowerCase().trim() : '';
    const pills = projectFilters ? projectFilters.querySelectorAll('.pill') : [];
    let activeFilter = 'all';
    pills.forEach(p => { if (p.classList.contains('active')) activeFilter = p.dataset.filter; });

    document.querySelectorAll('#project-grid .project-card').forEach(card => {
      const matchFilter = activeFilter === 'all' || card.dataset.category?.includes(activeFilter);
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
      const tags = Array.from(card.querySelectorAll('.tech-tags span')).map(s => s.textContent.toLowerCase()).join(' ');
      const matchSearch = !search || title.includes(search) || desc.includes(search) || tags.includes(search);
      card.classList.toggle('hidden', !(matchFilter && matchSearch));
    });
    updateProjectCount();

    if (clearProjectSearch) clearProjectSearch.classList.toggle('hidden', !search);
  }

  if (projectFilters) {
    projectFilters.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        projectFilters.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterProjects();
      });
    });
  }
  if (projectSearch) projectSearch.addEventListener('input', debounce(filterProjects, 250));
  if (clearProjectSearch) clearProjectSearch.addEventListener('click', () => {
    projectSearch.value = '';
    filterProjects();
    projectSearch.focus();
  });

  updateProjectCount();

  // ─── MODALS ──────────────────────────────────────────────────────────────────
  // Open modals via data-modal-target
  document.querySelectorAll('[data-modal-target]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const modal = document.getElementById(btn.dataset.modalTarget);
      if (modal) modal.showModal();
    });
  });

  // Open PDF projects via data-project
  const pdfMap = {
    'testeur-securite': 'assets/projects/testeur-securite-electrique.pdf',
    'maint-ventilateur-anesth': 'assets/projects/maintenance-preventive-anesthesie.pdf',
    'guide-calibration': 'assets/projects/guide-calibration-pousse-seringue.pdf',
    'nettoyage-cassette': 'assets/projects/protocole-nettoyage-cassette.pdf',
    'maint-ventilateur-rea': 'assets/projects/maintenance-preventive-reanimation.pdf',
    'maint-moniteur': 'assets/projects/maintenance-preventive-moniteur.pdf',
    'procedure-maintenance': 'assets/projects/PROC%C3%89DURE%20DE%20MAINTENANCE%20PR%C3%89VENTIVE.pdf',
    'moniteur-ecg': null,
    'systeme-perfusion': null,
  };

  document.querySelectorAll('[data-project]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.dataset.project;
      const pdf = pdfMap[id];
      if (pdf) window.open(pdf, '_blank');
      else {
        const img = btn.closest('.project-card')?.querySelector('img');
        if (img) window.open(img.src, '_blank');
      }
    });
  });

  // Close modals
  document.querySelectorAll('.modal').forEach(modal => {
    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.close());
    modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') modal.close(); });
  });

  // ─── TOAST ───────────────────────────────────────────────────────────────────
  const toast = document.getElementById('toast');
  const closeToast = document.getElementById('close-toast');

  if (toast && !sessionStorage.getItem('toast-dismissed')) {
    setTimeout(() => toast.classList.add('visible'), 4000);
  }
  if (closeToast) {
    closeToast.addEventListener('click', () => {
      toast.classList.remove('visible');
      sessionStorage.setItem('toast-dismissed', '1');
    });
  }
  toast?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toast.classList.remove('visible');
      sessionStorage.setItem('toast-dismissed', '1');
    });
  });

});
