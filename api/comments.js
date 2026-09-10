import { clientIp, readJsonBody, send } from './_http.js'
import { addComment, clearComments, isRateLimited, listComments, usingRedis } from './_store.js'

const MAX_NAME = 40
const MAX_MESSAGE = 500

/**
 * GET    /api/comments  -> lista os comentários (mais recentes primeiro)
 * POST   /api/comments  -> cria um comentário  { name?, message }
 * DELETE /api/comments  -> apaga tudo (header `x-reset-token`)
 */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const comments = await listComments()
      return send(res, 200, { comments, persistent: usingRedis })
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req)

      if (typeof body.message === 'string' && body.message.length > MAX_MESSAGE) {
        return send(res, 400, {
          error: `O comentário deve ter no máximo ${MAX_MESSAGE} caracteres.`,
        })
      }

      const message = clean(body.message, MAX_MESSAGE)
      const name = clean(body.name, MAX_NAME) || 'Anônimo'

      if (!message) {
        return send(res, 400, { error: 'Escreva um comentário antes de enviar.' })
      }

      if (await isRateLimited(clientIp(req))) {
        return send(res, 429, { error: 'Muitos comentários em pouco tempo. Aguarde um minuto.' })
      }

      const comment = await addComment({ name, message })
      return send(res, 201, { comment, persistent: usingRedis })
    }

    if (req.method === 'DELETE') {
      const expected = process.env.RESET_TOKEN

      if (!expected) {
        return send(res, 403, {
          error: 'Reset desativado: defina a variável de ambiente RESET_TOKEN.',
        })
      }
      if (req.headers['x-reset-token'] !== expected) {
        return send(res, 401, { error: 'Token de reset inválido.' })
      }

      const removed = await clearComments()
      return send(res, 200, { removed })
    }

    res.setHeader('Allow', 'GET, POST, DELETE')
    return send(res, 405, { error: `Método ${req.method} não permitido.` })
  } catch (error) {
    console.error('[api/comments]', error)
    const isBadRequest = error instanceof Error && /JSON inválido|muito grande/.test(error.message)
    return send(res, isBadRequest ? 400 : 500, {
      error: isBadRequest ? error.message : 'Erro ao processar a requisição.',
    })
  }
}

/** Normaliza quebras de linha, remove caracteres de controle e corta no limite. */
function clean(value, maxLength) {
  if (typeof value !== 'string') return ''

  const printable = Array.from(value.replace(/\r\n?/g, '\n'))
    .filter((char) => {
      const code = char.codePointAt(0)
      return char === '\n' || (code > 31 && code !== 127)
    })
    .join('')

  return printable.replace(/\n{3,}/g, '\n\n').trim().slice(0, maxLength)
}
