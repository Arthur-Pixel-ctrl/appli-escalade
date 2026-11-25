// Fonctions pures de la vue Semaine et de l'éditeur de séance (D-16).
// Rien ici n'écrit dans la base : l'écran passe par `Plan.tsx` puis `src/donnees/plan.ts`.
// Rien de calculable n'est stocké (R-8) : durée, dureté proposée, qualité proposée se recalculent à chaque affichage.
import { protocoleParId } from '../../donnees/bibliotheque/index.ts'
import type { ExercicePerso, SeancePlanifiee, VersionGroupe, VersionSolo } from '../../donnees/modele.ts'
import { type ObjectifGroupeType } from '../../donnees/objectifsGroupe.ts'
import { SEANCES_TYPES, type SeanceType } from '../../donnees/seancesTypes.ts'
import type { EtapeSeance, ObjectifGroupe } from '../../moteur/types.ts'
import {
  etapeDepuisExercicePerso, etapeDepuisProtocole, marqueursVersionPlanifiee, phraseRaison, seancesTypesDisponibles, trierFiches,
  type FicheVerif, type ProfilVerif, type Qualite, type ZoneDouleur,
} from '../../regles/index.ts'

type Fiches = Record<string, FicheVerif>

export const TEXTE_ECHAUFFEMENT_COMMUN = 'Échauffement en commun : 20 à 30 min de grimpe de plus en plus dure'
export const NB_OBJECTIFS_GROUPE_MAX = 3

/** Numéro de semaine du cycle (1 à 12) → phase (1 à 3) et semaine dans la phase (1 à 4). */
export function positionDeLaSemaine(numero: number): { ordre: 1 | 2 | 3; semaine: 1 | 2 | 3 | 4 } {
  return { ordre: (Math.floor((numero - 1) / 4) + 1) as 1 | 2 | 3, semaine: (((numero - 1) % 4) + 1) as 1 | 2 | 3 | 4 }
}

// ——— Étapes ———

