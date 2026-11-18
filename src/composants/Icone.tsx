import type { ReactElement } from 'react'
import {
  BookOpen, Books, CalendarBlank, CaretRight, ChartLineUp, ChatCircleText, CloudCheck, CloudSlash,
  DotsSixVertical, Funnel, HandPalm, Info, Key, MagnifyingGlass, Plus, Sun, Timer, User, UserCircle,
  UsersThree, Warning, X,
} from '@phosphor-icons/react'

export type NomIcone =
  | 'aujourdhui' | 'programme' | 'bilans' | 'profil' | 'bibliotheque' | 'assistant' | 'chrono'
  | 'avertissement' | 'arret' | 'information' | 'hors-ligne' | 'synchronise' | 'glisser' | 'ajouter'
  | 'fermer' | 'source' | 'groupe' | 'solo' | 'filtre' | 'recherche' | 'cle' | 'suivant'
  | 'prise' | 'poutre' | 'vis'

// Icônes maison : même trait que Phosphor (2 px, bouts arrondis, couleur du texte autour).
const traitMaison = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const iconesMaison: Record<'prise' | 'poutre' | 'vis', ReactElement> = {
  // forme irrégulière de prise avec un rond au centre
  prise: (
    <>
      <path d="M5 13c-1-4 2-8 7-8s8 3 7 8c-1 4-4 6-8 6s-5-2-6-6z" {...traitMaison} />
      <circle cx="12" cy="12" r="2" {...traitMaison} />
    </>
  ),
  // barre arrondie avec trois creux en haut
  poutre: <path d="M5 8h1a1.5 1.5 0 0 0 3 0h1.5a1.5 1.5 0 0 0 3 0H15a1.5 1.5 0 0 0 3 0h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" {...traitMaison} />,
  // cercle avec une fente
  vis: (
    <>
      <circle cx="12" cy="12" r="8" {...traitMaison} />
      <path d="M8.5 12h7" {...traitMaison} />
    </>
  ),
}

const iconesPhosphor = {
  aujourdhui: Sun, programme: CalendarBlank, bilans: ChartLineUp, profil: User, bibliotheque: Books,
  assistant: ChatCircleText, chrono: Timer, avertissement: Warning, arret: HandPalm, information: Info,
  'hors-ligne': CloudSlash, synchronise: CloudCheck, glisser: DotsSixVertical, ajouter: Plus, fermer: X,
  source: BookOpen, groupe: UsersThree, solo: UserCircle, filtre: Funnel, recherche: MagnifyingGlass,
  cle: Key, suivant: CaretRight,
} as const

// Sans libellé l'icône est décorative (cachée aux lecteurs d'écran) ; avec libellé elle porte un sens.
export function Icone({ nom, taille = 24, libelle }: { nom: NomIcone; taille?: number; libelle?: string }) {
  const accessibilite = libelle ? { role: 'img' as const, 'aria-label': libelle } : { 'aria-hidden': true as const }
  if (nom === 'prise' || nom === 'poutre' || nom === 'vis') {
    return (
      <svg width={taille} height={taille} viewBox="0 0 24 24" focusable="false" {...accessibilite}>
        {iconesMaison[nom]}
      </svg>
    )
  }
  const Composant = iconesPhosphor[nom]
  return <Composant size={taille} weight="bold" {...accessibilite} />
}
