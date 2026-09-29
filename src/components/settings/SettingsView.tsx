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
  Palette,
  Upload,
  Image as ImageIcon,
  Network,
  Share2,
  Unlink,
} from 'lucide-react';
import { TIAccessModal } from '../logs/TIAccessModal';
import { useIconColor } from '../../hooks/useIconColor';

interface SettingsViewProps {
  onTestConnection: (company: string, overrideConfig?: any) => Promise<{ success: boolean; message: string }>;
  isTIAuthenticated?: boolean;
  onUnlockTI?: () => void;
  onLockTI?: () => void;
  customLogo?: string | null;
  onUpdateCustomLogo?: (logo: string | null) => void;
}

interface ShortcutItem {
  name: string;
  path: string;
  isPredefined?: boolean;
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
  customLogo,
  onUpdateCustomLogo,
}) => {
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<any>(null);
  const [sharedConfigInfo, setSharedConfigInfo] = useState<{
    isConfigured: boolean;
    sharedFilePath: string;
    isConnected: boolean;
    isOfflineCache: boolean;
    lastModified: string | null;
    size?: number;
    error: string | null;
  }>({
    isConfigured: false,
    sharedFilePath: '',
    isConnected: false,
    isOfflineCache: false,
    lastModified: null,
    error: null,
  });
  const [isLoadingSharedConfig, setIsLoadingSharedConfig] = useState(false);

  const loadSharedConfigInfo = async () => {
    if (window.electronAPI?.getSharedConfigInfo) {
      const info = await window.electronAPI.getSharedConfigInfo();
      setSharedConfigInfo(info);
    }
  };

  const handleSelectSharedConfigFile = async () => {
    const selected = await window.electronAPI?.selectConfigFile('open');
    if (!selected) return;
    setIsLoadingSharedConfig(true);
    const res = await window.electronAPI?.setSharedConfigFile(selected);
    setIsLoadingSharedConfig(false);
    if (res?.success) {
      const updated = res.config || (await window.electronAPI?.getConfig());
      setConfig(updated);
      await loadSharedConfigInfo();
      setSaveStatus({ type: 'success', message: `Aplicativo vinculado com sucesso ao arquivo de rede: ${selected}` });
    } else {
      setSaveStatus({ type: 'error', message: res?.error || 'Falha ao vincular arquivo de configuração da rede.' });
    }
  };

  const [manualSharedPath, setManualSharedPath] = useState('');

  const handleConnectManualPath = async () => {
    const trimmed = manualSharedPath.trim();
    if (!trimmed) return;
    setIsLoadingSharedConfig(true);
    const res = await window.electronAPI?.setSharedConfigFile(trimmed);
    setIsLoadingSharedConfig(false);
    if (res?.success) {
      const updated = res.config || (await window.electronAPI?.getConfig());
      setConfig(updated);
      await loadSharedConfigInfo();
      setSaveStatus({ type: 'success', message: `Aplicativo vinculado com sucesso ao arquivo de rede: ${trimmed}` });
      setManualSharedPath('');
    } else {
      setSaveStatus({ type: 'error', message: res?.error || 'Falha ao vincular arquivo de configuração da rede.' });
    }
  };

  const handleCreateSharedConfigFile = async () => {
    const targetPath = await window.electronAPI?.selectConfigFile('save');
    if (!targetPath) return;
    setIsLoadingSharedConfig(true);
    const res = await window.electronAPI?.createSharedConfigFile(targetPath, config);
    setIsLoadingSharedConfig(false);
    if (res?.success) {
      await loadSharedConfigInfo();
      setSaveStatus({ type: 'success', message: `Arquivo de configuração criado na rede com sucesso em: ${targetPath}` });
    } else {
      setSaveStatus({ type: 'error', message: res?.error || 'Falha ao criar arquivo de configuração na rede.' });
    }
  };

  const handleDisconnectSharedConfig = async () => {
    setIsLoadingSharedConfig(true);
    await window.electronAPI?.setSharedConfigFile('');
    setIsLoadingSharedConfig(false);
    await loadSharedConfigInfo();
    const localCfg = await window.electronAPI?.getConfig();
    setConfig(localCfg);
    setSaveStatus({ type: 'success', message: 'Desvinculado da rede. O aplicativo agora opera com as configurações locais.' });
  };

  const handleReloadSharedConfig = async () => {
    setIsLoadingSharedConfig(true);
    const res = await window.electronAPI?.reloadConfig();
    setIsLoadingSharedConfig(false);
    if (res?.success) {
      setConfig(res.config);
      await loadSharedConfigInfo();
      setSaveStatus({ type: 'success', message: 'Configurações recarregadas da rede com sucesso!' });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (onUpdateCustomLogo) onUpdateCustomLogo(result);
        const updatedConfig = { ...config, customLogo: result };
        setConfig(updatedConfig);
        try {
          await window.electronAPI?.saveConfig(updatedConfig);
          await window.electronAPI?.setWindowIcon(result);
        } catch {}
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetLogo = async () => {
    if (onUpdateCustomLogo) {
      onUpdateCustomLogo(null);
    }
    const updatedConfig = { ...config };
    delete updatedConfig.customLogo;
    setConfig(updatedConfig);
    try {
      await window.electronAPI?.saveConfig(updatedConfig);
      await window.electronAPI?.setWindowIcon(null);
    } catch {}
  };
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string } }>({});
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});

  // TI Authentication & Edit Mode State
  const [isTIUnlocked, setIsTIUnlocked] = useState<boolean>(!!externalIsTIAuth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Active Company Tab in Settings
  const [activeCompanyTab, setActiveCompanyTab] = useState<string>('RTO');

  // Active Company Tab for Shortcuts (Livre para o Usuário)
  const [shortcutCompanyTab, setShortcutCompanyTab] = useState<string>('RTO');

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
  const [pendingDeleteShortcut, setPendingDeleteShortcut] = useState<{ compKey: string; index: number } | null>(null);
  const [isTIShortcutAuthModalOpen, setIsTIShortcutAuthModalOpen] = useState(false);

  // Helper para identificar atalhos pré-definidos pelo TI
  const isTIShortcut = (shortcut: ShortcutItem): boolean => {
    if (shortcut.isPredefined) return true;
    const normalized = (shortcut.name || '').trim().toUpperCase();
    return normalized === '00 - EX CLIENTES' || normalized === '01 - EMPRESAS ENCERRADAS';
  };

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
    loadSharedConfigInfo();
    window.electronAPI?.getConfig().then((cfg) => {
      setConfig(cfg);
      const keys = getCompanyKeys(cfg);
      if (keys.length > 0) {
        if (!activeCompanyTab) {
          setActiveCompanyTab(keys.includes('RTO') ? 'RTO' : keys[0]);
        }
        if (!shortcutCompanyTab) {
          setShortcutCompanyTab(keys.includes('RTO') ? 'RTO' : keys[0]);
        }
      }
    });

    const unsub = window.electronAPI?.onConfigUpdated?.((updatedCfg) => {
      setConfig(updatedCfg);
      loadSharedConfigInfo();
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const companyKeys = getCompanyKeys(config);

  // Ensure activeCompanyTab and shortcutCompanyTab are valid
  useEffect(() => {
    if (companyKeys.length > 0) {
      if (!activeCompanyTab || !companyKeys.includes(activeCompanyTab)) {
        setActiveCompanyTab(companyKeys.includes('RTO') ? 'RTO' : companyKeys[0]);
      }
      if (!shortcutCompanyTab || !companyKeys.includes(shortcutCompanyTab)) {
        setShortcutCompanyTab(companyKeys.includes('RTO') ? 'RTO' : companyKeys[0]);
      }
    }
  }, [companyKeys, activeCompanyTab, shortcutCompanyTab]);

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

  // Icon Color Customization Hook
  const { selectedColorId, availableColors, setIconColor, currentColor } = useIconColor();

  // Shortcuts status
  const [shortcutsStatus, setShortcutsStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [shortcutsSaving, setShortcutsSaving] = useState(false);

  const handleBrowseFolder = async (compKey: string, fieldKey: string, currentVal: string) => {
    if (!isTIUnlocked) return;
    const selected = await window.electronAPI?.selectDirectory(currentVal);
    if (selected) {
      handleFieldChange(compKey, fieldKey, selected);
    }
  };

  const handleBrowseShortcut = async (compKey: string, index: number, currentVal: string) => {
    const allowedBase = config[compKey]?.allowedBasePath || config[compKey]?.destSharePath || '';
    const selected = await window.electronAPI?.selectDirectory({
      defaultPath: currentVal || allowedBase,
      company: compKey,
      enforceBoundary: true,
    });
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
    const curShortcuts: ShortcutItem[] = [...(config[compKey]?.presetDestinations || [])];
    if (curShortcuts[index]) {
      curShortcuts[index] = { ...curShortcuts[index], [field]: val };
      setConfig((prev: any) => ({
        ...prev,
        [compKey]: {
          ...prev[compKey],
          presetDestinations: curShortcuts,
        },
      }));
    }
  };

  const handleAddShortcut = (compKey: string) => {
    const curShortcuts: ShortcutItem[] = [...(config[compKey]?.presetDestinations || [])];
    const newIndex = curShortcuts.length + 1;
    const basePath = config[compKey]?.allowedBasePath || config[compKey]?.destSharePath || '';
    curShortcuts.push({
      name: `Novo Atalho ${newIndex}`,
      path: basePath ? `${basePath}\\Pasta_${newIndex}` : '',
      isPredefined: false,
    });
    setConfig((prev: any) => ({
      ...prev,
      [compKey]: {
        ...prev[compKey],
        presetDestinations: curShortcuts,
      },
    }));
  };

  const executeRemoveShortcut = async (compKey: string, index: number) => {
    const curShortcuts: ShortcutItem[] = [...(config[compKey]?.presetDestinations || [])];
    curShortcuts.splice(index, 1);
    const updatedConfig = {
      ...config,
      [compKey]: {
        ...config[compKey],
        presetDestinations: curShortcuts,
      },
    };
    setConfig(updatedConfig);
    try {
      await window.electronAPI?.saveConfig(updatedConfig);
      setShortcutsStatus({
        type: 'success',
        message: 'Atalho removido com sucesso!',
      });
      setTimeout(() => setShortcutsStatus(null), 3000);
    } catch (e: any) {
      console.error('Erro ao salvar remoção:', e);
    }
  };

  const handleRemoveShortcutClick = (compKey: string, index: number) => {
    const curShortcuts: ShortcutItem[] = [...(config[compKey]?.presetDestinations || [])];
    const target = curShortcuts[index];
    if (!target) return;

    if (isTIShortcut(target)) {
      if (!isTIUnlocked) {
        setPendingDeleteShortcut({ compKey, index });
        setIsTIShortcutAuthModalOpen(true);
        return;
      }
    }

    executeRemoveShortcut(compKey, index);
  };

  const handleTIShortcutAuthSuccess = () => {
    setIsTIShortcutAuthModalOpen(false);
    if (pendingDeleteShortcut) {
      executeRemoveShortcut(pendingDeleteShortcut.compKey, pendingDeleteShortcut.index);
      setPendingDeleteShortcut(null);
    }
  };

  const handleSaveShortcuts = async (compKey: string) => {
    setShortcutsSaving(true);
    setShortcutsStatus(null);
    try {
      const curShortcuts: ShortcutItem[] = config[compKey]?.presetDestinations || [];
      // Validação estrita de cada atalho contra o perímetro da empresa
      for (const s of curShortcuts) {
        if (!s.name.trim() || !s.path.trim()) {
          throw new Error('Todos os atalhos devem conter um nome e um caminho UNC válidos.');
        }
        if (window.electronAPI?.validateBoundary) {
          const valRes = await window.electronAPI.validateBoundary({
            targetPath: s.path.trim(),
            company: compKey,
          });
          if (!valRes.isValid) {
            throw new Error(`O atalho "${s.name}" (${s.path}) está fora do perímetro de segurança corporativo autorizado ("${valRes.allowedBase}"). Corrija o caminho para salvar.`);
          }
        }
      }

      await window.electronAPI?.saveConfig(config);
      setShortcutsStatus({
        type: 'success',
        message: `Atalhos da empresa ${compKey} validados e salvos com sucesso!`,
      });
      setTimeout(() => setShortcutsStatus(null), 4000);
    } catch (err: any) {
      setShortcutsStatus({
        type: 'error',
        message: err.message || 'Falha ao salvar atalhos.',
      });
    } finally {
      setShortcutsSaving(false);
    }
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
  const shortcutComp = config[shortcutCompanyTab] || {};
  const currentShortcuts: ShortcutItem[] = shortcutComp.presetDestinations || [];
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isTIUnlocked ? 'Configurações de TI Liberadas' : 'Configurações do Sistema'}
              </h3>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teams-600 hover:bg-teams-700 active:bg-teams-800 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-teams-600/20 cursor-pointer"
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

      {/* 2. Cores do Sistema e Tema Global (Livre para o Usuário - 24 Opções) */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-4 shadow-xs">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teams-50 dark:bg-teams-950/60 text-teams-600 dark:text-teams-400 border border-teams-200 dark:border-teams-800 flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personalização de Tema e Cores</h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    24 Cores Disponíveis
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Escolha a cor de destaque principal da aplicação. Todos os botões, abas, destaques e ícones adotarão a cor escolhida instantaneamente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 text-xs font-semibold text-teams-700 dark:text-teams-300 shrink-0">
              <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: currentColor.hex }} />
              <span>Tema Ativo: {currentColor.name}</span>
            </div>
          </div>

          {/* Grid com as 24 Opções de Cores */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 pt-1">
            {availableColors.map((color) => {
              const isSelected = selectedColorId === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setIconColor(color.id)}
                  className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teams-600 bg-teams-50/70 dark:bg-teams-950/70 ring-2 ring-teams-600/40 shadow-xs scale-105'
                      : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 bg-slate-50/40 dark:bg-neutral-900/40 hover:scale-102'
                  }`}
                  title={`${color.name} (${color.category || ''})`}
                >
                  <div className="relative">
                    <span
                      className="w-5 h-5 rounded-full block shadow-xs transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color.hex }}
                    />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 mt-1 truncate max-w-full text-center">
                    {color.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2.0 Arquivo de Configuração Compartilhado na Rede (Centralizado) */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-teams-50 dark:bg-teams-950/60 text-teams-600 dark:text-teams-400 border border-teams-200 dark:border-teams-800 flex items-center justify-center shrink-0 shadow-xs">
              <Network className="w-6 h-6 text-teams-600 dark:text-teams-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Configuração Centralizada na Rede Corporativa
                </h3>
                {sharedConfigInfo.isConfigured ? (
                  sharedConfigInfo.isConnected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Conectado à Rede
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {sharedConfigInfo.isOfflineCache ? 'Cache Offline (Rede Inacessível)' : 'Desconectado'}
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-neutral-600">
                    Modo Local (Estação Isolada)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Vincule o FolderWorks a um arquivo <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-neutral-900 text-teams-600 dark:text-teams-400 font-mono text-[11px]">folderworks_config.json</code> no servidor para que todas as estações compartilhem instantaneamente as empresas, permissões, caminhos e o logotipo.
              </p>
              {!sharedConfigInfo.isConfigured && (
                <div className="mt-3 flex items-center gap-2 max-w-2xl">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={manualSharedPath}
                      onChange={(e) => setManualSharedPath(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnectManualPath()}
                      placeholder="Cole ou digite o caminho UNC: \\servidor\compartilhamento\folderworks_config.json"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-slate-100 font-mono focus:ring-1 focus:ring-teams-500 outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectManualPath}
                    disabled={!manualSharedPath.trim() || isLoadingSharedConfig}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teams-600 hover:bg-teams-700 text-white disabled:opacity-50 cursor-pointer shrink-0 transition-colors shadow-xs"
                  >
                    <span>Conectar</span>
                  </button>
                </div>
              )}
              {sharedConfigInfo.isConfigured && (
                <div className="mt-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-neutral-900/60 p-2 rounded-lg border border-slate-200/80 dark:border-neutral-800 break-all flex items-center justify-between gap-2">
                  <span>📁 {sharedConfigInfo.sharedFilePath}</span>
                  {sharedConfigInfo.lastModified && (
                    <span className="text-[10px] text-slate-400 shrink-0">Modificado: {sharedConfigInfo.lastModified}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleSelectSharedConfigFile}
              disabled={isLoadingSharedConfig}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teams-600 hover:bg-teams-500 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Localizar arquivo .json de configuração no servidor ou disco"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{sharedConfigInfo.isConfigured ? 'Trocar Arquivo na Rede' : 'Vincular Arquivo na Rede'}</span>
            </button>

            <button
              type="button"
              onClick={handleCreateSharedConfigFile}
              disabled={isLoadingSharedConfig}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-neutral-700 hover:bg-slate-200 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Exportar a configuração atual para um novo arquivo no servidor compartilhado"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Criar na Rede</span>
            </button>

            {sharedConfigInfo.isConfigured && (
              <>
                <button
                  type="button"
                  onClick={handleReloadSharedConfig}
                  disabled={isLoadingSharedConfig}
                  className="p-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-neutral-700 hover:bg-slate-200 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-600 transition-colors cursor-pointer"
                  title="Recarregar dados do arquivo da rede agora"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSharedConfig ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleDisconnectSharedConfig}
                  disabled={isLoadingSharedConfig}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                  title="Desvincular e usar armazenamento local desta máquina"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Desvincular</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2.1 Identidade Visual e Logotipo do Aplicativo (Livre para o Usuário) */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teams-50 dark:bg-teams-950/60 text-teams-600 dark:text-teams-400 border border-teams-200 dark:border-teams-800 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-xs">
              {customLogo ? (
                <img src={customLogo} alt="Logotipo do Aplicativo" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <ImageIcon className="w-6 h-6 text-teams-600 dark:text-teams-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Logotipo Personalizado da Aplicação</h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Livre para Usuário
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Personalize o ícone do cabeçalho da barra lateral com a marca da sua empresa. Formatos PNG, JPG ou SVG recomendados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teams-600 hover:bg-teams-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{customLogo ? 'Substituir Imagem' : 'Carregar Logotipo'}</span>
            </button>
            {customLogo && (
              <button
                type="button"
                onClick={handleResetLogo}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-neutral-700 hover:bg-slate-200 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-600 transition-colors cursor-pointer"
                title="Restaurar ícone padrão da Entropy"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Restaurar Padrão</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Atalhos Rápidos de Destino (Livre para o Usuário - Configurar e Gerenciar Atalhos de Cada Empresa) */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-xs overflow-hidden">
        {/* Header do Card com Seletor de Empresa */}
        <div className="border-b border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-900/60 px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teams-50 dark:bg-teams-950/60 text-teams-600 dark:text-teams-400 border border-teams-200 dark:border-teams-800 flex items-center justify-center shrink-0">
                <FolderOutput className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Atalhos Rápidos de Destino</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure atalhos rápidos de destino para transferências ágeis de pastas. Atalhos criados por você podem ser adicionados e excluídos livremente. Os atalhos pré-definidos do TI são protegidos contra exclusão acidental.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddShortcut(shortcutCompanyTab)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teams-50 dark:bg-teams-950/50 hover:bg-teams-100 dark:hover:bg-teams-900/60 text-teams-700 dark:text-teams-300 rounded-lg text-xs font-bold border border-teams-200 dark:border-teams-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Atalho</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveShortcuts(shortcutCompanyTab)}
                disabled={shortcutsSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teams-600 hover:bg-teams-700 active:bg-teams-800 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-teams-600/20 cursor-pointer"
                title="Salvar alterações nos atalhos"
              >
                <Save className={`w-3.5 h-3.5 ${shortcutsSaving ? 'animate-spin' : ''}`} />
                <span>{shortcutsSaving ? 'Validando...' : 'Salvar Atalhos'}</span>
              </button>
            </div>
          </div>

          {/* Abas das Empresas para Atalhos */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/70 dark:border-neutral-700/70">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Empresa:</span>
            {companyKeys.map((key) => {
              const isActive = shortcutCompanyTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setShortcutCompanyTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-600 text-teams-600 dark:text-teams-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{config[key]?.companyName || key}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Corpo do Card de Atalhos */}
        <div className="p-5 space-y-4">
          {/* Notificação de Status dos Atalhos */}
          {shortcutsStatus && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                shortcutsStatus.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
              }`}
            >
              {shortcutsStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span className="font-medium">{shortcutsStatus.message}</span>
            </div>
          )}

          <div className="space-y-2">
            {currentShortcuts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-neutral-700 rounded-lg">
                Nenhum atalho rápido configurado para a empresa {config[shortcutCompanyTab]?.companyName || shortcutCompanyTab}. Clique em "Adicionar Atalho" acima para criar um.
              </div>
            ) : (
              currentShortcuts.map((shortcut, idx) => {
                const isPredefined = isTIShortcut(shortcut);
                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs"
                  >
                    <div className="sm:w-1/3 flex items-center gap-1.5">
                      {isPredefined ? (
                        <span
                          className="p-1.5 rounded bg-slate-200/70 dark:bg-neutral-800 text-slate-500 dark:text-slate-400 shrink-0 flex items-center"
                          title="Atalho padrão do TI (requer senha de administrador para excluir)"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span
                          className="p-1.5 rounded bg-teams-100/60 dark:bg-teams-950/60 text-teams-600 dark:text-teams-400 shrink-0 flex items-center"
                          title="Atalho criado pelo usuário (pode ser excluído livremente)"
                        >
                          <FolderOutput className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <input
                        type="text"
                        placeholder="Nome do Atalho (ex: Minha Pasta de Arquivos)"
                        value={shortcut.name}
                        disabled={isPredefined && !isTIUnlocked}
                        onChange={(e) => handleShortcutChange(shortcutCompanyTab, idx, 'name', e.target.value)}
                        className={`flex-1 p-2 rounded-md font-semibold text-xs border text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teams-500 ${
                          isPredefined && !isTIUnlocked
                            ? 'bg-slate-100 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 cursor-not-allowed opacity-90'
                            : 'bg-white dark:bg-neutral-800 border-slate-300 dark:border-neutral-600'
                        }`}
                        title={isPredefined && !isTIUnlocked ? 'Nome fixo do TI (desbloqueie com a senha do TI para editar)' : 'Nome do atalho'}
                      />
                    </div>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Caminho UNC na Rede"
                        value={shortcut.path}
                        disabled={isPredefined && !isTIUnlocked}
                        onChange={(e) => handleShortcutChange(shortcutCompanyTab, idx, 'path', e.target.value)}
                        className={`flex-1 p-2 rounded-md font-mono text-[11px] border text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teams-500 ${
                          isPredefined && !isTIUnlocked
                            ? 'bg-slate-100 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 cursor-not-allowed opacity-90'
                            : 'bg-white dark:bg-neutral-800 border-slate-300 dark:border-neutral-600'
                        }`}
                        title={isPredefined && !isTIUnlocked ? 'Caminho fixo do TI (desbloqueie com a senha do TI para editar)' : 'Caminho na rede'}
                      />

                      {(!isPredefined || isTIUnlocked) && (
                        <button
                          type="button"
                          onClick={() => handleBrowseShortcut(shortcutCompanyTab, idx, shortcut.path)}
                          className="px-2.5 py-1.5 bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors cursor-pointer shrink-0"
                          title="Procurar pasta (Respeita o perímetro corporativo)"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveShortcutClick(shortcutCompanyTab, idx)}
                        className={`p-2 rounded-md transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                          isPredefined && !isTIUnlocked
                            ? 'bg-slate-200 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600'
                            : 'bg-rose-100 dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                        }`}
                        title={
                          isPredefined && !isTIUnlocked
                            ? 'Atalho padrão do TI (requer senha de administrador para excluir)'
                            : 'Excluir atalho'
                        }
                      >
                        {isPredefined && !isTIUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-neutral-700/60">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 Dica: Você também pode salvar a pasta de destino atual como um novo atalho diretamente na tela de <span className="font-semibold text-slate-700 dark:text-slate-300">Mover Pastas</span> com apenas 1 clique.
            </p>

            <button
              type="button"
              onClick={() => handleSaveShortcuts(shortcutCompanyTab)}
              disabled={shortcutsSaving}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-teams-600 hover:bg-teams-700 active:bg-teams-800 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-teams-600/20 cursor-pointer shrink-0"
              title="Salvar alterações nos atalhos"
            >
              <Save className={`w-3.5 h-3.5 ${shortcutsSaving ? 'animate-spin' : ''}`} />
              <span>{shortcutsSaving ? 'Validando...' : `Salvar Atalhos (${config[shortcutCompanyTab]?.companyName || shortcutCompanyTab})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Configurações Corporativas e Domínio - TI */}
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

      {/* Modal: Autenticação para Exclusão de Atalho Padrão do TI */}
      <TIAccessModal
        isOpen={isTIShortcutAuthModalOpen}
        onClose={() => {
          setIsTIShortcutAuthModalOpen(false);
          setPendingDeleteShortcut(null);
        }}
        onSuccess={handleTIShortcutAuthSuccess}
        title="Excluir Atalho Padrão do TI"
        description="Este atalho foi pré-definido pelo TI da empresa. Digite a senha de administrador para autorizar a sua exclusão."
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
