import { useEffect, useRef, useState } from 'react'
import { Avertissement } from '../composants/Avertissement.tsx'
import { CONDUITE_REDUCTION, SIGNES_ARRET, declarerDouleur } from '../donnees/douleurs.ts'
import type { DateISO } from '../donnees/modele.ts'
import { ZONES, type ZoneDouleur } from '../donnees/profil.ts'

// Préciser une douleur : une zone, puis des signes à cocher. Aucun champ de texte, aucun diagnostic.
// Après l'enregistrement : soit « arrête et consulte » (au moins un signe), soit « allège » (aucun).
export function DeclarerDouleur({ date, onFini }: { date: DateISO; onFini: () => void }) {
  const [zone, setZone] = useState<ZoneDouleur | null>(null)
  const [signes, setSignes] = useState<string[]>([])
  const [enregistree, setEnregistree] = useState<'alerte' | 'reduction' | null>(null)
  const [echec, setEchec] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const titre = useRef<HTMLHeadingElement>(null)
  // Le titre prend le focus à l'ouverture et après l'enregistrement : le lecteur d'écran annonce le changement.
  useEffect(() => { titre.current?.focus() }, [enregistree])

  async function enregistrer() {
    if (zone === null || enCours) return
    setEchec(false)
    setEnCours(true)
    try {
      const d = await declarerDouleur({ date, zone, signes })
      setEnregistree(d.niveau)
    } catch {
      // Les choix restent dans l'écran.
      setEchec(true)
    }
    setEnCours(false)
  }
  const basculer = (s: string) => setSignes((actuels) => (actuels.includes(s) ? actuels.filter((x) => x !== s) : [...actuels, s]))

  if (enregistree) {
    return (
      <main className="ecran" aria-labelledby="titre-douleur">
        <div className="pile">
          <h1 ref={titre} tabIndex={-1} id="titre-douleur" className="titre moyen">Douleur enregistrée</h1>
        </div>
        {enregistree === 'alerte'
          ? <Avertissement niveau="arret" titre="Arrête la séance et consulte un médecin ou un kiné qui connaît l’escalade." />
          : <Avertissement niveau="avertissement" titre="Allège pendant 1 à 2 semaines">{CONDUITE_REDUCTION}</Avertissement>}
        <div className="pile bas">
          <button className="bouton principal centre" onClick={onFini}><strong>Continuer</strong></button>
        </div>
      </main>
    )
  }

  return (
    <main className="ecran" aria-labelledby="titre-douleur">
      <div className="pile">
        <h1 ref={titre} tabIndex={-1} id="titre-douleur" className="titre moyen">Préciser la douleur</h1>
      </div>

      <fieldset className="question">
        <legend>Où ?</legend>
        <div className="choix trois">
          {ZONES.map((z) => (
            <button key={z.valeur} type="button" aria-pressed={zone === z.valeur} onClick={() => setZone(z.valeur)}>{z.nom}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className="question">
        <legend>As-tu un de ces signes ?</legend>
        {SIGNES_ARRET.map((s) => (
          <label key={s} className="case">
            <input type="checkbox" checked={signes.includes(s)} onChange={() => basculer(s)} />
            <span>{s}</span>
          </label>
        ))}
        <p className="texte-3">Coche seulement ce que tu as remarqué.</p>
      </fieldset>

      <div className="pile bas">
        {echec && <Avertissement niveau="avertissement" titre="Ta douleur n’a pas été enregistrée. Réessaie." />}
        <button
          className="bouton principal centre"
          disabled={zone === null || enCours}
          aria-describedby={zone === null ? 'aide-douleur' : undefined}
          onClick={() => { void enregistrer() }}
        >
          <strong>Enregistrer la douleur</strong>
        </button>
        {zone === null && <p id="aide-douleur" className="texte-3">Choisis la zone pour enregistrer.</p>}
        <button className="bouton-texte" onClick={onFini}>Annuler</button>
      </div>
    </main>
  )
}
