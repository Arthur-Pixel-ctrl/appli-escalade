import { describe, expect, it } from 'vitest'
import type { AccentPhase, DouleurDeclaree, Profil } from '../donnees/modele.ts'
import { PROFIL_VIDE } from '../donnees/profil.ts'
import { QUALITES_PHYSIQUES } from '../donnees/modele.ts'
import { fichesDeLaBibliotheque } from './adaptateur.ts'
import { genererCycle, type EntreesGenerateur } from './generateur.ts'
import { RESISTANCE_VOIE_PAR_SEMAINE } from './reglesParDefaut.ts'
import { marqueursSeanceType, seanceTypeParId } from '../donnees/seancesTypes.ts'

const fiches = fichesDeLaBibliotheque()

// Même grimpeur que PROFIL_DE_REFERENCE (B.11), dans la forme du profil enregistré.
const PROFIL: Profil = {
  ...PROFIL_VIDE, disciplinePrincipale: 'bloc', niveauBloc: '7A', anneesPratique: 4, experiencePoutre: 'occasionnelle',
  tractionsStrictes: 12, tient15sSur25mm: true, majeur: true, grimpeEnTete: false, seancesParSemaine: 3, lieux: ['salle_bloc'],
}

const entrees = (surcharges: Partial<EntreesGenerateur> = {}): EntreesGenerateur => {
  let compteur = 0
  return {
    profil: PROFIL, douleurs: [], exercicesPerso: [], debut: '2026-11-30', nom: 'Cycle de décembre',
    seancesParSemaine: 3, accents: ['doigts', 'doigts', 'doigts'], niveauDetail: 'detaille',
    aujourdhui: '2026-11-24', maintenant: '2026-11-24T08:00:00.000Z', nouvelId: () => `id-${compteur++}`,
    ...surcharges,
  }
}
const ACCENTS: AccentPhase[] = [...QUALITES_PHYSIQUES, 'technique']
const JOURS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const jourDe = (date: string) => JOURS_FR[new Date(`${date}T12:00:00Z`).getUTCDay()]
const idsFiches = (s: { solo: { etapes: { origine?: { refId: string } }[] } }) => s.solo.etapes.map((e) => e.origine!.refId)

describe('genererCycle : profil de référence, 3 séances, accent doigts', () => {
  const plan = genererCycle(entrees())
  const phase1 = plan.seances.filter((s) => s.phaseId === plan.phases[0].id && s.semaine === 1)

  it('phase 1 = ST-DOI-02, ST-TRA-02, ST-END-02 mardi, jeudi, samedi', () => {
    expect(phase1.map((s) => s.seanceTypeId)).toEqual(['ST-DOI-02', 'ST-TRA-02', 'ST-END-02'])
    expect(phase1.map((s) => jourDe(s.date))).toEqual(['mardi', 'jeudi', 'samedi'])
    expect(phase1[0].variante).toBeUndefined()
  })

  it('12 semaines, 3 phases, cycle en brouillon, 36 séances', () => {
    expect(plan.cycle).toMatchObject({ etat: 'brouillon', nbSemaines: 12, seancesParSemaine: 3, avertissementsGardes: [], niveauDetail: 'detaille' })
    expect(plan.phases.map((p) => p.ordre)).toEqual([1, 2, 3])
    expect(plan.seances).toHaveLength(36)
    expect(plan.manques).toEqual([])
  })

  it('semaines 1 à 3 de charge, semaine 4 allégée à 50 %', () => {
    expect(plan.phases[0].semaines).toEqual([
      { numero: 1, type: 'charge' }, { numero: 2, type: 'charge' }, { numero: 3, type: 'charge' },
      { numero: 4, type: 'allegee', reductionPct: 50 },
    ])
  })

  it('semaines 1 à 3 identiques, semaine 4 allégée : bloc limite à 20 min, échauffement à 35 min', () => {
    const de = (semaine: number) => plan.seances.filter((s) => s.phaseId === plan.phases[0].id && s.semaine === semaine && s.seanceTypeId === 'ST-DOI-02')[0]
    expect(idsFiches(de(2))).toEqual(idsFiches(de(1)))
    expect(idsFiches(de(3))).toEqual(idsFiches(de(1)))
    const bloc = (s: ReturnType<typeof de>) => s.solo.etapes.find((e) => e.origine?.refId === 'puissance-bloc-limite')!
    const echauffement = (s: ReturnType<typeof de>) => s.solo.etapes.find((e) => e.origine?.refId === 'echauffement-general')!
    expect(bloc(de(1)).dureeMin).toBe(40)
    expect(bloc(de(4)).dureeMin).toBe(20)
    expect(echauffement(de(4)).dureeMin).toBe(35)
  })

  it('autant de séances maximales en semaine 4 qu\'en semaine 3', () => {
    const nbMaximales = (semaine: number) => plan.seances.filter((s) => s.phaseId === plan.phases[0].id && s.semaine === semaine)
      .filter((s) => idsFiches(s).some((id) => fiches[id].marqueurs?.includes('maximale'))).length
    expect(nbMaximales(4)).toBe(nbMaximales(3))
  })

  it('les dates suivent le début du cycle (phase 2 = 28 jours plus tard)', () => {
    expect(phase1[0].date).toBe('2026-12-01')
    expect(plan.seances.find((s) => s.phaseId === plan.phases[1].id)!.date).toBe('2026-12-29')
  })
})

