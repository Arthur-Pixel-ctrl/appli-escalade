// Vérifications de séance sur le déroulé, le groupe et les modules : S-10 à S-26
// (moteur-verification.md, B.5). Fonctions pures : elles avertissent, elles ne bloquent jamais.
// Les étapes dont la fiche est inconnue sont ignorées ici (seule S-01, ailleurs, les signale).
import { dureeEtape, estCongestionnante, estNerveuse, marqueursDe, marqueursVersion, sansContenuConnu } from './base.ts'
import { MARQUEURS_NERVEUX, MARQUEURS_QUOTA, NOMS_QUALITES, QUALITES_PHYSIQUES } from './reglesParDefaut.ts'
import type { Avertissement, ContexteVerif, EtapeVerif, FicheVerif, Marqueur, Qualite, SeanceVerif, VersionVerif } from './types.ts'

type Version = 'solo' | 'groupe'
type EtapeConnue = { etape: EtapeVerif; fiche: FicheVerif; index: number }

/** Les étapes d'une version dont la fiche est connue ; `index` est la place dans la liste de la version. */
function etapesConnues(v: VersionVerif, ctx: ContexteVerif): EtapeConnue[] {
  return v.etapes.flatMap((etape, index) => {
    const fiche = ctx.fiches[etape.ficheId]
    return fiche ? [{ etape, fiche, index }] : []
  })
}

/** Construit un avertissement ; le message est déjà rempli. */
function avertir(
  code: string,
  niveau: Avertissement['niveau'],
  message: string,
  source: string,
  s: SeanceVerif,
  version: Version,
  etapeIndex?: number,
): Avertissement {
  const a: Avertissement = {
    code,
    niveau,
    message,
    portee: etapeIndex === undefined ? 'seance' : 'etape',
    seanceId: s.id,
    version,
    source,
  }
  if (etapeIndex !== undefined) a.etapeIndex = etapeIndex
  return a
}

/** Fiche de l'échauffement des doigts, attendue avant une poutre intensive (S-11). */
const ECHAUFFEMENT_DOIGTS = 'echauffement-doigts-poutre'
/** Pan ou bloc sans pieds : à faire frais (S-13). */
const BLOC_SANS_PIEDS = 'puissance-bloc-sans-pieds'

/** S-10, S-11, S-12, S-13, S-14, S-16, S-24, S-25 : l'ordre réel doit être connu (étapes non résumées). */
function verifsOrdre(s: SeanceVerif, v: VersionVerif, version: Version, ctx: ContexteVerif): Avertissement[] {
  const res: Avertissement[] = []
  const etapes = etapesConnues(v, ctx)

  // S-10 : solo seulement. En groupe, l'échauffement se fait en commun avant le mini-bloc.
  if (version === 'solo') {
    const premiere = etapes.find((e) => estNerveuse(e.fiche))
    if (premiere && !etapes.some((e) => e.index < premiere.index && e.fiche.qualite === 'echauffement')) {
      res.push(
        avertir(
          'S-10',
          'fort',
          `Ajoute un échauffement avant « ${premiere.fiche.nom} » : 20 à 30 min de grimpe de plus en plus dure.`,
          'Vérifications, Synthèse',
          s,
          version,
          premiere.index,
        ),
      )
    }
  }

  for (const e of etapes) {
    // S-11 : poutre intensive sans échauffement des doigts avant
    if (
      marqueursDe(e.fiche).includes('poutre_intensive') &&
      !etapes.some((p) => p.index < e.index && p.etape.ficheId === ECHAUFFEMENT_DOIGTS)
    ) {
      res.push(
        avertir(
          'S-11',
          'information',
          `Avant « ${e.fiche.nom} », fais 3 à 8 suspensions progressives (fiche Échauffement des doigts) : la dernière te donne la charge du jour.`,
          'Synthèse (López)',
          s,
          version,
          e.index,
        ),
      )
    }

    // S-12 : une seule alerte par étape nerveuse, même s'il y a plusieurs étapes congestionnantes avant
    if (estNerveuse(e.fiche)) {
      const avant = etapes.find((p) => p.index < e.index && estCongestionnante(p.etape, p.fiche))
      if (avant) {
        res.push(
          avertir(
            'S-12',
            'fort',
            `« ${e.fiche.nom} » vient après « ${avant.fiche.nom} » : les efforts maximaux se font frais. Place-le avant, ou dans une autre séance.`,
            'Synthèse',
            s,
            version,
            e.index,
          ),
        )
      }
    }

    // S-13 : pan ou bloc sans pieds après un effort nerveux
    const estPan = marqueursDe(e.fiche).includes('pan_gullich') || e.etape.ficheId === BLOC_SANS_PIEDS
    if (estPan && etapes.some((p) => p.index < e.index && estNerveuse(p.fiche))) {
      res.push(
        avertir(
          'S-13',
          'fort',
          `« ${e.fiche.nom} » se fait en début de séance, jamais fatigué : place-le juste après l'échauffement.`,
          'Synthèse (BMC ; Anderson)',
          s,
          version,
          e.index,
        ),
      )
    }

    // S-24 et S-25 : le module d'un objectif spécifique
    if (e.etape.moduleObjectifId !== undefined) {
      const d = dureeEtape(e.etape, e.fiche)
      if (d < 10 || d > 15) {
        res.push(
          avertir(
            'S-24',
            'information',
            `Le module « ${e.fiche.nom} » dure ${d} min : un objectif spécifique tient en 10 à 15 min.`,
            'Plan v2, Modèle de données',
            s,
            version,
            e.index,
          ),
        )
      }
      if (estNerveuse(e.fiche) && v.durete === 'legere') {
        res.push(
          avertir(
            'S-25',
            'information',
            `Le module « ${e.fiche.nom} » est un effort intense : place-le en début de séance dure, juste après l'échauffement.`,
            'Synthèse, Choix de l\'app',
            s,
            version,
            e.index,
          ),
        )
      }
    }
  }

  // S-14 : deux protocoles de suspensions maximales
  const suspensions = etapes.filter(
    (e) => marqueursDe(e.fiche).includes('maximale') && marqueursDe(e.fiche).includes('poutre_intensive'),
  )
  if (suspensions.length >= 2) {
    res.push(
      avertir(
        'S-14',
        'information',
        'Deux protocoles de suspensions maximales dans la même séance : garde-en un, ou réduis le volume de chacun de 25 à 30 %.',
        'Synthèse (López ; Hörst)',
        s,
        version,
      ),
    )
  }

  // S-16 : bloc nerveux trop long
  const total = etapes.filter((e) => estNerveuse(e.fiche)).reduce((t, e) => t + dureeEtape(e.etape, e.fiche), 0)
  if (total > ctx.regles.dureeBlocNerveuxMaxMin) {
    res.push(
      avertir(
        'S-16',
        'information',
        `${total} min d'efforts maximaux dans cette séance : le repère est de 30 à 60 min. Raccourcis, ou répartis sur deux séances.`,
        'Synthèse',
        s,
        version,
      ),
    )
  }

  return res
}

