import { useEffect, useState } from 'react'
import { DONE_MESSAGE, SUBTITLE, TARGET_DATE, TARGET_DATE_ISO, TITLE } from '../config'
import { getTimeLeft } from '../lib/countdown'
import { formatFullDate } from '../lib/time'
import AvatarCard from './AvatarCard'

const UNITS = [
  { key: 'months', label: 'Meses' },
  { key: 'days', label: 'Dias' },
  { key: 'hours', label: 'Horas' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Seg' },
]

export default function Countdown() {
  const [left, setLeft] = useState(() => getTimeLeft(TARGET_DATE))

  useEffect(() => {
    let timeoutId

    const tick = () => {
      setLeft(getTimeLeft(TARGET_DATE))
      // Reagenda alinhado ao próximo segundo cheio para não acumular atraso.
      timeoutId = setTimeout(tick, 1000 - (Date.now() % 1000))
    }

    timeoutId = setTimeout(tick, 1000 - (Date.now() % 1000))
    return () => clearTimeout(timeoutId)
  }, [])

  const summary = UNITS.map((unit) => `${left[unit.key]} ${unit.label.toLowerCase()}`).join(', ')

  return (
    <section className="flex flex-col items-center text-center">
      <h1 className="display text-balance text-[clamp(1.05rem,4vw,2.5rem)] font-extrabold uppercase leading-[1.12] tracking-[-0.01em] text-white">
        {TITLE}
      </h1>

      <p className="display mt-3 text-[clamp(0.55rem,1.7vw,0.8rem)] font-semibold uppercase tracking-[0.4em] text-white/45">
        {left.done ? DONE_MESSAGE : SUBTITLE}
      </p>

      <AvatarCard />

      {/* O tamanho dos dígitos vive aqui: separadores e espaçamentos usam `em`. */}
      <div
        role="timer"
        aria-label={left.done ? DONE_MESSAGE : `Faltam ${summary}`}
        className="mt-8 flex w-full items-start justify-center text-[clamp(1.7rem,8.4vw,5.75rem)] sm:mt-12"
      >
        {UNITS.map((unit, index) => (
          <div key={unit.key} className="flex items-start">
            {index > 0 && <Separator />}

            <div className="flex flex-col items-center px-[0.2em]">
              <span className="display font-extrabold leading-none tabular-nums text-white">
                {String(left[unit.key]).padStart(2, '0')}
              </span>
              <span className="display mt-2 text-[clamp(0.5rem,1.5vw,0.72rem)] font-semibold uppercase leading-none tracking-[0.28em] text-white/40 sm:mt-4">
                {unit.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <time
        dateTime={TARGET_DATE_ISO}
        className="display mt-10 text-[0.6rem] font-medium uppercase tracking-[0.3em] text-white/25 sm:text-xs"
      >
        {formatFullDate(TARGET_DATE_ISO)}
      </time>
    </section>
  )
}

/** Os dois-pontos entre os grupos. O `mt` está em `em` do próprio separador,
 *  calculado para o glifo ficar centralizado na altura dos dígitos. */
function Separator() {
  return (
    <span
      aria-hidden="true"
      className="display mt-[0.51em] select-none text-[0.42em] font-extrabold leading-none text-white/20"
    >
      :
    </span>
  )
}
