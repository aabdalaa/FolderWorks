import React from 'react';
import { LayoutDashboard, Settings, History, HelpCircle, Server, ShieldCheck, Wrench } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'settings' | 'history' | 'manual' | 'builder';
  onSelectTab: (tab: 'dashboard' | 'settings' | 'history' | 'manual' | 'builder') => void;
  reliquiaStatus: boolean | null;
  rtoStatus: boolean | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, reliquiaStatus, rtoStatus }) => {
  const navItems = [
    { id: 'dashboard', label: 'Criar Pastas', icon: LayoutDashboard },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'builder', label: 'Gerador de MSI', icon: Wrench },
    { id: 'history', label: 'Histórico & Auditoria', icon: History },
    { id: 'manual', label: 'Manual & Diagnóstico', icon: HelpCircle },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-4 select-none">
      <div className="space-y-6">
        {/* Logo / Brand Header */}
        <div className="px-2 pt-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-tight">Entropy FolderWorks</h1>
            <p className="text-[11px] text-slate-400">Criador de Pastas de Rede</p>
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
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Domain Status Footer */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-3">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Versão Atual App</span>
          <span className="text-xs font-mono font-extrabold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/50">v2.4.3</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Status dos Servidores AD</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">RELIQUIA (192.168.100.30)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                reliquiaStatus === true
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                  : reliquiaStatus === false
                  ? 'bg-rose-500 shadow-sm shadow-rose-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">RTO (192.168.50.102)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                rtoStatus === true
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
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
