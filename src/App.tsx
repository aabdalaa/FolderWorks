import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FolderCreationView } from './components/dashboard/FolderCreationView';
import { SettingsView } from './components/settings/SettingsView';
import { HistoryView } from './components/history/HistoryView';
import { UserGuideView } from './components/manual/UserGuideView';
import { MSIBuilderView } from './components/builder/MSIBuilderView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'history' | 'manual' | 'builder'>('dashboard');
  const [logs, setLogs] = useState<string[]>([]);
  const [reliquiaStatus, setReliquiaStatus] = useState<boolean | null>(null);
  const [rtoStatus, setRtoStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Initial logs load
    window.electronAPI?.getRecentLogs().then((l) => setLogs(l));

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
      case 'dashboard':
        return { title: 'Painel de Criação de Pastas de Rede', subtitle: 'Seleção de empresa, digitação do código do cliente e execução segura com Robocopy' };
      case 'settings':
        return { title: 'Parâmetros & Servidores de Rede', subtitle: 'Caminhos UNC de compartilhamentos, IPs de controladores AD e teste de portas' };
      case 'builder':
        return { title: 'Gerador de Pacotes MSI Personalizados', subtitle: 'Interface visual para personalização de variáveis de ambiente e geração de instaladores MSI pré-configurados' };
      case 'history':
        return { title: 'Auditoria & Histórico de Execução', subtitle: 'Registro detalhado das pastas geradas e validações no Active Directory' };
      case 'manual':
        return { title: 'Manual do Usuário & Solução de Problemas', subtitle: 'Documentação interativa de operação, arquitetura e diagnósticos de segurança' };
    }
  };

  const headerInfo = getHeaderDetails();

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Custom Frameless TitleBar */}
      <TitleBar />

      {/* 2. Main Body with Sidebar Navigation */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          reliquiaStatus={reliquiaStatus}
          rtoStatus={rtoStatus}
        />

        {/* Viewport Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/60">
          <Header
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            onOpenLogs={handleOpenLogs}
          />

          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === 'dashboard' && (
              <FolderCreationView
                logs={logs}
                onClearLogs={handleClearLogs}
                onCreateFolder={handleCreateFolder}
              />
            )}
            {activeTab === 'settings' && <SettingsView onTestConnection={handleTestConnection} />}
            {activeTab === 'builder' && <MSIBuilderView />}
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'manual' && <UserGuideView />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
