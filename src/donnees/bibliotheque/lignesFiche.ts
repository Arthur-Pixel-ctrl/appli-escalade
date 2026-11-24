// Les lignes que le panneau de fiche (O-07) affiche : prérequis un par ligne avec l'état pour toi,
// contexte (terrain, seul ou groupe), limite par semaine, référence d'un exercice personnel.
// Des fonctions pures : le panneau ne fait que les afficher.
import { LIVRES, type ExercicePerso } from '../modele.ts'
import { etatPrerequis } from '../../regles/passerelles.ts'
import type { FicheVerif, ProfilVerif } from '../../regles/types.ts'
import type { Contexte, Prerequis } from './types.ts'

export interface LignePrerequis {
  cle: keyof Prerequis
  phrase: string // « Années de pratique : 1 an demandé · toi : 4 ans »
  rempli: boolean
}

const PAS_RENSEIGNE = 'pas renseigné, compte comme non rempli'
const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

/** Une fiche vide qui ne porte qu'un seul prérequis : on le passe à `etatPrerequis`, la seule comparaison de l'app (C-01). */
function ficheAvecUnPrerequis(prerequis: Prerequis): FicheVerif {
  return {
    id: 'ligne', nom: 'ligne', origine: 'bibliotheque', qualite: 'doigts', dureeMin: 0, marqueurs: [],
    prerequis, contreIndications: [], solliciteDoigts: false,
  }
}

const NOM_POUTRE = { aucune: 'aucune', occasionnelle: 'occasionnelle', reguliere: 'régulière' } as const

/** Un prérequis par ligne, avec son état pour ce profil. Une donnée absente du profil compte comme non remplie, par prudence. */
export function lignesPrerequis(prerequis: Prerequis, profil: ProfilVerif, aujourdhui: string): LignePrerequis[] {
  const rempli = (un: Prerequis) => etatPrerequis(ficheAvecUnPrerequis(un), profil, [], aujourdhui).manques.length === 0
  const lignes: LignePrerequis[] = []
  const ajoute = (cle: keyof Prerequis, phrase: string) => lignes.push({ cle, phrase, rempli: rempli({ [cle]: prerequis[cle] }) })

  if (prerequis.anneesPratiqueMin !== undefined) {
    ajoute('anneesPratiqueMin', `Années de pratique : ${pluriel(prerequis.anneesPratiqueMin, 'an')} demandé${prerequis.anneesPratiqueMin > 1 ? 's' : ''} · toi : ${pluriel(profil.anneesPratique, 'an')}`)
  }
  if (prerequis.experiencePoutreMin !== undefined) {
    ajoute('experiencePoutreMin', `Expérience de poutre : ${NOM_POUTRE[prerequis.experiencePoutreMin]} demandée · toi : ${NOM_POUTRE[profil.experiencePoutre]}`)
  }
  if (prerequis.tractionsStrictesMin !== undefined) {
    const faites = profil.tractionsStrictesMax
    ajoute('tractionsStrictesMin', `Tractions strictes : ${prerequis.tractionsStrictesMin} demandées · toi : ${faites === null ? PAS_RENSEIGNE : faites}`)
  }
  if (prerequis.test15sSur25mm) {
    const etat = profil.test15sSur25mm === null ? PAS_RENSEIGNE : profil.test15sSur25mm ? 'réussi' : 'pas réussi'
    ajoute('test15sSur25mm', `Test 15 s sur 25 mm : à réussir · toi : ${etat}`)
  }
  if (prerequis.niveauBlocMin !== undefined) {
    ajoute('niveauBlocMin', `Niveau en bloc : ${prerequis.niveauBlocMin} demandé · toi : ${profil.niveauBloc ?? PAS_RENSEIGNE}`)
  }
  if (prerequis.adulte) {
    const etat = profil.adulte === null ? PAS_RENSEIGNE : profil.adulte ? 'oui' : 'non'
    ajoute('adulte', `18 ans ou plus : demandé · toi : ${etat}`)
  }
  return lignes
}

/** « Seul », « Se prête au groupe », puis partenaire et tête, chacun sur sa ligne. */
export function lignesContexte(contexte: Contexte | undefined): string[] {
  const lignes = [contexte?.groupe === 'adapte' ? 'Se prête à une séance en groupe' : 'Se fait seul']
  if (contexte?.partenaire) lignes.push('Partenaire nécessaire : assureur ou observateur')
  if (contexte?.grimpeEnTete) lignes.push('Il faut savoir grimper et tomber en tête, avec un assureur formé')
  return lignes
}

export function phraseLimiteSemaine(max: number | undefined): string {
  return max === undefined ? 'Pas de limite propre à cette fiche ; les règles de la semaine s’appliquent' : `${max} fois par semaine au plus`
}

/** Référence d'un exercice personnel : titre complet du livre (constante de code) et page. Rien d'autre du livre. */
export function phraseReference(ref: ExercicePerso['reference']): string | undefined {
  if (ref === undefined) return undefined
  const titre = ref.livre === 'autre' && ref.titreAutre ? ref.titreAutre : LIVRES[ref.livre]
  const page = ref.page?.trim()
  return page ? `${titre}, p. ${page}` : titre
}
