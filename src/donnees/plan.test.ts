import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { base } from './base.ts'
import { EXEMPLE_CYCLE, EXEMPLE_PHASES, EXEMPLE_SEANCE_PLANIFIEE } from './exemplesV2.ts'
import type { Cycle, SallePerso, SeancePlanifiee, SeanceRealisee } from './modele.ts'
import {
  ajouterJours, cycleEnCours, cycleTermine, debutPhase, debutSemaine, dureeEtapes, enregistrerCycle,
  enregistrerExercicePerso, enregistrerPhase, enregistrerSallePerso, enregistrerSeancePlanifiee, finCycle,
  lireCycles, lireExercicesPerso, lirePlanDuCycle, lireSallesPerso, lireSeancesEntre, salleEffective,
  statutSeance, supprimerCycle,
} from './plan.ts'
import { ARKOSE, MROC } from './salles.ts'

const cycle = EXEMPLE_CYCLE
const [phase1, phase2, phase3] = EXEMPLE_PHASES
const seance = EXEMPLE_SEANCE_PLANIFIEE // le 2026-11-17

const realisee = (extra: Partial<SeanceRealisee>): SeanceRealisee => ({
  id: 'r1', versionFormat: 1, creeLe: 'x', modifieLe: 'x', date: '2026-11-17', mode: 'solo', nom: 'Séance',
  durete: 'dure', dureeMin: 60, effortPercu: 7, peau: 3, douleur: false, etapes: [], objectifs: [], blocs: [], ...extra,
})

const jourDeSemaine = (jour: string) => {
  const [a, m, j] = jour.split('-').map(Number)
  return new Date(a, m - 1, j).getDay()
}

describe('dates', () => {
  it('calcule le début des phases, des semaines et la fin du cycle', () => {
    expect(debutPhase(cycle, phase1)).toBe('2026-11-16')
    expect(debutPhase(cycle, phase2)).toBe('2026-12-14')
    expect(debutPhase(cycle, phase3)).toBe('2027-01-11')
    expect(debutSemaine(cycle, phase1, 4)).toBe('2026-12-07')
    expect(debutSemaine(cycle, phase3, 1)).toBe('2027-01-11')
    expect(finCycle(cycle)).toBe('2027-02-07')
  })

  it('ajouterJours traverse les changements d’heure sans décalage', () => {
    expect(ajouterJours('2027-03-27', 2)).toBe('2027-03-29') // heure d'été (Europe), nuit du 27 au 28
    expect(ajouterJours('2026-10-24', 2)).toBe('2026-10-26') // heure d'hiver (Europe)
    expect(ajouterJours('2027-03-13', 2)).toBe('2027-03-15') // heure d'été (États-Unis)
    expect(ajouterJours('2026-12-31', 1)).toBe('2027-01-01')
    expect(ajouterJours('2028-02-28', 1)).toBe('2028-02-29')
    expect(ajouterJours('2026-11-17', -17)).toBe('2026-10-31')
  })

  it('un cycle qui traverse un changement d’heure garde des semaines qui commencent un lundi', () => {
    for (const debut of ['2026-10-19', '2027-03-15']) { // passage à l'heure d'hiver, puis d'été
      const c: Cycle = { ...cycle, debut }
      for (const phase of EXEMPLE_PHASES) {
        for (const semaine of [1, 2, 3, 4] as const) {
          const jour = debutSemaine(c, phase, semaine)
          expect(jourDeSemaine(jour)).toBe(1) // lundi
        }
      }
      expect(jourDeSemaine(finCycle(c))).toBe(0) // dimanche
    }
    expect(debutPhase({ ...cycle, debut: '2026-10-19' }, phase2)).toBe('2026-11-16')
    expect(finCycle({ ...cycle, debut: '2027-03-15' })).toBe('2027-06-06')
  })
})

