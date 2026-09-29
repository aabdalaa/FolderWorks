import React, { useState, useEffect } from 'react';
import {
  Building2,
  FolderPlus,
  Folder,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';

import { ToastData } from '../layout/ToastNotification';
import { getCompanyKeys } from '../../utils/configUtils';

interface FolderCreationViewProps {
  onCreateFolder: (
    company: string,
    folderName: string
  ) => Promise<{ success: boolean; folderName?: string; finalPath?: string; durationSeconds?: number; error?: string }>;
  onCreateEmptyFolder: (
    company: string,
    folderName: string
  ) => Promise<{ success: boolean; folderName?: string; finalPath?: string; durationSeconds?: number; error?: string }>;
  onShowToast?: (data: ToastData) => void;
  selectedCompany?: string;
  onCompanyChange?: (company: string) => void;
}

export const FolderCreationView: React.FC<FolderCreationViewProps> = ({
  onCreateFolder,
  onCreateEmptyFolder,
  onShowToast,
  selectedCompany: propSelectedCompany,
  onCompanyChange,
}) => {
  const [selectedCompany, setSelectedCompany] = useState<string>(propSelectedCompany || '');
  const [companies, setCompanies] = useState<Record<string, any>>({});

  useEffect(() => {
    if (propSelectedCompany) {
      setSelectedCompany(propSelectedCompany);
    }
  }, [propSelectedCompany]);

  // Estado para Criar Pasta com Modelo (Card Superior)
  const [modelFolderNames, setModelFolderNames] = useState<string[]>(['']);
  const [isProcessingModel, setIsProcessingModel] = useState(false);
  const [lastModelResult, setLastModelResult] = useState<{ success: boolean; message: string } | null>(null);

  // Estado para Criar Pasta Vazia (Card Inferior)
  const [emptyFolderNames, setEmptyFolderNames] = useState<string[]>(['']);
  const [isProcessingEmpty, setIsProcessingEmpty] = useState(false);
  const [lastEmptyResult, setLastEmptyResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    window.electronAPI?.getConfig().then((cfg) => {
      if (cfg) {
        setCompanies(cfg);
        const keys = getCompanyKeys(cfg);
        if (keys.length > 0 && !keys.includes(selectedCompany)) {
          setSelectedCompany(keys[0]);
        }
      }
    });

    const unsub = window.electronAPI?.onConfigUpdated?.((updatedCfg) => {
      if (updatedCfg) {
        setCompanies(updatedCfg);
        const keys = getCompanyKeys(updatedCfg);
        if (keys.length > 0 && !keys.includes(selectedCompany)) {
          setSelectedCompany(keys[0]);
        }
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, [selectedCompany]);

  const companyKeys = getCompanyKeys(companies);

  const invalidateCache = () => {
    try {
      const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('fw_folders_cache_'));
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  };

  // --- Handlers: Card 1 (Criar Pasta com Modelo) ---
  const handleAddModelRow = () => {
    setModelFolderNames((prev) => [...prev, '']);
  };

  const handleRemoveModelRow = (index: number) => {
    setModelFolderNames((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleModelNameChange = (index: number, value: string) => {
    setModelFolderNames((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleSubmitModel = async (e: React.FormEvent) => {
    e.preventDefault();
    const validNames = modelFolderNames.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0 || isProcessingModel) return;

    // Checagem de nomes duplicados na lista
    const uniqueSet = new Set(validNames.map((n) => n.toUpperCase()));
    if (uniqueSet.size < validNames.length) {
      setLastModelResult({
        success: false,
        message: 'A lista contém nomes duplicados. Verifique antes de criar.',
      });
      return;
    }

    setIsProcessingModel(true);
    setLastModelResult(null);

    const compDisplay = companies[selectedCompany]?.companyName || selectedCompany;
    const destParent =
      companies[selectedCompany]?.destSharePath || companies[selectedCompany]?.destinationParentPath || '';

    // Disparo concorrente paralelo com Promise.all
    const results = await Promise.all(
      validNames.map(async (name) => {
        const res = await onCreateFolder(selectedCompany, name);
        return { name, res };
      })
    );

    setIsProcessingModel(false);
    invalidateCache();

    const successful = results.filter((r) => r.res && r.res.success);
    const failed = results.filter((r) => !r.res || !r.res.success);

    // Disparar toasts para as pastas criadas com sucesso
    if (onShowToast) {
      successful.forEach(({ name, res }) => {
        const fullCreatedPath = res.finalPath || (destParent ? `${destParent}\\${name}` : undefined);
        onShowToast({
          id: `toast_model_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'creation',
          title: 'Pasta Criada com Sucesso!',
          folderName: name,
          folderPath: fullCreatedPath,
          durationSeconds: res.durationSeconds || 1,
          company: compDisplay,
          undoOrRedoLabel: 'Recriar',
          onUndoOrRedo: () => {
            setModelFolderNames([name]);
          },
        });
      });
    }

    if (failed.length === 0) {
      setLastModelResult({
        success: true,
        message:
          validNames.length === 1
            ? `Pasta '${validNames[0]}' criada com sucesso na rede da ${compDisplay}!`
            : `Todas as ${validNames.length} pastas foram criadas com sucesso na rede da ${compDisplay}!`,
      });
      setModelFolderNames(['']);
    } else if (successful.length > 0) {
      setLastModelResult({
        success: false,
        message: `${successful.length} pastas criadas com sucesso. Porém, ${failed.length} falharam: ${failed
          .map((f) => `'${f.name}': ${f.res.error}`)
          .join('; ')}`,
      });
      setModelFolderNames(failed.map((f) => f.name));
    } else {
      setLastModelResult({
        success: false,
        message: `Falha ao criar pastas: ${failed.map((f) => `'${f.name}': ${f.res.error}`).join('; ')}`,
      });
    }
  };

  // --- Handlers: Card 2 (Criar Pasta Vazia) ---
  const handleAddEmptyRow = () => {
    setEmptyFolderNames((prev) => [...prev, '']);
  };

  const handleRemoveEmptyRow = (index: number) => {
    setEmptyFolderNames((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleEmptyNameChange = (index: number, value: string) => {
    setEmptyFolderNames((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleSubmitEmpty = async (e: React.FormEvent) => {
    e.preventDefault();
    const validNames = emptyFolderNames.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0 || isProcessingEmpty) return;

    // Checagem de nomes duplicados na lista
    const uniqueSet = new Set(validNames.map((n) => n.toUpperCase()));
    if (uniqueSet.size < validNames.length) {
      setLastEmptyResult({
        success: false,
        message: 'A lista de pastas vazias contém nomes duplicados. Verifique antes de prosseguir.',
      });
      return;
    }

    setIsProcessingEmpty(true);
    setLastEmptyResult(null);

    const compDisplay = companies[selectedCompany]?.companyName || selectedCompany;
    const destParent =
      companies[selectedCompany]?.destSharePath || companies[selectedCompany]?.destinationParentPath || '';

    // Disparo concorrente paralelo com Promise.all
    const results = await Promise.all(
      validNames.map(async (name) => {
        const res = await onCreateEmptyFolder(selectedCompany, name);
        return { name, res };
      })
    );

    setIsProcessingEmpty(false);
    invalidateCache();

    const successful = results.filter((r) => r.res && r.res.success);
    const failed = results.filter((r) => !r.res || !r.res.success);

    // Disparar toasts para as pastas vazias criadas
    if (onShowToast) {
      successful.forEach(({ name, res }) => {
        const fullCreatedPath = res.finalPath || (destParent ? `${destParent}\\${name}` : undefined);
        onShowToast({
          id: `toast_empty_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'creation',
          title: 'Pasta Vazia Criada com Sucesso!',
          folderName: name,
          folderPath: fullCreatedPath,
          durationSeconds: res.durationSeconds || 1,
          company: compDisplay,
          undoOrRedoLabel: 'Recriar',
          onUndoOrRedo: () => {
            setEmptyFolderNames([name]);
          },
        });
      });
    }

    if (failed.length === 0) {
      setLastEmptyResult({
        success: true,
        message:
          validNames.length === 1
            ? `Pasta vazia '${validNames[0]}' criada com sucesso na rede da ${compDisplay}!`
            : `Todas as ${validNames.length} pastas vazias foram criadas com sucesso na rede da ${compDisplay}!`,
      });
      setEmptyFolderNames(['']);
    } else if (successful.length > 0) {
      setLastEmptyResult({
        success: false,
        message: `${successful.length} pastas vazias criadas. Porém, ${failed.length} falharam: ${failed
          .map((f) => `'${f.name}': ${f.res.error}`)
          .join('; ')}`,
      });
      setEmptyFolderNames(failed.map((f) => f.name));
    } else {
      setLastEmptyResult({
        success: false,
        message: `Falha ao criar pastas vazias: ${failed.map((f) => `'${f.name}': ${f.res.error}`).join('; ')}`,
      });
    }
  };

  const validModelCount = modelFolderNames.filter((n) => n.trim()).length;
  const validEmptyCount = emptyFolderNames.filter((n) => n.trim()).length;
  const compDisplay = companies[selectedCompany]?.companyName || selectedCompany;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 transition-colors select-none">
      {/* ========================================================= */}
      {/* CARD 1: CRIAR PASTA (COM MODELO AD)                      */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-neutral-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Criar Pasta</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Copia o modelo de pastas criado no AD para o diretório de destino
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitModel} className="space-y-6">
          {/* Seleção de Empresa */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Selecione a Empresa
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {companyKeys.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-neutral-700 text-center text-xs text-slate-400 col-span-2">
                  Nenhuma empresa cadastrada no momento. Configure uma empresa na aba Configurações.
                </div>
              ) : (
                companyKeys.map((key) => {
                  const isSelected = selectedCompany === key;
                  const comp = companies[key] || {};
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedCompany(key);
                        onCompanyChange?.(key);
                      }}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teams-600 bg-teams-50/50 dark:bg-teams-950/40 text-teams-700 dark:text-teams-300 ring-2 ring-teams-600/20 shadow-xs'
                          : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isSelected
                              ? 'bg-teams-600 text-white'
                              : 'bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="text-left truncate">
                          <div className="font-bold text-sm truncate">{comp.companyName || key}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Estrutura Corporativa
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-teams-600 dark:bg-teams-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Nome da Pasta / Criação Múltipla Dinâmica com Botão + */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {modelFolderNames.length > 1 ? `Nomes das Pastas (${modelFolderNames.length})` : 'Nome da Pasta'}
              </label>
              {modelFolderNames.length > 1 && (
                <span className="text-[11px] font-semibold text-teams-600 dark:text-teams-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Criação simultânea multitarefa</span>
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {modelFolderNames.map((name, index) => {
                const isLast = index === modelFolderNames.length - 1;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleModelNameChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (isLast && name.trim()) {
                              handleAddModelRow();
                            } else if (!isLast) {
                              handleSubmitModel(e);
                            }
                          }
                        }}
                        placeholder={
                          modelFolderNames.length > 1
                            ? `Pasta #${index + 1}: Ex.: 000${index + 1} - CLIENTE EXEMPLO LTDA`
                            : 'Ex.: 0001 - CLIENTE EXEMPLO LTDA'
                        }
                        disabled={isProcessingModel}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teams-500 text-sm font-medium transition-all"
                      />

                      {/* Botão de + no final da barra de texto */}
                      {isLast && (
                        <button
                          type="button"
                          onClick={handleAddModelRow}
                          disabled={isProcessingModel}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-teams-600 hover:bg-teams-700 active:bg-teams-800 text-white shadow-xs transition-all flex items-center justify-center cursor-pointer"
                          title="Adicionar mais uma pasta para criação simultânea (+)"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Botão de remover se houver mais de uma linha */}
                    {modelFolderNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModelRow(index)}
                        disabled={isProcessingModel}
                        className="p-3 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-neutral-800 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-neutral-700 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                        title="Remover esta pasta da lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teams-500" />
              <span>
                {modelFolderNames.length > 1
                  ? 'Todas as pastas acima serão criadas simultaneamente na rede em tarefas paralelas multithread.'
                  : 'Digite o nome desejado. Use o botão + no final da barra para criar múltiplas pastas de uma vez.'}
              </span>
            </p>
          </div>

          {/* Feedback de Resultado */}
          {lastModelResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                lastModelResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
              }`}
            >
              {lastModelResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">{lastModelResult.message}</div>
            </div>
          )}

          {/* Botão de Criação */}
          <button
            type="submit"
            disabled={validModelCount === 0 || isProcessingModel}
            className="w-full py-3 px-5 rounded-xl bg-teams-600 hover:bg-teams-700 active:bg-teams-800 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-teams-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessingModel ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {validModelCount > 1
                    ? `Criando ${validModelCount} pastas simultaneamente na rede...`
                    : 'Criando estrutura de pastas...'}
                </span>
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                <span>
                  {validModelCount > 1 ? `Criar ${validModelCount} Pastas Simultâneas` : 'Criar Pasta'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ========================================================= */}
      {/* CARD 2: CRIAR PASTA VAZIA (NOVA FUNCIONALIDADE v3.0.0)    */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-neutral-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Criar Pasta Vazia</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teams-100 dark:bg-teams-950/80 text-teams-700 dark:text-teams-300 border border-teams-200 dark:border-teams-800/80">
                  {compDisplay}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cria pasta(s) vazia(s) diretamente no diretório de destino da empresa selecionada, sem copiar modelos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitEmpty} className="space-y-6">
          {/* Nome da Pasta Vazia / Criação Múltipla Dinâmica com Botão + */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {emptyFolderNames.length > 1
                  ? `Nomes das Pastas Vazias (${emptyFolderNames.length})`
                  : 'Nome da Pasta Vazia'}
              </label>
              {emptyFolderNames.length > 1 && (
                <span className="text-[11px] font-semibold text-teams-600 dark:text-teams-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Criação simultânea multitarefa</span>
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {emptyFolderNames.map((name, index) => {
                const isLast = index === emptyFolderNames.length - 1;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleEmptyNameChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (isLast && name.trim()) {
                              handleAddEmptyRow();
                            } else if (!isLast) {
                              handleSubmitEmpty(e);
                            }
                          }
                        }}
                        placeholder={
                          emptyFolderNames.length > 1
                            ? `Pasta Vazia #${index + 1}: Ex.: 000${index + 1} - CLIENTE EXEMPLO LTDA`
                            : 'Ex.: 0001 - CLIENTE EXEMPLO LTDA'
                        }
                        disabled={isProcessingEmpty}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teams-500 text-sm font-medium transition-all"
                      />

                      {/* Botão de + no final da barra de texto */}
                      {isLast && (
                        <button
                          type="button"
                          onClick={handleAddEmptyRow}
                          disabled={isProcessingEmpty}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-teams-600 hover:bg-teams-700 active:bg-teams-800 text-white shadow-xs transition-all flex items-center justify-center cursor-pointer"
                          title="Adicionar mais uma pasta vazia para criação simultânea (+)"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Botão de remover se houver mais de uma linha */}
                    {emptyFolderNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEmptyRow(index)}
                        disabled={isProcessingEmpty}
                        className="p-3 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-neutral-800 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-neutral-700 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                        title="Remover esta pasta da lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teams-500" />
              <span>
                {emptyFolderNames.length > 1
                  ? 'Todas as pastas vazias acima serão criadas simultaneamente na rede em tarefas paralelas multithread.'
                  : 'Digite o nome desejado. Use o botão + no final da barra para criar múltiplas pastas vazias de uma vez.'}
              </span>
            </p>
          </div>

          {/* Feedback de Resultado */}
          {lastEmptyResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                lastEmptyResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
              }`}
            >
              {lastEmptyResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">{lastEmptyResult.message}</div>
            </div>
          )}

          {/* Botão de Criação de Pasta Vazia */}
          <button
            type="submit"
            disabled={validEmptyCount === 0 || isProcessingEmpty}
            className="w-full py-3 px-5 rounded-xl bg-teams-600 hover:bg-teams-700 active:bg-teams-800 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-teams-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessingEmpty ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {validEmptyCount > 1
                    ? `Criando ${validEmptyCount} pastas vazias simultaneamente na rede...`
                    : 'Criando pasta vazia na rede...'}
                </span>
              </>
            ) : (
              <>
                <Folder className="w-4 h-4" />
                <span>
                  {validEmptyCount > 1
                    ? `Criar ${validEmptyCount} Pastas Vazias Simultâneas`
                    : 'Criar Pasta Vazia'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

