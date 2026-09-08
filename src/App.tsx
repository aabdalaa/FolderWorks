import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar, AppTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FolderCreationView } from './components/dashboard/FolderCreationView';
import { FolderTransferView } from './components/transfer/FolderTransferView';
import { SettingsView } from './components/settings/SettingsView';
import { HistoryView } from './components/history/HistoryView';
import { UserGuideView } from './components/manual/UserGuideView';
import { AboutView } from './components/about/AboutView';
import { useTheme } from './hooks/useTheme';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [reliquiaStatus, setReliquiaStatus] = useState<boolean | null>(null);
  const [rtoStatus, setRtoStatus] = useState<boolean | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Initial logs load
    window.electronAPI?.getRecentLogs().then((l) => setLogs(l || []));

    // Subscribe to real-time logs
    const unsubLog = window.electronAPI?.onLog((entry) => {
      setLogs((prev) => [...prev, entry]);
    });

    // Test server connections
    window.electronAPI?.testServerConnection('RELIQUIA').then((res) => setReliquiaStatus(res.success));
    window.electronAPI?.testServerConnection('RTO').then((res) => setRtoStatus(res.success));

    return () => {
      if (unsubLog) unsubLog();
    };
  }, []);

  const handleClearLogs = async () => {
    await window.electronAPI?.clearLogs();
    setLogs([]);
  };

  const handleOpenLogs = async () => {
    await window.electronAPI?.openLogFile();
  };

  const handleCreateFolder = async (company: 'RELIQUIA' | 'RTO', folderName: string) => {
    return window.electronAPI?.createFolder({ company, folderName });
  };

  const handleTestConnection = async (company: 'RELIQUIA' | 'RTO') => {
    const res = await window.electronAPI?.testServerConnection(company);
    if (company === 'RELIQUIA') setReliquiaStatus(res.success);
    if (company === 'RTO') setRtoStatus(res.success);
    return res;
  };

  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'transfer':
        return {
          title: 'Transferência de Pastas',
          subtitle: 'Selecione as pastas e o destino para realizar a transferência',
        };
      case 'dashboard':
        return {
          title: 'Criação de Pastas',
          subtitle: 'Selecione a empresa e digite o código ou nome do cliente',
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

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-neutral-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans select-none transition-colors">
      {/* 1. Custom Frameless TitleBar */}
      <TitleBar isLocked={isModalOpen} />

      {/* 2. Main Body with Sidebar Navigation */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          reliquiaStatus={reliquiaStatus}
          rtoStatus={rtoStatus}
        />

        {/* Viewport Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100/60 dark:bg-neutral-950/80">
          <Header
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            onOpenLogs={handleOpenLogs}
            theme={theme}
            onSetTheme={setTheme}
          />

          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === 'transfer' && (
              <FolderTransferView
                logs={logs}
                onOpenLogs={handleOpenLogs}
                onModalStateChange={setIsModalOpen}
              />
            )}
            {activeTab === 'dashboard' && (
              <FolderCreationView
                logs={logs}
                onClearLogs={handleClearLogs}
                onCreateFolder={handleCreateFolder}
              />
            )}
            {activeTab === 'settings' && <SettingsView onTestConnection={handleTestConnection} />}
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'manual' && <UserGuideView />}
            {activeTab === 'about' && <AboutView />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
