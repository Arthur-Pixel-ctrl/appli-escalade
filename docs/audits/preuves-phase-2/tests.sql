\set A '11111111-1111-1111-1111-111111111111'
\set B '22222222-2222-2222-2222-222222222222'
-- 1. A écrit un document (en se faisant passer pour authenticated)
begin; set local role authenticated; select set_config('request.jwt.claim.sub', :'A', true);
insert into public.documents (user_id,type,id,contenu,modifie_le,supprime_le,recu_le)
values (:'A','reglages','profil','{"niveauBloc":"7A","modifieLe":"2026-11-18T10:00:00.000Z"}','2026-11-18T10:00:00.000Z',null,'2000-01-01');
select 'T1 recu_le falsifie ignore' as test, recu_le > '2020-01-01' as ok from public.documents;
commit;
-- 2. Upsert plus ancien (comme PostgREST) : doit garder la version récente
begin; set local role authenticated; select set_config('request.jwt.claim.sub', :'A', true);
select recu_le as avant from public.documents \gset
insert into public.documents (user_id,type,id,contenu,modifie_le,supprime_le)
values (:'A','reglages','profil','{"niveauBloc":"5A","modifieLe":"2026-11-17T10:00:00.000Z"}','2026-11-17T10:00:00.000Z',null)
on conflict (user_id,type,id) do update set contenu=excluded.contenu, modifie_le=excluded.modifie_le, supprime_le=excluded.supprime_le;
select 'T2 ancienne version refusee' as test, contenu->>'niveauBloc' = '7A' and recu_le = :'avant' as ok from public.documents;
commit;
-- 3. B ne voit pas, ne modifie pas, ne supprime pas les documents de A
begin; set local role authenticated; select set_config('request.jwt.claim.sub', :'B', true);
select 'T3a B lit' as test, count(*) = 0 as ok from public.documents;
update public.documents set contenu='{"x":1}' where user_id = :'A';
delete from public.documents where user_id = :'A';
commit;
select 'T3b A intact apres B' as test, contenu->>'niveauBloc' = '7A' as ok from public.documents;
-- 4. B tente d'écrire au nom de A
begin; set local role authenticated; select set_config('request.jwt.claim.sub', :'B', true);
savepoint s; 
\set ON_ERROR_STOP 0
insert into public.documents (user_id,type,id,contenu,modifie_le) values (:'A','reglages','pirate','{}','2030-01-01');
rollback to s;
-- 4b. B tente d'écraser le doc de A via upsert avec date future
insert into public.documents (user_id,type,id,contenu,modifie_le) values (:'A','reglages','profil','{}','2030-01-01')
on conflict (user_id,type,id) do update set contenu=excluded.contenu, modifie_le=excluded.modifie_le;
rollback;
-- 4c. B tente de déplacer sa ligne vers A
begin; set local role authenticated; select set_config('request.jwt.claim.sub', :'B', true);
insert into public.documents (type,id,contenu,modifie_le) values ('reglages','profil','{}','2026-11-18');
update public.documents set user_id = :'A' where id='profil';
rollback;
-- 5. Visiteur non connecté
begin; set local role anon; select * from public.documents; rollback;
begin; set local role anon; select public.supprimer_mon_compte(); rollback;
begin; set local role anon; select * from public.invites; rollback;
begin; set local role authenticated; select * from public.invites; rollback;
begin; set local role anon; select 'T5 ping' as test, public.ping() is not null as ok; rollback;
-- 6. Invitations
insert into auth.users values ('33333333-3333-3333-3333-333333333333','pas@invite.fr');
insert into public.invites values ('c@x.fr');
insert into auth.users values ('33333333-3333-3333-3333-333333333333','C@x.fr');
select 'T6 invite accepte' as test, count(*) = 1 as ok from auth.users where id='33333333-3333-3333-3333-333333333333';
-- 7. Suppression du compte par A
begin; set local role authenticated; select set_config('request.jwt.claim.sub', :'A', true);
select public.supprimer_mon_compte();
commit;
select 'T7 compte A supprime' as test, (select count(*) from auth.users where id=:'A') = 0 and (select count(*) from public.documents) = 0 as ok;
select 'T7b compte B intact' as test, count(*) = 1 as ok from auth.users where id=:'B';
-- 8. Droits sur les fonctions
select p.proname, array_to_string(p.proacl, ' ') as droits, p.prosecdef as definer, p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by 1;
