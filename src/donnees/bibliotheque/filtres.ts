// Filtres de la bibliothèque (écran O-06) : des fonctions pures, testées sans afficher l'écran.
// Ici rien ne décide d'une règle d'entraînement : les prérequis et les contre-indications viennent
// de `etatPrerequis` (passerelles.ts), qui s'appuie sur `manquesPrerequis` (verifSeanceProfil.ts).
import type { Contexte, Preuve, Protocole, Qualite } from './types.ts'
import type { ExercicePerso } from '../modele.ts'
import { ficheDepuisProtocole } from '../../regles/adaptateur.ts'
import { etatPrerequis, ficheDepuisExercicePerso } from '../../regles/passerelles.ts'
import { NOMS_QUALITES, NOMS_ZONES } from '../../regles/reglesParDefaut.ts'
import type { DouleurVerif, FicheVerif, ProfilVerif, ZoneDouleur } from '../../regles/types.ts'

export type Terrain = NonNullable<Contexte['terrain']>
export type PreuveAffichee = Preuve | 'Perso'
export type FiltrePrerequis = 'tous' | 'conviennent' | 'pas_encore'
export type FiltreDuree = 10 | 20 | 40 | 'plus' // « plus » = plus de 40 min
export type FiltreOrigine = 'toutes' | 'bibliotheque' | 'perso'
export type Tri = 'qualite' | 'duree' | 'nom'

export const QUALITES: Qualite[] = [
  'doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance', 'technique', 'mental', 'antagonistes', 'mobilite', 'echauffement',
]
export const TERRAINS: { valeur: Terrain; nom: string }[] = [
  { valeur: 'poutre', nom: 'Poutre' }, { valeur: 'pan', nom: 'Pan' }, { valeur: 'bloc', nom: 'Bloc' },
  { valeur: 'voie', nom: 'Voie' }, { valeur: 'barre', nom: 'Barre' }, { valeur: 'sol', nom: 'Sol' },
]
export const PREUVES: PreuveAffichee[] = ['Étude', 'Avis de coach', 'Synthèse', 'Perso']
export const DUREES: { valeur: FiltreDuree; nom: string }[] = [
  { valeur: 10, nom: '10 min max' }, { valeur: 20, nom: '20 min max' }, { valeur: 40, nom: '40 min max' }, { valeur: 'plus', nom: 'Plus de 40 min' },
]

export interface Filtres {
  texte: string
  qualites: Qualite[]
  terrains: Terrain[]
  duree: FiltreDuree | null
  prerequis: FiltrePrerequis
  preuves: PreuveAffichee[]
  groupe: boolean // « Se prête au groupe »
  partenaire: boolean // « Partenaire nécessaire »
  origine: FiltreOrigine
  tri: Tri
}

export const FILTRES_VIDES: Filtres = {
  texte: '', qualites: [], terrains: [], duree: null, prerequis: 'tous', preuves: [], groupe: false, partenaire: false,
  origine: 'toutes', tri: 'qualite',
}

// ——— Les fiches affichées : un protocole de la bibliothèque ou un exercice personnel ———

export interface EntreeBibliotheque {
  id: string
  nom: string
  qualite: Qualite
  resume: string
  consigne: string
  dureeMin: number
  origine: 'bibliotheque' | 'perso'
  preuve: PreuveAffichee
  source: string // auteur et titre de la source, tels qu'ils sont écrits dans la fiche
  adresse?: string
  progression?: string
  aVerifier?: string
  terrain?: Terrain
  groupe: boolean
  partenaire: boolean
  /** Présent pour une fiche que ni le générateur ni l'assistant ne proposent : la raison, en clair. */
  aLaMain?: string
  /** La fiche vue par le moteur : sert aux prérequis et aux contre-indications. */
  fiche: FicheVerif
}

const RAISON_TEST_PAR_DEFAUT = 'Test de fin de phase : proposé seulement par « faire mes tests ».'

/** Pourquoi la fiche reste à la main, ou `undefined` si le générateur peut la proposer (même règle que `peutEtreGeneree`). */
function raisonALaMain(fiche: FicheVerif): string | undefined {
  if (fiche.exclureDeLaGeneration !== undefined) return fiche.exclureDeLaGeneration
  if (fiche.estTest) return RAISON_TEST_PAR_DEFAUT
  return undefined
}

function entreeDepuisProtocole(p: Protocole): EntreeBibliotheque {
  const fiche = ficheDepuisProtocole(p)
  const aLaMain = raisonALaMain(fiche)
  return {
    id: p.id, nom: p.nom, qualite: p.qualite, resume: p.resume, consigne: p.consigne, dureeMin: p.dureeMin,
    origine: 'bibliotheque', preuve: p.preuve, source: p.source.auteur, progression: p.progression,
    groupe: p.contexte?.groupe === 'adapte', partenaire: p.contexte?.partenaire === true, fiche,
    ...(p.source.adresse !== undefined ? { adresse: p.source.adresse } : {}),
    ...(p.aVerifier !== undefined ? { aVerifier: p.aVerifier } : {}),
    ...(p.contexte?.terrain !== undefined ? { terrain: p.contexte.terrain } : {}),
    ...(aLaMain !== undefined ? { aLaMain } : {}),
  }
}

