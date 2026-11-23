import type { SemainePlan } from '../donnees/modele.ts'

export interface CaseSemaine {
  numero: number // 1 à 12
  type: SemainePlan['type']
  faite: boolean // semaine entièrement passée (calculée par l'écran, jamais stockée)
}

const ETIQUETTE_TYPE: Record<SemainePlan['type'], string> = {
  charge: '', allegee: ', allégée', affutage: ', affûtage', transition: ', transition',
}

// La bande S1 à S12. Chaque case est un bouton : « Semaine 4, allégée ».
// Faite = vert doux, ouverte = encre avec un trait résine en bas, allégée = hachures.
export function BandeSemaines({ semaines, numeroEnCours, numeroOuvert, onChoisir }: {
  semaines: CaseSemaine[]
  numeroEnCours: number | null
  numeroOuvert?: number | null
  onChoisir: (numero: number) => void
}) {
  return (
    <ol className="bande-semaines" aria-label="Les semaines du cycle">
      {semaines.map((s) => {
        const enCours = s.numero === numeroEnCours
        const classes = ['case-semaine']
        if (s.faite) classes.push('faite')
        if (s.type !== 'charge') classes.push('allegee')
        if (s.numero === numeroOuvert) classes.push('ouverte')
        return (
          <li key={s.numero}>
            <button
              type="button"
              className={classes.join(' ')}
              aria-current={enCours ? 'date' : undefined}
              aria-label={`Semaine ${s.numero}${ETIQUETTE_TYPE[s.type]}${s.faite ? ', faite' : ''}${enCours ? ', en cours' : ''}`}
              onClick={() => onChoisir(s.numero)}
            >
              <span aria-hidden="true">{s.numero}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
