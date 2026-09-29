import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar, AppTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FolderCreationView } from './components/dashboard/FolderCreationView';
import { FolderTransferView } from './components/transfer/FolderTransferView';
import { FolderRenameView } from './components/rename/FolderRenameView';
import { SettingsView } from './components/settings/SettingsView';
import { HistoryView } from './components/history/HistoryView';
import { UserGuideView } from './components/manual/UserGuideView';
import { AboutView } from './components/about/AboutView';
import { TIAccessModal } from './components/logs/TIAccessModal';
import { ActivityLogModal } from './components/logs/ActivityLogModal';
import { SecurityBoundaryModal } from './components/layout/SecurityBoundaryModal';
import { ToastNotification, ToastData } from './components/layout/ToastNotification';
import { Terminal, Shield } from 'lucide-react';
import { FirstRunPasswordModal } from './components/auth/FirstRunPasswordModal';
import { getCompanyKeys } from './utils/configUtils';
import { useTheme } from './hooks/useTheme';
import { useIconColor } from './hooks/useIconColor';

export const App: React.FC = () => {
  const { setIconColor } = useIconColor();
  const [config, setConfig] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isFirstRunModalOpen, setIsFirstRunModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [previousTab, setPreviousTab] = useState<AppTab>('dashboard');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTIAccessModalOpen, setIsTIAccessModalOpen] = useState(false);
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
  const [isTIAuthenticated, setIsTIAuthenticated] = useState(false);
  const [perimeterBlockedData, setPerimeterBlockedData] = useState<{ chosenPath: string; allowedBasePath: string; company?: string } | null>(null);
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [serverStatuses, setServerStatuses] = useState<Record<string, boolean | null>>({});
  const { theme, setTheme } = useTheme();

  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('folderworks_custom_logo') || null;
  });

  // Primeiro acesso: verifica se a senha do TI está configurada
  useEffect(() => {
    window.electronAPI?.isTIPasswordSet?.().then((isSet) => {
      if (!isSet) {
        setIsFirstRunModalOpen(true);
      }
    });
  }, []);

  // Sincroniza dinamicamente a cor da aplicação conforme o modo e empresa ativa
  useEffect(() => {
    if (!config) return;
    if (config.colorMode === 'per_company') {
      if (selectedCompany && config[selectedCompany]?.colorTheme) {
        setIconColor(config[selectedCompany].colorTheme);
      }
    } else if (config.colorTheme) {
      setIconColor(config.colorTheme);
    }
  }, [selectedCompany, config]);

  const handleUpdateCustomLogo = (logo: string | null) => {
    if (logo) {
      localStorage.setItem('folderworks_custom_logo', logo);
      setCustomLogo(logo);
      window.electronAPI?.setWindowIcon(logo);
    } else {
      localStorage.removeItem('folderworks_custom_logo');
      setCustomLogo(null);
      window.electronAPI?.setWindowIcon(null);
    }
  };

  const handleSelectTab = (tab: AppTab) => {
    // Auto-bloqueio estrito de TI ao navegar para outro módulo
    if (isTIAuthenticated) {
      setIsTIAuthenticated(false);
    }
    if (activeTab !== 'about') {
      setPreviousTab(activeTab);
    }
    setActiveTab(tab);
  };

  const handleToggleAbout = () => {
    if (isTIAuthenticated) {
      setIsTIAuthenticated(false);
    }
    if (activeTab === 'about') {
      setActiveTab(previousTab);
    } else {
      setPreviousTab(activeTab);
      setActiveTab('about');
    }
  };

  useEffect(() => {
    // Initial logs load
    window.electronAPI?.getRecentLogs().then((l) => setLogs(l || []));

    // Subscribe to real-time logs
    const unsubLog = window.electronAPI?.onLog((entry) => {
      setLogs((prev) => [...prev, entry]);
    });

    const testAllServers = (cfg: any) => {
      if (!cfg) return;
      const keys = getCompanyKeys(cfg);
      keys.forEach((comp) => {
        window.electronAPI?.testServerConnection(comp).then((res) => {
          setServerStatuses((prev) => ({ ...prev, [comp]: res.success }));
        });
      });
    };

    const handleConfigData = (cfg: any) => {
      if (!cfg) return;
      setConfig(cfg);
      testAllServers(cfg);
      const keys = getCompanyKeys(cfg);
      if (keys.length > 0) {
        setSelectedCompany((prev) => (keys.includes(prev) ? prev : keys[0]));
      }
      if (cfg?.customLogo) {
        setCustomLogo(cfg.customLogo);
        window.electronAPI?.setWindowIcon(cfg.customLogo);
      } else {
        const localLogo = localStorage.getItem('folderworks_custom_logo');
        if (localLogo) {
          window.electronAPI?.setWindowIcon(localLogo);
        }
      }
    };

    window.electronAPI?.getConfig().then(handleConfigData);
    const unsubConfig = window.electronAPI?.onConfigUpdated?.(handleConfigData);

    const unsubPerimeter = window.electronAPI?.onPerimeterBlocked?.((data) => {
      setPerimeterBlockedData(data);
    });

    return () => {
      if (unsubLog) unsubLog();
      if (unsubConfig) unsubConfig();
      if (unsubPerimeter) unsubPerimeter();
    };
  }, []);

  const handleClearLogs = async () => {
    await window.electronAPI?.clearLogs();
    setLogs([]);
  };

  const handleCreateFolder = async (company: string, folderName: string) => {
    return window.electronAPI?.createFolder({ company, folderName });
  };

  const handleCreateEmptyFolder = async (company: string, folderName: string) => {
    return window.electronAPI?.createEmptyFolder({ company, folderName });
  };

  const handleTestConnection = async (company: string, overrideConfig?: any) => {
    const res = await window.electronAPI?.testServerConnection(company, overrideConfig);
    setServerStatuses((prev) => ({ ...prev, [company]: res.success }));
    return res;
  };

  const handleOpenTILogs = () => {
    if (isTIAuthenticated) {
      setIsActivityLogModalOpen(true);
    } else {
      setIsTIAccessModalOpen(true);
    }
  };

  const handleTISuccess = () => {
    setIsTIAuthenticated(true);
    setIsTIAccessModalOpen(false);
    setIsActivityLogModalOpen(true);
  };

  const handleLockTISession = () => {
    setIsTIAuthenticated(false);
    setIsActivityLogModalOpen(false);
  };

  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'transfer':
        return {
          title: 'Mover Pastas',
          subtitle: 'Selecione as pastas e o destino para realizar a transferência',
        };
      case 'rename':
        return {
          title: 'Renomear Pasta',
          subtitle: 'Selecione um diretório corporativo e defina o novo nome desejado',
        };
      case 'dashboard':
        return {
          title: 'Criar Pasta',
          subtitle: 'Selecione a empresa e digite o nome da pasta',
        };
      case 'settings':
        return {
          title: 'Configurações',
          subtitle: 'Pastas padrão e preferências do sistema',
        };
      case 'history':
        return {
          title: 'Histórico',
          subtitle: 'Registro das ações realizadas no aplicativo',
        };
      case 'manual':
        return {
          title: 'Manual de Uso',
          subtitle: 'Instruções simples de operação e dúvidas frequentes',
        };
      case 'about':
        return {
          title: 'Sobre o Desenvolvedor & Entropy',
          subtitle: 'Informações sobre o projeto, identidade Entropy e canais de contato',
        };
    }
  };

  const headerInfo = getHeaderDetails();
  const isAnyModalOpen = isTransferModalOpen || isTIAccessModalOpen || isActivityLogModalOpen || isFirstRunModalOpen;

  // Logotipo dinâmico: Prioriza o logotipo da empresa selecionada, depois o geral do app, depois o default
  const currentActiveLogo =
    (selectedCompany && config?.[selectedCompany]?.companyLogo) ||
    config?.customLogo ||
    customLogo ||
    null;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-neutral-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans select-none transition-colors relative">
      {/* 1. Custom Frameless TitleBar */}
      <TitleBar isLocked={isAnyModalOpen} customLogo={currentActiveLogo} />

      {/* 2. Main Body with Sidebar Navigation */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          serverStatuses={serverStatuses}
          customLogo={currentActiveLogo}
        />

        {/* Viewport Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100/60 dark:bg-neutral-950/80 relative">
          <Header
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            theme={theme}
            onSetTheme={setTheme}
            onOpenAbout={handleToggleAbout}
            isAboutActive={activeTab === 'about'}
          />

          <main className="flex-1 overflow-y-auto p-6 pb-12">
            {activeTab === 'transfer' && (
              <FolderTransferView
                onModalStateChange={setIsTransferModalOpen}
                selectedCompany={selectedCompany}
                onCompanyChange={setSelectedCompany}
              />
            )}
            {activeTab === 'rename' && (
              <FolderRenameView
                onShowToast={(data) => setToastData(data)}
                selectedCompany={selectedCompany}
                onCompanyChange={setSelectedCompany}
              />
            )}
            {activeTab === 'dashboard' && (
              <FolderCreationView
                onCreateFolder={handleCreateFolder}
                onCreateEmptyFolder={handleCreateEmptyFolder}
                onShowToast={(data) => setToastData(data)}
                selectedCompany={selectedCompany}
                onCompanyChange={setSelectedCompany}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                onTestConnection={handleTestConnection}
                isTIAuthenticated={isTIAuthenticated}
                onUnlockTI={() => setIsTIAuthenticated(true)}
                onLockTI={handleLockTISession}
                customLogo={customLogo}
                onUpdateCustomLogo={handleUpdateCustomLogo}
              />
            )}
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'manual' && <UserGuideView />}
            {activeTab === 'about' && <AboutView onBack={() => setActiveTab(previousTab)} />}
          </main>
        </div>
      </div>

      {/* 3. Botão Discreto e Escondido no Canto Inferior Direito para o TI */}
      <div className="fixed bottom-2.5 right-3 z-30">
        <button
          onClick={handleOpenTILogs}
          className="group flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-200/40 hover:bg-slate-200 dark:bg-neutral-800/30 dark:hover:bg-neutral-800 border border-slate-300/30 dark:border-neutral-700/30 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[11px] font-mono opacity-25 hover:opacity-100 transition-all shadow-xs cursor-pointer"
          title="Acesso Privado TI - Registro de Atividades"
        >
          {isTIAuthenticated ? (
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Terminal className="w-3.5 h-3.5" />
          )}
          <span className="text-[10px] hidden group-hover:inline tracking-wider">
            {isTIAuthenticated ? 'TI (CONECTADO)' : 'REGISTRO TI'}
          </span>
        </button>
      </div>

      {/* 4. Modal de Autenticação Segura de TI */}
      <TIAccessModal
        isOpen={isTIAccessModalOpen}
        onClose={() => setIsTIAccessModalOpen(false)}
        onSuccess={handleTISuccess}
      />

      {/* 5. Modal de Registro de Atividades (Auditoria TI) */}
      <ActivityLogModal
        isOpen={isActivityLogModalOpen}
        logs={logs}
        onClose={() => setIsActivityLogModalOpen(false)}
        onClearLogs={handleClearLogs}
        onLockSession={handleLockTISession}
      />

      {/* 6. Modal de Bloqueio de Perímetro de TI Estilizado (Fluent Design) */}
      <SecurityBoundaryModal
        isOpen={!!perimeterBlockedData}
        onClose={() => setPerimeterBlockedData(null)}
        chosenPath={perimeterBlockedData?.chosenPath || ''}
        allowedBasePath={perimeterBlockedData?.allowedBasePath || ''}
        company={perimeterBlockedData?.company}
      />

      {/* 7. Pop-up Toast Estilo Windows (10s Countdown com Ações) */}
      <ToastNotification
        toast={toastData}
        onClose={() => setToastData(null)}
      />

      {/* 8. Modal de Definição de Senha Mestra no Primeiro Acesso */}
      <FirstRunPasswordModal
        isOpen={isFirstRunModalOpen}
        onSuccess={() => {
          setIsFirstRunModalOpen(false);
          setIsTIAuthenticated(true);
        }}
      />
    </div>
  );
};

export default App;
