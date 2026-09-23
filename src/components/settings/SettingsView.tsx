import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
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
  ShieldCheck,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { TIAccessModal } from '../logs/TIAccessModal';

interface SettingsViewProps {
  onTestConnection: (company: string, overrideConfig?: any) => Promise<{ success: boolean; message: string }>;
  isTIAuthenticated?: boolean;
  onUnlockTI?: () => void;
  onLockTI?: () => void;
}

interface ShortcutItem {
  name: string;
  path: string;
}

interface CompanyLogDetectionState {
  logDirectory: string;
  files: Array<{ name: string; fullPath: string; size: number; mtime: string; format: string }>;
  selectedFile: string;
  status: 'EMPTY' | 'SINGLE' | 'MULTIPLE' | 'DIR_NOT_FOUND';
  message: string;
  isLoading: boolean;
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
  const [activeCompanyTab, setActiveCompanyTab] = useState<string>('RTO');

  // Company Log State
  const [companyLogState, setCompanyLogState] = useState<{ [compKey: string]: CompanyLogDetectionState }>({});

  // UI Feedback States
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  // Modals
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Helper to extract company keys
  const getCompanyKeys = (cfg: any): string[] => {
    if (!cfg || typeof cfg !== 'object') return [];
    return Object.keys(cfg).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword' && k !== 'sharedLogFilePath');
  };

  // Sync external TI authentication state
  useEffect(() => {
    if (externalIsTIAuth !== undefined) {
      setIsTIUnlocked(externalIsTIAuth);
    }
  }, [externalIsTIAuth]);

