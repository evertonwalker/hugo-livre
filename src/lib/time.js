const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** "agora", "há 5 min", "há 3 h", "há 2 d" e, acima de 7 dias, a data completa. */
export function formatRelative(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 45) return 'agora'
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)} h`
  if (seconds < 604800) return `há ${Math.floor(seconds / 86400)} d`

  return dateTimeFormatter.format(date)
}

export function formatFullDate(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return dateTimeFormatter.format(date)
}
