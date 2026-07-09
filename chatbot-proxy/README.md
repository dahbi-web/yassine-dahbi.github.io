# Proxy chatbot — Cloudflare Worker

Ce dossier contient le proxy qui garde la clé API Groq **côté serveur**.
Le navigateur n'appelle que le Worker ; il ne voit jamais la clé.

```
Navigateur (chatbot.js)  ──POST {messages}──►  Worker  ──+clé──►  Groq
     (aucune clé)                             (secret GROQ_API_KEY)
```

## Déploiement (100 % navigateur, gratuit)

1. **Nouvelle clé Groq** : `console.groq.com` → *API Keys* → *Create API Key*.
   Copier la nouvelle clé. **Supprimer l'ancienne** (compromise, présente dans
   l'historique git public).

2. **Compte Cloudflare** gratuit : `dash.cloudflare.com`.

3. **Créer le Worker** : *Workers & Pages* → *Create* → *Create Worker* →
   nom `portfolio-chat` → *Deploy* → *Edit code* → coller le contenu de
   `worker.js` → *Deploy*.

4. **Ajouter le secret** : Worker → *Settings* → *Variables and Secrets* → *Add* :
   - Nom : `GROQ_API_KEY`
   - Valeur : la **nouvelle** clé Groq
   - Type : **Secret / Encrypt**
   - *Deploy*.

5. **Copier l'URL** du Worker (`https://portfolio-chat.<sous-domaine>.workers.dev`)
   et la reporter dans `chatbot.js` (constante `CHAT_API_URL`).

## Journalisation des conversations (Google Sheet)

Le Worker envoie chaque échange (question du visiteur + réponse du bot) à un
Google Apps Script qui l'ajoute dans un Google Sheet. C'est **best-effort** :
si le Sheet est indisponible, le chat continue de fonctionner normalement.

1. **Google Sheet** : créer un nouveau Sheet (`sheets.new`).
2. **Apps Script** : dans le Sheet, *Extensions → Apps Script* → coller le
   contenu de `logger.gs` → remplacer `CHANGE_ME_jeton_aleatoire` par un jeton
   aléatoire (ex. `k7Qm2x9`) → *Enregistrer*.
3. **Déployer** : *Déployer → Nouveau déploiement → Type : Application Web* →
   « Exécuter en tant que : moi », « Accès : Tout le monde » → *Déployer* →
   autoriser → **copier l'URL** `https://script.google.com/macros/s/XXX/exec`.
4. **Composer `LOG_URL`** : coller l'URL puis ajouter `?token=<même jeton>` :
   `https://script.google.com/macros/s/XXX/exec?token=k7Qm2x9`
5. **Ajouter au Worker** : Cloudflare → Worker `portfolio-chat` → *Settings →
   Variables and Secrets → Add* → nom `LOG_URL`, valeur = l'URL composée →
   *Deploy*.

Le jeton empêche que n'importe qui écrive dans votre Sheet. Une ligne
`Date | Question | Réponse` est ajoutée à chaque conversation.

## Mise à jour du prompt / profil

Le prompt système et les données du profil restent dans `chatbot.js` (facile à
éditer). Le Worker n'a pas besoin d'être redéployé pour ça — seulement si on
change la logique du proxy lui-même.

## Origine autorisée (CORS)

`worker.js` limite les appels à `https://dahbi-web.github.io`. Si le domaine du
site change (domaine personnalisé), mettre à jour `ALLOWED_ORIGIN` puis
redéployer le Worker.
