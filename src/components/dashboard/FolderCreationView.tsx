import React, { useState } from 'react';
import { Building2, FolderPlus, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

interface FolderCreationViewProps {
  onCreateFolder: (company: 'RELIQUIA' | 'RTO', folderName: string) => Promise<{ success: boolean; error?: string }>;
}

export const FolderCreationView: React.FC<FolderCreationViewProps> = ({ onCreateFolder }) => {
  const [selectedCompany, setSelectedCompany] = useState<'RELIQUIA' | 'RTO'>('RELIQUIA');
  const [folderName, setFolderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastResult(null);

    const res = await onCreateFolder(selectedCompany, folderName);
    setIsProcessing(false);

    if (res.success) {
      setLastResult({ success: true, message: `Pasta '${folderName}' criada com sucesso na rede da ${selectedCompany}!` });
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
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Criar Nova Pasta de Cliente</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A pasta raiz e as 7 subpastas departamentais serão configuradas automaticamente no servidor de arquivos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Empresa */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Selecione o Servidor / Empresa
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedCompany('RELIQUIA')}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  selectedCompany === 'RELIQUIA'
                    ? 'border-teams-600 bg-teams-50/50 dark:bg-teams-950/40 text-teams-700 dark:text-teams-300 ring-2 ring-teams-600/20 shadow-xs'
                    : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedCompany === 'RELIQUIA' ? 'bg-teams-600 text-white' : 'bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-slate-400'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">RELIQUIA</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Servidor Primário</div>
                  </div>
                </div>
                {selectedCompany === 'RELIQUIA' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-teams-600 dark:bg-teams-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedCompany('RTO')}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  selectedCompany === 'RTO'
                    ? 'border-teams-600 bg-teams-50/50 dark:bg-teams-950/40 text-teams-700 dark:text-teams-300 ring-2 ring-teams-600/20 shadow-xs'
                    : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedCompany === 'RTO' ? 'bg-teams-600 text-white' : 'bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-slate-400'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">RTO</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Servidor Filial</div>
                  </div>
                </div>
                {selectedCompany === 'RTO' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-teams-600 dark:bg-teams-400" />
                )}
              </button>
            </div>
          </div>

          {/* Nome da Pasta / Cliente */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Nome ou Código da Nova Pasta
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
              <span>Dica: utilize o padrão cadastral do escritório para facilitar a localização futura.</span>
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
                <span>Criando pastas no servidor...</span>
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                <span>Criar Pasta de Cliente</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
