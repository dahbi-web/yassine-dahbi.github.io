// backend.gs — Backend unique du chatbot de Yassine Dahbi.
// Déployé comme application Web Google Apps Script, LIÉ à un Google Sheet.
// Il fait deux choses côté serveur (la clé n'atteint jamais le navigateur) :
//   1) relaie la conversation à Groq (avec retry sur 429/503) ;
//   2) enregistre chaque échange dans l'onglet « Logs » du Sheet.
//
// AVANT DE DÉPLOYER :
//   Paramètres du projet (roue dentée) → Propriétés du script → Ajouter :
//     GROQ_API_KEY = votre clé Groq (gsk_...)
//   La clé reste privée côté Google, jamais exposée dans le code du site.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const msgs = Array.isArray(payload.messages) ? payload.messages : [];
    const system = msgs.find(function (m) { return m.role === 'system'; });
    const convo = msgs.filter(function (m) { return m.role !== 'system'; }).slice(-10);
    const messages = system ? [system].concat(convo) : convo;

    const reply = callGroq(messages);

    // Journalisation best-effort : n'interrompt jamais la réponse.
    try {
      const lastUser = convo.slice().reverse().find(function (m) { return m.role === 'user'; });
      logRow(lastUser ? lastUser.content : '', reply);
    } catch (ignore) {}

    return json({ reply: reply });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function callGroq(messages) {
  const key = PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
  if (!key) throw new Error('GROQ_API_KEY manquante dans les propriétés du script');

  const body = { model: GROQ_MODEL, messages: messages, max_tokens: 1024, temperature: 0.7 };
  let delay = 1500;

  for (var attempt = 0; attempt <= 3; attempt++) {
    const res = UrlFetchApp.fetch(GROQ_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + key },
      payload: JSON.stringify(body),
      muteHttpExceptions: true,
    });
    const code = res.getResponseCode();

    // Erreurs temporaires : on réessaie avec backoff.
    if (code === 429 || code === 503) {
      if (attempt < 3) { Utilities.sleep(delay); delay *= 2; continue; }
      throw new Error('Groq HTTP ' + code);
    }
    if (code >= 200 && code < 300) {
      const data = JSON.parse(res.getContentText());
      return (data.choices && data.choices[0] && data.choices[0].message.content) || '';
    }
    throw new Error('Groq HTTP ' + code);
  }
}

function logRow(question, answer) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Logs') || ss.insertSheet('Logs');
  if (sheet.getLastRow() === 0) sheet.appendRow(['Date', 'Question', 'Réponse']);
  sheet.appendRow([new Date(), question, answer]);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
