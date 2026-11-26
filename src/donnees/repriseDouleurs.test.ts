import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { controlesDuJour } from '../ecrans/controlesDuJour.ts'
import { base, dateDeReprise, estRepriseDuProfil, exporterDonnees, importerDonnees, jourLocal, lireProfil } from './base.ts'
import { marquerResolue } from './douleurs.ts'
import type { DouleurDeclaree } from './modele.ts'
import { PROFIL_VIDE } from './profil.ts'
import { supprimer } from './stockage.ts'

const CREE_LE = '2026-11-03T10:00:00.000Z'
const MODIFIE_LE = '2026-11-05T09:00:00.000Z'

// Un profil tel qu'il était avant la décision G2 : avec le champ des zones.
const ancienProfil = (extra: Record<string, unknown> = {}) => ({
  ...PROFIL_VIDE, id: 'profil', versionFormat: 1, creeLe: CREE_LE, modifieLe: MODIFIE_LE, aEnvoyer: 1 as const,
  douleursEnCours: ['coude', 'doigts'], ...extra,
})
const poserProfil = (extra: Record<string, unknown> = {}) => base.reglages.put(ancienProfil(extra) as never)
const brut = () => base.reglages.get('profil') as unknown as Promise<Record<string, unknown>>
const douleurs = () => base.douleurs.toArray()

beforeEach(async () => {
  await base.reglages.clear()
  await base.douleurs.clear()
})

describe('reprise des zones de l’ancien profil', () => {
  it('chaque zone devient une douleur datée du jour de création, et le champ disparaît', async () => {
    await poserProfil()
    const profil = await lireProfil()
    expect('douleursEnCours' in profil!).toBe(false)

    const apres = await brut()
    expect('douleursEnCours' in apres).toBe(false)
    expect(apres.aEnvoyer).toBe(1)
    expect(String(apres.modifieLe) > MODIFIE_LE).toBe(true)

    const liste = (await douleurs()).sort((a, b) => a.id.localeCompare(b.id))
    expect(liste.map((d) => d.id)).toEqual(['reprise-profil-coude', 'reprise-profil-doigts'])
    for (const d of liste) {
      expect(d).toMatchObject({ date: jourLocal(new Date(CREE_LE)), niveau: 'reduction', signes: [], aEnvoyer: 1 })
      expect(d.resolueLe).toBeUndefined()
      expect(estRepriseDuProfil(d)).toBe(true)
    }
  })

  it('un second lireProfil n’écrit rien', async () => {
    await poserProfil()
    await lireProfil()
    const avant = [await brut(), ...(await douleurs())].map((d) => d.modifieLe)
    await new Promise((r) => setTimeout(r, 5))
    await lireProfil()
    expect([await brut(), ...(await douleurs())].map((d) => d.modifieLe)).toEqual(avant)
  })

  it('une douleur reprise puis résolue ne revient pas quand l’ancien champ revient', async () => {
    await poserProfil({ douleursEnCours: ['coude'] })
    await lireProfil()
    await marquerResolue('reprise-profil-coude', '2026-11-26')
    const resolue = await base.douleurs.get('reprise-profil-coude')

    await poserProfil({ douleursEnCours: ['coude'] }) // comme un ancien appareil
    await lireProfil()
    expect(await douleurs()).toHaveLength(1)
    expect(await base.douleurs.get('reprise-profil-coude')).toEqual(resolue)
    expect('douleursEnCours' in (await brut())).toBe(false)
  })

  it('même chose si la douleur reprise a été supprimée', async () => {
    await poserProfil({ douleursEnCours: ['coude'] })
    await lireProfil()
    await supprimer('douleurs', 'reprise-profil-coude')
    const supprimee = await base.douleurs.get('reprise-profil-coude')
    expect(supprimee?.supprimeLe).toBeDefined()

    await poserProfil({ douleursEnCours: ['coude'] })
    await lireProfil()
    expect(await douleurs()).toHaveLength(1)
    expect(await base.douleurs.get('reprise-profil-coude')).toEqual(supprimee)
    expect('douleursEnCours' in (await brut())).toBe(false)
  })

  it('un profil sans zone ne crée rien et n’est pas réécrit', async () => {
    await poserProfil({ douleursEnCours: [] })
    await lireProfil()
    expect(await douleurs()).toHaveLength(0)
    expect((await brut()).modifieLe).toBe(MODIFIE_LE)

    const { douleursEnCours: _, ...sansChamp } = ancienProfil()
    await base.reglages.put(sansChamp as never)
    await lireProfil()
    expect(await douleurs()).toHaveLength(0)
    expect((await brut()).modifieLe).toBe(MODIFIE_LE)
  })

  it('pas de profil : rien', async () => {
    expect(await lireProfil()).toBeNull()
    expect(await douleurs()).toHaveLength(0)
  })

  it('une zone inconnue est ignorée, le champ est retiré', async () => {
    await poserProfil({ douleursEnCours: ['coude', 'pied'] })
    await lireProfil()
    expect((await douleurs()).map((d) => d.id)).toEqual(['reprise-profil-coude'])
    expect('douleursEnCours' in (await brut())).toBe(false)
  })

  it('deux appareils qui reprennent le même profil écrivent le même identifiant : aucun doublon', async () => {
    await poserProfil({ douleursEnCours: ['genou'] })
    // Deux lectures en même temps, comme deux ouvertures de l'app.
    await Promise.all([lireProfil(), lireProfil()])
    expect((await douleurs()).map((d) => d.id)).toEqual(['reprise-profil-genou'])

    // « L'autre appareil » : même profil, même identifiant, sur une base vide.
    const premiere = await base.douleurs.get('reprise-profil-genou') as DouleurDeclaree
    await base.douleurs.clear()
    await poserProfil({ douleursEnCours: ['genou'] })
    await lireProfil()
    const seconde = await base.douleurs.get('reprise-profil-genou') as DouleurDeclaree
    expect(seconde.id).toBe(premiere.id)
    expect(seconde.date).toBe(premiere.date)
  })

  it('une sauvegarde ancienne avec des zones s’importe, puis est reprise', async () => {
    const fichier = JSON.stringify({
      version: 1, exporteLe: '2026-11-15T10:00:00.000Z',
      tables: {
        seancesRealisees: [],
        reglages: [{ ...ancienProfil({ douleursEnCours: ['genou'] }), aEnvoyer: undefined }],
      },
    })
    await importerDonnees(fichier)
    expect(await douleurs()).toHaveLength(0)
    await lireProfil()
    const d = await base.douleurs.get('reprise-profil-genou')
    expect(d).toMatchObject({ date: jourLocal(new Date(CREE_LE)), zone: 'genou', niveau: 'reduction' })
    // La douleur reprise part aussi dans une nouvelle sauvegarde.
    expect(JSON.parse(await exporterDonnees()).tables.douleurs).toHaveLength(1)
  })
})

