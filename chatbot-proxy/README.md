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

## Mise à jour du prompt / profil

Le prompt système et les données du profil restent dans `chatbot.js` (facile à
éditer). Le Worker n'a pas besoin d'être redéployé pour ça — seulement si on
change la logique du proxy lui-même.

## Origine autorisée (CORS)

`worker.js` limite les appels à `https://dahbi-web.github.io`. Si le domaine du
site change (domaine personnalisé), mettre à jour `ALLOWED_ORIGIN` puis
redéployer le Worker.
