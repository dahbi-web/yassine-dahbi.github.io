/* rating.js — Notation ★ + commentaire pour le portfolio de Yassine Dahbi.
   Enregistre les avis dans un Google Sheet via Google Apps Script (voir
   rating-proxy/). Les commentaires restent privés : le site n'affiche que la
   moyenne et le nombre de votes. */

// ⬇️ À REMPLIR après le déploiement de rating-proxy/backend.gs :
//    collez ici l'URL de l'application Web (…/exec).
const RATING_API_URL = '';

const RATING_STORAGE_KEY = 'portfolio_rated';

let selectedRating = 0;
let ratingSubmitting = false;

function setupRating() {
  const box = document.getElementById('rating-box');
  if (!box) return;

  const starsWrap = document.getElementById('rating-stars');
  const stars     = starsWrap ? Array.from(starsWrap.querySelectorAll('button')) : [];
  const comment   = document.getElementById('rating-comment');
  const name      = document.getElementById('rating-name');
  const submitBtn = document.getElementById('rating-submit');
  const average   = document.getElementById('rating-average');
  const feedback  = document.getElementById('rating-feedback');

  if (!stars.length || !submitBtn) return;

  // Sélection d'une note au clic.
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value, 10) || 0;
      highlightStars(stars, selectedRating);
    });
  });

  // Affiche la moyenne actuelle dès le chargement.
  loadAverage(average);

  // Si l'utilisateur a déjà voté (sur cet appareil), on verrouille le formulaire.
  if (hasAlreadyRated()) {
    lockForm(stars, comment, name, submitBtn, feedback,
      'Merci, vous avez déjà noté ce portfolio ! 🙏');
  }

  submitBtn.addEventListener('click', () => {
    submitRating({ stars, comment, name, submitBtn, average, feedback });
  });
}

function highlightStars(stars, value) {
  stars.forEach(star => {
    const v = parseInt(star.dataset.value, 10);
    star.classList.toggle('selected', v <= value);
  });
}

function hasAlreadyRated() {
  try { return localStorage.getItem(RATING_STORAGE_KEY) === '1'; }
  catch (e) { return false; }
}

function markRated() {
  try { localStorage.setItem(RATING_STORAGE_KEY, '1'); } catch (e) { /* ignore */ }
}

function lockForm(stars, comment, name, submitBtn, feedback, message) {
  stars.forEach(s => { s.disabled = true; });
  if (comment) comment.disabled = true;
  if (name) name.disabled = true;
  submitBtn.disabled = true;
  if (feedback && message) {
    feedback.textContent = message;
    feedback.className = 'rating-feedback ok';
  }
}

async function loadAverage(averageEl) {
  if (!averageEl || !RATING_API_URL) return;
  try {
    const res = await fetch(RATING_API_URL, { method: 'GET' });
    if (!res.ok) return;
    const data = await res.json();
    renderAverage(averageEl, data);
  } catch (e) {
    // Silencieux : l'absence de moyenne ne doit pas gêner le visiteur.
  }
}

function renderAverage(averageEl, data) {
  const count = Number(data && data.count) || 0;
  const avg = Number(data && data.average) || 0;
  if (!count) {
    averageEl.textContent = 'Soyez le premier à noter ce portfolio !';
    return;
  }
  const votes = count > 1 ? 'votes' : 'vote';
  averageEl.innerHTML =
    avg.toFixed(1).replace('.', ',') +
    ' <span class="star-icon">★</span> · ' + count + ' ' + votes;
}

async function submitRating(ctx) {
  const { stars, comment, name, submitBtn, average, feedback } = ctx;

  if (ratingSubmitting) return;

  if (!(selectedRating >= 1 && selectedRating <= 5)) {
    showFeedback(feedback, 'Choisissez d\'abord une note (1 à 5 étoiles).', 'error');
    return;
  }

  if (hasAlreadyRated()) {
    lockForm(stars, comment, name, submitBtn, feedback,
      'Merci, vous avez déjà noté ce portfolio ! 🙏');
    return;
  }

  if (!RATING_API_URL) {
    showFeedback(feedback, 'Le service de notation n\'est pas encore configuré.', 'error');
    return;
  }

  // Google Analytics : suit l'envoi d'une note par un visiteur.
  if (typeof gtag === 'function') {
    gtag('event', 'rate_portfolio', {
      'event_category': 'Engagement',
      'event_label': 'Note portfolio',
      'value': selectedRating
    });
  }

  ratingSubmitting = true;
  submitBtn.disabled = true;
  showFeedback(feedback, 'Envoi en cours…', '');

  const payload = {
    note: selectedRating,
    commentaire: comment ? comment.value.trim() : '',
    nom: name ? name.value.trim() : ''
  };

  const MAX_RETRIES = 3;
  let delay = 2000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(RATING_API_URL, {
        method: 'POST',
        // text/plain : évite le preflight CORS que Apps Script ne gère pas.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (res.status === 429 || res.status === 503) {
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw new Error('HTTP ' + res.status);
      }

      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      if (data && data.error) throw new Error(data.error);

      // Succès : on verrouille et on remercie.
      markRated();
      if (average) renderAverage(average, data);
      lockForm(stars, comment, name, submitBtn, feedback,
        'Merci pour votre note ! 🙏');
      ratingSubmitting = false;
      return;

    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.error('Rating error:', err);
        showFeedback(feedback,
          'Désolé, l\'envoi a échoué. Réessayez dans quelques instants.', 'error');
        submitBtn.disabled = false;
        ratingSubmitting = false;
        return;
      }
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }

  ratingSubmitting = false;
}

function showFeedback(el, message, kind) {
  if (!el) return;
  el.textContent = message;
  el.className = 'rating-feedback' + (kind ? ' ' + kind : '');
}

document.addEventListener('DOMContentLoaded', setupRating);
