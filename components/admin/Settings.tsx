
import React, { useState } from 'react';
import { Zap, Globe, Bell, Power, Code2, Trash, Plus } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENTES DE UI ---
const InputField = ({ label, value, onChange, placeholder = "", className = "" }: any) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
        <input 
            type="text" 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white transition-all"
        />
    </div>
);

const TextAreaField = ({ label, value, onChange, placeholder = "", className = "" }: any) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
        <textarea 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white transition-all resize-none"
        />
    </div>
);

const ToggleSwitch = ({ label, checked, onChange, description }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{label}</h4>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

export const Settings: React.FC = () => {
  const { content, updateContent } = useContent();
  const [activeTab, setActiveTab] = useState<'geral' | 'skills' | 'sistema'>('geral');

  // --- HANDLERS ---
  const updateSiteInfo = (key: string, value: string) => {
      updateContent('site', { [key]: value });
  };

  const updateContact = (key: string, value: string) => {
      updateContent('contact', { [key]: value });
  };

  const renderSkillsManager = () => {
      const skills = content.skills || [];
      const updateSkills = (newSkills: any) => updateContent('skills', newSkills);

      return (
          <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Code2 size={20} className="text-primary-600"/> Lista de Tecnologias</h3>
                  <button 
                      onClick={() => updateSkills([...skills, { name: 'Nova Skill', icon: 'Code2', color: 'text-gray-500' }])}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700"
                  >
                      <Plus size={14} /> Adicionar
                  </button>
              </div>
              <div className="space-y-3">
                  {skills.map((skill: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 group">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                              <InputField label="Nome da Tecnologia" value={skill.name} onChange={(val: string) => {
                                  const newSkills = [...skills];
                                  newSkills[idx].name = val;
                                  updateSkills(newSkills);
                              }} className="mb-0"/>
                              <InputField label="Cor (Tailwind Class)" value={skill.color} onChange={(val: string) => {
                                  const newSkills = [...skills];
                                  newSkills[idx].color = val;
                                  updateSkills(newSkills);
                              }} className="mb-0"/>
                          </div>
                          <button 
                              onClick={() => updateSkills(skills.filter((_, i) => i !== idx))}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-4"
                          >
                              <Trash size={16} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações do Site</h2>

        {/* TABS HEADER */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
            {[
                { id: 'geral', label: 'Geral & SEO', icon: Globe },
                { id: 'skills', label: 'Skills', icon: Zap },
                { id: 'sistema', label: 'Sistema', icon: Power },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === tab.id 
                        ? 'border-primary-600 text-primary-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}
        </div>

        {/* CONTENT AREA */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {activeTab === 'geral' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Identidade do Site</h3>
                        <InputField label="Título Principal" value={content.site.TITLE} onChange={(v: string) => updateSiteInfo('TITLE', v)} />
                        <InputField label="Subtítulo" value={content.site.SUBTITLE} onChange={(v: string) => updateSiteInfo('SUBTITLE', v)} />
                        <TextAreaField label="Descrição (Meta Description)" value={content.site.DESCRIPTION} onChange={(v: string) => updateSiteInfo('DESCRIPTION', v)} />
                        <InputField label="Copyright" value={content.site.COPYRIGHT} onChange={(v: string) => updateSiteInfo('COPYRIGHT', v)} />
                    </div>

                    <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Informações de Contato</h3>
                        <InputField label="E-mail Principal" value={content.contact.EMAIL} onChange={(v: string) => updateContact('EMAIL', v)} />
                        <InputField label="WhatsApp (Apenas números)" value={content.contact.WHATSAPP_NUMBER} onChange={(v: string) => updateContact('WHATSAPP_NUMBER', v)} />
                        <InputField label="Link Instagram" value={content.contact.INSTAGRAM_URL} onChange={(v: string) => updateContact('INSTAGRAM_URL', v)} />
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 mt-4">
                            <p className="text-xs text-blue-800 dark:text-blue-300 mb-2 font-bold">Formulário de Contato (Formspree)</p>
                            <InputField label="ID do Formulário" value={content.contact.FORMSPREE_ID} onChange={(v: string) => updateContact('FORMSPREE_ID', v)} className="mb-0" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'skills' && renderSkillsManager()}

            {activeTab === 'sistema' && (
                <div className="max-w-2xl space-y-6">
                    <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Funcionalidades & Toggles</h3>
                        
                        <ToggleSwitch 
                            label="HUD de Performance" 
                            description="Exibe um monitor de FPS e memória para os visitantes."
                            checked={content.performance.ENABLE_PERFORMANCE_HUD} 
                            onChange={(val: boolean) => updateContent('performance', { ENABLE_PERFORMANCE_HUD: val })} 
                        />

                        <ToggleSwitch 
                            label="Central de Notificações" 
                            description="Ativa o ícone de sino flutuante com novidades."
                            checked={content.notifications.ENABLED} 
                            onChange={(val: boolean) => updateContent('notifications', { ENABLED: val })} 
                        />

                        <ToggleSwitch 
                            label="Modo Easter Egg" 
                            description="Ativa o mini-game secreto (Konami Code)."
                            checked={content.easterEgg.ENABLED} 
                            onChange={(val: boolean) => updateContent('easterEgg', { ENABLED: val })} 
                        />
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};
