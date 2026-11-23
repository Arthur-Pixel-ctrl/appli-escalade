// Vérifications de séance S-01 à S-09 : fiche connue, prérequis du profil, douleurs, contexte
// (moteur-verification.md, B.5). Fonctions pures. Elles avertissent, elles ne bloquent jamais.
import { COTATIONS_BLOC } from '../donnees/profil.ts'
import { estDure, joursEntre, marqueursDe, zonesDouloureuses } from './base.ts'
import { MARQUEURS_RISQUE_DOULEUR, NOMS_ZONES } from './reglesParDefaut.ts'
import type {
  Avertissement,
  ContexteVerif,
  EtapeVerif,
  FicheVerif,
  Prerequis,
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

/** Vérifications d'une étape dont la fiche est connue (S-02 à S-09). */
function verifierEtape(
  fiche: FicheVerif,
  ctx: ContexteVerif,
  zones: string[],
  s: SeanceVerif,
  origine: 'utilisateur' | 'assistant',
  cible: { version: 'solo' | 'groupe'; etapeIndex: number },
): Avertissement[] {
  const base = { portee: 'etape' as const, seanceId: s.id, version: cible.version, etapeIndex: cible.etapeIndex }
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
    alertes.push({
      ...base,
      code: 'S-03',
      niveau: 'fort',
      message: `« ${fiche.nom} » demande : ${manques.join(' ; ')}. Choisis une fiche plus accessible, ou complète ton profil si c'est déjà le cas.`,
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

function verifierVersion(
  v: VersionVerif,
  version: 'solo' | 'groupe',
  s: SeanceVerif,
  ctx: ContexteVerif,
  origine: 'utilisateur' | 'assistant',
): Avertissement[] {
  const zones = zonesDouloureuses(ctx, s.date)
  return v.etapes.flatMap((etape: EtapeVerif, etapeIndex) => {
    const fiche = ctx.fiches[etape.ficheId]
    // Une fiche inconnue ne produit que S-01 ; les autres vérifications l'ignorent.
    if (!fiche) {
      return [
        {
          code: 'S-01',
          niveau: 'fort' as const,
          message: `Cet exercice n'existe pas dans ta bibliothèque (${etape.ficheId}). Remplace-le ou supprime l'étape.`,
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
