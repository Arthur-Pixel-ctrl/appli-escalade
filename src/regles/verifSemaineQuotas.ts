// Vérifications de semaine, espacement et quotas : W-01 à W-08, et W-20
// (docs/specs/entrainement/moteur-verification.md, B.6). Fonctions pures : elles avertissent, elles ne bloquent rien.
import {
  estDure,
  estMaximale,
  estPoutreIntensive,
  heuresEntre,
  joursEntre,
  lundiDe,
  marqueursDe,
  marqueursSeance,
  nbDuresMax,
  seanceSolliciteDoigts,
} from './base.ts'
import { MARQUEURS_QUOTA, RESISTANCE_VOIE_PAR_SEMAINE } from './reglesParDefaut.ts'
import type { Avertissement, ContexteVerif, Jour, SeanceVerif } from './types.ts'

const NOMS_JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

/** « mardi 24 » : le nom du jour et son numéro, pour situer une séance dans un message. */
function libelleJour(jour: Jour): string {
  const [a, m, j] = jour.split('-').map(Number)
  return `${NOMS_JOURS[new Date(Date.UTC(a, m - 1, j)).getUTCDay()]} ${j}`
}

/** Heure de fin d'une séance réalisée (sert à départager deux séances du même jour). */
function finEnMs(s: SeanceVerif): number {
  return s.realisee ? Date.parse(s.realisee.finLe) : 0
}

/** Séances triées par date, puis par heure de fin (les séances prévues, sans heure, passent d'abord). */
function triees(seances: SeanceVerif[]): SeanceVerif[] {
  return [...seances].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : finEnMs(a) - finEnMs(b)))
}

/** Vrai si b arrive trop tôt après a : en heures si les deux sont réalisées, sinon en jours calendaires. */
function tropProches(a: SeanceVerif, b: SeanceVerif, ctx: ContexteVerif): boolean {
  if (a.realisee && b.realisee) {
    const debutDeB = Date.parse(b.realisee.finLe) - b.realisee.dureeMin * 60_000
    const ecartHeures = heuresEntre(a.realisee.finLe, new Date(debutDeB).toISOString())
    return ecartHeures < ctx.regles.heuresEntreSeancesMax
  }
  return joursEntre(a.date, b.date) < ctx.regles.heuresEntreSeancesMax / 24
}

/**
 * W-01 : moins de 48 h entre deux séances exigeantes du même type.
 * Se calcule sur toute la frise (un dimanche et le lundi suivant sont dans deux semaines différentes).
 * Une séance légère intercalée n'interrompt pas la comparaison : on compare à la précédente séance du même type.
 */
export function verifierEspacement(seances: SeanceVerif[], ctx: ContexteVerif): Avertissement[] {
  const ordonnees = triees(seances)
  const types = [
    { est: (s: SeanceVerif) => estMaximale(s, ctx.fiches), libelle: 'maximales' },
    { est: (s: SeanceVerif) => estPoutreIntensive(s, ctx.fiches), libelle: 'de poutre intensive' },
  ]
  const alertes: Avertissement[] = []
  const dejaSignalees = new Set<string>() // une seule alerte par séance, même si elle est des deux types

  for (const type of types) {
    const exigeantes = ordonnees.filter(type.est)
    for (let i = 1; i < exigeantes.length; i++) {
      const a = exigeantes[i - 1]
      const b = exigeantes[i]
      if (dejaSignalees.has(b.id) || !tropProches(a, b, ctx)) continue
      dejaSignalees.add(b.id)
      alertes.push({
        code: 'W-01',
        niveau: 'fort',
        message:
          `« ${b.nom} » (${libelleJour(b.date)}) arrive moins de 48 h après « ${a.nom} » (${libelleJour(a.date)}) : ` +
          `deux séances ${type.libelle}. Décale-la d'un jour ou fais sa version légère.`,
        portee: 'seance',
        seanceId: b.id,
        source: 'Synthèse (48 h, López), modèle',
      })
    }
  }
  return alertes
}

/** Fiches contenues dans une séance : celles de la version réalisée, ou des deux versions si elle est seulement prévue. */
function fichesDeLaSeance(s: SeanceVerif): Set<string> {
  const versions = s.realisee
    ? [s.realisee.version === 'groupe' && s.groupe ? s.groupe : s.solo]
    : s.groupe
      ? [s.solo, s.groupe]
      : [s.solo]
  return new Set(versions.flatMap((v) => v.etapes.map((e) => e.ficheId)))
}

