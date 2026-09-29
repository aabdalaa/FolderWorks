import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderEdit,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FolderCheck,
  Building2,
  Search,
  RefreshCw,
  Folder,
  CheckSquare,
  Square,
  ShieldAlert
} from 'lucide-react';
import { ToastData } from '../layout/ToastNotification';

interface FolderItem {
  name: string;
  fullPath: string;
  mtime?: string;
}

interface FolderRenameViewProps {
  onRenameFolder?: (payload: { targetPath: string; newName: string; company?: string }) => Promise<{ success: boolean; newPath?: string; durationSeconds?: number; error?: string }>;
  onShowToast?: (data: ToastData) => void;
}

export const FolderRenameView: React.FC<FolderRenameViewProps> = ({ onRenameFolder, onShowToast }) => {
  const [company, setCompany] = useState<string>('');
  const [config, setConfig] = useState<any>(null);
  const [currentSourceDir, setCurrentSourceDir] = useState<string>('');
  
  // IT Boundary validation
  const [boundaryStatus, setBoundaryStatus] = useState<{ isValid: boolean; allowedBase: string; message: string }>({
    isValid: true,
    allowedBase: '',
    message: '',
  });

  const validateBoundary = async (targetPath: string, comp: string) => {
    if (!window.electronAPI?.validateBoundary) return { isValid: true, allowedBase: '', message: '' };
    const res = await window.electronAPI.validateBoundary({ targetPath, company: comp });
    setBoundaryStatus(res);
    return res;
  };

  // Lista de pastas da empresa
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState<boolean>(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Seleção e renomeação
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [currentFolderName, setCurrentFolderName] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string; newPath?: string } | null>(null);

  // Carrega configuração de empresas e pastas disponíveis
  useEffect(() => {
    window.electronAPI?.getConfig().then((allCfg) => {
      setConfig(allCfg);
      const keys = allCfg ? Object.keys(allCfg).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword') : [];
      const targetComp = keys.includes(company) ? company : (keys[0] || '');
      if (targetComp !== company) {
        setCompany(targetComp);
      }
      const cur = allCfg?.[targetComp];
      if (cur) {
        const src = cur.defaultSourceFolder || cur.destSharePath || '';
        setCurrentSourceDir(src);
        validateBoundary(src, targetComp);
        loadSubdirectories(src, targetComp);
      }
    });

    const unsub = window.electronAPI?.onConfigUpdated?.((updatedCfg) => {
      setConfig(updatedCfg);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [company]);

  const companyKeys = config ? Object.keys(config).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword') : [];

  const getCacheKey = (dir: string, comp: string) => `fw_folders_cache_${comp}_${dir.toLowerCase().trim()}`;

  // Carrega lista de subpastas do diretório
  const loadSubdirectories = async (dir: string, comp: string = company) => {
    if (!dir) return;
    const bRes = await validateBoundary(dir, comp);
    if (!bRes.isValid) {
      setFolders([]);
      setFolderError(bRes.message);
      setLoadingFolders(false);
      return;
    }
    const cacheKey = getCacheKey(dir, comp);
    const cached = localStorage.getItem(cacheKey);
    let hasCache = false;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFolders(parsed);
          setLoadingFolders(false);
          hasCache = true;
        }
      } catch (e) {
        // ignore parse error
      }
    }

    if (!hasCache) {
      setLoadingFolders(true);
    }
    setFolderError(null);
    try {
      const res = await window.electronAPI?.listSubdirectories(dir, comp);
      if (res?.success) {
        setFolders(res.folders || []);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(res.folders || []));
        } catch (e) {
          // ignore storage error
        }
      } else {
        if (!hasCache) {
          setFolderError(res?.error || 'Erro ao listar pastas.');
          setFolders([]);
        }
      }
    } catch (e: any) {
      if (!hasCache) {
        setFolderError(e.message || 'Erro inesperado.');
        setFolders([]);
      }
    } finally {
      setLoadingFolders(false);
    }
  };

  // Atualização silenciosa em background (5s)
  const silentRefresh = async (dir: string = currentSourceDir, comp: string = company) => {
    if (!dir || isRenaming || !boundaryStatus.isValid) return;
    try {
      const res = await window.electronAPI?.listSubdirectories(dir, comp);
      if (res?.success && Array.isArray(res.folders)) {
        setFolders(res.folders);
        try {
          const cacheKey = getCacheKey(dir, comp);
          localStorage.setItem(cacheKey, JSON.stringify(res.folders));
        } catch {}
      }
    } catch {}
  };

  // Polling automático a cada 5 segundos + revalidação no foco e em eventos IPC
  useEffect(() => {
    if (!currentSourceDir || isRenaming) return;

    const interval = setInterval(() => {
      silentRefresh(currentSourceDir, company);
    }, 5000);

    const handleFocus = () => {
      silentRefresh(currentSourceDir, company);
    };
    window.addEventListener('focus', handleFocus);

    const unsubFolders = window.electronAPI?.onFoldersUpdated?.((data) => {
      if (!data || !data.company || data.company === company) {
        silentRefresh(currentSourceDir, company);
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      if (unsubFolders) unsubFolders();
    };
  }, [currentSourceDir, company, isRenaming]);

  // Pastas filtradas pela pesquisa em tempo real
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase();
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  // Seleção de pasta da grade
  const handleSelectFromList = (f: FolderItem) => {
    setSelectedPath(f.fullPath);
    setCurrentFolderName(f.name);
    setNewFolderName(f.name);
    setStatusMessage(null);
  };

  // Diálogo para escolher outro diretório de trabalho
  const handleBrowseSource = async () => {
    setStatusMessage(null);
    const defaultStart = currentSourceDir || config?.[company]?.destSharePath || undefined;
    const pathChosen = await window.electronAPI?.selectDirectory({
      defaultPath: defaultStart,
      company,
      enforceBoundary: true,
    });
    if (pathChosen) {
      setCurrentSourceDir(pathChosen);
      validateBoundary(pathChosen, company);
      loadSubdirectories(pathChosen, company);
      setSelectedPath('');
      setCurrentFolderName('');
      setNewFolderName('');
    }
  };

  // Validação e Execução da Renomeação
  const handleExecuteRename = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!boundaryStatus.isValid) {
      setStatusMessage({ type: 'error', message: boundaryStatus.message });
      return;
    }

    if (!selectedPath) {
      setStatusMessage({ type: 'error', message: 'Selecione uma pasta na lista acima para renomear.' });
      return;
    }

    const trimmedNewName = newFolderName.trim();
    if (!trimmedNewName) {
      setStatusMessage({ type: 'error', message: 'O novo nome da pasta não pode estar vazio.' });
      return;
    }

    // Caracteres proibidos no Windows: \ / : * ? " < > |
    const invalidCharsRegex = /[\\/:*?"<>|]/;
    if (invalidCharsRegex.test(trimmedNewName)) {
      setStatusMessage({
        type: 'error',
        message: 'O novo nome contém caracteres não permitidos pelo Windows: \\ / : * ? " < > |',
      });
      return;
    }

    if (currentFolderName.toLowerCase() === trimmedNewName.toLowerCase()) {
      setStatusMessage({
        type: 'error',
        message: 'O novo nome é idêntico ao nome atual da pasta. Digite uma alteração.',
      });
      return;
    }

    setIsRenaming(true);
    try {
      let result;
      if (onRenameFolder) {
        result = await onRenameFolder({
          targetPath: selectedPath,
          newName: trimmedNewName,
          company,
        });
      } else if (window.electronAPI?.renameFolder) {
        result = await window.electronAPI.renameFolder({
          targetPath: selectedPath,
          newName: trimmedNewName,
          company,
        });
      } else {
        throw new Error('Mecanismo de renomeação não disponível.');
      }

      if (result.success && result.newPath) {
        setStatusMessage({
          type: 'success',
          message: `Pasta renomeada com sucesso para '${trimmedNewName}'.`,
          newPath: result.newPath,
        });
        setSelectedPath(result.newPath);
        setCurrentFolderName(trimmedNewName);
        setNewFolderName(trimmedNewName);

        // Atualiza a grade de pastas e cache imediatamente para refletir a nova nomenclatura
        if (currentSourceDir) {
          const cacheKey = getCacheKey(currentSourceDir, company);
          const finalNewPath = result.newPath || selectedPath;
          setFolders((prev) => {
            const next = prev.map((f) => {
              if (f.fullPath.toLowerCase() === selectedPath.toLowerCase()) {
                return { ...f, name: trimmedNewName, fullPath: finalNewPath };
              }
              return f;
            });
            try {
              localStorage.setItem(cacheKey, JSON.stringify(next));
            } catch (e) {}
            return next;
          });
          loadSubdirectories(currentSourceDir, company);
        }

        // Dispara o Toast animado de 10s no canto da tela com opção de Desfazer
        if (onShowToast) {
          const originalPath = selectedPath;
          const originalName = currentFolderName;
          const renamedPath = result.newPath;
          const renamedName = trimmedNewName;

          onShowToast({
            id: `toast_rename_${Date.now()}`,
            type: 'rename',
            title: 'Pasta Renomeada com Sucesso!',
            folderName: renamedName,
            folderPath: renamedPath,
            durationSeconds: result.durationSeconds || 1,
            company,
            undoOrRedoLabel: 'Desfazer',
            onUndoOrRedo: async () => {
              // Executa a reversão imediata da renomeação
              if (window.electronAPI?.renameFolder) {
                const rollbackRes = await window.electronAPI.renameFolder({
                  targetPath: renamedPath,
                  newName: originalName,
                  company,
                });
                if (rollbackRes.success) {
                  setSelectedPath(rollbackRes.newPath || originalPath);
                  setCurrentFolderName(originalName);
                  setNewFolderName(originalName);
                  setStatusMessage({
                    type: 'success',
                    message: `Renomeação desfeita: nome restaurado para '${originalName}'.`,
                  });
                  if (currentSourceDir) {
                    loadSubdirectories(currentSourceDir, company);
                  }
                }
              }
            },
          });
        }
      } else {
        setStatusMessage({
          type: 'error',
          message: result.error || 'Não foi possível renomear a pasta.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err.message || 'Erro inesperado durante a renomeação.',
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleReset = () => {
    setSelectedPath('');
    setCurrentFolderName('');
    setNewFolderName('');
    setStatusMessage(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 transition-colors select-none">
      {/* Top Controls: Company Toggle */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Empresa:</span>
          <div className="flex flex-wrap rounded-lg bg-slate-100 dark:bg-neutral-900 p-1 border border-slate-200 dark:border-neutral-700 gap-1">
            {companyKeys.map((key) => {
              const isSelected = company === key;
              const compName = config?.[key]?.companyName || key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setCompany(key);
                    setSelectedPath('');
                    setCurrentFolderName('');
                    setNewFolderName('');
                    setStatusMessage(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-teams-600 text-teams-700 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{compName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {currentSourceDir && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono truncate max-w-md">
            <Folder className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">Diretório: {currentSourceDir.split(/[\\/]/).filter(Boolean).pop() || 'Raiz'}</span>
          </div>
        )}
      </div>

      {/* Card 1: Seleção de Pastas da Empresa (Grade Interativa) */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-neutral-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
              <FolderEdit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Selecione a Pasta para Renomear
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Escolha uma pasta na lista abaixo ou pesquise pelo nome
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar pasta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teams-500"
              />
            </div>

            <button
              type="button"
              onClick={() => loadSubdirectories(currentSourceDir, company)}
              disabled={loadingFolders || !currentSourceDir}
              title="Atualizar lista de pastas"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-neutral-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingFolders ? 'animate-spin text-teams-600 dark:text-teams-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleBrowseSource}
              title="Selecionar outro diretório de trabalho"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-neutral-600 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <FolderOpen className="w-3.5 h-3.5 text-teams-600 dark:text-teams-400" />
              <span className="hidden sm:inline">Outro Diretório...</span>
            </button>
          </div>
        </div>

        {/* Boundary Violation Alert */}
        {!boundaryStatus.isValid && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold">Diretório Fora do Perímetro Autorizado</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">{boundaryStatus.message}</p>
            </div>
          </div>
        )}

        {/* Tabela de Pastas */}
        <div className="border border-slate-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-neutral-900/50">
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-200/70 dark:divide-neutral-700/60">
            {loadingFolders ? (
              <div className="p-8 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-teams-600 dark:text-teams-400" />
                <span>Carregando pastas...</span>
              </div>
            ) : folderError ? (
              <div className="p-6 text-center text-xs text-rose-500 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-rose-500" />
                <p className="font-semibold">{folderError}</p>
                <p className="text-[11px] text-slate-500 mt-1">Verifique o caminho da rede ou permissões de acesso.</p>
              </div>
            ) : filteredFolders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                Nenhuma pasta encontrada{searchQuery ? ` para "${searchQuery}"` : ''}.
              </div>
            ) : (
              filteredFolders.map((f) => {
                const isSelected = selectedPath === f.fullPath;
                return (
                  <div
                    key={f.name}
                    onClick={() => handleSelectFromList(f)}
                    className={`px-4 py-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors select-none ${
                      isSelected
                        ? 'bg-teams-50 dark:bg-teams-950/40 text-teams-900 dark:text-teams-200 border-l-4 border-teams-600 font-semibold'
                        : 'hover:bg-slate-100/70 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="text-teams-600 dark:text-teams-400 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-teams-600 dark:text-teams-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                        )}
                      </div>
                      <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-mono truncate">{f.name}</span>
                    </div>

                    {f.mtime && (
                      <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-4">
                        {f.mtime}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé de Estatísticas da Grade */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Total de pastas listadas: {filteredFolders.length} de {folders.length}</span>
            <span className="font-semibold text-teams-700 dark:text-teams-300">
              {selectedPath ? `Selecionada: ${currentFolderName}` : 'Nenhuma pasta selecionada'}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Formulário de Renomeação da Pasta Selecionada */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-neutral-700/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Definir Novo Nome da Pasta
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedPath
                ? 'Altere a nomenclatura desejada e clique em Renomear Pasta para concluir'
                : 'Selecione uma pasta na lista acima para habilitar a renomeação'}
            </p>
          </div>
          {currentFolderName && (
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-teams-50 dark:bg-teams-950 text-teams-700 dark:text-teams-300 border border-teams-200 dark:border-teams-800 truncate max-w-xs">
              Pasta: {currentFolderName}
            </span>
          )}
        </div>

        <form onSubmit={handleExecuteRename} className="space-y-4 max-w-3xl">
          {/* Caminho Selecionado */}
          {selectedPath && (
            <div className="p-3 bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-700 rounded-xl flex items-center gap-2 overflow-hidden">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Caminho Atual:</span>
              <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate" title={selectedPath}>
                {selectedPath}
              </span>
            </div>
          )}

          {/* Campo de Entrada do Novo Nome */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Novo Nome da Pasta
            </label>
            <input
              type="text"
              disabled={!selectedPath || isRenaming}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={selectedPath ? 'Digite o novo nome da pasta...' : 'Selecione uma pasta na lista acima primeiro'}
              className="w-full p-3 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-medium text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teams-600 focus:ring-1 focus:ring-teams-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Caracteres não permitidos: <code className="font-mono text-[10px] bg-slate-100 dark:bg-neutral-800 px-1 py-0.5 rounded">\ / : * ? " &lt; &gt; |</code>
            </p>
          </div>

          {/* Alertas de Status */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold leading-relaxed">{statusMessage.message}</p>
                {statusMessage.newPath && (
                  <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 opacity-90 truncate max-w-lg">
                    Novo local: {statusMessage.newPath}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800">
            {selectedPath && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isRenaming}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Limpar
              </button>
            )}

            <button
              type="submit"
              disabled={!selectedPath || !newFolderName.trim() || isRenaming || !boundaryStatus.isValid}
              className="px-6 py-2.5 bg-teams-600 hover:bg-teams-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isRenaming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Renomeando...</span>
                </>
              ) : (
                <>
                  <FolderCheck className="w-4 h-4" />
                  <span>Renomear Pasta</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
