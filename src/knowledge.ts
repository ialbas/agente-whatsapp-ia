// Base de conhecimento do negócio (sintética). Em produção, viria de um CMS/DB
// ou de um índice RAG. Aqui é o "chão" que ancora as respostas do agente.
export interface FaqItem { q: string; a: string; tags: string[]; }

export const FAQ: FaqItem[] = [
  { q: 'Qual o horário de atendimento?', a: 'Atendemos de segunda a sexta, das 9h às 18h.', tags: ['horario', 'funcionamento', 'aberto'] },
  { q: 'Quais formas de pagamento?', a: 'Aceitamos Pix, cartão de crédito (até 12x) e boleto.', tags: ['pagamento', 'pix', 'cartao', 'boleto', 'parcela'] },
  { q: 'Vocês entregam em todo o Brasil?', a: 'Sim, enviamos para todo o Brasil. O prazo varia de 3 a 10 dias úteis conforme a região.', tags: ['entrega', 'frete', 'prazo', 'envio'] },
  { q: 'Como funciona a garantia?', a: 'Todos os produtos têm 90 dias de garantia contra defeito de fabricação.', tags: ['garantia', 'defeito', 'troca'] },
  { q: 'Posso cancelar um pedido?', a: 'Sim, o cancelamento é gratuito até o produto ser despachado.', tags: ['cancelar', 'cancelamento', 'estorno'] },
];

// Intenções que devem escalar para humano (compra, reclamação, fora do escopo).
export const HANDOFF_TRIGGERS = ['comprar', 'orçamento', 'orcamento', 'proposta', 'reclamação', 'reclamacao', 'problema', 'cancelar pedido', 'falar com atendente', 'humano'];
