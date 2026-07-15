document.addEventListener('DOMContentLoaded', () => {

    /**
     * Debounces a function, so it only runs after a certain delay.
     * Useful for performance optimization on frequently triggered events like scroll or resize.
     * @param {function} func - The function to debounce.
     * @param {number} delay - The delay in milliseconds.
     * @returns {function} The debounced function.
     */
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    /**
     * Initializes the preloader functionality.
     */
    function setupPreloader() {
        document.getElementById('preloader')?.classList.add('hidden');
        document.body.classList.add('loaded');
    }

    /**
     * Handles mobile navigation toggle, header style on scroll, and smooth scrolling.
     */
    function setupNavigation() {
        const menuToggle = document.getElementById('menu-toggle');
        const mainNav = document.getElementById('main-nav');
        const header = document.querySelector('.site-header');
        const audio = document.getElementById('cv-audio');
        const playPauseBtn = document.getElementById('play-pause-btn');

        // Mobile menu toggle
        if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
                const isOpen = mainNav.classList.toggle('open');
                document.body.classList.toggle('no-scroll', isOpen);
                // Monter le z-index du header quand le menu est ouvert
                if (header) header.classList.toggle('menu-open', isOpen);

                // 1. Gérer la visibilité du bouton flottant (FAB)
                const fabContainer = document.querySelector('.fab-container');
                if (fabContainer) {
                    if (isOpen) {
                        fabContainer.classList.add('hidden');
                    } else {
                        fabContainer.classList.remove('hidden');
                    }
                }

                // 2. Changer l'icône du bouton (☰ devient X)
                if (isOpen) {
                    menuToggle.innerHTML = '&times;'; // Symbole de croix
                    menuToggle.setAttribute('aria-label', 'Fermer le menu');
                    menuToggle.style.fontSize = '2.5rem'; // Ajustement taille croix
                } else {
                    menuToggle.innerHTML = '&#9776;'; // Symbole Hamburger
                    menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
                    menuToggle.style.fontSize = '1.8rem'; // Retour taille normale
                }
            });
        }

        // Smooth scrolling for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');

                // Ignore links that don't point to a valid ID on the page
                if (!targetId || targetId === '#' || targetId.length <= 1) {
                    e.preventDefault();
                    return;
                }

                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();

                    // --- CORRECTION ---
                    // Le bloc de code qui mettait l'audio en pause a été supprimé d'ici.
                    // L'audio continuera maintenant de jouer lors de la navigation entre les sections.

                    // Close mobile menu if open
                    if (mainNav && mainNav.classList.contains('open')) {
                        mainNav.classList.remove('open');
                        document.body.classList.remove('no-scroll');
                    }

                    const headerOffset = header ? header.offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });
        });

    }

    /**
     * Sets up an observer to highlight the active navigation link based on scroll position.
     */
    function setupNavObserver() {
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('#main-nav a');

        if (sections.length === 0 || navLinks.length === 0) return;

        const trackedSections = new Set(); // n'envoie l'événement qu'une fois par section

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                    // Google Analytics : suit le parcours du visiteur section par section
                    if (!trackedSections.has(id)) {
                        trackedSections.add(id);
                        const heading = entry.target.querySelector('h2');
                        const sectionName = (heading && heading.textContent.trim()) || id;
                        if (typeof gtag === 'function') {
                            gtag('event', 'view_section', {
                                'event_category': 'Navigation',
                                'event_label': sectionName,
                                'section_name': sectionName
                            });
                        }
                    }
                }
            });
        }, {
            rootMargin: '-20% 0px -80% 0px',
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));
    }


    /**
     * Sets up the theme toggle functionality (light/dark mode).
     */
    function setupThemeToggle() {
        const toggleSwitch = document.querySelector('#switch');
        if (!toggleSwitch) return;

        // 1. Set initial state from localStorage
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }

        // 2. Add event listener for changes
        toggleSwitch.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    /**
     * Sets up scroll-triggered animations.
     */
    function setupSectionAnimations() {
        const animatedSections = document.querySelectorAll('.animated-section, .certifications-grid, .project-grid, .timeline-item');
        if (animatedSections.length === 0) return;

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -150px 0px'
        });
        animatedSections.forEach(section => sectionObserver.observe(section));
    }

    /**
     * Sets up copy-to-clipboard functionality.
     */
    function setupClipboardCopy() {
        const copyables = document.querySelectorAll('.copyable');
        const tooltip = document.getElementById('copy-tooltip');
        if (copyables.length === 0 || !tooltip) return;

        copyables.forEach(el => {
            el.addEventListener('click', () => {
                navigator.clipboard.writeText(el.innerText).then(() => {
                    tooltip.classList.add('visible');
                    setTimeout(() => tooltip.classList.remove('visible'), 1500);
                });
            });
        });
    }

    /**
     * Sets up the scroll-to-top button functionality.
     */
    function setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        if (!scrollToTopBtn) return;

        window.addEventListener('scroll', debounce(() => {
            scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
        }, 100));

        const goTop = (e) => {
            if (e) e.preventDefault();
            if (new URLSearchParams(location.search).get('diag') === '1') {
                alert('tap reçu, y=' + window.scrollY);
            }
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
            catch (_) { window.scrollTo(0, 0); }
            // Filet de sécurité si le smooth scroll est ignoré par le navigateur
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };
        scrollToTopBtn.addEventListener('click', goTop);
        scrollToTopBtn.addEventListener('touchend', goTop, { passive: false });
    }

    /**
     * Initializes the VanillaTilt.js effect on the profile picture.
     */
    function setupVanillaTilt() {
        const profilePic = document.querySelector('.profile-pic');
        if (profilePic && typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(profilePic, {
                max: 15,
                speed: 400,
                glare: true,
                "max-glare": 0.2
            });
        }

        const projectCards = document.querySelectorAll('.project-card');
        if (projectCards.length > 0 && typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(projectCards, {
                max: 10,
                speed: 400,
                glare: true,
                "max-glare": 0.1,
                perspective: 1000,
                scale: 1.02
            });
        }
    }

    /**
     * Sets up the audio player for the CV intro.
     * Tries to autoplay, and provides manual controls as a fallback.
     */
    function setupAudioPlayer() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const audio = document.getElementById('cv-audio');

        if (!playPauseBtn || !audio) return;

        // Fonction pour mettre à jour l'état visuel en "lecture"
        const updateToPlayingState = () => {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            playPauseBtn.classList.add('playing');
        };

        // Fonction pour mettre à jour l'état visuel en "pause"
        const updateToPausedState = () => {
            audio.pause(); // S'assure que l'audio est bien en pause
            playPauseBtn.innerHTML = '<i class="fas fa-volume-up"></i> Intro Audio';
            playPauseBtn.classList.remove('playing');
        };

        // --- TENTATIVE DE LECTURE AUTOMATIQUE ---
        // La méthode .play() renvoie une "promesse"
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // La lecture automatique a fonctionné !
                updateToPlayingState();
            }).catch(error => {
                // La lecture automatique a été bloquée par le navigateur.
                // C'est le comportement attendu. L'utilisateur devra cliquer.
                console.log("La lecture automatique a été bloquée. L'utilisateur doit interagir avec la page.");
                updateToPausedState(); // S'assure que le bouton affiche "Play"
            });
        }
        // --- FIN DE LA TENTATIVE ---

        // Le listener sur le clic est conservé pour le contrôle manuel
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                updateToPlayingState();
            } else {
                updateToPausedState();
            }
        });

        // Réinitialise le bouton quand l'audio est terminé
        audio.addEventListener('ended', updateToPausedState);
    }


    /**
     * Sets up the typing animation: first types the name, then loops through roles.
     */
    function setupTypingAnimation() {
        const nameSpan = document.querySelector('.typing-name');
        const nameCursor = document.querySelector('.typing-name-cursor');
        const roleSpan = document.querySelector('.typing-role');
        if (!nameSpan || !roleSpan) return;

        const name = "Yassine Dahbi";
        const roles = [
            "Technicien Biomédical",
            "Expert en Maintenance",
            "Passionné par l'Innovation"
        ];

        // --- Step 1: Type the name ---
        function typeName(callback) {
            let i = 0;
            function type() {
                if (i < name.length) {
                    nameSpan.textContent = name.substring(0, i + 1);
                    i++;
                    setTimeout(type, 120);
                } else {
                    // Name fully typed — hide name cursor, start roles after a pause
                    setTimeout(() => {
                        if (nameCursor) nameCursor.style.display = 'none';
                        callback();
                    }, 600);
                }
            }
            setTimeout(type, 400); // Initial delay
        }

        // --- Step 2: Loop through roles ---
        function startRoles() {
            let roleIndex = 0;
            let charIndex = 0;
            let isDeleting = false;

            function typeRole() {
                const currentRole = roles[roleIndex];

                if (isDeleting) {
                    roleSpan.textContent = currentRole.substring(0, charIndex - 1);
                    charIndex--;
                } else {
                    roleSpan.textContent = currentRole.substring(0, charIndex + 1);
                    charIndex++;
                }

                let speed = isDeleting ? 50 : 100;

                if (!isDeleting && charIndex === currentRole.length) {
                    speed = 2000; // Pause before erasing
                    isDeleting = true;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    speed = 500; // Pause before next role
                }

                setTimeout(typeRole, speed);
            }

            setTimeout(typeRole, 300);
        }

        typeName(startRoles);
    }

    /**
     * Sets up a parallax effect for the profile picture.
     */
    function setupProfilePicParallax() {
        const profilePicContainer = document.querySelector('.profile-pic-container');
        if (!profilePicContainer) return;

        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            const translateY = scrollPosition * 0.1;
            profilePicContainer.style.transform = `translateY(${translateY}px)`;
        });
    }

    function setupFiltersAndModals() {
        const filterContainers = document.querySelectorAll('.project-filters'); // Peut inclure les filtres de certification aussi

        filterContainers.forEach(container => {
            const filterBtns = container.querySelectorAll('.filter-btn');
            const targetGridId = container.nextElementSibling?.id; // Assumes grid is the next sibling
            if (!targetGridId) return;

            const targetCards = document.querySelectorAll(`#${targetGridId} .card`);

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filter = btn.dataset.filter;

                    targetCards.forEach(card => {
                        const shouldShow = (filter === 'all' || card.dataset.category?.includes(filter));
                        if (shouldShow) {
                            card.classList.remove('hidden');
                            card.style.display = 'block';
                        } else {
                            card.classList.add('hidden');
                            setTimeout(() => {
                                if (card.classList.contains('hidden')) {
                                    card.style.display = 'none';
                                    updateGridCounter(targetGridId);
                                }
                            }, 400); // Match CSS transition duration
                        }
                    });
                    updateGridCounter(targetGridId);
                });
            });
        });

        function updateGridCounter(gridId) {
            if (gridId === 'project-grid') {
                const badge = document.getElementById('project-count-badge');
                if (badge) {
                    const visible = Array.from(document.querySelectorAll(`#${gridId} .card`)).filter(c => c.style.display !== 'none').length;
                    badge.textContent = `${visible} Réalisation${visible > 1 ? 's' : ''} Technique${visible > 1 ? 's' : ''}`;
                }
            } else if (gridId === 'certifications-grid') {
                const badge = document.getElementById('certification-count-badge');
                if (badge) {
                    const visible = Array.from(document.querySelectorAll(`#${gridId} .card`)).filter(c => c.style.display !== 'none').length;
                    badge.textContent = `${visible} Certification${visible > 1 ? 's' : ''}`;
                }
            }
        }

        // --- Modal Logic (remains the same) ---
        const modalBtns = document.querySelectorAll('[data-modal-target]');
        modalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = document.getElementById(btn.dataset.modalTarget);
                if (modal) {
                    modal.showModal();
                }
            });
        });

        const closeBtns = document.querySelectorAll('.project-modal .close-btn');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('dialog');
                if (modal) {
                    modal.close();
                }
            });
        });

        // Close modal on outside click
        const dialogs = document.querySelectorAll('dialog.project-modal');
        dialogs.forEach(dialog => {
            dialog.addEventListener('click', (event) => {
                if (event.target === dialog) {
                    dialog.close();
                }
            });
        });

        // --- NOUVEAU : Logique de Recherche Projets ---
        const projectSearchInput = document.getElementById('project-search');
        const clearProjectSearchBtn = document.getElementById('clear-project-search');
        const projectCards = document.querySelectorAll('#project-grid .project-card');
        const projectCountBadge = document.getElementById('project-count-badge');

        function updateProjectCounter() {
            const visibleProjects = Array.from(projectCards).filter(card => card.style.display !== 'none').length;
            if (projectCountBadge) {
                projectCountBadge.textContent = `${visibleProjects} Réalisation${visibleProjects > 1 ? 's' : ''} Technique${visibleProjects > 1 ? 's' : ''}`;
            }
        }
        updateProjectCounter();

        // --- NOUVEAU : Nuage de Technologies Dynamique ---
        function generateTechCloud() {
            const techContainer = document.querySelector('.project-stats');
            if (!techContainer) return;

            const allSkills = {};
            document.querySelectorAll('#project-grid .skills-tags span').forEach(span => {
                const skill = span.textContent.trim();
                allSkills[skill] = (allSkills[skill] || 0) + 1;
            });

            const sortedSkills = Object.entries(allSkills).sort((a, b) => b[1] - a[1]).slice(0, 10);

            const cloudDiv = document.createElement('div');
            cloudDiv.className = 'tech-cloud';
            cloudDiv.innerHTML = '<span class="tech-cloud-label">Top Technologies :</span>';

            sortedSkills.forEach(([skill, count]) => {
                const tag = document.createElement('span');
                tag.className = 'tech-tag';
                tag.innerHTML = `${skill} <small>(${count})</small>`;
                tag.addEventListener('click', () => {
                    if (projectSearchInput) {
                        projectSearchInput.value = skill;
                        projectSearchInput.dispatchEvent(new Event('input'));
                        window.location.hash = 'projets';
                    }
                });
                cloudDiv.appendChild(tag);
            });

            techContainer.appendChild(cloudDiv);
        }
        generateTechCloud();

        // --- NOUVEAU : Rendre tous les badges et tags cliquables ---
        document.querySelectorAll('#project-grid .badge, #project-grid .skills-tags span').forEach(el => {
            el.style.cursor = 'pointer';
            el.title = `Filtrer par "${el.textContent.trim()}"`;
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const term = el.textContent.trim();
                if (projectSearchInput) {
                    projectSearchInput.value = term;
                    projectSearchInput.dispatchEvent(new Event('input'));
                    window.location.hash = 'projets';
                }
            });
        });

        if (projectSearchInput) {
            projectSearchInput.addEventListener('input', debounce(() => {
                const searchTerm = projectSearchInput.value.toLowerCase().trim();

                if (clearProjectSearchBtn) {
                    clearProjectSearchBtn.classList.toggle('visible', searchTerm !== '');
                }

                projectCards.forEach(card => {
                    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                    const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
                    const skills = Array.from(card.querySelectorAll('.skills-tags span')).map(s => s.textContent.toLowerCase()).join(' ');

                    const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm) || skills.includes(searchTerm);

                    if (matchesSearch) {
                        card.classList.remove('hidden');
                        card.style.display = 'block';
                    } else {
                        card.classList.add('hidden');
                        setTimeout(() => {
                            if (card.classList.contains('hidden')) {
                                card.style.display = 'none';
                                updateProjectCounter();
                            }
                        }, 400);
                    }
                });
                updateProjectCounter();
            }, 300));
        }

        if (clearProjectSearchBtn) {
            clearProjectSearchBtn.addEventListener('click', () => {
                projectSearchInput.value = '';
                projectSearchInput.dispatchEvent(new Event('input'));
                projectSearchInput.focus();
            });
        }

        // --- PDF and Fallback Logic (remains the same) ---
        const allProjectBtns = document.querySelectorAll('.btn-view-project');
        allProjectBtns.forEach(btn => {
            if (!btn.hasAttribute('data-modal-target')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const projectId = btn.dataset.project;
                    const pdfProjects = {
                        'testeur-securite': 'assets/projects/testeur-securite-electrique.pdf',
                        'maint-ventilateur-anesth': 'assets/projects/maintenance-preventive-anesthesie.pdf',
                        'guide-calibration': 'assets/projects/guide-calibration-pousse-seringue.pdf',
                        'nettoyage-cassette': 'assets/projects/protocole-nettoyage-cassette.pdf',
                        'maint-ventilateur-rea': 'assets/projects/maintenance-preventive-reanimation.pdf',
                        'maint-moniteur': 'assets/projects/maintenance-preventive-moniteur.pdf',
                        'procedure-maintenance': 'assets/projects/PROCÉDURE DE MAINTENANCE PRÉVENTIVE.pdf'
                    };

                    if (pdfProjects[projectId]) {
                        window.open(pdfProjects[projectId], '_blank');
                    } else {
                        // FALLBACK: If no modal and no PDF, open the project image
                        const card = btn.closest('.project-card');
                        if (card) {
                            const img = card.querySelector('img');
                            if (img && img.src) {
                                window.open(img.src, '_blank');
                            }
                        }
                    }
                });
            }
        });
    }
    function generateCertifications() {
        const certificationsGrid = document.querySelector('.certifications-grid');
        if (!certificationsGrid) return;

        const certifications = [
            // Getinge
            {
                title: "Ventilation : Guide de démarrage Servo-air (OUS, Anglais)",
                date: "06 mai 2025",
                organisme: "Getinge",
                image: "assets/certificates/respirateur-reanimation-certificate.webp",
                alt: "Certificat de formation sur le respirateur de réanimation Servo-air",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Principes de fonctionnement du respirateur Servo-air</li>
          <li>✅ Montage et vérification avant utilisation (Pre-use check)</li>
          <li>✅ Gestion des alarmes et dépannage de premier niveau</li>
          <li>✅ Maintenance préventive et remplacement des consommables</li>
          <li>✅ Calibration des capteurs de débit et d'O2</li>
        </ul>`,
                link: "assets/certificates/respirateur-reanimation-certificate.webp",
                category: "resuscitation ventilation"
            },
            {
                title: "Anesthésie : Vue d'ensemble du système Flow-c (OUS, Anglais)",
                date: "19 mai 2025",
                organisme: "Getinge",
                image: "assets/certificates/respirateur-anesthesie-certificate.webp",
                alt: "Certificat de formation sur le respirateur d'anesthésie Flow-c",
                description: `Compétences clés acquises :
        <ul>
            <li>✅ Architecture du système d'anesthésie Flow-c</li>
            <li>✅ Préparation et test automatique du système</li>
            <li>✅ Gestion des gaz médicaux et vaporisateurs</li>
            <li>✅ Maintenance du circuit patient et système respiratoire</li>
            <li>✅ Diagnostic et résolution des codes d'erreur courants</li>
        </ul>`,
                link: "assets/certificates/respirateur-anesthesie-certificate.webp",
                category: "anesthesia ventilation"
            },
            {
                title: "Ventilation : Modes de Ventilation Module 1 – Réglages et Courbes",
                date: "02 décembre 2025",
                organisme: "Getinge",
                image: "assets/certificates/Modes-of-Ventilation-Module-One.webp",
                alt: "Certificat sur les modes de ventilation",
                description: `Compétences clés acquises :
        <ul>
            <li>✅ Compréhension des courbes de pression, débit et volume</li>
            <li>✅ Réglages de base : PEEP, Fréquence, Volume courant</li>
            <li>✅ Modes contrôlés vs assistés</li>
            <li>✅ Interprétation des boucles pression-volume</li>
            <li>✅ Synchronisation patient-ventilateur</li>
        </ul>`,
                link: "assets/certificates/Modes%20of%20Ventilation%20Module%20One.pdf",
                category: "resuscitation ventilation"
            },
            {
                title: "Ventilation : Prise en main du respirateur Servo-u",
                date: "20 décembre 2025",
                organisme: "Getinge",
                image: "assets/certificates/Ventilation eLearning Servo-u.webp",
                alt: "Certificat sur le respirateur de réanimation : Servo-u Start-up guide",
                description: `Compétences clés acquises :
        <ul>
            <li>✅ Interface utilisateur et configuration des écrans</li>
            <li>✅ Tests fonctionnels étendus et calibration</li>
            <li>✅ Maintenance de la cassette expiratoire et inspiratoire</li>
            <li>✅ Outils de diagnostic avancés et historique des pannes</li>
            <li>✅ Mise à jour logicielle et gestion des options</li>
        </ul>`,
                link: "assets/certificates/Ventilation eLearning Servo-u.pdf",
                category: "resuscitation ventilation"
            },
            {
                title: "Anesthésie : Vue d'ensemble du système Flow-i (OUS, Anglais)",
                date: "02 janvier 2026",
                organisme: "Getinge",
                image: "assets/certificates/Anesthesia eLearning Flow-i System Overview (OUS, English).webp",
                alt: "Certificat de formation sur le respirateur d'anesthésie Flow-i",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Présentation complète du système Flow-i</li>
          <li>✅ Configuration et paramétrage des modes ventilatoires</li>
          <li>✅ Gestion des alarmes et sécurités du système</li>
          <li>✅ Maintenance préventive et diagnostics de pannes</li>
          <li>✅ Utilisation du circuit respiratoire et des vaporisateurs</li>
        </ul>`,
                link: "assets/certificates/Anesthesia eLearning Flow-i System Overview (OUS, English).webp",
                category: "anesthesia ventilation"
            },
            {
                title: "Ventilation : Nettoyage Servo-u/n/air",
                date: "02 janvier 2026",
                organisme: "Getinge",
                image: "assets/certificates/Servo-u n air cleaning.webp",
                alt: "Certificat sur le nettoyage des voies d'air du Servo-u/n",
                description: `Compétences clés acquises :
        <ul>
            <li>✅ Démontage sécurisé des canaux inspiratoires et expiratoires</li>
            <li>✅ Protocoles de désinfection et stérilisation (Autoclave)</li>
            <li>✅ Nettoyage des capteurs sans endommagement</li>
            <li>✅ Remontage et tests d'étanchéité</li>
            <li>✅ Prévention des infections nosocomiales</li>
        </ul>`,
                link: "assets/certificates/Servo-u n air cleaning.pdf",
                category: "resuscitation ventilation"
            },
            {
                title: "Ventilation : Modes de Ventilation Module 2 – Modes Contrôlés",
                date: "19 janvier 2026",
                organisme: "Getinge",
                image: "assets/certificates/Modes of Ventilation Module Two.webp",
                alt: "Certificat Modes of Ventilation Module Two",
                description: `Compétences clés acquises :
        <ul>
            <li>✅ Modes contrôlés en Pression (PC) et Volume (VC)</li>
            <li>✅ Réglages avancés : I:E ratio, temps de pause, trigger</li>
            <li>✅ Ventilation assistée contrôlée intermittente (VACI)</li>
            <li>✅ Gestion des patients sédates vs actifs</li>
            <li>✅ Optimisation de l'oxygénation et ventilation minute</li>
        </ul>`,
                link: "assets/certificates/Modes of Ventilation Module Two.pdf",
                category: "resuscitation ventilation",
                isNew: true
            },
            {
                title: "Tables d'opération : Formation Utilisateur Maquet Yuno",
                date: "20 janvier 2026",
                organisme: "Getinge",
                image: "assets/certificates/Operating tables eLearning User Training Maquet Yuno (OUS, English).webp",
                alt: "Certificat Operating tables eLearning User Training Maquet Yuno",
                description: `Compétences clés acquises :
        <ul>
            <li>✅ Fonctionnalités et mouvements de la table Maquet Yuno</li>
            <li>✅ Positionnement patient pour diverses chirurgies</li>
            <li>✅ Utilisation de la télécommande et commandes de secours</li>
            <li>✅ Maintenance préventive des vérins et batteries</li>
            <li>✅ Nettoyage et désinfection des matelas et surfaces</li>
        </ul>`,
                link: "assets/certificates/Operating tables eLearning User Training Maquet Yuno (OUS, English).pdf",
                category: "operating-tables",
                isNew: true
            },
            {
                title: "Anesthésie : Modes de Ventilation Famille Flow Module 1",
                date: "20 janvier 2026",
                organisme: "Getinge",
                image: "assets/certificates/Modes of Ventilation Flow Family Module 1, waveforms & settings.webp",
                alt: "Certificat Modes of Ventilation Flow Family Module 1, waveforms & settings",
                description: `Compétences clés acquises :
        <ul>
            <li>✅ Spécificités de la ventilation en anesthésie</li>
            <li>✅ Analyse des courbes de capnographie (EtCO2)</li>
            <li>✅ Réglages des volumes et pressions en circuit fermé</li>
            <li>✅ Compliance et résistance du circuit respiratoire</li>
            <li>✅ Monitorage des gaz anesthésiques</li>
        </ul>`,
                link: "assets/certificates/Modes of Ventilation Flow Family Module 1, waveforms & settings.pdf",
                category: "resuscitation ventilation",
                isNew: true
            },
            {
                title: "Anesthésie : Modes de Ventilation Famille Flow Module 2",
                date: "20 janvier 2026",
                organisme: "Getinge",
                image: "assets/certificates/Modes of Ventilation Flow Family Module 2, controlled modes.webp",
                alt: "Certificat Modes of Ventilation Flow Family Module 2, controlled modes",
                description: `Compétences clés acquises :
        <ul>
            <li>✅ Ventilation Contrôlée en Volume (VCV) en anesthésie</li>
            <li>✅ Ventilation Contrôlée en Pression (PCV) et PCV-VG</li>
            <li>✅ Gestion du recrutement alvéolaire per-opératoire</li>
            <li>✅ Modes de soutien pression (PSV) pour le réveil</li>
            <li>✅ Sécurité et alarmes de ventilation</li>
        </ul>`,
                link: "assets/certificates/Modes of Ventilation Flow Family Module 2, controlled modes.pdf",
                category: "resuscitation ventilation",
                isNew: true
            },
            // Siemens Healthineers
            {
                title: "Vue d'ensemble du système ACUSON Maple™",
                date: "28 juin 2025",
                organisme: "Siemens Healthineers",
                image: "assets/certificates/acuson-maple-certificate.webp",
                alt: "Certificat de formation sur le système d'échographie ACUSON Maple",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Architecture matérielle et logicielle du système ACUSON Maple</li>
          <li>✅ Configuration des sondes et optimisation d'image</li>
          <li>✅ Modes d'imagerie : 2D, Doppler, M-Mode</li>
          <li>✅ Maintenance préventive et tests de performance</li>
          <li>✅ Gestion des données patient et connectivité DICOM</li>
        </ul>`,
                link: "assets/certificates/acuson-maple-certificate.webp",
                category: "ultrasound"
            },
            {
                title: "MAMMOMAT B.brilliant - Présentation du système",
                date: "12 octobre 2025",
                organisme: "Siemens Healthineers",
                image: "assets/certificates/mammomat-b-brilliant-certificate.webp",
                alt: "Certificat de formation sur le système de mammographie Mammomat B. Brilliant",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Système de mammographie numérique et tomosynthèse</li>
          <li>✅ Contrôle qualité : fantômes, doses, résolution</li>
          <li>✅ Compression, positionnement et protocoles d'acquisition</li>
          <li>✅ Maintenance préventive et étalonnage du tube RX</li>
          <li>✅ Radioprotection et normes de sécurité</li>
        </ul>`,
                link: "assets/certificates/mammomat-b-brilliant-certificate.webp",
                category: "mammography"
            },
            {
                title: "Essentiels CT - Formation en ligne sur les bases du scanner",
                date: "26 octobre 2025",
                organisme: "Siemens Healthineers",
                image: "assets/certificates/UserCertificate_CTBasics.webp",
                alt: "Certificat sur les notions de base de la tomodensitométrie (CT)",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Principes physiques du scanner : rayons X, détecteurs, reconstruction</li>
          <li>✅ Paramètres d'acquisition : kV, mAs, pitch, collimation</li>
          <li>✅ Qualité d'image et artefacts courants</li>
          <li>✅ Contrôle qualité quotidien et maintenance préventive</li>
          <li>✅ Radioprotection et optimisation des doses</li>
        </ul>`,
                link: "assets/certificates/UserCertificate_CTBasics.pdf",
                category: "ct-scan"
            },
            {
                title: "Principes fondamentaux de l'échographie : Introduction physique",
                date: "07 décembre 2025",
                organisme: "Siemens Healthineers",
                image: "assets/certificates/UserCertificate_UltrasoundFundamentalsAPhysicsPrimer.webp",
                alt: "Certificat sur les principes fondamentaux de l'échographie",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Principes physiques des ultrasons et interaction avec les tissus</li>
          <li>✅ Fonctionnement des sondes et transducteurs piézoélectriques</li>
          <li>✅ Modes d'imagerie : B-Mode, M-Mode et Doppler</li>
          <li>✅ Optimisation de l'image et résolution spatiale/temporelle</li>
          <li>✅ Artefacts d'image courants et leur identification</li>
        </ul>`,
                link: "assets/certificates/UserCertificate_UltrasoundFundamentalsAPhysicsPrimer.pdf",
                category: "ultrasound"
            },
            {
                title: "Analyseur Série CA-600 - Vue d'ensemble du système",
                date: "02 janvier 2026",
                organisme: "Siemens Healthineers",
                image: "assets/certificates/UserCertificate_SysmexCA600SeriesSystemOverview.webp",
                alt: "Certificat Sysmex CA-600 Series System Overview",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Architecture complète du système d'hémostase CA-600</li>
          <li>✅ Navigation et configuration logicielle avancée</li>
          <li>✅ Gestion des réactifs, contrôles et maintenance utilisateur</li>
          <li>✅ Optimisation des flux de travail et gestion des erreurs</li>
          <li>✅ Calibration et procédures de contrôle qualité</li>
        </ul>`,
                link: "assets/certificates/UserCertificate_SysmexCA600SeriesSystemOverview.webp",
                category: "laboratory"
            },
            {
                title: "Physique IRM - Génération et acquisition du signal",
                date: "07 janvier 2026",
                organisme: "Siemens Healthineers",
                image: "assets/certificates/Physique RM - Génération et acquisition de la formation en ligne sur le signal RM.webp",
                alt: "Certificat sur la physique RM, génération et acquisition du signal",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Principes de la résonance magnétique nucléaire (RMN)</li>
          <li>✅ Génération du signal RM : Excitation et Relaxation T1/T2</li>
          <li>✅ Séquences d'impulsions fondamentales (Spin Echo, Gradient Echo)</li>
          <li>✅ Encodage spatial et formation de l'image (Espace K)</li>
          <li>✅ Sécurité en environnement IRM et champs magnétiques</li>
        </ul>`,
                link: "assets/certificates/Physique RM - Génération et acquisition de la formation en ligne sur le signal RM.pdf",
                category: "mri"
            },
            {
                title: "Physique de base pour le radiographe",
                date: "08 janvier 2026",
                organisme: "Siemens Healthineers",
                image: "assets/certificates/UserCertificate_BasicPhysicsfortheRadiographer.webp",
                alt: "Certificat sur la physique de base pour le radiographe",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Production et propriétés des rayons X</li>
          <li>✅ Interaction rayonnement-matière et atténuation</li>
          <li>✅ Qualité de l'image : Contraste, Résolution, Bruit</li>
          <li>✅ Facteurs géométriques et flou d'image</li>
          <li>✅ Principes de radioprotection et dosimétrie</li>
        </ul>`,
                link: "assets/certificates/UserCertificate_BasicPhysicsfortheRadiographer.pdf",
                category: "radiology"
            },
            {
                title: "Radiographie : Passé et Présent",
                date: "09 janvier 2026",
                organisme: "Siemens Healthineers",
                image: "assets/certificates/UserCertificate_FluoroscopyPastandPresentOUS.webp",
                alt: "Certificat sur la fluoroscopie : Passé et Présent",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Évolution historique des technologies de fluoroscopie</li>
          <li>✅ Fonctionnement des amplificateurs de brillance d'image (I.I.)</li>
          <li>✅ Transition vers les détecteurs plans dynamiques (Flat Panel)</li>
          <li>✅ Avantages cliniques et technologiques des systèmes modernes</li>
          <li>✅ Optimisation de la dose en radioscopie interventionnelle</li>
        </ul>`,
                link: "assets/certificates/UserCertificate_FluoroscopyPastandPresentOUS.pdf",
                category: "fluoroscopy"
            },
            {
                title: "Cios Spin - Vue d'ensemble du système",
                date: "10 janvier 2026",
                organisme: "Siemens Healthineers",
                image: "assets/certificates/Cios Spin Hardware Overview Online Training.webp",
                alt: "Certificat sur le Cios Spin Hardware Overview Online Training",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Architecture complète du système Cios Spin (Arceau 3D mobile)</li>
          <li>✅ Systèmes de sécurité, anticollision et freins électromagnétiques</li>
          <li>✅ Positionnement isocentrique et manœuvrabilité</li>
          <li>✅ Interface utilisateur tactile et gestion des protocoles</li>
          <li>✅ Intégration en bloc opératoire et navigation chirurgicale</li>
        </ul>`,
                link: "assets/certificates/Cios Spin Hardware Overview Online Training.pdf",
                category: "fluoroscopy"
            },
            // AREP
            {
                title: "Cours Essentiels HD (Hémodialyse)",
                date: "03 novembre 2025",
                organisme: "AREP (Advanced Renal Education Program)",
                image: "assets/certificates/HD-Essentials-CE_Hemodialysis-Essentials-EMEA-Course.webp",
                alt: "Certificat sur les bases de l'hémodialyse",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Principes physiologiques de l'hémodialyse et fonction rénale</li>
          <li>✅ Fonctionnement du dialyseur et membranes semi-perméables</li>
          <li>✅ Traitement de l'eau pour dialyse et préparation du dialysat</li>
          <li>✅ Types d'accès vasculaires (fistule, cathéter) et gestion</li>
          <li>✅ Gestion des complications per-dialytiques et sécurité patient</li>
        </ul>`,
                link: "assets/certificates/HD%20Essentials%20CE_Hemodialysis%20Essentials%20EMEA%20Course.pdf",
                category: "dialysis"
            },
            // Olympus
            {
                title: "E-learning EVIS EXERA III",
                date: "29 juin 2025",
                organisme: "Olympus Continuum",
                image: "assets/certificates/evis-exera-iii-certificate.webp",
                alt: "Certificat de formation sur la colonne d'endoscopie EVIS EXERA III",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Architecture complète de la colonne vidéo EVIS EXERA III</li>
          <li>✅ Source de lumière LED/Xénon et réglages d'illumination</li>
          <li>✅ Processeur vidéo CV-190 et technologies NBI/Dual Focus</li>
          <li>✅ Maintenance et manipulation correcte des endoscopes</li>
          <li>✅ Protocoles de nettoyage, désinfection et stérilisation</li>
        </ul>`,
                link: "assets/certificates/evis-exera-iii-certificate.webp",
                category: "endoscopy"
            },
            // Autres
            {
                title: "Électrochirurgie - Principes fonctionnels et utilisation sûre",
                date: "01 novembre 2025",
                organisme: "Erbe Academy",
                image: "assets/certificates/Electrosurgery - Functional principles and safe use DAHBI Certificate.webp",
                alt: "Certificat sur les principes fonctionnels et l'utilisation sûre de l'électrochirurgie",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Physique de l'électrochirurgie (HF) : Coupe vs Coagulation</li>
          <li>✅ Techniques monopolaires vs bipolaires et applications cliniques</li>
          <li>✅ Effets tissulaires et réglages de puissance optimaux</li>
          <li>✅ Sécurité patient : Prévention des brûlures et placement de l'électrode neutre</li>
          <li>✅ Gestion des interférences et sécurité au bloc opératoire</li>
        </ul>`,
                link: "assets/certificates/Electrosurgery - Functional principles and safe use DAHBI Certificate.pdf",
                category: "electrosurgery"
            },
            {
                title: "Formation de base en ligne XN-L (XN-550)",
                date: "10 novembre 2025",
                organisme: "Sysmex",
                image: "assets/certificates/confirmation_xn-550_basic_online_training.webp",
                alt: "Certificat de formation sur l'automate d'hématologie XN-550 par Sysmex",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Principe mesure Hématologie : Cytométrie en flux fluorescente</li>
          <li>✅ Démarrage, contrôle qualité (QC) et calibration du XN-550</li>
          <li>✅ Analyse des échantillons et interprétation des scattergrammes</li>
          <li>✅ Gestion des réactifs et remplacement des consommables</li>
          <li>✅ Maintenance utilisateur journalière, hebdomadaire et mensuelle</li>
        </ul>`,
                link: "assets/certificates/confirmation_xn-550_basic_online_training.pdf",
                category: "laboratory"
            },
            {
                title: "Pacemaker Cardiaque : Concepts de base",
                date: "08 décembre 2025",
                organisme: "Medtronic",
                image: "assets/certificates/Basic-Pacing-Concepts-Overview.webp",
                alt: "Certificat sur les concepts de base de la stimulation cardiaque",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Physiologie cardiaque et système de conduction électrique</li>
          <li>✅ Indications de la stimulation cardiaque (Bradycardie, BAV)</li>
          <li>✅ Codes NBG (ex: VVI, DDD) et modes de stimulation</li>
          <li>✅ Paramètres de base : Seuil, Sensibilité, Impédance</li>
          <li>✅ Dépannage basique : Perte de capture, Perte de détection</li>
        </ul>`,
                link: "assets/certificates/Basic Pacing Concepts Overview.pdf",
                category: "cardiology"
            },
            {
                title: "Introduction à l'utilisation de l'ESA620",
                date: "10 janvier 2026",
                organisme: "Fluke Biomedical",
                image: "assets/certificates/Intro to Using the ESA620_Advantage Training Certificate.webp",
                alt: "Certificat de formation Intro to Using the ESA620",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Maîtrise de l'analyseur de sécurité électrique ESA620</li>
          <li>✅ Protocoles de test selon normes IEC 60601-1 et IEC 62353</li>
          <li>✅ Mesures de résistance de terre, courants de fuite et isolation</li>
          <li>✅ Simulation de défauts et tests de la partie appliquée (Patient)</li>
          <li>✅ Documentation et interprétation des résultats de sécurité</li>
        </ul>`,
                link: "assets/certificates/Intro to Using the ESA620_Advantage Training Certificate.pdf",
                category: "testing"
            },
            {
                title: "Générateur de diathermie ESG-400",
                date: "Non spécifiée",
                organisme: "Olympus",
                image: "assets/certificates/esg-400-certificate.webp",
                alt: "Certificat de formation sur le bistouri électrique ESG-400",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Principes d'utilisation du générateur ESG-400</li>
          <li>✅ Modes avancés : Coupe saline, Thunderbeat, PK Technology</li>
          <li>✅ Configuration des prises instruments et pédales</li>
          <li>✅ Tests de sécurité automatique et alarmes</li>
          <li>✅ Maintenance préventive et nettoyage de l'unité</li>
        </ul>`,
                link: "assets/certificates/esg-400-certificate.webp",
                category: "electrosurgery"
            },
            {
                title: "Medical Device Quality Assurance - Patient Monitors",
                date: "Non spécifiée",
                organisme: "Fluke Biomedical",
                image: "assets/certificates/Medical Device Quality Assurance-Patient Monitors.webp",
                alt: "Certificat Medical Device Quality Assurance - Patient Monitors",
                description: `Compétences clés acquises :
        <ul>
          <li>✅ Gestion de programme d'assurance qualité (AQ) pour équipements médicaux</li>
          <li>✅ Procédures d'inspection et de maintenance préventive</li>
          <li>✅ Évaluation de la sécurité et tests de performance</li>
          <li>✅ Gestion des actifs et planification technologique</li>
          <li>✅ Amélioration de la sécurité des patients liée aux dispositifs</li>
        </ul>`,
                link: "assets/certificates/Medical Device Quality Assurance-Patient Monitors.pdf",
                category: "testing",
                isNew: true
            }
        ];

        certificationsGrid.innerHTML = certifications.map((cert, index) => `
            <div class="card project-card certification-card" data-category="${cert.category}">
                ${cert.isNew ? '<span class="new-badge">Nouveau</span>' : ''}
                <div class="certificate-item">
                    <img ${cert.imageSmall ? `srcset="${cert.imageSmall} 480w, ${cert.image} 800w"` : ''}
                         sizes="(max-width: 600px) 480px, 800px"
                         src="${cert.image}"
                         alt="${cert.alt}" loading="lazy">
                </div>
                <div class="certification-content">
                    <h3>${cert.title}</h3>
                    <p class="cert-info"><strong>Organisme:</strong> ${cert.organisme} | <strong>Date:</strong> ${cert.date}</p>
                    <div class="text-clamp">
                        <p>${cert.description}</p>
                    </div>
                    <button class="read-more-btn" aria-expanded="false">Lire la suite <i class="fas fa-chevron-down"></i></button>
                    <a href="${cert.link}" class="btn-view-cert" data-index="${index}" aria-label="Voir le certificat ${cert.title}">Voir le certificat</a>
                </div>
            </div>
        `).join('');

        // --- DÉBUT DE LA CORRECTION ---
        // Mettre à jour dynamiquement le badge de comptage pour qu'il soit toujours correct
        const certificationCountBadge = document.getElementById('certification-count-badge');
        if (certificationCountBadge) {
            const count = certifications.length;
            certificationCountBadge.textContent = `${count} Certification${count > 1 ? 's' : ''}`;
        }
        // --- FIN DE LA CORRECTION ---

        // Ajout des Event Listeners pour la Lightbox
        const modal = document.getElementById('certification-modal');
        const modalImg = document.getElementById('cert-modal-img');
        const modalTitle = document.getElementById('cert-modal-title');
        const modalDesc = document.getElementById('cert-modal-desc');

        document.querySelectorAll('.btn-view-cert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = btn.dataset.index;
                const cert = certifications[index];

                if (modal && cert) {
                    modalTitle.textContent = cert.title;
                    modalImg.src = cert.image;
                    modalImg.alt = cert.alt;
                    modalDesc.innerHTML = `<p class="cert-info"><strong>Organisme:</strong> ${cert.organisme} | <strong>Date:</strong> ${cert.date}</p>${cert.description}`; // Utilisation de innerHTML pour les listes
                    modal.showModal();
                }
            });
        });
    }

    function setupRecommendationToast() {
        const toast = document.getElementById('recommendation-toast');
        const closeBtn = document.getElementById('close-toast');
        const toastLinks = document.querySelectorAll('.toast-btn');

        if (!toast || !closeBtn) return;

        // Afficher le toast après 5 secondes
        setTimeout(() => {
            // Toujours afficher le toast (demande utilisateur)
            toast.classList.add('visible');
        }, 5000);

        // Fermer le toast
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('visible');
            // Suppression de la persistence : sessionStorage.setItem('toastDismissed', 'true');
        });

        // Fermer si on clique sur un lien du toast
        toastLinks.forEach(link => {
            link.addEventListener('click', () => {
                toast.classList.remove('visible');
            });
        });
    }

    function setupFilterCounts() {
        const filterContainer = document.querySelector('#certifications .project-filters');
        if (!filterContainer) return;

        const filterBtns = filterContainer.querySelectorAll('.filter-btn');
        const allCards = document.querySelectorAll('#certifications-grid .card');

        filterBtns.forEach(btn => {
            const filter = btn.dataset.filter;
            let count = 0;

            if (filter === 'all') {
                count = allCards.length;
            } else {
                allCards.forEach(card => {
                    if (card.dataset.category?.includes(filter)) {
                        count++;
                    }
                });
            }

            // Ne pas update le texte si le compteur existe déjà
            if (!btn.querySelector('.filter-count')) {
                const currentText = btn.textContent;
                btn.innerHTML = `${currentText} <span class="filter-count">(${count})</span>`;
            }
        });
    }

    function setupCertificationSearch() {
        const searchInput = document.getElementById('certification-search');
        const clearBtn = document.getElementById('clear-search');
        const allCards = document.querySelectorAll('#certifications-grid .card');
        const certificationCountBadge = document.getElementById('certification-count-badge');

        if (!searchInput || !clearBtn) return;

        function updateCertificationCounter() {
            const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none').length;
            if (certificationCountBadge) {
                certificationCountBadge.textContent = `${visibleCards} Certification${visibleCards > 1 ? 's' : ''}`;
            }
        }


        // Fonction de recherche avec debounce
        const performSearch = debounce((searchTerm) => {
            const term = searchTerm.toLowerCase().trim();

            allCards.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const description = card.querySelector('p')?.textContent.toLowerCase() || '';
                const matches = title.includes(term) || description.includes(term);

                if (term === '' || matches) {
                    card.classList.remove('hidden');
                    card.style.display = 'block';
                } else {
                    card.classList.add('hidden');
                    setTimeout(() => {
                        if (card.classList.contains('hidden')) {
                            card.style.display = 'none';
                            updateCertificationCounter();
                        }
                    }, 400);
                }
            });
            updateCertificationCounter();

            // Afficher/masquer le bouton clear
            clearBtn.style.display = term ? 'flex' : 'none';

            // Réinitialiser le filtre actif à "Tous"
            if (term) {
                const allFilterBtn = document.querySelector('#certifications .filter-btn[data-filter="all"]');
                if (allFilterBtn) {
                    document.querySelectorAll('#certifications .filter-btn').forEach(btn => btn.classList.remove('active'));
                    allFilterBtn.classList.add('active');
                }
            }
        }, 300);

        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            performSearch('');
            searchInput.focus();
        });

        // Initial state
        clearBtn.style.display = 'none';
    }

    function setupReadMore() {
        // Sélectionner tous les boutons "Lire la suite"
        const readMoreBtns = document.querySelectorAll('.read-more-btn');

        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                // Trouver le conteneur de texte juste au dessus du bouton
                const textContainer = this.previousElementSibling;
                
                // Basculer la classe 'expanded' sur le conteneur et le bouton
                textContainer.classList.toggle('expanded');
                this.classList.toggle('expanded');
                
                // Mettre à jour le texte et l'icône du bouton
                if (textContainer.classList.contains('expanded')) {
                    this.innerHTML = 'Réduire <i class="fas fa-chevron-down"></i>';
                    this.setAttribute('aria-expanded', 'true');
                } else {
                    this.innerHTML = 'Lire la suite <i class="fas fa-chevron-down"></i>';
                    this.setAttribute('aria-expanded', 'false');
                    
                    // Optionnel : Scroller légèrement vers le haut si on réduit une longue carte
                    const cardTop = textContainer.closest('.card').getBoundingClientRect().top + window.scrollY;
                    const headerOffset = document.querySelector('.site-header').offsetHeight + 20;
                    
                    // Si la carte remonte au-dessus de l'écran quand on réduit, on recadre
                    if (window.scrollY > cardTop - headerOffset) {
                        window.scrollTo({
                            top: cardTop - headerOffset,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // Initialize all functionalities
    setupPreloader();
    setupNavigation();
    setupNavObserver();
    setupThemeToggle();
    setupSectionAnimations();
    setupClipboardCopy();
    setupScrollToTop();
    setupVanillaTilt();
    setupAudioPlayer();
    setupTypingAnimation();
    setupProfilePicParallax();
    generateCertifications();
    setupFilterCounts(); // Ajouter les compteurs après génération des certifications
    setupCertificationSearch(); // Ajouter la recherche textuelle
    setupFiltersAndModals();
    setupScrollHideHeader(); // Initialize auto-hide
    setupRecommendationToast();
    setupReadMore();

    // --- REVEAL ON SCROLL ANIMATION ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('section').forEach(section => {
        revealObserver.observe(section);
    });

    // --- READING PROGRESS BAR LOGIC ---
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = scrolled + "%";
        }
    });

    function setupGoogleAnalyticsTracking() {
        // 1. Suivi de TOUS les téléchargements (CV depuis l'en-tête, le FAB et les PDF des modales)
        const downloadLinks = document.querySelectorAll('a[download]');
        downloadLinks.forEach(link => {
            link.addEventListener('click', () => {
                const fileName = link.getAttribute('download') || 'Document inconnu';
                if (typeof gtag === 'function') {
                    gtag('event', 'download_file', {
                        'event_category': 'Engagement',
                        'event_label': fileName
                    });
                }
            });
        });

        // 2. Suivi des clics sur les Emails (Contact et FAB)
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'click_email', {
                        'event_category': 'Contact',
                        'event_label': 'Email Link Click'
                    });
                }
            });
        });

        // 3. Suivi des clics sur les numéros de Téléphone (Contact et FAB)
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'click_phone', {
                        'event_category': 'Contact',
                        'event_label': 'Phone Link Click'
                    });
                }
            });
        });

        // 4. Suivi des clics sur LinkedIn
        const linkedinLinks = document.querySelectorAll('a[href*="linkedin.com"]');
        linkedinLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'click_linkedin', {
                        'event_category': 'Contact',
                        'event_label': 'LinkedIn Link Click'
                    });
                }
            });
        });

        // 5. Suivi des boutons "Voir le projet"
        const projectBtns = document.querySelectorAll('.btn-view-project');
        projectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Nom lisible du projet : titre de la carte, sinon aria-label nettoyé, sinon slug
                const card = btn.closest('.project-card');
                const title = card && card.querySelector('h3');
                const projectName = (title && title.textContent.trim())
                    || (btn.getAttribute('aria-label') || '').replace(/^Voir le projet\s*/i, '').trim()
                    || btn.dataset.project
                    || 'Projet inconnu';
                if (typeof gtag === 'function') {
                    gtag('event', 'view_project', {
                        'event_category': 'Engagement',
                        'event_label': projectName,
                        'project_name': projectName
                    });
                }
            });
        });

        // 6. Suivi des boutons "Voir le certificat"
        const certBtns = document.querySelectorAll('.btn-view-cert');
        certBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Nom lisible du certificat : titre de la carte, sinon aria-label nettoyé
                const item = btn.closest('.certification-card');
                const title = item && item.querySelector('h3');
                const certName = (title && title.textContent.trim())
                    || (btn.getAttribute('aria-label') || '').replace(/^Voir le certificat\s*/i, '').trim()
                    || 'Certificat inconnu';
                if (typeof gtag === 'function') {
                    gtag('event', 'view_certificate', {
                        'event_category': 'Engagement',
                        'event_label': certName,
                        'certificate_name': certName
                    });
                }
            });
        });

        // 7. Suivi du bouton "Contactez-moi" (Bouton principal en haut)
        const contactBtn = document.querySelector('a[href="#contact"].cta-button');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'click_contact_cta', {
                        'event_category': 'Navigation',
                        'event_label': 'Header Contact CTA'
                    });
                }
            });
        }

        // 8. Suivi du bouton "Introduction Audio"
        const audioBtn = document.getElementById('play-pause-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'toggle_audio', {
                        'event_category': 'Engagement',
                        'event_label': 'CV Audio Intro'
                    });
                }
            });
        }

        // 9. Suivi des clics sur les boutons de Filtres (Projets & Certificats)
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterCategory = btn.dataset.filter || 'Inconnu';
                if (typeof gtag === 'function') {
                    gtag('event', 'use_filter', {
                        'event_category': 'Engagement',
                        'event_label': `Filtre sélectionné : ${filterCategory}`
                    });
                }
            });
        });

        // 10. Suivi de l'ouverture du Bouton Flottant (FAB - Le petit "+" en bas à gauche)
        const fabToggle = document.getElementById('fab-toggle');
        if (fabToggle) {
            fabToggle.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'toggle_fab', {
                        'event_category': 'Engagement',
                        'event_label': 'Ouverture du menu flottant'
                    });
                }
            });
        }

        // 11. Suivi du commutateur de thème (Mode Clair/Sombre) - Amélioration proactive
        const themeSwitch = document.getElementById('switch');
        if (themeSwitch) {
            themeSwitch.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'Dark Mode' : 'Light Mode';
                if (typeof gtag === 'function') {
                    gtag('event', 'toggle_theme', {
                        'event_category': 'Preference',
                        'event_label': theme
                    });
                }
            });
        }
    }

    setupGoogleAnalyticsTracking();

});

