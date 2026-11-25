// Vérifications de séance S-01 à S-09 : fiche connue, prérequis du profil, douleurs, contexte
// (moteur-verification.md, B.5). Fonctions pures. Elles avertissent, elles ne bloquent jamais.
// (consolidation 25/11) S-03 dit les prérequis non renseignés (`nonRenseignes`) ; S-01 a un message propre pour un exercice principal de partie.
// (consolidation 24/11) Un principal hors étapes est vérifié comme une étape, en portée séance (sujet = fiche, sans rang).
import { COTATIONS_BLOC } from '../donnees/profil.ts'
import { estDure, joursEntre, marqueursDe, zonesDouloureuses } from './base.ts'
import { MARQUEURS_RISQUE_DOULEUR, NOMS_ZONES } from './reglesParDefaut.ts'
import type {
  Avertissement,
  ContexteVerif,
  EtapeVerif,
  FicheVerif,
  Prerequis,
  PrerequisNonRenseigne,
  ProfilVerif,
  SeanceVerif,
  VersionVerif,
} from './types.ts'

// Sources en clair (« [SYN] » devient « Synthèse », etc.), auteurs gardés entre parenthèses.
const SOURCE = {
  S01: "Choix de l'app (intégrité ; protège contre une invention de l'assistant)",
  S02: "Audit de la bibliothèque (I-2, I-9, I-10)",
  S03: 'Audit de la bibliothèque (B-1, B-3), Synthèse (López, Hörst, BMC, Lattice)',
  S04: 'Modèle de données, Synthèse (réduction ciblée)',
  S05: 'Synthèse (arrêt immédiat et consultation)',
  S06: 'Synthèse',
  S07: 'Synthèse, Audit de la bibliothèque (I-13)',
  S08_S09: 'Audit de la bibliothèque (I-13)',
}

const RANG_POUTRE = { aucune: 0, occasionnelle: 1, reguliere: 2 }

/**
 * Ce qui manque au profil pour une fiche, en phrases (S-03), dans l'ordre :
 * années, poutre, tractions, test 15 s, niveau en bloc, adulte. Une donnée du profil à null
 * compte comme « non remplie » (prudence). Sert aussi à P-12 et à l'assistant.
 */
export function manquesPrerequis(prerequis: Prerequis, profil: ProfilVerif): string[] {
  const manques: string[] = []
  const { anneesPratiqueMin, experiencePoutreMin, tractionsStrictesMin, niveauBlocMin } = prerequis

  if (anneesPratiqueMin !== undefined && profil.anneesPratique < anneesPratiqueMin) {
    manques.push(`${anneesPratiqueMin} ans de pratique (tu en as ${profil.anneesPratique})`)
  }
  if (experiencePoutreMin !== undefined && RANG_POUTRE[profil.experiencePoutre] < RANG_POUTRE[experiencePoutreMin]) {
    manques.push(`une expérience de poutre ${experiencePoutreMin === 'reguliere' ? 'régulière' : 'occasionnelle'}`)
  }
  if (tractionsStrictesMin !== undefined) {
    const faites = profil.tractionsStrictesMax
    if (faites === null) manques.push(`${tractionsStrictesMin} tractions strictes (non renseigné)`)
    else if (faites < tractionsStrictesMin) manques.push(`${tractionsStrictesMin} tractions strictes (tu en fais ${faites})`)
  }
  if (prerequis.test15sSur25mm && profil.test15sSur25mm !== true) {
    manques.push('tenir 15 s sur une réglette de 25 mm')
  }
  if (niveauBlocMin !== undefined) {
    // On compare les positions dans la liste des cotations, jamais les textes.
    const niveauConnu = profil.niveauBloc !== null && COTATIONS_BLOC.includes(profil.niveauBloc)
    if (!niveauConnu || COTATIONS_BLOC.indexOf(profil.niveauBloc as string) < COTATIONS_BLOC.indexOf(niveauBlocMin)) {
      manques.push(`un niveau ${niveauBlocMin} en bloc`)
    }
  }
  if (prerequis.adulte && profil.adulte !== true) {
    manques.push('18 ans ou plus')
  }
  return manques
}

/**
 * Les prérequis demandés par la fiche dont la valeur du profil est null, dans l'ordre de B.5 (S-03).
 * Une valeur false ou trop basse est renseignée : elle n'y figure pas. Sert à l'écran (« Ton profil ne dit pas encore : … »).
 */
