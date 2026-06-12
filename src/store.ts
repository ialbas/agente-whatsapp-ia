// Persistência de conversas. Usa Postgres se DATABASE_URL estiver setado e acessível;
// senão cai para memória — o demo roda mesmo sem banco.
import pg from 'pg';

export interface Turn { from: string; role: 'user' | 'agent'; text: string; at: string; }

let pool: pg.Pool | null = null;
const mem: Turn[] = [];

export async function initStore(): Promise<'postgres' | 'memory'> {
  const url = process.env.DATABASE_URL;
  if (!url) return 'memory';
  try {
    pool = new pg.Pool({ connectionString: url });
    await pool.query(`CREATE TABLE IF NOT EXISTS turns (
      id BIGSERIAL PRIMARY KEY, sender TEXT NOT NULL, role TEXT NOT NULL,
      text TEXT NOT NULL, at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    return 'postgres';
  } catch (e) {
    console.error('Postgres indisponível, usando memória:', (e as Error).message);
    pool = null;
    return 'memory';
  }
}

export async function saveTurn(t: Turn): Promise<void> {
  if (pool) { await pool.query('INSERT INTO turns (sender, role, text, at) VALUES ($1,$2,$3,$4)', [t.from, t.role, t.text, t.at]); }
  else { mem.push(t); }
}

export async function history(from: string, limit = 10): Promise<Turn[]> {
  if (pool) {
    const r = await pool.query('SELECT sender as "from", role, text, at FROM turns WHERE sender=$1 ORDER BY id DESC LIMIT $2', [from, limit]);
    return r.rows.reverse();
  }
  return mem.filter((t) => t.from === from).slice(-limit);
}
