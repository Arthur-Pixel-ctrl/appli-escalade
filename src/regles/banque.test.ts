import { describe, expect, it } from 'vitest'
import { SEANCES_TYPES } from '../donnees/seancesTypes.ts'
import { fichesDeLaBibliotheque } from './adaptateur.ts'
import { lieuPermet, phraseRaison, seancesTypesDisponibles, trierFiches } from './banque.ts'
import { PROFIL_DE_REFERENCE } from './exemples.ts'
import type { FicheVerif, ProfilVerif } from './types.ts'

const toutes = Object.values(fichesDeLaBibliotheque())
const profil = (surcharges: Partial<ProfilVerif> = {}): ProfilVerif => ({ ...PROFIL_DE_REFERENCE, ...surcharges })
const raisonDe = (id: string, p: ProfilVerif, zones: Parameters<typeof trierFiches>[2] = []) =>
  trierFiches(toutes, p, zones).indisponibles.find((i) => i.fiche.id === id)?.raison
const idsSeances = (p: ProfilVerif, zones: Parameters<typeof trierFiches>[2] = []) =>
  seancesTypesDisponibles(trierFiches(toutes, p, zones).disponibles)

// Une fiche inventée : seul ce qu'on précise change.
const fiche = (id: string, surcharges: Partial<FicheVerif> = {}): FicheVerif => ({
  id, nom: id, origine: 'bibliotheque', qualite: 'technique', dureeMin: 10, marqueurs: [],
  prerequis: {}, contreIndications: [], solliciteDoigts: false, ...surcharges,
})

describe('lieuPermet (§ 2.2)', () => {
  it('terrain absent, bloc ou pan : une salle suffit, pas la maison', () => {
    for (const terrain of [undefined, 'bloc', 'pan'] as const) {
      expect(lieuPermet(terrain, ['salle_bloc'])).toBe(true)
      expect(lieuPermet(terrain, ['salle_voie'])).toBe(true)
      expect(lieuPermet(terrain, ['maison'])).toBe(false)
    }
  })
  it('voie : seulement une salle avec des voies', () => {
    expect(lieuPermet('voie', ['salle_bloc'])).toBe(false)
    expect(lieuPermet('voie', ['maison'])).toBe(false)
    expect(lieuPermet('voie', ['salle_bloc', 'salle_voie'])).toBe(true)
  })
  it('poutre et barre : une salle ou la maison', () => {
    for (const terrain of ['poutre', 'barre'] as const) {
      expect(lieuPermet(terrain, ['maison'])).toBe(true)
      expect(lieuPermet(terrain, ['salle_bloc'])).toBe(true)
    }
  })
  it('sol : toujours, même sans lieu', () => {
    expect(lieuPermet('sol', [])).toBe(true)
    expect(lieuPermet('sol', ['maison'])).toBe(true)
  })
  it('lieux vides : on suppose une salle de bloc seulement (prudence)', () => {
    expect(lieuPermet('bloc', [])).toBe(true)
    expect(lieuPermet('voie', [])).toBe(false)
    expect(lieuPermet('poutre', [])).toBe(true)
  })
})

