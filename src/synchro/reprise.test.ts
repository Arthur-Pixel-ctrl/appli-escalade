import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { base } from '../donnees/base.ts'
import { ecrire, ecrireAppareil, ecrireEtat, lireEtat, TABLES_SYNCHRONISEES } from '../donnees/stockage.ts'
import {
  effacerDonneesLocales, lierCompte, masquerEmail, profilsDifferents, resumerAppareil, sauvegardeComplete,
  situationReprise,
} from './reprise.ts'
import { serveurMemoire } from './serveurMemoire.ts'
import { compterEnAttente, synchroniser } from './synchro.ts'

const MOI = { userId: 'utilisateur-1', email: 'moi@exemple.fr' }
const AUTRE = { userId: 'utilisateur-2', email: 'autre@exemple.fr' }

let serveur = serveurMemoire()
beforeEach(async () => {
  for (const t of base.tables) await t.clear()
  serveur = serveurMemoire()
})

const pause = () => new Promise((r) => setTimeout(r, 5))
const seance = (id: string, date = '2026-11-01') => ({ id, date, nom: `Séance ${id}`, mode: 'solo' })

/** Met un document sur le serveur comme s'il venait d'un autre appareil du même compte. */
async function depuisUnAutreAppareil(type: 'seancesRealisees' | 'reglages', id: string, plus: Record<string, unknown> = {}) {
  const modifieLe = new Date().toISOString()
  await serveur.envoyer([{
    user_id: MOI.userId, type, id, modifie_le: modifieLe, supprime_le: null,
    contenu: { id, versionFormat: 1, creeLe: modifieLe, modifieLe, ...plus },
  }])
}

describe('situationReprise et profilsDifferents', () => {
  it('distingue les trois situations', () => {
    expect(situationReprise(null, 'a')).toBe('premier_lien')
    expect(situationReprise(undefined, 'a')).toBe('premier_lien')
    expect(situationReprise('a', 'a')).toBe('meme_compte')
    expect(situationReprise('a', 'b')).toBe('autre_compte')
  })
  it('ignore les champs de suivi', () => {
    const base1 = { id: 'profil', prenom: 'A', modifieLe: '1', creeLe: '1', versionFormat: 1, aEnvoyer: 1 }
    expect(profilsDifferents(base1, { id: 'profil', prenom: 'A', modifieLe: '2', creeLe: '0', versionFormat: 1 })).toBe(false)
    expect(profilsDifferents(base1, { ...base1, prenom: 'B' })).toBe(true)
  })
  it('masque l’e-mail', () => {
    expect(masquerEmail('arthur@gmail.com')).toBe('ar…@gmail.com')
  })
})

