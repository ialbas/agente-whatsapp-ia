# agente-whatsapp-ia — WhatsApp customer support with AI and human handoff

🇧🇷 [Versão em português](./README.pt-BR.md)

> An agent that answers customers on WhatsApp 24/7, qualifies the request and **hands off to a
> human at the right moment** — no robotic replies and no customer left waiting.

## Problem

Small businesses drown in repeated WhatsApp messages: "what are your hours?", "do you do
this?", "how much is it?". Answering by hand eats hours, and the customer who writes in the
middle of the night waits until the next day — and disappears. A decision-tree bot ("press 1")
annoys people and does not understand anyone who goes off script.

## Solution

An AI agent that **understands natural language**, answers based on the business context,
and recognizes when it should **escalate to a human** (purchase intent, complaint, out-of-scope
case) — handing over the conversation with a summary of what has already been covered.

```
Customer (WhatsApp) → webhook → Agent (LLM + knowledge base) → reply
                                  │
                                  ├─ looks up the knowledge base (FAQ/catalog)
                                  ├─ records/qualifies the lead
                                  └─ handoff → human (with conversation context)
```

## Features

- 🧠 **Real understanding** — answers people who go off script, not just buttons.
- 📚 **Grounded in the business** — uses the FAQ/catalog as its source; does not make things up.
- 🤝 **Smart handoff** — detects when to escalate and gives the human the context.
- 🔌 **Works offline** — with no LLM key it falls back to an FAQ matcher (the demo runs with nothing).
- 🗂️ **Fully auditable** — conversations are persisted (Postgres, with an in-memory fallback).

## Stack

`Node.js` · `TypeScript` · `Fastify` · `WhatsApp Cloud API` · `OpenAI/Claude` · `PostgreSQL` · `Docker`

## How to run

```bash
cp .env.example .env   # everything is optional in the demo (no key = FAQ fallback)

# option 1 — offline demo, no server or database:
npm install && npm run demo

# option 2 — full service:
docker compose up
curl -X POST localhost:3000/webhook -H 'content-type: application/json' \
  -d '{"from":"5531999990000","text":"vocês aceitam pix?"}'
```

> Knowledge base and data are synthetic. No real customer numbers.

## Structure

```
src/
  index.ts      # Fastify server + webhook (demo and WhatsApp Cloud API)
  agent.ts      # agent core: grounded answer + handoff decision
  knowledge.ts  # business knowledge base (FAQ) + handoff triggers
  store.ts      # conversation persistence (Postgres / memory)
  demo.ts       # runs sample messages offline
```

## Outcome

First reply within seconds at any hour, FAQ questions resolved without a human, and the team
receiving only what matters — already with context.