/** Identifiant libre dans la séance : « echelles », puis « echelles-2 », « echelles-3 »… */
export function idEtapeLibre(etapes: EtapeSeance[], base: string): string {
  const pris = new Set(etapes.map((e) => e.id))
  if (!pris.has(base)) return base
  let n = 2
  while (pris.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

/** Étape recopiée complète (architecture § 3.2) depuis une fiche de la bibliothèque ou un exercice personnel. */
export function etapeDepuisFiche(ficheId: string, persos: ExercicePerso[], dejaLa: EtapeSeance[]): EtapeSeance | undefined {
  const id = idEtapeLibre(dejaLa, ficheId)
  const protocole = protocoleParId(ficheId)
  if (protocole) return etapeDepuisProtocole(protocole, id)
  const perso = persos.find((e) => e.id === ficheId && !e.supprimeLe)
  return perso ? etapeDepuisExercicePerso(perso, id) : undefined
}

export function monterOuDescendre<T>(liste: T[], index: number, sens: -1 | 1): T[] {
  const cible = index + sens
  if (cible < 0 || cible >= liste.length) return liste
  const copie = [...liste]
  ;[copie[index], copie[cible]] = [copie[cible], copie[index]]
  return copie
}

export function retirerDe<T>(liste: T[], index: number): T[] {
  return liste.filter((_, i) => i !== index)
}

/** Remplace une étape par une autre à la même place. */
export function remplacerEtape(etapes: EtapeSeance[], index: number, nouvelle: EtapeSeance): EtapeSeance[] {
  return etapes.map((e, i) => (i === index ? nouvelle : e))
}

/** Ajoute à la fin des étapes solo, ou au mini-bloc de la version groupe (créé « avant » s'il n'existe pas). */
export function ajouterEtape(seance: SeancePlanifiee, etape: EtapeSeance, ou: 'solo' | 'minibloc'): SeancePlanifiee {
  if (ou === 'minibloc' && seance.groupe) {
    const mini = seance.groupe.miniBloc ?? { moment: 'avant' as const, etapes: [] }
    const etapes = [...mini.etapes, { ...etape, id: idEtapeLibre(mini.etapes, etape.id) }]
    return { ...seance, groupe: { ...seance.groupe, miniBloc: { ...mini, etapes } } }
  }
  return { ...seance, solo: { ...seance.solo, etapes: [...seance.solo.etapes, { ...etape, id: idEtapeLibre(seance.solo.etapes, etape.id) }] } }
}

// ——— Valeurs proposées (calculées, jamais stockées) ———

/** Qualité de la première étape qui n'est pas un échauffement ; `undefined` si aucune ne la donne. */
export function qualiteProposee(etapes: EtapeSeance[], fiches: Fiches): Qualite | undefined {
  for (const e of etapes) {
    const fiche = e.origine ? fiches[e.origine.refId] : undefined
    if (fiche && fiche.qualite !== 'echauffement') return fiche.qualite
  }
  return undefined
}

/** Dureté proposée : dure si une étape porte un effort maximal (la règle `estDure` du moteur), sinon légère. */
export function duretePropose(solo: VersionSolo, fiches: Fiches): 'dure' | 'legere' {
  return marqueursVersionPlanifiee(solo, fiches).includes('maximale') ? 'dure' : 'legere'
}

/** Effort prévu quand rien n'est choisi : 7 si dure, 4 si légère (B17). */
export function effortParDefaut(durete: 'dure' | 'legere'): number {
  return durete === 'dure' ? 7 : 4
}

// ——— Version groupe ———

export function objectifVide(): ObjectifGroupe {
  return { libelle: '', cible: 3, compte: 'blocs_notes' }
}

/** Un objectif du catalogue devient un objectif enregistré (mêmes champs que la passerelle `seanceDepuisType`). */
export function objectifDepuisType(o: ObjectifGroupeType): ObjectifGroupe {
  return {
    libelle: o.libelle, cible: o.cible, compte: o.compte, modeleId: o.id,
    ...(o.ficheReference !== undefined ? { ficheReference: o.ficheReference } : {}),
    ...(o.blocs !== undefined ? { blocs: o.blocs } : {}),
    ...(o.essaisMaxParBloc !== undefined ? { essaisMaxParBloc: o.essaisMaxParBloc } : {}),
    ...(o.ecartCotation !== undefined ? { ecartCotation: [...o.ecartCotation] as [number, number] } : {}),
    ...(o.reposConseilleS !== undefined ? { reposConseilleS: o.reposConseilleS } : {}),
    accents: [...o.accents],
  }
}


/** Version groupe vide : un seul objectif à remplir, repos prudent de 3 min. */
export function groupeVide(solo: VersionSolo): VersionGroupe {
  return { nom: solo.nom, durete: solo.durete, reposConseilleS: 180, objectifs: [objectifVide()] }
}

/** « Copier depuis la version solo » : nom, dureté et effort. Les étapes ne passent pas : l'échauffement du groupe est commun. */
export function copierSoloVersGroupe(solo: VersionSolo, groupe: VersionGroupe): VersionGroupe {
  const { effortPrevu: _ancien, ...sansEffort } = groupe
  return { ...sansEffort, nom: solo.nom, durete: solo.durete, ...(solo.effortPrevu !== undefined ? { effortPrevu: solo.effortPrevu } : {}) }
}

/** Vrai tant que la version groupe n'a pas un objectif écrit (information, pas un blocage). */
export function groupePasRempli(groupe: VersionGroupe | null): boolean {
  return groupe === null || !groupe.objectifs.some((o) => o.libelle.trim() !== '')
}

// ——— Séances types : disponibles d'abord, les autres avec leur raison ———

export interface ChoixSeanceType {
  seanceType: SeanceType
  variante?: string
  disponible: boolean
  raison?: string // seulement pour une séance indisponible
}

function fichesDe(st: SeanceType, variante?: string): string[] {
  const v = variante === undefined ? undefined : st.variantes[variante]
  const mini = v?.miniBloc ?? st.groupe?.miniBloc
  return [...(v?.solo ?? st.solo), ...(mini?.etapes ?? [])].map((e) => e.ficheId)
}

/**
 * Tous les choix du menu « Ajouter une séance type » : d'abord ceux que `seancesTypesDisponibles` propose
 * (séance de base puis ses variantes), ensuite les autres avec la raison de la première fiche écartée.
 */
export function choixSeancesTypes(fiches: FicheVerif[], profil: ProfilVerif, zones: ZoneDouleur[], catalogue: SeanceType[] = SEANCES_TYPES): ChoixSeanceType[] {
  const { disponibles, indisponibles } = trierFiches(fiches, profil, zones)
  const propose = seancesTypesDisponibles(disponibles, catalogue)
  const raisonDeFiches = (ids: string[]): string => {
    const ecartee = indisponibles.find((i) => ids.includes(i.fiche.id))
    return ecartee ? `${ecartee.fiche.nom} : ${phraseRaison(ecartee, profil, zones)}` : 'Sa séance de base n’est pas proposée automatiquement.'
  }
  const bons: ChoixSeanceType[] = []
  const autres: ChoixSeanceType[] = []
  for (const st of catalogue) {
    const trouve = propose.find((p) => p.seanceType.id === st.id)
    if (trouve) bons.push({ seanceType: st, disponible: true })
    else autres.push({ seanceType: st, disponible: false, raison: raisonDeFiches(fichesDe(st)) })
    for (const nom of Object.keys(st.variantes)) {
      if (trouve?.variantes.includes(nom)) bons.push({ seanceType: st, variante: nom, disponible: true })
      else autres.push({ seanceType: st, variante: nom, disponible: false, raison: raisonDeFiches(fichesDe(st, nom)) })
    }
  }
  return [...bons, ...autres]
}

// ——— Changement venu d'un autre appareil ———

/** Vrai si une séance de la semaine affichée (ou son absence) diffère entre deux lectures du plan. */
export function semaineAChange(
  avant: { phases: { id: string; ordre: number }[]; seances: SeancePlanifiee[] },
  apres: { phases: { id: string; ordre: number }[]; seances: SeancePlanifiee[] },
  numero: number,
): boolean {
  const { ordre, semaine } = positionDeLaSemaine(numero)
  const deLaSemaine = (d: typeof avant) => {
    const phase = d.phases.find((p) => p.ordre === ordre)
    return d.seances.filter((s) => s.phaseId === phase?.id && s.semaine === semaine)
  }
  const resume = (liste: SeancePlanifiee[]) => liste.map((s) => `${s.id}@${s.modifieLe}`).sort().join('|')
  return resume(deLaSemaine(avant)) !== resume(deLaSemaine(apres))
}
