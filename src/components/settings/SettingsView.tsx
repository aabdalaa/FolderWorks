import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  FolderOpen,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  AlertTriangle,
  FolderTree,
  FolderOutput,
} from 'lucide-react';
import { TIAccessModal } from '../logs/TIAccessModal';

interface SettingsViewProps {
  onTestConnection: (company: string) => Promise<{ success: boolean; message: string }>;
  isTIAuthenticated?: boolean;
  onUnlockTI?: () => void;
  onLockTI?: () => void;
}

interface ShortcutItem {
  name: string;
  path: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onTestConnection,
  isTIAuthenticated: externalIsTIAuth,
  onUnlockTI,
  onLockTI,
}) => {
  const [config, setConfig] = useState<any>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string } }>({});
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});

  // TI Authentication & Edit Mode State
  const [isTIUnlocked, setIsTIUnlocked] = useState<boolean>(!!externalIsTIAuth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Active Company Tab in Settings
  const [activeCompanyTab, setActiveCompanyTab] = useState<string>('');

  // UI Feedback States
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  // Modals
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync external TI authentication state
  useEffect(() => {
    if (externalIsTIAuth !== undefined) {
      setIsTIUnlocked(externalIsTIAuth);
    }
  }, [externalIsTIAuth]);

  // Load config on mount
  useEffect(() => {
    window.electronAPI?.getConfig().then((cfg) => {
      setConfig(cfg);
      const keys = getCompanyKeys(cfg);
      if (keys.length > 0 && !activeCompanyTab) {
        setActiveCompanyTab(keys[0]);
      }
    });

    const unsub = window.electronAPI?.onConfigUpdated?.((updatedCfg) => {
      setConfig(updatedCfg);
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const getCompanyKeys = (cfg: any): string[] => {
    if (!cfg || typeof cfg !== 'object') return [];
    return Object.keys(cfg).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword');
  };

  const companyKeys = getCompanyKeys(config);

  // Ensure activeCompanyTab is valid
  useEffect(() => {
    if (companyKeys.length > 0 && (!activeCompanyTab || !companyKeys.includes(activeCompanyTab))) {
      setActiveCompanyTab(companyKeys[0]);
    }
  }, [companyKeys, activeCompanyTab]);

  const handleTest = async (compKey: string) => {
    setTesting((prev) => ({ ...prev, [compKey]: true }));
    const res = await onTestConnection(compKey);
    setTestResults((prev) => ({ ...prev, [compKey]: res }));
    setTesting((prev) => ({ ...prev, [compKey]: false }));
  };

  const handleBrowseFolder = async (compKey: string, fieldKey: string, currentVal: string) => {
    if (!isTIUnlocked) return;
    const selected = await window.electronAPI?.selectDirectory(currentVal);
    if (selected) {
      handleFieldChange(compKey, fieldKey, selected);
    }
  };

  const handleBrowseShortcut = async (compKey: string, index: number, currentVal: string) => {
    if (!isTIUnlocked) return;
    const selected = await window.electronAPI?.selectDirectory(currentVal);
    if (selected) {
      handleShortcutChange(compKey, index, 'path', selected);
    }
  };

  const handleFieldChange = (compKey: string, fieldKey: string, val: any) => {
    if (!isTIUnlocked) return;
    setConfig((prev: any) => ({
      ...prev,
      [compKey]: {
        ...prev[compKey],
        [fieldKey]: val,
        // sync destSharePath and destinationParentPath for backwards compatibility
        ...(fieldKey === 'destSharePath' ? { destinationParentPath: val } : {}),
        ...(fieldKey === 'destinationParentPath' ? { destSharePath: val } : {}),
      },
    }));
  };

  const handleShortcutChange = (compKey: string, index: number, field: 'name' | 'path', val: string) => {
    if (!isTIUnlocked) return;
    const curShortcuts: ShortcutItem[] = [...(config[compKey]?.presetDestinations || [])];
    if (curShortcuts[index]) {
      curShortcuts[index] = { ...curShortcuts[index], [field]: val };
      handleFieldChange(compKey, 'presetDestinations', curShortcuts);
    }
  };

  const handleAddShortcut = (compKey: string) => {
    if (!isTIUnlocked) return;
    const curShortcuts: ShortcutItem[] = [...(config[compKey]?.presetDestinations || [])];
    const newIndex = curShortcuts.length + 1;
    const basePath = config[compKey]?.allowedBasePath || config[compKey]?.destSharePath || '';
    curShortcuts.push({
      name: `NOVO ATALHO ${newIndex}`,
      path: basePath ? `${basePath}\\NOVO ATALHO ${newIndex}` : '',
    });
    handleFieldChange(compKey, 'presetDestinations', curShortcuts);
  };

  const handleRemoveShortcut = (compKey: string, index: number) => {
    if (!isTIUnlocked) return;
    const curShortcuts: ShortcutItem[] = [...(config[compKey]?.presetDestinations || [])];
    curShortcuts.splice(index, 1);
    handleFieldChange(compKey, 'presetDestinations', curShortcuts);
  };

  const handleAddCompany = () => {
    const rawName = newCompanyName.trim().toUpperCase();
    if (!rawName) return;

    if (config[rawName]) {
      alert('Já existe uma empresa cadastrada com esse identificador!');
      return;
    }

    const newCompanyObj = {
      name: rawName,
      companyName: rawName,
      sourcePath: `\\\\192.168.1.1\\gpo\\criarpastas_paralegal\\MODELO`,
      destSharePath: `\\\\192.168.1.1\\arquivos\\CLIENTES\\EMPRESAS`,
      destinationParentPath: `\\\\192.168.1.1\\arquivos\\CLIENTES\\EMPRESAS`,
      allowedBasePath: `\\\\192.168.1.1\\arquivos\\CLIENTES`,
      defaultSourceFolder: `\\\\192.168.1.1\\arquivos\\CLIENTES\\EMPRESAS`,
      presetDestinations: [
        { name: '00 - EX CLIENTES', path: `\\\\192.168.1.1\\arquivos\\CLIENTES\\00 - EX CLIENTES` },
        { name: '01 - EMPRESAS ENCERRADAS', path: `\\\\192.168.1.1\\arquivos\\CLIENTES\\01 - EMPRESAS ENCERRADAS` },
      ],
      adServerIp: '',
      domainUser: `${rawName}\\pasta.paralegal`,
      adPass: 'Mestre@300',
    };

    setConfig((prev: any) => ({
      ...prev,
      [rawName]: newCompanyObj,
    }));

    setActiveCompanyTab(rawName);
    setNewCompanyName('');
    setIsAddCompanyModalOpen(false);
  };

  const handleConfirmDeleteCompany = () => {
    if (!companyToDelete) return;
    if (companyKeys.length <= 1) {
      alert('É necessário manter pelo menos uma empresa cadastrada no sistema.');
      setCompanyToDelete(null);
      return;
    }

    const updated = { ...config };
    delete updated[companyToDelete];
    setConfig(updated);

    const remainingKeys = Object.keys(updated).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword');
    if (remainingKeys.length > 0) {
      setActiveCompanyTab(remainingKeys[0]);
    }
    setCompanyToDelete(null);
  };

  const handleSaveConfig = async () => {
    if (!isTIUnlocked) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await window.electronAPI?.saveConfig(config);
      setSaveStatus({
        type: 'success',
        message: 'Todas as configurações corporativas, empresas, perímetros e atalhos foram salvas com sucesso!',
      });
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (e: any) {
      setSaveStatus({
        type: 'error',
        message: 'Falha ao salvar configurações: ' + (e?.message || 'Erro desconhecido.'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await window.electronAPI?.resetConfig();
      if (res?.config) {
        setConfig(res.config);
        const keys = getCompanyKeys(res.config);
        if (keys.length > 0) setActiveCompanyTab(keys[0]);
      }
      setShowResetConfirm(false);
      setSaveStatus({
        type: 'success',
        message: 'Configurações redefinidas com sucesso para os padrões originais de fábrica!',
      });
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (e: any) {
      setSaveStatus({
        type: 'error',
        message: 'Falha ao restaurar padrões: ' + (e?.message || 'Erro desconhecido.'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlockSuccess = () => {
    setIsTIUnlocked(true);
    setIsAuthModalOpen(false);
    onUnlockTI?.();
  };

  const handleLockClick = () => {
    setIsTIUnlocked(false);
    onLockTI?.();
  };

  if (!config) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-teams-600" />
        <span>Carregando parâmetros corporativos...</span>
      </div>
    );
  }

  const activeComp = config[activeCompanyTab] || {};
  const currentShortcuts: ShortcutItem[] = activeComp.presetDestinations || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* 1. Header & TI Lock Status Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all shadow-sm ${
          isTIUnlocked
            ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/20'
            : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs ${
                isTIUnlocked
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 text-teams-600 dark:text-teams-400'
              }`}
            >
              {isTIUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isTIUnlocked ? 'Modo Administrador TI Ativo' : 'Configurações Corporativas do Sistema'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                    isTIUnlocked
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-600'
                  }`}
                >
                  {isTIUnlocked ? 'LIBERADO PARA EDIÇÃO' : 'PROTEGIDO POR SENHA'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isTIUnlocked
                  ? 'Você tem controle total sobre empresas, caminhos UNC, perímetro de segurança (allowedBasePath) e atalhos rápidos.'
                  : 'Os caminhos de rede e o perímetro de governança foram pré-configurados pela equipe de TI.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            {!isTIUnlocked ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teams-600 hover:bg-teams-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Desbloquear Configurações (Acesso TI)</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsAddCompanyModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-300 dark:border-neutral-600 transition-colors cursor-pointer"
                  title="Cadastrar uma nova empresa no sistema"
                >
                  <Plus className="w-3.5 h-3.5 text-teams-600 dark:text-teams-400" />
                  <span>Nova Empresa</span>
                </button>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-300 dark:border-neutral-600 transition-colors cursor-pointer"
                  title="Restaurar para os padrões de fábrica do instalador"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Restaurar Padrões</span>
                </button>

                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
                </button>

                <button
                  onClick={handleLockClick}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl border border-slate-300 dark:border-neutral-600 transition-colors cursor-pointer"
                  title="Bloquear Sessão de Edição do TI"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Save Status Banner */}
        {saveStatus && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
              saveStatus.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
            }`}
          >
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span className="font-medium">{saveStatus.message}</span>
          </div>
        )}
      </div>

      {/* 2. Main Company Management Body */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        {/* Navigation Tabs for Companies */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-900/50 px-6 pt-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {companyKeys.map((key) => {
              const isActive = activeCompanyTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCompanyTab(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-teams-600 dark:text-teams-400 -mb-[1px] shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{config[key]?.companyName || key}</span>
                  {testResults[key]?.success && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pb-3">
            <button
              onClick={() => handleTest(activeCompanyTab)}
              disabled={testing[activeCompanyTab]}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg border border-slate-300 dark:border-neutral-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing[activeCompanyTab] ? 'animate-spin' : ''}`} />
              <span>Testar Conexão</span>
            </button>

            {isTIUnlocked && companyKeys.length > 1 && (
              <button
                onClick={() => setCompanyToDelete(activeCompanyTab)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                title="Excluir esta empresa do sistema"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Empresa</span>
              </button>
            )}
          </div>
        </div>

        {/* Connection Test Result Feedback */}
        {testResults[activeCompanyTab] && (
          <div className="p-4 border-b border-slate-100 dark:border-neutral-700">
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                testResults[activeCompanyTab].success
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
              }`}
            >
              {testResults[activeCompanyTab].success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
              )}
              <span className="font-medium">{testResults[activeCompanyTab].message}</span>
            </div>
          </div>
        )}

        {/* Active Company Configuration Form */}
        <div className="p-6 space-y-8">
          {/* Section 1: Identificação da Empresa */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teams-600 dark:text-teams-400" />
                  <span>Identificação da Empresa</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Nome exibido na interface para os operadores
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Empresa (Exibição)
                </label>
                <input
                  type="text"
                  readOnly={!isTIUnlocked}
                  value={activeComp.companyName || ''}
                  onChange={(e) => handleFieldChange(activeCompanyTab, 'companyName', e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-xs font-semibold ${
                    isTIUnlocked
                      ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-teams-500/30'
                      : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Chave Interna Identificadora
                </label>
                <input
                  type="text"
                  readOnly
                  value={activeCompanyTab}
                  className="w-full p-2.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-neutral-700" />

          {/* Section 2: Criação de Pastas de Clientes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FolderTree className="w-4 h-4 text-teams-600 dark:text-teams-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Criação de Pastas de Clientes
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Diretório do modelo com as 7 subpastas e destino de armazenamento das pastas criadas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Caminho do Modelo (Origem GPO)</span>
                  {!isTIUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly={!isTIUnlocked}
                    value={activeComp.sourcePath || ''}
                    onChange={(e) => handleFieldChange(activeCompanyTab, 'sourcePath', e.target.value)}
                    className={`flex-1 p-2.5 rounded-lg font-mono text-[11px] ${
                      isTIUnlocked
                        ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                    }`}
                  />
                  {isTIUnlocked && (
                    <button
                      type="button"
                      onClick={() => handleBrowseFolder(activeCompanyTab, 'sourcePath', activeComp.sourcePath)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-neutral-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Procurar pasta de rede"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Procurar...</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Caminho de Destino das Novas Pastas</span>
                  {!isTIUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly={!isTIUnlocked}
                    value={activeComp.destSharePath || activeComp.destinationParentPath || ''}
                    onChange={(e) => handleFieldChange(activeCompanyTab, 'destSharePath', e.target.value)}
                    className={`flex-1 p-2.5 rounded-lg font-mono text-[11px] ${
                      isTIUnlocked
                        ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                    }`}
                  />
                  {isTIUnlocked && (
                    <button
                      type="button"
                      onClick={() =>
                        handleBrowseFolder(
                          activeCompanyTab,
                          'destSharePath',
                          activeComp.destSharePath || activeComp.destinationParentPath
                        )
                      }
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-neutral-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Procurar pasta de rede"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Procurar...</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-neutral-700" />

          {/* Section 3: Mover / Transferir Pastas & Perímetro de Governança */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FolderOutput className="w-4 h-4 text-teams-600 dark:text-teams-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Mover / Transferir Pastas (Onde está a pasta? & Para onde vai a pasta?)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Parâmetros de movimentação de pastas, perímetro de segurança e atalhos rápidos
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Pasta Padrão de Origem */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Pasta Padrão de Origem ("Onde está a pasta?")</span>
                  {!isTIUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly={!isTIUnlocked}
                    value={activeComp.defaultSourceFolder || ''}
                    onChange={(e) => handleFieldChange(activeCompanyTab, 'defaultSourceFolder', e.target.value)}
                    className={`flex-1 p-2.5 rounded-lg font-mono text-[11px] ${
                      isTIUnlocked
                        ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                    }`}
                  />
                  {isTIUnlocked && (
                    <button
                      type="button"
                      onClick={() =>
                        handleBrowseFolder(activeCompanyTab, 'defaultSourceFolder', activeComp.defaultSourceFolder)
                      }
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-neutral-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Procurar pasta de rede"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Procurar...</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Diretório padrão pré-carregado no campo "Onde está a pasta?" na tela de Transferência.
                </p>
              </div>

              {/* Perímetro de Governança de TI */}
              <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Perímetro de Governança de TI (A partir de qual pasta o usuário pode mexer)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly={!isTIUnlocked}
                    value={activeComp.allowedBasePath || ''}
                    onChange={(e) => handleFieldChange(activeCompanyTab, 'allowedBasePath', e.target.value)}
                    className={`flex-1 p-2.5 rounded-lg font-mono text-[11px] ${
                      isTIUnlocked
                        ? 'bg-white dark:bg-neutral-900 border border-amber-500/30 text-slate-900 dark:text-white'
                        : 'bg-white/80 dark:bg-neutral-900/50 border border-amber-500/20 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                    }`}
                  />
                  {isTIUnlocked && (
                    <button
                      type="button"
                      onClick={() =>
                        handleBrowseFolder(activeCompanyTab, 'allowedBasePath', activeComp.allowedBasePath)
                      }
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Procurar pasta de rede"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Procurar...</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>Trava de Segurança:</strong> O operador só tem permissão para mover arquivos dessa pasta para frente.
                  Se tentar selecionar pastas externas proibidas (como <code>DEPARTAMENTOS</code>, <code>JURIDICO</code>, etc.), o sistema
                  bloqueia imediatamente a transferência.
                </p>
              </div>

              {/* Atalhos Rápidos de Destino */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Atalhos Rápidos de Destino ("Para onde vai a pasta?")
                  </label>
                  {isTIUnlocked && (
                    <button
                      type="button"
                      onClick={() => handleAddShortcut(activeCompanyTab)}
                      className="flex items-center gap-1 text-[11px] font-bold text-teams-600 dark:text-teams-400 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Atalho</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {currentShortcuts.length === 0 ? (
                    <div className="p-3 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-neutral-700 rounded-lg">
                      Nenhum atalho rápido configurado.
                    </div>
                  ) : (
                    currentShortcuts.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700"
                      >
                        <input
                          type="text"
                          placeholder="Nome do Atalho"
                          readOnly={!isTIUnlocked}
                          value={shortcut.name}
                          onChange={(e) => handleShortcutChange(activeCompanyTab, idx, 'name', e.target.value)}
                          className={`sm:w-1/3 p-2 rounded-md font-semibold text-xs ${
                            isTIUnlocked
                              ? 'bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                              : 'bg-transparent border-transparent text-slate-700 dark:text-slate-300 cursor-not-allowed'
                          }`}
                        />
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Caminho de Rede UNC"
                            readOnly={!isTIUnlocked}
                            value={shortcut.path}
                            onChange={(e) => handleShortcutChange(activeCompanyTab, idx, 'path', e.target.value)}
                            className={`flex-1 p-2 rounded-md font-mono text-[11px] ${
                              isTIUnlocked
                                ? 'bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                                : 'bg-transparent border-transparent text-slate-700 dark:text-slate-300 cursor-not-allowed'
                            }`}
                          />
                          {isTIUnlocked && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleBrowseShortcut(activeCompanyTab, idx, shortcut.path)}
                                className="p-2 bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors cursor-pointer"
                                title="Procurar pasta"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveShortcut(activeCompanyTab, idx)}
                                className="p-2 bg-rose-100 dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-md transition-colors cursor-pointer"
                                title="Excluir atalho"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-neutral-700" />

          {/* Section 4: Active Directory & Credenciais de Domínio */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-teams-600 dark:text-teams-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Directory & Conta de Serviço Corporativa
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Parâmetros de autenticação e impersonação isolada de token de domínio
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Servidor AD (IP / Host)</span>
                  {!isTIUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <input
                  type="text"
                  readOnly={!isTIUnlocked}
                  value={activeComp.adServerIp || ''}
                  onChange={(e) => handleFieldChange(activeCompanyTab, 'adServerIp', e.target.value)}
                  placeholder="Ex: 192.168.100.30"
                  className={`w-full p-2.5 rounded-lg font-mono text-[11px] ${
                    isTIUnlocked
                      ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Usuário de Domínio</span>
                  {!isTIUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <input
                  type="text"
                  readOnly={!isTIUnlocked}
                  value={activeComp.domainUser || ''}
                  onChange={(e) => handleFieldChange(activeCompanyTab, 'domainUser', e.target.value)}
                  placeholder="Ex: DOMINIO\pasta.paralegal"
                  className={`w-full p-2.5 rounded-lg font-mono text-[11px] ${
                    isTIUnlocked
                      ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Senha da Conta de Serviço</span>
                  {!isTIUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords[activeCompanyTab] ? 'text' : 'password'}
                    readOnly={!isTIUnlocked}
                    value={activeComp.adPass || ''}
                    onChange={(e) => handleFieldChange(activeCompanyTab, 'adPass', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-2.5 pr-9 rounded-lg font-mono text-[11px] ${
                      isTIUnlocked
                        ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        [activeCompanyTab]: !prev[activeCompanyTab],
                      }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showPasswords[activeCompanyTab] ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPasswords[activeCompanyTab] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Autenticação com Senha do TI */}
      <TIAccessModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleUnlockSuccess}
        title="Desbloquear Configurações do TI"
        description="Digite a senha de administrador (Fallima1979) para liberar as variáveis, empresas e atalhos."
      />

      {/* Modal: Adicionar Nova Empresa */}
      {isAddCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teams-50 dark:bg-teams-950/60 text-teams-600 dark:text-teams-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adicionar Nova Empresa</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cadastre uma nova filial ou unidade de negócio</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCompany();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome / Código da Nova Empresa
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: FILIAL_SUL, MATRIZ, etc."
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:ring-2 focus:ring-teams-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teams-600 hover:bg-teams-700 text-white shadow-xs transition-all"
                >
                  Adicionar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Empresa */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Confirmar Exclusão de Empresa</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Esta ação não pode ser desfeita automaticamente.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tem certeza de que deseja excluir a empresa <strong>{companyToDelete}</strong> das configurações do FolderWorks?
                As telas de Criação e Transferência de pastas não exibirão mais esta empresa.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompanyToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteCompany}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Restauração de Padrões */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Restaurar Padrões de Fábrica?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reversão de parâmetros corporativos</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Deseja restaurar as configurações originais corporativas embutidas no pacote de instalação?
                Todas as alterações manuais e novas empresas criadas serão redefinidas para o padrão inicial.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all"
                >
                  Restaurar Padrões
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

