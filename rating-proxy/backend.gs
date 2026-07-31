// backend.gs — Backend des avis (notes ★ + commentaires) du portfolio de Yassine Dahbi.
// Déployé comme application Web Google Apps Script, LIÉ à un Google Sheet.
// Contrairement au backend du chatbot, il n'y a AUCUNE clé secrète ici :
// rien de sensible n'est exposé, le déploiement est donc plus simple.
//
// Il fait deux choses :
//   1) doPost  : enregistre une note (+ commentaire, + nom) dans l'onglet « Avis » ;
//   2) doGet   : renvoie la note moyenne et le nombre de votes (affichés sur le site).
//
// Les commentaires restent PRIVÉS dans le Sheet : le site public n'affiche que
// la moyenne et le compteur. Vous relisez les avis dans le tableur et pouvez
// recopier les meilleurs dans la section « Recommandations » du portfolio.

const SHEET_NAME = 'Avis';

// ── Enregistrement d'un avis ──────────────────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    // Validation : la note doit être un entier entre 1 et 5.
    const note = parseInt(payload.note, 10);
    if (!(note >= 1 && note <= 5)) {
      return json({ error: 'Note invalide (attendu : 1 à 5).' });
    }

    // On borne le texte pour éviter les abus (spam de très longs messages).
    const commentaire = String(payload.commentaire || '').slice(0, 1000);
    const nom = String(payload.nom || '').slice(0, 120);

    const sheet = getSheet();
    sheet.appendRow([new Date(), note, commentaire, nom]);

    const stats = computeStats(sheet);
    return json({ ok: true, average: stats.average, count: stats.count });
  } catch (err) {
    return json({ error: String(err) });
  }
}

// ── Lecture de la moyenne (au chargement de la page) ──────────────────────
function doGet(e) {
  try {
    const stats = computeStats(getSheet());
    return json({ average: stats.average, count: stats.count });
  } catch (err) {
    return json({ error: String(err) });
  }
}

// ── Utilitaires ───────────────────────────────────────────────────────────
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Date', 'Note', 'Commentaire', 'Nom']);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'Note', 'Commentaire', 'Nom']);
  }
  return sheet;
}

// Calcule la moyenne (colonne « Note ») et le nombre de votes.
function computeStats(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return { average: 0, count: 0 };

  const notes = sheet.getRange(2, 2, last - 1, 1).getValues(); // colonne B
  let total = 0;
  let count = 0;
  for (var i = 0; i < notes.length; i++) {
    const n = parseInt(notes[i][0], 10);
    if (n >= 1 && n <= 5) { total += n; count++; }
  }
  const average = count ? Math.round((total / count) * 10) / 10 : 0;
  return { average: average, count: count };
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
