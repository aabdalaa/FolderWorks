import React from 'react';
import { Minus, Square, X, FolderSync } from 'lucide-react';

export const TitleBar: React.FC = () => {
  return (
    <div className="h-9 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between px-3 app-drag select-none text-xs text-slate-400">
      <div className="flex items-center gap-2 font-medium text-slate-200">
        <div className="w-5 h-5 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
          <FolderSync className="w-3.5 h-3.5" />
        </div>
        <span className="font-extrabold text-sm tracking-tight text-white">Entropy FolderWorks</span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-mono font-extrabold shadow-md shadow-cyan-500/20 animate-pulse">
          v2.4.3
        </span>
      </div>

      <div className="flex items-center gap-1 app-no-drag">
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Minimizar"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Maximizar"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
          title="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
