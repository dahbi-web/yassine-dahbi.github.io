/* chatbot.js — Assistant Gemini pour le portfolio de Yassine Dahbi */

const GEMINI_API_KEY = 'AQ.Ab8RN6KFsKV0J5TBVaqvtPVnQF1mMYMT6JT9BQDKzFvK5D2w1Q';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const SYSTEM_PROMPT = `Tu es l'assistant portfolio de Yassine Dahbi, technicien en Maintenance et Génie Biomédical.
Ton rôle : aider les recruteurs et visiteurs à mieux connaître son profil, ses compétences, ses projets et sa disponibilité.
Réponds en français (ou en arabe si le visiteur écrit en arabe).
Sois concis et chaleureux : 2-3 phrases max par réponse.
Si une question est hors-sujet, redirige poliment vers le contact.

══ PROFIL ══
Nom : Yassine Dahbi
Titre : Technicien en Maintenance et Génie Biomédical
Formation : ESM6ISS — Université Mohammed VI des Sciences de la Santé (UM6SS), 2022-2025
Disponibilité : Immédiate, mobile sur tout le Maroc
Email : Dahbi-YASSINE@outlook.fr
Téléphone : +212 710 713 772
LinkedIn : linkedin.com/in/yassine-dahbi-142302268
GitHub : github.com/dahbi-web

══ COMPÉTENCES TECHNIQUES ══
• Maintenance préventive & corrective : respirateurs, moniteurs multiparamétriques, autoclaves, échographes, scanners, IRM, mammographes, défibrillateurs, pousse-seringues, tables d'opération
• Calibration et qualification d'équipements médicaux
• Électronique & prototypage : Arduino, Proteus 8, LabVIEW
• GMAO (Gestion de Maintenance Assistée par Ordinateur) : CWorks, Laerdal
• Conception assistée : CATIA V5, Impression 3D
• Automatisation : Google Apps Script, Microsoft Office
• Qualité & Sécurité hospitalière : gestion des risques, normes, protocoles d'entretien
• Langues : Arabe (natif), Français (courant), Anglais (technique)

══ EXPÉRIENCES ══
1. Stage PFE — HPIC Casablanca (Avr-Jul 2025) :
   - Conception d'outils de test innovants (simulateur ECG, testeur de sécurité électrique)
   - Automatisation GMAO via Google Apps Script
   - Participation à des caravanes médicales mobiles
2. Stage Technique — HPIC Casablanca (Jun-Aoû 2024) :
   - Maintenance et calibration d'une large gamme d'équipements
   - Gestion du parc d'équipements médicaux
   - Diagnostic et réparation électronique
3. Stage d'Observation — CHU Ibn Rochd Casablanca (Jul-Aoû 2023) :
   - Bloc opératoire, stérilisation, imagerie médicale, salle hybride

══ 27 CERTIFICATIONS ══
Domaines : Ventilation (Getinge, Mindray), Anesthésie (Getinge), Électrochirurgie (Olympus ESG-400), Échographie, Scanner (Siemens), IRM, Mammographie, Fluoroscopie, Endoscopie, Dialyse, Cardiologie (ECG, Holter, défibrillateur), Laboratoire, Tables d'opération (Maquet Yuno)
Organismes principaux : Getinge, Siemens Healthineers, Olympus, Mindray, Nihon Kohden

══ PROJETS ══
1. Gestion Automatisée des Rapports de Maintenance — Google Apps Script + Google Forms
2. Testeur ECG — Arduino (simulation de signaux ECG pour calibration)
3. Moniteur ECG — Arduino
4. Système de mesure pour poche de perfusion — Arduino
5. Testeur de sécurité électrique — détection des fuites de courant
6. Procédures de maintenance : respirateurs réanimation (Getinge), pousse-seringues (Mindray), moniteurs multiparamétriques (Nihon Kohden), anesthésie (Getinge)
7. Guide de calibration pousse-seringue (Mindray)
8. Protocole de nettoyage cassette`;

let conversationHistory = [];
let isTyping = false;

function setupChatbot() {
  const toggle   = document.getElementById('chatbot-toggle');
  const panel    = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('chatbot-close');
  const input    = document.getElementById('chatbot-input');
  const sendBtn  = document.getElementById('chatbot-send');
  const notif    = document.querySelector('.chatbot-notif');

  if (!toggle || !panel) return;

  // Message d'accueil
  appendMessage('assistant', 'Bonjour ! Je suis l\'assistant de Yassine Dahbi. Posez-moi vos questions sur son profil, ses compétences ou sa disponibilité. 😊');

  // Ouvrir / fermer
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    panel.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      if (notif) notif.classList.add('hidden');
      setTimeout(() => input && input.focus(), 250);
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  });

  // Envoi par bouton
  sendBtn.addEventListener('click', handleSend);

  // Envoi par touche Entrée
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  async function handleSend() {
    const text = input.value.trim();
    if (!text || isTyping) return;

    input.value = '';
    appendMessage('user', text);
    conversationHistory.push({ role: 'user', text });

    await fetchGeminiReply();
  }
}

async function fetchGeminiReply() {
  isTyping = true;
  document.getElementById('chatbot-send').disabled = true;

  const indicator = showTypingIndicator();

  try {
    const contents = conversationHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 256, temperature: 0.7 }
    };

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Désolé, je n\'ai pas pu générer une réponse. Réessayez ou contactez Yassine directement.';

    removeTypingIndicator(indicator);
    appendMessage('assistant', reply);
    conversationHistory.push({ role: 'assistant', text: reply });

  } catch (err) {
    removeTypingIndicator(indicator);
    appendMessage('assistant', 'Une erreur s\'est produite. Veuillez contacter Yassine directement à Dahbi-YASSINE@outlook.fr.');
    console.error('Chatbot Gemini error:', err);
  } finally {
    isTyping = false;
    const sendBtn = document.getElementById('chatbot-send');
    if (sendBtn) sendBtn.disabled = false;
    const input = document.getElementById('chatbot-input');
    if (input) input.focus();
  }
}

function appendMessage(role, text) {
  const messages = document.getElementById('chatbot-messages');
  if (!messages) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.innerHTML = renderMarkdown(text);
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

// Rendu Markdown minimal et sûr : échappe le HTML d'abord, puis applique
// **gras**, *italique*, `code` et les retours à la ligne.
function renderMarkdown(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+?)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function showTypingIndicator() {
  const messages = document.getElementById('chatbot-messages');
  if (!messages) return null;

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(indicator);
  messages.scrollTop = messages.scrollHeight;
  return indicator;
}

function removeTypingIndicator(indicator) {
  if (indicator && indicator.parentNode) indicator.remove();
}

document.addEventListener('DOMContentLoaded', setupChatbot);
