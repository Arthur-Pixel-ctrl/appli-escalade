// Vérifications d'une semaine : charge et contenu, W-09 à W-19 (moteur-verification.md, B.6).
// Fonctions pures : on avertit, on ne bloque jamais. Les messages sont ceux de la spécification.
import {
  capPoutreAnciennete,
  chargeSemaine,
  estMaximale,
  lundiDe,
  marqueursSeance,
  sansContenuConnu,
} from './base.ts'
import { NOMS_QUALITES, QUALITES_PHYSIQUES } from './reglesParDefaut.ts'
import type {
  Avertissement,
  ContexteVerif,
  EtapeVerif,
  FicheVerif,
  Jour,
  Niveau,
  PlanVerif,
  Qualite,
  SeanceVerif,
  SemaineVerif,
} from './types.ts'

const ID_BLOQUEUR = 'endurance-1-on-1-off'
const ID_ABRAHANGS = 'doigts-abrahangs'

interface EtapeConnue {
  etape: EtapeVerif
  fiche: FicheVerif
  index: number // place de l'étape dans sa version, pour les avertissements d'étape
  seance: SeanceVerif
}

/** Étapes de la version solo dont la fiche est connue (les autres sont ignorées, B.3). */
function etapesSolo(s: SeanceVerif, ctx: ContexteVerif): EtapeConnue[] {
  return s.solo.etapes.flatMap((etape, index) => {
    const fiche = ctx.fiches[etape.ficheId]
    return fiche ? [{ etape, fiche, index, seance: s }] : []
  })
}

/** Étapes du mini-bloc de la version groupe, fiche connue. */
function etapesGroupe(s: SeanceVerif, ctx: ContexteVerif): EtapeConnue[] {
  return (s.groupe?.etapes ?? []).flatMap((etape, index) => {
    const fiche = ctx.fiches[etape.ficheId]
    return fiche ? [{ etape, fiche, index, seance: s }] : []
  })
}

/** Séances du plan dont la date tombe dans la semaine du lundi donné. */
function seancesDeLaSemaine(lundi: Jour, plan: PlanVerif): SeanceVerif[] {
  return plan.seances.filter((s) => lundiDe(s.date) === lundi)
}

/** Semaines de charge d'un bloc (même mesocycleOrdre). */
function semainesDeCharge(plan: PlanVerif, ordres: number[]): SemaineVerif[] {
  return plan.semaines.filter((w) => w.type === 'charge' && ordres.includes(w.mesocycleOrdre))
}

function avertissementSemaine(
  code: string,
  niveau: Niveau,
  message: string,
  semaine: SemaineVerif,
  source: string,
): Avertissement {
  return { code, niveau, message, portee: 'semaine', lundi: semaine.lundi, mesocycleOrdre: semaine.mesocycleOrdre, source }
}

// --- W-09 à W-12 : charge et nouveauté ---

/** W-09 : la charge monte trop par rapport à la dernière semaine de charge. */
function w09(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  if (semaine.type !== 'charge') return []
  const position = plan.semaines.indexOf(semaine)
  const precedente = plan.semaines
    .slice(0, position)
    .reverse()
    .find((w) => w.type === 'charge') // on saute les semaines d'un autre type
  if (!precedente) return []
  const avant = chargeSemaine(precedente.lundi, plan.seances, ctx.fiches)
  const maintenant = chargeSemaine(semaine.lundi, plan.seances, ctx.fiches)
  if (avant <= 0) return [] // pas de référence pour calculer une hausse
  const { hausseChargeMaxPct } = ctx.regles
  if (!(maintenant > avant * (1 + hausseChargeMaxPct / 100))) return []
  const hausse = Math.round((maintenant / avant - 1) * 100)
  return [
    avertissementSemaine(
      'W-09',
      'information',
      `La charge prévue monte de ${hausse} % par rapport à ta dernière semaine de charge. Le repère prudent est ${hausseChargeMaxPct} % au plus.`,
      semaine,
      'FFME (repère, non validé)',
    ),
  ]
}

