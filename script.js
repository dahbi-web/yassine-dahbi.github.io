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

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
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

        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
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
     * Sets up the typing animation for the highlighted name.
     */
    function setupTypingAnimation() {
        const highlightSpan = document.querySelector('.header-text .highlight');
        if (!highlightSpan) return;

        const originalText = highlightSpan.textContent;
        highlightSpan.textContent = '';

        const typingSpan = document.createElement('span');
        typingSpan.classList.add('typed-text');
        highlightSpan.appendChild(typingSpan);

        typingSpan.classList.add('typing-effect');

        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                typingSpan.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 150);
            } else {
                setTimeout(() => {
                    typingSpan.classList.remove('typing-effect');
                    typingSpan.style.borderRight = 'none';
                }, 2000);
            }
        }
        setTimeout(typeWriter, 1000);
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
                                }
                            }, 400); // Match CSS transition duration
                        }
                    });
                });
            });
        });

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
            {
                title: "Respirateur de réanimation : Servo-air Start-up guide",
                image: "assets/certificates/respirateur-reanimation-certificate.webp",
                imageSmall: "assets/certificates/respirateur-reanimation-certificate-small.webp",
                alt: "Certificat de formation sur le respirateur de réanimation Servo-air",
                description: `Formation sur la maintenance des respirateurs de réanimation :
        <ul>
          <li>Configuration du Servo-air</li>
          <li>Alarmes</li>
          <li>Déclenchement</li>
          <li>VC/PPC (Volume Courant/Poids Prédit Corporel)</li>
          <li>Modes</li>
          <li>Manœuvres : Niveau d'enrichissement en oxygène</li>
          <li>Autres manœuvres : Insufflation manuelle</li>
          <li>Manœuvres : Nébulisation</li>
          <li>Tendances</li>
          <li>Média</li>
          <li>Vues</li>
          <li>Aide à l'aspiration</li>
          <li>Arrêt de la ventilation</li>
        </ul>`,
                link: "assets/certificates/respirateur-reanimation-certificate.webp",
                category: "resuscitation"
            },
            {
                title: "Respirateur d'anesthésie : Flow-c System Overview",
                image: "assets/certificates/respirateur-anesthesie-certificate.webp",
                imageSmall: "assets/certificates/respirateur-anesthesie-certificate-small.webp",
                alt: "Certificat de formation sur le respirateur d'anesthésie Flow-c",
                description: `Compétence sur les respirateurs d'anesthésie : 
         <ul>
          <li>Partie supérieure du Flow-c</li>
          <li>Partie inférieure du Flow-c</li>
          <li>Vaporisateurs</li>
          <li>Unité du système d'urgence</li>
          <li>Connexions externes</li>
          <li>Rangement et freins</li>
        </ul>`,
                link: "assets/certificates/respirateur-anesthesie-certificate.webp",
                category: "anesthesia"
            },
            {
                title: "Anesthesia eLearning Flow-i System Overview",
                image: "assets/certificates/Anesthesia eLearning Flow-i System Overview (OUS, English).webp",
                alt: "Certificat de formation sur le respirateur d'anesthésie Flow-i",
                description: "Formation sur le système de respirateur d'anesthésie Flow-i.",
                link: "assets/certificates/Anesthesia eLearning Flow-i System Overview (OUS, English).webp",
                category: "anesthesia"
            },
            {
                title: "Bistouri électrique : ESG-400 Diathermy Generator",
                image: "assets/certificates/esg-400-certificate.webp",
                imageSmall: "assets/certificates/esg-400-certificate-small.webp",
                alt: "Certificat de formation sur le bistouri électrique ESG-400",
                description: "Formation sur l'unité chirurgicale avancée ESG-400.",
                link: "assets/certificates/esg-400-certificate.webp",
                category: "electrosurgery"
            },
            {
                title: "Échographie : ACUSON Maple™ System Overview Course",
                image: "assets/certificates/acuson-maple-certificate.webp",
                imageSmall: "assets/certificates/acuson-maple-certificate-small.webp",
                alt: "Certificat de formation sur le système d'échographie ACUSON Maple",
                description: "Formation sur le système d'échographie ACUSON Maple.",
                link: "assets/certificates/acuson-maple-certificate.webp",
                category: "imaging"
            },
            {
                title: "Endoscopie : EVIS EXERA III",
                image: "assets/certificates/evis-exera-iii-certificate.webp",
                imageSmall: "assets/certificates/evis-exera-iii-certificate-small.webp",
                alt: "Certificat de formation sur la colonne d'endoscopie EVIS EXERA III",
                description: "Formation sur la colonne d'endoscopie EVIS EXERA III.",
                link: "assets/certificates/evis-exera-iii-certificate.webp",
                category: "endoscopy"
            },
            {
                title: "Mammographie : Mammomat B. Brilliant",
                image: "assets/certificates/mammomat-b-brilliant-certificate.webp",
                imageSmall: "assets/certificates/mammomat-b-brilliant-certificate-small.webp",
                alt: "Certificat de formation sur le système de mammographie Mammomat B. Brilliant",
                description: "Formation sur le système de mammographie Mammomat B. Brilliant.",
                link: "assets/certificates/mammomat-b-brilliant-certificate.webp",
                category: "imaging"
            },
            {
                title: "Tomodensitométrie : Notions de base",
                image: "assets/certificates/UserCertificate_CTBasics.webp",
                imageSmall: "assets/certificates/UserCertificate_CTBasics.webp",
                alt: "Certificat sur les notions de base de la tomodensitométrie (CT)",
                description: "Formation sur les principes fondamentaux de la tomodensitométrie (CT).",
                link: "assets/certificates/UserCertificate_CTBasics.webp",
                category: "imaging"
            },
            {
                title: "Électrochirurgie : Principes fonctionnels et utilisation sûre",
                image: "assets/certificates/Electrosurgery - Functional principles and safe use DAHBI Certificate.webp",
                imageSmall: "assets/certificates/Electrosurgery - Functional principles and safe use DAHBI Certificate.webp",
                alt: "Certificat sur les principes fonctionnels et l'utilisation sûre de l'électrochirurgie",
                description: `Formation sur les principes fonctionnels et l'utilisation sûre de l'électrochirurgie.</p>
        <ul>
          <li>Effets thermiques sur les tissus</li>
          <li>Principe de fonctionnement de l'électrochirurgie</li>
          <li>Instruments monopolaires et bipolaires</li>
          <li>Réglages de l'appareil</li>
          <li>Préparation sécurisée du patient</li>
          <li>Activation sécurisée des instruments</li>
          <li>Dépannage</li>
        </ul>`,
                link: "assets/certificates/Electrosurgery - Functional principles and safe use DAHBI Certificate.pdf",
                category: "electrosurgery"
            },
            {
                title: "Hémodialyse : HD Essentials",
                image: "assets/certificates/HD-Essentials-CE_Hemodialysis-Essentials-EMEA-Course.webp",
                alt: "Certificat sur les bases de l'hémodialyse",
                description: `Formation sur les bases de l'hémodialyse :</p>
                <ul>
          <li>Module 1: Introduction à l'hémodialyse</li>
          <li>Module 2: Dialyseur, purification de l'eau et dialysat</li>
          <li>Module 3: Accès vasculaire et mécanismes en hémodialyse</li>
          <li>Module 4: Prescription HD, complications et meilleures pratiques</li>
        </ul>`,
                link: "assets/certificates/HD%20Essentials%20CE_Hemodialysis%20Essentials%20EMEA%20Course.pdf",
                category: "dialysis"
            },
            {
                title: "Formation de base XN-550 (Sysmex)",
                image: "assets/certificates/confirmation_xn-550_basic_online_training.webp",
                alt: "Certificat de formation sur l'automate d'hématologie XN-550 par Sysmex",
                description: `Formation en ligne sur l'automate d'hématologie XN-550 :</p>
                <ul>
          <li>Présentation du produit</li>
          <li>Démarrage et connexion</li>
          <li>Présentation de l'interface utilisateur</li>
          <li>Analyse</li>
          <li>Vérifier, valider et émettre les résultats</li>
          <li>Contrôle qualité</li>
          <li>Arrêt</li>
          <li>Remplacement de réactifs</li>
          <li>Nettoyage normal</li>
        </ul>`,
                link: "assets/certificates/confirmation_xn-550_basic_online_training.pdf",
                category: "laboratory"
            },
            {
                title: "Sysmex CA-600 Series System Overview",
                image: "assets/certificates/UserCertificate_SysmexCA600SeriesSystemOverview.webp",
                alt: "Certificat Sysmex CA-600 Series System Overview",
                description: "Formation sur le système Sysmex CA-600 Series.",
                link: "assets/certificates/UserCertificate_SysmexCA600SeriesSystemOverview.webp",
                category: "laboratory"
            },
            {
                title: "Modes of Ventilation - Module One",
                image: "assets/certificates/Modes-of-Ventilation-Module-One.webp",
                alt: "Certificat sur les modes de ventilation",
                description: "Formation sur les différents modes de ventilation mécanique.",
                link: "assets/certificates/Modes%20of%20Ventilation%20Module%20One.pdf",
                category: "resuscitation"
            },
            {
                title: "Échographie : Principes fondamentaux",
                image: "assets/certificates/UserCertificate_UltrasoundFundamentalsAPhysicsPrimer.webp",
                imageSmall: "assets/certificates/UserCertificate_UltrasoundFundamentalsAPhysicsPrimer.webp",
                alt: "Certificat sur les principes fondamentaux de l'échographie",
                description: "Formation sur les principes fondamentaux de l'échographie.",
                link: "assets/certificates/UserCertificate_UltrasoundFundamentalsAPhysicsPrimer.pdf",
                category: "imaging"
            },
            {
                title: "Stimulation Cardiaque : Concepts de base",
                image: "assets/certificates/Basic-Pacing-Concepts-Overview.webp",
                imageSmall: "assets/certificates/Basic-Pacing-Concepts-Overview.webp",
                alt: "Certificat sur les concepts de base de la stimulation cardiaque",
                description: "Formation sur les concepts de base de la stimulation cardiaque.",
                link: "assets/certificates/Basic Pacing Concepts Overview.pdf",
                category: "cardiology"
            },
            {
                title: "Respirateur de réanimation : Servo-u Start-up guide",
                image: "assets/certificates/Ventilation eLearning Servo-u.webp",
                alt: "Certificat sur le respirateur de réanimation : Servo-u Start-up guide",
                description: "Formation sur le respirateur de réanimation Servo-u.",
                link: "assets/certificates/Ventilation eLearning Servo-u.pdf",
                category: "resuscitation"
            }
        ];

        certificationsGrid.innerHTML = certifications.map((cert, index) => `
            <div class="card project-card certification-card" data-category="${cert.category}">
                <div class="certificate-item">
                    <img ${cert.imageSmall ? `srcset="${cert.imageSmall} 480w, ${cert.image} 800w"` : ''}
                         sizes="(max-width: 600px) 480px, 800px"
                         src="${cert.image}"
                         alt="${cert.alt}" loading="lazy">
                </div>
                <div class="certification-content">
                    <h3>${cert.title}</h3>
                    <p>${cert.description}</p>
                    <a href="${cert.link}" class="btn-view-cert" data-index="${index}" aria-label="Voir le certificat ${cert.title}">Voir le certificat</a>
                </div>
            </div>
        `).join('');

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
                    modalDesc.innerHTML = cert.description; // Utilisation de innerHTML pour les listes
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
            // Vérifier si l'utilisateur n'a pas déjà fermé le toast (via localStorage optionnel, ici simple session)
            if (!sessionStorage.getItem('toastDismissed')) {
                toast.classList.add('visible');
            }
        }, 5000);

        // Fermer le toast
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('visible');
            sessionStorage.setItem('toastDismissed', 'true');
        });

        // Fermer si on clique sur un lien du toast
        toastLinks.forEach(link => {
            link.addEventListener('click', () => {
                toast.classList.remove('visible');
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
    setupFiltersAndModals();
    setupRecommendationToast();
});