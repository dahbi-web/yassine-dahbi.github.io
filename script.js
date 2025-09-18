document.addEventListener('DOMContentLoaded', () => {

    // --- GESTION DU PRÉ-CHARGEUR ---
    const preloader = document.getElementById('preloader');

    // Cacher le pré-chargeur une fois la page totalement chargée
    window.addEventListener('load', () => {
        if (preloader) preloader.style.display = 'none';
        document.body.style.overflow = 'auto'; // Permettre le défilement
    });


    // --- MENU DE NAVIGATION LATÉRAL ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
            });
        });
    }

    // --- GESTION DU THÈME SOMBRE/CLAIR ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);

        themeToggle.addEventListener('click', () => {
            let newTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- LECTEUR AUDIO POUR L'INTRODUCTION ---
    const playPauseBtn = document.getElementById('play-pause-btn');
    const cvAudio = document.getElementById('cv-audio');
    if (playPauseBtn && cvAudio) {
        playPauseBtn.addEventListener('click', () => {
            if (cvAudio.paused) {
                cvAudio.play();
                playPauseBtn.textContent = '❚❚ Intro';
            } else {
                cvAudio.pause();
                playPauseBtn.textContent = '▶ Intro';
            }
        });

        cvAudio.addEventListener('ended', () => {
            playPauseBtn.textContent = '▶ Intro';
        });
    }

    // --- ANIMATION DES SECTIONS AU DÉFILEMENT ---
    const animatedSections = document.querySelectorAll('.animated-section');
    if (animatedSections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -100px 0px' });
        animatedSections.forEach(section => sectionObserver.observe(section));
    }

    // --- ACCORDÉON POUR LES CERTIFICATIONS ---
    document.querySelectorAll('.accordion-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('active');

            if (content.style.maxHeight) {
                // Si on ferme l'accordéon
                content.style.maxHeight = null;
                content.style.marginTop = null;
            } else {
                // Si on ouvre l'accordéon
                content.style.marginTop = '1rem';
                content.style.maxHeight = content.scrollHeight + 'px';

                // **Correction :** On écoute le chargement des images à l'intérieur
                // pour s'assurer que la hauteur est correcte.
                const images = content.querySelectorAll('img');
                images.forEach(img => {
                    // Si une image n'est pas encore chargée
                    if (!img.complete) {
                        img.addEventListener('load', () => {
                            // On met à jour la hauteur de l'accordéon une fois l'image chargée,
                            // seulement si l'accordéon est toujours ouvert.
                            if (content.style.maxHeight !== "0px" && content.style.maxHeight !== null) {
                                content.style.maxHeight = content.scrollHeight + 'px';
                            }
                        }, { once: true }); // L'écouteur ne s'exécute qu'une fois par image
                    }
                });
            }
        });
    });

    // --- COPIER DANS LE PRESSE-PAPIER ---
    const copyables = document.querySelectorAll('.copyable');
    const tooltip = document.getElementById('copy-tooltip');
    if (copyables.length > 0 && tooltip) {
        copyables.forEach(el => {
            el.addEventListener('click', () => {
                navigator.clipboard.writeText(el.innerText).then(() => {
                    tooltip.classList.add('visible');
                    setTimeout(() => tooltip.classList.remove('visible'), 1500);
                });
            });
        });
    }

    // --- BOUTON "REMONTER EN HAUT" ---
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
        });

        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- EFFET TILT.JS SUR LA PHOTO DE PROFIL ---
    const profilePic = document.querySelector('.profile-pic');
    if (profilePic && typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(profilePic, {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.2
        });
    }
});