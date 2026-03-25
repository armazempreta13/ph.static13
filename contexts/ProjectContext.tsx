
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientProject, ProjectFile, ClientNotification } from '../types';

interface ProjectContextType {
  projects: ClientProject[];
  currentProjectId: string;
  updateProject: (id: string, data: Partial<ClientProject>) => void;
  createProject: (data: { clientName: string; cpf?: string; email: string; projectName: string; totalValue: number }) => void;
  addFile: (projectId: string, file: ProjectFile) => void;
  sendNotification: (projectId: string, notification: Omit<ClientNotification, 'id' | 'date' | 'read'>) => void;
  markNotificationsAsRead: (projectId: string) => void;
  setCurrentProjectId: (id: string) => void;
  getProject: (id: string) => ClientProject | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ph_projects_local_v1';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');

  // Carregar projetos (Híbrido: Tenta API, fallback para LocalStorage)
  useEffect(() => {
    const loadProjects = async () => {
      // 1. Tentar carregar do LocalStorage primeiro (Prioridade para modo 'sem database')
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setProjects(parsed);
          if (parsed.length > 0 && !currentProjectId) {
             setCurrentProjectId(parsed[0].id);
          }
          return; // Se tem dados locais, usa eles e ignora API para evitar conflitos no modo demo
        } catch (e) {
          console.error("Erro ao ler localStorage", e);
        }
      }

      // Modo Local ativado - sem backend
    };

    loadProjects();
  }, []);

  // Helper para salvar localmente
  const saveLocal = (newProjects: ClientProject[]) => {
      setProjects(newProjects);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProjects));
  };

  const createProject = async (data: { clientName: string; cpf?: string; email: string; projectName: string; totalValue: number }) => {
    // Criação Mockada (Local)
    const newProject: ClientProject = {
        id: `proj_${Date.now()}`,
        clientName: data.clientName,
        cpf: data.cpf || '',
        email: data.email,
        projectName: data.projectName,
        status: 'new',
        progress: 0,
        nextMilestone: 'Início do Projeto',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'), // +15 dias
        lastUpdate: new Date().toLocaleDateString('pt-BR'),
        financial: {
            total: data.totalValue,
            paid: 0,
            status: 'pending',
            nextPaymentDate: new Date().toLocaleDateString('pt-BR')
        },
        tasks: [
            { id: 't1', title: 'Configuração Inicial', completed: false },
            { id: 't2', title: 'Briefing', completed: false },
            { id: 't3', title: 'Design', completed: false },
            { id: 't4', title: 'Desenvolvimento', completed: false }
        ],
        files: [],
        links: {},
        activity: [
            { id: `act_${Date.now()}`, text: 'Projeto criado no sistema.', date: new Date().toLocaleDateString('pt-BR'), type: 'info' }
        ],
        notifications: [],
        contract: { status: 'draft' },
        paymentOrder: null,
        briefing: {
            // Inicialização Completa do Novo Briefing
            businessSummary: '',
            objective: '',
            targetAudience: '',
            usp: '',
            competitors: '',
            
            brandingStatus: '',
            colors: '',
            typographyPreference: '',
            logoStatus: '',
            visualVibe: '',
            
            sitemap: '',
            copyStatus: '',
            mediaStatus: '',
            
            referenceSites: '',
            referenceDislikes: '',
            
            functionalities: [],
            integrations: '',
            
            hostingStatus: '',
            domainName: '',
            deadline: '',
            notes: ''
        }
    };

    const updatedList = [newProject, ...projects];
    saveLocal(updatedList);
    
    // Tenta salvar no banco se tiver auth, mas não bloqueia se falhar
    try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session) {
            // @ts-ignore
            await api.project.create(data);
        }
    } catch (e) {
        // Silently fail API call in demo mode
    }
  };

  const updateProject = async (id: string, data: Partial<ClientProject>) => {
    const updatedList = projects.map(p => 
        p.id === id ? { ...p, ...data, lastUpdate: new Date().toLocaleDateString('pt-BR') } : p
    );
    saveLocal(updatedList);

    // Tenta persistir no banco se possível
    try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session) {
            // @ts-ignore
            await api.project.update(id, data);
        }
    } catch (e) {
        // Ignore API errors
    }
  };

  const addFile = (projectId: string, file: ProjectFile) => {
    const project = projects.find(p => p.id === projectId);
    if(project) {
        updateProject(projectId, { files: [file, ...project.files] });
    }
  };

  const sendNotification = (projectId: string, notification: Omit<ClientNotification, 'id' | 'date' | 'read'>) => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
          const newNote: ClientNotification = {
              ...notification,
              id: `n${Date.now()}`,
              date: new Date().toLocaleDateString('pt-BR'),
              read: false
          };
          updateProject(projectId, { notifications: [newNote, ...(project.notifications || [])] });
      }
  };

  const markNotificationsAsRead = (projectId: string) => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
          updateProject(projectId, { notifications: project.notifications.map(n => ({ ...n, read: true })) });
      }
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  return (
    <ProjectContext.Provider value={{ 
        projects, 
        currentProjectId, 
        updateProject, 
        createProject,
        addFile, 
        sendNotification,
        markNotificationsAsRead,
        setCurrentProjectId, 
        getProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject deve ser usado dentro de um ProjectProvider');
  }
  return context;
};
