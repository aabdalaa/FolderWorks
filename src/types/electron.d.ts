export interface ElectronAPI {
  getConfig: () => Promise<any>;
  saveConfig: (cfg: any) => Promise<any>;
  resetConfig: () => Promise<any>;
  createFolder: (req: { company: string; folderName: string }) => Promise<{ success: boolean; error?: string }>;
  getRecentLogs: () => Promise<string[]>;
  clearLogs: () => Promise<boolean>;
  openLogFile: () => Promise<boolean>;
  verifyTIPassword: (password: string) => Promise<boolean>;
  getHistory: () => Promise<any[]>;
  clearHistory: () => Promise<any[]>;
  testServerConnection: (company: string, overrideConfig?: any) => Promise<{ success: boolean; message: string }>;
  renameFolder: (req: { targetPath: string; newName: string; company?: string }) => Promise<{ success: boolean; newPath?: string; oldName?: string; newName?: string; error?: string }>;
  buildCustomMSI: (req: { config: any; outputMsiName: string }) => Promise<{ success: boolean; msiPath?: string; error?: string }>;
  selectDirectory: (defaultPath?: string) => Promise<string | null>;
  listSubdirectories: (targetDir: string, company?: string) => Promise<{ success: boolean; folders: { name: string; fullPath: string; mtime?: string }[]; error?: string }>;
  validateBoundary: (req: { targetPath: string; company: string }) => Promise<{ isValid: boolean; allowedBase: string; message: string }>;
  inspectFolder: (dirPath: string) => Promise<{ exists: boolean; fileCount: number; dirCount: number; totalSize: number }>;
  safeTransferCopy: (req: { company: string; sourcePath: string; destParentPath: string }) => Promise<{
    success: boolean;
    folderName?: string;
    sourcePath?: string;
    finalDestPath?: string;
    sourceMetrics?: { fileCount: number; dirCount: number; totalSize: number };
    destMetrics?: { fileCount: number; dirCount: number; totalSize: number };
    durationSeconds?: number;
    method?: 'atomic_move' | 'robocopy';
    error?: string;
  }>;
  deleteSourceFolders: (req: { company: string; foldersToDelete: string[] }) => Promise<{ success: boolean; deleted: string[]; errors: string[] }>;
  undoTransfer: (req: { company: string; foldersToUndo?: string[]; items?: Array<{ sourcePath: string; destPath: string; method?: string }> }) => Promise<{ success: boolean; undone: string[]; errors: string[] }>;
  openExternal: (url: string) => Promise<boolean>;
  onLog: (callback: (log: string) => void) => () => void;
  onConfigUpdated: (callback: (cfg: any) => void) => () => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