/** S-15 : repos réglé trop court entre efforts maximaux (seulement si le chrono réglé est lancé : niveau détaillé). */
function verifRepos(s: SeanceVerif, v: VersionVerif, version: Version, ctx: ContexteVerif): Avertissement[] {
  if (v.niveau !== undefined && v.niveau !== 'detaille') return []
  const res: Avertissement[] = []
  for (const { etape, fiche, index } of etapesConnues(v, ctx)) {
    if (!marqueursDe(fiche).includes('maximale')) continue
    const repos = etape.reglages?.reposS ?? fiche.reposEntreEffortsS
    if (repos === undefined || repos >= ctx.regles.reposEffortMaxS) continue
    // Exception : un protocole de la bibliothèque conçu avec ce repos (7-53 : 53 s)
    if (fiche.origine === 'bibliotheque' && fiche.reposEntreEffortsS !== undefined && repos >= fiche.reposEntreEffortsS) continue
    res.push(
      avertir(
        'S-15',
        'fort',
        `${repos} s de repos entre deux efforts maximaux dans « ${fiche.nom} » : prends au moins 3 min.`,
        'Synthèse, Modèle de données, Audit de la bibliothèque',
        s,
        version,
        index,
      ),
    )
  }
  return res
}

/** S-17, S-18, S-19 : valables même quand les étapes sont résumées. */
function verifsFiches(s: SeanceVerif, v: VersionVerif, version: Version, ctx: ContexteVerif): Avertissement[] {
  const res: Avertissement[] = []

  // S-17 : séance notée légère qui contient un effort maximal
  if (v.durete === 'legere' && marqueursVersion(v, ctx.fiches).some((m) => MARQUEURS_NERVEUX.includes(m))) {
    res.push(
      avertir(
        'S-17',
        'information',
        'Cette séance est notée légère mais contient un effort maximal. Passe-la en dure : la récupération sera comptée de toute façon.',
        "Choix de l'app",
        s,
        version,
      ),
    )
  }

  for (const { fiche, index } of etapesConnues(v, ctx)) {
    const marqueurs = marqueursDe(fiche)
    // S-18 : bidoigts sous forte charge
    if (marqueurs.includes('bidoigts') && (marqueurs.includes('maximale') || marqueurs.includes('poutre_intensive'))) {
      res.push(
        avertir(
          'S-18',
          'fort',
          `Les bidoigts se travaillent à faible charge seulement. Retire le lest ou l'intensité maximale de « ${fiche.nom} ».`,
          'Synthèse',
          s,
          version,
          index,
        ),
      )
    }
    // S-19 : exercice perso dont l'intensité n'est pas dite
    if (fiche.origine === 'perso' && fiche.marqueurs === null) {
      res.push(
        avertir(
          'S-19',
          'information',
          `Pour « ${fiche.nom} », dis si c'est un effort maximal, sur poutre ou en bloc limite : sinon les règles de récupération ne le comptent pas.`,
          "Choix de l'app",
          s,
          version,
          index,
        ),
      )
    }
  }
  return res
}

