import { describe, expect, it } from 'vitest'
import { PROFIL_VIDE } from '../profil.ts'
import type { ExercicePerso } from '../modele.ts'
import { profilVersVerif } from '../../regles/passerelles.ts'
import type { FicheVerif } from '../../regles/types.ts'
import { BIBLIOTHEQUE } from './index.ts'
import {
  FILTRES_VIDES, convient, entreesDepuis, filtresActifs, filtresDepuisRecherche, filtrer, normaliser, phraseCompteur,
  rechercheDepuisFiltres, texteContreIndication, trier, type ContexteFiltre, type EntreeBibliotheque, type Filtres,
} from './filtres.ts'

const PROFIL_COMPLET = profilVersVerif({
  ...PROFIL_VIDE, niveauBloc: '7B', anneesPratique: 8, experiencePoutre: 'reguliere', tractionsStrictes: 20,
  tient15sSur25mm: true, majeur: true, grimpeEnTete: true,
})
const sans: ContexteFiltre = { profil: PROFIL_COMPLET, douleurs: [], aujourdhui: '2026-11-24' }
// Un débutant : les prérequis exigeants lui manquent.
const debutant: ContexteFiltre = { ...sans, profil: profilVersVerif({ ...PROFIL_VIDE, anneesPratique: 0 }) }

function entree(surcharge: Partial<EntreeBibliotheque> & { id: string }): EntreeBibliotheque {
  const fiche: FicheVerif = {
    id: surcharge.id, nom: 'x', origine: 'bibliotheque', qualite: 'doigts', dureeMin: 10, marqueurs: [], prerequis: {},
    contreIndications: [], solliciteDoigts: true,
  }
  return {
    nom: 'Suspension', qualite: 'doigts', resume: '', consigne: 'Suspends-toi', dureeMin: 10, origine: 'bibliotheque',
    preuve: 'Étude', source: 'Un auteur', groupe: false, partenaire: false, fiche, ...surcharge,
  }
}
const f = (surcharge: Partial<Filtres>): Filtres => ({ ...FILTRES_VIDES, ...surcharge })
const ids = (liste: EntreeBibliotheque[]) => liste.map((e) => e.id)

const A = entree({ id: 'a', nom: 'Échelle des doigts', qualite: 'doigts', dureeMin: 10, terrain: 'poutre', preuve: 'Étude', source: 'Bechtel' })
const B = entree({ id: 'b', nom: 'Traction lestée', qualite: 'traction_gainage', dureeMin: 20, terrain: 'barre', preuve: 'Avis de coach', consigne: 'Tire fort',
  fiche: { ...A.fiche, id: 'b', prerequis: { tractionsStrictesMin: 10 }, contreIndications: ['coude'] } })
const C = entree({ id: 'c', nom: 'Jeu de groupe', qualite: 'technique', dureeMin: 45, terrain: 'bloc', preuve: 'Synthèse', groupe: true, partenaire: true })
const D = entree({ id: 'd', nom: 'Mon exercice', qualite: 'mobilite', dureeMin: 40, origine: 'perso', preuve: 'Perso' })
const TOUT = [A, B, C, D]