export function prerequisNonRenseignes(prerequis: Prerequis, profil: ProfilVerif): PrerequisNonRenseigne[] {
  const liste: PrerequisNonRenseigne[] = []
  if (prerequis.tractionsStrictesMin !== undefined && profil.tractionsStrictesMax === null) liste.push('tractionsStrictesMax')
  if (prerequis.test15sSur25mm && profil.test15sSur25mm === null) liste.push('test15sSur25mm')
  if (prerequis.niveauBlocMin !== undefined && profil.niveauBloc === null) liste.push('niveauBloc')
  if (prerequis.adulte && profil.adulte === null) liste.push('adulte')
  return liste
}

/** Vérifications d'une étape dont la fiche est connue (S-02 à S-09). */
function verifierEtape(
  fiche: FicheVerif,
  ctx: ContexteVerif,
  zones: string[],
  s: SeanceVerif,
  origine: 'utilisateur' | 'assistant',
  cible: { version: 'solo' | 'groupe'; etapeIndex: number } | { version: 'solo'; sujet: string },
): Avertissement[] {
  // Une étape : portée « etape » avec son rang. Un principal hors étapes : portée « seance », sans rang,
  // avec l'identifiant de la fiche pour le distinguer (niveaux-de-detail.md § 3.4).
  const base =
    'etapeIndex' in cible
      ? { portee: 'etape' as const, seanceId: s.id, version: cible.version, etapeIndex: cible.etapeIndex }
      : { portee: 'seance' as const, seanceId: s.id, version: cible.version, sujet: cible.sujet }
  const alertes: Avertissement[] = []
  const { profil } = ctx

  // S-02 : fiche encore à vérifier
  if (fiche.exclureDeLaGeneration !== undefined) {
    const raison = fiche.exclureDeLaGeneration
    alertes.push({
      ...base,
      code: 'S-02',
      niveau: origine === 'assistant' ? 'fort' : 'information',
      message:
        origine === 'assistant'
          ? `L'assistant a proposé « ${fiche.nom} », qui n'est pas encore prête : ${raison}. Remplace-la.`
          : `« ${fiche.nom} » a un réglage encore à vérifier : ${raison}. Garde-la seulement si tu sais la régler.`,
      source: SOURCE.S02,
    })
  }

  // S-03 : prérequis non remplis (une seule alerte par fiche, qui liste tous les manques)
  const manques = manquesPrerequis(fiche.prerequis, profil)
  if (manques.length > 0) {
    const nonRenseignes = prerequisNonRenseignes(fiche.prerequis, profil)
    alertes.push({
      ...base,
      code: 'S-03',
      niveau: 'fort',
      message: `« ${fiche.nom} » demande : ${manques.join(' ; ')}. Choisis une fiche plus accessible, ou complète ton profil si c'est déjà le cas.`,
      ...(nonRenseignes.length > 0 ? { nonRenseignes } : {}),
      source: SOURCE.S03,
    })
  }

  // S-04 : douleur déclarée sur une zone que la fiche sollicite
  const zonesTouchees = fiche.contreIndications.filter((z) => zones.includes(z))
  if (zonesTouchees.length > 0) {
    alertes.push({
      ...base,
      code: 'S-04',
      niveau: 'fort',
      message: `Tu as signalé une douleur (${zonesTouchees.map((z) => NOMS_ZONES[z]).join(', ')}). « ${fiche.nom} » la sollicite : remplace-la par un exercice qui ne fait pas mal, ou retire-la.`,
      source: SOURCE.S04,
    })
  }

  // S-06 : effort à risque pendant une douleur « réduction » récente (0 à 14 jours)
  const douleurRecente = ctx.douleurs.some((d) => {
    const ouverte = d.resolueLe === undefined || d.resolueLe > s.date
    const jours = joursEntre(d.date, s.date)
    return d.niveau === 'reduction' && ouverte && jours >= 0 && jours <= 14
  })
  if (douleurRecente && marqueursDe(fiche).some((m) => MARQUEURS_RISQUE_DOULEUR.includes(m))) {
    alertes.push({
      ...base,
      code: 'S-06',
      niveau: 'fort',
      message: `Tu as une douleur en cours. Pendant 1 à 2 semaines, retire « ${fiche.nom} » : pas d'arqué, de pan, de trous ni d'effort maximal. Garde de la grimpe facile qui ne fait pas mal.`,
      source: SOURCE.S06,
    })
  }

  // S-07 : grimpe en tête exigée ; S-08 : partenaire (pas si S-07 déjà émis pour cette étape)
  const tetePasPrete = fiche.contexte?.grimpeEnTete === true && profil.grimpeEnTete !== true
  if (tetePasPrete) {
    alertes.push({
      ...base,
      code: 'S-07',
      niveau: 'fort',
      message: `« ${fiche.nom} » demande de savoir grimper et tomber en tête, avec un assureur formé à l'assurage dynamique. Fais-toi d'abord former.`,
      source: SOURCE.S07,
    })
  } else if (fiche.contexte?.partenaire === true) {
    alertes.push({
      ...base,
      code: 'S-08',
      niveau: 'information',
      message: `« ${fiche.nom} » se fait avec un partenaire (assureur ou observateur). Prévois-le.`,
      source: SOURCE.S08_S09,
    })
  }

  // S-09 : fiche en voie pour un bloqueur
  if (fiche.contexte?.terrain === 'voie' && profil.disciplinePrincipale === 'bloc') {
    alertes.push({
      ...base,
      code: 'S-09',
      niveau: 'information',
      message: `« ${fiche.nom} » se fait en voie. Vérifie que ta salle en a.`,
      source: SOURCE.S08_S09,
    })
  }
  return alertes
}

