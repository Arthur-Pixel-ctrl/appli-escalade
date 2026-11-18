import { useEffect, useState } from 'react'
import { lireSeances, type SeanceRealisee } from '../donnees/base.ts'
import { chargeSeance, lundiDe } from '../donnees/debrief.ts'

const dateCourte = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const jourMois = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const nombre = new Intl.NumberFormat('fr-FR')

// Onglet Bilans : les séances enregistrées, groupées par semaine. Toucher une séance rouvre son débrief.
export function Historique({ onOuvrir }: { onOuvrir: (id: string) => void }) {
  const [seances, setSeances] = useState<SeanceRealisee[] | null>(null)
  const [echec, setEchec] = useState(false)
  useEffect(() => { lireSeances().then(setSeances).catch(() => setEchec(true)) }, [])

  // Du plus récent au plus ancien, puis regroupées par lundi (l'ordre des groupes suit celui des séances).
  const groupes = new Map<string, SeanceRealisee[]>()
  for (const s of [...(seances ?? [])].sort((a, b) => b.creeLe.localeCompare(a.creeLe))) {
    const lundi = lundiDe(s.date)
    groupes.set(lundi, [...(groupes.get(lundi) ?? []), s])
  }

  return (
    <main className="ecran" aria-busy={seances === null && !echec}>
      <div className="pile">
        <h1 className="titre">Bilans</h1>
        {seances === null && !echec ? (
          <>
            <p className="pour-lecteur" role="status">Chargement…</p>
            <div className="silhouette ligne-silhouette" />
            <div className="silhouette ligne-silhouette" />
            <div className="silhouette ligne-silhouette" />
          </>
        ) : (
          <p className="texte-2">
            {echec ? 'Les séances n’ont pas pu être lues. Ferme complètement l’app puis rouvre-la.'
              : seances!.length === 0 ? 'Aucune séance enregistrée pour l’instant. Termine une séance pour la retrouver ici.'
              : 'Tes séances enregistrées, de la plus récente à la plus ancienne.'}
          </p>
        )}
      </div>
      {[...groupes].map(([lundi, duGroupe]) => (
        <section key={lundi} className="pile">
          <h2 className="mention">
            Semaine du {jourMois.format(new Date(`${lundi}T12:00:00`))} · charge {nombre.format(duGroupe.reduce((total, s) => total + chargeSeance(s), 0))}
          </h2>
          <div>
            {duGroupe.map((s) => (
              <button key={s.id} className="ligne haute" onClick={() => onOuvrir(s.id)}>
                <span>{s.nom}<small>{dateCourte.format(new Date(s.creeLe))} · {s.mode === 'groupe' ? 'en groupe' : 'seul'}</small></span>
                <span className="chiffres">charge {nombre.format(chargeSeance(s))}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
