// logger.gs — Reçoit les échanges du chatbot et les ajoute au Google Sheet.
// Déployer comme application Web (voir README.md, section « Journalisation »).
//
// Remplacer SECRET par un jeton aléatoire de votre choix, IDENTIQUE à celui
// mis dans la variable LOG_URL du Worker (partie « ?token=... »).

const SECRET = 'CHANGE_ME_jeton_aleatoire';

function doPost(e) {
  try {
    if (!e || !e.parameter || e.parameter.token !== SECRET) {
      return json({ ok: false, error: 'unauthorized' });
    }
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Logs') || ss.insertSheet('Logs');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Date', 'Question', 'Réponse']);
    }
    sheet.appendRow([new Date(), data.question || '', data.answer || '']);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
