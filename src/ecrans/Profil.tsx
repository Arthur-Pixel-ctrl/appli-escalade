import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { estRepriseDuProfil, exporterDonnees, importerDonnees, jourLocal } from '../donnees/base.ts'
import type { Profil as TypeProfil } from '../donnees/profil.ts'
import { comptesDisponibles } from '../compte/client.ts'
import { useSession } from '../compte/session.ts'
import { Confirmation } from '../composants/Confirmation.tsx'
import { lireDouleursOuvertes, marquerResolue } from '../donnees/douleurs.ts'
import type { DouleurDeclaree } from '../donnees/modele.ts'
import { ZONES } from '../donnees/profil.ts'
import { DeclarerDouleur } from './DeclarerDouleur.tsx'
import { ProfilFormulaire } from './ProfilFormulaire.tsx'

const jourLong = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
// « 2026-11-12 » → « 12 novembre » (jour local : new Date("2026-11-12") serait lu en heure universelle).
const dateLisible = (jour: string) => {
  const [a, m, j] = jour.split('-').map(Number)
  return jourLong.format(new Date(a, m - 1, j))
}

interface Props {
  profil: TypeProfil
  onEnregistrer: (p: TypeProfil) => void
  onMisesEnGarde: () => void
  onDonneesImportees: () => void
  onCompte: () => void
  // Ordinateur seulement (Reglages) : champs en plus dans le formulaire, et sections glissées avant les données.
  bureau?: boolean
  modifieLe?: string
  sectionsEnPlus?: ReactNode
}

// Onglet Profil : le formulaire, les mises en garde et la sauvegarde des données.
export function Profil({ profil, onEnregistrer, onMisesEnGarde, onDonneesImportees, onCompte, bureau, modifieLe, sectionsEnPlus }: Props) {
  const { email, chargement } = useSession()
  const [message, setMessage] = useState('')
  const fichier = useRef<HTMLInputElement>(null)
  // Douleurs déclarées encore ouvertes ; la liste se relit après chaque action.
  const [douleurs, setDouleurs] = useState<DouleurDeclaree[] | null>(null)
  const [erreurDouleurs, setErreurDouleurs] = useState('')
  const [declaration, setDeclaration] = useState(false)
  const [aResoudre, setAResoudre] = useState<DouleurDeclaree | null>(null)
  const relireDouleurs = useCallback(() => {
    lireDouleursOuvertes(jourLocal()).then((d) => { setDouleurs(d); setErreurDouleurs('') }).catch(() => setErreurDouleurs('Tes douleurs n’ont pas pu être lues. Réessaie.'))
  }, [])
  useEffect(relireDouleurs, [relireDouleurs])
  const resoudre = async () => {
    if (!aResoudre) return
    try {
      await marquerResolue(aResoudre.id, jourLocal())
      setAResoudre(null)
      relireDouleurs()
    } catch {
      setAResoudre(null)
      setErreurDouleurs('La douleur n’a pas pu être marquée comme résolue. Réessaie.')
    }
  }

  const exporter = async () => {
    try {
      const lien = document.createElement('a')
      lien.href = URL.createObjectURL(new Blob([await exporterDonnees()], { type: 'application/json' }))
      lien.download = `appli-escalade-${jourLocal()}.json`
      lien.click()
      URL.revokeObjectURL(lien.href)
      // Le navigateur ne dit pas si le fichier a vraiment été enregistré : on ne le prétend pas.
      setMessage('Fichier proposé au téléchargement : vérifie qu’il est bien dans tes fichiers.')
    } catch {
      setMessage('La sauvegarde n’a pas pu être créée. Tes données sont toujours sur cet appareil : réessaie.')
    }
  }
  const importer = async (f: File | undefined) => {
    if (!f) return
    try {
      const { seances, autres, ecartes } = await importerDonnees(await f.text())
      const ecart = ecartes > 0 ? ` ${ecartes} élément${ecartes > 1 ? 's' : ''} du fichier ${ecartes > 1 ? 'ont été écartés' : 'a été écarté'} (identifiant ou contenu trop long).` : ''
      setMessage(`Sauvegarde rechargée : ${seances} séance${seances > 1 ? 's' : ''} et ${autres} autre${autres > 1 ? 's' : ''} élément${autres > 1 ? 's' : ''}.${ecart}`)
      onDonneesImportees()
    } catch (e) {
      setMessage(e instanceof Error ? `Import impossible. ${e.message}` : 'Import impossible : fichier illisible.')
    }
  }

  // Déclarer une douleur : l'écran prend la place du profil (une douleur peut arriver hors séance).
  if (declaration) return <DeclarerDouleur date={jourLocal()} onFini={() => { setDeclaration(false); relireDouleurs() }} />

  return (
    <main className="ecran">
      <ProfilFormulaire initial={profil} titre="Profil" libelleValider="Enregistrer le profil" onValider={onEnregistrer} bureau={bureau} modifieLe={modifieLe} />
      <section className="pile" id="section-douleurs" aria-labelledby="titre-douleurs">
        <h2 id="titre-douleurs" className="sous-titre">Douleurs déclarées</h2>
        <p className="texte-3">Tant qu’elle n’est pas marquée comme résolue, une douleur déclarée compte dans les avertissements de ton plan et du jour.</p>
        {douleurs && douleurs.length === 0 && <p className="texte-2">Aucune douleur déclarée.</p>}
        {douleurs?.map((d) => (
          <div key={d.id} className="pile">
            <p className="texte-2">{ZONES.find((z) => z.valeur === d.zone)?.nom ?? d.zone} · depuis le {dateLisible(d.date)}</p>
            {estRepriseDuProfil(d) && (
              <p className="texte-3">Reprise de ton ancien profil, sans date : datée du jour où tu as créé ton profil, par prudence.</p>
            )}
            <button className="bouton-second" onClick={() => setAResoudre(d)}>Marquer comme résolue</button>
          </div>
        ))}
        {erreurDouleurs && <p className="texte-3" role="alert">{erreurDouleurs}</p>}
        <button className="bouton-second" onClick={() => setDeclaration(true)}>Déclarer une douleur</button>
        <Confirmation
          ouverte={aResoudre !== null}
          titre="Douleur résolue ?"
          texte="Les règles n’en tiendront plus compte à partir d’aujourd’hui."
          libelleAction="Marquer comme résolue"
          onAction={() => { void resoudre() }}
          onRester={() => setAResoudre(null)}
        />
      </section>
      {sectionsEnPlus}
      <section className="pile" id="section-donnees">
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
