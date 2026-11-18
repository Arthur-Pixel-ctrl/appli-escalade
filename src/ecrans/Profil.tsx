import { useRef, useState } from 'react'
import { exporterDonnees, importerDonnees, jourLocal } from '../donnees/base.ts'
import type { Profil as TypeProfil } from '../donnees/profil.ts'
import { comptesDisponibles } from '../compte/client.ts'
import { useSession } from '../compte/session.ts'
import { ProfilFormulaire } from './ProfilFormulaire.tsx'

interface Props {
  profil: TypeProfil
  onEnregistrer: (p: TypeProfil) => void
  onMisesEnGarde: () => void
  onDonneesImportees: () => void
  onCompte: () => void
}

// Onglet Profil : le formulaire, les mises en garde et la sauvegarde des données.
export function Profil({ profil, onEnregistrer, onMisesEnGarde, onDonneesImportees, onCompte }: Props) {
  const { email, chargement } = useSession()
  const [message, setMessage] = useState('')
  const fichier = useRef<HTMLInputElement>(null)

  const exporter = async () => {
    const lien = document.createElement('a')
    lien.href = URL.createObjectURL(new Blob([await exporterDonnees()], { type: 'application/json' }))
    lien.download = `appli-escalade-${jourLocal()}.json`
    lien.click()
    URL.revokeObjectURL(lien.href)
    setMessage('Sauvegarde créée dans tes téléchargements.')
  }
  const importer = async (f: File | undefined) => {
    if (!f) return
    try {
      const { seances, autres } = await importerDonnees(await f.text())
      setMessage(`Sauvegarde rechargée : ${seances} séance${seances > 1 ? 's' : ''} et ${autres} autre${autres > 1 ? 's' : ''} élément${autres > 1 ? 's' : ''}.`)
      onDonneesImportees()
    } catch (e) {
      setMessage(e instanceof Error ? `Import impossible. ${e.message}` : 'Import impossible : fichier illisible.')
    }
  }

  return (
    <main className="ecran">
      <ProfilFormulaire initial={profil} titre="Profil" libelleValider="Enregistrer le profil" onValider={onEnregistrer} />
      <section className="pile">
        <h2 className="sous-titre">À savoir et données</h2>
        {/* Sans compte (et seulement si les comptes existent) : dire ce que ça change, sans insister. */}
        {comptesDisponibles && !chargement && !email && (
          <div className="pile">
            <p className="texte-2">Tu n’as pas de compte. Ton plan d’ordinateur ne peut pas arriver ici.</p>
            <button className="bouton-second" onClick={onCompte}>Recevoir mon code de connexion</button>
          </div>
        )}
        <div>
          {/* Sans configuration Supabase, la ligne n'apparaît pas : l'app reste sans compte. */}
          {comptesDisponibles && <button className="ligne" onClick={onCompte}><span>Compte</span><span>{email ?? 'Pas de compte'}</span></button>}
          <button className="ligne" onClick={onMisesEnGarde}><span>Mises en garde</span><span>Les douleurs à repérer</span></button>
          <button className="ligne" onClick={exporter}><span>Sauvegarder mes données</span><span>Créer un fichier</span></button>
          <button className="ligne" onClick={() => fichier.current?.click()}><span>Recharger une sauvegarde</span><span>Choisir un fichier</span></button>
        </div>
        <input ref={fichier} type="file" accept="application/json,.json" hidden aria-label="Fichier de sauvegarde" onChange={(e) => { void importer(e.target.files?.[0]); e.target.value = '' }} />
        <p className="texte-3" role="status" aria-live="polite">{message || (email ? 'Tes données sont aussi copiées sur ton compte.' : 'Tes données restent sur cet appareil. Fais une sauvegarde de temps en temps : vider les données du navigateur les efface.')}</p>
        <p className="texte-3">Version du {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(__VERSION__))}</p>
      </section>
    </main>
  )
}
