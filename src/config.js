/**
 * Configuração da contagem regressiva.
 *
 * Para mudar a data, edite a constante abaixo ou defina VITE_TARGET_DATE
 * (no .env.local e/ou nas Environment Variables do projeto na Vercel).
 * Use o formato ISO 8601 com fuso: 2026-09-28T23:59:59-03:00
 *
 * O alvo é o fim do dia 28/09/2026, e não a meia-noite que o inicia, para o
 * contador marcar 18 dias enquanto o dia 28 ainda não terminou.
 */
const DEFAULT_TARGET_DATE = '2026-09-28T23:59:59-03:00'

export const TARGET_DATE_ISO = import.meta.env.VITE_TARGET_DATE || DEFAULT_TARGET_DATE

export const TARGET_DATE = new Date(TARGET_DATE_ISO)

export const TITLE =
  import.meta.env.VITE_TITLE || 'Contagem regressiva para Liberdade de Hugo'

export const SUBTITLE =
  import.meta.env.VITE_SUBTITLE || 'A liberdade está chegando #HugoLivre'

export const DONE_MESSAGE = import.meta.env.VITE_DONE_MESSAGE || 'A liberdade chegou'

/** Nome exibido no card do avatar (src/assets/hugo.png). */
export const AVATAR_LABEL = import.meta.env.VITE_AVATAR_LABEL || 'Hugo'
