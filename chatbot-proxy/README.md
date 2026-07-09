# Backend du chatbot — Google Apps Script (unique service, gratuit)

Un seul backend, hébergé gratuitement par Google Apps Script, **lié à un Google
Sheet**. Il garde la clé Groq côté serveur et enregistre les conversations.

```
Navigateur (chatbot.js)  ──POST {messages}──►  Apps Script  ──+clé──►  Groq
     (aucune clé)                               │
                                                └──► Google Sheet (onglet « Logs »)
```

Le fichier `backend.gs` de ce dossier est le code à déployer. `worker.js`
(version Cloudflare) est conservé pour référence mais **n'est plus utilisé**.

## Déploiement (100 % navigateur)

1. **Nouvelle clé Groq** : `console.groq.com` → *API Keys* → *Create API Key*.
   Copier la nouvelle clé, puis **supprimer l'ancienne** (`gsk_HAnDk...`) qui est
   compromise (présente dans l'historique git public).

2. **Créer le Google Sheet** : ouvrir `sheets.new` (nouveau classeur vierge).

3. **Coller le code** : dans le Sheet, *Extensions → Apps Script*. Effacer le
   contenu par défaut, coller tout `backend.gs`, puis *Enregistrer* (💾).

4. **Enregistrer la clé (privée)** : dans l'éditeur Apps Script, roue dentée
   *Paramètres du projet* → *Propriétés du script* → *Ajouter une propriété* :
   - Propriété : `GROQ_API_KEY`
   - Valeur : votre **nouvelle** clé Groq
   - *Enregistrer les propriétés du script*.

5. **Déployer** : bouton *Déployer* → *Nouveau déploiement* → engrenage → type
   *Application Web* :
   - Description : `chatbot`
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
   - *Déployer* → autoriser l'accès (choisir votre compte, *Avancé → Accéder au
     projet*).
   - **Copier l'URL de l'application Web** (`https://script.google.com/macros/s/…/exec`).

6. **Envoyer cette URL** : elle sera placée dans `chatbot.js` (constante
   `CHAT_API_URL`). Après ça, le chatbot est branché, sécurisé, et journalise.

## Vérifier / relire les conversations

Ouvrir le Google Sheet → onglet **Logs** : chaque ligne = `Date | Question |
Réponse`. Vous pouvez filtrer, trier, exporter comme n'importe quel tableur.

## Mettre à jour le profil / prompt

Le prompt système (profil de Yassine) reste dans `chatbot.js` — facile à éditer,
aucun redéploiement du script nécessaire.

## Note technique (CORS)

`chatbot.js` envoie la requête en `Content-Type: text/plain` : cela évite la
requête préliminaire (preflight) que Apps Script ne gère pas, tout en
transmettant bien du JSON dans le corps (lu via `e.postData.contents`).
