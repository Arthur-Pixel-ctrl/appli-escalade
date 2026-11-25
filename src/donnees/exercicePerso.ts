// Création d'un exercice personnel (écran O-08) : la logique du formulaire, sans affichage.
// Le formulaire garde ses champs en texte (c'est ce que l'utilisateur tape) ; ce fichier les valide
// puis les traduit au format `ExercicePerso` enregistré par `enregistrerExercicePerso`.
import type { ConfigChrono } from '../chrono/sequence.ts'
import type { Contexte, Marqueur, Qualite } from './bibliotheque/types.ts'
import { LIVRES, type ExercicePerso, type LivreReference } from './modele.ts'
import type { ZoneDouleur } from './profil.ts'

// ——— Questions de sécurité ———

export type Reponse = 'oui' | 'non' | 'je_ne_sais_pas'

export interface ReponsesSecurite {
  effortMaximal: Reponse // « Effort maximal des doigts ? »
  poutre: Reponse // « Sur poutre ? »
  blocLimite: Reponse // « Bloc à ta limite ? » (règle S-19)
  arqueOuTrous: Reponse // « Arqué ou trous ? »
  bidoigts: Reponse // « Bidoigts ? » (séparée le 25/11 : S-18 à tort sur un arqué maximal)
  sansPieds: Reponse // « Sans pieds au pan ? »
}

/** Par prudence, tout démarre à « Je ne sais pas » : il faut dire « Non » pour lever un marqueur. */
export const REPONSES_PRUDENTES: ReponsesSecurite = {
  effortMaximal: 'je_ne_sais_pas', poutre: 'je_ne_sais_pas', blocLimite: 'je_ne_sais_pas',
  arqueOuTrous: 'je_ne_sais_pas', bidoigts: 'je_ne_sais_pas', sansPieds: 'je_ne_sais_pas',
}

// « Je ne sais pas » compte comme « oui » : un marqueur de trop avertit, un marqueur oublié met en danger.
const compteCommeOui = (r: Reponse): boolean => r !== 'non'

/** Les réponses aux questions de sécurité, traduites en marqueurs que les règles savent lire. */
export function marqueursDepuisReponses(r: ReponsesSecurite): Marqueur[] {
  const marqueurs: Marqueur[] = []
  const effort = compteCommeOui(r.effortMaximal)
  const poutre = compteCommeOui(r.poutre)
  if (effort) marqueurs.push('maximale')
  if (poutre) marqueurs.push('poutre')
  if (poutre && effort) marqueurs.push('poutre_intensive')
  if (compteCommeOui(r.blocLimite)) marqueurs.push('bloc_limite')
  if (compteCommeOui(r.arqueOuTrous)) marqueurs.push('arque', 'trou')
  // Seule la réponse de l'utilisateur dit si l'exercice est en bidoigts : sans réponse, on pose le marqueur.
  if (compteCommeOui(r.bidoigts)) marqueurs.push('bidoigts')
  if (compteCommeOui(r.sansPieds)) marqueurs.push('pan_gullich')
  return marqueurs
}

/** Les zones proposées pour « déconseillé en cas de douleur » (O-08). */
export const ZONES_PROPOSEES: ZoneDouleur[] = ['doigts', 'poignet', 'coude', 'epaule', 'genou', 'dos']

// ——— Le brouillon du formulaire ———

export type FormeChoisie = 'chrono' | 'liste' | 'essais'
export type GabaritSimple = Extract<ConfigChrono['gabarit'], 'repetition_unique' | 'depart_minute' | 'intermittent'>

export interface BrouillonExercice {
  nom: string
  qualite: Qualite | ''
  forme: FormeChoisie | ''
  // Chrono (nombres tapés en secondes ou en unités, gardés en texte)
  gabarit: GabaritSimple
  effortS: string
  creneauS: string
  reposRepetitionsS: string
  repetitions: string
  series: string
  reposSeriesS: string
  mot: string // le mot affiché pendant l'effort
  // Liste à cocher : un élément par ligne
  elements: string
  // Essais avec repos
  reposEssaisS: string
  consigne: string
  dureeMin: string
  terrain: NonNullable<Contexte['terrain']> | ''
  livre: LivreReference | ''
  titreAutre: string
  page: string
  reponses: ReponsesSecurite
  zones: ZoneDouleur[]
}

