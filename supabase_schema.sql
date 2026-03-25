-- ==============================================================================
-- ESQUEMA COMPLETO DO BANCO DE DADOS
-- ==============================================================================

-- Tabela de Perfis de Usuário (extende auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'client', -- 'admin' ou 'client'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    company TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Projetos
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id), -- Admin/Criador do projeto
    client_id UUID REFERENCES public.clients(id),
    client_email TEXT, -- Email do cliente, para projetos onde o cliente não tem conta
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'completed', 'on_hold'
    progress INT DEFAULT 0,
    due_date DATE,
    financial_data JSONB,
    contract_data JSONB,
    preview_url TEXT,
    links JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Tarefas
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Arquivos do Projeto
CREATE TABLE public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Faturas
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
    due_date DATE,
    paid_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimizar as buscas
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_client_email ON public.projects(client_email);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX idx_invoices_project_id ON public.invoices(project_id);
