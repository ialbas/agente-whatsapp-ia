// Núcleo do agente: responde ancorado na base (FAQ) e decide o HANDOFF humano.
// Com chave de LLM, usa o modelo; sem chave, cai num matcher determinístico —
// então o demo roda offline. A "inteligência" está no prompt + na base.
import { FAQ, HANDOFF_TRIGGERS } from './knowledge.js';

export interface AgentReply { reply: string; handoff: boolean; source: 'llm' | 'faq' | 'fallback'; }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function wantsHuman(message: string): boolean {
  const m = norm(message);
  return HANDOFF_TRIGGERS.some((t) => m.includes(norm(t)));
}

// --- LLM opcional (OpenAI ou Anthropic via fetch; sem SDK) ---------------
async function callLLM(system: string, user: string): Promise<string | null> {
  const oa = process.env.OPENAI_API_KEY;
  const an = process.env.ANTHROPIC_API_KEY;
  try {
    if (oa) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${oa}` },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.2, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
      });
      const j: any = await r.json();
      return j.choices?.[0]?.message?.content ?? null;
    }
    if (an) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': an, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001', max_tokens: 400, system, messages: [{ role: 'user', content: user }] }),
      });
      const j: any = await r.json();
      return j.content?.[0]?.text ?? null;
    }
  } catch (e) { console.error('LLM erro:', (e as Error).message); }
  return null;
}

// --- fallback determinístico (sem LLM) -----------------------------------
function faqMatch(message: string): string | null {
  const m = norm(message);
  let best: { score: number; a: string } | null = null;
  for (const item of FAQ) {
    const score = item.tags.filter((t) => m.includes(norm(t))).length;
    if (score > 0 && (!best || score > best.score)) best = { score, a: item.a };
  }
  return best?.a ?? null;
}

export async function runAgent(message: string): Promise<AgentReply> {
  const handoff = wantsHuman(message);
  if (handoff) {
    return { reply: 'Perfeito! Vou te passar para um especialista do time que continua daqui. 👤', handoff: true, source: 'fallback' };
  }

  const system = `Você é um atendente de uma loja no WhatsApp. Responda em PT-BR, curto e cordial.
Responda APENAS com base nesta base de conhecimento; se a resposta não estiver nela, diga que vai chamar um humano.
BASE:\n${FAQ.map((f) => `- ${f.q} ${f.a}`).join('\n')}`;
  const llm = await callLLM(system, message);
  if (llm) return { reply: llm.trim(), handoff: /humano|especialista|atendente/i.test(llm), source: 'llm' };

  const faq = faqMatch(message);
  if (faq) return { reply: faq, handoff: false, source: 'faq' };
  return { reply: 'Não tenho certeza sobre isso — já estou chamando alguém do time pra te ajudar. 👤', handoff: true, source: 'fallback' };
}