describe('genererCycle : aucun avertissement fort', () => {
  for (const accent of ACCENTS) {
    for (const n of [2, 3, 4, 5]) {
      it(`accent ${accent}, ${n} séances`, () => {
        const plan = genererCycle(entrees({ seancesParSemaine: n, accents: [accent, accent, accent] }))
        expect(plan.avertissements.filter((a) => a.niveau === 'fort')).toEqual([])
        expect(plan.seances).toHaveLength(12 * n)
      })
    }
  }

  it('accents de départ différents d\'une phase à l\'autre', () => {
    const plan = genererCycle(entrees({ accents: ['doigts', 'puissance', 'resistance'] }))
    expect(plan.avertissements.filter((a) => a.niveau === 'fort')).toEqual([])
  })
})

describe('genererCycle : la banque est respectée', () => {
  const fichesDesSeances = (plan: ReturnType<typeof genererCycle>) => plan.seances.flatMap((s) => [
    ...idsFiches(s), ...(s.groupe?.miniBloc?.etapes.map((e) => e.origine!.refId) ?? []),
  ])

  it('aucune fiche hors génération, test ou contre-indiquée par une douleur (doigts)', () => {
    const plan = genererCycle(entrees({ profil: { ...PROFIL, douleursEnCours: ['doigts'] }, accents: ['doigts', 'puissance', 'resistance'] }))
    for (const id of fichesDesSeances(plan)) {
      expect(fiches[id].exclureDeLaGeneration).toBeUndefined()
      expect(fiches[id].estTest).not.toBe(true)
      expect(fiches[id].contreIndications).not.toContain('doigts')
    }
  })

  it('une douleur déclarée compte comme une douleur du profil', () => {
    const douleur: DouleurDeclaree = {
      id: 'd', versionFormat: 1, creeLe: '2026-11-20T08:00:00.000Z', modifieLe: '2026-11-20T08:00:00.000Z',
      date: '2026-11-20', zone: 'doigts', niveau: 'alerte', signes: [],
    }
    const plan = genererCycle(entrees({ douleurs: [douleur] }))
    for (const id of fichesDesSeances(plan)) expect(fiches[id].contreIndications).not.toContain('doigts')
  })

  it('discipline voie avec salle de bloc seulement : aucune fiche de terrain voie', () => {
    const plan = genererCycle(entrees({ profil: { ...PROFIL, disciplinePrincipale: 'voie', lieux: ['salle_bloc'] }, accents: ['doigts', 'endurance', 'resistance'] }))
    for (const id of fichesDesSeances(plan)) expect(fiches[id].contexte?.terrain).not.toBe('voie')
    expect(plan.seances.some((s) => s.seanceTypeId === 'ST-END-03')).toBe(false)
  })

  it('aucun maxParSemaine dépassé, aucun plafond de résistance en voie dépassé', () => {
    for (const accent of ACCENTS) {
      for (const n of [2, 3, 4, 5]) {
        const plan = genererCycle(entrees({ seancesParSemaine: n, accents: [accent, accent, accent] }))
        const parSemaine = new Map<string, typeof plan.seances>()
        for (const s of plan.seances) parSemaine.set(`${s.phaseId}-${s.semaine}`, [...(parSemaine.get(`${s.phaseId}-${s.semaine}`) ?? []), s])
        for (const seances of parSemaine.values()) {
          const nb = new Map<string, number>()
          for (const s of seances) {
            for (const id of new Set([...idsFiches(s), ...(s.groupe?.miniBloc?.etapes.map((e) => e.origine!.refId) ?? [])])) nb.set(id, (nb.get(id) ?? 0) + 1)
          }
          for (const [id, n2] of nb) {
            const max = fiches[id].maxParSemaine
            if (max !== undefined) expect(n2).toBeLessThanOrEqual(max)
          }
          const nbRes = seances.filter((s) => {
            const st = seanceTypeParId(s.seanceTypeId!)!
            return [...marqueursSeanceType(st, 'solo', s.variante), ...marqueursSeanceType(st, 'groupe', s.variante)].includes('resistance_voie')
          }).length
          expect(nbRes).toBeLessThanOrEqual(RESISTANCE_VOIE_PAR_SEMAINE.bloc)
        }
      }
    }
  })

  it('poutre « aucune » : ST-DOI-01 à la place de ST-DOI-02', () => {
    const plan = genererCycle(entrees({ profil: { ...PROFIL, experiencePoutre: 'aucune' } }))
    expect(plan.seances.filter((s) => s.semaine === 1 && s.phaseId === plan.phases[0].id)[0].seanceTypeId).toBe('ST-DOI-01')
  })

  it('poutre régulière : variante lestée de ST-DOI-02 si elle est disponible', () => {
    const plan = genererCycle(entrees({ profil: { ...PROFIL, experiencePoutre: 'reguliere' } }))
    const premiere = plan.seances.find((s) => s.seanceTypeId === 'ST-DOI-02')
    expect(premiere?.variante).toBe('lestee')
  })

  it('une case « entretien » ne prend jamais la variante lestée', () => {
    const plan = genererCycle(entrees({ profil: { ...PROFIL, experiencePoutre: 'reguliere' }, accents: ['resistance', 'resistance', 'resistance'] }))
    expect(plan.seances.find((s) => s.seanceTypeId === 'ST-DOI-02')?.variante).toBe('entretien')
  })
})

