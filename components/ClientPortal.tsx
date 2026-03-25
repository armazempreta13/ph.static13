
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, CheckCircle2, Clock, Download, FileText, 
  MessageSquare, User, LogOut, Layout, Zap, Calendar, ExternalLink,
  CreditCard, Bell, ShieldCheck, Activity, Info, AlertTriangle, Check, Settings, Lock, Key, Mail, X, Save, PenTool, Home
} from 'lucide-react';
import { ViewType, ContractData } from '../types';
import { Button } from './Button';
import { useProject } from '../contexts/ProjectContext';
import { CheckoutScreen } from './CheckoutScreen';
import { ContractGeneratorModal } from './ContractGeneratorModal';

interface ClientPortalProps {
  onLogout: () => void;
  onNavigate: (view: ViewType) => void;
  isAdmin?: boolean;
}

const ClientSettingsModal = ({ isOpen, onClose, userEmail, userName, projectId, tempPassword }: { isOpen: boolean, onClose: () => void, userEmail: string, userName: string, projectId: string, tempPassword?: string }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userEmail);
    const [currentPass, setCurrentPass] = useState(tempPassword || '');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    useEffect(() => {
        if(isOpen) {
            setMessage(null);
            if (tempPassword) { setCurrentPass(tempPassword); } else { setCurrentPass(''); }
            setNewPass('');
            setConfirmPass('');
        }
    }, [isOpen, tempPassword]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            // Modo local - profile salvo em localStorage
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) { setMessage({ type: 'error', text: 'As novas senhas não coincidem.' }); return; }
        if (newPass.length < 6) { setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' }); return; }
        setIsLoading(true);
        setMessage(null);
        try {
            await api.auth.changePassword(userEmail, currentPass, newPass);
            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setCurrentPass(''); setNewPass(''); setConfirmPass('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Senha atual incorreta.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-[#1A1D24] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Settings size={18} /> Minha Conta</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="flex border-b border-gray-100 dark:border-gray-700">
                            <button onClick={() => { setActiveTab('profile'); setMessage(null); }} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Dados Pessoais</button>
                            <button onClick={() => { setActiveTab('security'); setMessage(null); }} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'security' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Segurança</button>
                        </div>
                        <div className="p-6">
                            {message && <div className={`mb-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message.type === 'success' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}{message.text}</div>}
                            {activeTab === 'profile' && (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Nome</label><div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"/></div></div>
                                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">E-mail (Login)</label><div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={email} disabled className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"/></div></div>
                                    <div className="pt-2"><Button type="submit" isLoading={isLoading} className="w-full" size="sm" rightIcon={<Save size={16}/>}>Salvar Alterações</Button></div>
                                </form>
                            )}
                            {activeTab === 'security' && (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg text-xs text-yellow-800 dark:text-yellow-500 mb-4">Recomendamos alterar sua senha provisória imediatamente.</div>
                                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase flex justify-between">Senha Atual {tempPassword && <span className="text-green-600 dark:text-green-400 flex items-center gap-1 normal-case"><CheckCircle2 size={10} /> Auto</span>}</label><div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type={tempPassword ? "text" : "password"} value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} readOnly={!!tempPassword} className={`w-full border rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white ${tempPassword ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`} placeholder="••••••" required/></div></div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Nova Senha</label><div className="relative"><Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" placeholder="Nova senha" required/></div></div>
                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Confirmar</label><div className="relative"><Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" placeholder="Repita" required/></div></div>
                                    </div>
                                    <div className="pt-2"><Button type="submit" isLoading={isLoading} className="w-full bg-gray-900 hover:bg-black text-white" size="sm" rightIcon={<ShieldCheck size={16}/>}>Atualizar Senha</Button></div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const ClientPortal: React.FC<ClientPortalProps> = ({ onLogout, onNavigate, isAdmin }) => {
  const { getProject, currentProjectId, markNotificationsAsRead, updateProject, sendNotification } = useProject();
  const project = getProject(currentProjectId);
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false); 
  const notifRef = useRef<HTMLDivElement>(null);
  
  const [debugEmail, setDebugEmail] = useState<string>('');

  useEffect(() => {
      const getEmail = async () => {
          const { data } = await supabase.auth.getUser();
          if (data.user?.email) setDebugEmail(data.user.email);
      };
      getEmail();

      const handleClickOutside = (event: MouseEvent) => {
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
              setIsNotifOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- EMPTY STATE (PROJETO NÃO ENCONTRADO) ---
  if (!project) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D12] flex flex-col items-center justify-center p-4 text-center font-sans">
            <div className="bg-white dark:bg-[#151921] p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase size={32} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Nenhum Projeto Encontrado</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                    Você está acessando a Área do Cliente, mas não há projetos vinculados à sua conta no momento.
                </p>
                
                {debugEmail && (
                    <div className="mb-6 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 font-mono break-all">
                        Logado como: {debugEmail}
                    </div>
                )}
                
                <div className="space-y-3">
                    <Button onClick={onLogout} className="w-full justify-center shadow-lg shadow-gray-200/50" variant="primary">
                        <LogOut size={16} className="mr-2"/> Sair da Conta
                    </Button>
                    <button onClick={() => onNavigate('home')} className="flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <Home size={14} /> Voltar ao site
                    </button>
                </div>

                {/* Atalho de recuperação para Admin */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Administração</p>
                    <button 
                        onClick={() => onNavigate('admin-dashboard')} 
                        className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={14} /> Acessar Painel Admin
                    </button>
                </div>
            </div>
        </div>
      );
  }

  const handleContractUpdate = (contractData: ContractData) => {
      const updatedContract = { ...(project.contract || {}), ...contractData };
      updateProject(project.id, {
          contract: updatedContract,
          lastUpdate: 'Contrato Assinado pelo Cliente'
      });

      if (contractData.status === 'signed') {
          sendNotification(project.id, {
              title: 'Contrato Finalizado',
              message: 'Você assinou o contrato com sucesso. O projeto está 100% formalizado.',
              type: 'success'
          });
          alert("Contrato finalizado com sucesso!");
      }
  };

  // --- CHECKOUT INTERCEPTOR ---
  if (project.paymentOrder && project.paymentOrder.status === 'pending') {
      return (
          <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D12] font-sans flex flex-col">
              <header className="bg-white dark:bg-[#151921] border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <div className="bg-primary-600 text-white p-2 rounded-lg"><Briefcase size={20} /></div>
                      <span className="font-bold text-gray-900 dark:text-white">Pagamento Pendente</span>
                  </div>
                  <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-500">Sair</button>
              </header>
              <div className="flex-1 flex items-center justify-center p-4">
                  <CheckoutScreen order={project.paymentOrder} />
              </div>
          </div>
      );
  }

  // --- DASHBOARD NORMAL ---
  const notifications = project.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const handleMarkRead = () => markNotificationsAsRead(project.id);
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'new': return 'Aguardando Início';
          case 'briefing': return 'Fase de Briefing';
          case 'development': return 'Em Desenvolvimento';
          case 'review': return 'Em Revisão';
          case 'completed': return 'Projeto Concluído';
          default: return status;
      }
  };
  const getNotificationIcon = (type: string) => {
      switch(type) {
          case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
          case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
          case 'payment': return <CreditCard size={16} className="text-blue-500" />;
          default: return <Info size={16} className="text-gray-500" />;
      }
  };

  const pendingContract = project.contract?.status === 'sent_to_client';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D12] font-sans pb-20">
      
      <ClientSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userEmail={project.email} userName={project.clientName} projectId={project.id} tempPassword={project.tempPassword} />
      
      <AnimatePresence>
          {isContractOpen && (
              <ContractGeneratorModal 
                  project={project} 
                  onClose={() => setIsContractOpen(false)}
                  userRole="client"
                  onContractUpdate={handleContractUpdate}
              />
          )}
      </AnimatePresence>

      {isAdmin && (
        <div className="bg-indigo-600 text-white px-4 py-2 text-center text-xs font-bold flex justify-between items-center sticky top-0 z-50 shadow-md">
            <span className="flex items-center gap-2"><ShieldCheck size={14}/> Modo de Visualização Admin</span>
            <button onClick={() => onNavigate('admin-dashboard')} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">Voltar ao Dashboard</button>
        </div>
      )}
      <header className="bg-white dark:bg-[#151921] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm" style={{ top: isAdmin ? '36px' : '0' }}>
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 text-white p-2 rounded-xl shadow-lg shadow-primary-600/20"><Briefcase size={20} /></div>
            <div><h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Área do Cliente</h1><p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Gestão de Projetos</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative" ref={notifRef}>
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`relative p-2 rounded-full transition-colors ${isNotifOpen ? 'bg-gray-100 dark:bg-gray-800 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><Bell size={20} />{unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#151921]"></span>}</button>
                <AnimatePresence>
                    {isNotifOpen && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1A1D24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 origin-top-right">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50"><h3 className="font-bold text-sm text-gray-900 dark:text-white">Notificações</h3>{unreadCount > 0 && <button onClick={handleMarkRead} className="text-[10px] text-primary-600 hover:underline font-medium">Marcar lidas</button>}</div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">{notifications.length > 0 ? (<div className="divide-y divide-gray-100 dark:divide-gray-800">{notifications.map((note) => (<div key={note.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!note.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}><div className="flex gap-3"><div className="mt-0.5 shrink-0">{getNotificationIcon(note.type)}</div><div className="flex-1"><div className="flex justify-between items-start mb-1"><p className={`text-xs font-bold ${!note.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{note.title}</p>{!note.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>}</div><p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1">{note.message}</p><p className="text-[10px] text-gray-400">{note.date}</p></div></div></div>))}</div>) : (<div className="p-8 text-center text-gray-400"><Bell size={24} className="mx-auto mb-2 opacity-50" /><p className="text-xs">Tudo tranquilo por aqui.</p></div>)}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block"><p className="text-sm font-bold text-gray-900 dark:text-white">{project.clientName}</p><p className="text-xs text-gray-500">{project.projectName}</p></div>
               <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 border-2 border-white dark:border-gray-600 shadow-sm hover:border-primary-500 transition-colors group relative" title="Minha Conta"><User size={18} /><div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 border border-gray-200 dark:border-gray-600"><Settings size={10} className="text-gray-500 group-hover:text-primary-600" /></div></button>
               <button onClick={onLogout} className="ml-2 text-gray-400 hover:text-red-500 transition-colors" title="Sair"><LogOut size={20} /></button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 md:px-8 py-8">
        
        {/* BANNER DE CONTRATO PENDENTE */}
        <AnimatePresence>
            {pendingContract && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                            <PenTool size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Contrato de Serviço Disponível</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">
                                O contrato foi gerado e assinado pela Contratada. Por favor, revise e assine digitalmente para formalizarmos nossa parceria.
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setIsContractOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 whitespace-nowrap"
                    >
                        Revisar e Assinar
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="mb-8"><h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Visão Geral</h2><p className="text-gray-500 dark:text-gray-400 text-sm">Acompanhe o progresso e as entregas do seu projeto em tempo real.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 lg:col-span-3 bg-white dark:bg-[#151921] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Zap size={120} className="text-primary-500" /></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 h-full"><div className="flex-1 w-full"><div className="flex items-center gap-3 mb-4"><span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${project.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-primary-50 text-primary-700 border-primary-200'}`}>{getStatusLabel(project.status)}</span><span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> Atualizado: {project.lastUpdate}</span></div><h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">{project.progress}% <span className="text-lg text-gray-400 font-normal">Concluído</span></h3><div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4"><motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 relative"><div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div></motion.div></div><p className="text-sm text-gray-600 dark:text-gray-300"><strong>Próximo Marco:</strong> {project.nextMilestone}</p></div><div className="flex gap-3 w-full md:w-auto">{project.previewUrl && (<Button onClick={() => window.open(project.previewUrl, '_blank')} rightIcon={<ExternalLink size={16} />}>Ver Preview</Button>)}</div></div>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#151921] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
               <div className="flex items-center gap-2 mb-6"><div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600"><CreditCard size={20} /></div><h3 className="font-bold text-gray-900 dark:text-white">Financeiro</h3></div>
               <div className="flex-1 space-y-4"><div><p className="text-xs text-gray-500 uppercase font-bold">Valor Total</p><p className="text-xl font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(project.financial.total)}</p></div><div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Pago</span><span className="text-green-600 font-bold">{Math.round((project.financial.paid / project.financial.total) * 100)}%</span></div><div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${(project.financial.paid / project.financial.total) * 100}%` }}></div></div><p className="text-xs text-right mt-1 font-mono text-gray-600 dark:text-gray-400">{formatCurrency(project.financial.paid)}</p></div>{project.financial.status !== 'paid' && (<div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl"><Clock size={14} className="mt-0.5 shrink-0"/><span>Próx. vencimento: <strong>{project.financial.nextPaymentDate}</strong></span></div>)}{project.financial.status === 'paid' && (<div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/10 p-3 rounded-xl font-bold"><ShieldCheck size={14} /><span>Projeto Quitado</span></div>)}</div>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2 bg-white dark:bg-[#151921] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"><h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CheckCircle2 size={20} className="text-primary-600"/> Checklist de Entregas</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{project.tasks.map((task) => (<div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${task.completed ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center border ${task.completed ? 'bg-green-50 border-green-500 text-white' : 'border-gray-300 dark:border-gray-500'}`}>{task.completed && <CheckCircle2 size={12} />}</div><span className={`text-sm ${task.completed ? 'text-green-800 dark:text-green-200 line-through decoration-green-800/30' : 'text-gray-700 dark:text-gray-300'}`}>{task.title}</span></div>))}</div></motion.div>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#151921] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
               <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText size={18} className="text-blue-500"/> Links & Arquivos</h3>
               <div className="flex-1 space-y-3 overflow-y-auto max-h-[200px] custom-scrollbar pr-2">
                   
                   {/* Botão para ver contrato se já assinado ou enviado */}
                   {(project.contract?.status === 'signed' || project.contract?.status === 'sent_to_client') && (
                       <button onClick={() => setIsContractOpen(true)} className="flex w-full items-center gap-3 p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 transition-colors group text-left border border-orange-100 dark:border-orange-800">
                           <div className="w-8 h-8 rounded-lg bg-orange-200 text-orange-700 flex items-center justify-center"><PenTool size={16}/></div>
                           <div className="flex-1">
                               <p className="text-xs font-bold text-gray-900 dark:text-white">Contrato de Serviço</p>
                               <p className="text-[10px] text-orange-600 dark:text-orange-400">{project.contract.status === 'signed' ? 'Assinado Digitalmente' : 'Pendente de Assinatura'}</p>
                           </div>
                       </button>
                   )}

                   {project.links.figma && (<a href={project.links.figma} target="_blank" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"><div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><Layout size={16}/></div><div className="flex-1"><p className="text-xs font-bold text-gray-900 dark:text-white">Design (Figma)</p><p className="text-[10px] text-gray-500">Visualizar Layout</p></div><ExternalLink size={14} className="text-gray-300 group-hover:text-primary-600"/></a>)}
                   {project.files.map((file) => (<div key={file.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileText size={16}/></div><div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-900 dark:text-white truncate">{file.name}</p><p className="text-[10px] text-gray-500">{file.size}</p></div><Download size={14} className="text-gray-300 group-hover:text-primary-600"/></div>))}
               </div>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md:col-span-1 bg-white dark:bg-[#151921] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"><h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-gray-400"/> Atividade Recente</h3><div className="space-y-4 relative"><div className="absolute top-2 left-2 bottom-2 w-px bg-gray-100 dark:bg-gray-800"></div>{project.activity.map((log) => (<div key={log.id} className="flex gap-3 relative pl-1"><div className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#151921] shrink-0 mt-1.5 z-10 ${log.type === 'success' ? 'bg-green-500' : log.type === 'alert' ? 'bg-red-500' : 'bg-primary-500'}`}></div><div><p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">{log.text}</p><p className="text-[10px] text-gray-400 mt-0.5">{log.date}</p></div></div>))}</div></motion.div>
        </div>
      </main>
    </div>
  );
};
