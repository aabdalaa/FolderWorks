import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (cfg: any) => ipcRenderer.invoke('save-config', cfg),
  createFolder: (req: { company: 'RELIQUIA' | 'RTO'; folderName: string }) => ipcRenderer.invoke('create-folder', req),
  getRecentLogs: () => ipcRenderer.invoke('get-recent-logs'),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),
  openLogFile: () => ipcRenderer.invoke('open-log-file'),
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  testServerConnection: (company: 'RELIQUIA' | 'RTO') => ipcRenderer.invoke('test-connection', company),
  buildCustomMSI: (req: { config: any; outputMsiName: string }) => ipcRenderer.invoke('build-custom-msi', req),
  onLog: (callback: (log: string) => void) => {
    const handler = (_: any, data: string) => callback(data);
    ipcRenderer.on('log-entry', handler);
    return () => ipcRenderer.removeListener('log-entry', handler);
  },
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
});
