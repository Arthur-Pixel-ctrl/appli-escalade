import { useState } from 'react'
import { BarreBureau } from '../composants/BarreBureau.tsx'
import { Bibliotheque } from '../ecrans/bureau/Bibliotheque.tsx'
import { Historique } from '../ecrans/Historique.tsx'
import { Plan } from '../ecrans/bureau/Plan.tsx'
import { Reglages } from '../ecrans/bureau/Reglages.tsx'
import { TableauDeBord } from '../ecrans/bureau/TableauDeBord.tsx'
import { appliquerMiseAJour } from '../miseAJour.ts'
import type { ActionsEcrans } from './MiseEnPageTelephone.tsx'
import { RUBRIQUES_BUREAU, type RubriqueBureau } from './navigation.ts'

const ID_CONTENU = 'contenu-bureau'

interface Props extends ActionsEcrans {
  rubrique: RubriqueBureau
  onChoisirRubrique: (rubrique: RubriqueBureau) => void
  avecCompte: boolean
}

// Ordinateur pour organiser, téléphone pour exécuter : aucune séance ne se lance d'ici (R-6).
export function MiseEnPageBureau({
  rubrique, onChoisirRubrique, avecCompte, profil, majPrete,
  onOuvrirSeance, onEnregistrerProfil, onMisesEnGarde, onCompte, onDonneesImportees,
}: Props) {
  // Semaine demandée par le Tableau de bord ; oubliée dès qu'on choisit une rubrique par la barre du haut.
  const [semaineDemandee, setSemaineDemandee] = useState<number | undefined>(undefined)
  return (
    <div className="bureau">
      <BarreBureau
        rubriques={RUBRIQUES_BUREAU}
        rubrique={rubrique}
        onChoisir={(r) => { setSemaineDemandee(undefined); onChoisirRubrique(r as RubriqueBureau) }}
        avecCompte={avecCompte}
        idContenu={ID_CONTENU}
      />
      <div className="bureau-contenu" id={ID_CONTENU} tabIndex={-1}>
        <div className="bureau-conteneur">
          {majPrete && (
            <button className="bandeau" onClick={appliquerMiseAJour}>Nouvelle version disponible · <b>Mettre à jour</b></button>
          )}
          {rubrique === 'Tableau de bord' && (
            <div className="bureau-tableau">
              <TableauDeBord
                onOuvrirSemaine={(numero) => { setSemaineDemandee(numero); onChoisirRubrique('Plan') }}
                onOuvrirPlan={() => { setSemaineDemandee(undefined); onChoisirRubrique('Plan') }}
                onOuvrirBilans={() => onChoisirRubrique('Bilans')}
                onOuvrirProfil={() => onChoisirRubrique('Profil')}
              />
            </div>
          )}
          {rubrique === 'Plan' && (
            <div className="bureau-plan"><Plan onOuvrirProfil={() => onChoisirRubrique('Profil')} semaineInitiale={semaineDemandee} /></div>
          )}
          {rubrique === 'Bibliothèque' && (
            <div className="bureau-bibliotheque"><Bibliotheque /></div>
          )}
          {rubrique === 'Bilans' && <div className="bureau-lecture"><Historique onOuvrir={onOuvrirSeance} /></div>}
          {rubrique === 'Profil' && (
            <div className="bureau-reglages">
              <Reglages
                profil={profil}
                onEnregistrerProfil={onEnregistrerProfil}
                onMisesEnGarde={onMisesEnGarde}
                onCompte={onCompte}
                onDonneesImportees={onDonneesImportees}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
