-- Vérifications à coller dans le « SQL Editor » APRÈS le script 0001_documents.sql.
-- Les lancer une par une (le tableau de bord n'affiche que le résultat de la dernière requête
-- d'un bloc), et comparer chaque résultat au commentaire qui la précède.

-- 1. RLS est activé : doit renvoyer « true ».
select relrowsecurity from pg_class where relname = 'documents';

-- 2. Les règles existent : doit renvoyer 4 lignes (select, insert, update, delete).
select policyname, cmd from pg_policies where tablename = 'documents';

-- 3. Un visiteur non connecté ne peut rien lire : doit échouer avec « permission denied for table documents ».
begin; set local role anon; select * from public.documents; rollback;

-- 4. Le réveil fonctionne pour un visiteur : doit renvoyer une date.
begin; set local role anon; select public.ping(); rollback;

-- 5. La liste d'invités est protégée : doit renvoyer « true ».
select relrowsecurity from pg_class where relname = 'invites';

-- 6. Un visiteur ne peut pas la lire : doit échouer avec « permission denied for table invites ».
begin; set local role anon; select * from public.invites; rollback;