describe('dateDeReprise', () => {
  const AUJOURDHUI = '2026-11-26'
  it('creeLe lisible : son jour local', () => {
    expect(dateDeReprise({ creeLe: CREE_LE, modifieLe: MODIFIE_LE }, AUJOURDHUI)).toBe(jourLocal(new Date(CREE_LE)))
  })
  it('creeLe de 1970 : le jour de modifieLe', () => {
    expect(dateDeReprise({ creeLe: '1970-01-01T00:00:00.000Z', modifieLe: MODIFIE_LE }, AUJOURDHUI)).toBe(jourLocal(new Date(MODIFIE_LE)))
  })
  it('aucune date lisible : 14 jours avant aujourd’hui', () => {
    expect(dateDeReprise({}, AUJOURDHUI)).toBe('2026-11-12')
    expect(dateDeReprise({ creeLe: 'pas une date', modifieLe: 42 }, AUJOURDHUI)).toBe('2026-11-12')
    expect(dateDeReprise({ creeLe: '1970-01-01T00:00:00.000Z', modifieLe: '1970-01-01T00:00:00.000Z' }, AUJOURDHUI)).toBe('2026-11-12')
  })
  it('creeLe après aujourd’hui : ramené à aujourd’hui', () => {
    expect(dateDeReprise({ creeLe: '2027-03-01T10:00:00.000Z' }, AUJOURDHUI)).toBe(AUJOURDHUI)
  })
})

describe('chaîne avec le moteur : J-05 sur une douleur reprise', () => {
  const entrees = (douleursLues: DouleurDeclaree[], aujourdhui: string) => ({
    profil: PROFIL_VIDE, exercicesPerso: [], douleurs: douleursLues, formes: [], objectifs: [],
    aujourdhui, maintenant: `${aujourdhui}T08:00:00.000Z`,
  })
  const avecProfilCree = async (joursAvant: number) => {
    const cree = new Date(); cree.setDate(cree.getDate() - joursAvant)
    await poserProfil({ douleursEnCours: ['coude'], creeLe: cree.toISOString(), modifieLe: cree.toISOString() })
    await lireProfil()
    return (await douleurs()) as DouleurDeclaree[]
  }

  it('20 jours : signal d’arrêt J-05', async () => {
    const lues = await avecProfilCree(20)
    const r = controlesDuJour(entrees(lues, jourLocal()), [])
    const j05 = r.find((c) => c.avertissement.code === 'J-05')
    expect(j05?.avertissement.message).toBe('Ta douleur (coude) dure depuis 20 jours. Consulte un médecin ou un kiné qui connaît l\'escalade.')
    expect(j05?.forme).toBe('arret')
  })

  it('3 jours : pas de J-05', async () => {
    const lues = await avecProfilCree(3)
    expect(controlesDuJour(entrees(lues, jourLocal()), []).map((c) => c.avertissement.code)).not.toContain('J-05')
  })
})
