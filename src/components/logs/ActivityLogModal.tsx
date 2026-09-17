import React, { useEffect, useRef, useState } from 'react';
import {
  Terminal,
  Trash2,
  FileText,
  Lock,
  X,
  ShieldCheck,
  Network,
  Laptop,
  RefreshCw
} from 'lucide-react';

interface ActivityLogModalProps {
  isOpen: boolean;
  logs: string[];
  onClose: () => void;
  onClearLogs: () => void;
  onLockSession: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  isOpen,
  logs,
  onClose,
  onClearLogs,
  onLockSession,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [logTab, setLogTab] = useState<'local' | 'network'>('local');
  const [networkLogs, setNetworkLogs] = useState<string[]>([]);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(false);

  const loadNetworkLogs = async () => {
    setIsLoadingNetwork(true);
    try {
      if (window.electronAPI?.getNetworkLogs) {
        const netLines = await window.electronAPI.getNetworkLogs();
        setNetworkLogs(netLines || []);
      }
    } catch (e) {
      console.error('Erro ao carregar logs da rede:', e);
    } finally {
      setIsLoadingNetwork(false);
    }
  };

  useEffect(() => {
    if (isOpen && logTab === 'network') {
      loadNetworkLogs();
    }
  }, [isOpen, logTab]);

  // Auto-scroll para o fim quando novos logs chegarem
  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, networkLogs, isOpen, logTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenTxt = async () => {
    await window.electronAPI?.openLogFile();
  };

  const formatLogLineClass = (log: string) => {
    if (log.includes('[ERRO') || log.includes('[ABORTADO') || log.includes('[FALHA') || log.includes('[BLOQUEIO TI') || log.includes('FALHA') || log.includes('ABORTED')) {
      return 'text-rose-400 font-semibold';
    }
    if (log.includes('[SUCESSO') || log.includes('[CÓPIA CONCLUÍDA') || log.includes('[AUDITORIA TI]') || log.includes('SUCESSO') || log.includes('SUCCESS')) {
      return 'text-emerald-400 font-semibold';
    }
    if (log.includes('[ALERTA') || log.includes('AVISO') || log.includes('[AUDITORIA REDE PENDENTE]')) {
      return 'text-amber-400 font-medium';
    }
    if (log.includes('[ROBOCOPY') || log.includes('[IMPERSONAÇÃO') || log.includes('[IMPERSONACAO') || log.includes('[MOVER_PASTA]')) {
      return 'text-sky-400';
    }
    if (log.includes('[LISTAGEM AD') || log.includes('[AUTENTICACAO') || log.includes('[AUTENTICAÇÃO') || log.includes('[CRIAR_PASTA]')) {
      return 'text-indigo-300';
    }
    if (log.includes('---') || log.includes('===')) {
      return 'text-slate-600 font-bold';
    }
    return 'text-slate-300';
  };

  const currentLogs = logTab === 'local' ? logs : networkLogs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header com Ações */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-teams-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Registro de Atividades & Logs
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>TI AUTORIZADO</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Auditoria de operações em tempo real, chamadas AD e telemetria de rede
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Abas Local / Rede */}
            <div className="flex items-center bg-slate-200/80 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setLogTab('local')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  logTab === 'local'
                    ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Log Local</span>
              </button>
              <button
                onClick={() => {
                  setLogTab('network');
                  loadNetworkLogs();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  logTab === 'network'
                    ? 'bg-white dark:bg-neutral-700 text-teams-600 dark:text-teams-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Auditoria Rede</span>
              </button>
            </div>

            {/* Botão Recarregar Rede */}
            {logTab === 'network' && (
              <button
                onClick={loadNetworkLogs}
                disabled={isLoadingNetwork}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 transition-colors cursor-pointer"
                title="Atualizar logs da rede"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNetwork ? 'animate-spin text-teams-500' : ''}`} />
              </button>
            )}

            {/* Botão Abrir TXT */}
            <button
              onClick={handleOpenTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 text-xs font-medium transition-colors cursor-pointer"
              title="Abrir arquivo de log bruto (.txt) no Bloco de Notas"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Abrir TXT</span>
            </button>

            {/* Botão Limpar Logs */}
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 text-xs font-medium transition-colors cursor-pointer"
              title="Limpar histórico de logs da sessão"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Limpar</span>
            </button>

            {/* Botão Bloquear Sessão TI */}
            <button
              onClick={onLockSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-medium transition-colors cursor-pointer"
              title="Bloquear sessão de TI imediatamente"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Bloquear</span>
            </button>

            {/* Fechar */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors ml-1 cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Terminal Live Output */}
        <div className="flex-1 bg-neutral-950 p-4 font-mono text-xs text-slate-300 overflow-y-auto min-h-[380px] max-h-[580px] select-text">
          {currentLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 italic py-16">
              <Terminal className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
              <span>
                {logTab === 'local'
                  ? 'Nenhum log registrado ainda nesta sessão...'
                  : 'Nenhum registro de auditoria em rede encontrado nos servidores...'}
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              {currentLogs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed whitespace-pre-wrap break-all ${formatLogLineClass(log)}`}>
                  {log}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          )}
        </div>

        {/* Footer com Metadados */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-neutral-900/90 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{logTab === 'local' ? 'Telemetria Local Ativa' : 'Auditoria Compartilhada da Rede'}</span>
          </div>
          <div>
            Total de entradas: <span className="font-bold text-slate-700 dark:text-slate-200">{currentLogs.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