/**
 * Initializes the FAB toggle logic for mobile.
 */
function setupFab() {
    const fabContainer = document.querySelector('.fab-container');
    const fabToggle = document.getElementById('fab-toggle');

    if (!fabContainer || !fabToggle) return;

    fabToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        fabContainer.classList.toggle('open');
        const isExpanded = fabContainer.classList.contains('open');
        fabToggle.setAttribute('aria-expanded', isExpanded);
    });

    document.addEventListener('click', (e) => {
        if (!fabContainer.contains(e.target) && fabContainer.classList.contains('open')) {
            fabContainer.classList.remove('open');
            fabToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // --- LOGIQUE BOUTON EMAIL (Copier + Ouvrir) ---
    const emailBtn = document.querySelector('.fab-mail');
    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            // Le comportement par défaut (mailto) se produira.
            // On ajoute la copie dans le presse-papier.
            const email = "Dahbi-YASSINE@outlook.fr";
            navigator.clipboard.writeText(email).then(() => {
                // Feedback visuel : Utilise l'info-bulle existante ou en crée une temporaire
                const tooltip = document.getElementById('copy-tooltip');
                if (tooltip) {
                    tooltip.textContent = "Email copié !"; // Personnalise le message
                    tooltip.classList.add('visible');
                    setTimeout(() => {
                        tooltip.classList.remove('visible');
                        tooltip.textContent = "Copié !"; // Remet le message par défaut
                    }, 2000);
                }
            }).catch(err => {
                console.error('Erreur lors de la copie :', err);
            });
        });
    }
}
setupFab();



/**
 * Hides header on scroll down, shows on scroll up.
 */
function setupScrollHideHeader() {
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.site-header');

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // Scrolling DOWN
                    header.classList.add('header-hidden');
                } else {
                    // Scrolling UP
                    header.classList.remove('header-hidden');
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}