describe('cycleEnCours et cycleTermine', () => {
  it('prend le cycle validé qui couvre la date', () => {
    expect(cycleEnCours([cycle], '2026-11-16')).toBe(cycle)
    expect(cycleEnCours([cycle], '2027-02-07')).toBe(cycle)
  })
  it('ignore brouillon, abandonné, supprimé et hors dates', () => {
    expect(cycleEnCours([{ ...cycle, etat: 'brouillon' }], '2026-12-01')).toBeUndefined()
    expect(cycleEnCours([{ ...cycle, abandonneLe: '2026-11-30' }], '2026-12-01')).toBeUndefined()
    expect(cycleEnCours([{ ...cycle, supprimeLe: '2026-11-30T10:00:00.000Z' }], '2026-12-01')).toBeUndefined()
    expect(cycleEnCours([cycle], '2026-11-15')).toBeUndefined()
    expect(cycleEnCours([cycle], '2027-02-08')).toBeUndefined()
  })
  it('si deux cycles se chevauchent, prend le plus récemment modifié', () => {
    const recent: Cycle = { ...cycle, id: 'autre', modifieLe: '2026-11-20T08:00:00.000Z' }
    expect(cycleEnCours([cycle, recent], '2026-12-01')?.id).toBe('autre')
    expect(cycleEnCours([recent, cycle], '2026-12-01')?.id).toBe('autre')
  })
  it('cycleTermine : après la fin, sans abandon', () => {
    expect(cycleTermine(cycle, '2027-02-07')).toBe(false)
    expect(cycleTermine(cycle, '2027-02-08')).toBe(true)
    expect(cycleTermine({ ...cycle, abandonneLe: '2026-12-01' }, '2027-03-01')).toBe(false)
  })
})

describe('statutSeance', () => {
  it('faite : une séance réalisée non supprimée la cite', () => {
    expect(statutSeance(seance, [realisee({ seancePlanifieeId: seance.id })], '2026-11-20')).toBe('faite')
  })
  it('faite l’emporte sur sautée', () => {
    const sautee = { ...seance, sauteeLe: '2026-11-17T09:00:00.000Z' }
    expect(statutSeance(sautee, [realisee({ seancePlanifieeId: seance.id })], '2026-11-17')).toBe('faite')
  })
  it('une réalisée supprimée ou qui cite une autre séance ne compte pas', () => {
    const rs = [realisee({ seancePlanifieeId: seance.id, supprimeLe: 'x' }), realisee({ id: 'r2', seancePlanifieeId: 'autre' })]
    expect(statutSeance(seance, rs, '2026-11-17')).toBe('aujourdhui')
  })
  it('sautée, même si la date est passée', () => {
    expect(statutSeance({ ...seance, sauteeLe: 'x' }, [], '2026-11-20')).toBe('sautee')
  })
  it('manquée, aujourd’hui, à venir', () => {
    expect(statutSeance(seance, [], '2026-11-18')).toBe('manquee')
    expect(statutSeance(seance, [], '2026-11-17')).toBe('aujourdhui')
    expect(statutSeance(seance, [], '2026-11-16')).toBe('a_venir')
  })
})

describe('dureeEtapes et salleEffective', () => {
  it('additionne les durées des étapes', () => {
    expect(dureeEtapes(seance.solo.etapes)).toBe(seance.solo.etapes.reduce((t, e) => t + e.dureeMin, 0))
    expect(dureeEtapes([])).toBe(0)
  })
  const perso = (extra: Partial<SallePerso> = {}): SallePerso =>
    ({ id: MROC.id, nom: 'Mroc perso', couleurs: [], versionFormat: 1, creeLe: 'x', modifieLe: 'x', ...extra })
  it('la salle personnelle est prioritaire', () => {
    expect(salleEffective(MROC.id, [perso()]).nom).toBe('Mroc perso')
  })
  it('une salle personnelle supprimée est ignorée', () => {
    expect(salleEffective(MROC.id, [perso({ supprimeLe: 'x' })])).toBe(MROC)
  })
  it('sans salle personnelle : le préréglage', () => {
    expect(salleEffective(ARKOSE.id, [perso()])).toBe(ARKOSE)
  })
})

