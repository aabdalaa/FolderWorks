export interface ElectronAPI {
  getConfig: () => Promise<any>;
  saveConfig: (cfg: any) => Promise<any>;
  createFolder: (req: { company: 'RELIQUIA' | 'RTO'; folderName: string }) => Promise<{ success: boolean; error?: string }>;
  getRecentLogs: () => Promise<string[]>;
  clearLogs: () => Promise<boolean>;
  openLogFile: () => Promise<boolean>;
  getHistory: () => Promise<any[]>;
  clearHistory: () => Promise<any[]>;
  testServerConnection: (company: 'RELIQUIA' | 'RTO') => Promise<{ success: boolean; message: string }>;
  buildCustomMSI: (req: { config: any; outputMsiName: string }) => Promise<{ success: boolean; msiPath?: string; error?: string }>;
  onLog: (callback: (log: string) => void) => () => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
