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
      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between shadow-lg shadow-cyan-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Configurações Protegidas por Política de Segurança Corporativa (MSI)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                EMBUTIDO NO MSI
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Os caminhos de rede e usuários do AD foram pré-configurados de fábrica no instalador e estão travados para usuários comuns.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Parâmetros de Rede & Servidores Active Directory</h3>
            <p className="text-xs text-slate-400">Visualização de compartilhamentos UNC, rotas de modelos e endereços IP</p>
          </div>
        </div>

        {/* RELIQUIA Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>RELIQUIA ({config.RELIQUIA?.adServerIp})</span>
            </h4>
            <button
              onClick={() => handleTest('RELIQUIA')}
              disabled={testing['RELIQUIA']}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing['RELIQUIA'] ? 'animate-spin' : ''}`} />
              <span>Testar Conexão IP</span>
            </button>
          </div>

          {testResults['RELIQUIA'] && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${testResults['RELIQUIA'].success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {testResults['RELIQUIA'].success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{testResults['RELIQUIA'].message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-400 mb-1 flex items-center justify-between">
                <span>Caminho do Modelo GPO (Origem)</span>
                <Lock className="w-3 h-3 text-slate-500" />
              </label>
              <input
                type="text"
                readOnly
                value={config.RELIQUIA?.sourcePath}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg font-mono text-slate-300 cursor-not-allowed select-all"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1 flex items-center justify-between">
                <span>Caminho de Destino dos Clientes</span>
                <Lock className="w-3 h-3 text-slate-500" />
              </label>
              <input
                type="text"
                readOnly
                value={config.RELIQUIA?.destinationParentPath}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg font-mono text-slate-300 cursor-not-allowed select-all"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-800/80" />

        {/* RTO Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>RTO ({config.RTO?.adServerIp})</span>
            </h4>
            <button
              onClick={() => handleTest('RTO')}
              disabled={testing['RTO']}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing['RTO'] ? 'animate-spin' : ''}`} />
              <span>Testar Conexão IP</span>
            </button>
          </div>

          {testResults['RTO'] && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${testResults['RTO'].success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {testResults['RTO'].success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{testResults['RTO'].message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-400 mb-1 flex items-center justify-between">
                <span>Caminho do Modelo GPO (Origem)</span>
                <Lock className="w-3 h-3 text-slate-500" />
              </label>
              <input
                type="text"
                readOnly
                value={config.RTO?.sourcePath}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg font-mono text-slate-300 cursor-not-allowed select-all"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1 flex items-center justify-between">
                <span>Caminho de Destino dos Clientes</span>
                <Lock className="w-3 h-3 text-slate-500" />
              </label>
              <input
                type="text"
                readOnly
                value={config.RTO?.destinationParentPath}
                className="w-full p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg font-mono text-slate-300 cursor-not-allowed select-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