function entreeDepuisExercicePerso(e: ExercicePerso): EntreeBibliotheque {
  return {
    id: e.id, nom: e.nom, qualite: e.qualite, resume: e.resume, consigne: e.consigne, dureeMin: e.dureeMin,
    origine: 'perso', preuve: 'Perso',
    // On n'attribue rien à un livre : la page citée par l'utilisateur reste dans sa fiche.
    source: 'Ton exercice personnel',
    groupe: e.contexte?.groupe === 'adapte', partenaire: e.contexte?.partenaire === true,
    fiche: ficheDepuisExercicePerso(e),
    ...(e.contexte?.terrain !== undefined ? { terrain: e.contexte.terrain } : {}),
  }
}

/** La bibliothèque puis les exercices personnels non supprimés. En cas d'identifiant commun, la bibliothèque l'emporte. */
export function entreesDepuis(protocoles: Protocole[], persos: ExercicePerso[]): EntreeBibliotheque[] {
  const ids = new Set(protocoles.map((p) => p.id))
  return [
    ...protocoles.map(entreeDepuisProtocole),
    ...persos.filter((e) => !e.supprimeLe && !ids.has(e.id)).map(entreeDepuisExercicePerso),
  ]
}

// ——— Prérequis et douleurs ———

export interface ContexteFiltre {
  profil: ProfilVerif
  douleurs: DouleurVerif[] // sans les douleurs supprimées
  aujourdhui: string
}

export interface EtatEntree { manques: string[]; contreIndications: ZoneDouleur[] }

export function etatDe(e: EntreeBibliotheque, c: ContexteFiltre): EtatEntree {
  return etatPrerequis(e.fiche, c.profil, c.douleurs, c.aujourdhui)
}

/** Une fiche te convient quand aucun prérequis ne manque et qu'aucune douleur déclarée ne la contre-indique. */
export function convient(e: EntreeBibliotheque, c: ContexteFiltre): boolean {
  const etat = etatDe(e, c)
  return etat.manques.length === 0 && etat.contreIndications.length === 0
}

/** Le signal d'arrêt compact d'une fiche : « Déconseillé : douleur déclarée (coude) ». */
export function texteContreIndication(zones: ZoneDouleur[]): string {
  return `Déconseillé : douleur déclarée (${zones.map((z) => NOMS_ZONES[z]).join(', ')})`
}

// ——— Filtrer et trier ———

/** Minuscules sans accents : « Échelle » et « echelle » se valent. */
export function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

function correspondDuree(dureeMin: number, duree: FiltreDuree): boolean {
  return duree === 'plus' ? dureeMin > 40 : dureeMin <= duree
}

export function filtrer(entrees: EntreeBibliotheque[], f: Filtres, c: ContexteFiltre): EntreeBibliotheque[] {
  const mot = normaliser(f.texte)
  const gardees = entrees.filter((e) => {
    if (mot !== '' && !normaliser(`${e.nom} ${e.consigne} ${e.source}`).includes(mot)) return false
    if (f.qualites.length > 0 && !f.qualites.includes(e.qualite)) return false
    // Une fiche sans terrain précisé ne répond à aucun choix de terrain : on ne devine pas.
    if (f.terrains.length > 0 && (e.terrain === undefined || !f.terrains.includes(e.terrain))) return false
    if (f.duree !== null && !correspondDuree(e.dureeMin, f.duree)) return false
    if (f.preuves.length > 0 && !f.preuves.includes(e.preuve)) return false
    if (f.groupe && !e.groupe) return false
    if (f.partenaire && !e.partenaire) return false
    if (f.origine !== 'toutes' && e.origine !== f.origine) return false
    if (f.prerequis !== 'tous') {
      if (convient(e, c) !== (f.prerequis === 'conviennent')) return false
    }
    return true
  })
  return trier(gardees, f.tri)
}

/** Tri stable : à égalité on garde l'ordre de la bibliothèque. */
export function trier(entrees: EntreeBibliotheque[], tri: Tri): EntreeBibliotheque[] {
  const copie = [...entrees]
  if (tri === 'duree') return copie.sort((a, b) => a.dureeMin - b.dureeMin)
  if (tri === 'nom') return copie.sort((a, b) => normaliser(a.nom).localeCompare(normaliser(b.nom), 'fr'))
  return copie.sort((a, b) => QUALITES.indexOf(a.qualite) - QUALITES.indexOf(b.qualite))
}

/** « 12 protocoles · 9 te conviennent » (annoncé à chaque changement). */
export function phraseCompteur(total: number, quiConviennent: number): string {
  const protocoles = `${total} protocole${total > 1 ? 's' : ''}`
  if (total === 0) return '0 protocole'
  return `${protocoles} · ${quiConviennent === 0 ? 'aucun ne te convient' : quiConviennent === 1 ? '1 te convient' : `${quiConviennent} te conviennent`}`
}

// ——— Filtres actifs (boutons « × qualité : doigts ») ———

export interface FiltreActif { cle: string; libelle: string; sans: Filtres }

