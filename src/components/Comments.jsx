import { useCallback, useEffect, useRef, useState } from 'react'
import { formatRelative } from '../lib/time'

const MAX_MESSAGE = 500
const MAX_NAME = 40
const NAME_STORAGE_KEY = 'hugo:name'
const REFRESH_MS = 30_000

export default function Comments() {
  const [comments, setComments] = useState([])
  const [state, setState] = useState('loading') // loading | ready | error
  const [persistent, setPersistent] = useState(true)
  const [name, setName] = useState(() => readStoredName())
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const listTopRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/comments')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Falha ao carregar comentários.')

      setComments(data.comments || [])
      setPersistent(data.persistent !== false)
      setState('ready')
    } catch (loadError) {
      console.error(loadError)
      setState('error')
    }
  }, [])

  useEffect(() => {
    // Busca inicial e refresh periódico: sincronização com a API, não estado derivado.
    // oxlint-disable-next-line react/set-state-in-effect
    load()

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, REFRESH_MS)

    return () => clearInterval(interval)
  }, [load])

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmed = message.trim()
    if (!trimmed || sending) return

    setSending(true)
    setError('')

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: trimmed }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Não foi possível enviar seu comentário.')

      setComments((current) => [data.comment, ...current])
      setPersistent(data.persistent !== false)
      setMessage('')
      storeName(name.trim())
      listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSending(false)
    }
  }

  const remaining = MAX_MESSAGE - message.length

  return (
    <section className="mx-auto w-full max-w-2xl">
      <header className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
        <h2 className="display text-[0.65rem] font-bold uppercase tracking-[0.35em] text-white/70 sm:text-xs">
          Comentários de apoio
        </h2>
        <span className="display text-[0.65rem] font-medium tabular-nums uppercase tracking-[0.25em] text-white/30">
          {state === 'loading' ? '...' : comments.length}
        </span>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_NAME}
          placeholder="SEU NOME (OPCIONAL)"
          aria-label="Seu nome"
          className="display w-full border border-white/15 bg-transparent px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white transition placeholder:text-white/25 focus:border-white/50 focus:outline-none"
        />

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, MAX_MESSAGE))}
          rows={3}
          placeholder="Escreva seu comentário..."
          aria-label="Seu comentário"
          className="w-full resize-y border border-white/15 bg-transparent px-4 py-3 text-sm leading-relaxed text-white transition placeholder:text-white/25 focus:border-white/50 focus:outline-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`display text-[0.6rem] font-medium tabular-nums uppercase tracking-[0.2em] ${
              remaining < 50 ? 'text-white/60' : 'text-white/25'
            }`}
          >
            {message.length}/{MAX_MESSAGE}
          </span>

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="display border border-white bg-white px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-white/30"
          >
            {sending ? 'Enviando' : 'Comentar'}
          </button>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}

        {!persistent && (
          <p className="text-[0.65rem] leading-relaxed text-amber-400/70">
            Sem banco configurado: os comentários estão em memória e desaparecem quando o
            servidor reinicia. Configure as variáveis do Redis para persistir.
          </p>
        )}
      </form>

      <div ref={listTopRef} className="mt-10">
        {state === 'loading' && <Placeholder>Carregando comentários...</Placeholder>}

        {state === 'error' && (
          <Placeholder>
            Não foi possível carregar os comentários.{' '}
            <button
              type="button"
              onClick={load}
              className="underline decoration-white/30 underline-offset-4 transition hover:text-white"
            >
              Tentar de novo
            </button>
          </Placeholder>
        )}

        {state === 'ready' && comments.length === 0 && (
          <Placeholder>Seja o primeiro a comentar</Placeholder>
        )}

        {state === 'ready' && comments.length > 0 && (
          <ul className="divide-y divide-white/10 border-t border-white/10">
            {comments.map((comment) => (
              <li key={comment.id} className="py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
                    {comment.name}
                  </span>
                  <span className="display shrink-0 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/30">
                    {formatRelative(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/70">
                  {comment.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function Placeholder({ children }) {
  return (
    <p className="display border-t border-white/10 py-10 text-center text-[0.65rem] font-medium uppercase tracking-[0.3em] text-white/30">
      {children}
    </p>
  )
}

function readStoredName() {
  try {
    return localStorage.getItem(NAME_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function storeName(value) {
  try {
    if (value) localStorage.setItem(NAME_STORAGE_KEY, value)
  } catch {
    // localStorage bloqueado (janela privada, etc.) — segue sem lembrar o nome.
  }
}
