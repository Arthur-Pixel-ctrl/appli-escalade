import { comptesDisponibles } from '../compte/client.ts'
import { useEnLigne } from '../compte/useEnLigne.ts'
import { Icone } from '../composants/Icone.tsx'
import type { Profil as TypeProfil } from '../donnees/profil.ts'
import { appliquerMiseAJour } from '../miseAJour.ts'
import { Aujourdhui } from '../ecrans/Aujourdhui.tsx'
import { Historique } from '../ecrans/Historique.tsx'
import { Profil } from '../ecrans/Profil.tsx'
import { Programme } from '../ecrans/Programme.tsx'
import type { DemandeLancement } from '../ecrans/lancement.ts'
import { ONGLETS, type Onglet } from './navigation.ts'

// Ce que les deux mises en page demandent à App pour les écrans qu'elles affichent.
export interface ActionsEcrans {
  profil: TypeProfil
  majPrete: boolean
  onOuvrirSeance: (seanceId: string) => void
  onEnregistrerProfil: (p: TypeProfil) => Promise<void>
  onMisesEnGarde: () => void
  onCompte: () => void
  onDonneesImportees: () => void
}

interface Props extends ActionsEcrans {
  onglet: Onglet
  onChoisirOnglet: (onglet: Onglet) => void
  /** Lancer une séance du plan ou une séance libre : l'écran de séance prend alors toute la place. */
  onLancer: (demande: DemandeLancement) => void
}

// Téléphone : on exécute. Contenu de l'onglet + barre d'onglets en bas, colonne de 480 px.
export function MiseEnPageTelephone({
  onglet, onChoisirOnglet, onLancer, profil, majPrete,
  onOuvrirSeance, onEnregistrerProfil, onMisesEnGarde, onCompte, onDonneesImportees,
}: Props) {
  const enLigne = useEnLigne()
  return (
    <div className="app">
      {/* Hors ligne : une simple information en haut, jamais une fenêtre, pour ne rien gêner. Sans comptes, il n'y a rien à envoyer. */}
      {comptesDisponibles && !enLigne && (
        <p className="bandeau hors-ligne" role="status">Hors ligne. Tout est gardé sur cet appareil, l’envoi se fera au retour du réseau.</p>
      )}
      {/* Proposée seulement ici, jamais pendant une séance, pour ne rien faire perdre. */}
      {majPrete && (
        <button className="bandeau" onClick={appliquerMiseAJour}>Nouvelle version disponible · <b>Mettre à jour</b></button>
      )}
      {onglet === 'Aujourd’hui' && (
        <Aujourdhui
          profil={profil}
          onCompte={onCompte}
          onLancer={onLancer}
          onOuvrirSeance={onOuvrirSeance}
          onMisesEnGarde={onMisesEnGarde}
          onVoirProgramme={() => onChoisirOnglet('Programme')}
        />
      )}
      {onglet === 'Bilans' && <Historique onOuvrir={onOuvrirSeance} />}
      {onglet === 'Programme' && <Programme profil={profil} onLancer={onLancer} onOuvrirSeance={onOuvrirSeance} />}
      {onglet === 'Profil' && (
        <Profil
          profil={profil}
          onEnregistrer={onEnregistrerProfil}
          onMisesEnGarde={onMisesEnGarde}
          onCompte={onCompte}
          onDonneesImportees={onDonneesImportees}
        />
      )}
      <nav className="onglets" aria-label="Navigation principale">
        {ONGLETS.map(({ nom, icone }) => (
          <button key={nom} className="onglet" aria-current={nom === onglet ? 'page' : undefined} onClick={() => onChoisirOnglet(nom)}>
            <Icone nom={icone} />
            {nom}
          </button>
        ))}
      </nav>
    </div>
  )
}