export const BROUILLON_VIDE: BrouillonExercice = {
  nom: '', qualite: '', forme: '',
  gabarit: 'repetition_unique', effortS: '10', creneauS: '60', reposRepetitionsS: '3', repetitions: '5', series: '3', reposSeriesS: '180',
  mot: '', elements: '', reposEssaisS: '180',
  consigne: '', dureeMin: '15', terrain: '', livre: '', titreAutre: '', page: '',
  reponses: REPONSES_PRUDENTES, zones: [],
}

// ——— Validation ———

/** Les champs qui peuvent porter une erreur, dans l'ordre de l'écran (le focus va au premier). */
export const CHAMPS_ORDRE = [
  'nom', 'qualite', 'forme', 'effortS', 'creneauS', 'reposRepetitionsS', 'repetitions', 'series', 'reposSeriesS',
  'elements', 'reposEssaisS', 'dureeMin', 'page',
] as const
export type ChampErreur = (typeof CHAMPS_ORDRE)[number]
export type Erreurs = Partial<Record<ChampErreur, string>>

/** Un entier positif ou nul écrit en chiffres ; sinon NaN. */
export function entier(texte: string): number {
  return /^\d{1,5}$/.test(texte.trim()) ? Number(texte.trim()) : Number.NaN
}

export function elementsDeListe(texte: string): string[] {
  return texte.split('\n').map((ligne) => ligne.trim()).filter((ligne) => ligne !== '')
}

export function erreursDuBrouillon(b: BrouillonExercice): Erreurs {
  const e: Erreurs = {}
  if (b.nom.trim() === '') e.nom = 'Donne un nom à l’exercice.'
  if (b.qualite === '') e.qualite = 'Choisis la qualité travaillée.'
  if (b.forme === '') e.forme = 'Choisis comment l’exercice se déroule.'

  const positif = (champ: ChampErreur, texte: string, message: string) => {
    if (!(entier(texte) >= 1)) e[champ] = message
  }
  if (b.forme === 'chrono') {
    positif('effortS', b.effortS, 'L’effort doit durer au moins 1 seconde.')
    if (b.gabarit === 'depart_minute') {
      positif('creneauS', b.creneauS, 'Le créneau doit durer au moins 1 seconde.')
      if (e.creneauS === undefined && e.effortS === undefined && entier(b.creneauS) < entier(b.effortS)) {
        e.creneauS = 'Le créneau doit être au moins aussi long que l’effort.'
      }
    }
    if (b.gabarit !== 'repetition_unique') positif('repetitions', b.repetitions, 'Il faut au moins 1 répétition.')
    if (b.gabarit === 'intermittent' && !(entier(b.reposRepetitionsS) >= 0)) e.reposRepetitionsS = 'Écris un repos en secondes (0 si aucun).'
    positif('series', b.series, 'Il faut au moins 1 série : avec 0, le chrono ne ferait rien.')
    if (!(entier(b.reposSeriesS) >= 0)) e.reposSeriesS = 'Écris un repos en secondes (0 si aucun).'
  }
  if (b.forme === 'liste' && elementsDeListe(b.elements).length === 0) e.elements = 'Écris au moins un élément, un par ligne.'
  if (b.forme === 'essais' && !(entier(b.reposEssaisS) >= 0)) e.reposEssaisS = 'Écris un repos en secondes (0 si aucun).'

  positif('dureeMin', b.dureeMin, 'Indique une durée d’au moins 1 minute.')
  if (b.livre !== '' && b.page.trim() !== '' && !/^\d{1,4}$/.test(b.page.trim())) e.page = 'Écris un numéro de page, par exemple 84.'
  return e
}

/** Le premier champ en erreur, dans l'ordre de l'écran. */
export function premierChampEnErreur(e: Erreurs): ChampErreur | undefined {
  return CHAMPS_ORDRE.find((c) => e[c] !== undefined)
}

