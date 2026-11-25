import { describe, expect, it } from 'vitest'
import type { SeancePlanifiee } from '../../donnees/modele.ts'
import { SEANCES_TYPES } from '../../donnees/seancesTypes.ts'
import { fichesDeLaBibliotheque, profilVersVerif } from '../../regles/index.ts'
import { PROFIL_VIDE } from '../../donnees/profil.ts'
import {
  ajouterEtape, choixSeancesTypes, copierSoloVersGroupe, duretePropose, effortParDefaut, etapeDepuisFiche, groupePasRempli, groupeVide,
  idEtapeLibre, monterOuDescendre, positionDeLaSemaine, qualiteProposee, semaineAChange,
} from './VueSemaine.outils.ts'
import { nouvelleSeanceVide } from './VuePhase.outils.ts'

const cycle = { id: 'c', debut: '2026-11-23' } as never
const phase = { id: 'p', ordre: 1 } as never
const vide = (): SeancePlanifiee => nouvelleSeanceVide(cycle, phase, 1, 0, '2026-11-24T10:00:00.000Z', 's1')
const fiches = fichesDeLaBibliotheque()

describe('positionDeLaSemaine', () => {
  it('convertit 1 à 12', () => {
    expect(positionDeLaSemaine(1)).toEqual({ ordre: 1, semaine: 1 })
    expect(positionDeLaSemaine(6)).toEqual({ ordre: 2, semaine: 2 })
    expect(positionDeLaSemaine(12)).toEqual({ ordre: 3, semaine: 4 })
  })
})

describe('étapes', () => {
  it('donne un identifiant libre', () => {
    const e = etapeDepuisFiche('echauffement-general', [], [])!
    expect(idEtapeLibre([e], 'echauffement-general')).toBe('echauffement-general-2')
  })
  it('recopie l’étape complète avec son origine', () => {
    const e = etapeDepuisFiche('echauffement-general', [], [])!
    expect(e.origine).toMatchObject({ source: 'bibliotheque', refId: 'echauffement-general' })
    expect(e.titre.length).toBeGreaterThan(0)
  })
  it('une fiche inconnue ne donne rien', () => {
    expect(etapeDepuisFiche('nexiste-pas', [], [])).toBeUndefined()
  })
  it('ajoute deux fois la même fiche sans collision d’identifiant', () => {
    const e = etapeDepuisFiche('echauffement-general', [], [])!
    const s = ajouterEtape(ajouterEtape(vide(), e, 'solo'), e, 'solo')
    expect(new Set(s.solo.etapes.map((x) => x.id)).size).toBe(2)
  })
  it('monte et descend sans sortir de la liste', () => {
    expect(monterOuDescendre([1, 2, 3], 0, -1)).toEqual([1, 2, 3])
    expect(monterOuDescendre([1, 2, 3], 2, -1)).toEqual([1, 3, 2])
  })
  it('crée le mini-bloc avant s’il manque', () => {
    const e = etapeDepuisFiche('echauffement-general', [], [])!
    const s = { ...vide(), groupe: groupeVide(vide().solo) }
    expect(ajouterEtape(s, e, 'minibloc').groupe?.miniBloc).toMatchObject({ moment: 'avant' })
  })
})

describe('valeurs proposées (jamais stockées)', () => {
  it('séance vide : légère, effort par défaut 4', () => {
    expect(duretePropose(vide().solo, fiches)).toBe('legere')
    expect(effortParDefaut('legere')).toBe(4)
    expect(effortParDefaut('dure')).toBe(7)
    expect(vide().solo.effortPrevu).toBeUndefined()
  })
  it('qualité : première étape qui n’est pas un échauffement', () => {
    const echauffement = etapeDepuisFiche('echauffement-general', [], [])!
    const autre = etapeDepuisFiche('antagonistes-legers', [], [])!
    expect(qualiteProposee([echauffement, autre], fiches)).toBe('antagonistes')
    expect(qualiteProposee([echauffement], fiches)).toBeUndefined()
  })
})

describe('version groupe', () => {
  it('une version groupe vide n’est pas remplie, et ne stocke pas d’échauffement', () => {
    const g = groupeVide(vide().solo)
    expect(groupePasRempli(g)).toBe(true)
    expect(groupePasRempli(null)).toBe(true)
    expect(g.miniBloc).toBeUndefined()
    expect(groupePasRempli({ ...g, objectifs: [{ ...g.objectifs[0], libelle: 'Flasher 3 blocs' }] })).toBe(false)
  })
  it('copie nom, dureté et effort', () => {
    const solo = { ...vide().solo, nom: 'Doigts', durete: 'dure' as const, effortPrevu: 8 }
    const g = copierSoloVersGroupe(solo, groupeVide(vide().solo))
    expect(g).toMatchObject({ nom: 'Doigts', durete: 'dure', effortPrevu: 8 })
  })
})

describe('séances types', () => {
  const profil = profilVersVerif(PROFIL_VIDE)
  const toutes = Object.values(fiches)
  it('chaque séance type et variante apparaît une fois, les disponibles d’abord', () => {
    const choix = choixSeancesTypes(toutes, profil, [])
    const attendu = SEANCES_TYPES.reduce((n, st) => n + 1 + Object.keys(st.variantes).length, 0)
    expect(choix).toHaveLength(attendu)
    const premierIndispo = choix.findIndex((c) => !c.disponible)
    if (premierIndispo >= 0) expect(choix.slice(premierIndispo).every((c) => !c.disponible)).toBe(true)
  })
  it('une séance indisponible porte sa raison, une disponible non', () => {
    const choix = choixSeancesTypes(toutes, profil, [])
    for (const c of choix) expect(c.disponible ? c.raison === undefined : (c.raison ?? '').length > 0).toBe(true)
  })
  it('sans aucune fiche, tout est indisponible mais présent', () => {
    const choix = choixSeancesTypes([], profil, [])
    expect(choix.every((c) => !c.disponible)).toBe(true)
    expect(choix.length).toBeGreaterThan(0)
  })
})

describe('semaineAChange', () => {
  const phases = [{ id: 'p', ordre: 1 }]
  const a = { ...vide(), modifieLe: 'A' }
  it('détecte une séance modifiée ou ajoutée dans la semaine affichée seulement', () => {
    expect(semaineAChange({ phases, seances: [a] }, { phases, seances: [a] }, 1)).toBe(false)
    expect(semaineAChange({ phases, seances: [a] }, { phases, seances: [{ ...a, modifieLe: 'B' }] }, 1)).toBe(true)
    expect(semaineAChange({ phases, seances: [] }, { phases, seances: [a] }, 1)).toBe(true)
    expect(semaineAChange({ phases, seances: [] }, { phases, seances: [a] }, 2)).toBe(false)
  })
})
