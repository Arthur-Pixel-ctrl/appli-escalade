-- Imitation minimale de Supabase pour l'audit (pas le vrai service).
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create role supabase_auth_admin nologin;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;
-- Comme Supabase : privilèges par défaut larges sur public
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
insert into auth.users values ('11111111-1111-1111-1111-111111111111','a@x.fr'),('22222222-2222-2222-2222-222222222222','b@x.fr');