describe('lecture et écriture dans la base', () => {
  beforeEach(async () => {
    for (const t of [base.cycles, base.phases, base.seancesPlanifiees, base.objectifsSpecifiques, base.exercicesPerso, base.salles]) await t.clear()
  })

  const seanceLe = (id: string, date: string): SeancePlanifiee => ({ ...seance, id, date })

  it('enregistre et relit le plan du cycle, dans l’ordre', async () => {
    await enregistrerCycle(cycle)
    await enregistrerPhase(phase2)
    await enregistrerPhase(phase1)
    await enregistrerSeancePlanifiee(seanceLe('s2', '2026-11-19'))
    await enregistrerSeancePlanifiee(seanceLe('s1', '2026-11-17'))
    await enregistrerSeancePlanifiee({ ...seanceLe('s3', '2026-11-18'), cycleId: 'un-autre-cycle' })
    expect((await lireCycles()).map((c) => c.id)).toEqual([cycle.id])
    const plan = await lirePlanDuCycle(cycle.id)
    expect(plan.phases.map((p) => p.ordre)).toEqual([1, 2])
    expect(plan.seances.map((s) => s.id)).toEqual(['s1', 's2'])
    expect((await base.cycles.get(cycle.id))?.aEnvoyer).toBe(1)
  })

  it('lireSeancesEntre borne les dates (incluses)', async () => {
    for (const [id, date] of [['a', '2026-11-16'], ['b', '2026-11-17'], ['c', '2026-11-23'], ['d', '2026-11-24']]) {
      await enregistrerSeancePlanifiee(seanceLe(id, date))
    }
    expect((await lireSeancesEntre('2026-11-17', '2026-11-23')).map((s) => s.id).sort()).toEqual(['b', 'c'])
  })

  it('supprimerCycle masque le cycle, ses phases, ses objectifs et ses séances', async () => {
    await enregistrerCycle(cycle)
    await enregistrerPhase(phase1)
    await enregistrerSeancePlanifiee(seance)
    await base.objectifsSpecifiques.put({ id: 'o1', phaseId: phase1.id, libelle: 'Bidoigts', versionFormat: 1, creeLe: 'x', modifieLe: 'x', aEnvoyer: 0 })
    await enregistrerCycle({ ...cycle, id: 'garde', nom: 'À garder' })
    await enregistrerSeancePlanifiee({ ...seance, id: 'autre', cycleId: 'garde' })

    await supprimerCycle(cycle.id)

    expect(await lireSeancesEntre('2026-11-01', '2026-12-31')).toEqual([expect.objectContaining({ id: 'autre' })])
    expect((await lireCycles()).map((c) => c.id)).toEqual(['garde'])
    expect(await lirePlanDuCycle(cycle.id)).toEqual({ phases: [], seances: [] })
    const objectif = await base.objectifsSpecifiques.get('o1')
    expect(objectif?.supprimeLe).toBeTruthy()
    expect(objectif?.aEnvoyer).toBe(1) // la suppression doit partir au serveur
  })

  it('enregistre et relit exercices et salles personnels', async () => {
    await enregistrerSallePerso({ id: 'sp', nom: 'Chez moi', couleurs: [], versionFormat: 1, creeLe: 'x', modifieLe: 'x' })
    await enregistrerExercicePerso({
      id: 'e1', versionFormat: 1, creeLe: 'x', modifieLe: 'x', nom: 'Mon exo', qualite: 'doigts', resume: 'r', consigne: 'c',
      dureeMin: 10, marqueurs: null, contreIndications: [], modele: 'liste', items: [],
    } as never)
    expect((await lireSallesPerso()).map((s) => s.id)).toEqual(['sp'])
    expect((await lireExercicesPerso()).map((e) => e.id)).toEqual(['e1'])
  })
})
