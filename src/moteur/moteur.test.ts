import { describe, expect, it } from 'vitest'
import { SEANCE_GROUPE_EXEMPLE } from '../donnees/seanceGroupeExemple.ts'
import { SEANCE_EXEMPLE } from '../donnees/seanceExemple.ts'
import {
  demarrerHorloge, HORLOGE_PRETE, mettreEnPause, reprendreHorloge, secondesEcoulees, terminerHorloge,
} from './horloge.ts'
import {
  annulerDernierBloc, avancement, bilanObjectifs, changerObjectif, demarrerSeanceGroupe, noterBloc,
} from './seanceGroupe.ts'
import { bilanEtapes, demarrerSeanceSolo, etapeEnCours, marquerEtape, minutesEcoulees } from './seanceSolo.ts'
import type { SeanceGuidee } from './types.ts'

const troisEtapes: SeanceGuidee = {
  nom: 'Test',
  etapes: [1, 2, 3].map((n) => ({
    id: `e${n}`, titre: `Étape ${n}`, resume: '5 min', consigne: '', dureeMin: 5, forme: 'liste' as const, elements: [],
  })),
}

describe('séance solo', () => {
  it('démarre avec toutes les étapes à faire', () => {
    const etat = demarrerSeanceSolo(troisEtapes, 0)
    expect(etat.statuts).toEqual(['a_faire', 'a_faire', 'a_faire'])
    expect(etapeEnCours(etat)).toBe(0)
  })

  it('avance : faite puis passée amène à la troisième étape', () => {
    let etat = demarrerSeanceSolo(troisEtapes, 0)
    etat = marquerEtape(etat, 'faite')
    etat = marquerEtape(etat, 'passee')
    expect(etapeEnCours(etat)).toBe(2)
    expect(etat.statuts).toEqual(['faite', 'passee', 'a_faire'])
  })

  it('renvoie -1 quand tout est traité et ne change plus rien ensuite', () => {
    let etat = demarrerSeanceSolo(troisEtapes, 0)
    for (let i = 0; i < 3; i++) etat = marquerEtape(etat, 'faite')
    expect(etapeEnCours(etat)).toBe(-1)
    expect(marquerEtape(etat, 'passee')).toBe(etat)
  })

  it('ne modifie pas l’état d’origine', () => {
    const etat = demarrerSeanceSolo(troisEtapes, 0)
    marquerEtape(etat, 'faite')
    expect(etat.statuts[0]).toBe('a_faire')
  })

  it('arrondit les minutes écoulées et ne descend jamais sous zéro', () => {
    const etat = demarrerSeanceSolo(troisEtapes, 100_000)
    expect(minutesEcoulees(etat, 100_000 + 90_000)).toBe(2)
    expect(minutesEcoulees(etat, 100_000 + 20_000)).toBe(0)
    expect(minutesEcoulees(etat, 50_000)).toBe(0)
  })

  it('donne le bilan des étapes avec leur titre', () => {
    const etat = marquerEtape(demarrerSeanceSolo(troisEtapes, 0), 'passee')
    expect(bilanEtapes(troisEtapes, etat)[0]).toEqual({ titre: 'Étape 1', statut: 'passee' })
  })

  it('la séance d’exemple a une durée par étape', () => {
    expect(SEANCE_EXEMPLE.etapes.every((e) => e.dureeMin > 0)).toBe(true)
  })
})

describe('séance en groupe', () => {
  it('note flash, enchaîné et non enchaîné', () => {
    let etat = demarrerSeanceGroupe(0)
    etat = noterBloc(etat, 'Rouge', 1, true)
    etat = noterBloc(etat, 'Rouge', 3, true)
    etat = noterBloc(etat, 'Rouge', 2, false)
    expect(etat.blocs.map((b) => b.resultat)).toEqual(['flash', 'enchaine', 'non_enchaine'])
  })

  it('enregistre l’objectif courant avec chaque bloc', () => {
    let etat = noterBloc(demarrerSeanceGroupe(0), 'Rouge', 1, true)
    etat = noterBloc(changerObjectif(etat, 1), 'Violet', 1, true)
    expect(etat.blocs.map((b) => b.objectif)).toEqual([0, 1])
  })

  it('annule le dernier bloc, et ne plante pas s’il n’y en a pas', () => {
    let etat = noterBloc(demarrerSeanceGroupe(0), 'Rouge', 1, true)
    etat = noterBloc(etat, 'Bleu', 2, true)
    expect(annulerDernierBloc(etat).blocs.map((b) => b.couleur)).toEqual(['Rouge'])
    expect(annulerDernierBloc(demarrerSeanceGroupe(0)).blocs).toEqual([])
  })

  it('en mode « flashs », l’avancement ne compte que les flashs', () => {
    let etat = changerObjectif(demarrerSeanceGroupe(0), 1)
    etat = noterBloc(etat, 'Violet', 1, true)
    etat = noterBloc(etat, 'Violet', 3, true)
    const flashs = SEANCE_GROUPE_EXEMPLE.objectifs[1]
    expect(avancement(flashs, 1, etat.blocs)).toBe(1)
    // Le même bloc compte pour « blocs notés » sur un objectif de ce type.
    expect(avancement({ ...flashs, compte: 'blocs_notes' }, 1, etat.blocs)).toBe(2)
  })

  it('ne compte pas les blocs des autres objectifs', () => {
    const etat = noterBloc(demarrerSeanceGroupe(0), 'Rouge', 1, true)
    expect(bilanObjectifs(SEANCE_GROUPE_EXEMPLE, etat.blocs).map((o) => o.fait)).toEqual([1, 0])
  })

  it('le premier objectif d’exemple est « 3 blocs durs à réglettes »', () => {
    expect(SEANCE_GROUPE_EXEMPLE.objectifs[0]).toMatchObject({ cible: 3, blocs: 3, essaisMaxParBloc: 4, modeleId: 'OG-01' })
  })
})

describe('horloge', () => {
  it('compte les secondes depuis le démarrage', () => {
    const h = demarrerHorloge(1000)
    expect(h.marche).toBe('en_cours')
    expect(secondesEcoulees(h, 6000)).toBe(5)
  })

  it('garde le temps pendant une pause puis reprend', () => {
    let h = demarrerHorloge(1000)
    h = mettreEnPause(h, 6000)
    expect(h.marche).toBe('en_pause')
    expect(secondesEcoulees(h, 9000)).toBe(5)
    h = reprendreHorloge(h, 10000)
    expect(secondesEcoulees(h, 12000)).toBe(7)
  })

  it('reste à zéro tant qu’elle n’est pas démarrée, et fige le temps à la fin', () => {
    expect(secondesEcoulees(HORLOGE_PRETE, 99999)).toBe(0)
    const fin = terminerHorloge(demarrerHorloge(0))
    expect(fin.marche).toBe('termine')
  })
})
