/**
 * Contagem regressiva em meses de calendário + dias/horas/minutos/segundos.
 *
 * Os meses são contados pelo calendário (não em blocos fixos de 30 dias), então
 * "3 meses e 7 dias" bate com o que uma pessoa contaria olhando o calendário.
 */

const MS_DAY = 86_400_000
const MS_HOUR = 3_600_000
const MS_MINUTE = 60_000
const MAX_MONTHS = 1200 // trava de segurança para o laço

export const ZERO = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, done: true }

export function getTimeLeft(target, now = new Date()) {
  const targetMs = target.getTime()
  const nowMs = now.getTime()

  if (!Number.isFinite(targetMs)) return { ...ZERO, done: false, invalid: true }
  if (targetMs <= nowMs) return { ...ZERO }

  // Quantos meses inteiros cabem entre agora e a data alvo.
  let months = 0
  while (months < MAX_MONTHS && addMonths(now, months + 1).getTime() <= targetMs) {
    months += 1
  }

  let rest = targetMs - addMonths(now, months).getTime()

  const days = Math.floor(rest / MS_DAY)
  rest -= days * MS_DAY

  const hours = Math.floor(rest / MS_HOUR)
  rest -= hours * MS_HOUR

  const minutes = Math.floor(rest / MS_MINUTE)
  rest -= minutes * MS_MINUTE

  const seconds = Math.floor(rest / 1000)

  return { months, days, hours, minutes, seconds, done: false }
}

/** Soma meses sempre a partir da data original, limitando o dia ao fim do mês. */
function addMonths(date, count) {
  const day = date.getDate()
  const result = new Date(date.getTime())

  result.setDate(1)
  result.setMonth(result.getMonth() + count)
  result.setDate(Math.min(day, daysInMonth(result.getFullYear(), result.getMonth())))

  return result
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}
