import 'dotenv/config';
import Fastify from 'fastify';
import { runAgent } from './agent.js';
import { initStore, saveTurn } from './store.js';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ ok: true }));

// Verificação do webhook (handshake do WhatsApp Cloud API).
app.get('/webhook', async (req, reply) => {
  const q = req.query as Record<string, string>;
  if (q['hub.mode'] === 'subscribe' && q['hub.verify_token'] === (process.env.WHATSAPP_VERIFY_TOKEN || 'demo')) {
    return reply.send(q['hub.challenge']);
  }
  return reply.code(403).send('forbidden');
});

// Recebe mensagem. Aceita payload simples {from,text} (demo via curl) OU o
// formato do WhatsApp Cloud API. Roda o agente, persiste e responde.
app.post('/webhook', async (req, reply) => {
  const msg = extractMessage(req.body);
  if (!msg) return reply.send({ ok: true, ignored: true });
  await saveTurn({ from: msg.from, role: 'user', text: msg.text, at: new Date().toISOString() });
  const res = await runAgent(msg.text);
  await saveTurn({ from: msg.from, role: 'agent', text: res.reply, at: new Date().toISOString() });
  // Em produção: enviar res.reply pela WhatsApp API. No demo, retorna no corpo.
  return reply.send({ from: msg.from, reply: res.reply, handoff: res.handoff, source: res.source });
});

function extractMessage(body: any): { from: string; text: string } | null {
  if (body?.from && body?.text) return { from: String(body.from), text: String(body.text) };
  const m = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (m?.from && m?.text?.body) return { from: m.from, text: m.text.body };
  return null;
}

const port = Number(process.env.PORT || 3000);
const mode = await initStore();
await app.listen({ port, host: '0.0.0.0' });
app.log.info(`agente-whatsapp-ia no ar :${port} · store=${mode}`);