describe('filtrer : un cas par filtre', () => {
  it('sans filtre, tout reste visible', () => expect(ids(filtrer(TOUT, FILTRES_VIDES, sans))).toHaveLength(4))
  it('texte : sans accents ni casse, sur nom, consigne et auteur', () => {
    expect(ids(filtrer(TOUT, f({ texte: 'ECHELLE' }), sans))).toEqual(['a'])
    expect(ids(filtrer(TOUT, f({ texte: 'tire' }), sans))).toEqual(['b'])
    expect(ids(filtrer(TOUT, f({ texte: 'bechtel' }), sans))).toEqual(['a'])
  })
  it('qualité : choix multiple', () => expect(ids(filtrer(TOUT, f({ qualites: ['doigts', 'mobilite'] }), sans))).toEqual(['a', 'd']))
  it('terrain : une fiche sans terrain ne répond à aucun terrain', () => {
    expect(ids(filtrer(TOUT, f({ terrains: ['poutre', 'bloc'] }), sans))).toEqual(['a', 'c'])
  })
  it('durée : 10, 20, 40 max et plus', () => {
    expect(ids(filtrer(TOUT, f({ duree: 10 }), sans))).toEqual(['a'])
    expect(ids(filtrer(TOUT, f({ duree: 20 }), sans))).toEqual(['a', 'b'])
    expect(ids(filtrer(TOUT, f({ duree: 40 }), sans))).toEqual(['a', 'b', 'd'])
    expect(ids(filtrer(TOUT, f({ duree: 'plus' }), sans))).toEqual(['c'])
  })
  it('prérequis : « conviennent » cache les fiches aux prérequis non remplis', () => {
    expect(ids(filtrer(TOUT, f({ prerequis: 'conviennent' }), debutant))).toEqual(['a', 'c', 'd'])
    expect(ids(filtrer(TOUT, f({ prerequis: 'pas_encore' }), debutant))).toEqual(['b'])
  })
  it('une douleur déclarée écarte la fiche contre-indiquée, même sans prérequis manquant', () => {
    const douleur = { ...sans, douleurs: [{ date: '2026-11-20', zone: 'coude' as const, niveau: 'reduction' as const, signes: [] }] }
    expect(convient(B, sans)).toBe(true)
    expect(convient(B, douleur)).toBe(false)
    expect(ids(filtrer(TOUT, f({ prerequis: 'pas_encore' }), douleur))).toEqual(['b'])
  })
  it('preuve : étude, avis de coach, synthèse, perso', () => {
    expect(ids(filtrer(TOUT, f({ preuves: ['Étude', 'Synthèse'] }), sans))).toEqual(['a', 'c'])
    expect(ids(filtrer(TOUT, f({ preuves: ['Perso'] }), sans))).toEqual(['d'])
  })
  it('groupe et partenaire', () => {
    expect(ids(filtrer(TOUT, f({ groupe: true }), sans))).toEqual(['c'])
    expect(ids(filtrer(TOUT, f({ partenaire: true }), sans))).toEqual(['c'])
  })
  it('origine', () => {
    expect(ids(filtrer(TOUT, f({ origine: 'perso' }), sans))).toEqual(['d'])
    expect(ids(filtrer(TOUT, f({ origine: 'bibliotheque' }), sans))).toEqual(['a', 'b', 'c'])
  })
  it('combinaison : tous les filtres s’ajoutent', () => {
    expect(ids(filtrer(TOUT, f({ qualites: ['doigts', 'technique'], duree: 20, prerequis: 'conviennent' }), debutant))).toEqual(['a'])
    expect(filtrer(TOUT, f({ qualites: ['doigts'], origine: 'perso' }), sans)).toEqual([])
  })
})

describe('tri', () => {
  it('qualité (ordre de la bibliothèque), durée, nom sans accent', () => {
    expect(ids(trier([D, C, B, A], 'qualite'))).toEqual(['a', 'b', 'c', 'd'])
    expect(ids(trier([C, A, D, B], 'duree'))).toEqual(['a', 'b', 'd', 'c'])
    expect(ids(trier([A, B, C, D], 'nom'))).toEqual(['a', 'c', 'd', 'b']) // Échelle, Jeu, Mon, Traction
  })
})

describe('bibliothèque réelle', () => {
  const entrees = entreesDepuis(BIBLIOTHEQUE, [])
  it('les 60 protocoles sont tous là, tous visibles sans filtre', () => {
    expect(entrees).toHaveLength(BIBLIOTHEQUE.length)
    expect(filtrer(entrees, FILTRES_VIDES, sans)).toHaveLength(BIBLIOTHEQUE.length)
  })
  it('une fiche hors génération ou un test garde sa raison, jamais cachée', () => {
    const horsGeneration = BIBLIOTHEQUE.filter((p) => p.exclureDeLaGeneration !== undefined || p.estTest)
    expect(horsGeneration.length).toBeGreaterThan(0)
    for (const p of horsGeneration) {
      const e = entrees.find((x) => x.id === p.id)!
      expect(e.aLaMain, p.id).toBeTruthy()
    }
    expect(entrees.filter((e) => e.aLaMain === undefined)).toHaveLength(BIBLIOTHEQUE.length - horsGeneration.length)
  })
  it('chaque fiche montre sa source', () => expect(entrees.every((e) => e.source.trim() !== '')).toBe(true))
  it('aucune fiche n’est attribuée à un des deux livres', () => {
    expect(entrees.some((e) => /Escalade Training|alimentation du grimpeur/i.test(e.source))).toBe(false)
  })
})

