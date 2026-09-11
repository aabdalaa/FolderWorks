import React, { useState, useEffect } from 'react';
import { Building2, FolderPlus, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

interface FolderCreationViewProps {
  onCreateFolder: (company: string, folderName: string) => Promise<{ success: boolean; error?: string }>;
}

export const FolderCreationView: React.FC<FolderCreationViewProps> = ({ onCreateFolder }) => {
  const [selectedCompany, setSelectedCompany] = useState<string>('RTO');
  const [companies, setCompanies] = useState<Record<string, any>>({});
  const [folderName, setFolderName] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastResult(null);

    const compDisplay = companies[selectedCompany]?.companyName || selectedCompany;
    const res = await onCreateFolder(selectedCompany, folderName);
    setIsProcessing(false);

    if (res.success) {
      setLastResult({ success: true, message: `Pasta '${folderName}' criada com sucesso na rede da ${compDisplay}!` });
      setFolderName('');
    } else {
      setLastResult({ success: false, message: res.error || 'Falha ao criar pasta de rede.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-800 dark:text-slate-100 transition-colors select-none">
      {/* Card Principal de Criação */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 p-8 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-neutral-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Criar Nova Pasta</h3>
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

          {/* Nome da Nova Pasta */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Nome da Nova Pasta
            </label>
            <div className="relative">
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ex.: 0001 - CLIENTE EXEMPLO LTDA"
                disabled={isProcessing}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teams-500 text-sm font-medium transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teams-500" />
              <span>Digite o nome desejado para a nova pasta a ser criada.</span>
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
            disabled={!folderName.trim() || isProcessing}
            className="w-full py-3 px-5 rounded-xl bg-teams-600 hover:bg-teams-700 active:bg-teams-800 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-teams-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando estrutura de pastas...</span>
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                <span>Criar Nova Pasta</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
