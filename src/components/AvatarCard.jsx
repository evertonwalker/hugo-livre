import avatar from '../assets/hugo.png'
import { AVATAR_LABEL } from '../config'

/**
 * Card com a foto em avatar redondo. A imagem tem 144x139, então o avatar não
 * passa de 72px para continuar nítido em telas 2x.
 */
export default function AvatarCard() {
  return (
    <div className="mt-7 inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/[0.03] p-1.5 pr-6">
      <img
        src={avatar}
        alt={`Foto de ${AVATAR_LABEL}`}
        width={144}
        height={139}
        className="size-16 rounded-full object-cover object-center ring-1 ring-white/15 sm:size-[72px]"
      />
      <span className="display text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/80 sm:text-[0.8rem]">
        {AVATAR_LABEL}
      </span>
    </div>
  )
}
