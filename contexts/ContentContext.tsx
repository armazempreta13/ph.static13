
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SITE_CONFIG as STATIC_SITE, 
  HERO_CONFIG as STATIC_HERO, 
  ABOUT_CONFIG as STATIC_ABOUT,
  CONTACT_CONFIG as STATIC_CONTACT,
  SERVICE_PACKAGES as STATIC_SERVICES,
  PERFORMANCE_CONFIG as STATIC_PERFORMANCE,
  NOTIFICATIONS_CONFIG as STATIC_NOTIFICATIONS,
  ANALYTICS_CONFIG as STATIC_ANALYTICS,
  EASTER_EGG_CONFIG as STATIC_EASTER_EGG,
  PROCESS_STEPS as STATIC_PROCESS,
  FAQ_DATA as STATIC_FAQ,
  FINANCIAL_NOTE as STATIC_FINANCIAL_NOTE,
  SKILLS as STATIC_SKILLS,
  NAV_ITEMS as STATIC_NAV_ITEMS
} from '../config';
import { PROJECTS_DATA as STATIC_PROJECTS } from '../projectsData';
import { BlogPost, Project, ServicePackage, ProcessStep, FAQ, Skill, NavItem } from '../types';

// Initial Mock Blog Post
const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: "O que você não vê, você sente: A Ciência do Frontend",
    excerpt: "Descubra como a performance técnica impacta diretamente nas vendas. Uma análise profunda sobre Core Web Vitals, Mobile First e Engenharia de Software aplicada a sites.",
    content: `O que você não vê, você sente.\nQuando você entra em um carro de luxo, você não vê o motor ou a injeção eletrônica. Você sente o conforto do banco e a suavidade da direção. No digital, o Frontend é essa experiência.\n\nBastidores versus Palco.\nMuitas empresas focam apenas em fazer o site funcionar, o Backend, mas esquecem de como ele parece e responde, o Frontend. O resultado é como um carro com um motor potente, mas com bancos de plástico duro.\nO Backend é a cozinha. O Frontend é o salão. É onde o cliente interage. Se for ruim, ele vai embora, não importa quão boa seja a comida.`,
    image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2000&auto=format&fit=crop",
    date: "2023-10-27",
    readTime: "5 min",
    author: "Philippe Boechat",
    category: "Engenharia"
  }
];

interface ContentState {
  site: typeof STATIC_SITE;
  hero: typeof STATIC_HERO;
  about: typeof STATIC_ABOUT;
  contact: typeof STATIC_CONTACT;
  performance: typeof STATIC_PERFORMANCE;
  notifications: typeof STATIC_NOTIFICATIONS;
  analytics: typeof STATIC_ANALYTICS;
  easterEgg: typeof STATIC_EASTER_EGG;
  financialNote: string;
  
  blogPosts: BlogPost[];
  projects: Project[];
  services: ServicePackage[];
  process: ProcessStep[];
  faq: FAQ[];
  skills: Skill[];
  navItems: NavItem[];
}

