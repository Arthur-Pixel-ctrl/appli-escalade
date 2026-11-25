// Vérifications du jour (moteur-verification.md, B.8) : J-01 à J-07.
// Elles regardent la séance prévue aujourd'hui, au moment de l'ouvrir sur le téléphone.
// Elles avertissent sans bloquer.
import {
  ajouterJours,
  estDure,
  estMaximale,
  heuresEntre,
  itemsRouges,
  joursEntre,
} from './base.ts'
import { NOMS_ZONES } from './reglesParDefaut.ts'
import type { Avertissement, ContexteVerif, FormeVerif, Niveau, SeanceVerif } from './types.ts'

// Source affichée : [SYN] n'a pas d'auteur propre, on écrit donc la synthèse (regles-planification.md).
const SOURCE_SYNTHESE = "Synthèse de l'entraînement"

/** Vérifie la séance du jour et renvoie les avertissements J-01 à J-07, les plus forts d'abord. */
export function verifierJour(
  seanceDuJour: SeanceVerif,
  ctx: ContexteVerif,
  realisees: SeanceVerif[],
): Avertissement[] {
  const avertissements: Avertissement[] = []
  const { aujourdhui, regles } = ctx
  const fiches = ctx.fiches
  const dure = estDure(seanceDuJour, fiches)
  const maximale = estMaximale(seanceDuJour, fiches)
  // J-02 et J-04 suivent la condition de la spec (B.8) : estMaximale. Une séance dure sans exercice
  // (F7) n'a aucun marqueur, donc elle ne déclenche rien ; mais un marqueur de groupe compte.

  const ajouter = (code: string, niveau: Niveau, message: string, source: string) =>
    avertissements.push({ code, niveau, message, portee: 'jour', seanceId: seanceDuJour.id, source })

  const formeDuJour = ctx.formes.find((f) => f.date === aujourdhui)

  // J-01 : deux voyants au rouge ce matin, et une séance dure.
  if (formeDuJour && itemsRouges(formeDuJour) >= 2 && dure) {
    ajouter(
      'J-01',
      'information',
      'Deux voyants sont au rouge ce matin. Fais plutôt la version légère, ou une séance technique.',
      SOURCE_SYNTHESE,
    )
  }

  // J-02 : moins de 7 h de sommeil en moyenne sur les 3 dernières nuits, et une séance maximale.
  const trois: (FormeVerif | undefined)[] = [0, 1, 2].map((decalage) =>
    ctx.formes.find((f) => f.date === ajouterJours(aujourdhui, -decalage)),
  )
  if (maximale && trois.every((f) => f?.heuresSommeil !== undefined)) {
    const moyenne = trois.reduce((total, f) => total + (f?.heuresSommeil ?? 0), 0) / 3
    if (moyenne < regles.seuilSommeilH) {
      ajouter(
        'J-02',
        'information',
        `Moins de ${regles.seuilSommeilH} h de sommeil en moyenne sur 3 nuits : transforme la séance maximale en séance technique ou de volume.`,
        'Walsh et al.',
      )
    }
  }

  // J-03 : douleur signalée ce matin (2 sur 10 ou moins), et une séance dure.
  if (formeDuJour && formeDuJour.douleur <= 2 && dure) {
    ajouter(
      'J-03',
      'information',
      "Tu signales une douleur ce matin. Allège la séance, et arrête si elle dépasse 2 sur 10 pendant l'effort.",
      SOURCE_SYNTHESE,
    )
  }

  // J-04 : la dernière séance maximale réalisée date de moins de 48 h.
  const maximalesRealisees = realisees
    .filter((r) => r.realisee && estMaximale(r, fiches))
    .sort((a, b) => Date.parse(b.realisee!.finLe) - Date.parse(a.realisee!.finLe))
  const derniereMaximale = maximalesRealisees[0]
  if (maximale && derniereMaximale?.realisee) {
    const ecoulees = heuresEntre(derniereMaximale.realisee.finLe, ctx.maintenant)
    if (ecoulees >= 0 && ecoulees < regles.heuresEntreSeancesMax) {
      // Heures pleines : « 14 h écoulées » et « encore 34 h » (48 − 14), arrondi à l'heure supérieure.
      const h = Math.floor(ecoulees)
      const reste = Math.ceil(regles.heuresEntreSeancesMax - ecoulees)
      ajouter(
        'J-04',
        'fort',
        `Ta dernière séance maximale date de ${h} h. Attends encore ${reste} h, ou fais la version légère.`,
        SOURCE_SYNTHESE,
      )
    }
  }

  // J-05 : une douleur de réduction dure depuis 14 jours ou plus. On cite la plus ancienne.
  const douleursLongues = ctx.douleurs
    .filter(
      (d) =>
        d.niveau === 'reduction' &&
        (d.resolueLe === undefined || d.resolueLe > aujourdhui) &&
        joursEntre(d.date, aujourdhui) >= 14,
    )
    .sort((a, b) => a.date.localeCompare(b.date))
  const douleurLongue = douleursLongues[0]
  if (douleurLongue) {
    ajouter(
      'J-05',
      'fort',
      `Ta douleur (${NOMS_ZONES[douleurLongue.zone]}) dure depuis ${joursEntre(douleurLongue.date, aujourdhui)} jours. Consulte un médecin ou un kiné qui connaît l'escalade.`,
      SOURCE_SYNTHESE,
    )
  }

  // J-06 : un test qui baisse, et au moins 2 formes fatiguées sur les 14 derniers jours.
  const formesFatiguees = ctx.formes.filter((f) => {
    const jours = joursEntre(f.date, aujourdhui)
    return jours >= 0 && jours < 14 && f.fatigue <= 2
  })
  if (formesFatiguees.length >= 2) {
    const testBaisse = premierTestEnBaisse(ctx)
    if (testBaisse) {
      ajouter(
        'J-06',
        'information',
        `Ton test « ${testBaisse} » baisse et tu es fatigué : prends une semaine allégée avant de continuer.`,
        SOURCE_SYNTHESE,
      )
    }
  }

  // J-07 : la dernière séance réalisée avec peau abîmée date d'hier ou d'aujourd'hui, et séance dure.
  const peauAbimee = realisees
    .filter((r) => r.realisee?.peau === 1)
    .sort((a, b) => Date.parse(b.realisee!.finLe) - Date.parse(a.realisee!.finLe))[0]
  if (peauAbimee && joursEntre(peauAbimee.date, aujourdhui) >= 0 && joursEntre(peauAbimee.date, aujourdhui) <= 1 && dure) {
    ajouter(
      'J-07',
      'information',
      'Ta peau était abîmée à la dernière séance. Si tes pulpes sont roses et brillantes, prends un jour de repos.',
      'Pratique de grimpeurs',
    )
  }

  // Les plus forts d'abord ; à niveau égal, l'ordre des codes J-01 à J-07 est gardé.
  return avertissements.sort((a, b) => (a.niveau === b.niveau ? 0 : a.niveau === 'fort' ? -1 : 1))
}

/**
 * Nom du premier test dont le dernier résultat est moins bon que le précédent.
 * « Moins bon » dépend du sens de progrès : pour un temps (baisse), moins bon veut dire plus grand.
 */
function premierTestEnBaisse(ctx: ContexteVerif): string | undefined {
  const noms = [...new Set(ctx.resultatsTests.map((r) => r.testNom))]
  for (const nom of noms) {
    const resultats = ctx.resultatsTests
      .filter((r) => r.testNom === nom)
      .sort((a, b) => a.date.localeCompare(b.date))
    if (resultats.length < 2) continue
    const precedent = resultats[resultats.length - 2]
    const dernier = resultats[resultats.length - 1]
    const baisse =
      dernier.sensProgres === 'hausse' ? dernier.valeur < precedent.valeur : dernier.valeur > precedent.valeur
    if (baisse) return nom
  }
  return undefined
}
