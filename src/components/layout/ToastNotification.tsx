import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, FolderOpen, RotateCcw, X, Clock, Sparkles } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'creation' | 'rename';
  title: string;
  folderName: string;
  folderPath?: string;
  durationSeconds?: number;
  company?: string;
  onUndoOrRedo?: () => void;
  undoOrRedoLabel?: string;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(10000); // 10 segundos
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!toast) {
      setProgress(100);
      remainingTimeRef.current = 10000;
      lastTickRef.current = null;
      return;
    }

    setProgress(100);
    remainingTimeRef.current = 10000;
    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      if (isPaused) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const delta = now - (lastTickRef.current || now);
      lastTickRef.current = now;

      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - delta);
      const pct = (remainingTimeRef.current / 10000) * 100;
      setProgress(pct);

      if (remainingTimeRef.current <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast, isPaused, onClose]);

  if (!toast) return null;

  const handleOpenFolder = async () => {
    if (toast.folderPath && window.electronAPI?.openFolderInExplorer) {
      await window.electronAPI.openFolderInExplorer(toast.folderPath);
    }
  };

  const handleActionClick = () => {
    if (toast.onUndoOrRedo) {
      toast.onUndoOrRedo();
    }
    onClose();
  };

  const secondsLeft = Math.ceil(remainingTimeRef.current / 1000);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-neutral-850 rounded-2xl border border-slate-200/90 dark:border-neutral-700 shadow-2xl overflow-hidden transition-all animate-in slide-in-from-bottom-5 duration-300 select-none text-slate-800 dark:text-slate-100"
      style={{
        boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.25), 0 0 15px rgba(79, 70, 229, 0.15)',
      }}
    >
      {/* Barra de Progresso Superior de 10s */}
      <div className="w-full bg-slate-100 dark:bg-neutral-800 h-1 relative overflow-hidden">
        <div
          className="h-full bg-teams-600 dark:bg-teams-400 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Cabeçalho do Toast */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {toast.title}
                </h4>
                {toast.company && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-slate-300">
                    {toast.company}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {toast.durationSeconds || 1}s de execução
                </span>
                <span>•</span>
                <span>auto-fecha em {secondsLeft}s</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-750 transition-colors cursor-pointer"
            title="Fechar notificação"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nome da Pasta em Destaque */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate mb-3 select-text">
          <span className="font-bold text-teams-600 dark:text-teams-400">Pasta: </span>
          {toast.folderName}
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center justify-end gap-2 pt-1">
          {toast.folderPath && (
            <button
              onClick={handleOpenFolder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-750 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Abrir pasta no Windows Explorer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-teams-600 dark:text-teams-400" />
              <span>Abrir Pasta</span>
            </button>
          )}

          {toast.onUndoOrRedo && (
            <button
              onClick={handleActionClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teams-600 hover:bg-teams-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title={toast.undoOrRedoLabel || 'Refazer ação'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{toast.undoOrRedoLabel || 'Refazer'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

