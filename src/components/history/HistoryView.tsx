import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  History,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Monitor,
  RefreshCw,
  Search,
  Network,
  FolderPlus,
  FolderOutput,
  FolderEdit,
  RotateCcw,
  Sparkles,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { SharedAuditEvent } from '../../types/electron';

export const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<SharedAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedOperator, setSelectedOperator] = useState<string>('ALL');
  const [currentOperator, setCurrentOperator] = useState<{ username: string; computerName: string } | null>(null);
  const [sharedLogFilePath, setSharedLogFilePath] = useState<string>('');

  const fetchHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      if (window.electronAPI) {
        const [records, opInfo, cfg] = await Promise.all([
          window.electronAPI.getHistory(),
          window.electronAPI.getOperatorInfo?.() || Promise.resolve(null),
          window.electronAPI.getConfig?.() || Promise.resolve(null),
        ]);
        setHistory(records || []);
        if (opInfo) setCurrentOperator(opInfo);
        if (cfg && cfg.sharedLogFilePath) setSharedLogFilePath(cfg.sharedLogFilePath);
      }
    } catch (err) {
      console.error('Falha ao carregar histórico compartilhado:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(false);

    // Auto-refresh a cada 5 segundos para refletir ações dos outros computadores na rede
    const interval = setInterval(() => {
      fetchHistory(true);
    }, 5000);

    // Atualização imediata em caso de evento IPC ou foco na janela
    const cleanupHistory = window.electronAPI?.onHistoryUpdated?.(() => {
      fetchHistory(true);
    });

    const onFocus = () => fetchHistory(true);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      cleanupHistory?.();
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchHistory]);

  const handleClear = async () => {
    if (window.electronAPI) {
      const updated = await window.electronAPI.clearHistory();
      setHistory(updated || []);
    }
  };

  // Lista única de operadores para o filtro
  const uniqueOperators = useMemo(() => {
    const set = new Set<string>();
    history.forEach((item) => {
      const op = item.operator?.username || item.executedBy || '';
      if (op) set.add(op);
    });
    return Array.from(set).sort();
  }, [history]);

  // Filtros combinados
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.folderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.operator?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.operator?.computerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.company || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany =
        selectedCompany === 'ALL' || item.company === selectedCompany;

      const matchesAction =
        selectedAction === 'ALL' ||
        item.action === selectedAction ||
        (item.actionLabel && item.actionLabel.toUpperCase().includes(selectedAction));

      const matchesOperator =
        selectedOperator === 'ALL' ||
        item.operator?.username === selectedOperator ||
        item.executedBy === selectedOperator;

      return matchesSearch && matchesCompany && matchesAction && matchesOperator;
    });
  }, [history, searchTerm, selectedCompany, selectedAction, selectedOperator]);

  const renderActionBadge = (action: string, label?: string) => {
    const act = (action || '').toUpperCase();
    const lbl = label || action || 'Operação';

    if (act.includes('CRIAR')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <FolderPlus className="w-3 h-3" />
          <span>{lbl}</span>
        </span>
      );
    }
    if (act.includes('MOVER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
          <FolderOutput className="w-3 h-3" />
          <span>{lbl}</span>
        </span>
      );
    }
    if (act.includes('RENOMEAR')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <FolderEdit className="w-3 h-3" />
          <span>{lbl}</span>
        </span>
      );
    }
    if (act.includes('DESFAZER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <RotateCcw className="w-3 h-3" />
          <span>{lbl}</span>
        </span>
      );
    }
    if (act.includes('EXCLUIR')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <Trash2 className="w-3 h-3" />
          <span>{lbl}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20">
        <span>{lbl}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto transition-colors select-none pb-8">
      {/* Card Principal */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 dark:border-neutral-700/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400 shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Histórico de Operações & Auditoria em Rede
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Network className="w-3 h-3 animate-pulse" />
                  <span>Rede P2P UDP Ativa (Porta 48899)</span>
                </span>
                {sharedLogFilePath && (
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 max-w-xs truncate"
                    title={`Arquivo Compartilhado: ${sharedLogFilePath}`}
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="truncate">Arquivo: {sharedLogFilePath.split(/[\\/]/).pop()}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Auditoria colaborativa descentralizada compartilhada silenciosamente entre todas as estações da equipe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            {/* Botão Abrir Arquivo Compartilhado */}
            {sharedLogFilePath && (
              <button
                onClick={() => window.electronAPI?.openSharedLogFile(sharedLogFilePath)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold transition-colors cursor-pointer"
                title={`Abrir arquivo ${sharedLogFilePath}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Log na Rede</span>
              </button>
            )}

            {/* Indicador da máquina atual */}
            {currentOperator && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs text-slate-600 dark:text-slate-300">
                <Monitor className="w-3.5 h-3.5 text-teams-500" />
                <span>
                  Sua Estação: <strong>{currentOperator.computerName}</strong> ({currentOperator.username})
                </span>
              </div>
            )}

            {/* Botão Atualizar */}
            <button
              onClick={() => fetchHistory(false)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-600 text-xs font-semibold transition-colors cursor-pointer"
              title="Recarregar histórico da rede agora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teams-500' : ''}`} />
              <span>Atualizar</span>
            </button>

            {/* Botão Limpar Visualização */}
            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold transition-colors cursor-pointer"
                title="Limpar registros locais"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Local</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="p-4 bg-slate-50/70 dark:bg-neutral-900/60 border-b border-slate-100 dark:border-neutral-700/70 flex flex-wrap items-center gap-3">
          {/* Busca por texto */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pasta, colaborador, máquina ou caminho..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teams-500 transition-all"
            />
          </div>

          {/* Filtro por Empresa */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Empresa:</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teams-500 cursor-pointer"
            >
              <option value="ALL">Todas</option>
              <option value="RTO">RTO</option>
              <option value="RELIQUIA">RELIQUIA</option>
            </select>
          </div>

          {/* Filtro por Ação */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ação:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teams-500 cursor-pointer"
            >
              <option value="ALL">Todas as Ações</option>
              <option value="CRIAR_PASTA">Criação de Pastas</option>
              <option value="MOVER_PASTA">Movimentação / Transferência</option>
              <option value="RENOMEAR_PASTA">Renomeação</option>
              <option value="EXCLUIR_ORIGEM">Exclusão de Origem</option>
              <option value="DESFAZER_TRANSFERENCIA">Desfazer Transferência</option>
            </select>
          </div>

          {/* Filtro por Operador */}
          {uniqueOperators.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Operador:</span>
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teams-500 cursor-pointer"
              >
                <option value="ALL">Todos os Usuários</option>
                {uniqueOperators.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Contador de Registros */}
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-auto">
            Exibindo <strong>{filteredHistory.length}</strong> de {history.length} operações
          </div>
        </div>

        {/* Tabela de Dados */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs italic flex flex-col items-center justify-center gap-2">
            <History className="w-8 h-8 opacity-30 text-slate-400" />
            <span>Nenhuma operação corporativa encontrada para os filtros selecionados...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-700 bg-slate-50/90 dark:bg-neutral-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 pl-6">Data / Hora</th>
                  <th className="p-3">Operador & Estação</th>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Pasta / Detalhes</th>
                  <th className="p-3">Duração</th>
                  <th className="p-3 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-700/60 font-mono">
                {filteredHistory.map((item) => {
                  const opUser = item.operator?.username || item.executedBy || 'Operador';
                  const opMachine = item.operator?.computerName || 'Rede';
                  const isCurrentMachine = currentOperator && (currentOperator.computerName === opMachine || currentOperator.username === opUser);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-neutral-750/50 transition-colors"
                    >
                      {/* Data / Hora */}
                      <td className="p-3 pl-6 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {item.timestamp}
                      </td>

                      {/* Operador & Máquina */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCurrentMachine
                              ? 'bg-teams-100 dark:bg-teams-950 text-teams-700 dark:text-teams-300 border border-teams-300 dark:border-teams-700'
                              : 'bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-200'
                          }`}>
                            <User className="w-3 h-3" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{opUser}</span>
                              {isCurrentMachine && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teams-500/10 text-teams-600 dark:text-teams-400 font-bold">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                              <Monitor className="w-2.5 h-2.5" />
                              <span>{opMachine}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Empresa */}
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.company === 'RELIQUIA'
                              ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          {item.company}
                        </span>
                      </td>

                      {/* Ação */}
                      <td className="p-3 whitespace-nowrap">
                        {renderActionBadge(item.action, item.actionLabel)}
                      </td>

                      {/* Pasta / Detalhes */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white max-w-md truncate" title={item.folderName}>
                          {item.folderName}
                        </div>
                        {item.details && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-md" title={item.details}>
                            {item.details}
                          </div>
                        )}
                      </td>

                      {/* Duração */}
                      <td className="p-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.durationSeconds}s</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 pr-6 whitespace-nowrap">
                        {item.status === 'SUCCESS' || item.status === 'TRANSFER_COMPLETED_AND_PURGED' || item.status === 'UNDO_COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sucesso</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{item.status === 'ABORTED' ? 'Abortado' : 'Falha'}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
