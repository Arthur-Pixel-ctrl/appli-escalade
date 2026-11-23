import { describe, expect, it } from 'vitest'
import { BIBLIOTHEQUE, peutEtreGeneree, protocoleParId } from './bibliotheque/index.ts'
import type { Marqueur } from './bibliotheque/types.ts'
import { LONGUEUR_MAX_RECOMMANDATION } from './niveaux.ts'
import { OBJECTIFS_GROUPE, marqueursObjectif, objectifGroupeParId } from './objectifsGroupe.ts'
import {
  SEANCES_TYPES, contreIndicationsSeanceType, dureeSeanceType, marqueursSeanceType,
  prerequisSeanceType, recommandationSeanceType, seanceTypeParId,
  type EtapeType, type SeanceType,
} from './seancesTypes.ts'

const seance = (id: string): SeanceType => {
  const st = seanceTypeParId(id)
  if (st === undefined) throw new Error(`Séance type introuvable : ${id}`)
  return st
}
const objectif = (id: string) => {
  const o = objectifGroupeParId(id)
  if (o === undefined) throw new Error(`Objectif introuvable : ${id}`)
  return o
}

/** Toutes les listes d'étapes d'une séance : solo, variantes, mini-blocs. */
function toutesLesEtapes(st: SeanceType): EtapeType[] {
  return [
    ...st.solo,
    ...(st.groupe?.miniBloc?.etapes ?? []),
    ...Object.values(st.variantes).flatMap((v) => [...v.solo, ...(v.miniBloc?.etapes ?? [])]),
  ]
}

const NERVEUX: Marqueur[] = ['maximale', 'poutre_intensive', 'bloc_limite', 'pan_gullich']

describe('catalogue des objectifs de groupe', () => {
  it('compte 21 objectifs, aux identifiants uniques (OG-01 à OG-18 puis OG-19 à OG-21)', () => {
    expect(OBJECTIFS_GROUPE).toHaveLength(21)
    expect(new Set(OBJECTIFS_GROUPE.map((o) => o.id)).size).toBe(21)
  })

  it('ne cite que des fiches existantes', () => {
    for (const o of OBJECTIFS_GROUPE) {
      if (o.ficheReference !== undefined) expect(protocoleParId(o.ficheReference), o.id).toBeDefined()
    }
  })

  it('ne cite aucune fiche exclue de la génération (sauf test explicite : aucune)', () => {
    for (const o of OBJECTIFS_GROUPE) {
      if (o.ficheReference !== undefined) expect(peutEtreGeneree(protocoleParId(o.ficheReference)!), o.id).toBe(true)
    }
  })

  it('OG-01 et OG-13 : 3 blocs, 4 essais max, marqueurs maximale et bloc_limite', () => {
    for (const id of ['OG-01', 'OG-13']) {
      expect(objectif(id).blocs).toBe(3)
      expect(objectif(id).essaisMaxParBloc).toBe(4)
      expect(marqueursObjectif(objectif(id)).sort()).toEqual(['bloc_limite', 'maximale'])
    }
  })

  it('OG-02 (6 × 3) et OG-14 (4 × 3) : marqueur maximale seulement', () => {
    expect([objectif('OG-02').blocs, objectif('OG-02').essaisMaxParBloc]).toEqual([6, 3])
    expect([objectif('OG-14').blocs, objectif('OG-14').essaisMaxParBloc]).toEqual([4, 3])
    expect(marqueursObjectif(objectif('OG-02'))).toEqual(['maximale'])
    expect(marqueursObjectif(objectif('OG-14'))).toEqual(['maximale'])
  })

  it('OG-11 (3 × 2) et OG-12 (4 × 3) ; OG-03 et OG-12 sans marqueur', () => {
    expect([objectif('OG-11').blocs, objectif('OG-11').essaisMaxParBloc]).toEqual([3, 2])
    expect([objectif('OG-12').blocs, objectif('OG-12').essaisMaxParBloc]).toEqual([4, 3])
    expect(marqueursObjectif(objectif('OG-12'))).toEqual([])
    expect(marqueursObjectif(objectif('OG-03'))).toEqual([])
  })

  it('B21 : OG-03 et OG-08 rattachés aux fiches de groupe ; OG-19 en 4 blocs × 3 essais, maximale et bloc_limite', () => {
    expect(objectif('OG-03').ficheReference).toBe('groupe-flash-defi')
    expect(objectif('OG-08').ficheReference).toBe('groupe-contacts-a-deux')
    expect(objectif('OG-19').ficheReference).toBe('groupe-trois-essais-tour-de-role')
    expect([objectif('OG-19').blocs, objectif('OG-19').essaisMaxParBloc]).toEqual([4, 3])
    expect(marqueursObjectif(objectif('OG-19')).sort()).toEqual(['bloc_limite', 'maximale'])
  })

  it('B20 : l\'objectif 3 blocs à ta limite ne dépasse pas 12 essais durs', () => {
    expect(objectif('OG-01').libelle).toBe('3 blocs à ta limite, 4 essais max chacun')
    for (const id of ['OG-01', 'OG-19']) {
      expect(objectif(id).blocs! * objectif(id).essaisMaxParBloc!).toBeLessThanOrEqual(12)
    }
  })

  it('tout objectif à marqueur maximal renseigne blocs et essaisMaxParBloc (S-22)', () => {
    for (const o of OBJECTIFS_GROUPE) {
      if (marqueursObjectif(o).includes('maximale')) {
        expect(o.blocs, o.id).toBeDefined()
        expect(o.essaisMaxParBloc, o.id).toBeDefined()
      }
    }
  })
})