describe('trierFiches : une raison par cas', () => {
  it('a_verifier : exclue de la génération', () => {
    expect(raisonDe('puissance-pan-gullich-stien', profil())).toBe('a_verifier')
  })
  it('test : une fiche de test n\'est jamais proposée', () => {
    const r = trierFiches([fiche('t', { estTest: true })], profil(), [])
    expect(r.indisponibles).toEqual([{ fiche: expect.objectContaining({ id: 't' }), raison: 'test' }])
  })
  it('prerequis : doigts-suspensions-max-lestees avec une poutre occasionnelle', () => {
    expect(raisonDe('doigts-suspensions-max-lestees', profil())).toBe('prerequis')
    expect(raisonDe('doigts-suspensions-max-lestees', profil({ experiencePoutre: 'reguliere', anneesPratique: 4 }))).toBeUndefined()
  })
  it('prerequis : une donnée non renseignée compte comme non remplie', () => {
    const f = fiche('p', { prerequis: { tractionsStrictesMin: 5 } })
    expect(trierFiches([f], profil({ tractionsStrictesMax: null }), []).indisponibles[0]?.raison).toBe('prerequis')
  })
  it('douleur : zone déclarée du jour', () => {
    expect(raisonDe('puissance-bloc-limite', profil(), ['doigts'])).toBe('douleur')
    expect(raisonDe('puissance-bloc-limite', profil(), [])).toBeUndefined()
  })
  it('contexte : lieux salle de bloc seulement', () => {
    expect(raisonDe('endurance-4x4-voies', profil({ lieux: ['salle_bloc'] }))).toBe('contexte')
  })
  it('contexte : salle avec des voies, la fiche est disponible', () => {
    expect(raisonDe('endurance-4x4-voies', profil({ lieux: ['salle_voie'] }))).toBeUndefined()
  })
  it('contexte : grimpe en tête exigée et non remplie (ou non renseignée)', () => {
    const f = fiche('tete', { contexte: { terrain: 'voie', grimpeEnTete: true } })
    const voie = { lieux: ['salle_voie' as const] }
    expect(trierFiches([f], profil({ ...voie, grimpeEnTete: false }), []).indisponibles[0]?.raison).toBe('contexte')
    expect(trierFiches([f], profil({ ...voie, grimpeEnTete: null }), []).indisponibles[0]?.raison).toBe('contexte')
    expect(trierFiches([f], profil({ ...voie, grimpeEnTete: true }), []).disponibles).toHaveLength(1)
  })
  it('contexte : la maison ne permet pas une fiche de bloc', () => {
    const f = fiche('b', { contexte: { terrain: 'bloc' } })
    expect(trierFiches([f], profil({ lieux: ['maison'] }), []).indisponibles[0]?.raison).toBe('contexte')
  })
})

describe('trierFiches : ordre des raisons (la première l\'emporte)', () => {
  const tout = fiche('x', {
    exclureDeLaGeneration: 'à relire', estTest: true, prerequis: { anneesPratiqueMin: 99 },
    contreIndications: ['doigts'], contexte: { terrain: 'voie' },
  })
  const raison = (f: FicheVerif) => trierFiches([f], profil(), ['doigts']).indisponibles[0]?.raison
  it('a_verifier avant test, prérequis, douleur et contexte', () => {
    expect(raison(tout)).toBe('a_verifier')
  })
  it('test avant prérequis, douleur et contexte', () => {
    expect(raison({ ...tout, exclureDeLaGeneration: undefined })).toBe('test')
  })
  it('prérequis avant douleur et contexte', () => {
    expect(raison({ ...tout, exclureDeLaGeneration: undefined, estTest: undefined })).toBe('prerequis')
  })
  it('douleur avant contexte', () => {
    expect(raison({ ...tout, exclureDeLaGeneration: undefined, estTest: undefined, prerequis: {} })).toBe('douleur')
  })
  it('exclue ET prérequis manquant : a_verifier (la fiche reste exclue même si le profil remplit tout)', () => {
    const f = fiche('y', { exclureDeLaGeneration: 'à relire', prerequis: { anneesPratiqueMin: 99 } })
    expect(trierFiches([f], profil(), []).indisponibles[0]?.raison).toBe('a_verifier')
  })
})