describe('lierCompte : premier lien', () => {
  it('appareil avec 3 séances et un profil, compte vide : le serveur reçoit 4 documents', async () => {
    for (const n of ['a', 'b', 'c']) await ecrire('seancesRealisees', seance(n))
    await ecrire('reglages', { id: 'profil', prenom: 'Léa' })
    const { resultat, bilan } = await lierCompte(serveur, MOI)
    expect(resultat).toBe('lie')
    expect(bilan?.envoyes).toBe(4)
    expect(serveur.lignes.size).toBe(4)
    expect(await lireEtat('compteId')).toBe(MOI.userId)
    expect(await lireEtat('compteEmail')).toBe(MOI.email)
    // Rien n'est effacé de l'appareil.
    expect((await resumerAppareil()).nbSeances).toBe(3)
  })

  it('sans séance locale : lie directement et reçoit celles du compte', async () => {
    await depuisUnAutreAppareil('seancesRealisees', 'x', { date: '2026-10-01' })
    const { resultat, bilan } = await lierCompte(serveur, MOI)
    expect(resultat).toBe('lie')
    expect(bilan?.appliques).toBe(1)
    expect((await resumerAppareil()).nbSeances).toBe(1)
  })

  it('deux séances de chaque côté : quatre après, sans doublon', async () => {
    await ecrire('seancesRealisees', seance('l1'))
    await ecrire('seancesRealisees', seance('l2'))
    await depuisUnAutreAppareil('seancesRealisees', 'd1', { date: '2026-10-01' })
    await depuisUnAutreAppareil('seancesRealisees', 'd2', { date: '2026-10-02' })
    await lierCompte(serveur, MOI)
    expect(await base.seancesRealisees.count()).toBe(4)
    expect([...serveur.lignes.keys()].filter((k) => k.startsWith('seancesRealisees/')).length).toBe(4)
  })

  it('profils différents sans choix : choix requis, rien n’est envoyé ni noté', async () => {
    await ecrire('seancesRealisees', seance('a'))
    await ecrire('reglages', { id: 'profil', prenom: 'Appareil' })
    await depuisUnAutreAppareil('reglages', 'profil', { prenom: 'Compte' })
    const avant = serveur.nombreEnvois
    const { resultat } = await lierCompte(serveur, MOI)
    expect(resultat).toBe('choix_profil_requis')
    expect(serveur.nombreEnvois).toBe(avant)
    expect(await lireEtat('compteId')).toBeUndefined()
    expect(((await base.reglages.get('profil')) as { prenom?: string } | undefined)?.prenom).toBe('Appareil')
    expect(await compterEnAttente()).toBe(2)
  })

  it('choix « appareil » : le serveur a le profil de l’appareil', async () => {
    await depuisUnAutreAppareil('reglages', 'profil', { prenom: 'Compte' })
    await pause()
    await ecrire('reglages', { id: 'profil', prenom: 'Appareil' })
    await lierCompte(serveur, MOI, 'appareil')
    expect(serveur.lignes.get('reglages/profil')?.contenu.prenom).toBe('Appareil')
    expect(((await base.reglages.get('profil')) as { prenom?: string } | undefined)?.prenom).toBe('Appareil')
  })

  it('choix « appareil » alors que le profil du compte est plus récent : celui de l’appareil gagne quand même', async () => {
    await ecrire('reglages', { id: 'profil', prenom: 'Appareil' })
    await pause()
    await depuisUnAutreAppareil('reglages', 'profil', { prenom: 'Compte' })
    await pause()
    await lierCompte(serveur, MOI, 'appareil')
    expect(serveur.lignes.get('reglages/profil')?.contenu.prenom).toBe('Appareil')
  })

  it('choix « compte » : l’appareil a le profil du compte, même si le sien est plus récent', async () => {
    await depuisUnAutreAppareil('reglages', 'profil', { prenom: 'Compte' })
    await pause()
    await ecrire('reglages', { id: 'profil', prenom: 'Appareil' })
    await lierCompte(serveur, MOI, 'compte')
    expect(((await base.reglages.get('profil')) as { prenom?: string } | undefined)?.prenom).toBe('Compte')
    expect(serveur.lignes.get('reglages/profil')?.contenu.prenom).toBe('Compte')
  })

  it('profils identiques : pas de choix demandé', async () => {
    await depuisUnAutreAppareil('reglages', 'profil', { prenom: 'Même' })
    await ecrire('reglages', { id: 'profil', prenom: 'Même' })
    expect((await lierCompte(serveur, MOI)).resultat).toBe('lie')
  })

  it('relancé une seconde fois : aucun doublon, rien de plus envoyé', async () => {
    await ecrire('seancesRealisees', seance('a'))
    await lierCompte(serveur, MOI)
    const envois = serveur.nombreEnvois
    const { resultat, bilan } = await lierCompte(serveur, MOI)
    expect(resultat).toBe('lie')
    expect(bilan?.envoyes).toBe(0)
    expect(serveur.nombreEnvois).toBe(envois)
    expect(serveur.lignes.size).toBe(1)
    expect(await base.seancesRealisees.count()).toBe(1)
  })

  it('échec réseau au milieu : rien n’est perdu, on peut réessayer', async () => {
    await ecrire('seancesRealisees', seance('a'))
    await ecrire('seancesRealisees', seance('b'))
    serveur.avantEnvoi = async () => { throw new Error('Réseau coupé') }
    await expect(lierCompte(serveur, MOI)).rejects.toThrow('Réseau coupé')
    expect(await base.seancesRealisees.count()).toBe(2)
    expect(await compterEnAttente()).toBe(2)
    serveur.avantEnvoi = undefined
    const { resultat, bilan } = await lierCompte(serveur, MOI)
    expect(resultat).toBe('lie')
    expect(bilan?.envoyes).toBe(2)
    expect(serveur.lignes.size).toBe(2)
    expect(await compterEnAttente()).toBe(0)
  })
})

describe('lierCompte : autre compte', () => {
  it('ne fait rien : ni lien, ni envoi, ni effacement', async () => {
    await ecrire('seancesRealisees', seance('a'))
    await ecrireEtat('compteId', MOI.userId)
    const { resultat } = await lierCompte(serveur, AUTRE)
    expect(resultat).toBe('autre_compte')
    expect(serveur.nombreEnvois).toBe(0)
    expect(await lireEtat('compteId')).toBe(MOI.userId)
    expect(await base.seancesRealisees.count()).toBe(1)
  })
})

