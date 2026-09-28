import React, { useState, useEffect } from 'react';
import { Building2, FolderPlus, CheckCircle2, AlertTriangle, Loader2, Sparkles, Plus, Trash2, Layers } from 'lucide-react';

import { ToastData } from '../layout/ToastNotification';

interface FolderCreationViewProps {
  onCreateFolder: (company: string, folderName: string) => Promise<{ success: boolean; folderName?: string; finalPath?: string; durationSeconds?: number; error?: string }>;
  onShowToast?: (data: ToastData) => void;
}

export const FolderCreationView: React.FC<FolderCreationViewProps> = ({ onCreateFolder, onShowToast }) => {
  const [selectedCompany, setSelectedCompany] = useState<string>('RTO');
  const [companies, setCompanies] = useState<Record<string, any>>({});
  const [folderNames, setFolderNames] = useState<string[]>(['']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    window.electronAPI?.getConfig().then((cfg) => {
      if (cfg) {
        setCompanies(cfg);
        const keys = Object.keys(cfg).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword');
        if (keys.length > 0 && !keys.includes(selectedCompany)) {
          setSelectedCompany(keys.includes('RTO') ? 'RTO' : keys[0]);
        }
      }
    });

    const unsub = window.electronAPI?.onConfigUpdated?.((updatedCfg) => {
      if (updatedCfg) {
        setCompanies(updatedCfg);
        const keys = Object.keys(updatedCfg).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword');
        if (keys.length > 0 && !keys.includes(selectedCompany)) {
          setSelectedCompany(keys.includes('RTO') ? 'RTO' : keys[0]);
        }
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, [selectedCompany]);

  const companyKeys = Object.keys(companies).filter(
    (k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword'
  );

  const handleAddFolderRow = () => {
    setFolderNames((prev) => [...prev, '']);
  };

  const handleRemoveFolderRow = (index: number) => {
    setFolderNames((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFolderNameChange = (index: number, val: string) => {
    setFolderNames((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validNames = folderNames.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0 || isProcessing) return;

    // Verificar duplicatas no lote
    const uniqueNames = Array.from(new Set(validNames));
    if (uniqueNames.length !== validNames.length) {
      setLastResult({
        success: false,
        message: 'Existem nomes duplicados na lista de criação. Cada pasta deve ter um nome único.',
      });
      return;
    }

    setIsProcessing(true);
    setLastResult(null);

    const compDisplay = companies[selectedCompany]?.companyName || selectedCompany;

    // Disparo concorrente / paralelo de todas as pastas simultaneamente via Promise.all
    const results = await Promise.all(
      validNames.map(async (name) => {
        const res = await onCreateFolder(selectedCompany, name);
        return { name, res };
      })
    );

    setIsProcessing(false);

    const successful = results.filter((r) => r.res.success);
    const failed = results.filter((r) => !r.res.success);

    if (successful.length > 0) {
      // Invalida o cache local para que as abas Mover e Renomear atualizem imediatamente
      try {
        const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('fw_folders_cache_'));
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }

    if (failed.length === 0) {
      // Todas criadas com sucesso
      const successMsg =
        successful.length === 1
          ? `Pasta '${successful[0].name}' criada com sucesso na rede da ${compDisplay}!`
          : `${successful.length} pastas criadas com sucesso na rede da ${compDisplay} (criação paralela simultânea)!`;

      setLastResult({ success: true, message: successMsg });
      setFolderNames(['']);

      // Dispara o Toast animado de 10s no canto da tela
      if (onShowToast) {
        const destParent = companies[selectedCompany]?.destSharePath || companies[selectedCompany]?.destinationParentPath || '';
        const primary = successful[0];
        const fullCreatedPath = primary.res.finalPath || (destParent ? `${destParent}\\${primary.name}` : undefined);
        onShowToast({
          id: `toast_create_${Date.now()}`,
          type: 'creation',
          title: successful.length === 1 ? 'Pasta Criada com Sucesso!' : `${successful.length} Pastas Criadas com Sucesso!`,
          folderName: successful.length === 1 ? primary.name : `${primary.name} (+${successful.length - 1} pastas)`,
          folderPath: fullCreatedPath,
          durationSeconds: primary.res.durationSeconds || 1,
          company: compDisplay,
          undoOrRedoLabel: 'Recriar',
          onUndoOrRedo: () => {
            setFolderNames(successful.map((s) => s.name));
          },
        });
      }
    } else {
      // Algumas ou todas falharam
      if (successful.length > 0) {
        setLastResult({
          success: false,
          message: `${successful.length} pastas criadas com sucesso. Porém, ${failed.length} falharam: ${failed
            .map((f) => `'${f.name}': ${f.res.error}`)
            .join('; ')}`,
        });
        setFolderNames(failed.map((f) => f.name));
      } else {
        setLastResult({
          success: false,
          message: `Falha ao criar pastas: ${failed.map((f) => `'${f.name}': ${f.res.error}`).join('; ')}`,
        });
      }
    }
  };

  const validCount = folderNames.filter((n) => n.trim()).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 transition-colors select-none">
      {/* Card Principal de Criação */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm relative overflow-hidden">
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                      onClick={() => setSelectedCompany(key)}
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

          {/* Nome da Pasta / Criação Múltipla Dinâmica */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {folderNames.length > 1 ? `Nomes das Pastas (${folderNames.length})` : 'Nome da Pasta'}
              </label>
              {folderNames.length > 1 && (
                <span className="text-[11px] font-semibold text-teams-600 dark:text-teams-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Criação simultânea multitarefa</span>
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {folderNames.map((name, index) => {
                const isLast = index === folderNames.length - 1;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleFolderNameChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (isLast && name.trim()) {
                              handleAddFolderRow();
                            } else if (!isLast) {
                              handleSubmit(e);
                            }
                          }
                        }}
                        placeholder={
                          folderNames.length > 1
                            ? `Pasta #${index + 1}: Ex.: 000${index + 1} - CLIENTE EXEMPLO LTDA`
                            : 'Ex.: 0001 - CLIENTE EXEMPLO LTDA'
                        }
                        disabled={isProcessing}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teams-500 text-sm font-medium transition-all"
                      />

                      {/* Botão de + no final da barra de texto */}
                      {isLast && (
                        <button
                          type="button"
                          onClick={handleAddFolderRow}
                          disabled={isProcessing}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-teams-600 hover:bg-teams-700 active:bg-teams-800 text-white shadow-xs transition-all flex items-center justify-center cursor-pointer"
                          title="Adicionar mais uma pasta para criação simultânea (+)"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Botão de remover se houver mais de uma linha */}
                    {folderNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFolderRow(index)}
                        disabled={isProcessing}
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
                {folderNames.length > 1
                  ? 'Todas as pastas acima serão criadas simultaneamente na rede em tarefas paralelas multithread.'
                  : 'Digite o nome desejado. Use o botão + no final da barra para criar múltiplas pastas de uma vez.'}
              </span>
            </p>
          </div>

          {/* Feedback de Resultado */}
          {lastResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                lastResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
              }`}
            >
              {lastResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">{lastResult.message}</div>
            </div>
          )}

          {/* Botão de Criação */}
          <button
            type="submit"
            disabled={validCount === 0 || isProcessing}
            className="w-full py-3 px-5 rounded-xl bg-teams-600 hover:bg-teams-700 active:bg-teams-800 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-teams-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {validCount > 1
                    ? `Criando ${validCount} pastas simultaneamente na rede...`
                    : 'Criando estrutura de pastas...'}
                </span>
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                <span>
                  {validCount > 1
                    ? `Criar ${validCount} Pastas Simultâneas`
                    : 'Criar Pasta'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

