// Chaque séance type, et chacune de ses variantes, passe le moteur de vérification (E-16).
// Profil « tout rempli » : aucun avertissement, ni fort ni information, à aucun niveau de détail.
// Le catalogue illustre des règles : si une séance déclenche un avertissement, c'est la séance ou la règle qui est à revoir.
import { describe, expect, it } from 'vitest'
import { fichesDeLaBibliotheque } from '../regles/adaptateur.ts'
import { verifierSeance, type ContexteVerif, type SeanceVerif } from '../regles/index.ts'
import { contexteVerif, seanceDepuisType, seanceVersVerif } from '../regles/passerelles.ts'
import { EXEMPLE_CYCLE, EXEMPLE_PHASES } from './exemplesV2.ts'
import type { Profil, SeancePlanifiee } from './modele.ts'
import { PROFIL_VIDE } from './profil.ts'
import { SEANCES_TYPES, type SeanceType } from './seancesTypes.ts'

const DATE = '2026-11-24'
const MAINTENANT = `${DATE}T08:00:00.000Z`
const FICHES = fichesDeLaBibliotheque()

/** Profil « tout rempli » : tous les prérequis sont remplis, aucune douleur (E-16, étape 1). */
const PROFIL_TOUT_REMPLI: Profil = {
  ...PROFIL_VIDE,
  disciplinePrincipale: 'voie', // ne déclenche pas S-09
  niveauBloc: '7A',
  anneesPratique: 10,
  experiencePoutre: 'reguliere',
  tractionsStrictes: 20,
  tient15sSur25mm: true,
  majeur: true,
  grimpeEnTete: true,
  seancesParSemaine: 3,
  lieux: ['salle_bloc', 'salle_voie', 'maison'],
}

const CONTEXTE: ContexteVerif = contexteVerif({
  profil: PROFIL_TOUT_REMPLI,
  exercicesPerso: [],
  douleurs: [],
  formes: [],
  objectifs: [],
  aujourdhui: DATE,
  maintenant: MAINTENANT,
})

type NiveauSeance = NonNullable<SeancePlanifiee['niveauDetail']>

/** Séance type (ou une de ses variantes) vue par le moteur, datée du 24 novembre 2026. */
function verifiee(st: SeanceType, variante: string | undefined, niveau: NiveauSeance | undefined): SeanceVerif {
  const planifiee = seanceDepuisType(st, variante, {
    id: variante === undefined ? `s-${st.id}` : `s-${st.id}-${variante}`,
    cycleId: EXEMPLE_CYCLE.id,
    phaseId: EXEMPLE_PHASES[0].id,
    semaine: 1,
    date: DATE,
    maintenant: MAINTENANT,
  })
  const avecNiveau: SeancePlanifiee = niveau === undefined ? planifiee : { ...planifiee, niveauDetail: niveau }
  return seanceVersVerif(avecNiveau, FICHES)
}

// Le niveau ne change que l'affichage (R-9) : la boucle est refaite à chaque niveau, défaut compris.
const NIVEAUX: { nom: string; niveau?: NiveauSeance }[] = [
  { nom: 'par défaut' },
  { nom: 'simple', niveau: 'simple' },
  { nom: 'grandes lignes', niveau: 'grandes_lignes' },
]

for (const { nom, niveau } of NIVEAUX) {
  describe(`séances types, niveau ${nom}`, () => {
    for (const st of SEANCES_TYPES) {
      for (const variante of [undefined, ...Object.keys(st.variantes)]) {
        const libelle = variante === undefined ? st.id : `${st.id}, variante ${variante}`
        it(`${libelle} : aucun avertissement`, () => {
          // Le message affiche les codes reçus, pour savoir tout de suite quelle règle a parlé.
          const recus = verifierSeance(verifiee(st, variante, niveau), CONTEXTE).map((a) => `${a.code} (${a.niveau}) : ${a.message}`)
          expect(recus).toEqual([])
        })
      }
    }
  })
}
