
import React, { useState } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { Button } from '../Button';
import { Project } from '../../types';
import { PortfolioEditorModal } from './modals/PortfolioEditorModal';

export const Portfolio: React.FC = () => {
  const { content, addProject, updateProject: updatePortfolioProject, deleteProject } = useContent();
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<Project | null>(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfólio</h2>
            <Button onClick={() => { setEditingPortfolioItem(null); setIsPortfolioModalOpen(true); }} size="sm" leftIcon={<Plus size={16}/>}>Novo Projeto</Button>
        </div>

        {isPortfolioModalOpen && (
            <PortfolioEditorModal
                project={editingPortfolioItem}
                onClose={() => setIsPortfolioModalOpen(false)}
                onSave={(proj) => {
                    if (editingPortfolioItem) updatePortfolioProject(proj.id, proj);
                    else addProject(proj);
                    setIsPortfolioModalOpen(false);
                }}
            />
        )}

        <div className="grid gap-4">
            {content.projects.map((proj) => (
                <div key={proj.id} className="flex items-center p-4 bg-white dark:bg-[#151921] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0"><img src={proj.image} alt={proj.title} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 ml-4 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{proj.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1"><span>{proj.category}</span>•<span className="flex gap-1">{proj.tags.slice(0,2).map(t=><span key={t} className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{t}</span>)}</span></div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setEditingPortfolioItem(proj); setIsPortfolioModalOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"><Edit size={16}/></button>
                        <button onClick={() => deleteProject(proj.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"><Trash size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