  // Load config on mount and listen to updates
  useEffect(() => {
    window.electronAPI?.getConfig().then((cfg) => {
      setConfig(cfg);
      const keys = getCompanyKeys(cfg);
      if (keys.length > 0 && !activeCompanyTab) {
        setActiveCompanyTab(keys.includes('RTO') ? 'RTO' : keys[0]);
      }
    });

    const unsub = window.electronAPI?.onConfigUpdated?.((updatedCfg) => {
      setConfig(updatedCfg);
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const companyKeys = getCompanyKeys(config);

  // Ensure activeCompanyTab is valid
  useEffect(() => {
    if (companyKeys.length > 0 && (!activeCompanyTab || !companyKeys.includes(activeCompanyTab))) {
      setActiveCompanyTab(companyKeys.includes('RTO') ? 'RTO' : companyKeys[0]);
    }
  }, [companyKeys, activeCompanyTab]);

  const handleDetectCompanyLogs = async (compKey: string) => {
    if (!window.electronAPI?.detectCompanyLogFiles) return;
    setCompanyLogState((prev) => ({
      ...prev,
      [compKey]: { ...(prev[compKey] || {}), isLoading: true } as any,
    }));
    try {
      const res = await window.electronAPI.detectCompanyLogFiles(compKey);
      setCompanyLogState((prev) => ({
        ...prev,
        [compKey]: { ...res, isLoading: false },
      }));
    } catch (err: any) {
      setCompanyLogState((prev) => ({
        ...prev,
        [compKey]: {
          logDirectory: '',
          files: [],
          selectedFile: '',
          status: 'DIR_NOT_FOUND',
          message: err?.message || 'Erro ao escanear diretório de logs.',
          isLoading: false,
        },
      }));
    }
  };

  const handleSelectCompanyLogFile = async (compKey: string, filePath: string) => {
    if (!window.electronAPI?.selectCompanyLogFile) return;
    await window.electronAPI.selectCompanyLogFile(compKey, filePath);
    handleFieldChange(compKey, 'selectedLogFile', filePath);
    setCompanyLogState((prev) => ({
      ...prev,
      [compKey]: { ...prev[compKey], selectedFile: filePath },
    }));
  };

  const handleCreateCompanyLogFile = async (compKey: string, format = 'json') => {
    if (!window.electronAPI?.createCompanyLogFile) return;
    try {
      const res = await window.electronAPI.createCompanyLogFile(compKey, format);
      if (res?.createdFile) {
        handleFieldChange(compKey, 'selectedLogFile', res.createdFile);
        await handleDetectCompanyLogs(compKey);
      }
    } catch (err: any) {
      alert(`Falha ao criar arquivo de log: ${err?.message}`);
    }
  };

  useEffect(() => {
    if (isTIUnlocked && activeCompanyTab) {
      handleDetectCompanyLogs(activeCompanyTab);
    }
  }, [isTIUnlocked, activeCompanyTab]);

  const handleTest = async (compKey: string) => {
    setTesting((prev) => ({ ...prev, [compKey]: true }));
    const compConfig = config?.[compKey];
    const res = await onTestConnection(compKey, compConfig);
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
      name: `ATALHO ${newIndex}`,
      path: basePath ? `${basePath}\\PASTA_${newIndex}` : '',
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
      alert('Já existe uma empresa cadastrada com esse identificador.');
      return;
    }

    const newCompanyObj = {
      name: rawName,
      companyName: rawName,
      sourcePath: '',
      destSharePath: '',
      destinationParentPath: '',
      allowedBasePath: '',
      defaultSourceFolder: '',
      logDirectory: '',
      selectedLogFile: '',
      presetDestinations: [],
      adServerIp: '',
      domainUser: '',
      adPass: '',
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
      alert('É obrigatório manter pelo menos uma empresa configurada no sistema.');
      setCompanyToDelete(null);
      return;
    }

    const updated = { ...config };
    delete updated[companyToDelete];
    setConfig(updated);

    const remainingKeys = Object.keys(updated).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword' && k !== 'sharedLogFilePath');
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
        message: 'Configurações corporativas salvas com sucesso.',
      });
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (e: any) {
      setSaveStatus({
        type: 'error',
        message: 'Falha ao salvar configurações: ' + (e?.message || 'Erro inesperado.'),
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
        message: 'Configurações redefinidas para os padrões originais de instalação.',
      });
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (e: any) {
      setSaveStatus({
        type: 'error',
        message: 'Falha ao restaurar padrões: ' + (e?.message || 'Erro inesperado.'),
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
        <span>Carregando parâmetros...</span>
      </div>
    );
  }

  const activeComp = config[activeCompanyTab] || {};
  const currentShortcuts: ShortcutItem[] = activeComp.presetDestinations || [];
  const currentLogState: CompanyLogDetectionState = companyLogState[activeCompanyTab] || {
    logDirectory: activeComp.logDirectory || '',
    files: [],
    selectedFile: activeComp.selectedLogFile || '',
    status: (activeComp.logDirectory ? 'EMPTY' : 'DIR_NOT_FOUND') as any,
    message: activeComp.logDirectory
      ? 'Pasta configurada. Clique em "Validar Logs" para verificar.'
      : 'Nenhuma pasta de logs configurada para esta empresa.',
    isLoading: false,
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10 select-none">
      {/* 1. Header & TI Status Banner */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isTIUnlocked
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
            : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isTIUnlocked
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teams-50 dark:bg-teams-950/60 text-teams-600 dark:text-teams-400 border border-teams-200 dark:border-teams-800'
              }`}
            >
              {isTIUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isTIUnlocked ? 'Configurações de TI Liberadas' : 'Configurações do Sistema'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isTIUnlocked
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isTIUnlocked ? 'Edição Ativa' : 'Somente Leitura'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isTIUnlocked
                  ? 'Gerencie empresas, caminhos de rede, perímetro de segurança e atalhos rápidos.'
                  : 'Parâmetros corporativos de rede. Desbloqueie com a senha do TI para fazer alterações.'}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {!isTIUnlocked ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teams-600 hover:bg-teams-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Desbloquear (Acesso TI)</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsAddCompanyModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Adicionar nova empresa"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Empresa</span>
                </button>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Restaurar padrões de fábrica"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Restaurar</span>
                </button>

                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                </button>

                <button
                  onClick={handleLockClick}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Bloquear configurações"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Save Status Notification */}
        {saveStatus && (
          <div
            className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              saveStatus.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
            }`}
          >
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span className="font-medium">{saveStatus.message}</span>
          </div>
        )}
      </div>

      {/* 2. Main Company Box */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-xs">
        {/* Company Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-900/60 px-4 pt-2 gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {companyKeys.map((key) => {
              const isActive = activeCompanyTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCompanyTab(key)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-teams-600 dark:text-teams-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800/60'
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

          {/* Tab Actions: Test Connection & Delete Company */}
          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={() => {
                if (!isTIUnlocked) {
                  setIsAuthModalOpen(true);
                  return;
                }
                handleTest(activeCompanyTab);
              }}
              disabled={testing[activeCompanyTab]}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isTIUnlocked
                  ? 'bg-white dark:bg-neutral-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-600'
                  : 'bg-slate-100/60 dark:bg-neutral-800/60 text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-neutral-700/60'
              }`}
              title={isTIUnlocked ? "Testar comunicação com o servidor desta empresa" : "Desbloqueie com a senha do TI para testar"}
            >
              <RefreshCw className={`w-3 h-3 ${testing[activeCompanyTab] ? 'animate-spin text-teams-600' : ''}`} />
              <span>Testar Conexão</span>
            </button>

            {isTIUnlocked && companyKeys.length > 1 && (
              <button
                onClick={() => setCompanyToDelete(activeCompanyTab)}
                className="flex items-center gap-1 px-2.5 py-1 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Excluir esta empresa"
              >
                <Trash2 className="w-3 h-3" />
                <span>Excluir</span>
              </button>
            )}
          </div>
        </div>

        {/* Test Result Message */}
        {testResults[activeCompanyTab] && (
          <div
            className={`mx-5 mt-4 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              testResults[activeCompanyTab].success
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
            }`}
          >
            {testResults[activeCompanyTab].success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span className="font-medium">{testResults[activeCompanyTab].message}</span>
          </div>
        )}

        {/* Form Body with Privacy Blur and Security Lock Overlay */}
        <div className="relative overflow-hidden rounded-b-xl">
          <div
            className={`p-5 space-y-6 transition-all duration-300 ${
              !isTIUnlocked
                ? 'filter blur-md select-none pointer-events-none opacity-30'
                : ''
            }`}
            aria-hidden={!isTIUnlocked}
          >
          {/* Identificação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Empresa / Filial
            </label>
            <input
              type="text"
              readOnly={!isTIUnlocked}
              value={activeComp.companyName || ''}
              onChange={(e) => handleFieldChange(activeCompanyTab, 'companyName', e.target.value)}
              className={`w-full max-w-sm p-2 rounded-lg text-xs font-semibold ${
                isTIUnlocked
                  ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                  : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
              }`}
            />
          </div>

          <hr className="border-slate-100 dark:border-neutral-700" />

          {/* Pastas de Rede */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-teams-600 dark:text-teams-400" />
              <span>Diretórios de Rede</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Modelo de Pastas */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Modelo de Pastas (Origem da Estrutura)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly={!isTIUnlocked}
                    value={activeComp.sourcePath || ''}
                    onChange={(e) => handleFieldChange(activeCompanyTab, 'sourcePath', e.target.value)}
                    className={`flex-1 p-2 rounded-lg font-mono text-[11px] ${
                      isTIUnlocked
                        ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                    }`}
                  />
                  {isTIUnlocked && (
                    <button
                      type="button"
                      onClick={() => handleBrowseFolder(activeCompanyTab, 'sourcePath', activeComp.sourcePath)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-neutral-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      title="Procurar pasta"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Procurar...</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Destino das Criações */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Destino das Novas Pastas
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly={!isTIUnlocked}
                    value={activeComp.destSharePath || activeComp.destinationParentPath || ''}
                    onChange={(e) => handleFieldChange(activeCompanyTab, 'destSharePath', e.target.value)}
                    className={`flex-1 p-2 rounded-lg font-mono text-[11px] ${
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
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-neutral-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      title="Procurar pasta"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Procurar...</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pasta Padrão de Origem da Transferência */}
            <div className="text-xs">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Pasta Padrão de Origem (Tela de Mover Pastas)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly={!isTIUnlocked}
                  value={activeComp.defaultSourceFolder || ''}
                  onChange={(e) => handleFieldChange(activeCompanyTab, 'defaultSourceFolder', e.target.value)}
                  className={`flex-1 p-2 rounded-lg font-mono text-[11px] ${
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
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-neutral-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="Procurar pasta"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Procurar...</span>
                  </button>
                )}
              </div>
            </div>

            {/* Perímetro de Segurança - Zero Vazamento de Dados */}
            <div className="text-xs space-y-1">
              <label className="block font-medium text-slate-700 dark:text-slate-300">
                Perímetro de Segurança (Pasta Base Permitida)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly={!isTIUnlocked}
                  value={activeComp.allowedBasePath || ''}
                  onChange={(e) => handleFieldChange(activeCompanyTab, 'allowedBasePath', e.target.value)}
                  className={`flex-1 p-2 rounded-lg font-mono text-[11px] ${
                    isTIUnlocked
                      ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                  }`}
                />
                {isTIUnlocked && (
                  <button
                    type="button"
                    onClick={() =>
                      handleBrowseFolder(activeCompanyTab, 'allowedBasePath', activeComp.allowedBasePath)
                    }
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-neutral-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="Procurar pasta"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Procurar...</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Delimita o diretório base autorizado. Operações em pastas fora deste caminho são bloqueadas automaticamente pelo sistema.
              </p>
            </div>

            {/* Pasta de Logs e Auditoria na Rede (GPO / Compartilhamento) */}
            <div className="text-xs space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-700/60">
              <div className="flex items-center justify-between">
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Pasta de Logs e Auditoria na Rede (GPO / Compartilhamento)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDetectCompanyLogs(activeCompanyTab)}
                    disabled={currentLogState.isLoading}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teams-600 dark:text-teams-400 bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 rounded-md hover:bg-teams-100 dark:hover:bg-teams-900/60 transition-colors cursor-pointer"
                    title="Escanear e validar arquivos de log nesta pasta"
                  >
                    <RefreshCw className={`w-3 h-3 ${currentLogState.isLoading ? 'animate-spin' : ''}`} />
                    <span>Validar Logs</span>
                  </button>
                  {currentLogState.selectedFile && (
                    <button
                      type="button"
                      onClick={() => window.electronAPI?.openSharedLogFile?.(currentLogState.selectedFile)}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-md hover:bg-slate-200 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
                      title="Abrir arquivo de auditoria ativo"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir Arquivo</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly={!isTIUnlocked}
                  value={activeComp.logDirectory || ''}
                  onChange={(e) => {
                    handleFieldChange(activeCompanyTab, 'logDirectory', e.target.value);
                  }}
                  placeholder="Ex: \\192.168.50.102\gpo\criarpastas_paralegal\LOGS"
                  className={`flex-1 p-2 rounded-lg font-mono text-[11px] ${
                    isTIUnlocked
                      ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                  }`}
                />
                {isTIUnlocked && (
                  <button
                    type="button"
                    onClick={() =>
                      handleBrowseFolder(activeCompanyTab, 'logDirectory', activeComp.logDirectory)
                    }
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-neutral-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="Procurar pasta de logs"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Procurar...</span>
                  </button>
                )}
              </div>

              {/* Status e Detecção de Arquivos */}
              {currentLogState && (
                <div className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teams-600" />
                      Status dos Arquivos de Log:
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      currentLogState.status === 'SINGLE'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                        : currentLogState.status === 'MULTIPLE'
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                        : currentLogState.status === 'EMPTY'
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                    }`}>
                      {currentLogState.status === 'SINGLE' && 'Arquivo Ativo Detectado'}
                      {currentLogState.status === 'MULTIPLE' && 'Múltiplos Arquivos Encontrados'}
                      {currentLogState.status === 'EMPTY' && 'Nenhum Arquivo (Pasta Vazia)'}
                      {currentLogState.status === 'DIR_NOT_FOUND' && 'Diretório Inacessível'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentLogState.message}
                  </p>

                  {/* Se pasta vazia, permitir criar o formato ideal */}
                  {currentLogState.status === 'EMPTY' && isTIUnlocked && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCreateCompanyLogFile(activeCompanyTab, 'json')}
                        className="px-2.5 py-1 bg-teams-600 hover:bg-teams-700 text-white rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Criar Formato Ideal (.JSON)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateCompanyLogFile(activeCompanyTab, 'txt')}
                        className="px-2 py-1 bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        <span>Criar .TXT</span>
                      </button>
                    </div>
                  )}

                  {/* Se múltiplos arquivos, permitir que o TI selecione qual usar */}
                  {currentLogState.status === 'MULTIPLE' && isTIUnlocked && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        Selecione o arquivo de auditoria a ser utilizado pelo sistema:
                      </label>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {currentLogState.files.map((f) => (
                          <div
                            key={f.fullPath}
                            onClick={() => handleSelectCompanyLogFile(activeCompanyTab, f.fullPath)}
                            className={`p-1.5 rounded flex items-center justify-between text-[11px] cursor-pointer border transition-all ${
                              currentLogState.selectedFile === f.fullPath || activeComp.selectedLogFile === f.fullPath
                                ? 'bg-teams-50 dark:bg-teams-950/40 border-teams-400 dark:border-teams-600 text-teams-900 dark:text-teams-200 font-bold'
                                : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                              <span className="truncate">{f.name}</span>
                              <span className="text-[9px] uppercase px-1 py-0.2 bg-slate-100 dark:bg-neutral-700 rounded text-slate-500 font-mono">
                                {f.format}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-400">
                              <span>{(f.size / 1024).toFixed(1)} KB</span>
                              {(currentLogState.selectedFile === f.fullPath || activeComp.selectedLogFile === f.fullPath) && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-teams-600 shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Se arquivo único ou selecionado */}
                  {(currentLogState.status === 'SINGLE' || (currentLogState.status === 'MULTIPLE' && currentLogState.selectedFile)) && (
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 truncate pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate font-semibold">Arquivo em uso: {currentLogState.selectedFile}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Os logs locais continuam sendo gravados. Esta pasta na rede centraliza a auditoria corporativa. Se vazia, o sistema gera o arquivo ideal automaticamente. Se houver log existente, ele é preservado sem recriação.
              </p>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-neutral-700" />

          {/* Atalhos Rápidos de Destino */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FolderOutput className="w-3.5 h-3.5 text-teams-600 dark:text-teams-400" />
                <span>Atalhos Rápidos de Destino</span>
              </h4>
              {isTIUnlocked && (
                <button
                  type="button"
                  onClick={() => handleAddShortcut(activeCompanyTab)}
                  className="flex items-center gap-1 text-xs font-bold text-teams-600 dark:text-teams-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Atalho</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {currentShortcuts.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-neutral-700 rounded-lg">
                  Nenhum atalho rápido configurado para esta empresa.
                </div>
              ) : (
                currentShortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs"
                  >
                    <input
                      type="text"
                      placeholder="Nome do Atalho"
                      readOnly={!isTIUnlocked}
                      value={shortcut.name}
                      onChange={(e) => handleShortcutChange(activeCompanyTab, idx, 'name', e.target.value)}
                      className={`sm:w-1/3 p-1.5 rounded-md font-semibold text-xs ${
                        isTIUnlocked
                          ? 'bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                          : 'bg-transparent border-transparent text-slate-700 dark:text-slate-300 cursor-not-allowed'
                      }`}
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Caminho UNC"
                        readOnly={!isTIUnlocked}
                        value={shortcut.path}
                        onChange={(e) => handleShortcutChange(activeCompanyTab, idx, 'path', e.target.value)}
                        className={`flex-1 p-1.5 rounded-md font-mono text-[11px] ${
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
                            className="p-1.5 bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Procurar pasta"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveShortcut(activeCompanyTab, idx)}
                            className="p-1.5 bg-rose-100 dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-md transition-colors cursor-pointer"
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

          <hr className="border-slate-100 dark:border-neutral-700" />

          {/* Active Directory & Credenciais */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teams-600 dark:text-teams-400" />
              <span>Autenticação de Domínio (Active Directory)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Servidor AD (IP ou Host)
                </label>
                <input
                  type="text"
                  readOnly={!isTIUnlocked}
                  value={activeComp.adServerIp || ''}
                  onChange={(e) => handleFieldChange(activeCompanyTab, 'adServerIp', e.target.value)}
                  placeholder="Ex: 192.168.1.10"
                  className={`w-full p-2 rounded-lg font-mono text-[11px] ${
                    isTIUnlocked
                      ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Usuário de Serviço
                </label>
                <input
                  type="text"
                  readOnly={!isTIUnlocked}
                  value={activeComp.domainUser || ''}
                  onChange={(e) => handleFieldChange(activeCompanyTab, 'domainUser', e.target.value)}
                  placeholder="DOMINIO\\usuario"
                  className={`w-full p-2 rounded-lg font-mono text-[11px] ${
                    isTIUnlocked
                      ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Senha da Conta
                </label>
                <div className="relative">
                  <input
                    type={isTIUnlocked && showPasswords[activeCompanyTab] ? 'text' : 'password'}
                    readOnly={!isTIUnlocked}
                    value={isTIUnlocked ? (activeComp.adPass || '') : '••••••••••••'}
                    onChange={(e) => handleFieldChange(activeCompanyTab, 'adPass', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-2 pr-8 rounded-lg font-mono text-[11px] ${
                      isTIUnlocked
                        ? 'bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                    }`}
                  />
                  {isTIUnlocked && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          [activeCompanyTab]: !prev[activeCompanyTab],
                        }))
                      }
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPasswords[activeCompanyTab] ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPasswords[activeCompanyTab] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Blur Security Lock Overlay */}
          {!isTIUnlocked && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/30 dark:bg-black/50 backdrop-blur-[2px] select-none animate-in fade-in duration-200">
              <div className="bg-white/95 dark:bg-neutral-900/95 border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center backdrop-blur-md">
                <div className="w-12 h-12 rounded-2xl bg-teams-50 dark:bg-teams-950/80 border border-teams-200 dark:border-teams-800/80 flex items-center justify-center text-teams-600 dark:text-teams-400 mx-auto mb-4 shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Acesso Restrito ao TI</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  Configurações Protegidas
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Os caminhos de rede, parâmetros corporativos e credenciais do domínio estão ocultos por segurança. Insira a senha do TI para desbloquear e visualizar.
                </p>

                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teams-600 hover:bg-teams-700 active:bg-teams-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teams-600/20 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Desbloquear com Senha do TI</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Autenticação com Senha do TI */}
      <TIAccessModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleUnlockSuccess}
        title="Desbloquear Configurações"
        description="Digite a senha de administrador para liberar a edição de empresas e parâmetros."
      />

      {/* Modal: Adicionar Nova Empresa */}
      {isAddCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teams-50 dark:bg-teams-950/60 text-teams-600 dark:text-teams-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adicionar Empresa</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Cadastre uma nova filial ou divisão</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCompany();
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome / Sigla da Empresa
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: MATRIZ, FILIAL_01, etc."
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold uppercase text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teams-600 hover:bg-teams-700 text-white transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Empresa */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Excluir Empresa</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Esta ação remove a empresa da lista ativa</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tem certeza de que deseja remover <strong>{companyToDelete}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCompanyToDelete(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCompany}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Restauração de Padrões */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Restaurar Padrões?</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Reversão de configurações de instalação</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Deseja restaurar as configurações originais do pacote de instalação? Modificações recentes serão desfeitas.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                Restaurar Padrões
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
