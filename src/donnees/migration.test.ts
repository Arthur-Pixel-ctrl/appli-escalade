import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeAll, describe, expect, it } from 'vitest'

// Une séance solo et une séance en groupe, au format d'avant la version 3 :
// ni `versionFormat` récent ni `aEnvoyer`, et la séance libre n'a aucun champ facultatif.
const SEANCE_SOLO = {
  id: 'solo-1', versionFormat: 1, creeLe: '2026-11-10T17:00:00.000Z', modifieLe: '2026-11-10T18:30:00.000Z',
  date: '2026-11-10', mode: 'solo', nom: 'Doigts : suspensions', durete: 'dure', dureeMin: 55,
  effortPercu: 7, peau: 2, douleur: false,
  etapes: [{ titre: 'Échauffement', statut: 'faite' }, { titre: 'Suspensions', statut: 'passee' }],
  objectifs: [], blocs: [],
}
const SEANCE_GROUPE = {
  id: 'groupe-1', versionFormat: 1, creeLe: '2026-11-12T19:00:00.000Z', modifieLe: '2026-11-12T20:45:00.000Z',
  date: '2026-11-12', mode: 'groupe', nom: 'Blocs en groupe', durete: 'legere', dureeMin: 90,
  effortPercu: 5, peau: 3, douleur: true,
  etapes: [],
  objectifs: [{ libelle: '5 blocs rouges', cible: 5, fait: 3 }],
  blocs: [
    { couleur: 'Rouge', essais: 1, resultat: 'flash', objectif: 0 },
    { couleur: 'Rouge', essais: 4, resultat: 'non_enchaine', objectif: 0 },
  ],
}
// Une séance sans `creeLe` (très ancienne) : la migration doit le déduire de `modifieLe`.
const SEANCE_SANS_CREELE = { ...SEANCE_SOLO, id: 'ancienne-1', date: '2026-10-01', modifieLe: '2026-10-01T12:00:00.000Z', creeLe: undefined }
// Profil d'avant la v2 : aucun des champs récents (prérequis, jours, repère).
const PROFIL_ANCIEN = {
  id: 'profil', versionFormat: 1, creeLe: '2026-11-01T08:00:00.000Z', modifieLe: '2026-11-05T09:00:00.000Z',
  prenom: 'Arthur', disciplinePrincipale: 'bloc', niveauBloc: '7A', niveauVoie: '6c', objectif: 'Passer le 7B',
  anneesPratique: 6, experiencePoutre: 'occasionnelle', poidsCorpsKg: 72, pointsFaibles: 'Doigts',
  douleursEnCours: ['coude'], seancesParSemaine: 4, grimpeSouventEnGroupe: true, salleHabituelleId: 'salle-mroc',
}

beforeAll(async () => {
  await Dexie.delete('appli-escalade')
  // On recrée la base exactement comme sur le téléphone du propriétaire : version 2.
  const v2 = new Dexie('appli-escalade')
  v2.version(1).stores({ seancesRealisees: 'id, date, mode' })
  v2.version(2).stores({ seancesRealisees: 'id, date, mode', reglages: 'id' })
  await v2.open()
  await v2.table('seancesRealisees').bulkPut([SEANCE_SOLO, SEANCE_GROUPE, SEANCE_SANS_CREELE])
  await v2.table('reglages').put(PROFIL_ANCIEN)
  v2.close()
})

describe('migration de la base version 2 vers la version 3', () => {
  it('garde chaque séance intacte et ajoute seulement aEnvoyer', async () => {
    const { base } = await import('./base.ts')
    expect(base.verno).toBe(3)
    expect(await base.seancesRealisees.count()).toBe(3)
    // Champ par champ : ce qui existait n'a pas bougé, et le seul ajout est `aEnvoyer: 1`.
    expect(await base.seancesRealisees.get('solo-1')).toEqual({ ...SEANCE_SOLO, aEnvoyer: 1 })
    expect(await base.seancesRealisees.get('groupe-1')).toEqual({ ...SEANCE_GROUPE, aEnvoyer: 1 })
  })

  it('déduit creeLe de modifieLe quand il manquait', async () => {
    const { base } = await import('./base.ts')
    const s = await base.seancesRealisees.get('ancienne-1')
    expect(s?.creeLe).toBe('2026-10-01T12:00:00.000Z')
    expect(s?.modifieLe).toBe('2026-10-01T12:00:00.000Z')
    expect(s?.versionFormat).toBe(1)
    expect(s?.aEnvoyer).toBe(1)
  })

  it('garde le profil et lui ajoute les champs récents', async () => {
    const { base, lireProfil } = await import('./base.ts')
    const brut = await base.reglages.get('profil')
    expect(brut).toEqual({
      ...PROFIL_ANCIEN, aEnvoyer: 1,
      tractionsStrictes: null, tient15sSur25mm: null, majeur: null, grimpeEnTete: null,
      joursDisponibles: [], repereTraction: 'aucun', lieux: [],
    })
    const profil = await lireProfil()
    expect(profil).toMatchObject({ prenom: 'Arthur', niveauBloc: '7A', poidsCorpsKg: 72, douleursEnCours: ['coude'], tractionsStrictes: null })
  })

  it('crée les nouvelles tables, vides', async () => {
    const { base } = await import('./base.ts')
    for (const nom of ['cycles', 'phases', 'seancesPlanifiees', 'objectifsSpecifiques', 'exercicesPerso', 'salles', 'formes', 'douleurs', 'resultatsTests', 'etatSynchro', 'appareil']) {
      expect(base.tables.map((t) => t.name)).toContain(nom)
      expect(await base.table(nom).count()).toBe(0)
    }
  })

  it('les écrans existants lisent toujours les séances', async () => {
    const { lireSeances } = await import('./base.ts')
    const ids = (await lireSeances()).map((s) => s.id).sort()
    expect(ids).toEqual(['ancienne-1', 'groupe-1', 'solo-1'])
  })

  it('exporte puis réimporte, et accepte un fichier exporté avant la version 3', async () => {
    const { base, exporterDonnees, importerDonnees } = await import('./base.ts')
    const fichier = await exporterDonnees()
    expect(JSON.parse(fichier).version).toBe(2)
    expect(await importerDonnees(fichier)).toEqual({ seances: 3, autres: 1, ecartes: 0 })

    // Fichier ancien : séances et profil sans aucun des champs récents.
    const { versionFormat: _v, creeLe: _c, ...sansSuivi } = SEANCE_SOLO
    const ancien = JSON.stringify({
      version: 1, exporteLe: '2026-11-15T10:00:00.000Z',
      tables: { seancesRealisees: [{ ...sansSuivi, id: 'importee-1' }], reglages: [PROFIL_ANCIEN] },
    })
    expect(await importerDonnees(ancien)).toEqual({ seances: 1, autres: 1, ecartes: 0 })
    const importee = await base.seancesRealisees.get('importee-1')
    expect(importee).toMatchObject({ nom: 'Doigts : suspensions', versionFormat: 1, creeLe: SEANCE_SOLO.modifieLe, aEnvoyer: 1 })
    expect(await base.seancesRealisees.count()).toBe(4)
  })
})
