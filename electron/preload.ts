import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (cfg: any) => ipcRenderer.invoke('save-config', cfg),
  resetConfig: () => ipcRenderer.invoke('reset-config'),
  createFolder: (req: { company: string; folderName: string }) => ipcRenderer.invoke('create-folder', req),
  getRecentLogs: () => ipcRenderer.invoke('get-recent-logs'),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),
  openLogFile: () => ipcRenderer.invoke('open-log-file'),
  verifyTIPassword: (password: string) => ipcRenderer.invoke('verify-ti-password', password),
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  testServerConnection: (company: string) => ipcRenderer.invoke('test-connection', company),
  buildCustomMSI: (req: { config: any; outputMsiName: string }) => ipcRenderer.invoke('build-custom-msi', req),
  selectDirectory: (defaultPath?: string) => ipcRenderer.invoke('select-directory', defaultPath),
  validateBoundary: (req: { targetPath: string; company: string }) => ipcRenderer.invoke('validate-boundary', req),
  inspectFolder: (dirPath: string) => ipcRenderer.invoke('inspect-folder', dirPath),
  listSubdirectories: (targetDir: string, company?: string) => ipcRenderer.invoke('list-subdirectories', { targetDir, company }),
  safeTransferCopy: (req: { company: string; sourcePath: string; destParentPath: string }) => ipcRenderer.invoke('safe-transfer-copy', req),
  deleteSourceFolders: (req: { company: string; foldersToDelete: string[] }) => ipcRenderer.invoke('delete-source-folders', req),
  undoTransfer: (req: { company: string; foldersToUndo: string[] }) => ipcRenderer.invoke('undo-transfer', req),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  onLog: (callback: (log: string) => void) => {
    const handler = (_: any, data: string) => callback(data);
    ipcRenderer.on('log-entry', handler);
    return () => ipcRenderer.removeListener('log-entry', handler);
  },
  onConfigUpdated: (callback: (cfg: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('config-updated', handler);
    return () => ipcRenderer.removeListener('config-updated', handler);
  },
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
});
