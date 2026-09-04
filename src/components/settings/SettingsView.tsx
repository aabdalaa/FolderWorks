import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Lock, ShieldCheck } from 'lucide-react';

interface SettingsViewProps {
  onTestConnection: (company: 'RELIQUIA' | 'RTO') => Promise<{ success: boolean; message: string }>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onTestConnection }) => {
  const [config, setConfig] = useState<any>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string } }>({});
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    window.electronAPI?.getConfig().then((cfg) => setConfig(cfg));
  }, []);

  const handleTest = async (company: 'RELIQUIA' | 'RTO') => {
    setTesting((prev) => ({ ...prev, [company]: true }));
    const res = await onTestConnection(company);
    setTestResults((prev) => ({ ...prev, [company]: res }));
    setTesting((prev) => ({ ...prev, [company]: false }));
  };

  if (!config) return <div className="text-xs text-slate-500">Carregando parâmetros corporativos...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Corporate Lock Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Configurações Corporativas do Sistema</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Os caminhos de rede foram pré-configurados na instalação e são gerenciados de forma centralizada.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-700/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Parâmetros de Rede</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Visualização dos diretórios configurados para cada empresa</p>
          </div>
        </div>

        {/* RELIQUIA Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-teams-600 dark:text-teams-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>RELIQUIA</span>
            </h4>
            <button
              onClick={() => handleTest('RELIQUIA')}
              disabled={testing['RELIQUIA']}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg border border-slate-300 dark:border-neutral-600 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing['RELIQUIA'] ? 'animate-spin' : ''}`} />
              <span>Testar Conexão</span>
            </button>
          </div>

          {testResults['RELIQUIA'] && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${testResults['RELIQUIA'].success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
              {testResults['RELIQUIA'].success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{testResults['RELIQUIA'].message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Caminho do Modelo (Origem)</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="text"
                readOnly
                value={config.RELIQUIA?.sourcePath}
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg font-mono text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Caminho de Destino dos Clientes</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="text"
                readOnly
                value={config.RELIQUIA?.destinationParentPath}
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg font-mono text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-neutral-700" />

        {/* RTO Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-teams-600 dark:text-teams-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>RTO</span>
            </h4>
            <button
              onClick={() => handleTest('RTO')}
              disabled={testing['RTO']}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg border border-slate-300 dark:border-neutral-600 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing['RTO'] ? 'animate-spin' : ''}`} />
              <span>Testar Conexão</span>
            </button>
          </div>

          {testResults['RTO'] && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${testResults['RTO'].success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
              {testResults['RTO'].success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{testResults['RTO'].message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Caminho do Modelo (Origem)</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="text"
                readOnly
                value={config.RTO?.sourcePath}
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg font-mono text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Caminho de Destino dos Clientes</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="text"
                readOnly
                value={config.RTO?.destinationParentPath}
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg font-mono text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