describe('effacerDonneesLocales', () => {
  async function remplirTout() {
    for (const t of TABLES_SYNCHRONISEES) await ecrire(t, { id: `${t}-1` })
    await ecrireEtat('compteId', MOI.userId)
    await ecrireAppareil('reglage', 1)
  }

  it('vide les tables synchronisées, etatSynchro et appareil, et la base s’ouvre encore', async () => {
    await remplirTout()
    await synchroniser(serveur, MOI.userId) // plus rien en attente
    await ecrireEtat('compteId', MOI.userId)
    await effacerDonneesLocales()
    for (const t of TABLES_SYNCHRONISEES) expect(await base.table(t).count()).toBe(0)
    expect(await base.etatSynchro.count()).toBe(0)
    expect(await base.appareil.count()).toBe(0)
    expect(base.isOpen()).toBe(true)
    expect(base.verno).toBe(3)
    await ecrire('salles', { id: 'apres' })
    expect(await base.salles.count()).toBe(1)
  })

  it('refuse d’effacer des modifications non envoyées que personne n’a acceptées', async () => {
    await remplirTout()
    await expect(effacerDonneesLocales()).rejects.toThrow(/pas encore envoyée/)
    const enAttente = await compterEnAttente()
    await expect(effacerDonneesLocales({ enAttenteAcceptees: enAttente - 1 })).rejects.toThrow()
    expect(await base.seancesRealisees.count()).toBe(1)
    expect(await lireEtat('compteId')).toBe(MOI.userId)
  })

  it('efface si l’utilisateur a vu et accepté le nombre exact en attente', async () => {
    await remplirTout()
    await effacerDonneesLocales({ enAttenteAcceptees: await compterEnAttente() })
    expect(await base.seancesRealisees.count()).toBe(0)
  })

  it('une modification arrivée après l’accord bloque l’effacement', async () => {
    await remplirTout()
    const vu = await compterEnAttente()
    await ecrire('salles', { id: 'nouvelle' })
    await expect(effacerDonneesLocales({ enAttenteAcceptees: vu })).rejects.toThrow()
    expect(await base.salles.count()).toBe(2)
  })

  it('la sauvegarde complète contient toutes les tables synchronisées', async () => {
    await remplirTout()
    const fichier = JSON.parse(await sauvegardeComplete())
    expect(Object.keys(fichier.tables).sort()).toEqual([...TABLES_SYNCHRONISEES].sort())
    expect(fichier.tables.cycles).toHaveLength(1)
  })
})

describe('changement de compte sur un appareil', () => {
  it('sauvegarde, effacement accepté, puis lien : les données de l’autre compte ne se mélangent pas', async () => {
    await ecrire('seancesRealisees', seance('ancienne'))
    await lierCompte(serveur, MOI) // l'appareil appartient à MOI, tout est envoyé
    await ecrire('seancesRealisees', seance('en-attente'))
    expect((await lierCompte(serveur, AUTRE)).resultat).toBe('autre_compte')

    const fichier = await sauvegardeComplete()
    expect(JSON.parse(fichier).tables.seancesRealisees).toHaveLength(2)
    await effacerDonneesLocales({ enAttenteAcceptees: await compterEnAttente() })

    const serveurAutre = serveurMemoire()
    const { resultat } = await lierCompte(serveurAutre, AUTRE)
    expect(resultat).toBe('lie')
    expect(await base.seancesRealisees.count()).toBe(0)
    expect(serveurAutre.lignes.size).toBe(0)
    expect(await lireEtat('compteId')).toBe(AUTRE.userId)
    // Le compte d'origine garde ses données.
    expect(serveur.lignes.has('seancesRealisees/ancienne')).toBe(true)
  })
})

describe('déconnexion', () => {
  it('compterEnAttente dit combien de modifications partiront à la prochaine connexion', async () => {
    await lierCompte(serveur, MOI)
    expect(await compterEnAttente()).toBe(0)
    await ecrire('seancesRealisees', seance('a'))
    await ecrire('seancesRealisees', seance('b'))
    expect(await compterEnAttente()).toBe(2)
    // Se déconnecter ne touche pas aux données : elles restent à envoyer.
    expect(await base.seancesRealisees.count()).toBe(2)
    await synchroniser(serveur, MOI.userId)
    expect(await compterEnAttente()).toBe(0)
  })
})
