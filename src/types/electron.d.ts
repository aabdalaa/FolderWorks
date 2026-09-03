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
  selectDirectory: (defaultPath?: string) => Promise<string | null>;
  listSubdirectories: (targetDir: string) => Promise<{ success: boolean; folders: { name: string; fullPath: string; mtime?: string }[]; error?: string }>;
  validateBoundary: (req: { targetPath: string; company: string }) => Promise<{ isValid: boolean; allowedBase: string; message: string }>;
  inspectFolder: (dirPath: string) => Promise<{ exists: boolean; fileCount: number; dirCount: number; totalSize: number }>;
  safeTransferCopy: (req: { company: 'RELIQUIA' | 'RTO'; sourcePath: string; destParentPath: string }) => Promise<{
    success: boolean;
    folderName?: string;
    sourcePath?: string;
    finalDestPath?: string;
    sourceMetrics?: { fileCount: number; dirCount: number; totalSize: number };
    destMetrics?: { fileCount: number; dirCount: number; totalSize: number };
    durationSeconds?: number;
    error?: string;
  }>;
  deleteSourceFolders: (req: { company: string; foldersToDelete: string[] }) => Promise<{ success: boolean; deleted: string[]; errors: string[] }>;
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