describe('catalogue des séances types', () => {
  it('compte 26 séances aux identifiants uniques, et 3 variantes', () => {
    expect(SEANCES_TYPES).toHaveLength(26)
    expect(new Set(SEANCES_TYPES.map((s) => s.id)).size).toBe(26)
    expect(SEANCES_TYPES.reduce((n, s) => n + Object.keys(s.variantes).length, 0)).toBe(3)
    expect(Object.keys(seance('ST-DOI-02').variantes).sort()).toEqual(['entretien', 'lestee'])
    expect(Object.keys(seance('ST-PUI-02').variantes)).toEqual(['poutre_entretien'])
  })

  it('tous les ficheId (solo, variantes, mini-blocs) existent et peuvent être générés', () => {
    for (const st of SEANCES_TYPES) {
      for (const etape of toutesLesEtapes(st)) {
        const fiche = protocoleParId(etape.ficheId)
        expect(fiche, `${st.id} : ${etape.ficheId}`).toBeDefined()
        expect(peutEtreGeneree(fiche!), `${st.id} : ${etape.ficheId}`).toBe(true)
      }
    }
  })

  it('chaque version groupe compte 1 à 3 objectifs existants', () => {
    for (const st of SEANCES_TYPES) {
      if (st.groupe === null) continue
      expect(st.groupe.objectifIds.length, st.id).toBeGreaterThanOrEqual(1)
      expect(st.groupe.objectifIds.length, st.id).toBeLessThanOrEqual(3)
      for (const id of st.groupe.objectifIds) expect(objectifGroupeParId(id), `${st.id} : ${id}`).toBeDefined()
    }
  })

  it('pas de version groupe pour ST-DOI-05, ST-TEC-03 et ST-HOR-01 ; ST-TEC-02 en groupe : OG-18', () => {
    for (const id of ['ST-DOI-05', 'ST-TEC-03', 'ST-HOR-01']) expect(seance(id).groupe).toBeNull()
    expect(seance('ST-TEC-02').groupe?.objectifIds).toEqual(['OG-18'])
  })

  it('durées déduites des fiches', () => {
    expect(dureeSeanceType(seance('ST-DOI-02'))).toBe(110)
    expect(dureeSeanceType(seance('ST-DOI-02'), 'entretien')).toBe(90)
    expect(dureeSeanceType(seance('ST-PUI-02'), 'poutre_entretien')).toBe(115)
    expect(dureeSeanceType(seance('ST-TRA-02'))).toBe(113)
    expect(dureeSeanceType(seance('ST-END-01'))).toBe(70)
    expect(dureeSeanceType(seance('ST-HOR-01'))).toBe(35)
  })

  it('la variante lestée remplace la réglette minimale, aussi dans le mini-bloc', () => {
    const v = seance('ST-DOI-02').variantes.lestee
    expect(v.solo.map((e) => e.ficheId)).toContain('doigts-suspensions-max-lestees')
    expect(v.solo.map((e) => e.ficheId)).not.toContain('doigts-reglette-minimale-lopez')
    expect(v.miniBloc?.etapes.map((e) => e.ficheId)).toContain('doigts-suspensions-max-lestees')
  })

  it('ST-DOI-02 : marqueurs solo, et mêmes marqueurs à quota en groupe', () => {
    const st = seance('ST-DOI-02')
    const solo = marqueursSeanceType(st, 'solo')
    for (const m of ['poutre', 'maximale', 'poutre_intensive', 'bloc_limite'] as Marqueur[]) expect(solo).toContain(m)
    const groupe = marqueursSeanceType(st, 'groupe')
    for (const m of ['poutre', 'maximale', 'poutre_intensive', 'bloc_limite'] as Marqueur[]) expect(groupe).toContain(m)
  })

  it('prérequis de ST-TRA-02 : 2 ans, 10 tractions strictes, adulte', () => {
    expect(prerequisSeanceType(seance('ST-TRA-02'))).toEqual({ anneesPratiqueMin: 2, tractionsStrictesMin: 10, adulte: true })
  })

  it('ST-DOI-03 en groupe hérite du prérequis adulte (fiche López), pas en solo', () => {
    expect(prerequisSeanceType(seance('ST-DOI-03'), 'groupe').adulte).toBe(true)
    expect(prerequisSeanceType(seance('ST-DOI-03'), 'solo').adulte).toBeUndefined()
  })

  it('contre-indications : union des fiches', () => {
    expect(contreIndicationsSeanceType(seance('ST-DOI-05'))).toEqual(['doigts'])
    expect(contreIndicationsSeanceType(seance('ST-DOI-02')).sort()).toEqual(['coude', 'doigts', 'epaule', 'genou', 'poignet'])
  })

  it('chaque séance solo commence par une fiche d\'échauffement, sauf ST-DOI-05', () => {
    for (const st of SEANCES_TYPES) {
      if (st.id === 'ST-DOI-05') continue
      for (const solo of [st.solo, ...Object.values(st.variantes).map((v) => v.solo)]) {
        expect(protocoleParId(solo[0].ficheId)?.qualite, st.id).toBe('echauffement')
      }
    }
  })

  it('aucune séance n\'a plus de 60 min d\'étapes nerveuses', () => {
    for (const st of SEANCES_TYPES) {
      for (const solo of [st.solo, ...Object.values(st.variantes).map((v) => v.solo)]) {
        const nerveux = solo
          .filter((e) => protocoleParId(e.ficheId)!.marqueurs.some((m) => NERVEUX.includes(m)))
          .reduce((total, e) => total + (e.reglages?.dureeMin ?? protocoleParId(e.ficheId)!.dureeMin), 0)
        expect(nerveux, st.id).toBeLessThanOrEqual(60)
      }
    }
  })

  it('la qualité d\'une séance est une qualité connue de la bibliothèque', () => {
    const qualites = new Set(BIBLIOTHEQUE.map((p) => p.qualite))
    for (const st of SEANCES_TYPES) expect(qualites.has(st.qualite) || st.qualite === 'mobilite', st.id).toBe(true)
  })
})

