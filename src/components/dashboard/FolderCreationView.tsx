import React, { useState } from 'react';
import { Building2, FolderPlus, Terminal, Trash2, CheckCircle2, AlertTriangle, Layers, Loader2, Sparkles } from 'lucide-react';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Selection Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Card */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Criar Nova Pasta de Cliente</h3>
              <p className="text-xs text-slate-400">Selecione a empresa e digite o código/nome do cliente</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Empresa de Destino</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCompany('RELIQUIA')}
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    selectedCompany === 'RELIQUIA'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>RELIQUIA (192.168.100.30)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCompany('RTO')}
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    selectedCompany === 'RTO'
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border-purple-500/50 text-purple-300 shadow-md shadow-purple-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>RTO (192.168.50.102)</span>
                </button>
              </div>
            </div>

            {/* Folder Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Nome da Pasta do Cliente (Exemplo: <span className="font-mono text-cyan-400">10572 - AERO 0010</span>)
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Exemplo: 10572 - AERO 0010"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
            </div>

            {/* Status Feedback Banner */}
            {lastResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  lastResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {lastResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="whitespace-pre-wrap font-sans leading-relaxed">{lastResult.message}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!folderName.trim() || isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Transmitindo Estrutura Robocopy sob Token 'pasta.paralegal'...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Criar Estrutura de Pastas de Rede</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Model Preview Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-bold text-slate-200">Subpastas Modelo (GPO)</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              As 7 subpastas e permissões NTFS serão replicadas automaticamente:
            </p>

            <div className="space-y-2">
              {subfolders.map((sf) => (
                <div key={sf.name} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-cyan-300">{sf.name}</span>
                  <span className="text-[11px] text-slate-500 truncate max-w-[160px]">{sf.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Live Logs */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-200">Terminal de Logs em Tempo Real</h4>
          </div>

          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Logs</span>
          </button>
        </div>

        <div className="h-64 bg-slate-950 rounded-xl border border-slate-800/90 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <span className="text-slate-600 italic">Nenhum log registrado ainda nesta sessão...</span>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`${
                  log.includes('[ERRO') || log.includes('[ABORTADO')
                    ? 'text-rose-400 font-semibold'
                    : log.includes('[SUCESSO') || log.includes('[VALIDAÇÃO AD')
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-300'
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