/** Marqueurs à quota présents dans une seule des deux versions. */
function marqueursQuota(v: VersionVerif, ctx: ContexteVerif): Marqueur[] {
  return marqueursVersion(v, ctx.fiches).filter((m) => MARQUEURS_QUOTA.includes(m))
}

/** S-20 à S-23 : la version groupe. */
function verifsGroupe(s: SeanceVerif, g: VersionVerif, ctx: ContexteVerif): Avertissement[] {
  const res: Avertissement[] = []
  const objectifs = g.objectifs ?? []

  if (objectifs.length < 1 || objectifs.length > 3) {
    res.push(
      avertir(
        'S-20',
        'information',
        `Une séance en groupe tient en 1 à 3 objectifs. Tu en as ${objectifs.length}.`,
        'Modèle de données, Plan v2',
        s,
        'groupe',
      ),
    )
  }

  for (const o of objectifs) {
    const alaLimite = o.marqueurs.includes('maximale') || o.marqueurs.includes('bloc_limite')
    if (alaLimite && (o.blocs === undefined || o.essaisMaxParBloc === undefined)) {
      res.push(
        avertir(
          'S-22',
          'information',
          `Fixe un nombre de blocs et d'essais pour « ${o.libelle} » : un objectif à la limite sans plafond pousse à trop en faire.`,
          "Choix de l'app",
          s,
          'groupe',
        ),
      )
    }
  }

  // S-23 : la qualité dominante n'est travaillée ni par un objectif, ni par le mini-bloc
  const travailleLaQualite =
    objectifs.some((o) => o.accents.includes(s.qualite)) || etapesConnues(g, ctx).some((e) => e.fiche.qualite === s.qualite)
  if ((QUALITES_PHYSIQUES as Qualite[]).includes(s.qualite) && !travailleLaQualite) {
    res.push(
      avertir(
        'S-23',
        'information',
        `La version groupe de « ${s.nom} » ne travaille pas sa qualité dominante (${NOMS_QUALITES[s.qualite]}). Ajoute un objectif qui la travaille.`,
        "Modèle de données, Choix de l'app",
        s,
        'groupe',
      ),
    )
  }
  return res
}

/** S-21 : solo et groupe d'intensité différente (une alerte par séance, sans version). */
function verifIntensiteSoloGroupe(s: SeanceVerif, g: VersionVerif, ctx: ContexteVerif): Avertissement[] {
  const solo = marqueursQuota(s.solo, ctx)
  const groupe = marqueursQuota(g, ctx)
  const differents = [...solo.filter((m) => !groupe.includes(m)), ...groupe.filter((m) => !solo.includes(m))]
  const dureteDiffere = s.solo.durete !== g.durete
  if (differents.length === 0 && !dureteDiffere) return []
  const parties: string[] = [...differents]
  if (dureteDiffere) parties.push('dureté')
  const a = avertir(
    'S-21',
    'information',
    `Les versions solo et groupe de « ${s.nom} » n'ont pas la même intensité (${parties.join(', ')}). Aligne-les pour que la semaine reste équilibrée quel que soit ton choix.`,
    "Choix de l'app",
    s,
    'solo',
  )
  delete a.version
  return [a]
}

/** S-26 : séance solo dure sans exercice connu. Message du 23/11 : volontairement sans « maximal » (décision F7). */
function verifSansExercice(s: SeanceVerif, ctx: ContexteVerif): Avertissement[] {
  if (!(sansContenuConnu(s.solo, ctx.fiches) && s.solo.durete === 'dure')) return []
  const a = avertir(
    'S-26',
    'information',
    `« ${s.nom} » est notée dure, sans exercice de la bibliothèque : l'app la compte comme une séance dure ordinaire. Si tu y fais de la poutre ou du bloc à ta limite, choisis son exercice principal : la règle des 48 h et les quotas en tiendront compte.`,
    "Choix de l'app (décision d'Arthur)",
    s,
    'solo',
  )
  return [a]
}

/** Applique S-10 à S-26 à une séance, version solo puis version groupe. */
export function verifierSeanceDeroule(s: SeanceVerif, ctx: ContexteVerif): Avertissement[] {
  const res: Avertissement[] = []
  const versions: [Version, VersionVerif][] = [['solo', s.solo]]
  if (s.groupe) versions.push(['groupe', s.groupe])

  for (const [version, v] of versions) {
    // Étapes résumées : l'ordre réel n'est pas connu, on ne vérifie pas le déroulé (P-15 le dit)
    if (v.etapesDetaillees !== false) res.push(...verifsOrdre(s, v, version, ctx))
    res.push(...verifRepos(s, v, version, ctx), ...verifsFiches(s, v, version, ctx))
  }
  if (s.groupe) res.push(...verifsGroupe(s, s.groupe, ctx), ...verifIntensiteSoloGroupe(s, s.groupe, ctx))
  res.push(...verifSansExercice(s, ctx))
  return res
}
