import React from 'react';
import { Sun, Moon, Laptop, UserCheck } from 'lucide-react';
import { ThemeMode } from '../../hooks/useTheme';

interface HeaderProps {
  title: string;
  subtitle: string;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  onOpenAbout?: () => void;
  isAboutActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  theme,
  onSetTheme,
  onOpenAbout,
  isAboutActive = false,
}) => {
  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 px-6 py-3.5 flex items-center justify-between select-none transition-colors">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Botão Sobre o Desenvolvedor */}
        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all shadow-xs cursor-pointer ${
              isAboutActive
                ? 'bg-teams-600 border-teams-600 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Sobre o Desenvolvedor & Entropy"
          >
            <UserCheck className={`w-3.5 h-3.5 ${isAboutActive ? 'text-white' : 'text-teams-600 dark:text-teams-400'}`} />
            <span>Sobre</span>
          </button>
        )}

        {/* Theme Switcher: Light / Dark / System */}
        <div className="flex items-center bg-slate-100 dark:bg-neutral-800 p-1 rounded-lg border border-slate-200 dark:border-neutral-700">
          <button
            onClick={() => onSetTheme('light')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
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
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
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
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
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
          <span>v2.5.12</span>
          <span>v2.5.13</span>
        </div>
      </div>
    </header>
  );
};
