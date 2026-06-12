// Demo offline: roda algumas mensagens pelo agente sem servidor nem banco.
//   npm run demo
import { runAgent } from './agent.js';

const samples = [
  'Oi, vocês estão abertos agora?',
  'Aceitam pix?',
  'Entregam em Manaus? qual o prazo?',
  'Quero comprar 50 unidades, fazem orçamento?',
  'Qual a cor do céu?',
];

for (const s of samples) {
  const r = await runAgent(s);
  console.log(`\n👤 ${s}\n🤖 ${r.reply}${r.handoff ? '   → HANDOFF humano' : ''}   [${r.source}]`);
}