interface ContentContextType {
  content: ContentState;
  updateContent: (section: keyof ContentState, data: any) => void;
  // CRUD Helpers
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  resetContent: () => void;
  exportConfig: () => string;
  isAdminOpen: boolean;
  toggleAdmin: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentState>({
    site: STATIC_SITE,
    hero: STATIC_HERO,
    about: STATIC_ABOUT,
    contact: STATIC_CONTACT,
    performance: STATIC_PERFORMANCE,
    notifications: STATIC_NOTIFICATIONS,
    analytics: STATIC_ANALYTICS,
    easterEgg: STATIC_EASTER_EGG,
    financialNote: STATIC_FINANCIAL_NOTE,
    
    blogPosts: INITIAL_BLOG_POSTS,
    projects: STATIC_PROJECTS,
    services: STATIC_SERVICES,
    process: STATIC_PROCESS,
    faq: STATIC_FAQ,
    skills: STATIC_SKILLS,
    navItems: STATIC_NAV_ITEMS
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    const savedContent = localStorage.getItem('ph_cms_content_v5'); // Bumped to v5 for contact update
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        // Merge with default to ensure new fields exist if local storage is old
        if (parsed && typeof parsed === 'object') {
          setContent(prev => ({ ...prev, ...(parsed as Partial<ContentState>) }));
        }
      } catch (e) {
        console.error("Erro ao carregar CMS local:", e);
      }
    }
  }, []);

  const saveToStorage = (newContent: ContentState) => {
      // Note: React Icons/Functions in SKILLS/SERVICES/PROCESS will be lost in JSON.stringify
      localStorage.setItem('ph_cms_content_v5', JSON.stringify(newContent));
  };

  const updateContent = (section: keyof ContentState, data: any) => {
    setContent(prev => {
      const currentValue = prev[section];

      // If it's an array or complex object replacement (like skills or notifications)
      // OR if the current value is a primitive (like financialNote string)
      if (
        Array.isArray(currentValue) || 
        (section === 'notifications' && data.ITEMS) || 
        typeof currentValue !== 'object' || 
        currentValue === null
      ) {
         const newContent = { ...prev, [section]: data };
         saveToStorage(newContent);
         return newContent;
      }
      
      // If it's a nested config object update
      const newContent = { ...prev, [section]: { ...(currentValue as object), ...data } };
      saveToStorage(newContent);
      return newContent;
    });
  };

  const addBlogPost = (post: BlogPost) => {
      setContent(prev => {
          const newContent = { ...prev, blogPosts: [post, ...prev.blogPosts] };
          saveToStorage(newContent);
          return newContent;
      });
  };

  const updateBlogPost = (id: string, data: Partial<BlogPost>) => {
      setContent(prev => {
          const updatedPosts = prev.blogPosts.map(p => p.id === id ? { ...p, ...data } : p);
          const newContent = { ...prev, blogPosts: updatedPosts };
          saveToStorage(newContent);
          return newContent;
      });
  };

  const deleteBlogPost = (id: string) => {
      setContent(prev => {
          const updatedPosts = prev.blogPosts.filter(p => p.id !== id);
          const newContent = { ...prev, blogPosts: updatedPosts };
          saveToStorage(newContent);
          return newContent;
      });
  };

  const addProject = (project: Project) => {
      setContent(prev => {
          const newContent = { ...prev, projects: [project, ...prev.projects] };
          saveToStorage(newContent);
          return newContent;
      });
  };

  const updateProject = (id: string, data: Partial<Project>) => {
      setContent(prev => {
          const updatedProjects = prev.projects.map(p => p.id === id ? { ...p, ...data } : p);
          const newContent = { ...prev, projects: updatedProjects };
          saveToStorage(newContent);
          return newContent;
      });
  };

  const deleteProject = (id: string) => {
      setContent(prev => {
          const updatedProjects = prev.projects.filter(p => p.id !== id);
          const newContent = { ...prev, projects: updatedProjects };
          saveToStorage(newContent);
          return newContent;
      });
  };

  const resetContent = () => {
    if (window.confirm("Tem certeza? Isso apagará todas as edições locais e restaurará o padrão do código.")) {
      localStorage.removeItem('ph_cms_content_v5');
      window.location.reload(); // Force reload to re-hydrate icons/functions correctly
    }
  };

  const exportConfig = () => {
    return JSON.stringify(content, null, 2);
  };

  const toggleAdmin = () => setIsAdminOpen(prev => !prev);

  return (
    <ContentContext.Provider value={{ content, updateContent, addBlogPost, updateBlogPost, deleteBlogPost, addProject, updateProject, deleteProject, resetContent, exportConfig, isAdminOpen, toggleAdmin }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent deve ser usado dentro de um ContentProvider');
  }
  return context;
};
