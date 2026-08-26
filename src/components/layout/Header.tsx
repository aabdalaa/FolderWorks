import React from 'react';
import { Terminal, Shield } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenLogs }) => {
  return (
    <header className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between select-none">
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/60 text-xs text-cyan-300 font-mono font-extrabold shadow-lg shadow-cyan-500/10">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>VERSÃO v2.4.3</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-mono">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Usuário AD: pasta.paralegal</span>
        </div>

        <button
          onClick={onOpenLogs}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-300" />
          <span>Abrir Log (.txt)</span>
        </button>
      </div>
    </header>
  );
};
