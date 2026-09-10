/**
 * Camada de persistência dos comentários.
 *
 * Em produção usa Redis via API REST (Upstash / Vercel KV) — sem dependências,
 * só `fetch`. Se as variáveis de ambiente não existirem, cai para memória, que
 * serve para desenvolvimento local mas NÃO persiste na Vercel (cada invocação
 * da função pode rodar em uma instância nova e fria).
 */

const KEY = 'hugo:comments'
const MAX_COMMENTS = 500
const RATE_LIMIT = 8 // comentários por minuto, por IP

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

export const usingRedis = Boolean(REST_URL && REST_TOKEN)

async function pipeline(commands) {
  const response = await fetch(`${REST_URL.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands.map((command) => command.map(String))),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = (payload && payload.error) || `HTTP ${response.status}`
    throw new Error(`Redis respondeu com erro: ${detail}`)
  }

  return payload.map((entry) => {
    if (entry && entry.error) throw new Error(`Redis respondeu com erro: ${entry.error}`)
    return entry ? entry.result : null
  })
}

async function command(...args) {
  const [result] = await pipeline([args])
  return result
}

// Fallback em memória. Guardado no globalThis para sobreviver ao hot reload.
const memory = (globalThis.__hugoStore ??= { comments: [], hits: new Map() })

function parse(raw) {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function listComments() {
  if (!usingRedis) return memory.comments.slice(0, MAX_COMMENTS)

  const raw = await command('LRANGE', KEY, 0, MAX_COMMENTS - 1)
  return (raw || []).map(parse).filter(Boolean)
}

export async function addComment({ name, message }) {
  const comment = {
    id: crypto.randomUUID(),
    name,
    message,
    createdAt: new Date().toISOString(),
  }

  if (!usingRedis) {
    memory.comments.unshift(comment)
    memory.comments.length = Math.min(memory.comments.length, MAX_COMMENTS)
    return comment
  }

  await pipeline([
    ['LPUSH', KEY, JSON.stringify(comment)],
    ['LTRIM', KEY, 0, MAX_COMMENTS - 1],
  ])

  return comment
}

export async function clearComments() {
  if (!usingRedis) {
    const removed = memory.comments.length
    memory.comments = []
    return removed
  }

  const removed = await command('LLEN', KEY)
  await command('DEL', KEY)
  return Number(removed) || 0
}

/** Retorna true quando o IP passou do limite e o comentário deve ser recusado. */
export async function isRateLimited(ip) {
  const bucket = `hugo:rate:${ip}:${Math.floor(Date.now() / 60000)}`

  if (!usingRedis) {
    const hits = (memory.hits.get(bucket) || 0) + 1
    memory.hits.set(bucket, hits)
    if (memory.hits.size > 500) memory.hits.clear()
    return hits > RATE_LIMIT
  }

  const [hits] = await pipeline([
    ['INCR', bucket],
    ['EXPIRE', bucket, 120],
  ])

  return Number(hits) > RATE_LIMIT
}
