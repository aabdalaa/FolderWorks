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
import { Terminal, Shield } from 'lucide-react';
import { useTheme } from './hooks/useTheme';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [previousTab, setPreviousTab] = useState<AppTab>('dashboard');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTIAccessModalOpen, setIsTIAccessModalOpen] = useState(false);
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
  const [isTIAuthenticated, setIsTIAuthenticated] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [reliquiaStatus, setReliquiaStatus] = useState<boolean | null>(null);
  const [rtoStatus, setRtoStatus] = useState<boolean | null>(null);
  const [serverStatuses, setServerStatuses] = useState<Record<string, boolean | null>>({});
  const { theme, setTheme } = useTheme();

  const handleSelectTab = (tab: AppTab) => {
    if (activeTab !== 'about') {
      setPreviousTab(activeTab);
    }
    setActiveTab(tab);
  };

  const handleToggleAbout = () => {
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
      const keys = Object.keys(cfg).filter(
        (k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword' && k !== 'sharedLogFilePath' && cfg[k] && typeof cfg[k] === 'object'
      );
      keys.forEach((comp) => {
        window.electronAPI?.testServerConnection(comp).then((res) => {
          setServerStatuses((prev) => ({ ...prev, [comp]: res.success }));
          if (comp === 'RELIQUIA') setReliquiaStatus(res.success);
          if (comp === 'RTO') setRtoStatus(res.success);
        });
      });
    };

    window.electronAPI?.getConfig().then((cfg) => {
      testAllServers(cfg);
    });

    const unsubConfig = window.electronAPI?.onConfigUpdated?.((cfg) => {
      testAllServers(cfg);
    });

    return () => {
      if (unsubLog) unsubLog();
      if (unsubConfig) unsubConfig();
    };
  }, []);

  const handleClearLogs = async () => {
    await window.electronAPI?.clearLogs();
    setLogs([]);
  };

  const handleCreateFolder = async (company: string, folderName: string) => {
    return window.electronAPI?.createFolder({ company, folderName });
  };

  const handleTestConnection = async (company: string, overrideConfig?: any) => {
    const res = await window.electronAPI?.testServerConnection(company, overrideConfig);
    setServerStatuses((prev) => ({ ...prev, [company]: res.success }));
    if (company === 'RELIQUIA') setReliquiaStatus(res.success);
    if (company === 'RTO') setRtoStatus(res.success);
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
  const isAnyModalOpen = isTransferModalOpen || isTIAccessModalOpen || isActivityLogModalOpen;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-neutral-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans select-none transition-colors relative">
      {/* 1. Custom Frameless TitleBar */}
      <TitleBar isLocked={isAnyModalOpen} />

      {/* 2. Main Body with Sidebar Navigation */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          reliquiaStatus={reliquiaStatus}
          rtoStatus={rtoStatus}
          serverStatuses={serverStatuses}
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
              />
            )}
            {activeTab === 'rename' && (
              <FolderRenameView />
            )}
            {activeTab === 'dashboard' && (
              <FolderCreationView
                onCreateFolder={handleCreateFolder}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                onTestConnection={handleTestConnection}
                isTIAuthenticated={isTIAuthenticated}
                onUnlockTI={() => setIsTIAuthenticated(true)}
                onLockTI={handleLockTISession}
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
    </div>
  );
};

export default App;
