import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { controlesDuJour } from '../ecrans/controlesDuJour.ts'
import { etapeDepuisProtocole } from '../regles/index.ts'
import { base } from './base.ts'
import { protocoleParId } from './bibliotheque/index.ts'
import {
  CONDUITE_REDUCTION, SIGNES_ARRET, declarerDouleur, douleursOuvertes, lireDouleursOuvertes, marquerResolue, signalDouleur,
} from './douleurs.ts'
import { EXEMPLE_CYCLE, EXEMPLE_SEANCE_PLANIFIEE } from './exemplesV2.ts'
import type { DouleurDeclaree, SeancePlanifiee } from './modele.ts'
import { PROFIL_VIDE } from './profil.ts'
import { lireUn } from './stockage.ts'

const doc = (extra: Partial<DouleurDeclaree>): DouleurDeclaree => ({
  id: 'd1', versionFormat: 1, creeLe: 'x', modifieLe: 'x', date: '2026-11-10', zone: 'coude', niveau: 'reduction', signes: [], ...extra,
})

beforeEach(async () => { await base.douleurs.clear() })

describe('declarerDouleur', () => {
  it('sans signe : niveau réduction, écrite et à envoyer', async () => {
    const d = await declarerDouleur({ date: '2026-11-10', zone: 'coude', signes: [] })
    expect(d.niveau).toBe('reduction')
    expect(d.signes).toEqual([])
    expect((await base.douleurs.get(d.id))?.aEnvoyer).toBe(1)
  })

  it('avec un signe : niveau alerte', async () => {
    const d = await declarerDouleur({ date: '2026-11-10', zone: 'doigts', signes: [SIGNES_ARRET[0]] })
    expect(d.niveau).toBe('alerte')
    expect(d.signes).toEqual([SIGNES_ARRET[0]])
  })

  it('un signe hors liste : erreur, rien d’écrit', async () => {
    await expect(declarerDouleur({ date: '2026-11-10', zone: 'doigts', signes: ['Texte libre'] })).rejects.toThrow('Signe inconnu.')
    expect(await base.douleurs.count()).toBe(0)
  })
})

describe('douleursOuvertes', () => {
  it('écarte supprimée, résolue le jour même, déclarée demain ; garde résolue demain ; trie par date', () => {
    const jour = '2026-11-20'
    const r = douleursOuvertes([
      doc({ id: 'sup', supprimeLe: 'x' }),
      doc({ id: 'res', resolueLe: jour }),
      doc({ id: 'futur', date: '2026-11-21' }),
      doc({ id: 'demain', date: '2026-11-15', resolueLe: '2026-11-21' }),
      doc({ id: 'ancienne', date: '2026-11-01' }),
    ], jour)
    expect(r.map((d) => d.id)).toEqual(['ancienne', 'demain'])
  })
})

describe('marquerResolue', () => {
  it('pose resolueLe sans toucher au reste, et la douleur sort de la liste', async () => {
    const d = await declarerDouleur({ date: '2026-11-10', zone: 'genou', signes: [] })
    expect(await lireDouleursOuvertes('2026-11-20')).toHaveLength(1)
    await marquerResolue(d.id, '2026-11-20')
    const apres = await lireUn<DouleurDeclaree>('douleurs', d.id)
    expect(apres).toMatchObject({ id: d.id, zone: 'genou', date: '2026-11-10', niveau: 'reduction', signes: [], resolueLe: '2026-11-20' })
    expect(await lireDouleursOuvertes('2026-11-20')).toEqual([])
  })

  it('une douleur absente : erreur', async () => {
    await expect(marquerResolue('inconnue', '2026-11-20')).rejects.toThrow()
  })
})

describe('signalDouleur', () => {
  it('alerte au coude : titre et phrase de S-05', () => {
    expect(signalDouleur([doc({ niveau: 'alerte', signes: [SIGNES_ARRET[2]] })])).toEqual({
      titre: 'Signe d’alerte déclaré : coude.',
      texte: 'Pas de séance dure avant d’avoir consulté un médecin ou un kiné qui connaît l’escalade.',
    })
  })

  it('réductions au coude puis aux doigts : « doigts, coude » (ordre de ZONES)', () => {
    expect(signalDouleur([doc({}), doc({ id: 'd2', zone: 'doigts', date: '2026-11-11' })])).toEqual({
      titre: 'Douleur déclarée : doigts, coude.',
      texte: 'Ménage cette zone et arrête-toi dès que ça fait mal.',
    })
  })

  it('rien : null', () => {
    expect(signalDouleur([])).toBeNull()
  })
})

// Chaîne moteur : de la douleur déclarée aux contrôles du jour.
describe('douleurs et moteur', () => {
  const protocole = protocoleParId('puissance-bloc-limite')!
  const seance: SeancePlanifiee = {
    ...EXEMPLE_SEANCE_PLANIFIEE, date: '2026-11-17', groupe: null,
    solo: { nom: 'Bloc limite', durete: 'dure', etapes: [etapeDepuisProtocole(protocole, 'e1')] },
  }
  const controles = (douleurs: DouleurDeclaree[]) => controlesDuJour({
    profil: { ...PROFIL_VIDE, anneesPratique: 4, experiencePoutre: 'occasionnelle', tractionsStrictes: 12, tient15sSur25mm: true, majeur: true, grimpeEnTete: false },
    exercicesPerso: [], douleurs, formes: [], objectifs: [], aujourdhui: '2026-11-17', maintenant: '2026-11-17T08:00:00.000Z',
  }, [], { seance, cycle: EXEMPLE_CYCLE })

  it('douleur alerte, séance dure : S-05 fort qui cite le signe coché, forme arrêt', () => {
    const s05 = controles([doc({ date: '2026-11-15', niveau: 'alerte', signes: [SIGNES_ARRET[2]] })]).find((c) => c.avertissement.code === 'S-05')
    expect(s05?.forme).toBe('arret')
    expect(s05?.avertissement.message).toContain(SIGNES_ARRET[2])
  })

  it('douleur réduction de 3 jours, effort maximal : S-06 fort ; résolue : ni S-05 ni S-06', () => {
    const ouverte = doc({ date: '2026-11-14' })
    expect(controles([ouverte]).map((c) => c.avertissement.code)).toContain('S-06')
    const resolue = controles([{ ...ouverte, resolueLe: '2026-11-16' }, doc({ id: 'd2', date: '2026-11-14', niveau: 'alerte', signes: [SIGNES_ARRET[0]], resolueLe: '2026-11-17' })])
      .map((c) => c.avertissement.code)
    expect(resolue).not.toContain('S-05')
    expect(resolue).not.toContain('S-06')
  })

  it('la conduite de réduction est celle des mises en garde', () => {
    expect(CONDUITE_REDUCTION).toMatch(/^Retire les arqués/)
  })
})
