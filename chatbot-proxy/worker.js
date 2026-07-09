// worker.js — Proxy Groq pour l'assistant du portfolio de Yassine Dahbi.
// Déployé sur Cloudflare Workers (voir README.md du même dossier).
// La clé GROQ_API_KEY est un "secret" côté serveur : elle n'est JAMAIS
// transmise au navigateur.

const ALLOWED_ORIGIN = 'https://dahbi-web.github.io';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    // Préflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: cors });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response('{"error":"Invalid JSON"}', {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Corps reconstruit côté serveur : modèle imposé, historique borné,
    // message système préservé même sur les longues conversations.
    const msgs = Array.isArray(payload.messages) ? payload.messages : [];
    const system = msgs.find(m => m.role === 'system');
    const convo = msgs.filter(m => m.role !== 'system').slice(-10);
    const body = {
      model: 'llama-3.1-8b-instant',
      messages: system ? [system, ...convo] : convo,
      max_tokens: 1024,
      temperature: 0.7,
    };

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    // On relaie le code HTTP (429/503 inclus) pour que le retry côté client marche.
    const text = await groqRes.text();
    return new Response(text, {
      status: groqRes.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