describe('trierFiches : tri et partition', () => {
  it('disponibles + indisponibles = toutes les fiches, sans doublon, dans l\'ordre d\'entrée', () => {
    const r = trierFiches(toutes, profil(), ['doigts'])
    const ids = [...r.disponibles.map((f) => f.id), ...r.indisponibles.map((i) => i.fiche.id)]
    expect(ids).toHaveLength(toutes.length)
    expect(new Set(ids).size).toBe(toutes.length)
    const ordre = (liste: string[]) => liste.map((id) => toutes.findIndex((f) => f.id === id))
    const croissant = (n: number[]) => n.every((v, i) => i === 0 || (n[i - 1] as number) < v)
    expect(croissant(ordre(r.disponibles.map((f) => f.id)))).toBe(true)
    expect(croissant(ordre(r.indisponibles.map((i) => i.fiche.id)))).toBe(true)
  })
  it('aucune fiche de test ni exclue dans « disponibles », quel que soit le profil', () => {
    const experimente = profil({
      experiencePoutre: 'reguliere', anneesPratique: 10, tractionsStrictesMax: 30, niveauBloc: '8A',
      grimpeEnTete: true, lieux: ['salle_bloc', 'salle_voie', 'maison'],
    })
    const mixte = [...toutes, fiche('test-inventé', { estTest: true })]
    for (const p of [profil(), experimente]) {
      const { disponibles } = trierFiches(mixte, p, [])
      expect(disponibles.some((f) => f.estTest === true || f.exclureDeLaGeneration !== undefined)).toBe(false)
    }
  })
  it('n\'agit pas sur ses entrées', () => {
    const copie = JSON.stringify(toutes)
    trierFiches(toutes, profil(), ['doigts'])
    expect(JSON.stringify(toutes)).toBe(copie)
  })
})

describe('phraseRaison', () => {
  const p = profil()
  const phrase = (id: string, zones: Parameters<typeof trierFiches>[2] = [], pr = p) => {
    const i = trierFiches(toutes, pr, zones).indisponibles.find((x) => x.fiche.id === id)
    if (!i) throw new Error(`fiche disponible : ${id}`)
    return phraseRaison(i, pr, zones)
  }
  it('dit la raison en clair pour chaque cas', () => {
    expect(phrase('puissance-pan-gullich-stien')).toContain('À la main seulement')
    expect(phrase('doigts-suspensions-max-lestees')).toContain('Prérequis manquants')
    expect(phrase('puissance-bloc-limite', ['doigts'])).toContain('douleur déclarée')
    expect(phrase('endurance-4x4-voies')).toContain('lieux')
    const test = phraseRaison({ fiche: fiche('t', { estTest: true }), raison: 'test' }, p, [])
    expect(test).toContain('test')
  })
  it('contexte « en tête »', () => {
    const f = fiche('tete', { contexte: { terrain: 'voie', grimpeEnTete: true } })
    expect(phraseRaison({ fiche: f, raison: 'contexte' }, profil({ grimpeEnTete: false }), [])).toContain('en tête')
  })
})

