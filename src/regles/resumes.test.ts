import { describe, expect, it } from 'vitest'
import type { VersionSolo } from '../donnees/modele.ts'
import { LONGUEUR_MAX_RECOMMANDATION, NB_PARTIES_MAX } from '../donnees/niveaux.ts'
import { SEANCES_TYPES, seanceTypeParId } from '../donnees/seancesTypes.ts'
import { fichesDeLaBibliotheque } from './adaptateur.ts'
import { seanceDepuisType } from './passerelles.ts'
import { partiesAffichees, partiesDepuisEtapes, recommandationAffichee, recommandationParDefaut } from './resumes.ts'

const fiches = fichesDeLaBibliotheque()
const base = { id: 's', cycleId: 'c', phaseId: 'p', semaine: 1 as const, date: '2026-11-24', maintenant: '2026-11-24T08:00:00.000Z' }
const depuisType = (id: string, variante?: string) => seanceDepuisType(seanceTypeParId(id)!, variante, base)

describe('partiesDepuisEtapes', () => {
  it('ST-DOI-02 : 3 parties de 43, 47 et 20 min', () => {
    const s = depuisType('ST-DOI-02')
    const parties = partiesDepuisEtapes(s.solo.etapes, s.qualite, fiches)
    expect(parties.map((p) => p.titre)).toEqual(['Échauffement', 'Effort principal', 'Antagonistes'])
    expect(parties.map((p) => p.dureeMin)).toEqual([43, 47, 20])
    expect(parties[1].consigne).toContain('Bloc limite')
    expect(parties[1].principal?.refId).toBeDefined()
  })

  it('ST-END-01 : échauffement, technique, effort principal, retour au calme', () => {
    const s = depuisType('ST-END-01')
    const titres = partiesDepuisEtapes(s.solo.etapes, s.qualite, fiches).map((p) => p.titre)
    expect(titres).toEqual(['Échauffement', 'Technique', 'Effort principal', 'Retour au calme'])
  })

  it('chacune des 26 séances types (et variantes) donne 2 à 5 parties', () => {
    expect(SEANCES_TYPES).toHaveLength(26)
    for (const st of SEANCES_TYPES) {
      for (const variante of [undefined, ...Object.keys(st.variantes)]) {
        const s = seanceDepuisType(st, variante, base)
        const n = partiesDepuisEtapes(s.solo.etapes, s.qualite, fiches).length
        expect(n, `${st.id} ${variante ?? ''}`).toBeGreaterThanOrEqual(2)
        expect(n, `${st.id} ${variante ?? ''}`).toBeLessThanOrEqual(5)
      }
    }
  })

  it('une étape sans fiche connue va en Complément, sans exercice principal', () => {
    const s = depuisType('ST-DOI-02')
    const sansOrigine = s.solo.etapes.map((e) => ({ ...e, origine: undefined }))
    const parties = partiesDepuisEtapes(sansOrigine, s.qualite, fiches)
    expect(parties).toHaveLength(1)
    expect(parties[0].titre).toBe('Complément')
    expect(parties[0].principal).toBeUndefined()
  })

  it('jamais plus de 5 parties, même si les familles alternent', () => {
    const s = depuisType('ST-DOI-02')
    const [a, b] = [s.solo.etapes[0], s.solo.etapes[4]] // échauffement, antagonistes
    const alterne = [a, b, a, b, a, b, a].map((e, i) => ({ ...e, id: `e${i}` }))
    expect(partiesDepuisEtapes(alterne, s.qualite, fiches)).toHaveLength(NB_PARTIES_MAX)
  })

  it('sans étape : aucune partie', () => {
    expect(partiesDepuisEtapes([], 'doigts', fiches)).toEqual([])
  })
})

describe('recommandations', () => {
  const vide: VersionSolo = { nom: 'x', etapes: [], durete: 'legere' }

  it('avec des étapes : les titres de l\'effort principal', () => {
    const s = depuisType('ST-DOI-02')
    const r = recommandationParDefaut(s.solo, s.qualite, 'dure', fiches)
    expect(r).toContain('Bloc limite')
    expect(r.length).toBeLessThanOrEqual(LONGUEUR_MAX_RECOMMANDATION)
  })

  it('avec des parties écrites : les deux premières reliées par « puis »', () => {
    const v: VersionSolo = { ...vide, parties: [{ titre: 'A', dureeMin: 10 }, { titre: 'B', dureeMin: 10 }, { titre: 'C', dureeMin: 10 }] }
    expect(recommandationParDefaut(v, 'doigts', 'dure', fiches)).toBe('A puis B')
  })

  it('sans rien : phrase prudente', () => {
    expect(recommandationParDefaut(vide, 'endurance', 'legere', fiches)).toBe('Séance endurance, légère : grimpe à ton idée.')
    expect(recommandationParDefaut(vide, 'doigts', 'dure', fiches)).toBe('Séance force des doigts, dure : grimpe à ton idée.')
  })

  it('une recommandation trop longue est coupée à 120 caractères', () => {
    const v: VersionSolo = { ...vide, parties: [{ titre: 'x'.repeat(100), dureeMin: 10 }, { titre: 'y'.repeat(100), dureeMin: 10 }] }
    expect(recommandationParDefaut(v, 'doigts', 'dure', fiches).length).toBe(LONGUEUR_MAX_RECOMMANDATION)
  })

  it('l\'écrit l\'emporte sur le calculé', () => {
    const s = depuisType('ST-DOI-02')
    expect(recommandationAffichee({ ...s.solo, recommandation: 'Ma ligne' }, s.qualite, 'dure', fiches)).toBe('Ma ligne')
    const sans = { ...s.solo, recommandation: undefined }
    expect(recommandationAffichee(sans, s.qualite, 'dure', fiches)).toBe(recommandationParDefaut(sans, s.qualite, 'dure', fiches))
    const parties = [{ titre: 'Écrite', dureeMin: 30 }]
    expect(partiesAffichees({ ...s.solo, parties }, s.qualite, fiches)).toBe(parties)
    expect(partiesAffichees(s.solo, s.qualite, fiches)).toHaveLength(3)
  })
})
