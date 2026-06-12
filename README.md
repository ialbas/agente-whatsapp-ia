# agente-whatsapp-ia — atendimento no WhatsApp com IA e handoff humano

> Agente que responde clientes no WhatsApp 24/7, qualifica o atendimento e **passa pro
> humano no momento certo** — sem respostas robóticas e sem o cliente esperando.

## Problema

Pequenas operações afogam em mensagens repetidas no WhatsApp: "qual o horário?", "fazem
isso?", "quanto custa?". Responder na mão consome horas e o cliente que chega de madrugada
espera até o dia seguinte — e some. Um bot de árvore de decisão ("digite 1") irrita e não
entende quem foge do roteiro.

## Solução

Um agente de IA que **entende linguagem natural**, responde com base no contexto do negócio,
e reconhece quando deve **escalar para um humano** (intenção de compra, reclamação, caso fora
do escopo) — entregando a conversa com o resumo do que já foi tratado.

```
Cliente (WhatsApp) → webhook → Agente (LLM + base) → resposta
                                      │
                                      ├─ consulta base de conhecimento (FAQ/catálogo)
                                      ├─ registra/qualifica o lead
                                      └─ handoff → humano (com contexto da conversa)
```

## Funcionalidades

- 🧠 **Compreensão real** — responde quem foge do roteiro, não só botões.
- 📚 **Ancorado no negócio** — usa FAQ/catálogo como fonte; não inventa.
- 🤝 **Handoff inteligente** — detecta quando escalar e entrega contexto ao humano.
- 🔌 **Funciona offline** — sem chave de LLM, cai num matcher por FAQ (o demo roda sem nada).
- 🗂️ **Tudo auditável** — conversas persistidas (Postgres, com fallback em memória).

## Stack

`Node.js` · `TypeScript` · `Fastify` · `WhatsApp Cloud API` · `OpenAI/Claude` · `PostgreSQL` · `Docker`

## Como rodar

```bash
cp .env.example .env        # tudo opcional no demo (sem chave = fallback por FAQ)

# opção 1 — demo offline, sem servidor nem banco:
npm install && npm run demo

# opção 2 — serviço completo:
docker compose up
curl -X POST localhost:3000/webhook -H 'content-type: application/json' \
  -d '{"from":"5531999990000","text":"vocês aceitam pix?"}'
```

> Base de conhecimento e dados sintéticos. Sem números de clientes reais.

## Estrutura

```
src/
  index.ts       # servidor Fastify + webhook (demo e WhatsApp Cloud API)
  agent.ts       # núcleo do agente: resposta ancorada + decisão de handoff
  knowledge.ts   # base de conhecimento do negócio (FAQ) + gatilhos de handoff
  store.ts       # persistência de conversas (Postgres / memória)
  demo.ts        # roda mensagens de exemplo offline
```

## Resultado

Primeira resposta em segundos a qualquer hora, FAQ resolvido sem humano, e o time recebendo
só o que importa — já com contexto.