const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
export const nomQualite = (q: Qualite) => majuscule(NOMS_QUALITES[q])
const nomTerrain = (t: Terrain) => TERRAINS.find((x) => x.valeur === t)?.nom ?? t

/** Chaque filtre posé, avec la liste de filtres obtenue en le retirant. Le tri n'est pas un filtre. */
export function filtresActifs(f: Filtres): FiltreActif[] {
  const actifs: FiltreActif[] = []
  if (f.texte.trim() !== '') actifs.push({ cle: 'texte', libelle: `recherche : ${f.texte.trim()}`, sans: { ...f, texte: '' } })
  for (const q of f.qualites) actifs.push({ cle: `qualite-${q}`, libelle: `qualité : ${NOMS_QUALITES[q]}`, sans: { ...f, qualites: f.qualites.filter((x) => x !== q) } })
  for (const t of f.terrains) actifs.push({ cle: `terrain-${t}`, libelle: `terrain : ${nomTerrain(t).toLowerCase()}`, sans: { ...f, terrains: f.terrains.filter((x) => x !== t) } })
  if (f.duree !== null) actifs.push({ cle: 'duree', libelle: `durée : ${DUREES.find((d) => d.valeur === f.duree)?.nom.toLowerCase()}`, sans: { ...f, duree: null } })
  if (f.prerequis !== 'tous') {
    actifs.push({ cle: 'prerequis', libelle: f.prerequis === 'conviennent' ? 'seulement ceux qui te conviennent' : 'ceux qui ne te conviennent pas encore', sans: { ...f, prerequis: 'tous' } })
  }
  for (const p of f.preuves) actifs.push({ cle: `preuve-${p}`, libelle: `preuve : ${p.toLowerCase()}`, sans: { ...f, preuves: f.preuves.filter((x) => x !== p) } })
  if (f.groupe) actifs.push({ cle: 'groupe', libelle: 'se prête au groupe', sans: { ...f, groupe: false } })
  if (f.partenaire) actifs.push({ cle: 'partenaire', libelle: 'partenaire nécessaire', sans: { ...f, partenaire: false } })
  if (f.origine !== 'toutes') actifs.push({ cle: 'origine', libelle: f.origine === 'perso' ? 'origine : mes exercices' : 'origine : bibliothèque', sans: { ...f, origine: 'toutes' } })
  return actifs
}

// ——— Adresse de la page : `?qualite=doigts&duree=20` ———

const CODES_PREUVE: Record<PreuveAffichee, string> = { 'Étude': 'etude', 'Avis de coach': 'coach', 'Synthèse': 'synthese', Perso: 'perso' }

function liste<T extends string>(brut: string | null, permis: readonly T[]): T[] {
  if (!brut) return []
  const demandes = brut.split(',')
  return permis.filter((v) => demandes.includes(v)) // une valeur inconnue est ignorée
}

/** Lit les filtres dans l'adresse. Tout ce qui est inconnu ou mal écrit est ignoré : la page s'ouvre toujours. */
export function filtresDepuisRecherche(recherche: string): Filtres {
  const p = new URLSearchParams(recherche)
  const duree = p.get('duree')
  const dureeLue = DUREES.find((d) => String(d.valeur) === duree)?.valeur ?? null
  const prerequis = p.get('prerequis')
  const origine = p.get('origine')
  const tri = p.get('tri')
  return {
    texte: p.get('q') ?? '',
    qualites: liste(p.get('qualite'), QUALITES),
    terrains: liste(p.get('terrain'), TERRAINS.map((t) => t.valeur)),
    duree: dureeLue,
    prerequis: prerequis === 'conviennent' || prerequis === 'pas_encore' ? prerequis : 'tous',
    preuves: PREUVES.filter((x) => (p.get('preuve') ?? '').split(',').includes(CODES_PREUVE[x])),
    groupe: p.get('groupe') === '1',
    partenaire: p.get('partenaire') === '1',
    origine: origine === 'bibliotheque' || origine === 'perso' ? origine : 'toutes',
    tri: tri === 'duree' || tri === 'nom' ? tri : 'qualite',
  }
}

/** L'inverse : ne met dans l'adresse que ce qui n'est pas la valeur de départ. Vide si aucun filtre. */
export function rechercheDepuisFiltres(f: Filtres): string {
  const p = new URLSearchParams()
  if (f.texte.trim() !== '') p.set('q', f.texte.trim())
  if (f.qualites.length > 0) p.set('qualite', f.qualites.join(','))
  if (f.terrains.length > 0) p.set('terrain', f.terrains.join(','))
  if (f.duree !== null) p.set('duree', String(f.duree))
  if (f.prerequis !== 'tous') p.set('prerequis', f.prerequis)
  if (f.preuves.length > 0) p.set('preuve', f.preuves.map((x) => CODES_PREUVE[x]).join(','))
  if (f.groupe) p.set('groupe', '1')
  if (f.partenaire) p.set('partenaire', '1')
  if (f.origine !== 'toutes') p.set('origine', f.origine)
  if (f.tri !== 'qualite') p.set('tri', f.tri)
  const texte = p.toString()
  return texte === '' ? '' : `?${texte}`
}