describe('seancesTypesDisponibles', () => {
  const ids = (p: ProfilVerif, zones: Parameters<typeof trierFiches>[2] = []) => idsSeances(p, zones).map((s) => s.seanceType.id)

  it('profil de référence (salle de bloc, poutre occasionnelle) : séances de bloc, de poutre et de maison', () => {
    const dispo = ids(profil())
    expect(dispo).toEqual(expect.arrayContaining([
      'ST-DOI-01', 'ST-DOI-02', 'ST-TRA-02', 'ST-PUI-01', 'ST-END-01', 'ST-END-02', 'ST-TEC-01', 'ST-HOR-01',
    ]))
  })
  it('profil de référence : une séance qui exige des voies ou une fiche à vérifier est écartée', () => {
    const dispo = ids(profil())
    const ecartees = SEANCES_TYPES.map((s) => s.id).filter((id) => !dispo.includes(id))
    expect(ecartees.length).toBeGreaterThan(0)
    expect(dispo).not.toContain('ST-END-03') // endurance-4x4-voies
  })
  it('profil de référence : variantes — entretien oui, lestée non (poutre régulière exigée)', () => {
    const doi02 = idsSeances(profil()).find((s) => s.seanceType.id === 'ST-DOI-02')
    expect(doi02?.variantes).toEqual(['entretien'])
  })
  it('poutre régulière : la variante lestée apparaît', () => {
    const doi02 = idsSeances(profil({ experiencePoutre: 'reguliere' })).find((s) => s.seanceType.id === 'ST-DOI-02')
    expect(doi02?.variantes).toContain('lestee')
  })
  it('poutre « aucune » : ST-DOI-01 présente, ST-DOI-02 absente', () => {
    const dispo = ids(profil({ experiencePoutre: 'aucune' }))
    expect(dispo).toContain('ST-DOI-01')
    expect(dispo).not.toContain('ST-DOI-02')
  })
  it('douleur aux doigts : ST-DOI-02 absente, ST-END-01 présente', () => {
    const dispo = ids(profil(), ['doigts'])
    expect(dispo).not.toContain('ST-DOI-02')
    expect(dispo).toContain('ST-END-01')
  })
  it('salle avec des voies : une séance de plus qu\'en salle de bloc seule, ST-END-03 comprise', () => {
    const bloc = ids(profil())
    const voie = ids(profil({ lieux: ['salle_voie'] }))
    expect(voie.length).toBeGreaterThan(bloc.length)
    expect(voie).toContain('ST-END-03')
  })
  it('chaque séance proposée a toutes ses fiches (solo et mini-bloc) disponibles', () => {
    const { disponibles } = trierFiches(toutes, profil(), [])
    const ok = new Set(disponibles.map((f) => f.id))
    for (const { seanceType: st } of idsSeances(profil())) {
      const fiches = [...st.solo, ...(st.groupe?.miniBloc?.etapes ?? [])].map((e) => e.ficheId)
      expect(fiches.every((id) => ok.has(id))).toBe(true)
    }
  })
  it('les 26 séances types : la liste disponible avec le profil habituel ne change pas avec les objectifs de groupe', () => {
    expect(SEANCES_TYPES).toHaveLength(26)
    // Valeurs mesurées avant et après la correction M-9 : salle de bloc 20, salle avec voies 24.
    expect(ids(profil())).toHaveLength(20)
    expect(ids(profil({ lieux: ['salle_voie'] }))).toHaveLength(24)
  })
  it('M-9 : ST-END-04 et ST-TEC-02 (OG-18 → endurance-4x4-voies) sont indisponibles sans salle de voie', () => {
    const bloc = ids(profil({ lieux: ['salle_bloc'] }))
    expect(bloc).not.toContain('ST-END-04')
    expect(bloc).not.toContain('ST-TEC-02')
    const voie = ids(profil({ lieux: ['salle_voie'] }))
    expect(voie).toContain('ST-END-04')
    expect(voie).toContain('ST-TEC-02')
    // La raison est celle de la fiche de l'objectif : « contexte ».
    expect(raisonDe('endurance-4x4-voies', profil({ lieux: ['salle_bloc'] }))).toBe('contexte')
  })
  it('M-9 : seul l\'objectif de groupe renvoie à une fiche hors lieux, le solo est sans souci', () => {
    // Séance inventée : solo faisable en salle de bloc, mais objectif OG-18 (fiche en voie).
    const base = SEANCES_TYPES.find((s) => s.id === 'ST-DOI-01')!
    const seance = { ...base, id: 'ST-TEST', groupe: { objectifIds: ['OG-18'] } }
    const dispo = (p: ProfilVerif) => seancesTypesDisponibles(trierFiches(toutes, p, []).disponibles, [seance]).length
    expect(dispo(profil({ lieux: ['salle_bloc'] }))).toBe(0)
    expect(dispo(profil({ lieux: ['salle_voie'] }))).toBe(1)
    // Sans l'objectif de voie, la même séance reste disponible.
    const sansObjectif = seancesTypesDisponibles(
      trierFiches(toutes, profil({ lieux: ['salle_bloc'] }), []).disponibles,
      [{ ...seance, groupe: { objectifIds: ['OG-01'] } }],
    )
    expect(sansObjectif).toHaveLength(1)
  })
  it('sans fiche disponible : aucune séance type', () => {
    expect(seancesTypesDisponibles([])).toEqual([])
  })
})
