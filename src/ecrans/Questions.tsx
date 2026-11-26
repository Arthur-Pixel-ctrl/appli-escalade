import { useState } from 'react'
import { Avertissement } from '../composants/Avertissement.tsx'
import { jourLocal, type SeanceRealisee } from '../donnees/base.ts'
import { DeclarerDouleur } from './DeclarerDouleur.tsx'

type Reponses = Pick<SeanceRealisee, 'effortPercu' | 'peau' | 'douleur'>

const PEAU: { valeur: 1 | 2 | 3; nom: string }[] = [
  { valeur: 1, nom: 'Abîmée' },
  { valeur: 2, nom: 'Limite' },
  { valeur: 3, nom: 'Bonne' },
]

// Fin de séance, premier temps : trois questions, une touche chacune.
// `douleurInitiale` : la douleur est déjà signalée (arrivée par « Stop, ça fait mal »), la question est pré-remplie.
export function Questions({ contexte, onValider, erreur, douleurInitiale }: {
  contexte: string
  onValider: (r: Reponses) => void
  erreur?: string
  douleurInitiale?: boolean
}) {
  const [effort, setEffort] = useState<number | null>(null)
  const [peau, setPeau] = useState<1 | 2 | 3 | null>(null)
  const [douleur, setDouleur] = useState<boolean | null>(douleurInitiale ?? null)
  // La précision de la douleur remplace l'écran sur place : les trois réponses restent dans l'état.
  const [precision, setPrecision] = useState(false)
  const complet = effort !== null && peau !== null && douleur !== null

  if (precision) return <DeclarerDouleur date={jourLocal()} onFini={() => setPrecision(false)} />

  return (
    <main className="ecran">
      <div className="pile">
        <p className="surtitre">{contexte}</p>
        <h1 className="titre moyen">Trois questions</h1>
      </div>

      <fieldset className="question">
        <legend>La séance était dure comment ?</legend>
        <div className="choix cinq">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} className="chiffres" aria-pressed={effort === n} onClick={() => setEffort(n)}>{n}</button>
          ))}
        </div>
        <p className="texte-3">1 = très facile · 10 = à fond du début à la fin</p>
      </fieldset>

      <fieldset className="question">
        <legend>État de la peau</legend>
        <div className="choix trois">
          {PEAU.map((p) => (
            <button key={p.valeur} aria-pressed={peau === p.valeur} onClick={() => setPeau(p.valeur)}>{p.nom}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className="question">
        <legend>Une douleur aux doigts, coudes ou épaules ?</legend>
        <div className="choix deux">
          <button aria-pressed={douleur === false} onClick={() => setDouleur(false)}>Non, rien</button>
          <button aria-pressed={douleur === true} onClick={() => setDouleur(true)}>Oui</button>
        </div>
        {douleur === true && <button className="bouton-second" onClick={() => setPrecision(true)}>Préciser la douleur (facultatif)</button>}
      </fieldset>

      {/* Les réponses ne sont pas perdues : elles restent dans l'état de l'écran. */}
      <div className="pile bas">
        {erreur && <Avertissement niveau="arret" titre={erreur} />}
        <button
          className="bouton principal centre"
          disabled={!complet}
          aria-describedby={complet ? undefined : 'aide-questions'}
          onClick={() => complet && onValider({ effortPercu: effort, peau, douleur })}
        >
          <strong>{erreur ? 'Réessayer l’enregistrement' : 'Enregistrer et voir le débrief'}</strong>
        </button>
        {/* Dit pourquoi le bouton est grisé ; disparaît dès que tout est rempli. */}
        {!complet && <p id="aide-questions" className="texte-3">Réponds aux trois questions pour continuer.</p>}
      </div>
    </main>
  )
}
