import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { base } from '../donnees/base.ts'
import { ecrire, ecrireAppareil, lireEtat, supprimer, surDonneesChangees } from '../donnees/stockage.ts'
import { serveurMemoire } from './serveurMemoire.ts'
import { compterEnAttente, synchroniser } from './synchro.ts'

const MOI = 'utilisateur-1'
const autre = (n: number) => new Date(Date.UTC(2026, 5, 1) + n * 1000).toISOString()

let serveur = serveurMemoire()
beforeEach(async () => {
  for (const t of base.tables) await t.clear()
  serveur = serveurMemoire()
})

/** Met un document directement sur le serveur, comme s'il venait d'un autre appareil. */
async function depuisUnAutreAppareil(type: string, id: string, modifieLe: string, plus: Record<string, unknown> = {}) {
  await serveur.envoyer([{
    user_id: MOI, type: type as 'salles', id, modifie_le: modifieLe, supprime_le: null,
    contenu: { id, versionFormat: 1, creeLe: modifieLe, modifieLe, ...plus },
  }])
}

describe('synchroniser : pousser', () => {
  it('envoie une séance écrite avec ecrire et remet aEnvoyer à 0', async () => {
    await ecrire('seancesRealisees', { id: 'seance-1', nom: 'Doigts' })
    expect(await compterEnAttente()).toBe(1)
    const bilan = await synchroniser(serveur, MOI)
    expect(bilan.envoyes).toBe(1)
    expect(serveur.lignes.get('seancesRealisees/seance-1')?.contenu.nom).toBe('Doigts')
    expect(serveur.lignes.get('seancesRealisees/seance-1')?.contenu).not.toHaveProperty('aEnvoyer')
    expect((await base.table('seancesRealisees').get('seance-1')).aEnvoyer).toBe(0)
    expect(await compterEnAttente()).toBe(0)
  })

  it('laisse « à envoyer » un document modifié pendant l’envoi', async () => {
    await ecrire('salles', { id: 's1', nom: 'Avant' })
    serveur.avantEnvoi = async () => {
      await new Promise((r) => setTimeout(r, 5))
      await ecrire('salles', { id: 's1', nom: 'Pendant' })
    }
    await synchroniser(serveur, MOI)
    const local = await base.table('salles').get('s1')
    expect(local.nom).toBe('Pendant')
    expect(local.aEnvoyer).toBe(1)
    // Au tour suivant, la modification partie pendant l'envoi arrive au serveur.
    serveur.avantEnvoi = undefined
    await synchroniser(serveur, MOI)
    expect(serveur.lignes.get('salles/s1')?.contenu.nom).toBe('Pendant')
    expect((await base.table('salles').get('s1')).aEnvoyer).toBe(0)
  })

  it('envoie une suppression douce avec supprime_le', async () => {
    await ecrire('formes', { id: 'f1', date: '2026-11-18' })
    await synchroniser(serveur, MOI)
    await new Promise((r) => setTimeout(r, 5))
    await supprimer('formes', 'f1')
    await synchroniser(serveur, MOI)
    const ligne = serveur.lignes.get('formes/f1')!
    expect(ligne.supprime_le).toBeTruthy()
    expect(ligne.contenu.supprimeLe).toBe(ligne.supprime_le)
  })

  it('envoie par paquets de 100', async () => {
    for (let i = 0; i < 250; i++) await ecrire('douleurs', { id: `d${i}` })
    await synchroniser(serveur, MOI)
    expect(serveur.lignes.size).toBe(250)
    expect(serveur.nombreEnvois).toBe(3)
  })

  it('en cas d’échec, remplit derniereErreur et garde aEnvoyer à 1', async () => {
    await ecrire('salles', { id: 's1', nom: 'X' })
    serveur.avantEnvoi = async () => { throw new Error('Réseau coupé') }
    await expect(synchroniser(serveur, MOI)).rejects.toThrow('Réseau coupé')
    expect(await lireEtat('derniereErreur')).toBe('Réseau coupé')
    expect((await base.table('salles').get('s1')).aEnvoyer).toBe(1)
    // Le verrou est libéré : un nouvel essai réussit et efface l'erreur.
    serveur.avantEnvoi = undefined
    await synchroniser(serveur, MOI)
    expect(await lireEtat('derniereErreur')).toBeNull()
    expect(await lireEtat('derniereSynchro')).toBeTruthy()
  })

  it('n’envoie jamais la table appareil', async () => {
    await ecrireAppareil('cleApiClaude', 'sk-secret-test')
    await ecrire('salles', { id: 's1', nom: 'X' })
    await synchroniser(serveur, MOI)
    expect(JSON.stringify([...serveur.lignes.values()])).not.toContain('sk-secret-test')
    expect(JSON.stringify([...serveur.lignes.values()])).not.toContain('cleApiClaude')
  })
})

