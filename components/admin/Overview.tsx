
import React, { useMemo } from 'react';
import { DollarSign, LayoutDashboard, CheckCircle2, UserPlus, BarChart3, PieChart, Activity } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { DashboardMetric, ClientProject } from '../../types';

export const Overview: React.FC = () => {
  const { projects } = useProject();

  // --- CÁLCULOS EM TEMPO REAL ---
  const stats = useMemo(() => {
      const totalRevenue = projects.reduce((acc, p) => acc + (p.financial?.total || 0), 0);
      const totalPaid = projects.reduce((acc, p) => acc + (p.financial?.paid || 0), 0);
      
      const activeProjects = projects.filter(p => ['briefing', 'development', 'review'].includes(p.status)).length;
      const newLeads = projects.filter(p => p.status === 'new').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      
      const activeList = projects.filter(p => ['briefing', 'development', 'review'].includes(p.status));
      const avgProgress = activeList.length > 0 
          ? Math.round(activeList.reduce((acc, p) => acc + p.progress, 0) / activeList.length) 
          : 0;

      const allActivities = projects.flatMap(p => p.activity.map(a => ({ ...a, project: p.projectName }))).sort((a, b) => {
          const [dA, mA, yA] = a.date.split('/');
          const [dB, mB, yB] = b.date.split('/');
          return new Date(`${yB}-${mB}-${dB}`).getTime() - new Date(`${yA}-${mA}-${dA}`).getTime();
      }).slice(0, 5);

      return {
          revenue: { total: totalRevenue, paid: totalPaid, pending: totalRevenue - totalPaid },
          counts: { active: activeProjects, leads: newLeads, completed: completedProjects },
          deliveryRate: avgProgress,
          activities: allActivities
      };
  }, [projects]);

  const METRICS: DashboardMetric[] = [
      { label: 'Receita Prevista', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(stats.revenue.total), change: 'Total', trend: 'neutral', icon: DollarSign },
      { label: 'Projetos Ativos', value: stats.counts.active.toString(), change: 'Em andamento', trend: 'up', icon: LayoutDashboard },
      { label: 'Taxa de Entrega', value: `${stats.deliveryRate}%`, change: 'Média global', trend: 'up', icon: CheckCircle2 },
      { label: 'Novos Leads', value: stats.counts.leads.toString(), change: 'Aguardando', trend: 'neutral', icon: UserPlus },
  ];

  const STATUS_LABELS: Record<string, string> = {
    'new': 'Novo Lead',
    'briefing': 'Briefing',
    'development': 'Em Produção',
    'review': 'Revisão',
    'completed': 'Concluído'
  };

  const STATUS_COLORS: Record<string, string> = {
    'new': 'bg-gray-100 text-gray-600',
    'briefing': 'bg-blue-100 text-blue-700',
    'development': 'bg-purple-100 text-purple-700',
    'review': 'bg-orange-100 text-orange-700',
    'completed': 'bg-green-100 text-green-700'
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visão Geral</h2>
      
      {/* 1. Métricas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((metric, index) => (
          <div key={index} className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-primary-600">
                <metric.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                metric.trend === 'up' ? 'bg-green-50 text-green-600' : 
                metric.trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
              }`}>
                {metric.change}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{metric.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 2. Saúde Financeira Detalhada */}
          <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600"><BarChart3 size={18}/></div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Saúde Financeira</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Recebido</span>
                          <span className="font-bold text-green-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue.paid)}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.revenue.total > 0 ? (stats.revenue.paid / stats.revenue.total) * 100 : 0}%` }}></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Pendente</span>
                          <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue.pending)}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full" style={{ width: `${stats.revenue.total > 0 ? (stats.revenue.pending / stats.revenue.total) * 100 : 0}%` }}></div>
                      </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-center text-xs text-gray-400">Total Previsto: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue.total)}</strong></p>
                  </div>
              </div>
          </div>

          {/* 3. Distribuição de Projetos */}
          <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600"><PieChart size={18}/></div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Status dos Projetos</h3>
              </div>
              <div className="space-y-3">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => {
                      const count = projects.filter(p => p.status === key).length;
                      if (count === 0) return null;
                      return (
                          <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                              <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[key].split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`}></div>
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
                              </div>
                              <span className="text-xs font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">{count}</span>
                          </div>
                      )
                  })}
                  {projects.length === 0 && <p className="text-center text-xs text-gray-400 py-8">Nenhum projeto cadastrado.</p>}
              </div>
          </div>

          {/* 4. Feed de Atividades */}
          <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600"><Activity size={18}/></div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Atividades Recentes</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[250px]">
                  <div className="space-y-4 relative pl-2">
                      <div className="absolute top-2 left-[11px] bottom-2 w-px bg-gray-100 dark:bg-gray-800"></div>
                      {stats.activities.length > 0 ? stats.activities.map((log, i) => (
                          <div key={i} className="flex gap-3 relative">
                              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#151921] shrink-0 mt-1.5 z-10 ${log.type === 'success' ? 'bg-green-500' : log.type === 'alert' ? 'bg-red-500' : 'bg-primary-500'}`}></div>
                              <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{log.project}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">{log.text}</p>
                                  <p className="text-[9px] text-gray-400 mt-1">{log.date}</p>
                              </div>
                          </div>
                      )) : (
                          <p className="text-center text-xs text-gray-400">Nenhuma atividade registrada.</p>
                      )}
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};