/** W-02 à W-08 pour la semaine qui commence le `lundi`. */
export function verifierQuotasSemaine(
  lundi: Jour,
  seances: SeanceVerif[],
  seancesParSemaine: number,
  ctx: ContexteVerif,
): Avertissement[] {
  const { fiches, regles } = ctx
  const dansLaSemaine = seances.filter((s) => lundiDe(s.date) === lundi)
  const alertes: Avertissement[] = []
  const ajouter = (code: string, niveau: Avertissement['niveau'], message: string, source: string, sujet?: string) =>
    alertes.push({ code, niveau, message, portee: 'semaine', lundi, source, ...(sujet !== undefined && { sujet }) })

  // W-02 : poutre intensive
  const nbPoutreIntensive = dansLaSemaine.filter((s) => estPoutreIntensive(s, fiches)).length
  if (nbPoutreIntensive > regles.poutreIntensiveParSemaine) {
    ajouter(
      'W-02',
      'fort',
      `${nbPoutreIntensive} séances de poutre intensive cette semaine : ${regles.poutreIntensiveParSemaine} au plus. Allège ou déplace la dernière.`,
      'Synthèse, plan',
    )
  }

  // W-03 : bloc limite
  const nbBlocLimite = dansLaSemaine.filter((s) => marqueursSeance(s, fiches).includes('bloc_limite')).length
  if (nbBlocLimite > regles.blocLimiteParSemaine) {
    ajouter(
      'W-03',
      'fort',
      `${nbBlocLimite} séances de bloc limite cette semaine : ${regles.blocLimiteParSemaine} au plus. Remplace la dernière par du volume ou des intervalles plus faciles.`,
      'Synthèse, plan',
    )
  }

  // W-04 : poutre, tous types confondus
  const nbPoutre = dansLaSemaine.filter((s) => marqueursSeance(s, fiches).includes('poutre')).length
  if (nbPoutre > regles.poutreParSemaine) {
    ajouter(
      'W-04',
      'fort',
      `${nbPoutre} séances avec poutre cette semaine : ${regles.poutreParSemaine} au plus, tous exercices confondus.`,
      'Audit I-8',
    )
  }

  // W-05 : plafond propre à chaque fiche (champ maxParSemaine), fort si la fiche porte un marqueur à quota
  const nbParFiche = new Map<string, number>()
  for (const s of dansLaSemaine) {
    for (const ficheId of fichesDeLaSeance(s)) nbParFiche.set(ficheId, (nbParFiche.get(ficheId) ?? 0) + 1)
  }
  for (const [ficheId, n] of nbParFiche) {
    const fiche = fiches[ficheId]
    if (!fiche || fiche.maxParSemaine === undefined || n <= fiche.maxParSemaine) continue
    const aQuota = marqueursDe(fiche).some((m) => MARQUEURS_QUOTA.includes(m))
    ajouter(
      'W-05',
      aQuota ? 'fort' : 'information',
      `« ${fiche.nom} » est prévue ${n} fois cette semaine ; sa fiche conseille ${fiche.maxParSemaine} fois au plus.`,
      'Fiches de la bibliothèque',
      ficheId, // plusieurs fiches peuvent dépasser leur plafond la même semaine
    )
  }

  // W-06 : jours de doigts (une séance dure sans exercice connu compte, sauf mobilité et antagonistes)
  const joursDoigts = new Set(dansLaSemaine.filter((s) => seanceSolliciteDoigts(s, fiches)).map((s) => s.date))
  if (joursDoigts.size > regles.joursDoigtsMaxParSemaine) {
    ajouter(
      'W-06',
      'fort',
      `Tu sollicites tes doigts ${joursDoigts.size} jours cette semaine : ${regles.joursDoigtsMaxParSemaine} au plus, et au moins ${7 - regles.joursDoigtsMaxParSemaine} jours de repos des doigts. Remplace une séance par de la mobilité ou du gainage au sol.`,
      'Hörst (synthèse)',
    )
  }

  // W-07 : plus de séances que choisi
  if (dansLaSemaine.length > seancesParSemaine) {
    ajouter(
      'W-07',
      'information',
      `${dansLaSemaine.length} séances prévues pour ${seancesParSemaine} choisies : ton plan est plus chargé que prévu. Retire-en une ou change ton nombre de séances.`,
      'Cahier des charges',
    )
  }

  // W-08 : trop de séances dures
  const nbDures = dansLaSemaine.filter((s) => estDure(s, fiches)).length
  const maxDures = nbDuresMax(seancesParSemaine)
  if (nbDures > maxDures) {
    ajouter(
      'W-08',
      'fort',
      `${nbDures} séances dures cette semaine : avec ${seancesParSemaine} séances par semaine, garde-en ${maxDures} au plus et rends les autres légères.`,
      'Synthèse (semaines types), cahier des charges',
    )
  }

  // W-20 : résistance en voie (une séance compte une fois, même avec deux fiches de ce type)
  const nbResistanceVoie = dansLaSemaine.filter((s) => marqueursSeance(s, fiches).includes('resistance_voie')).length
  const maxResistanceVoie = RESISTANCE_VOIE_PAR_SEMAINE[ctx.profil.disciplinePrincipale]
  if (nbResistanceVoie > maxResistanceVoie) {
    ajouter(
      'W-20',
      'fort',
      ctx.profil.disciplinePrincipale === 'bloc'
        ? `${nbResistanceVoie} séances de résistance en voie cette semaine : 1 au plus avec un profil « bloc ». Garde-en une et fais le reste en bloc, ou change ton profil si ton objectif devient la voie.`
        : `${nbResistanceVoie} séances de résistance en voie cette semaine : 2 au plus. Remplace la dernière par de l'endurance ou de la technique.`,
      "Décision d'Arthur (F2, point 13) ; audit B21, I-8 (Lattice)",
    )
  }

  return alertes
}
