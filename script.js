document.addEventListener('DOMContentLoaded', () => {

    // --- GESTION DU PRÉ-CHARGEUR ET DE L'ÉCRAN D'ACCUEIL ---
    const preloader = document.getElementById('preloader');
    const welcomeScreen = document.getElementById('welcome-screen');
    const welcomeForm = document.getElementById('welcome-form');
    const formMessage = document.getElementById('form-message'); // Corrigé : utilise le bon ID

    // Cacher le pré-chargeur une fois la page totalement chargée
    window.addEventListener('load', () => {
        if (preloader) preloader.style.display = 'none';
    });

    // Fonction pour masquer l'écran d'accueil et afficher le site
    function enterSite() {
        if (welcomeScreen) {
            welcomeScreen.style.transition = 'opacity 0.5s ease';
            welcomeScreen.style.opacity = '0';
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 500);
        }
    }

    // Gestion de la soumission du formulaire d'accueil avec AJAX
    if (welcomeForm) {
        welcomeForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Empêche la redirection
            
            const form = event.target;
            const data = new FormData(form);
            
            if (formMessage) {
                formMessage.textContent = 'Envoi en cours...';
                formMessage.className = 'form-message';
            }

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    if (formMessage) {
                        formMessage.textContent = "Merci ! L'aventure commence...";
                        formMessage.classList.add('success');
                    }
                    setTimeout(enterSite, 700);
                } else {
                    const responseData = await response.json();
                    if (responseData.hasOwnProperty('errors')) {
                        if (formMessage) formMessage.textContent = responseData.errors.map(error => error.message).join(", ");
                    } else {
                        if (formMessage) formMessage.textContent = "Oops! Une erreur s'est produite lors de l'envoi.";
                    }
                }
            } catch (error) {
                console.error('Fetch Error:', error);
                if (formMessage) {
                    formMessage.textContent = "Oops! Une erreur réseau s'est produite.";
                    formMessage.classList.add('error');
                }
            }
        });
    }

    // Bloquer le défilement tant que l'écran d'accueil est visible
    document.body.style.overflow = 'hidden';


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
                content.style.maxHeight = null;
                content.style.marginTop = null;
            } else {
                content.style.marginTop = '1rem';
                content.style.maxHeight = content.scrollHeight + 'px';
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