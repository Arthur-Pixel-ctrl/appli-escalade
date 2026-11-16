import { useEffect, useState } from 'react'
import { base, type SeanceRealisee } from '../donnees/base.ts'
import { chargeSeance } from '../donnees/debrief.ts'

const dateCourte = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const nombre = new Intl.NumberFormat('fr-FR')

// Onglet Bilans, première version : la liste des séances enregistrées. Toucher une séance rouvre son débrief.
export function Historique({ onOuvrir }: { onOuvrir: (id: string) => void }) {
  const [seances, setSeances] = useState<SeanceRealisee[] | null>(null)
  useEffect(() => { void base.seancesRealisees.orderBy('date').reverse().toArray().then(setSeances) }, [])

  return (
    <main className="ecran">
      <div className="pile">
        <h1 className="titre">Bilans</h1>
        <p className="texte-2">
          {seances === null ? 'Chargement…'
            : seances.length === 0 ? 'Aucune séance enregistrée pour l’instant. Termine une séance pour la retrouver ici.'
            : 'Tes séances enregistrées, de la plus récente à la plus ancienne.'}
        </p>
      </div>
      {seances && seances.length > 0 && (
        <div>
          {[...seances].sort((a, b) => b.creeLe.localeCompare(a.creeLe)).map((s) => (
            <button key={s.id} className="ligne haute" onClick={() => onOuvrir(s.id)}>
              <span>{s.nom}<small>{dateCourte.format(new Date(s.creeLe))} · {s.mode === 'groupe' ? 'en groupe' : 'seul'}</small></span>
              <span className="chiffres">charge {nombre.format(chargeSeance(s))}</span>
            </button>
          ))}
        </div>
      )}
    </main>
  )
}
