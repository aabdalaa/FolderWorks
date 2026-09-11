import React from 'react';
import { Minus, Square, X, FolderSync } from 'lucide-react';

interface TitleBarProps {
  isLocked?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ isLocked = false }) => {
  return (
    <div className={`h-9 bg-slate-100 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between px-3 select-none text-xs text-slate-500 dark:text-slate-400 transition-colors ${isLocked ? 'pointer-events-none' : 'app-drag'}`}>
      <div className="flex items-center gap-2.5 font-medium">
        <div className="w-5 h-5 rounded bg-teams-600 flex items-center justify-center text-white shadow-xs">
          <FolderSync className="w-3 h-3" />
        </div>
        <span className="font-bold text-xs tracking-tight text-slate-800 dark:text-white">Entropy FolderWorks</span>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-teams-50 dark:bg-teams-950 text-teams-700 dark:text-teams-300 border border-teams-200 dark:border-teams-800 font-mono font-bold">
          v2.7.5
          v2.7.6
        </span>
      </div>

      {!isLocked && (
        <div className="flex items-center gap-1 app-no-drag">
          <button
            onClick={() => window.electronAPI?.minimize()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Minimizar"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => window.electronAPI?.maximize()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Maximizar"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.electronAPI?.close()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-rose-600 text-slate-500 dark:text-slate-400 hover:text-white transition-colors"
            title="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
