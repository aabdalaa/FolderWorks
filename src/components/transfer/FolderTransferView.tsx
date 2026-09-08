import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FolderOutput,
  FolderInput,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Trash2,
  FileCheck,
  HardDrive
  HardDrive,
  RotateCcw,
} from 'lucide-react';

interface FolderTransferViewProps {
  logs?: string[];
  onOpenLogs?: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

interface FolderItem {
  name: string;
  fullPath: string;
  mtime?: string;
}

interface TransferResult {
  folderName: string;
  sourcePath: string;
  finalDestPath: string;
  fileCount: number;
  totalSizeMB: number;
  durationSeconds: number;
}

export const FolderTransferView: React.FC<FolderTransferViewProps> = ({ onModalStateChange }) => {
  const [company, setCompany] = useState<'RELIQUIA' | 'RTO'>('RELIQUIA');
  const [config, setConfig] = useState<any>(null);
  
  // Paths
  const [sourceDir, setSourceDir] = useState<string>('');
  const [destDir, setDestDir] = useState<string>('');
  
  // IT Boundary validation
  const [boundaryStatus, setBoundaryStatus] = useState<{ isValid: boolean; allowedBase: string; message: string }>({
    isValid: true,
    allowedBase: '',
    message: '',
  });

  // Folders in source directory
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState<boolean>(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  
  // Search & Selection
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFolderNames, setSelectedFolderNames] = useState<Set<string>>(new Set());

  // Execution & Verification State
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [currentTransferIndex, setCurrentTransferIndex] = useState<number>(0);
  const [currentTransferName, setCurrentTransferName] = useState<string>('');
  const [transferResults, setTransferResults] = useState<TransferResult[]>([]);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Post-Copy Verification & Human Confirmation
  const [showConfirmationPrompt, setShowConfirmationPrompt] = useState<boolean>(false);
  const [isDeletingSource, setIsDeletingSource] = useState<boolean>(false);
  const [deleteCompleted, setDeleteCompleted] = useState<{ count: number; keptOriginals: boolean } | null>(null);
  const [isProcessingDecision, setIsProcessingDecision] = useState<'success' | 'undo' | null>(null);
  const [decisionCompleted, setDecisionCompleted] = useState<{ type: 'success' | 'undo'; count: number } | null>(null);

  useEffect(() => {
    onModalStateChange?.(isTransferring || showConfirmationPrompt);
  }, [isTransferring, showConfirmationPrompt, onModalStateChange]);

  // Load config on mount or company change
  useEffect(() => {
    window.electronAPI?.getConfig().then((allCfg) => {
      setConfig(allCfg);
      const cur = allCfg[company];
      if (cur) {
        const src = cur.defaultSourceFolder || cur.destSharePath;
        setSourceDir(src);
        const fallbackPreset = cur.allowedBasePath ? `${cur.allowedBasePath}\\00 - EX CLIENTES` : `${cur.destSharePath.replace(/\\EMPRESAS$/i, '')}\\00 - EX CLIENTES`;
        const preset = cur.presetDestinations?.[0]?.path || fallbackPreset;
        setDestDir(preset);
        loadSubdirectories(src, company);
        validateBoundary(preset, company);
      }
    });
  }, [company]);

  const validateBoundary = async (targetPath: string, comp: string) => {
    if (!window.electronAPI?.validateBoundary) return;
    const res = await window.electronAPI.validateBoundary({ targetPath, company: comp });
    setBoundaryStatus(res);
  };

  const loadSubdirectories = async (dir: string, comp: string = company) => {
    if (!dir) return;
    setLoadingFolders(true);
    setFolderError(null);
    setSelectedFolderNames(new Set());
    try {
      const res = await window.electronAPI?.listSubdirectories(dir, comp);
      if (res?.success) {
        setFolders(res.folders);
      } else {
        setFolderError(res?.error || 'Erro ao listar pastas.');
        setFolders([]);
      }
    } catch (e: any) {
      setFolderError(e.message || 'Erro inesperado.');
      setFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleBrowseSource = async () => {
    const picked = await window.electronAPI?.selectDirectory(sourceDir);
    if (picked) {
      setSourceDir(picked);
      loadSubdirectories(picked);
    }
  };

  const handleBrowseDest = async () => {
    const picked = await window.electronAPI?.selectDirectory(destDir);
    if (picked) {
      setDestDir(picked);
      validateBoundary(picked, company);
    }
  };

  const handleSelectPreset = (presetPath: string) => {
    setDestDir(presetPath);
    validateBoundary(presetPath, company);
  };

  // Filtered folders (hiding governance/ex-client folders from selectable client list)
  const filteredFolders = useMemo(() => {
    const list = folders.filter((f) => !f.name.startsWith('00 -') && !f.name.startsWith('01 -'));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  const toggleFolder = (name: string) => {
    const next = new Set(selectedFolderNames);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelectedFolderNames(next);
  };

  const handleSelectAllVisible = () => {
    const next = new Set(selectedFolderNames);
    filteredFolders.forEach((f) => next.add(f.name));
    setSelectedFolderNames(next);
  };

  const handleClearSelection = () => {
    setSelectedFolderNames(new Set());
  };

  // 1. Start Safe Transfer
  const handleStartTransfer = async () => {
    if (!boundaryStatus.isValid || selectedFolderNames.size === 0 || isTransferring) return;

    setIsTransferring(true);
    setTransferError(null);
    setTransferResults([]);
    setShowConfirmationPrompt(false);
    setDeleteCompleted(null);
    setDecisionCompleted(null);
    setCurrentTransferIndex(0);

    const selectedList = folders.filter((f) => selectedFolderNames.has(f.name));
    const results: TransferResult[] = [];

    for (let i = 0; i < selectedList.length; i++) {
      const item = selectedList[i];
      setCurrentTransferIndex(i + 1);
      setCurrentTransferName(item.name);

      const res = await window.electronAPI?.safeTransferCopy({
        company,
        sourcePath: item.fullPath,
        destParentPath: destDir,
      });

      if (res?.success) {
        results.push({
          folderName: item.name,
          sourcePath: item.fullPath,
          finalDestPath: res.finalDestPath || `${destDir}\\${item.name}`,
          fileCount: res.destMetrics?.fileCount || 0,
          totalSizeMB: Number(((res.destMetrics?.totalSize || 0) / (1024 * 1024)).toFixed(2)),
          durationSeconds: res.durationSeconds || 0,
        });
      } else {
        setTransferError(res?.error || `Falha ao copiar pasta: ${item.name}`);
        break;
      }
    }

    setIsTransferring(false);

    if (results.length === selectedList.length) {
      setTransferResults(results);
      setShowConfirmationPrompt(true);
    }
  };

  // 2. Interactive Human Decision: Confirm Deletion of Source
  const handleConfirmDeleteSource = async () => {
    setIsDeletingSource(true);
  // 2. Interactive Human Decision: "Deu certo" -> Confirm Success & Delete Source
  const handleConfirmSuccess = async () => {
    setIsProcessingDecision('success');
    const pathsToDelete = transferResults.map((r) => r.sourcePath);
    const delRes = await window.electronAPI?.deleteSourceFolders({
      company,
      foldersToDelete: pathsToDelete,
    });
    setIsDeletingSource(false);
    setIsProcessingDecision(null);

    if (delRes?.success) {
      setDeleteCompleted({ count: delRes.deleted.length, keptOriginals: false });
      setDecisionCompleted({ type: 'success', count: delRes.deleted.length });
      setShowConfirmationPrompt(false);
      setSelectedFolderNames(new Set());
      // Reload source folders after delete
      loadSubdirectories(sourceDir);
    } else {
      setTransferError(delRes?.errors?.join(' | ') || 'Erro ao excluir pastas de origem.');
      setTransferError(delRes?.errors?.join(' | ') || 'Erro ao excluir pastas da origem.');
    }
  };

  // 2. Interactive Human Decision: Keep Original Folders
  const handleKeepOriginals = () => {
    setDeleteCompleted({ count: transferResults.length, keptOriginals: true });
    setShowConfirmationPrompt(false);
    setSelectedFolderNames(new Set());
    loadSubdirectories(sourceDir);
  // 2. Interactive Human Decision: "Não deu certo" -> Undo & Rollback Copied Destination Folders
  const handleUndoTransfer = async () => {
    setIsProcessingDecision('undo');
    const pathsToUndo = transferResults.map((r) => r.finalDestPath);
    const undoRes = await window.electronAPI?.undoTransfer({
      company,
      foldersToUndo: pathsToUndo,
    });
    setIsProcessingDecision(null);

    if (undoRes?.success) {
      setDecisionCompleted({ type: 'undo', count: undoRes.undone.length });
      setShowConfirmationPrompt(false);
      setSelectedFolderNames(new Set());
      loadSubdirectories(sourceDir);
    } else {
      setTransferError(undoRes?.errors?.join(' | ') || 'Erro ao desfazer transferência no destino.');
    }
  };

  const totalFilesCopied = transferResults.reduce((acc, cur) => acc + cur.fileCount, 0);
  const totalSizeCopiedMB = Number(transferResults.reduce((acc, cur) => acc + cur.totalSizeMB, 0).toFixed(2));
  const currentCompanyConfig = config?.[company];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Controls: Company Toggle */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Empresa:</span>
          <div className="flex rounded-lg bg-slate-100 dark:bg-neutral-900 p-1 border border-slate-200 dark:border-neutral-700">
            <button
              onClick={() => setCompany('RELIQUIA')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                company === 'RELIQUIA'
                  ? 'bg-white dark:bg-teams-600 text-teams-700 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>RELIQUIA</span>
            </button>
            <button
              onClick={() => setCompany('RTO')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                company === 'RTO'
                  ? 'bg-white dark:bg-teams-600 text-teams-700 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>RTO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card 1: Seleção de Pastas e Governança de TI */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-700/80 pb-4">
          <div className="w-9 h-9 rounded-lg bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
            <FolderOutput className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Seleção de Pastas e Destino</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escolha o destino e selecione as pastas a serem transferidas.
            </p>
          </div>
        </div>

        {/* Source & Destination Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Source Folder Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-slate-500" />
                <span>Pasta de Origem</span>
                <span>Onde está a pasta?</span>
              </label>
              <button
                onClick={() => loadSubdirectories(sourceDir)}
                className="text-teams-600 dark:text-teams-400 hover:underline flex items-center gap-1 text-[11px] font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${loadingFolders ? 'animate-spin' : ''}`} />
                <span>Recarregar</span>
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={sourceDir}
                onChange={(e) => setSourceDir(e.target.value)}
                onBlur={() => loadSubdirectories(sourceDir, company)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teams-500"
              />
              <button
                type="button"
                onClick={handleBrowseSource}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-neutral-600 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Procurar...</span>
              </button>
            </div>
          </div>

          {/* Destination Folder Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-1.5">
                <FolderInput className="w-4 h-4 text-slate-500" />
                <span>Pasta de Destino</span>
                <span>Para onde vai a pasta?</span>
              </label>
              {!boundaryStatus.isValid && (
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Destino Não Permitido</span>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={destDir}
                onChange={(e) => {
                  setDestDir(e.target.value);
                  validateBoundary(e.target.value, company);
                }}
                className={`flex-1 px-3 py-2 bg-slate-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                  boundaryStatus.isValid
                    ? 'border-slate-200 dark:border-neutral-700 focus:border-teams-500'
                    : 'border-rose-500 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300'
                }`}
              />
              <button
                type="button"
                onClick={handleBrowseDest}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-neutral-600 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Procurar...</span>
              </button>
            </div>

            {/* IT Presets Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Atalhos Rápidos:</span>
              {currentCompanyConfig?.presetDestinations?.map((p: any) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p.path)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                    destDir === p.path
                      ? 'bg-teams-50 dark:bg-teams-950/50 border-teams-400 dark:border-teams-600 text-teams-700 dark:text-teams-300'
                      : 'bg-slate-100 dark:bg-neutral-700/60 border-slate-200 dark:border-neutral-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Boundary Violation Alert */}
        {!boundaryStatus.isValid && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold">Pasta de Destino Inválida</p>
              <p className="font-bold">Local de Destino Inválido</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">{boundaryStatus.message}</p>
            </div>
          </div>
        )}

        {/* Interactive Folder Selection Grid (Zero Typos) */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Selecione as Pastas para Transferência
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teams-100 dark:bg-teams-900/60 text-teams-700 dark:text-teams-300 font-bold">
                {selectedFolderNames.size} selecionada{selectedFolderNames.size === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar cliente por código ou nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teams-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSelectAllVisible}
                disabled={filteredFolders.length === 0}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-neutral-600 transition-colors disabled:opacity-50"
              >
                SELECIONAR TODAS
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                disabled={selectedFolderNames.size === 0}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-neutral-600 transition-colors disabled:opacity-50"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Folder Grid / Table */}
          <div className="border border-slate-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-neutral-900/50">
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-200/70 dark:divide-neutral-700/60">
              {loadingFolders ? (
                <div className="p-8 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-teams-600 dark:text-teams-400" />
                  <span>Carregando pastas do servidor...</span>
                </div>
              ) : folderError ? (
                <div className="p-6 text-center text-xs text-rose-500 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-rose-500" />
                  <p className="font-semibold">{folderError}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Verifique o caminho da rede ou permissões de acesso.</p>
                </div>
              ) : filteredFolders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs italic">
                  Nenhuma pasta encontrada para &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredFolders.map((f) => {
                  const isSelected = selectedFolderNames.has(f.name);
                  return (
                    <div
                      key={f.name}
                      onClick={() => toggleFolder(f.name)}
                      className={`px-4 py-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors select-none ${
                        isSelected
                          ? 'bg-teams-50/80 dark:bg-teams-950/40 text-teams-900 dark:text-teams-200'
                          : 'hover:bg-slate-100/70 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolder(f.name);
                          }}
                          className="text-teams-600 dark:text-teams-400 shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-teams-600 dark:text-teams-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                          )}
                        </button>
                        <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-mono font-medium truncate">{f.name}</span>
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

            {/* Footer Summary of List */}
            <div className="px-4 py-2 bg-slate-100 dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Total de pastas listadas: {filteredFolders.length} de {folders.length}</span>
              <span className="font-semibold text-teams-700 dark:text-teams-300">
                {selectedFolderNames.size} pasta{selectedFolderNames.size === 1 ? '' : 's'} marcada{selectedFolderNames.size === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleStartTransfer}
            disabled={!boundaryStatus.isValid || selectedFolderNames.size === 0 || isTransferring}
            className="px-6 py-3 bg-teams-600 hover:bg-teams-700 dark:bg-teams-600 dark:hover:bg-teams-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransferring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Copiando pasta {currentTransferIndex} de {selectedFolderNames.size}: {currentTransferName}...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Iniciar Transferência ({selectedFolderNames.size} Pasta{selectedFolderNames.size === 1 ? '' : 's'})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card 2: Status e Confirmação da Transferência */}
      {(isTransferring || showConfirmationPrompt || deleteCompleted || transferError) && (
      {(isTransferring || showConfirmationPrompt || decisionCompleted || transferError) && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-700/80 pb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Status e Confirmação da Transferência</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhamento da transferência e confirmação das ações.
              </p>
            </div>
          </div>

          {/* Transfer Error Alert */}
          {transferError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Erro na Execução</p>
                <p className="mt-1 text-[11px]">{transferError}</p>
              </div>
            </div>
          )}

          {/* Final Completed Summary */}
          {deleteCompleted && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs">
          {decisionCompleted && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
                decisionCompleted.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {decisionCompleted.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
                <span>
                  {deleteCompleted.keptOriginals
                    ? `Transferência finalizada: ${deleteCompleted.count} pastas mantidas em ambos os locais.`
                    : `Transferência concluída com sucesso: ${deleteCompleted.count} pastas migradas para o destino e removidas da origem.`}
                  {decisionCompleted.type === 'success'
                    ? `Transferência validada com sucesso! ${decisionCompleted.count} ${decisionCompleted.count === 1 ? 'pasta transferida' : 'pastas transferidas'} e removidas da origem para liberar espaço.`
                    : `Transferência desfeita com sucesso! Os arquivos foram removidos do destino e a pasta original foi mantida 100% intacta na origem.`}
                </span>
              </div>
              <button
                onClick={() => {
                  setDeleteCompleted(null);
                  setDecisionCompleted(null);
                  setSelectedFolderNames(new Set());
                }}
                className="text-teams-600 dark:text-teams-400 hover:underline font-medium"
                className="font-semibold underline hover:opacity-80 transition-opacity ml-4 cursor-pointer"
              >
                Nova Transferência
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. Modal Bloqueante durante Transferência em Execução         */}
      {/* ------------------------------------------------------------- */}
      {isTransferring &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none cursor-default app-no-drag"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teams-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teams-600/20">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Transferência em Andamento...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Copiando arquivos com segurança para o destino...
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Progresso das pastas</span>
                  <span className="font-mono">
                    {currentTransferIndex} de {selectedFolderNames.size}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teams-600 transition-all duration-300"
                    style={{
                      width: `${
                        selectedFolderNames.size
                          ? (currentTransferIndex / selectedFolderNames.size) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate pt-1">
                  Copiando: {currentTransferName}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Modal Central de Confirmação com Fundo Opaco (Backdrop)   */}
      {/* ------------------------------------------------------------- */}
      {showConfirmationPrompt &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none cursor-default app-no-drag"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-b border-emerald-500/20 dark:border-emerald-500/10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Transferência Concluída com Sucesso!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Todas as pastas foram copiadas com sucesso para o destino.
                  </p>
                </div>
              </div>

              {/* Modal Body / Audit Summary */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-neutral-800">
                    <span className="text-slate-500 dark:text-slate-400">Pastas transferidas:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {transferResults.length} {transferResults.length === 1 ? 'pasta' : 'pastas'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Destino:
                    </span>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs font-mono text-teams-600 dark:text-teams-400 break-all select-all flex items-center gap-2">
                      <HardDrive className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>{destDir}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                    {transferResults.map((r) => (
                      <span
                        key={r.folderName}
                        className="px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-neutral-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 truncate max-w-full"
                      >
                        📁 {r.folderName} ({r.durationSeconds}s)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Decision Callout */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                      Confirmação de Exclusão da Origem
                <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-teams-600 dark:text-teams-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Validação do Operador
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      Deseja <strong>excluir as pastas da Origem</strong> agora que a transferência foi concluída, ou prefere <strong>mantê-las</strong> como cópia de segurança?
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      A cópia foi concluída. Por favor, valide se a pasta já está visível no destino correto:
                    </p>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pt-0.5">
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span><strong>Deu certo</strong>: A pasta está no local certo. O sistema apagará a pasta original da origem para liberar espaço.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span><strong>Não deu certo</strong>: O sistema desfaz a transferência imediatamente, limpando a cópia do destino e mantendo a origem intacta.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 pt-0 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-neutral-800/80 bg-slate-50/50 dark:bg-neutral-900/50">
                <button
                  type="button"
                  onClick={handleConfirmDeleteSource}
                  disabled={isDeletingSource}
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 order-2 sm:order-1"
                  onClick={handleConfirmSuccess}
                  disabled={isProcessingDecision !== null}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 order-1 cursor-pointer disabled:opacity-50"
                  title="Confirma que os arquivos estão corretos no destino e autoriza a exclusão da pasta de origem"
                >
                  {isDeletingSource ? (
                  {isProcessingDecision === 'success' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Excluindo da Origem...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Sim, excluir da Origem</span>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Deu certo (Excluir da Origem)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleKeepOriginals}
                  disabled={isDeletingSource}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
                  onClick={handleUndoTransfer}
                  disabled={isProcessingDecision !== null}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-slate-300 dark:border-neutral-700 hover:border-rose-300 dark:hover:border-rose-900 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 order-2 cursor-pointer disabled:opacity-50"
                  title="Desfaz a transferência imediatamente, removendo a cópia do destino e preservando a origem"
                >
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  <span>Não, manter na Origem</span>
                  {isProcessingDecision === 'undo' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                      <span>Desfazendo transferência...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Não deu certo (Desfazer)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