describe('recommandations du niveau Simple', () => {
  const toutes = SEANCES_TYPES.flatMap((st) => [
    { cle: st.id, texte: st.recommandation },
    ...Object.entries(st.variantes).flatMap(([nom, v]) =>
      v.recommandation === undefined ? [] : [{ cle: `${st.id} ${nom}`, texte: v.recommandation }]),
  ])

  it('chacune est non vide et tient en une ligne (120 caractères au plus)', () => {
    for (const { cle, texte } of toutes) {
      expect(texte.trim().length, cle).toBeGreaterThan(0)
      expect(texte.length, cle).toBeLessThanOrEqual(LONGUEUR_MAX_RECOMMANDATION)
      expect(texte.includes('\n'), cle).toBe(false)
    }
  })

  it('toute séance (ou variante) dont le solo porte bloc_limite dit « essais max »', () => {
    for (const st of SEANCES_TYPES) {
      if (marqueursSeanceType(st, 'solo').includes('bloc_limite')) expect(st.recommandation, st.id).toContain('essais max')
      for (const nom of Object.keys(st.variantes)) {
        if (marqueursSeanceType(st, 'solo', nom).includes('bloc_limite')) {
          expect(recommandationSeanceType(st, nom), `${st.id} ${nom}`).toContain('essais max')
        }
      }
    }
  })

  it('la variante entretien de ST-DOI-02 a la sienne ; les autres gardent celle de la séance', () => {
    const st = seance('ST-DOI-02')
    expect(recommandationSeanceType(st, 'entretien')).toContain('bloc limite court (20 min)')
    expect(recommandationSeanceType(st, 'lestee')).toBe(st.recommandation)
  })
})
