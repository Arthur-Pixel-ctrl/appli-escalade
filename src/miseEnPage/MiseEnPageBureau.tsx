import { BarreBureau } from '../composants/BarreBureau.tsx'
import { EnConstruction } from '../ecrans/EnConstruction.tsx'
import { Historique } from '../ecrans/Historique.tsx'
import { Profil } from '../ecrans/Profil.tsx'
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
  return (
    <div className="bureau">
      <BarreBureau
        rubriques={RUBRIQUES_BUREAU}
        rubrique={rubrique}
        onChoisir={(r) => onChoisirRubrique(r as RubriqueBureau)}
        avecCompte={avecCompte}
        idContenu={ID_CONTENU}
      />
      <div className="bureau-contenu" id={ID_CONTENU} tabIndex={-1}>
        <div className="bureau-conteneur">
          {majPrete && (
            <button className="bandeau" onClick={appliquerMiseAJour}>Nouvelle version disponible · <b>Mettre à jour</b></button>
          )}
          {rubrique === 'Tableau de bord' && (
            <div className="bureau-lecture">
              <EnConstruction
                titre="Tableau de bord"
                texte="Ton plan de la semaine s’affichera ici. Les séances se lancent depuis ton téléphone."
              />
            </div>
          )}
          {rubrique === 'Plan' && (
            <div className="bureau-lecture">
              <EnConstruction titre="Plan" texte="Ici tu construiras ton cycle de 12 semaines, en 3 phases de 4 semaines." />
            </div>
          )}
          {rubrique === 'Bibliothèque' && (
            <div className="bureau-lecture">
              <EnConstruction titre="Bibliothèque" texte="Les 60 protocoles et tes exercices, filtrables." />
            </div>
          )}
          {rubrique === 'Bilans' && <div className="bureau-lecture"><Historique onOuvrir={onOuvrirSeance} /></div>}
          {rubrique === 'Profil' && (
            <div className="bureau-lecture">
              <Profil
                profil={profil}
                onEnregistrer={onEnregistrerProfil}
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