describe('exercices personnels', () => {
  const perso = (surcharge: Partial<ExercicePerso> = {}): ExercicePerso => ({
    id: 'p1', versionFormat: 1, creeLe: '', modifieLe: '', nom: 'Gainage maison', qualite: 'traction_gainage', resume: '3 min',
    consigne: 'Tiens', dureeMin: 5, marqueurs: [], contreIndications: [], forme: 'liste', elements: ['Planche'],
    reference: { livre: 'cent_exercices', page: '84' }, ...surcharge,
  } as ExercicePerso)
  it('ajoutés après la bibliothèque, sans les supprimés ; la bibliothèque l’emporte sur un identifiant commun', () => {
    const out = entreesDepuis(BIBLIOTHEQUE.slice(0, 2), [perso(), perso({ id: 'p2', supprimeLe: '2026-11-01' }), perso({ id: BIBLIOTHEQUE[0].id })])
    expect(out.map((e) => e.id)).toEqual([BIBLIOTHEQUE[0].id, BIBLIOTHEQUE[1].id, 'p1'])
    expect(out[2]).toMatchObject({ origine: 'perso', preuve: 'Perso' })
  })
  it('la page d’un livre citée par l’utilisateur n’est jamais présentée comme la source', () => {
    expect(entreesDepuis([], [perso()])[0].source).not.toMatch(/Escalade Training/)
  })
})

describe('compteur et filtres actifs', () => {
  it('phraseCompteur', () => {
    expect(phraseCompteur(12, 9)).toBe('12 protocoles · 9 te conviennent')
    expect(phraseCompteur(1, 1)).toBe('1 protocole · 1 te convient')
    expect(phraseCompteur(4, 0)).toBe('4 protocoles · aucun ne te convient')
    expect(phraseCompteur(0, 0)).toBe('0 protocole')
  })
  it('chaque filtre actif se retire seul', () => {
    const posee = f({ qualites: ['doigts', 'mental'], duree: 20, groupe: true })
    const actifs = filtresActifs(posee)
    expect(actifs.map((a) => a.libelle)).toEqual(['qualité : force des doigts', 'qualité : mental', 'durée : 20 min max', 'se prête au groupe'])
    expect(actifs[0].sans.qualites).toEqual(['mental'])
    expect(filtresActifs(actifs[3].sans)).toHaveLength(3)
    expect(filtresActifs(FILTRES_VIDES)).toEqual([])
    expect(filtresActifs(f({ tri: 'nom' }))).toEqual([]) // le tri n'est pas un filtre
  })
  it('texteContreIndication nomme la zone', () => expect(texteContreIndication(['coude'])).toBe('Déconseillé : douleur déclarée (coude)'))
  it('normaliser', () => expect(normaliser('  Échelle Épaule ')).toBe('echelle epaule'))
})

describe('adresse de la page', () => {
  it('sans filtre : adresse vide', () => expect(rechercheDepuisFiltres(FILTRES_VIDES)).toBe(''))
  it('un exemple lisible', () => {
    expect(rechercheDepuisFiltres(f({ qualites: ['doigts'], duree: 20 }))).toBe('?qualite=doigts&duree=20')
    expect(filtresDepuisRecherche('?qualite=doigts&duree=20')).toEqual(f({ qualites: ['doigts'], duree: 20 }))
  })
  it('aller-retour avec tous les filtres', () => {
    const tout = f({
      texte: 'échelle & co', qualites: ['doigts', 'mobilite'], terrains: ['poutre', 'sol'], duree: 'plus', prerequis: 'pas_encore',
      preuves: ['Étude', 'Perso'], groupe: true, partenaire: true, origine: 'perso', tri: 'duree',
    })
    expect(filtresDepuisRecherche(rechercheDepuisFiltres(tout))).toEqual(tout)
  })
  it('une valeur inconnue est ignorée, la page s’ouvre quand même', () => {
    expect(filtresDepuisRecherche('?qualite=zzz,doigts&duree=99&prerequis=x&origine=y&tri=z&terrain=lune')).toEqual(f({ qualites: ['doigts'] }))
  })
})