// ——— Du brouillon à l'exercice enregistré ———

function configChrono(b: BrouillonExercice): ConfigChrono {
  const effortS = entier(b.effortS)
  const series = entier(b.series)
  const reposSeriesS = entier(b.reposSeriesS)
  switch (b.gabarit) {
    case 'repetition_unique':
      return { gabarit: 'repetition_unique', effortS, series, reposSeriesS }
    case 'depart_minute':
      return { gabarit: 'depart_minute', effortS, creneauS: entier(b.creneauS), repetitions: entier(b.repetitions), series, reposSeriesS }
    case 'intermittent':
      return { gabarit: 'intermittent', effortS, reposRepetitionsS: entier(b.reposRepetitionsS), repetitions: entier(b.repetitions), series, reposSeriesS }
  }
}

/** Le court résumé de la liste des étapes : « 3 séries », « 4 éléments », « repos 3 min ». */
function resumeDepuis(b: BrouillonExercice): string {
  if (b.forme === 'chrono') return `${entier(b.series)} série${entier(b.series) > 1 ? 's' : ''}`
  if (b.forme === 'liste') {
    const n = elementsDeListe(b.elements).length
    return `${n} élément${n > 1 ? 's' : ''}`
  }
  return `${b.dureeMin} min`
}

/** Le livre n'est cité que par son titre (clé de `LIVRES`) et sa page : rien du contenu n'est recopié. */
function referenceDepuis(b: BrouillonExercice): ExercicePerso['reference'] {
  if (b.livre === '') return undefined
  return {
    livre: b.livre,
    ...(b.livre === 'autre' && b.titreAutre.trim() !== '' ? { titreAutre: b.titreAutre.trim() } : {}),
    ...(b.page.trim() !== '' ? { page: b.page.trim() } : {}),
  }
}

/** « Escalade Training : 100 exercices…, p. 84 » : la phrase affichée pour une référence. */
export function phraseReference(r: NonNullable<ExercicePerso['reference']>): string {
  const titre = r.livre === 'autre' && r.titreAutre !== undefined ? r.titreAutre : LIVRES[r.livre]
  return r.page !== undefined ? `${titre}, p. ${r.page}` : titre
}

/**
 * Le brouillon devient un `ExercicePerso`. À appeler seulement quand `erreursDuBrouillon` est vide.
 * Aucun prénom ni poids ici : un exercice personnel ne décrit que l'exercice.
 */
export function exerciceDepuisBrouillon(b: BrouillonExercice, id: string, maintenant: string): ExercicePerso {
  if (b.qualite === '' || b.forme === '') throw new Error('Brouillon incomplet : qualité et forme sont obligatoires.')
  const reference = referenceDepuis(b)
  const commun = {
    id, versionFormat: 1 as const, creeLe: maintenant, modifieLe: maintenant,
    nom: b.nom.trim(), qualite: b.qualite, resume: resumeDepuis(b), consigne: b.consigne.trim(),
    dureeMin: entier(b.dureeMin),
    // Le formulaire a toujours posé les questions : l'exercice est qualifié (jamais `null`).
    marqueurs: marqueursDepuisReponses(b.reponses),
    contreIndications: [...b.zones],
    ...(b.terrain !== '' ? { contexte: { terrain: b.terrain } } : {}),
    ...(reference !== undefined ? { reference } : {}),
  }
  switch (b.forme) {
    case 'chrono':
      return { ...commun, forme: 'chrono', config: configChrono(b), mot: b.mot.trim() === '' ? 'EFFORT' : b.mot.trim(), detail: b.consigne.trim() }
    case 'liste':
      return { ...commun, forme: 'liste', elements: elementsDeListe(b.elements) }
    case 'essais':
      return { ...commun, forme: 'essais', reposS: entier(b.reposEssaisS) }
  }
}

/** Le formulaire a-t-il changé depuis le départ ? Sert à confirmer avant de quitter. */
export function brouillonModifie(b: BrouillonExercice): boolean {
  return JSON.stringify(b) !== JSON.stringify(BROUILLON_VIDE)
}
