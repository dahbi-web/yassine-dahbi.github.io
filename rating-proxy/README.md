# Backend des avis — Google Apps Script (gratuit, même méthode que le chatbot)

Un backend, hébergé gratuitement par Google Apps Script, **lié à un Google
Sheet**. Il enregistre les notes ★ (et commentaires) laissés par les visiteurs,
et renvoie la note moyenne affichée sur le portfolio.

```
Navigateur (rating.js)  ──POST {note, commentaire, nom}──►  Apps Script
                        ◄──GET  {average, count}──────────┘   │
                                                              └──► Google Sheet (onglet « Avis »)
```

**Différence avec le chatbot :** ici il n'y a **aucune clé secrète** à protéger.
Le déploiement est donc plus simple et sans risque de fuite.

Le fichier à déployer est `backend.gs` (dans ce dossier).

## Déploiement (100 % navigateur)

1. **Créer le Google Sheet** : ouvrir `sheets.new` (nouveau classeur vierge).
   Vous pouvez réutiliser le même classeur que le chatbot ou en créer un dédié.

2. **Coller le code** : dans le Sheet, *Extensions → Apps Script*. Effacer le
   contenu par défaut, coller tout `backend.gs`, puis *Enregistrer* (💾).

3. **Déployer** : bouton *Déployer* → *Nouveau déploiement* → engrenage → type
   *Application Web* :
   - Description : `avis`
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
   - *Déployer* → autoriser l'accès (choisir votre compte, *Avancé → Accéder au
     projet*).
   - **Copier l'URL de l'application Web** (`https://script.google.com/macros/s/…/exec`).

4. **Brancher le site** : coller cette URL dans `rating.js` (constante
   `RATING_API_URL`, en haut du fichier). Enregistrer, commit, push.

## Vérifier / relire les avis

Ouvrir le Google Sheet → onglet **Avis** : chaque ligne = `Date | Note |
Commentaire | Nom`. Vous pouvez filtrer, trier, exporter. Les commentaires
restent **privés** : le site public n'affiche que la moyenne et le nombre de
votes. Recopiez à la main les meilleurs avis vers la section « Recommandations »
si vous le souhaitez.

## Note technique (CORS)

`rating.js` envoie la requête POST en `Content-Type: text/plain` : cela évite la
requête préliminaire (preflight) que Apps Script ne gère pas, tout en
transmettant bien du JSON dans le corps (lu via `e.postData.contents`). Le GET de
la moyenne ne déclenche aucun preflight.