describe('genererCycle : jours, niveaux et manques', () => {
  it('grimpeur de voie avec salle de voies : la dernière séance devient ST-END-03 si elle est disponible', () => {
    const plan = genererCycle(entrees({
      profil: { ...PROFIL, disciplinePrincipale: 'voie', lieux: ['salle_voie'], grimpeEnTete: true },
      accents: ['doigts', 'endurance', 'resistance'],
    }))
    const semaine = plan.seances.filter((s) => s.phaseId === plan.phases[0].id && s.semaine === 1)
    expect(semaine[semaine.length - 1].seanceTypeId).toBe('ST-END-03')
    expect(plan.avertissements.filter((a) => a.niveau === 'fort')).toEqual([])
  })

  it('moins de jours que de séances : le plan en compte autant que de jours, et le dit', () => {
    const plan = genererCycle(entrees({ profil: { ...PROFIL, joursDisponibles: ['mardi', 'samedi'] } }))
    expect(plan.manques).toContain('Tu as 2 jours disponibles pour 3 séances : le plan en compte 2.')
    expect(plan.seances).toHaveLength(24)
    expect(plan.cycle.seancesParSemaine).toBe(2)
  })

  it('jours disponibles sans les jours conseillés : les premiers jours disponibles', () => {
    const plan = genererCycle(entrees({ profil: { ...PROFIL, joursDisponibles: ['mercredi', 'vendredi', 'dimanche', 'lundi'] } }))
    expect(plan.seances.slice(0, 3).map((s) => jourDe(s.date))).toEqual(['lundi', 'mercredi', 'vendredi'])
  })

  it('un début qui n\'est pas un lundi est repoussé au lundi suivant, et le dit', () => {
    const plan = genererCycle(entrees({ debut: '2026-12-02' }))
    expect(plan.cycle.debut).toBe('2026-12-07')
    expect(plan.manques.some((m) => m.includes('lundi'))).toBe(true)
  })

  it('semaine allégée désactivée : quatre semaines de charge', () => {
    const plan = genererCycle(entrees({ reglages: { reglesSecurite: { dechargeActive: false } } }))
    expect(plan.phases[0].semaines[3]).toEqual({ numero: 4, type: 'charge' })
    const s1 = plan.seances.find((s) => s.semaine === 1 && s.seanceTypeId === 'ST-DOI-02')!
    const s4 = plan.seances.find((s) => s.semaine === 4 && s.seanceTypeId === 'ST-DOI-02')!
    expect(idsFiches(s4)).toEqual(idsFiches(s1))
    expect(s4.solo.etapes.map((e) => e.dureeMin)).toEqual(s1.solo.etapes.map((e) => e.dureeMin))
  })

  it('réduction réglée : 40 % → bloc limite à 24 min', () => {
    const plan = genererCycle(entrees({ reglages: { reglesSecurite: { dechargeReductionPct: 40 } } }))
    const s4 = plan.seances.find((s) => s.semaine === 4 && s.seanceTypeId === 'ST-DOI-02')!
    expect(s4.solo.etapes.find((e) => e.origine?.refId === 'puissance-bloc-limite')!.dureeMin).toBe(24)
    expect(plan.phases[0].semaines[3].reductionPct).toBe(40)
  })

  it('mêmes étapes aux niveaux simple et détaillé, recommandation toujours présente', () => {
    const simple = genererCycle(entrees({ niveauDetail: 'simple' }))
    const detaille = genererCycle(entrees({ niveauDetail: 'detaille' }))
    expect(simple.seances).toEqual(detaille.seances)
    expect(simple.cycle.niveauDetail).toBe('simple')
    expect(simple.seances.every((s) => s.niveauDetail === undefined && (s.solo.recommandation ?? '') !== '')).toBe(true)
    expect(simple.seances.every((s) => s.solo.etapes.length > 0)).toBe(true)
  })

  it('une case sans séance possible donne un repos et le dit', () => {
    // Prérequis tous manquants et salle de bloc : seules les séances sans exigence restent, jamais zéro document invalide.
    const plan = genererCycle(entrees({ profil: { ...PROFIL, anneesPratique: 0, tractionsStrictes: null, tient15sSur25mm: null, majeur: null, experiencePoutre: 'aucune' } }))
    expect(plan.seances.length + plan.manques.length).toBeGreaterThan(0)
    expect(plan.cycle.etat).toBe('brouillon')
  })

  it('fonction pure : mêmes entrées, même plan', () => {
    expect(genererCycle(entrees())).toEqual(genererCycle(entrees()))
  })
})
