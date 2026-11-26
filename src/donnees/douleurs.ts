// Douleurs déclarées (décision G2) : une douleur est un document daté de la table `douleurs`.
// Aucun diagnostic ici : une zone, des signes à cocher dans une liste fermée, une date.
import type { DateISO, DouleurDeclaree } from './modele.ts'
import { ZONES, type ZoneDouleur } from './profil.ts'
import { ecrire, lireTous, lireUn } from './stockage.ts'

// Une seule liste des signes d'arrêt, dans les mots que l'utilisateur lit déjà dans les mises en garde.
// Contenu tiré de la synthèse théorique (consignes de cliniciens). Ce n'est pas un avis médical.
export const SIGNES_ARRET = [
  'Claquement ou « pop » dans un doigt',
  'Douleur aiguë et soudaine à la base d’un doigt',
  'Gonflement ou bleu',
  'Tendon qui fait saillie',
  'Doigt impossible à plier ou à tendre complètement',
  'Genou qui gonfle ou se bloque',
  'Épaule instable',
  'Engourdissements',
]
export const SIGNES_REDUCTION = [
  'Douleur au-dessus de 2 sur 10 pendant l’effort',
  'Douleur qui dure plus de 10 minutes après l’effort',
  'Raideur inhabituelle d’une articulation le lendemain',
  'Douleur au coude quand tu serres une prise',
]
export const CONDUITE_REDUCTION =
  'Retire les arqués, le pan Güllich, les trous et les efforts maximaux. Garde de la grimpe facile et sans douleur. Sans nette amélioration en 14 jours, consulte.'

/** Enregistre une douleur. Un signe hors de la liste est refusé : aucun texte libre ne peut entrer. */
export async function declarerDouleur(d: { date: DateISO; zone: ZoneDouleur; signes: string[] }): Promise<DouleurDeclaree> {
  if (d.signes.some((s) => !SIGNES_ARRET.includes(s))) throw new Error('Signe inconnu.')
  const douleur = {
    id: crypto.randomUUID(), date: d.date, zone: d.zone, signes: [...d.signes],
    // Un seul critère : au moins un signe d'arrêt coché → alerte, sinon réduction.
    niveau: d.signes.length > 0 ? 'alerte' : 'reduction',
  } as DouleurDeclaree
  await ecrire('douleurs', douleur)
  return (await lireUn<DouleurDeclaree>('douleurs', douleur.id)) ?? douleur
}

/** Douleurs ouvertes ce jour-là : déclarées ce jour ou avant, pas résolues, par date croissante. */
export function douleursOuvertes(douleurs: DouleurDeclaree[], jour: DateISO): DouleurDeclaree[] {
  return douleurs
    .filter((d) => !d.supprimeLe && d.date <= jour && (d.resolueLe === undefined || d.resolueLe > jour))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function lireDouleursOuvertes(jour: DateISO): Promise<DouleurDeclaree[]> {
  return douleursOuvertes(await lireTous<DouleurDeclaree>('douleurs'), jour)
}

/** Ferme la douleur dès `jour` pour toutes les règles. */
export async function marquerResolue(id: string, jour: DateISO): Promise<void> {
  const d = await lireUn<DouleurDeclaree>('douleurs', id)
  if (!d) throw new Error('Douleur introuvable.')
  await ecrire('douleurs', { ...d, resolueLe: jour })
}

const nomZone = (z: ZoneDouleur) => ZONES.find((x) => x.valeur === z)?.nom.toLowerCase() ?? z

/**
 * Le signal d'Aujourd'hui. Un signe d'alerte passe avant tout (même phrase que S-05) ;
 * sinon les zones du profil et des douleurs en réduction, dans l'ordre de `ZONES`, sans doublon.
 */
export function signalDouleur(zonesProfil: ZoneDouleur[], ouvertes: DouleurDeclaree[]): { titre: string; texte: string } | null {
  const ordre = (zones: Set<ZoneDouleur>) => ZONES.filter((z) => zones.has(z.valeur)).map((z) => nomZone(z.valeur)).join(', ')
  const alertes = new Set(ouvertes.filter((d) => d.niveau === 'alerte').map((d) => d.zone))
  if (alertes.size > 0) {
    return {
      titre: `Signe d’alerte déclaré : ${ordre(alertes)}.`,
      texte: 'Pas de séance dure avant d’avoir consulté un médecin ou un kiné qui connaît l’escalade.',
    }
  }
  const zones = new Set<ZoneDouleur>([...zonesProfil, ...ouvertes.filter((d) => d.niveau === 'reduction').map((d) => d.zone)])
  if (zones.size === 0) return null
  return { titre: `Douleur déclarée : ${ordre(zones)}.`, texte: 'Ménage cette zone et arrête-toi dès que ça fait mal.' }
}