describe('synchroniser : tirer', () => {
  it('remplace le local par un distant plus récent, ignore un plus ancien', async () => {
    await ecrire('salles', { id: 'recent', nom: 'Local ancien' })
    await ecrire('salles', { id: 'ancien', nom: 'Local récent' })
    const local = await base.table('salles').get('recent')
    const apres = new Date(Date.parse(local.modifieLe) + 60_000).toISOString()
    const avant = new Date(Date.parse(local.modifieLe) - 60_000).toISOString()
    await depuisUnAutreAppareil('salles', 'recent', apres, { nom: 'Distant récent' })
    await depuisUnAutreAppareil('salles', 'ancien', avant, { nom: 'Distant ancien' })
    const bilan = await synchroniser(serveur, MOI)
    expect(bilan.appliques).toBe(1)
    const r = await base.table('salles').get('recent')
    expect(r.nom).toBe('Distant récent')
    expect(r.aEnvoyer).toBe(0)
    expect((await base.table('salles').get('ancien')).nom).toBe('Local récent')
    // La version locale plus récente a été envoyée au serveur, qui l'a gardée.
    expect(serveur.lignes.get('salles/ancien')?.contenu.nom).toBe('Local récent')
  })

  it('ne crée aucun doublon en synchronisant deux fois', async () => {
    await ecrire('cycles', { id: 'c1', nom: 'A' })
    await depuisUnAutreAppareil('cycles', 'c2', autre(1), { nom: 'B' })
    await synchroniser(serveur, MOI)
    const taille = serveur.lignes.size
    const second = await synchroniser(serveur, MOI)
    expect(serveur.lignes.size).toBe(taille)
    expect(second.envoyes).toBe(0)
    expect(second.appliques).toBe(0)
    expect(await base.table('cycles').count()).toBe(2)
  })

  it('reçoit les 1 200 documents du serveur (pagination)', async () => {
    const lignes = Array.from({ length: 1200 }, (_, i) => ({
      user_id: MOI, type: 'exercicesPerso' as const, id: `e${i}`, modifie_le: autre(i), supprime_le: null,
      contenu: { id: `e${i}`, versionFormat: 1, creeLe: autre(i), modifieLe: autre(i) },
    }))
    await serveur.envoyer(lignes)
    const bilan = await synchroniser(serveur, MOI)
    expect(bilan.appliques).toBe(1200)
    expect(await base.table('exercicesPerso').count()).toBe(1200)
  })

  it('ignore sans erreur une ligne de type inconnu, et reçoit bien « formes »', async () => {
    await depuisUnAutreAppareil('typeInconnu', 'x1', autre(1))
    await depuisUnAutreAppareil('formes', 'f1', autre(2), { date: '2026-11-18' })
    const bilan = await synchroniser(serveur, MOI)
    expect(bilan.appliques).toBe(1)
    expect(await base.table('formes').get('f1')).toBeTruthy()
    expect(base.tables.map((t) => t.name)).not.toContain('typeInconnu')
  })

  it('applique une suppression douce venue d’un autre appareil', async () => {
    await ecrire('salles', { id: 's1', nom: 'X' })
    await synchroniser(serveur, MOI)
    const local = await base.table('salles').get('s1')
    const plusTard = new Date(Date.parse(local.modifieLe) + 60_000).toISOString()
    await depuisUnAutreAppareil('salles', 's1', plusTard, { nom: 'X', supprimeLe: plusTard })
    await synchroniser(serveur, MOI)
    expect((await base.table('salles').get('s1')).supprimeLe).toBe(plusTard)
  })

  it('prévient l’app seulement si des données ont changé', async () => {
    const rappel = vi.fn()
    const arreter = surDonneesChangees(rappel)
    await ecrire('salles', { id: 's1', nom: 'X' })
    await synchroniser(serveur, MOI)
    expect(rappel).not.toHaveBeenCalled()
    await depuisUnAutreAppareil('salles', 's2', autre(5))
    await synchroniser(serveur, MOI)
    expect(rappel).toHaveBeenCalledTimes(1)
    arreter()
  })
})

describe('synchroniser : cas limites', () => {
  it('deux appels simultanés n’envoient qu’une fois', async () => {
    await ecrire('salles', { id: 's1', nom: 'X' })
    const [a, b] = await Promise.all([synchroniser(serveur, MOI), synchroniser(serveur, MOI)])
    expect(serveur.nombreEnvois).toBe(1)
    expect(a).toBe(b)
  })

  it('sans serveur (pas de configuration Supabase), ne fait rien et ne plante pas', async () => {
    await ecrire('salles', { id: 's1', nom: 'X' })
    expect(await synchroniser(null, MOI)).toEqual({ envoyes: 0, recus: 0, appliques: 0 })
    expect((await base.table('salles').get('s1')).aEnvoyer).toBe(1)
  })
})