/** W-10 : semaine allégée oubliée (fort) ou un peu trop chargée (information). */
function w10(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  if (semaine.type !== 'decharge' || !ctx.regles.dechargeActive) return []
  const charges = semainesDeCharge(plan, [semaine.mesocycleOrdre])
  if (charges.length === 0) return []
  const moyenne = charges.reduce((t, w) => t + chargeSemaine(w.lundi, plan.seances, ctx.fiches), 0) / charges.length
  if (moyenne <= 0) return []
  const r = semaine.reductionPct ?? ctx.regles.dechargeReductionPct
  const cible = moyenne * (1 - r / 100)
  const charge = chargeSemaine(semaine.lundi, plan.seances, ctx.fiches)
  const source = 'Lattice (synthèse) ; seuils de l’app'
  const cibleArrondie = Math.round(cible / 10) * 10
  if (charge >= (moyenne * ctx.regles.seuilDechargeOublieePct) / 100) {
    return [
      avertissementSemaine(
        'W-10',
        'fort',
        `Ta semaine allégée est presque aussi chargée qu’une semaine normale. Divise les séries par deux et vise environ ${cibleArrondie} unités.`,
        semaine,
        source,
      ),
    ]
  }
  if (charge > cible + (moyenne * ctx.regles.toleranceDechargePts) / 100) {
    return [
      avertissementSemaine(
        'W-10',
        'information',
        `Ta semaine allégée reste un peu chargée : vise environ ${cibleArrondie} unités (${Math.round(r)} % de moins que tes semaines de charge).`,
        semaine,
        source,
      ),
    ]
  }
  return []
}

/** W-11 : un exercice absent des semaines de charge apparaît en semaine allégée ou d'affûtage. */
function w11(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  if (semaine.type !== 'decharge' && semaine.type !== 'affutage') return []
  // Affûtage : on compare au bloc qui le contient et au précédent.
  const ordres = semaine.type === 'affutage' ? [semaine.mesocycleOrdre, semaine.mesocycleOrdre - 1] : [semaine.mesocycleOrdre]
  const charges = semainesDeCharge(plan, ordres)
  if (charges.length === 0) return [] // rien à comparer : tout paraîtrait « nouveau »
  const connus = new Set<string>()
  for (const w of charges) {
    for (const s of seancesDeLaSemaine(w.lundi, plan)) {
      for (const { fiche } of [...etapesSolo(s, ctx), ...etapesGroupe(s, ctx)]) connus.add(fiche.id)
    }
  }
  const sorte = semaine.type === 'decharge' ? 'allégée' : 'd’affûtage'
  const resultat: Avertissement[] = []
  for (const s of seancesDeLaSemaine(semaine.lundi, plan)) {
    for (const { fiche, index } of etapesSolo(s, ctx)) {
      if (connus.has(fiche.id)) continue
      resultat.push({
        code: 'W-11',
        niveau: 'information',
        message: `« ${fiche.nom} » n’apparaît pas dans tes semaines de charge : en semaine ${sorte}, garde des exercices connus.`,
        portee: 'etape',
        seanceId: s.id,
        version: 'solo',
        etapeIndex: index,
        lundi: semaine.lundi,
        mesocycleOrdre: semaine.mesocycleOrdre,
        source: 'Lattice (synthèse)',
      })
    }
  }
  return resultat
}

/** W-12 : plus de séances maximales en semaine allégée qu'en dernière semaine de charge. */
function w12(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  if (semaine.type !== 'decharge') return []
  const position = plan.semaines.indexOf(semaine)
  const derniereCharge = plan.semaines
    .slice(0, position)
    .reverse()
    .find((w) => w.type === 'charge' && w.mesocycleOrdre === semaine.mesocycleOrdre)
  if (!derniereCharge) return []
  const compter = (lundi: Jour) => seancesDeLaSemaine(lundi, plan).filter((s) => estMaximale(s, ctx.fiches)).length
  const n = compter(semaine.lundi)
  const m = compter(derniereCharge.lundi)
  if (n <= m) return []
  return [
    avertissementSemaine(
      'W-12',
      'information',
      `Ta semaine allégée compte plus de séances maximales (${n}) que ta dernière semaine de charge (${m}) : garde-en ${m} au plus.`,
      semaine,
      'Lattice (synthèse) ; règle de l’app',
    ),
  ]
}

// --- W-13 à W-16, W-18 : contenu de la semaine de charge ---

