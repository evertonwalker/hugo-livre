/**
 * Helpers de request/response escritos só com APIs nativas do Node, para que o
 * mesmo handler rode como Serverless Function na Vercel e como middleware do
 * servidor de desenvolvimento do Vite.
 */

export function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export async function readJsonBody(req) {
  // Na Vercel o body já vem parseado; no Vite dev precisamos ler o stream.
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return safeParse(req.body)

  const chunks = []
  let size = 0

  for await (const chunk of req) {
    size += chunk.length
    if (size > 32 * 1024) throw new Error('Corpo da requisição muito grande')
    chunks.push(chunk)
  }

  if (!chunks.length) return {}
  return safeParse(Buffer.concat(chunks).toString('utf8'))
}

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('JSON inválido')
  }
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'desconhecido'
}
