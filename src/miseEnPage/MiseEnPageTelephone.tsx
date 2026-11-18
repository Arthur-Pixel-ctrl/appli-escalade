import { Icone } from '../composants/Icone.tsx'
import type { Profil as TypeProfil } from '../donnees/profil.ts'
import { appliquerMiseAJour } from '../miseAJour.ts'
import { Aujourdhui } from '../ecrans/Aujourdhui.tsx'
import { EnConstruction } from '../ecrans/EnConstruction.tsx'
import { Historique } from '../ecrans/Historique.tsx'
import { Profil } from '../ecrans/Profil.tsx'
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
  onSeanceSolo: () => void
  onSeanceGroupe: () => void
}

// Téléphone : on exécute. Contenu de l'onglet + barre d'onglets en bas, colonne de 480 px.
export function MiseEnPageTelephone({
  onglet, onChoisirOnglet, onSeanceSolo, onSeanceGroupe, profil, majPrete,
  onOuvrirSeance, onEnregistrerProfil, onMisesEnGarde, onCompte, onDonneesImportees,
}: Props) {
  return (
    <div className="app">
      {/* Proposée seulement ici, jamais pendant une séance, pour ne rien faire perdre. */}
      {majPrete && (
        <button className="bandeau" onClick={appliquerMiseAJour}>Nouvelle version disponible · <b>Mettre à jour</b></button>
      )}
      {onglet === 'Aujourd’hui' && (
        <Aujourdhui grimpeSouventEnGroupe={profil.grimpeSouventEnGroupe} onSeanceSolo={onSeanceSolo} onSeanceGroupe={onSeanceGroupe} />
      )}
      {onglet === 'Bilans' && <Historique onOuvrir={onOuvrirSeance} />}
      {onglet === 'Programme' && <EnConstruction titre="Programme" />}
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