/** W-13 : qualités physiques qu'aucune étape de la semaine n'entretient. */
function w13(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  if (semaine.type !== 'charge') return []
  const entretenues = new Set<Qualite>()
  for (const s of seancesDeLaSemaine(semaine.lundi, plan)) {
    // Séance sans exercice connu : elle entretient sa qualité dominante (consolidation 18/11).
    if (sansContenuConnu(s.solo, ctx.fiches)) entretenues.add(s.qualite)
    for (const { fiche } of [...etapesSolo(s, ctx), ...etapesGroupe(s, ctx)]) {
      entretenues.add(fiche.qualite)
      // Exception du bloqueur : en bloc, le 1 on / 1 off entretient la résistance.
      if (fiche.id === ID_BLOQUEUR && ctx.profil.disciplinePrincipale === 'bloc') entretenues.add('resistance')
    }
    for (const o of s.groupe?.objectifs ?? []) o.accents.forEach((q) => entretenues.add(q))
  }
  const manquantes = QUALITES_PHYSIQUES.filter((q) => !entretenues.has(q))
  if (manquantes.length === 0) return []
  const liste = manquantes.map((q) => NOMS_QUALITES[q]).join(', ')
  const pronom = manquantes.length === 1 ? "l'" : 'les '
  return [
    avertissementSemaine(
      'W-13',
      'information',
      `Cette semaine ne contient rien pour : ${liste}. Ajoute une étape courte pour ${pronom}entretenir (10 à 20 min suffisent).`,
      semaine,
      'Plan de l’app, synthèse (toutes les qualités entretenues)',
    ),
  ]
}

/** W-14 : l'accent de la phase est absent ou minoritaire dans la semaine. */
function w14(semaine: SemaineVerif, plan: PlanVerif): Avertissement[] {
  if (semaine.type !== 'charge') return []
  const accent = plan.mesocycles.find((m) => m.ordre === semaine.mesocycleOrdre)?.accent
  if (!accent) return [] // accent pas encore choisi
  const seances = seancesDeLaSemaine(semaine.lundi, plan)
  const nombre = (q: Qualite) => seances.filter((s) => s.qualite === q).length
  const source = 'Plan de l’app (accent tournant)'
  if (nombre(accent) === 0) {
    return [
      avertissementSemaine(
        'W-14',
        'information',
        `Cette phase met en avant ${NOMS_QUALITES[accent]}, mais aucune séance de la semaine n’a cette qualité.`,
        semaine,
        source,
      ),
    ]
  }
  // Plusieurs qualités peuvent dépasser l'accent : on cite la plus fréquente (la première en cas d'égalité).
  const concurrente = QUALITES_PHYSIQUES.filter((q) => q !== accent && nombre(q) > nombre(accent)).sort(
    (a, b) => nombre(b) - nombre(a),
  )[0]
  if (!concurrente) return []
  return [
    avertissementSemaine(
      'W-14',
      'information',
      `Plus de séances ${NOMS_QUALITES[concurrente]} que de séances ${NOMS_QUALITES[accent]}, l’accent de cette phase. C’est voulu ?`,
      semaine,
      source,
    ),
  ]
}

/** W-15 : trop de séances de poutre pour l'ancienneté. */
function w15(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  const cap = capPoutreAnciennete(ctx.profil.anneesPratique)
  const n = seancesDeLaSemaine(semaine.lundi, plan).filter((s) => marqueursSeance(s, ctx.fiches).includes('poutre')).length
  if (n <= cap) return []
  const message =
    cap === 0
      ? 'Moins d’un an de pratique : la grimpe suffit, la poutre viendra après un an sans blessure.'
      : `Avec ${ctx.profil.anneesPratique} ans de pratique, Bechtel conseille ${cap} séance${cap > 1 ? 's' : ''} de poutre par semaine au plus. Tu en prévois ${n}.`
  return [avertissementSemaine('W-15', 'information', message, semaine, 'Bechtel ; coachs Lattice (synthèse)')]
}

