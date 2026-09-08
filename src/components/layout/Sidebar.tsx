import React from 'react';
import { LayoutDashboard, Settings, History, HelpCircle, Server, ShieldCheck, FolderOutput, UserCheck } from 'lucide-react';

export type AppTab = 'dashboard' | 'transfer' | 'settings' | 'history' | 'manual' | 'about';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  reliquiaStatus: boolean | null;
  rtoStatus: boolean | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, reliquiaStatus, rtoStatus }) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Criar Pastas', icon: LayoutDashboard },
    { id: 'transfer' as const, label: 'Mover / Transferir Pastas', icon: FolderOutput },
    { id: 'settings' as const, label: 'Configurações', icon: Settings },
    { id: 'history' as const, label: 'Histórico & Auditoria', icon: History },
    { id: 'manual' as const, label: 'Manual & Diagnóstico', icon: HelpCircle },
    { id: 'about' as const, label: 'Sobre o Desenvolvedor', icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-slate-100/90 dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 flex flex-col justify-between p-3.5 select-none transition-colors">
      <div className="space-y-5">
        {/* Logo / Brand Header */}
        <div className="px-2 pt-1 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teams-600 text-white flex items-center justify-center shadow-sm">
            <Server className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h1 className="font-bold text-xs text-slate-900 dark:text-white tracking-tight">Entropy FolderWorks</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Gerenciador de Pastas</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teams-50 dark:bg-teams-950/60 text-teams-700 dark:text-teams-300 font-semibold border-l-4 border-teams-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-neutral-800 border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teams-600 dark:text-teams-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Domain Status Footer */}
      <div className="bg-white dark:bg-neutral-800/80 rounded-xl p-3 border border-slate-200 dark:border-neutral-700/80 space-y-2.5 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Status dos Servidores</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300 font-medium">RELIQUIA</span>
            <span
              className={`w-2 h-2 rounded-full ${
                reliquiaStatus === true
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500'
                  : reliquiaStatus === false
                  ? 'bg-rose-500 shadow-sm shadow-rose-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300 font-medium">RTO</span>
            <span
              className={`w-2 h-2 rounded-full ${
                rtoStatus === true
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500'
                  : rtoStatus === false
                  ? 'bg-rose-500 shadow-sm shadow-rose-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
