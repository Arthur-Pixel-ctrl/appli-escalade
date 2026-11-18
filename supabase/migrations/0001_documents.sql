-- Script de création de la base serveur de « Get me to 9a » (Supabase / PostgreSQL).
-- Il crée la table des documents, ses règles d'accès, la liste d'invités et trois petites fonctions.
-- Où le coller : tableau de bord Supabase, « SQL Editor », « New query », puis « Run ».
-- À n'exécuter qu'UNE SEULE FOIS : il ne contient aucun « drop », donc relancé il échoue sans rien effacer.
-- Source : docs/architecture-v2.md § 3.3 (guide pas à pas : docs/supabase.md).

-- Les documents de chaque utilisateur : une ligne par enregistrement de l'app.
create table public.documents (
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  type        text        not null check (type ~ '^[a-zA-Z]{1,40}$'),     -- nom de la table locale : "seancesRealisees"
  id          text        not null check (char_length(id) between 1 and 100),
  contenu     jsonb       not null check (jsonb_typeof(contenu) = 'object' and pg_column_size(contenu) < 200000),
  modifie_le  timestamptz not null,                                       -- copie de contenu.modifieLe
  supprime_le timestamptz,                                                -- copie de contenu.supprimeLe
  recu_le     timestamptz not null default now(),                         -- posé par le serveur : sert de curseur
  primary key (user_id, type, id)
);
create index documents_curseur on public.documents (user_id, recu_le);

-- Sécurité : chacun ne voit et ne modifie que ses lignes.
alter table public.documents enable row level security;
revoke all on table public.documents from anon, authenticated;
grant select, insert, update, delete on table public.documents to authenticated;

create policy "lire ses documents"      on public.documents for select to authenticated using ((select auth.uid()) = user_id);
create policy "ajouter ses documents"   on public.documents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "modifier ses documents"  on public.documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "supprimer ses documents" on public.documents for delete to authenticated using ((select auth.uid()) = user_id);

-- À chaque écriture : on note l'heure de réception, et on refuse de remplacer une version plus récente.
create function public.avant_ecriture_document() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.modifie_le < old.modifie_le then
    return old;  -- le serveur a déjà une version plus récente : on la garde telle quelle
  end if;
  new.recu_le := clock_timestamp();
  return new;
end;
$$;
create trigger avant_ecriture before insert or update on public.documents
  for each row execute function public.avant_ecriture_document();

-- Suppression du compte par l'utilisateur lui-même (aucune clé secrète dans l'app).
create function public.supprimer_mon_compte() returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.documents where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;

-- Petite requête appelée chaque semaine par GitHub Actions pour limiter la mise en pause du projet.
-- Elle ne lit aucune donnée.
create function public.ping() returns timestamptz language sql stable set search_path = '' as $$ select now() $$;
grant execute on function public.ping() to anon;

-- Liste d'invités : seules ces adresses peuvent créer un compte (décision B2).
-- Arthur ajoute une adresse avec : insert into public.invites (email) values ('prenom@exemple.fr');
create table public.invites (
  email     text        primary key check (email = lower(email)),   -- toujours en minuscules
  ajoute_le timestamptz not null default now()
);
-- Aucune règle d'accès : la liste n'est lisible ni par l'app ni par un visiteur, seulement depuis le tableau de bord.
alter table public.invites enable row level security;
revoke all on table public.invites from anon, authenticated;

-- Avant toute création de compte : refuser une adresse absente de la liste.
create function public.verifier_invitation() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.invites where email = lower(new.email)) then
    raise exception 'Adresse non invitée';
  end if;
  return new;
end;
$$;
create trigger verifier_invitation before insert on auth.users
  for each row execute function public.verifier_invitation();
