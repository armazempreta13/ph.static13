
import React, { useState } from 'react';
import { Plus, DollarSign, FileText, CheckCircle2, QrCode, Check, Edit, Mail, Search, FileEdit, Link as LinkIcon, Copy, ExternalLink, PlayCircle, X, PenTool } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { Button } from '../Button';
import { CreateProjectModal } from '../admin/modals/CreateProjectModal';
import { EditProjectModal } from '../admin/modals/EditProjectModal';
import { ProjectBriefingModal } from '../admin/modals/ProjectBriefingModal';
import { EmailGeneratorModal } from '../EmailGeneratorModal';
import { ContractGeneratorModal } from '../ContractGeneratorModal';
import { ClientProject, ViewType } from '../../types';
import { SITE_CONFIG } from '../../config';
import { ClientBriefingPage } from '../ClientBriefingPage'; // Importar Componente

interface CRMProps {
    onNavigate: (view: ViewType) => void;
}

export const CRM: React.FC<CRMProps> = ({ onNavigate }) => {
  const { projects, updateProject, createProject, sendNotification } = useProject();
  
  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);
  const [briefingProject, setBriefingProject] = useState<ClientProject | null>(null);
  const [emailModalProject, setEmailModalProject] = useState<ClientProject | null>(null);
  const [contractProject, setContractProject] = useState<ClientProject | null>(null);
  
  // New State: Full Screen Briefing Preview
  const [briefingPreviewType, setBriefingPreviewType] = useState<string | null>(null);

  const STATUS_LABELS: Record<string, string> = {
    'new': 'Novo Lead',
    'briefing': 'Briefing',
    'development': 'Em Desenvolvimento',
    'review': 'Em Revisão',
    'completed': 'Concluído'
  };

  // --- HELPER: Detect Service Type ---
  const getServiceTypeFromProject = (project: ClientProject) => {
      const name = project.projectName.toLowerCase();
      if (name.includes('landing') || name.includes('express')) return 'landing-page';
      if (name.includes('site') || name.includes('institucional')) return 'business';
      return 'custom';
  };

  // --- ACTIONS HANDLERS ---

  const handleCreateProject = (data: { clientName: string; cpf?: string; email: string; projectName: string; totalValue: number }) => {
      createProject(data);
      alert('Novo projeto criado com sucesso! (Salvo Localmente)');
  };

  const handleEditSave = async (id: string, data: Partial<ClientProject>, notify: boolean, emailMsg?: string) => {
      updateProject(id, data);
      if (notify && emailMsg && editingProject) {
          alert("Projeto atualizado e notificação salva!");
      }
  };

  const handleBriefingSave = (id: string, data: Partial<ClientProject>) => {
      updateProject(id, data);
      alert("Briefing detalhado atualizado!");
  };

  const handleApprovePayment = async (project: ClientProject) => {
      if (!project.paymentOrder) return;
      
      const newPaid = project.financial.paid + project.paymentOrder.amount;
      const isTotal = newPaid >= project.financial.total;
      
      updateProject(project.id, {
          paymentOrder: null, 
          financial: {
              ...project.financial,
              paid: newPaid,
              status: isTotal ? 'paid' : 'partial'
          },
          lastUpdate: 'Pagamento Confirmado'
      });
      alert("Pagamento confirmado manualmente.");
  };

  const handleGeneratePayment = async (project: ClientProject, type: 'signal' | 'final') => {
      const amount = type === 'signal' ? (project.financial.total / 2) : (project.financial.total - project.financial.paid);
      const desc = type === 'signal' ? `Sinal de 50% - ${project.projectName}` : `Parcela Final - ${project.projectName}`;
      
      // Simulação de geração de PIX (Sem chamar API externa)
      const mockOrder: any = {
          id: `tx_${Date.now()}`,
          description: desc,
          amount: amount,
          status: 'pending',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          pixCode: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913PH Development6008Brasilia62070503***6304ABCD" // Mock PIX String
      };

      updateProject(project.id, { paymentOrder: mockOrder });
      alert(`Cobrança de R$ ${amount} gerada com sucesso!`);
  };

  const handleContractUpdate = async (contractData: any) => {
      if (!contractProject) return;
      const updatedContract = { ...(contractProject.contract || {}), ...contractData };
      
      updateProject(contractProject.id, {
          contract: updatedContract,
          lastUpdate: 'Contrato Atualizado'
      });

      if (contractData.status === 'sent_to_client') {
          sendNotification(contractProject.id, {
              title: 'Contrato Disponível',
              message: 'O contrato de serviço foi gerado e aguarda sua assinatura no portal.',
              type: 'warning'
          });
          alert("Contrato salvo e notificação gerada!");
      }
  };

  // --- Generate Briefing Link (Copy) ---
  const handleCopyBriefingLink = (project: ClientProject) => {
      const type = getServiceTypeFromProject(project);
      const link = `${window.location.origin}/?page=briefing&service=${type}`;
      
      navigator.clipboard.writeText(link);
      alert(`Link copiado! (${type})`);
  };

  // --- Open Briefing Internal (Modal Overlay) ---
  const handleOpenBriefingInternal = (project: ClientProject) => {
      const type = getServiceTypeFromProject(project);
      // Abre o modal de tela cheia sem mudar a rota
      setBriefingPreviewType(type);
  };

  return (
    <div className="space-y-8 relative">
        {/* FULLSCREEN BRIEFING MODAL */}
        {briefingPreviewType && (
            <div className="fixed inset-0 z-[200] bg-white overflow-auto animate-in slide-in-from-bottom duration-300">
                <div className="absolute top-4 right-4 z-[210]">
                    <button 
                        onClick={() => setBriefingPreviewType(null)} 
                        className="bg-white/90 backdrop-blur-md text-red-600 hover:bg-red-50 px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 border border-red-100"
                    >
                        <X size={18} /> Fechar Pré-visualização
                    </button>
                </div>
                <ClientBriefingPage 
                    forcedServiceType={briefingPreviewType} 
                    onCustomBack={() => setBriefingPreviewType(null)} 
                />
            </div>
        )}

        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Projetos</h2>
            <Button leftIcon={<Plus size={16}/>} size="sm" onClick={() => setIsCreateModalOpen(true)}>Novo Projeto</Button>
        </div>

        {/* MODALS */}
        {isCreateModalOpen && <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateProject} />}
        {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onSave={handleEditSave} />}
        {briefingProject && <ProjectBriefingModal project={briefingProject} onClose={() => setBriefingProject(null)} onSave={handleBriefingSave} />}
        {emailModalProject && <EmailGeneratorModal project={emailModalProject} onClose={() => setEmailModalProject(null)} onSuccess={() => {}} />}
        {contractProject && <ContractGeneratorModal project={contractProject} onClose={() => setContractProject(null)} userRole="admin" onContractUpdate={handleContractUpdate} />}

        <div className="grid gap-6">
            {projects.length === 0 && (
                <div className="text-center p-12 bg-gray-50 dark:bg-[#151921] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500">Nenhum projeto encontrado. Crie o primeiro!</p>
                </div>
            )}
            
            {projects.map((project) => {
                const isContractSigned = project.contract?.status === 'signed';
                const isContractSent = project.contract?.status === 'sent_to_client';
                const isPaid = project.financial.status === 'paid';
                
                return (
                <div key={project.id} className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Header do Card */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xl">
                                {project.clientName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{project.projectName}</h4>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    {project.clientName} • <span className="opacity-70">{project.email}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${
                                project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                project.status === 'development' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {STATUS_LABELS[project.status] || project.status}
                            </span>
                            <p className="text-xs text-gray-400">Entrega: {project.dueDate}</p>
                        </div>
                    </div>

                    {/* Corpo do Card */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Coluna 1: Status Financeiro */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase">Financeiro</p>
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${isPaid ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.paid)}
                                        <span className="text-gray-400 font-normal"> / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.total)}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        {isPaid ? 'Totalmente Quitado' : `Restante: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.total - project.financial.paid)}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Coluna 2: Progresso */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase">Progresso</p>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-1">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{project.progress}% Concluído</span>
                                <span>Próx: {project.nextMilestone}</span>
                            </div>
                        </div>

                        {/* Coluna 3: Ações Rápidas (Layout Reorganizado) */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase">Ações Rápidas</p>
                            <div className="flex flex-col gap-2">
                                
                                {/* 1. Acesso ao Briefing (Links) */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => handleCopyBriefingLink(project)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
                                        title="Copiar Link"
                                    >
                                        <LinkIcon size={14} /> Link
                                    </button>
                                    <button 
                                        onClick={() => handleOpenBriefingInternal(project)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                                        title="Abrir formulário"
                                    >
                                        <PlayCircle size={14} /> Abrir
                                    </button>
                                </div>

                                {/* 2. Financeiro & Contrato */}
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Cobrança */}
                                    {project.paymentOrder ? (
                                        <button 
                                            onClick={() => handleApprovePayment(project)}
                                            className="col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                        >
                                            <CheckCircle2 size={14} /> Aprovar
                                        </button>
                                    ) : !isPaid ? (
                                        <button 
                                            onClick={() => handleGeneratePayment(project, project.financial.paid === 0 ? 'signal' : 'final')}
                                            className="col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
                                        >
                                            <QrCode size={14} /> Cobrar
                                        </button>
                                    ) : (
                                        <div className="col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-transparent text-green-600 bg-green-50/50 cursor-default">
                                            <Check size={14} /> Pago
                                        </div>
                                    )}

                                    {/* Contrato */}
                                    <button 
                                        onClick={() => setContractProject(project)}
                                        className={`col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                            isContractSigned ? 'bg-green-50 border-green-200 text-green-700' : 
                                            isContractSent ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                            'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        <PenTool size={14} /> 
                                        {isContractSigned ? 'Contrato' : isContractSent ? 'Enviado' : 'Contrato'}
                                    </button>
                                </div>

                                {/* 3. Ações Críticas (Formalização e Edição) */}
                                {['new', 'briefing'].includes(project.status) && (
                                    <button 
                                        onClick={() => setEmailModalProject(project)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-black transition-colors shadow-sm"
                                    >
                                        <Mail size={14} /> Formalizar Início
                                    </button>
                                )}

                                <button 
                                    onClick={() => setEditingProject(project)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:border-primary-200 hover:text-primary-600 transition-colors"
                                >
                                    <Edit size={14} /> Editar Projeto
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            )})}
        </div>
    </div>
  );
};