/** S-01 : fiche inconnue. Une étape réelle peut être supprimée ; un exercice principal de partie se remplace (B.5). */
function messageFicheInconnue(ficheId: string, principalDePartie: boolean): string {
  return principalDePartie
    ? `Cet exercice n'existe pas dans ta bibliothèque (${ficheId}). Choisis un autre exercice principal pour la partie qui le cite.`
    : `Cet exercice n'existe pas dans ta bibliothèque (${ficheId}). Remplace-le ou supprime l'étape.`
}

function verifierVersion(
  v: VersionVerif,
  version: 'solo' | 'groupe',
  s: SeanceVerif,
  ctx: ContexteVerif,
  origine: 'utilisateur' | 'assistant',
): Avertissement[] {
  const zones = zonesDouloureuses(ctx, s.date)
  const alertesEtapes = v.etapes.flatMap((etape: EtapeVerif, etapeIndex) => {
    const fiche = ctx.fiches[etape.ficheId]
    // Une fiche inconnue ne produit que S-01 ; les autres vérifications l'ignorent.
    if (!fiche) {
      return [
        {
          code: 'S-01',
          niveau: 'fort' as const,
          // Étape résumée (version sans étapes détaillées) : c'est l'exercice principal d'une partie.
          message: messageFicheInconnue(etape.ficheId, v.etapesDetaillees === false),
          portee: 'etape' as const,
          seanceId: s.id,
          version,
          etapeIndex,
          source: SOURCE.S01,
        },
      ]
    }
    return verifierEtape(fiche, ctx, zones, s, origine, { version, etapeIndex })
  })
  // Principaux hors étapes (solo seulement) : mêmes vérifications que pour une étape, S-01 si la fiche est inconnue.
  const alertesPrincipaux = (v.principauxHorsEtapes ?? []).flatMap((ficheId) => {
    const fiche = ctx.fiches[ficheId]
    if (!fiche) {
      return [
        {
          code: 'S-01',
          niveau: 'fort' as const,
          message: messageFicheInconnue(ficheId, true),
          portee: 'seance' as const,
          seanceId: s.id,
          version,
          sujet: ficheId,
          source: SOURCE.S01,
        },
      ]
    }
    return verifierEtape(fiche, ctx, zones, s, origine, { version: 'solo', sujet: ficheId })
  })
  return [...alertesEtapes, ...alertesPrincipaux]
}

/** Applique S-01 à S-09 à la version solo, puis à la version groupe (étapes du mini-bloc). */
export function verifierSeanceProfil(
  s: SeanceVerif,
  ctx: ContexteVerif,
  origine: 'utilisateur' | 'assistant',
): Avertissement[] {
  const alertes: Avertissement[] = []

  // S-05 : signe d'alerte non résolu et séance dure (une seule alerte par séance, versions confondues)
  const alerte = ctx.douleurs.filter((d) => d.niveau === 'alerte' && (d.resolueLe === undefined || d.resolueLe > s.date) && d.date <= s.date)
  if (alerte.length > 0 && estDure(s, ctx.fiches)) {
    const signes = [...new Set(alerte.flatMap((d) => d.signes))].join(', ')
    alertes.push({
      code: 'S-05',
      niveau: 'fort',
      message: `Tu as signalé un signe d'alerte (${signes}). Pas de séance dure avant d'avoir consulté un médecin ou un kiné qui connaît l'escalade.`,
      portee: 'seance',
      seanceId: s.id,
      source: SOURCE.S05,
    })
  }

  alertes.push(...verifierVersion(s.solo, 'solo', s, ctx, origine))
  if (s.groupe) alertes.push(...verifierVersion(s.groupe, 'groupe', s, ctx, origine))
  return alertes
}
