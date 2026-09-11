import React, { useState, useEffect } from 'react';
import { Wrench, PackageCheck, AlertCircle, Sparkles, Building2, Server, Shield, FolderOpen, KeyRound, CheckCircle2 } from 'lucide-react';

export const MSIBuilderView: React.FC = () => {
  const [config, setConfig] = useState<any>({
    RELIQUIA: {
      name: 'RELIQUIA',
      sourcePath: '\\\\192.168.1.242\\gpo\\criarpastas_paralegal\\MODELO',
      destinationParentPath: '\\\\192.168.1.242\\reliquia-arquivos\\CLIENTES\\EMPRESAS',
      adServerIp: '192.168.1.242',
      domainUser: 'RELIQUIA\\pasta.paralegal',
      adPass: 'Mestre@300'
    },
    RTO: {
      name: 'RTO',
      sourcePath: '\\\\192.168.50.102\\gpo\\criarpastas_paralegal\\MODELO',
      destinationParentPath: '\\\\192.168.50.102\\rto\\CLIENTES\\EMPRESAS',
      adServerIp: '192.168.50.102',
      domainUser: 'RTO\\pasta.paralegal',
      adPass: 'Mestre@300'
    }
  });

  const [outputMsiName, setOutputMsiName] = useState<string>('FolderWorks.msi');
  const [building, setBuilding] = useState<boolean>(false);
  const [buildResult, setBuildResult] = useState<{ success: boolean; msiPath?: string; error?: string } | null>(null);

  useEffect(() => {
    window.electronAPI?.getConfig().then((loaded) => {
      if (loaded) {
        const copy = { ...loaded };
        delete copy.isLockedByMSI;
        setConfig(copy);
      }
    });
  }, []);

  const handleBuildMSI = async () => {
    setBuilding(true);
    setBuildResult(null);

    try {
      const res = await window.electronAPI?.buildCustomMSI({ config, outputMsiName });
      setBuildResult(res || { success: false, error: 'Sem resposta do gerador.' });
    } catch (e: any) {
      setBuildResult({ success: false, error: e.message || 'Erro inesperado na geração.' });
    } finally {
      setBuilding(false);
    }
  };

  const updateCompanyField = (companyKey: string, field: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      [companyKey]: {
        ...prev[companyKey],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-cyan-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <Wrench className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-mono font-bold">
              GERADOR DE INSTALADORES EMBUTIDOS
            </span>
            <h3 className="text-xl font-black text-slate-100 mt-1 tracking-tight flex items-center gap-2">
              <span>Gerador de Pacotes MSI Personalizados</span>
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Personalize abaixo todas as variáveis de ambiente, caminhos de rede e contas do AD para qualquer empresa. 
              Ao clicar em <strong>Gerar Pacote MSI Personalizado</strong>, um instalador autossuficiente será compilado e salvo na sua Área de Trabalho já com todas as credenciais e rotas embutidas de fábrica!
            </p>
          </div>

          <button
            onClick={handleBuildMSI}
            disabled={building}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
          >
            {building ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Compilando MSI...</span>
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                <span>🔨 GERAR PACOTE MSI PERSONALIZADO</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Build Results Notification */}
      {buildResult && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg ${buildResult.success ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/60 border-rose-500/50 text-rose-300'}`}>
          <div className="flex items-center gap-3">
            {buildResult.success ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertCircle className="w-6 h-6 text-rose-400" />}
            <div>
              <h4 className="font-bold text-sm">
                {buildResult.success ? 'Instalador MSI Gerado com Sucesso!' : 'Falha na Compilação do MSI'}
              </h4>
              <p className="text-xs opacity-90 mt-0.5 font-mono">
                {buildResult.success ? `Arquivo salvo na sua Área de Trabalho: ${buildResult.msiPath}` : buildResult.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Output Name Setting */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-5 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <PackageCheck className="w-4 h-4 text-cyan-400" />
          <span>Nome do Arquivo MSI de Saída</span>
        </div>
        <div className="max-w-md">
          <input
            type="text"
            value={outputMsiName}
            onChange={(e) => setOutputMsiName(e.target.value)}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
            placeholder="FolderWorks.msi"
          />
        </div>
      </div>

      {/* Company Dynamic Cards */}
      {Object.keys(config).map((compKey) => {
        const comp = config[compKey];
        return (
          <div key={compKey} className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-100 tracking-tight">Empresa: {comp.name || compKey}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Servidor AD: {comp.adServerIp}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Nome Identificador da Empresa</span>
                </label>
                <input
                  type="text"
                  value={comp.name || ''}
                  onChange={(e) => updateCompanyField(compKey, 'name', e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>IP do Servidor Controlador do Active Directory</span>
                </label>
                <input
                  type="text"
                  value={comp.adServerIp || ''}
                  onChange={(e) => updateCompanyField(compKey, 'adServerIp', e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Caminho do Modelo GPO (Origem UNC)</span>
                </label>
                <input
                  type="text"
                  value={comp.sourcePath || ''}
                  onChange={(e) => updateCompanyField(compKey, 'sourcePath', e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Caminho de Destino dos Clientes (Destino UNC)</span>
                </label>
                <input
                  type="text"
                  value={comp.destinationParentPath || ''}
                  onChange={(e) => updateCompanyField(compKey, 'destinationParentPath', e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Usuário do Active Directory (Domain User)</span>
                </label>
                <input
                  type="text"
                  value={comp.domainUser || ''}
                  onChange={(e) => updateCompanyField(compKey, 'domainUser', e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Senha do Active Directory</span>
                </label>
                <input
                  type="password"
                  value={comp.adPass || ''}
                  onChange={(e) => updateCompanyField(compKey, 'adPass', e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