/** W-16 : moins de deux étapes d'antagonistes dans la semaine de charge. */
function w16(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  if (semaine.type !== 'charge') return []
  const n = seancesDeLaSemaine(semaine.lundi, plan)
    .flatMap((s) => etapesSolo(s, ctx))
    .filter(({ fiche }) => fiche.qualite === 'antagonistes').length
  if (n >= 2) return []
  const debut = n === 0 ? 'Aucune séance' : 'Une seule séance'
  return [
    avertissementSemaine(
      'W-16',
      'information',
      `${debut} d’antagonistes cette semaine : 2 courtes séances après la grimpe protègent épaules et coudes.`,
      semaine,
      'Vérification de la synthèse (antagonistes)',
    ),
  ]
}

/** W-18 : module d'objectif spécifique oublié ou prévu plus de deux fois. */
function w18(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  if (semaine.type !== 'charge') return []
  const ids = plan.mesocycles.find((m) => m.ordre === semaine.mesocycleOrdre)?.objectifsPersoIds ?? []
  const etapes = seancesDeLaSemaine(semaine.lundi, plan).flatMap((s) => s.solo.etapes)
  const resultat: Avertissement[] = []
  for (const id of ids) {
    const objectif = ctx.objectifsPerso[id]
    if (!objectif) continue
    const n = etapes.filter((e) => e.moduleObjectifId === id).length
    if (n >= 1 && n <= 2) continue
    resultat.push(
      avertissementSemaine(
        'W-18',
        'information',
        `Le module « ${objectif.nom} » est prévu ${n} fois cette semaine : 1 à 2 fois par semaine.`,
        semaine,
        'Plan de l’app ; synthèse (objectifs spécifiques)',
      ),
    )
  }
  return resultat
}

// --- W-17 et W-19 : une séance à la fois ---

/** W-17 : antagonistes un jour sans grimpe. */
function w17(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  return seancesDeLaSemaine(semaine.lundi, plan).flatMap((s) => {
    const etapes = etapesSolo(s, ctx)
    const aAntagonistes = etapes.some(({ fiche }) => fiche.qualite === 'antagonistes')
    if (!aAntagonistes || etapes.some(({ fiche }) => fiche.solliciteDoigts)) return []
    return [
      {
        code: 'W-17',
        niveau: 'information' as const,
        message: 'Fais les antagonistes après une séance de grimpe, pas un jour de repos.',
        portee: 'seance' as const,
        seanceId: s.id,
        lundi: semaine.lundi,
        source: 'Vérification de la synthèse (antagonistes)',
      },
    ]
  })
}

/** W-19 : suspensions légères trop proches d'une autre séance ou d'autres efforts de la même séance. */
function w19(semaine: SemaineVerif, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  return seancesDeLaSemaine(semaine.lundi, plan).flatMap((s) => {
    const etapes = etapesSolo(s, ctx)
    if (!etapes.some(({ fiche }) => fiche.id === ID_ABRAHANGS)) return []
    // « Autres étapes de grimpe ou de poutre » : tout ce qui sollicite les doigts, sauf l'échauffement.
    const autreEffort = etapes.some(
      ({ fiche }) => fiche.id !== ID_ABRAHANGS && fiche.solliciteDoigts && fiche.qualite !== 'echauffement',
    )
    const autreSeanceLeMemeJour = plan.seances.some((o) => o.id !== s.id && o.date === s.date)
    if (!autreEffort && !autreSeanceLeMemeJour) return []
    return [
      {
        code: 'W-19',
        niveau: 'information' as const,
        message: 'Laisse au moins 6 h entre les suspensions légères pieds au sol et toute autre séance.',
        portee: 'seance' as const,
        seanceId: s.id,
        lundi: semaine.lundi,
        source: 'Gilmore et al. (étude), fiche des suspensions légères',
      },
    ]
  })
}

/** W-09 à W-19 sur la semaine qui commence le `lundi` ; vide si la semaine est absente du plan. */
export function verifierContenuSemaine(lundi: Jour, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  const semaine = plan.semaines.find((w) => w.lundi === lundi)
  if (!semaine) return []
  return [
    ...w09(semaine, plan, ctx),
    ...w10(semaine, plan, ctx),
    ...w11(semaine, plan, ctx),
    ...w12(semaine, plan, ctx),
    ...w13(semaine, plan, ctx),
    ...w14(semaine, plan),
    ...w15(semaine, plan, ctx),
    ...w16(semaine, plan, ctx),
    ...w17(semaine, plan, ctx),
    ...w18(semaine, plan, ctx),
    ...w19(semaine, plan, ctx),
  ]
}
