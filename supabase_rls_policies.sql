-- ==============================================================================
-- POLÍTICAS DE RLS (ROW-LEVEL SECURITY) SIMPLIFICADAS
-- Execute este script no seu editor SQL do Supabase para aplicar as políticas.
-- ==============================================================================

-- Habilita RLS em todas as tabelas relevantes (se ainda não estiver)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Cliente: Vê seus projetos" ON public.projects;
DROP POLICY IF EXISTS "Cliente: Atualiza seus projetos" ON public.projects;
DROP POLICY IF EXISTS "Admin: Acesso total" ON public.projects;
DROP POLICY IF EXISTS "Cliente: Vê arquivos do projeto" ON public.project_files;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;

-- ==============================================================================
-- Tabela: projects
-- ==============================================================================

-- 1. PERMISSÃO DE LEITURA (SELECT)
-- Usuários (clientes) podem ver projetos onde seu email está no campo 'client_email'.
-- Admins (criadores) podem ver os projetos que criaram.
CREATE POLICY "Leitura: Usuário vê seus projetos ou projetos atribuídos" ON public.projects
FOR SELECT USING (
  auth.uid() = user_id -- O criador (admin) pode ver
  OR
  client_email ILIKE (select auth.jwt() ->> 'email') -- O cliente atribuído pode ver
);

-- 2. PERMISSÃO DE CRIAÇÃO (INSERT)
-- Qualquer usuário autenticado pode criar um projeto.
-- (Restringir a admins se necessário, via verificação de 'role' na política)
CREATE POLICY "Criação: Usuários autenticados podem criar projetos" ON public.projects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
  -- Para restringir a admins: WITH CHECK ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' )
);

-- 3. PERMISSÃO DE ATUALIZAÇÃO (UPDATE)
-- Apenas o criador original (admin) pode atualizar um projeto.
CREATE POLICY "Update: Criador do projeto pode atualizar" ON public.projects
FOR UPDATE USING (
  auth.uid() = user_id
);

-- 4. PERMISSÃO DE DELEÇÃO (DELETE)
-- Apenas o criador original (admin) pode deletar um projeto.
CREATE POLICY "Delete: Criador do projeto pode deletar" ON public.projects
FOR DELETE USING (
  auth.uid() = user_id
);


-- ==============================================================================
-- Tabela: project_files
-- ==============================================================================

-- 1. PERMISSÃO DE LEITURA E ESCRITA (SELECT, INSERT)
-- Um usuário pode acessar ou adicionar arquivos se tiver acesso ao projeto correspondente.
CREATE POLICY "Acesso: Usuário com acesso ao projeto pode gerenciar arquivos" ON public.project_files
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_files.project_id
    -- A condição de acesso ao projeto já é definida pela política da tabela 'projects'
  )
);


-- ==============================================================================
-- Tabela: profiles
-- ==============================================================================

-- 1. PERMISSÃO DE LEITURA (SELECT)
-- Usuários podem ver o perfil de qualquer um (para mostrar nome do admin, etc.).
-- Se precisar restringir, mude para `auth.uid() = id`.
CREATE POLICY "Leitura: Usuários podem ver todos os perfis" ON public.profiles
FOR SELECT USING (true);

-- 2. PERMISSÃO DE ATUALIZAÇÃO (UPDATE)
-- Um usuário só pode atualizar seu próprio perfil.
CREATE POLICY "Update: Usuário pode atualizar seu próprio perfil" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id
);
