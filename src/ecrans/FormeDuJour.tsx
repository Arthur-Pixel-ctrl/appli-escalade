import { useEffect, useRef, useState } from 'react'
import { Avertissement } from '../composants/Avertissement.tsx'
import { enregistrerForme } from '../donnees/formes.ts'
import type { DateISO, FormeDuJour as Forme, Note5 } from '../donnees/modele.ts'

type Cle = 'sommeil' | 'fatigue' | 'courbatures' | 'douleur' | 'peau'

// Toujours 1 = mauvais, 5 = bon : un voyant « rouge » est un 1 ou un 2.
const QUESTIONS: { cle: Cle; titre: string; aide: string }[] = [
  { cle: 'sommeil', titre: 'Sommeil cette nuit', aide: '1 = très mauvais · 5 = très bon' },
  { cle: 'fatigue', titre: 'Fatigue', aide: '1 = épuisé · 5 = reposé' },
  { cle: 'courbatures', titre: 'Courbatures', aide: '1 = fortes · 5 = aucune' },
  { cle: 'douleur', titre: 'Douleur', aide: '1 = forte · 5 = aucune' },
  { cle: 'peau', titre: 'Peau des doigts', aide: '1 = abîmée · 5 = en bon état' },
]
const NOTES: Note5[] = [1, 2, 3, 4, 5]

type Reponses = Partial<Record<Cle, Note5>>

/** Heures saisies (virgule acceptée) : `undefined` si vide, `null` si hors de 0 à 14. */
function lireHeures(texte: string): number | undefined | null {
  const propre = texte.trim().replace(',', '.')
  if (propre === '') return undefined
  const n = Number(propre)
  return Number.isFinite(n) && n >= 0 && n <= 14 ? n : null
}

// Le matin, en 30 secondes : cinq notes et, si on veut, les heures de sommeil. Alimente les contrôles du jour.
export function FormeDuJour({ date, initiale, onFini }: { date: DateISO; initiale?: Forme; onFini: () => void }) {
  const [reponses, setReponses] = useState<Reponses>(() => initiale
    ? { sommeil: initiale.sommeil, fatigue: initiale.fatigue, courbatures: initiale.courbatures, douleur: initiale.douleur, peau: initiale.peau }
    : {})
  const [heures, setHeures] = useState(initiale?.heuresSommeil !== undefined ? String(initiale.heuresSommeil).replace('.', ',') : '')
  const [erreurHeures, setErreurHeures] = useState(false)
  const [echec, setEchec] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const titre = useRef<HTMLHeadingElement>(null)
  const champ = useRef<HTMLInputElement>(null)
  // Le titre prend le focus à l'ouverture : le lecteur d'écran annonce le nouvel écran.
  useEffect(() => { titre.current?.focus() }, [])

  const { sommeil, fatigue, courbatures, douleur, peau } = reponses
  const complet = sommeil !== undefined && fatigue !== undefined && courbatures !== undefined && douleur !== undefined && peau !== undefined

  async function enregistrer() {
    if (!complet || enCours) return
    const h = lireHeures(heures)
    if (h === null) {
      setErreurHeures(true)
      champ.current?.focus()
      return
    }
    setErreurHeures(false)
    setEchec(false)
    setEnCours(true)
    try {
      await enregistrerForme({ date, sommeil, fatigue, courbatures, douleur, peau, ...(h !== undefined ? { heuresSommeil: h } : {}) })
      onFini()
    } catch {
      // Les réponses restent dans l'écran.
      setEchec(true)
      setEnCours(false)
    }
  }

  return (
    <main className="ecran" aria-labelledby="titre-forme">
      <div className="pile">
        <p className="surtitre">30 secondes</p>
        <h1 ref={titre} tabIndex={-1} id="titre-forme" className="titre moyen">Forme du jour</h1>
      </div>

      {QUESTIONS.map(({ cle, titre: question, aide }) => (
        <fieldset key={cle} className="question">
          <legend>{question}</legend>
          <div className="choix cinq">
            {NOTES.map((n) => (
              <button
                key={n}
                type="button"
                className="chiffres"
                aria-pressed={reponses[cle] === n}
                onClick={() => setReponses({ ...reponses, [cle]: n })}
              >{n}</button>
            ))}
          </div>
          <p className="texte-3">{aide}</p>
        </fieldset>
      ))}

      <div className="pile">
        <label htmlFor="heures-sommeil" className="mention">Heures de sommeil (facultatif)</label>
        <input
          ref={champ}
          id="heures-sommeil"
          className="champ"
          inputMode="decimal"
          value={heures}
          aria-invalid={erreurHeures}
          aria-describedby={erreurHeures ? 'erreur-heures' : undefined}
          onChange={(e) => { setHeures(e.target.value); setErreurHeures(false) }}
        />
        {erreurHeures && <p id="erreur-heures" className="texte-3" role="alert">Entre 0 et 14 h.</p>}
      </div>

      <div className="pile bas">
        {echec && <Avertissement niveau="avertissement" titre="La forme du jour n'a pas été enregistrée. Réessaie." />}
        <button
          className="bouton principal centre"
          disabled={!complet}
          aria-describedby={complet ? undefined : 'aide-forme'}
          onClick={() => { void enregistrer() }}
        >
          <strong>Enregistrer</strong>
        </button>
        {!complet && <p id="aide-forme" className="texte-3">Réponds aux cinq questions pour enregistrer.</p>}
        <button className="bouton-texte" onClick={onFini}>Plus tard</button>
      </div>
    </main>
  )
}
