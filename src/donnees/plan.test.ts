import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { serveurMemoire } from '../synchro/serveurMemoire.ts'
import { synchroniser } from '../synchro/synchro.ts'
import { base } from './base.ts'
import { EXEMPLE_CYCLE, EXEMPLE_PHASES, EXEMPLE_SEANCE_PLANIFIEE } from './exemplesV2.ts'
import type { Cycle, SallePerso, SeancePlanifiee, SeanceRealisee } from './modele.ts'
import {
  ajouterJours, annulerSaut, cycleEnCours, deplacerSeance, joursPossibles, sauterSeance, cycleTermine, debutPhase, debutSemaine, dureeEtapes, enregistrerCycle,
  enregistrerExercicePerso, enregistrerPhase, enregistrerSallePerso, enregistrerSeancePlanifiee, finCycle,
  lireCycles, lireExercicesPerso, lirePlanDuCycle, lirePlanEnCours, lireSeancePlanifiee, lireSallesPerso, lireSeancesEntre, salleEffective,
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

  describe('lirePlanEnCours (amendement 7 de D-22)', () => {
    const AUJOURDHUI = '2026-11-17'
    const autreCycle: Cycle = { ...cycle, id: 'autre-cycle', nom: 'Autre', etat: 'brouillon' }

    it('un cycle brouillon qui couvre aujourd’hui, avec une séance aujourd’hui : rien', async () => {
      await enregistrerCycle({ ...cycle, etat: 'brouillon' })
      await enregistrerPhase(phase1)
      await enregistrerSeancePlanifiee(seanceLe('s1', AUJOURDHUI))
      expect(await lirePlanEnCours(AUJOURDHUI)).toBeNull()
    })

    it('un cycle validé et un brouillon le même jour : seule la séance du cycle validé', async () => {
      await enregistrerCycle(cycle)
      await enregistrerPhase(phase1)
      await enregistrerSeancePlanifiee(seanceLe('valide', AUJOURDHUI))
      await enregistrerCycle(autreCycle)
      await enregistrerPhase({ ...phase1, id: 'phase-autre', cycleId: autreCycle.id })
      await enregistrerSeancePlanifiee({ ...seanceLe('brouillon', AUJOURDHUI), cycleId: autreCycle.id, phaseId: 'phase-autre' })
      const plan = await lirePlanEnCours(AUJOURDHUI)
      expect(plan?.cycle.id).toBe(cycle.id)
      expect(plan?.seances.map((s) => s.id)).toEqual(['valide'])
    })

    it('une séance dont la phase est supprimée, ou inconnue, est absente', async () => {
      await enregistrerCycle(cycle)
      await enregistrerPhase(phase1)
      await enregistrerPhase(phase2)
      await enregistrerSeancePlanifiee(seanceLe('bonne', AUJOURDHUI))
      await enregistrerSeancePlanifiee({ ...seanceLe('phase-supprimee', '2026-12-15'), phaseId: phase2.id })
      await enregistrerSeancePlanifiee({ ...seanceLe('orpheline', '2026-11-18'), phaseId: 'phase-qui-n-existe-pas' })
      await base.phases.update(phase2.id, { supprimeLe: '2026-11-17T08:00:00.000Z' })
      const plan = await lirePlanEnCours(AUJOURDHUI)
      expect(plan?.phases.map((p) => p.id)).toEqual([phase1.id])
      expect(plan?.seances.map((s) => s.id)).toEqual(['bonne'])
    })

    it('le cycle validé supprimé par supprimerCycle : rien', async () => {
      await enregistrerCycle(cycle)
      await enregistrerPhase(phase1)
      await enregistrerSeancePlanifiee(seanceLe('s1', AUJOURDHUI))
      await supprimerCycle(cycle.id)
      expect(await lirePlanEnCours(AUJOURDHUI)).toBeNull()
    })

    it('aucun cycle, ou un cycle qui ne couvre pas la date : rien', async () => {
      expect(await lirePlanEnCours(AUJOURDHUI)).toBeNull()
      await enregistrerCycle(cycle)
      expect(await lirePlanEnCours('2026-11-15')).toBeNull()
      expect(await lirePlanEnCours('2027-02-08')).toBeNull()
    })
  })

  it('lireSeancePlanifiee relit une séance, pas une séance supprimée', async () => {
    await enregistrerSeancePlanifiee(seanceLe('s1', '2026-11-17'))
    expect((await lireSeancePlanifiee('s1'))?.id).toBe('s1')
    expect(await lireSeancePlanifiee('inconnue')).toBeUndefined()
    await base.seancesPlanifiees.update('s1', { supprimeLe: 'x' })
    expect(await lireSeancePlanifiee('s1')).toBeUndefined()
  })
})

