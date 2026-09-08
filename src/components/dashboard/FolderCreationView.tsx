import React, { useState } from 'react';
import { Building2, FolderPlus, Terminal, Trash2, CheckCircle2, AlertTriangle, Layers, Loader2, Sparkles } from 'lucide-react';
import { Building2, FolderPlus, Terminal, Trash2, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

interface FolderCreationViewProps {
  logs: string[];
  onClearLogs: () => void;
  onCreateFolder: (company: 'RELIQUIA' | 'RTO', folderName: string) => Promise<{ success: boolean; error?: string }>;
}

export const FolderCreationView: React.FC<FolderCreationViewProps> = ({ logs, onClearLogs, onCreateFolder }) => {
  const [selectedCompany, setSelectedCompany] = useState<'RELIQUIA' | 'RTO'>('RELIQUIA');
  const [folderName, setFolderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  const subfolders = [
    { name: 'CONTABILIDADE', desc: 'Livros diários, balancetes e lançamentos contábeis' },
    { name: 'DP', desc: 'Folha de pagamento, contratações e guias sociais' },
    { name: 'EXPEDIÇÃO', desc: 'Documentos fiscais de expedição e transporte' },
    { name: 'FISCAL', desc: 'Notas fiscais de entrada/saída e apuração de impostos' },
    { name: 'PARALEGAL', desc: 'Contratos sociais, alterações e certidões negativas' },
    { name: 'RH', desc: 'Gestão de pessoal, treinamentos e medicina do trabalho' },
    { name: 'SPED', desc: 'Arquivos de obrigações acessórias eletrônicas' },
  ];

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
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Banner / Selection Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Card */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm relative overflow-hidden">
      {/* Selection Form Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Criar Nova Pasta de Cliente</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Selecione a empresa e digite o código/nome do cliente</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Empresa de Destino</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCompany('RELIQUIA')}
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    selectedCompany === 'RELIQUIA'
                      ? 'bg-teams-50 dark:bg-teams-950/60 border-teams-500 text-teams-700 dark:text-teams-300 shadow-sm'
                      : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>RELIQUIA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCompany('RTO')}
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    selectedCompany === 'RTO'
                      ? 'bg-teams-50 dark:bg-teams-950/60 border-teams-500 text-teams-700 dark:text-teams-300 shadow-sm'
                      : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>RTO</span>
                </button>
              </div>
            </div>

            {/* Folder Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nome da Pasta do Cliente (Exemplo: <span className="font-mono text-teams-600 dark:text-teams-400">10572 - AERO 0010</span>)
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Exemplo: 10572 - AERO 0010"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-teams-500 transition-all font-mono"
              />
            </div>

            {/* Status Feedback Banner */}
            {lastResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  lastResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
                }`}
              >
                {lastResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="whitespace-pre-wrap font-sans leading-relaxed">{lastResult.message}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!folderName.trim() || isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-teams-600 hover:bg-teams-700 text-white font-semibold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Criando pastas no servidor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Criar Pastas</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Model Preview Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Layers className="w-5 h-5 text-teams-600 dark:text-teams-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Subpastas Padrão</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              As seguintes subpastas serão criadas automaticamente:
            </p>

            <div className="space-y-2">
              {subfolders.map((sf) => (
                <div key={sf.name} className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-teams-600 dark:text-teams-400">{sf.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{sf.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Live Logs */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-teams-600 dark:text-teams-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Registro de Atividades</h4>
          </div>

          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Logs</span>
          </button>
        </div>

        <div className="h-64 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-700 p-4 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <span className="text-slate-400 italic">Nenhum log registrado ainda nesta sessão...</span>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`${
                  log.includes('[ERRO') || log.includes('[ABORTADO')
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : log.includes('[SUCESSO') || log.includes('[VALIDAÇÃO AD')
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
