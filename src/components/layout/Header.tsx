import React from 'react';
import { Terminal, Sun, Moon, Laptop } from 'lucide-react';
import { ThemeMode } from '../../hooks/useTheme';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenLogs: () => void;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenLogs, theme, onSetTheme }) => {
  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 px-6 py-3.5 flex items-center justify-between select-none transition-colors">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Switcher: Light / Dark / System */}
        <div className="flex items-center bg-slate-100 dark:bg-neutral-800 p-1 rounded-lg border border-slate-200 dark:border-neutral-700">
          <button
            onClick={() => onSetTheme('light')}
            className={`p-1.5 rounded-md transition-all ${
              theme === 'light'
                ? 'bg-white text-amber-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Modo Claro"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSetTheme('dark')}
            className={`p-1.5 rounded-md transition-all ${
              theme === 'dark'
                ? 'bg-neutral-700 text-teams-300 shadow-xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Modo Escuro"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSetTheme('system')}
            className={`p-1.5 rounded-md transition-all ${
              theme === 'system'
                ? 'bg-white dark:bg-neutral-700 text-teams-600 dark:text-teams-300 shadow-xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Sincronizar com o Windows (Automático)"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Version Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teams-50 dark:bg-teams-950 border border-teams-200 dark:border-teams-800 text-[11px] text-teams-700 dark:text-teams-300 font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-teams-600 dark:bg-teams-400" />
          <span>v2.5.3</span>
        </div>

        {/* Open Logs Button */}
        <button
          onClick={onOpenLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 text-xs font-medium transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span>Logs (.txt)</span>
        </button>
      </div>
    </header>
  );
};