describe('petits ajustements du téléphone (B11)', () => {
  beforeEach(async () => {
    for (const t of base.tables) await t.clear()
  })

  describe('joursPossibles', () => {
    it('les jours restants de la semaine, sauf le jour de la séance', () => {
      expect(joursPossibles(seance, '2026-11-16')).toEqual(['2026-11-16', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'])
      expect(joursPossibles(seance, '2026-11-17')).toEqual(['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'])
    })
    it('jamais un jour passé', () => {
      expect(joursPossibles({ ...seance, date: '2026-11-21' }, '2026-11-21')).toEqual(['2026-11-22'])
      expect(joursPossibles({ ...seance, date: '2026-11-22' }, '2026-11-21')).toEqual(['2026-11-21'])
      expect(joursPossibles({ ...seance, date: '2026-11-22' }, '2026-11-22')).toEqual([])
    })
    it('une séance manquée ou sautée n’a aucun jour : pas de rattrapage', () => {
      expect(joursPossibles(seance, '2026-11-18')).toEqual([])
      expect(joursPossibles({ ...seance, date: '2026-11-19', sauteeLe: '2026-11-17T08:00:00.000Z' }, '2026-11-18')).toEqual([])
    })
    it('un jour qui a déjà une séance reste possible', () => {
      expect(joursPossibles(seance, '2026-11-16')).toContain('2026-11-19') // même s'il en porte déjà une
    })
  })

  describe('deplacerSeance', () => {
    it('change la date seulement, et marque le document à envoyer', async () => {
      await enregistrerSeancePlanifiee(seance)
      const avant = (await base.seancesPlanifiees.get(seance.id))!
      await new Promise((r) => setTimeout(r, 5))
      await deplacerSeance(seance.id, '2026-11-19', '2026-11-16')
      const apres = (await base.seancesPlanifiees.get(seance.id))!
      expect(apres.date).toBe('2026-11-19')
      expect(apres.semaine).toBe(avant.semaine)
      expect(apres.phaseId).toBe(avant.phaseId)
      expect(apres.solo).toEqual(avant.solo)
      expect(apres.groupe).toEqual(avant.groupe)
      expect(apres.modifieLe > avant.modifieLe).toBe(true)
      expect(apres.aEnvoyer).toBe(1)
    })
    it('refuse un jour passé ou d’une autre semaine : rien n’est écrit', async () => {
      await enregistrerSeancePlanifiee(seance)
      const avant = await base.seancesPlanifiees.get(seance.id)
      await expect(deplacerSeance(seance.id, '2026-11-15', '2026-11-16')).rejects.toThrow('Ce jour n’est pas possible')
      await expect(deplacerSeance(seance.id, '2026-11-23', '2026-11-16')).rejects.toThrow('Ce jour n’est pas possible')
      expect(await base.seancesPlanifiees.get(seance.id)).toEqual(avant)
    })
    it('refuse une séance manquée', async () => {
      await enregistrerSeancePlanifiee(seance)
      await expect(deplacerSeance(seance.id, '2026-11-20', '2026-11-18')).rejects.toThrow('Ce jour n’est pas possible')
    })
    it('refuse un identifiant inconnu', async () => {
      await expect(deplacerSeance('inconnue', '2026-11-19', '2026-11-16')).rejects.toThrow('Séance introuvable.')
    })
  })

  describe('sauterSeance et annulerSaut', () => {
    it('sautée puis annulée : le statut se calcule, le champ disparaît', async () => {
      await enregistrerSeancePlanifiee(seance)
      await sauterSeance(seance.id)
      const sautee = (await lireSeancePlanifiee(seance.id))!
      expect(sautee.sauteeLe).toBeTruthy()
      expect(statutSeance(sautee, [], '2026-11-16')).toBe('sautee')
      await annulerSaut(seance.id)
      const relue = (await base.seancesPlanifiees.get(seance.id))!
      expect('sauteeLe' in relue).toBe(false)
      expect(statutSeance(relue, [], '2026-11-16')).toBe('a_venir')
    })
    it('refuse un identifiant inconnu', async () => {
      await expect(sauterSeance('inconnue')).rejects.toThrow('Séance introuvable.')
      await expect(annulerSaut('inconnue')).rejects.toThrow('Séance introuvable.')
    })
  })

  describe('conflit avec l’ordinateur : la dernière modification gagne', () => {
    const MOI = 'utilisateur-1'
    const ligneOrdinateur = (modifieLe: string, date: string) => ({
      user_id: MOI, type: 'seancesPlanifiees' as const, id: seance.id, modifie_le: modifieLe, supprime_le: null,
      contenu: { ...seance, date, modifieLe },
    })

    it('une version plus récente de l’ordinateur l’emporte, en entier', async () => {
      const serveur = serveurMemoire()
      await enregistrerSeancePlanifiee(seance)
      await deplacerSeance(seance.id, '2026-11-19', '2026-11-16')
      const local = (await base.seancesPlanifiees.get(seance.id))!
      const apres = new Date(Date.parse(local.modifieLe) + 60_000).toISOString()
      await serveur.envoyer([ligneOrdinateur(apres, '2026-11-20')])
      await synchroniser(serveur, MOI)
      const final = (await base.seancesPlanifiees.get(seance.id))!
      expect(final.date).toBe('2026-11-20')
      expect(final.modifieLe).toBe(apres)
      expect(final.aEnvoyer).toBe(0)
    })

    it('une version plus ancienne de l’ordinateur n’efface pas le déplacement, qui part au serveur', async () => {
      const serveur = serveurMemoire()
      await enregistrerSeancePlanifiee(seance)
      await deplacerSeance(seance.id, '2026-11-19', '2026-11-16')
      const local = (await base.seancesPlanifiees.get(seance.id))!
      const avant = new Date(Date.parse(local.modifieLe) - 60_000).toISOString()
      await serveur.envoyer([ligneOrdinateur(avant, '2026-11-20')])
      await synchroniser(serveur, MOI)
      expect((await base.seancesPlanifiees.get(seance.id))!.date).toBe('2026-11-19')
      expect(serveur.lignes.get(`seancesPlanifiees/${seance.id}`)?.contenu.date).toBe('2026-11-19')
    })
  })
})
