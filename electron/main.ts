import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { exec, execFile, execSync } from 'child_process';

let mainWindow: BrowserWindow | null = null;

// Persistent Logs & History Path
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');
const historyPath = path.join(userDataPath, 'history.json');
const logsPath = path.join(userDataPath, 'app.log');
const auditEventsLocalDir = path.join(userDataPath, 'audit_events');
const pendingAuditDir = path.join(userDataPath, 'pending_audit');

try {
  if (!fs.existsSync(auditEventsLocalDir)) fs.mkdirSync(auditEventsLocalDir, { recursive: true });
  if (!fs.existsSync(pendingAuditDir)) fs.mkdirSync(pendingAuditDir, { recursive: true });
} catch {}

// Default Corporate Config with IT Governance Perimeter
const defaultCompanyConfigs: Record<string, any> = {
  RTO: {
    companyName: 'RTO',
    domainUser: String.raw`RTO\pasta.paralegal`,
    adPass: 'Mestre@300',
    adServerIp: '192.168.50.102',
    sourcePath: String.raw`\\192.168.50.102\rto\MODELOS\MODELO DE PASTAS\EM USO\MODELO 2026`,
    destSharePath: String.raw`\\192.168.50.102\rto\CLIENTES\EMPRESAS`,
    allowedBasePath: String.raw`\\192.168.50.102\rto\CLIENTES`,
    defaultSourceFolder: String.raw`\\192.168.50.102\rto\CLIENTES\EMPRESAS`,
    presetDestinations: [
      { name: '00 - EX CLIENTES', path: String.raw`\\192.168.50.102\rto\CLIENTES\00 - EX CLIENTES` },
      { name: '01 - EMPRESAS ENCERRADAS', path: String.raw`\\192.168.50.102\rto\CLIENTES\01 - EMPRESAS ENCERRADAS` }
    ]
  },
  RELIQUIA: {
    companyName: 'RELIQUIA',
    domainUser: String.raw`RELIQUIA\pasta.paralegal`,
    adPass: 'Mestre@300',
    adServerIp: '192.168.1.242',
    sourcePath: String.raw`\\192.168.1.242\gpo\criarpastas_paralegal\MODELO`,
    destSharePath: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS`,
    allowedBasePath: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES`,
    defaultSourceFolder: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS`,
    presetDestinations: [
      { name: '00 - EX CLIENTES', path: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\00 - EX CLIENTES` },
      { name: '01 - EMPRESAS ENCERRADAS', path: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\01 - EMPRESAS ENCERRADAS` }
    ]
  }
};

// Corporate Default Config embedded in MSI resources
const bundledConfigPath = path.join(process.resourcesPath, 'default_config.json');

function sanitizeConfig(cfg: any): any {
  if (!cfg || typeof cfg !== 'object') return { ...defaultCompanyConfigs };
  const sanitized: Record<string, any> = {};

  if (cfg.tiLogsPassword) {
    sanitized.tiLogsPassword = String(cfg.tiLogsPassword).trim();
  }

  const companyKeys = Object.keys(cfg).filter(
    (k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword'
  );

  if (companyKeys.length === 0) {
    return { ...defaultCompanyConfigs, ...(cfg.tiLogsPassword ? { tiLogsPassword: cfg.tiLogsPassword } : {}) };
  }

  for (const comp of companyKeys) {
    const raw = cfg[comp];
    if (raw && typeof raw === 'object') {
      const def = defaultCompanyConfigs[comp] || {};
      const compName = raw.companyName || raw.name || comp;
      const dest = raw.destSharePath || raw.destinationParentPath || def.destSharePath || '';
      sanitized[comp] = {
        name: compName,
        companyName: compName,
        domainUser: raw.domainUser || def.domainUser || `${compName}\\pasta.paralegal`,
        adPass: raw.adPass || def.adPass || 'Mestre@300',
        adServerIp: raw.adServerIp || def.adServerIp || '',
        sourcePath: raw.sourcePath || def.sourcePath || '',
        destSharePath: dest,
        destinationParentPath: dest,
        allowedBasePath: raw.allowedBasePath || def.allowedBasePath || dest,
        defaultSourceFolder: raw.defaultSourceFolder || def.defaultSourceFolder || dest,
        presetDestinations: Array.isArray(raw.presetDestinations)
          ? raw.presetDestinations
          : (def.presetDestinations || []),
      };
    }
  }

  return sanitized;
}

function loadConfig(): any {
  // 1. Prioridade absoluta: Configurações personalizadas e salvas pelo TI em userData
  if (fs.existsSync(configPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const sanitized = sanitizeConfig(parsed);
      if (parsed.tiLogsPassword) sanitized.tiLogsPassword = parsed.tiLogsPassword;
      return sanitized;
    } catch (e) {
      appendLog(`[CONFIG] Falha ao ler config.json do userData: ${e}`);
    }
  }

  // 2. Configurações corporativas pré-embutidas no instalador MSI
  if (fs.existsSync(bundledConfigPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(bundledConfigPath, 'utf-8'));
      const sanitized = sanitizeConfig(parsed);
      if (parsed.tiLogsPassword) sanitized.tiLogsPassword = parsed.tiLogsPassword;
      return sanitized;
    } catch (e) {}
  }

  // 3. Fallback de fábrica do código-fonte
  return sanitizeConfig({ ...defaultCompanyConfigs });
}

function getTIPassword(): string {
  const cfg = loadConfig();
  if (cfg && cfg.tiLogsPassword) return String(cfg.tiLogsPassword).trim();
  if (process.env.TI_LOGS_PASSWORD) return process.env.TI_LOGS_PASSWORD.trim();

  // Tentar encontrar no .env em modo de desenvolvimento ou desempacotado
  const candidates = [
    path.join(app.getAppPath(), '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        const m = raw.match(/^\s*TI_LOGS_PASSWORD\s*=\s*"?([^"\r\n]+)"?/m);
        if (m && m[1]) return m[1].trim();
      } catch {}
    }
  }

  return 'mestre@300';
}

function getCompanyConfig(company: string) {
  const all = loadConfig();
  const companyKeys = Object.keys(all).filter(k => k !== 'isLockedByMSI' && k !== 'tiLogsPassword');
  return all[company] || (companyKeys.length > 0 ? all[companyKeys[0]] : defaultCompanyConfigs['RELIQUIA']);
  return all[company] || (companyKeys.length > 0 ? all[companyKeys[0]] : defaultCompanyConfigs['RTO']);
}

function saveConfig(cfg: any) {
  const sanitized = sanitizeConfig(cfg);
  fs.writeFileSync(configPath, JSON.stringify(sanitized, null, 2), 'utf-8');
  if (mainWindow) {
    mainWindow.webContents.send('config-updated', sanitized);
  }
}

function appendLog(msg: string) {
  const time = new Date().toLocaleTimeString('pt-BR');
  const line = `[${time}] ${msg}`;
  fs.appendFileSync(logsPath, line + '\n', 'utf-8');
  if (mainWindow) {
    mainWindow.webContents.send('log-entry', line);
    mainWindow.webContents.send('log-updated', line);
  }
}

function getLocalOperatorInfo() {
  let username = process.env.USERNAME || '';
  if (!username) {
    try {
      username = os.userInfo().username;
    } catch {}
  }
  const computerName = os.hostname() || process.env.COMPUTERNAME || 'DESCONHECIDO';
  const userDomain = process.env.USERDOMAIN || '';
  let ipAddress = '';
  try {
    const interfaces = os.networkInterfaces();
    for (const ifaceName of Object.keys(interfaces)) {
      for (const iface of interfaces[ifaceName] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ipAddress = iface.address;
          break;
        }
      }
      if (ipAddress) break;
    }
  } catch {}

  return {
    username: username || 'Operador',
    computerName,
    userDomain,
    ipAddress,
  };
}

function getCompanyAuditDir(company: string): string | null {
  if (company === 'RTO') {
    return String.raw`\\192.168.50.102\rto\CLIENTES\.folderworks_audit`;
  }
  if (company === 'RELIQUIA') {
    return String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\.folderworks_audit`;
  }
  try {
    const cfg = loadConfig();
    const compCfg = cfg[company] || defaultCompanyConfigs[company];
    if (compCfg?.allowedBasePath) {
      return path.join(compCfg.allowedBasePath, '.folderworks_audit');
    }
  } catch {}
  return null;
}

function getAllCompanyAuditDirs(): string[] {
  const dirs: string[] = [
    String.raw`\\192.168.50.102\rto\CLIENTES\.folderworks_audit`,
    String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\.folderworks_audit`,
  ];
  try {
    const cfg = loadConfig();
    for (const comp of Object.keys(cfg)) {
      const dir = getCompanyAuditDir(comp);
      if (dir && !dirs.includes(dir)) {
        dirs.push(dir);
      }
    }
  } catch {}
  return dirs;
}

export interface SharedAuditEvent {
  id: string;
  timestamp: string;
  isoTimestamp: string;
  company: string;
  action: string;
  actionLabel?: string;
  folderName: string;
  sourcePath?: string;
  targetPath?: string;
  finalPath?: string;
  operator: {
    username: string;
    computerName: string;
    userDomain: string;
    ipAddress?: string;
  };
  executedBy?: string;
  impersonatedUser?: string;
  status: string;
  durationSeconds: number;
  details?: string;
  appVersion: string;
}

const memoryAuditCache = new Map<string, SharedAuditEvent>();

function saveHistoryEntry(input: any) {
  const operator = getLocalOperatorInfo();
  const now = new Date();
  const id = input.id || `evt_${Date.now()}_${operator.computerName.replace(/\W/g, '')}_${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = input.timestamp || now.toLocaleString('pt-BR');
  const isoTimestamp = input.isoTimestamp || now.toISOString();
  const durationSeconds = typeof input.durationSeconds === 'number' ? input.durationSeconds : 1;

  let action = input.action || '';
  let actionLabel = input.actionLabel || '';
  if (!action) {
    if (input.status === 'TRANSFER_COMPLETED_AND_PURGED' || (input.finalPath && String(input.finalPath).includes('EXCLUIDO'))) {
      action = 'EXCLUIR_ORIGEM';
      actionLabel = 'Exclusão Origem';
    } else if (input.status === 'UNDO_COMPLETED' || (input.finalPath && String(input.finalPath).includes('DESFEITO'))) {
      action = 'DESFAZER_TRANSFERENCIA';
      actionLabel = 'Desfazer Transferência';
    } else if (input.details && String(input.details).includes('Renomear')) {
      action = 'RENOMEAR_PASTA';
      actionLabel = 'Renomear Pasta';
    } else if (input.status === 'SUCCESS' && input.sourcePath && input.finalDestPath) {
      action = 'MOVER_PASTA';
      actionLabel = 'Mover Pasta';
    } else {
      action = 'CRIAR_PASTA';
      actionLabel = 'Criar Pasta';
    }
  }
  if (!actionLabel) {
    switch (action) {
      case 'CRIAR_PASTA': actionLabel = 'Criar Pasta'; break;
      case 'MOVER_PASTA': actionLabel = 'Mover Pasta'; break;
      case 'RENOMEAR_PASTA': actionLabel = 'Renomear Pasta'; break;
      case 'EXCLUIR_ORIGEM': actionLabel = 'Exclusão Origem'; break;
      case 'DESFAZER_TRANSFERENCIA': actionLabel = 'Desfazer Transferência'; break;
      default: actionLabel = action; break;
    }
  }

  const record: SharedAuditEvent = {
    id,
    timestamp,
    isoTimestamp,
    company: input.company || 'CORPORATIVO',
    action,
    actionLabel,
    folderName: input.folderName || 'Pasta',
    sourcePath: input.sourcePath,
    targetPath: input.targetPath || input.finalPath,
    finalPath: input.finalPath || input.targetPath,
    operator,
    executedBy: `${operator.computerName}\\${operator.username}`,
    impersonatedUser: input.executedBy,
    status: input.status || 'SUCCESS',
    durationSeconds,
    details: input.details,
    appVersion: '2.9.0',
  };

  // 1. Guardar no cache de memória local
  memoryAuditCache.set(record.id, record);

  // 2. Salvar localmente no audit_events e no history.json
  try {
    const localEventFile = path.join(auditEventsLocalDir, `${record.id}.json`);
    fs.writeFileSync(localEventFile, JSON.stringify(record, null, 2), 'utf-8');

    let list: any[] = [];
    if (fs.existsSync(historyPath)) {
      try {
        list = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      } catch {}
    }
    list.unshift(record);
    if (list.length > 500) list = list.slice(0, 500);
    fs.writeFileSync(historyPath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e: any) {
    appendLog(`[AUDITORIA LOCAL ERRO] ${e.message}`);
  }

  // 3. Salvar no compartilhamento de rede descentralizado (P2P SMB)
  try {
    const netDir = getCompanyAuditDir(record.company);
    if (netDir) {
      const netEventsDir = path.join(netDir, 'events');
      if (!fs.existsSync(netEventsDir)) {
        fs.mkdirSync(netEventsDir, { recursive: true });
      }
      const netEventFile = path.join(netEventsDir, `${record.id}.json`);
      fs.writeFileSync(netEventFile, JSON.stringify(record, null, 2), 'utf-8');

      // Append no log de auditoria em texto compartilhado
      const netLogFile = path.join(netDir, 'network_activity.log');
      const logLine = `[${record.timestamp}] [${operator.computerName}\\${operator.username}] [${record.company}] [${record.action}] ${record.status} (${record.durationSeconds}s) - '${record.folderName}'\n`;
      fs.appendFileSync(netLogFile, logLine, 'utf-8');
      appendLog(`[AUDITORIA REDE SUCESSO] Gravado na rede em: ${netEventFile}`);
    }
  } catch (netErr: any) {
    try {
      const pendingFile = path.join(pendingAuditDir, `${record.id}.json`);
      fs.writeFileSync(pendingFile, JSON.stringify(record, null, 2), 'utf-8');
    } catch {}
    appendLog(`[AUDITORIA REDE PENDENTE] Salvo localmente para envio posterior: ${netErr.message}`);
  }

  // 4. Notificar a interface
  if (mainWindow) {
    mainWindow.webContents.send('history-updated', record);
  }
}

function syncNetworkAuditEvents(): boolean {
  let foundNew = false;
  const auditDirs = getAllCompanyAuditDirs();

  for (const auditDir of auditDirs) {
    try {
      const netEventsDir = path.join(auditDir, 'events');
      if (!fs.existsSync(netEventsDir)) continue;

      // 1. Flush de eventos pendentes locais para a rede
      try {
        if (fs.existsSync(pendingAuditDir)) {
          const pendingFiles = fs.readdirSync(pendingAuditDir);
          for (const pf of pendingFiles) {
            if (!pf.endsWith('.json')) continue;
            const fullPending = path.join(pendingAuditDir, pf);
            const targetNet = path.join(netEventsDir, pf);
            try {
              fs.copyFileSync(fullPending, targetNet);
              fs.unlinkSync(fullPending);
              appendLog(`[AUDITORIA FLUSH] Evento pendente sincronizado com sucesso na rede: ${pf}`);
            } catch {}
          }
        }
      } catch {}

      // 2. Ler eventos existentes na rede
      const files = fs.readdirSync(netEventsDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const id = file.replace('.json', '');
        if (memoryAuditCache.has(id)) continue;

        try {
          const filePath = path.join(netEventsDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const ev = JSON.parse(content);
          if (ev && ev.id) {
            memoryAuditCache.set(ev.id, ev);
            foundNew = true;
          }
        } catch {}
      }
    } catch {}
  }

  // Carregar eventos locais pré-existentes se não estiverem na memória
  if (fs.existsSync(historyPath)) {
    try {
      const localList = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      if (Array.isArray(localList)) {
        for (const item of localList) {
          if (item && item.id && !memoryAuditCache.has(item.id)) {
            memoryAuditCache.set(item.id, item);
          }
        }
      }
    } catch {}
  }

  return foundNew;
}

function getFolderMetrics(dirPath: string): { fileCount: number; dirCount: number; totalSize: number } {
  let fileCount = 0;
  let dirCount = 0;
  let totalSize = 0;
  if (!fs.existsSync(dirPath)) return { fileCount, dirCount, totalSize };

  function walk(curr: string) {
    try {
      const entries = fs.readdirSync(curr, { withFileTypes: true });
      for (const entry of entries) {
        const p = path.join(curr, entry.name);
        if (entry.isDirectory()) {
          dirCount++;
          walk(p);
        } else if (entry.isFile()) {
          fileCount++;
          try {
            const st = fs.statSync(p);
            totalSize += st.size;
          } catch {}
        }
      }
    } catch {}
  }
  walk(dirPath);
  return { fileCount, dirCount, totalSize };
}

let isTransferInProgress = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'FolderWorks',
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.maximize();

  mainWindow.on('close', (e) => {
    if (isTransferInProgress) {
      e.preventDefault();
      dialog.showMessageBox(mainWindow!, {
        type: 'warning',
        buttons: ['Continuar Transferência', 'Cancelar e Fechar Mesmo Assim'],
        defaultId: 0,
        cancelId: 0,
        title: 'Transferência em Andamento - FolderWorks',
        message: 'Uma transferência de pastas está em execução neste momento!',
        detail: 'Fechar o aplicativo agora interromperá o processo de cópia do Robocopy e poderá deixar arquivos incompletos ou corrompidos no destino.\n\nO recomendado é aguardar a conclusão antes de fechar o programa.',
      }).then(({ response }) => {
        if (response === 1) {
          isTransferInProgress = false;
          mainWindow?.destroy();
        }
      });
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  appendLog('=========================================================');
  appendLog(' LOG ENTROPY FOLDERWORKS - INICIALIZADO EM ' + new Date().toLocaleString('pt-BR'));
  appendLog('=========================================================');
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    try {
      syncNetworkAuditEvents();
    } catch {}
    // Sincronização periódica silenciosa em background a cada 6 segundos
    setInterval(() => {
      try {
        const foundNew = syncNetworkAuditEvents();
        if (foundNew && mainWindow) {
          mainWindow.webContents.send('history-updated', { total: memoryAuditCache.size });
        }
      } catch {}
    }, 6000);
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-config', () => loadConfig());
ipcMain.handle('save-config', (_, cfg) => {
  saveConfig(cfg);
  appendLog('[CONFIG] Configurações de rede atualizadas com sucesso pelo TI.');
  return { success: true };
});
ipcMain.handle('reset-config', () => {
  if (fs.existsSync(configPath)) {
    try {
      fs.unlinkSync(configPath);
    } catch (e) {}
  }
  const resetCfg = loadConfig();
  if (mainWindow) {
    mainWindow.webContents.send('config-updated', resetCfg);
  }
  appendLog('[CONFIG] Configurações redefinidas para os padrões corporativos de fábrica pelo TI.');
  return { success: true, config: resetCfg };
});

ipcMain.handle('get-logs', () => {
  if (fs.existsSync(logsPath)) {
    const raw = fs.readFileSync(logsPath, 'utf-8');
    return raw.split('\n').filter(Boolean);
  }
  return [];
});

ipcMain.handle('clear-logs', () => {
  fs.writeFileSync(logsPath, '', 'utf-8');
  appendLog('[LOGS] Histórico de log limpo pelo operador.');
  return { success: true };
});

ipcMain.handle('get-recent-logs', () => {
  if (fs.existsSync(logsPath)) {
    const raw = fs.readFileSync(logsPath, 'utf-8');
    return raw.split('\n').filter(Boolean).slice(-200);
  }
  return [];
});

ipcMain.handle('open-log-file', async () => {
  if (fs.existsSync(logsPath)) {
    await shell.openPath(logsPath);
    return true;
  }
  return false;
});

ipcMain.handle('verify-ti-password', async (_event, passwordInput: string) => {
  const correct = getTIPassword();
  const trimmedInput = typeof passwordInput === 'string' ? passwordInput.trim() : '';
  const trimmedCorrect = correct.trim();
  const isValid = Boolean(trimmedInput) && (trimmedInput === trimmedCorrect || trimmedInput.toLowerCase() === trimmedCorrect.toLowerCase());
  if (isValid) {
    appendLog('[AUDITORIA TI] Acesso aos registros de atividade desbloqueado pelo operador.');
  } else {
    appendLog('[AUDITORIA TI ALERTA] Tentativa de acesso aos registros com senha incorreta.');
  }
  return isValid;
});

ipcMain.handle('open-external', async (_, url: string) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle('get-history', () => {
  try {
    syncNetworkAuditEvents();
  } catch {}

  const all = Array.from(memoryAuditCache.values());
  // Ordenar decrescente por data/hora
  all.sort((a, b) => {
    const tA = a.isoTimestamp ? new Date(a.isoTimestamp).getTime() : (parseInt(String(a.id).replace(/\D/g, '')) || 0);
    const tB = b.isoTimestamp ? new Date(b.isoTimestamp).getTime() : (parseInt(String(b.id).replace(/\D/g, '')) || 0);
    return tB - tA;
  });

  return all.slice(0, 500);
});

ipcMain.handle('clear-history', () => {
  memoryAuditCache.clear();
  try {
    fs.writeFileSync(historyPath, '[]', 'utf-8');
  } catch {}
  appendLog('[AUDITORIA] Cache de visualização do histórico limpo pelo operador.');
  return [];
});

ipcMain.handle('get-network-logs', () => {
  const lines: string[] = [];
  const auditDirs = getAllCompanyAuditDirs();
  for (const dir of auditDirs) {
    try {
      const logFile = path.join(dir, 'network_activity.log');
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf-8');
        const split = content.split('\n').filter((l) => l.trim().length > 0);
        lines.push(...split);
      }
    } catch {}
  }
  return lines.slice(-200);
});

ipcMain.handle('get-operator-info', () => {
  return getLocalOperatorInfo();
});

// Test AD / SMB Connection & Service Account Authentication
ipcMain.handle('test-connection', async (_, company: string, overrideConfig?: any) => {
  const config = overrideConfig || getCompanyConfig(company);
  const ip = (config.adServerIp || '').trim();
  const rawUser = (config.domainUser || '').trim();
  const pass = (config.adPass || '').trim();
  const pureUser = rawUser.includes('\\') ? rawUser.split('\\')[1] : rawUser;

  if (!ip) {
    const testPath = config.destSharePath || config.destinationParentPath || config.sourcePath;
    if (testPath && fs.existsSync(testPath)) {
      return { success: true, message: `Compartilhamento de rede da empresa ${company} acessível e validado com sucesso.` };
    }
    return { success: false, message: `Servidor ou compartilhamento de rede não configurado para ${company}.` };
  }

  const psScript = `
$ProgressPreference = 'SilentlyContinue';
$server = '${ip}';
$user = '${rawUser.replace(/'/g, "''")}';
$pass = '${pass.replace(/'/g, "''")}';
$pureUser = '${pureUser.replace(/'/g, "''")}';

# 1. Checagem de porta TCP 445
$tcp = Test-NetConnection -ComputerName $server -Port 445 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $tcp) {
  Write-Output "ERR_TCP: Servidor AD $server não está acessível na porta 445 (porta fechada ou host offline)."
  exit 1
}

# 2. Se houver usuário e senha informados, autentica no AD via LDAP
if ($user -and $pass) {
  try {
    $entry = New-Object System.DirectoryServices.DirectoryEntry(('LDAP://' + $server), $user, $pass)
    $searcher = New-Object System.DirectoryServices.DirectorySearcher($entry)
    $searcher.Filter = "(sAMAccountName=$pureUser)"
    $res = $searcher.FindOne()
    if ($null -eq $res) {
      Write-Output "ERR_NOT_FOUND: O usuário '$pureUser' não foi localizado no catálogo do Active Directory ($server)."
      exit 4
    }
  } catch {
    $errMsg = $_.Exception.Message.Trim()
    Write-Output "ERR_AUTH: Falha na autenticação do usuário '$user' no Active Directory ($server): $errMsg"
    exit 2
  }
}

Write-Output "SUCCESS"
exit 0
`;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');

  return new Promise((resolve) => {
    execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], { timeout: 15000, encoding: 'buffer' }, (err, stdout, stderr) => {
      const stdoutStr = decodeProcessOutput(stdout).trim();
      const stderrStr = decodeProcessOutput(stderr).trim();
      if (stdoutStr.startsWith('SUCCESS')) {
        const userInfo = rawUser ? ` e usuário '${rawUser}' autenticado no domínio` : '';
        resolve({
          success: true,
          message: `Conexão validada com sucesso: Servidor AD (${ip}:445) respondendo${userInfo}.`
        });
      } else {
        let msg = stdoutStr;
        if (stdoutStr.startsWith('ERR_TCP:')) {
          msg = stdoutStr.replace(/^ERR_TCP:\s*/, '');
        } else if (stdoutStr.startsWith('ERR_AUTH:')) {
          msg = stdoutStr.replace(/^ERR_AUTH:\s*/, '');
        } else if (stdoutStr.startsWith('ERR_NOT_FOUND:')) {
          msg = stdoutStr.replace(/^ERR_NOT_FOUND:\s*/, '');
        } else if (stdoutStr.startsWith('ERR_SEARCH:')) {
          msg = stdoutStr.replace(/^ERR_SEARCH:\s*/, '');
        } else if (!msg) {
          msg = stderrStr || `Servidor AD ${company} (${ip}) indisponível ou inacessível.`;
        }
        resolve({
          success: false,
          message: msg
        });
      }
    });
  });
});

// -------------------------------------------------------------
// Directory Selection & IT Governance Boundary Validation
// -------------------------------------------------------------
ipcMain.handle('select-directory', async (_, defaultPath?: string) => {
  if (!mainWindow) return null;
  const res = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    defaultPath: defaultPath && fs.existsSync(defaultPath) ? defaultPath : undefined,
  });
  if (res.canceled || res.filePaths.length === 0) return null;
  return res.filePaths[0];
});

/**
 * Decodifica buffers de processos externos de forma segura e defensiva.
 * Tenta UTF-8 nativo primeiro. Se detectar sequências OEM CP850/Windows-1252 corrompidas
 * (símbolo de interrogação U+FFFD), converte os bytes automaticamente para preservar 'Ç', 'ã', etc.
 */
function decodeProcessOutput(data: Buffer | string | null | undefined): string {
  if (!data) return '';
  if (typeof data === 'string') {
    return data;
  }
  const utf8Str = data.toString('utf8');
  if (!utf8Str.includes('\uFFFD')) {
    return utf8Str;
  }
  let decoded = '';
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    if (byte < 128) {
      decoded += String.fromCharCode(byte);
    } else {
      switch (byte) {
        case 0x80: decoded += 'Ç'; break;
        case 0x81: decoded += 'ü'; break;
        case 0x82: decoded += 'é'; break;
        case 0x83: decoded += 'â'; break;
        case 0x84: decoded += 'ä'; break;
        case 0x85: decoded += 'à'; break;
        case 0x87: decoded += 'ç'; break;
        case 0x88: decoded += 'ê'; break;
        case 0x89: decoded += 'ë'; break;
        case 0x8A: decoded += 'è'; break;
        case 0x8B: decoded += 'ï'; break;
        case 0x8C: decoded += 'î'; break;
        case 0x8D: decoded += 'ì'; break;
        case 0x8E: decoded += 'Ä'; break;
        case 0x8F: decoded += 'Å'; break;
        case 0x90: decoded += 'É'; break;
        case 0x93: decoded += 'ô'; break;
        case 0x94: decoded += 'ö'; break;
        case 0x95: decoded += 'ò'; break;
        case 0x96: decoded += 'û'; break;
        case 0x97: decoded += 'ù'; break;
        case 0xA0: decoded += 'á'; break;
        case 0xA1: decoded += 'í'; break;
        case 0xA2: decoded += 'ó'; break;
        case 0xA3: decoded += 'ú'; break;
        case 0xA4: decoded += 'ñ'; break;
        case 0xA5: decoded += 'Ñ'; break;
        case 0xA6: decoded += 'ª'; break;
        case 0xA7: decoded += 'º'; break;
        case 0xC6: decoded += 'ã'; break;
        case 0xC7: decoded += 'Ã'; break;
        case 0xCA: decoded += 'Ê'; break;
        case 0xE4: decoded += 'õ'; break;
        case 0xE5: decoded += 'Õ'; break;
        default:
          try {
            decoded += new TextDecoder('windows-1252').decode(Uint8Array.from([byte]));
          } catch {
            decoded += String.fromCharCode(byte);
          }
          break;
      }
    }
  }
  return decoded;
}

function getExecutorPath(): string {
  const possibleExecutorPaths = [
    path.join(process.resourcesPath, 'core', 'ExecuteAsUser.exe'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'electron', 'core', 'ExecuteAsUser.exe'),
    path.join(__dirname, 'core', 'ExecuteAsUser.exe'),
    path.join(__dirname, 'ExecuteAsUser.exe'),
    path.join(app.getAppPath(), 'dist-electron', 'core', 'ExecuteAsUser.exe'),
    path.join(app.getAppPath(), 'electron', 'core', 'ExecuteAsUser.exe'),
  ];
  for (const p of possibleExecutorPaths) {
    if (fs.existsSync(p)) return p;
  }
  return '';
}

function isSameVolumeOrShare(path1: string, path2: string): boolean {
  if (!path1 || !path2) return false;
  const p1 = path.normalize(path1).toLowerCase().replace(/[\/\\]+$/, '');
  const p2 = path.normalize(path2).toLowerCase().replace(/[\/\\]+$/, '');

  // UNC paths: \\server\share\...
  if (p1.startsWith('\\\\') && p2.startsWith('\\\\')) {
    const parts1 = p1.substring(2).split('\\');
    const parts2 = p2.substring(2).split('\\');
    return parts1.length >= 2 && parts2.length >= 2 && parts1[0] === parts2[0] && parts1[1] === parts2[1];
  }

  // Local paths: C:\...
  if (p1.length >= 2 && p2.length >= 2 && p1[1] === ':' && p2[1] === ':') {
    return p1[0] === p2[0];
  }

  return false;
}

function executeNativeOperation(args: string[]): Promise<{ success: boolean; data?: any; error?: string }> {
  const executor = getExecutorPath();
  if (!executor) {
    return Promise.resolve({ success: false, error: 'Executável ExecuteAsUser.exe não encontrado.' });
  }

  return new Promise((resolve) => {
    execFile(executor, args, { timeout: 180000, encoding: 'buffer' }, (err, stdout, stderr) => {
      const stdoutStr = decodeProcessOutput(stdout).trim();
      const stderrStr = decodeProcessOutput(stderr).trim();

      if (stdoutStr) {
        try {
          // Extrai JSON diretamente ou via regex se houver logs precedentes
          const jsonText = stdoutStr.startsWith('{') ? stdoutStr : (stdoutStr.match(/\{[\s\S]*\}/)?.[0] || stdoutStr);
          const parsed = JSON.parse(jsonText);
          if (parsed.success) {
            resolve({ success: true, data: parsed });
            return;
          } else {
            resolve({ success: false, error: parsed.error || 'Operação rejeitada pelo servidor.' });
            return;
          }
        } catch {
          // not json, continue
        }
      }

      if (err) {
        resolve({ success: false, error: stderrStr || err.message });
      } else {
        resolve({ success: true, data: stdoutStr });
      }
    });
  });
}

function fallbackListSubdirectories(targetDir: string) {
  if (!fs.existsSync(targetDir)) {
    return { success: false, error: `Pasta não encontrada ou inacessível no servidor: ${targetDir}`, folders: [] };
  }
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const isCompanyRoot = targetDir.replace(/\\+$/, '').toUpperCase().endsWith('\\EMPRESAS');
  const folders = entries
    .filter((e) => e.isDirectory() && (!isCompanyRoot || (!e.name.startsWith('00 -') && !e.name.startsWith('01 -'))))
    .map((e) => {
      const fullPath = path.join(targetDir, e.name);
      let mtime = '';
      try {
        const stat = fs.statSync(fullPath);
        mtime = stat.mtime.toLocaleDateString('pt-BR');
      } catch {}
      return { name: e.name, fullPath, mtime };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  return { success: true, folders };
}

ipcMain.handle('list-subdirectories', async (_, req: any, compParam?: string) => {
  try {
    let targetDir = '';
    let company = '';
    if (typeof req === 'string') {
      targetDir = req;
      company = compParam || '';
    } else if (req && typeof req === 'object') {
      targetDir = req.targetDir || '';
      company = req.company || '';
    }

    if (!targetDir) {
      return { success: false, error: 'Caminho não informado.', folders: [] };
    }

    const executor = getExecutorPath();
    const cfg = company ? getCompanyConfig(company) : null;
    const isNetwork = targetDir.startsWith('\\\\');

    // Se for caminho de rede UNC e dispomos de executor e credenciais de serviço AD:
    if (isNetwork && executor && cfg && cfg.domainUser && cfg.adPass) {
      appendLog(`[LISTAGEM AD] Listando diretório de rede estritamente sob as credenciais de '${cfg.domainUser}'...`);
      return new Promise((resolve) => {
        execFile(executor, ['--list', cfg.domainUser, cfg.adPass, targetDir], { timeout: 35000, encoding: 'buffer' }, (err, stdout, stderr) => {
          const stdoutStr = decodeProcessOutput(stdout);
          const stderrStr = decodeProcessOutput(stderr);
          if (err) {
            const msg = `Falha na listagem AD sob o usuário '${cfg.domainUser}': ${err.message}`;
            appendLog(`[LISTAGEM AD ERRO] ${msg}`);
            resolve({ success: false, error: msg, folders: [] });
            return;
          }
          try {
            const outStr = (stdoutStr || '').trim();
            const parsed = JSON.parse(outStr);
            if (parsed && parsed.success) {
              let resultFolders = parsed.folders || [];
              const isCompanyRoot = targetDir.replace(/\\+$/, '').toUpperCase().endsWith('\\EMPRESAS');
              if (isCompanyRoot) {
                resultFolders = resultFolders.filter((f: any) => !f.name.startsWith('00 -') && !f.name.startsWith('01 -'));
              }
              resultFolders.sort((a: any, b: any) => a.name.localeCompare(b.name));
              appendLog(`[LISTAGEM AD] Sucesso: ${resultFolders.length} pastas autorizadas listadas sob '${cfg.domainUser}'.`);
              resolve({ success: true, folders: resultFolders });
              return;
            } else {
              const errMsg = parsed?.error || 'Erro retornado pelo motor de listagem AD.';
              appendLog(`[LISTAGEM AD ERRO] ${errMsg}`);
              resolve({ success: false, error: errMsg, folders: [] });
              return;
            }
          } catch (pErr: any) {
            const parseMsg = `Erro ao decodificar JSON do motor AD: ${pErr.message}. Output: ${stdoutStr}`;
            appendLog(`[LISTAGEM AD ERRO] ${parseMsg}`);
            resolve({ success: false, error: parseMsg, folders: [] });
          }
        });
      });
    }

    if (isNetwork) {
      const netErr = `Impossível listar pasta de rede: motor ExecuteAsUser ou credenciais de '${cfg?.domainUser || 'pasta.paralegal'}' não encontrados.`;
      appendLog(`[LISTAGEM AD ERRO] ${netErr}`);
      return { success: false, error: netErr, folders: [] };
    }

    return fallbackListSubdirectories(targetDir);
  } catch (err: any) {
    return { success: false, error: err.message, folders: [] };
  }
});

ipcMain.handle('validate-boundary', (_, { targetPath, company }: { targetPath: string; company: string }) => {
  const cfg = getCompanyConfig(company);
  const allowedBase = cfg.allowedBasePath || cfg.destSharePath;
  if (!targetPath || !allowedBase) {
    return { isValid: false, allowedBase: allowedBase || '', message: 'Caminho ou perímetro corporativo não especificado.' };
  }

  const normTarget = path.normalize(path.resolve(targetPath)).toLowerCase();
  const normAllowed = path.normalize(path.resolve(allowedBase)).toLowerCase();

  // Target path must strictly start with the allowed boundary and not be the root itself
  const isValid = normTarget.startsWith(normAllowed) && normTarget !== normAllowed;
  return {
    isValid,
    allowedBase,
    message: isValid
      ? 'Caminho em conformidade com o perímetro de governança de TI.'
      : `Destino Bloqueado pelo TI: o caminho selecionado deve estar estritamente dentro de '${allowedBase}'. Pastas fora desse limite (como PUBLICO ou DIRETORIA) são proibidas.`,
  };
});

ipcMain.handle('inspect-folder', (_, dirPath: string) => {
  if (!fs.existsSync(dirPath)) return { exists: false, fileCount: 0, dirCount: 0, totalSize: 0 };
  const metrics = getFolderMetrics(dirPath);
  return { exists: true, ...metrics };
});

// -------------------------------------------------------------
// Safe Folder Transfer (Atomic MFT/SMB Move + Robocopy /MT:128 Fallback)
// -------------------------------------------------------------
ipcMain.handle('safe-transfer-copy', async (_, { company, sourcePath, destParentPath }: { company: string; sourcePath: string; destParentPath: string }) => {
  const config = getCompanyConfig(company);
  const allowedBase = config.allowedBasePath || config.destSharePath;

  // Boundary Security Check
  const normDest = path.normalize(path.resolve(destParentPath)).toLowerCase();
  const normAllowed = path.normalize(path.resolve(allowedBase)).toLowerCase();
  if (!normDest.startsWith(normAllowed)) {
    const errorMsg = `[BLOQUEIO TI] O destino '${destParentPath}' viola o perímetro corporativo autorizado ('${allowedBase}').`;
    appendLog(errorMsg);
    return { success: false, error: errorMsg };
  }

  const isNetwork = sourcePath.startsWith('\\\\') || destParentPath.startsWith('\\\\');

  // Para caminhos locais, valida existência prévia. Para rede UNC, o Robocopy/Move sob AD valida e cria nativamente sem travar a thread.
  if (!isNetwork) {
    if (!fs.existsSync(sourcePath)) {
      const errorMsg = `[ERRO ORIGEM] A pasta de origem não existe: '${sourcePath}'.`;
      appendLog(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!fs.existsSync(destParentPath)) {
      try {
        fs.mkdirSync(destParentPath, { recursive: true });
      } catch (mkErr: any) {
        const errorMsg = `[ERRO DESTINO] Não foi possível criar a pasta destino '${destParentPath}': ${mkErr.message}`;
        appendLog(errorMsg);
        return { success: false, error: errorMsg };
      }
    }
  }

  const folderName = path.basename(sourcePath);
  const finalDestPath = path.join(destParentPath, folderName);

  appendLog('---------------------------------------------------------');
  appendLog(`[TRANSFERÊNCIA SEGURA] Empresa: ${company} | Pasta: ${folderName}`);
  appendLog(`[ORIGEM] ${sourcePath}`);
  appendLog(`[DESTINO] ${finalDestPath}`);

  const adUser = config.domainUser;
  const adPass = config.adPass;
  const executorPath = getExecutorPath();

  const srcArg = sourcePath.replace(/\\$/, '');
  const destArg = finalDestPath.replace(/\\$/, '');

  isTransferInProgress = true;
  const sameVolume = isSameVolumeOrShare(sourcePath, destParentPath);

  return new Promise(async (resolve) => {
    const startTime = Date.now();

    const finishSuccess = (durationSec: number, method: 'atomic_move' | 'robocopy' = 'robocopy') => {
      isTransferInProgress = false;
      appendLog(`[CÓPIA CONCLUÍDA] Transmissão segura finalizada com sucesso em ${durationSec}s via ${method === 'atomic_move' ? 'movimentação atômica nativa MFT' : 'Robocopy /MT:128'}.`);
      if (mainWindow) {
        mainWindow.webContents.send('folders-updated', { company, folderName, action: 'transferred' });
      }
      saveHistoryEntry({
        company,
        action: 'MOVER_PASTA',
        actionLabel: 'Mover Pasta',
        folderName,
        sourcePath,
        targetPath: finalDestPath,
        finalPath: finalDestPath,
        executedBy: adUser,
        status: 'SUCCESS',
        durationSeconds: durationSec,
        details: `Método: ${method === 'atomic_move' ? 'Atômico (MFT)' : 'Robocopy /MT:128'}`,
      });
      resolve({
        success: true,
        folderName,
        sourcePath,
        finalDestPath,
        durationSeconds: durationSec,
        method,
      });
    };

    const finishError = (errorMsg: string) => {
      isTransferInProgress = false;
      appendLog(`[ERRO CRÍTICO] ${errorMsg}`);
      resolve({ success: false, error: errorMsg });
    };

    if (isNetwork && executorPath && adUser && adPass) {
      if (sameVolume) {
        appendLog(`[MOVIMENTAÇÃO ATÔMICA AD] Mesmo volume/compartilhamento de rede detectado. Executando movimentação atômica sob o token de '${adUser}'...`);
        const opRes = await executeNativeOperation(['--move', adUser, adPass, srcArg, destArg]);
        const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        if (opRes.success) {
          finishSuccess(durationSec, 'atomic_move');
          return;
        } else {
          appendLog(`[AVISO ATÔMICO] Movimentação direta não foi possível (${opRes.error}). Acionando fallback Robocopy /MT:128...`);
        }
      }

      appendLog(`[IMPERSONAÇÃO AD] Disparando Robocopy /MT:128 sob o token de '${adUser}'...`);
      execFile(executorPath, [adUser, adPass, srcArg, destArg], { encoding: 'buffer' }, (error, stdout, stderr) => {
        const stdoutStr = decodeProcessOutput(stdout);
        const stderrStr = decodeProcessOutput(stderr);
        if (stdoutStr) {
          stdoutStr.split('\n').filter(Boolean).forEach((line) => appendLog(`[ROBOCOPY STDOUT] ${line.trim()}`));
        }
        if (stderrStr) {
          stderrStr.split('\n').filter(Boolean).forEach((line) => appendLog(`[ROBOCOPY STDERR] ${line.trim()}`));
        }

        let exitCode = 0;
        if (error) {
          exitCode = typeof error.code === 'number' ? error.code : 16;
        }

        const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));

        if (exitCode === 0 || exitCode < 8) {
          finishSuccess(durationSec, 'robocopy');
        } else {
          finishError(`Falha na cópia Robocopy sob '${adUser}' (Código: ${exitCode}).`);
        }
      });
    } else {
      if (!isNetwork && sameVolume) {
        try {
          appendLog(`[MOVIMENTAÇÃO ATÔMICA LOCAL] Mesmo volume local. Executando renomeação atômica direta...`);
          fs.renameSync(sourcePath, finalDestPath);
          const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
          finishSuccess(durationSec, 'atomic_move');
          return;
        } catch (renErr: any) {
          appendLog(`[AVISO ATÔMICO LOCAL] Movimentação direta falhou (${renErr.message}). Acionando Robocopy...`);
        }
      }

      appendLog(`[ROBOCOPY NATIVO] Executando Robocopy direto (/MT:128)...`);
      const robocopyCmd = `robocopy "${srcArg}" "${destArg}" /E /COPY:DATS /DCOPY:DAT /MT:128 /IPG:0 /R:0 /W:0 /NFL /NDL /NJH /NJS /nc /ns /np`;
      exec(robocopyCmd, (error) => {
        let exitCode = 0;
        if (error) {
          exitCode = typeof error.code === 'number' ? error.code : 16;
        }
        const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));

        if (exitCode < 8) {
          finishSuccess(durationSec, 'robocopy');
        } else {
          finishError(`Falha no Robocopy direto (Código: ${exitCode}).`);
        }
      });
    }
  });
});

// -------------------------------------------------------------
// Safe Source Deletion after Human Interactive Confirmation
// -------------------------------------------------------------
ipcMain.handle('delete-source-folders', async (_, { company, foldersToDelete }: { company: string; foldersToDelete: string[] }) => {
  const config = getCompanyConfig(company);
  const allowedBase = config.allowedBasePath || config.destSharePath;
  const normAllowed = path.normalize(path.resolve(allowedBase)).toLowerCase();

  const deleted: string[] = [];
  const errors: string[] = [];

  const tasks = foldersToDelete.map(async (srcPath) => {
    try {
      const normSrc = path.normalize(path.resolve(srcPath)).toLowerCase();
      // Safety check: Cannot be root, cannot be equal to allowed boundary root
      if (!normSrc.startsWith(normAllowed) || normSrc === normAllowed || normSrc.endsWith(':\\') || normSrc === '\\\\') {
        const msg = `Exclusão bloqueada: caminho '${srcPath}' viola regras de integridade do sistema.`;
        appendLog(`[BLOQUEIO EXCLUSÃO] ${msg}`);
        errors.push(msg);
        return;
      }

      const isNetwork = srcPath.startsWith('\\\\');
      const executor = getExecutorPath();

      if (isNetwork && executor && config?.domainUser && config?.adPass) {
        appendLog(`[EXCLUSÃO ORIGEM AD] Excluindo pasta de rede '${srcPath}' sob o usuário '${config.domainUser}'...`);
        const opRes = await executeNativeOperation(['--delete', config.domainUser, config.adPass, srcPath]);
        if (!opRes.success) {
          const err = `Erro ao excluir pasta '${srcPath}' sob o usuário '${config.domainUser}': ${opRes.error}`;
          appendLog(`[ERRO EXCLUSÃO AD] ${err}`);
          errors.push(err);
          return;
        }
      } else {
        if (!fs.existsSync(srcPath)) {
          deleted.push(srcPath);
          return;
        }
        fs.rmSync(srcPath, { recursive: true, force: true });
      }

      deleted.push(srcPath);
      appendLog(`[EXCLUSÃO ORIGEM SUCESSO] Pasta de origem removida com sucesso: ${srcPath}`);

      saveHistoryEntry({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        timestamp: new Date().toLocaleString('pt-BR'),
        company,
        folderName: path.basename(srcPath),
        finalPath: `EXCLUIDO_ORIGEM: ${srcPath}`,
        executedBy: config.domainUser,
        status: 'TRANSFER_COMPLETED_AND_PURGED',
        durationSeconds: 1,
      });
    } catch (e: any) {
      const err = `Erro ao excluir pasta '${srcPath}': ${e.message}`;
      appendLog(`[ERRO EXCLUSÃO] ${err}`);
      errors.push(err);
    }
  });

  await Promise.all(tasks);

  if (mainWindow && deleted.length > 0) {
    mainWindow.webContents.send('folders-updated', { company, folders: deleted, action: 'deleted' });
  }

  return { success: errors.length === 0, deleted, errors };
});

// -------------------------------------------------------------
// Safe Transfer Undo (Rollback of Copied/Moved Destination Folders)
// -------------------------------------------------------------
ipcMain.handle('undo-transfer', async (_, { company, foldersToUndo, items }: { company: string; foldersToUndo?: string[]; items?: Array<{ sourcePath: string; destPath: string; method?: string }> }) => {
  const config = getCompanyConfig(company);
  const allowedBase = config.allowedBasePath || config.destSharePath;
  const normAllowed = path.normalize(path.resolve(allowedBase)).toLowerCase();

  const undone: string[] = [];
  const errors: string[] = [];

  const rollbackList: Array<{ sourcePath?: string; destPath: string; method?: string }> = [];
  if (Array.isArray(items) && items.length > 0) {
    items.forEach((it) => rollbackList.push(it));
  } else if (Array.isArray(foldersToUndo)) {
    foldersToUndo.forEach((p) => rollbackList.push({ destPath: p }));
  }

  const executor = getExecutorPath();

  const tasks = rollbackList.map(async (item) => {
    const destPath = item.destPath;
    const sourcePath = item.sourcePath;
    const isAtomic = item.method === 'atomic_move' || (sourcePath && !fs.existsSync(sourcePath) && fs.existsSync(destPath));

    try {
      const normDest = path.normalize(path.resolve(destPath)).toLowerCase();
      // Safety check: Cannot be root or equal to allowed boundary root
      if (!normDest.startsWith(normAllowed) || normDest === normAllowed || normDest.endsWith(':\\') || normDest === '\\\\') {
        const msg = `Desfazer bloqueado: caminho '${destPath}' viola regras de integridade do sistema.`;
        appendLog(`[BLOQUEIO DESFAZER] ${msg}`);
        errors.push(msg);
        return;
      }

      const isNetwork = destPath.startsWith('\\\\');

      if (isAtomic && sourcePath) {
        // Atomic move rollback: Move back from destPath to sourcePath!
        appendLog(`[DESFAZER MOVIMENTAÇÃO ATÔMICA] Movendo de volta '${destPath}' -> '${sourcePath}'...`);
        if (isNetwork && executor && config?.domainUser && config?.adPass) {
          const opRes = await executeNativeOperation(['--move', config.domainUser, config.adPass, destPath, sourcePath]);
          if (!opRes.success) {
            const err = `Erro ao restaurar pasta para a origem '${sourcePath}': ${opRes.error}`;
            appendLog(`[ERRO DESFAZER AD] ${err}`);
            errors.push(err);
            return;
          }
        } else {
          try {
            fs.renameSync(destPath, sourcePath);
          } catch (mErr: any) {
            const err = `Erro ao restaurar pasta para a origem '${sourcePath}': ${mErr.message}`;
            appendLog(`[ERRO DESFAZER LOCAL] ${err}`);
            errors.push(err);
            return;
          }
        }
        undone.push(destPath);
        appendLog(`[TRANSFERÊNCIA DESFEITA] Pasta restaurada na origem com sucesso: ${sourcePath}.`);
      } else {
        // Robocopy copy rollback: Delete destination copy
        appendLog(`[DESFAZER CÓPIA] Removendo cópia do destino '${destPath}' sob o usuário '${config?.domainUser}'...`);
        if (isNetwork && executor && config?.domainUser && config?.adPass) {
          const opRes = await executeNativeOperation(['--delete', config.domainUser, config.adPass, destPath]);
          if (!opRes.success) {
            const err = `Erro ao desfazer pasta '${destPath}' sob o usuário '${config.domainUser}': ${opRes.error}`;
            appendLog(`[ERRO DESFAZER AD] ${err}`);
            errors.push(err);
            return;
          }
        } else {
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { recursive: true, force: true });
          }
        }
        undone.push(destPath);
        appendLog(`[TRANSFERÊNCIA DESFEITA] Cópia removida do destino com sucesso: ${destPath}. Origem mantida intacta.`);
      }

      saveHistoryEntry({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        timestamp: new Date().toLocaleString('pt-BR'),
        company,
        folderName: path.basename(destPath),
        finalPath: `DESFEITO: ${destPath} (origem preservada)`,
        executedBy: config?.domainUser || 'SYSTEM',
        status: 'TRANSFER_UNDONE_ROLLBACK',
        durationSeconds: 1,
      });
    } catch (e: any) {
      const err = `Erro ao desfazer pasta no destino '${destPath}': ${e.message}`;
      appendLog(`[ERRO DESFAZER] ${err}`);
      errors.push(err);
    }
  });

  await Promise.all(tasks);

  if (mainWindow && undone.length > 0) {
    mainWindow.webContents.send('folders-updated', { company, folders: undone, action: 'undone' });
  }

  return { success: errors.length === 0, undone, errors };
});

// -------------------------------------------------------------
// Folder Renaming Functionality
// -------------------------------------------------------------
ipcMain.handle('rename-folder', async (_, { targetPath, newName, company }: { targetPath: string; newName: string; company?: string }) => {
  try {
    if (!targetPath || typeof targetPath !== 'string') {
      return { success: false, error: 'Nenhum caminho de pasta informado.' };
    }
    const cleanTarget = path.normalize(targetPath.trim());

    if (!newName || typeof newName !== 'string' || !newName.trim()) {
      return { success: false, error: 'O novo nome da pasta não pode estar vazio.' };
    }
    const cleanNewName = newName.trim();

    // Caracteres proibidos no Windows: \ / : * ? " < > |
    const invalidCharsRegex = /[\\/:*?"<>|]/;
    if (invalidCharsRegex.test(cleanNewName)) {
      return { success: false, error: 'O novo nome contém caracteres não permitidos pelo Windows: \\ / : * ? " < > |' };
    }

    const parentDir = path.dirname(cleanTarget);
    const oldName = path.basename(cleanTarget);

    if (oldName.toLowerCase() === cleanNewName.toLowerCase()) {
      return { success: false, error: 'O novo nome é idêntico ao nome atual da pasta.' };
    }

    const newFullPath = path.join(parentDir, cleanNewName);

    const compName = company || (cleanTarget.toLowerCase().includes('reliquia') ? 'RELIQUIA' : 'RTO');
    const compConfig = getCompanyConfig(compName);
    const isNetwork = cleanTarget.startsWith('\\\\');
    const executor = getExecutorPath();

    appendLog('---------------------------------------------------------');
    appendLog(`[RENOMEAR PASTA] Origem: ${cleanTarget}`);
    appendLog(`[NOVO NOME] ${cleanNewName}`);
    appendLog(`[DESTINO FINAL] ${newFullPath}`);

    if (isNetwork && executor && compConfig?.domainUser && compConfig?.adPass) {
      appendLog(`[RENOMEAR AD] Renomeando pasta de rede sob as credenciais de '${compConfig.domainUser}'...`);
      const opRes = await executeNativeOperation(['--rename', compConfig.domainUser, compConfig.adPass, cleanTarget, newFullPath]);
      if (!opRes.success) {
        const err = `Erro ao renomear pasta sob o usuário '${compConfig.domainUser}': ${opRes.error}`;
        appendLog(`[ERRO RENOMEAR AD] ${err}`);
        return { success: false, error: err };
      }
    } else {
      if (!fs.existsSync(cleanTarget)) {
        return { success: false, error: `A pasta selecionada não foi encontrada no sistema:\n${cleanTarget}` };
      }
      if (fs.existsSync(newFullPath)) {
        return { success: false, error: `Já existe uma pasta com o nome '${cleanNewName}' neste mesmo diretório.` };
      }
      fs.renameSync(cleanTarget, newFullPath);
    }

    appendLog(`[SUCESSO RENOMEAR] Pasta renomeada com sucesso: '${oldName}' -> '${cleanNewName}'`);

    if (mainWindow) {
      mainWindow.webContents.send('folders-updated', { company: compName, oldName, newName: cleanNewName, action: 'renamed' });
    }

    saveHistoryEntry({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleString('pt-BR'),
      company: compName,
      folderName: cleanNewName,
      finalPath: `RENOMEADO: ${oldName} -> ${cleanNewName} (${newFullPath})`,
      executedBy: compConfig?.domainUser || 'Operador',
      status: 'FOLDER_RENAMED',
      durationSeconds: 1,
    });

    return { success: true, newPath: newFullPath, oldName, newName: cleanNewName };
  } catch (err: any) {
    const errStr = `Falha ao renomear pasta: ${err.message}`;
    appendLog(`[ERRO RENOMEAR] ${errStr}`);
    return { success: false, error: errStr };
  }
});

ipcMain.handle('build-custom-msi', async (_, msiParams) => {
  appendLog(`[MSI BUILDER] Iniciando compilação de instalador .MSI customizado para: ${msiParams.companyName}...`);
  return new Promise((resolve) => {
    try {
      const buildCustomScript = path.join(__dirname, '..', 'build', 'build_custom_msi.js');
      const tempJson = path.join(app.getPath('temp'), `msi_params_${Date.now()}.json`);
      fs.writeFileSync(tempJson, JSON.stringify(msiParams, null, 2), 'utf-8');

      const cmd = `node "${buildCustomScript}" "${tempJson}"`;
      exec(cmd, (error, stdout) => {
        try { fs.unlinkSync(tempJson); } catch (e) {}
        if (error) {
          appendLog(`[ERRO MSI BUILDER] Falha na compilação do MSI: ${error.message}`);
          resolve({ success: false, error: error.message });
        } else {
          appendLog(`[SUCESSO MSI BUILDER] Pacote .MSI compilado na Área de Trabalho com sucesso!`);
          resolve({ success: true, message: stdout });
        }
      });
    } catch (err: any) {
      appendLog(`[ERRO MSI BUILDER] ${err.message}`);
      resolve({ success: false, error: err.message });
    }
  });
});

ipcMain.handle('create-folder', async (_, { company, folderName }) => {
  const trimmedName = folderName.trim();
  if (!trimmedName) return { success: false, error: 'O nome da pasta do cliente não pode estar vazio.' };
  if (!trimmedName) return { success: false, error: 'O nome da pasta não pode estar vazio.' };

  const config = getCompanyConfig(company);
  const destShare = config.destSharePath || config.destinationParentPath;
  if (!destShare) {
    return { success: false, error: `Caminho de destino não configurado para a empresa '${company}'.` };
  }
  const finalPath = path.join(destShare, trimmedName);

  // Prioridade absoluta para o modelo oficial RTO em produção com DACLs departamentais restritas
  let effectiveSourcePath = config.sourcePath;
  if (company === 'RTO') {
    const authoritativeRtoTemplate = String.raw`\\192.168.50.102\rto\MODELOS\MODELO DE PASTAS\EM USO\MODELO 2026`;
    if (fs.existsSync(authoritativeRtoTemplate)) {
      effectiveSourcePath = authoritativeRtoTemplate;
    }
  }

  appendLog('---------------------------------------------------------');
  appendLog(`[SOLICITAÇÃO DE CRIAÇÃO] Empresa: ${company} | Cliente: ${trimmedName}`);
  appendLog(`[ORIGEM MODELO AD] ${effectiveSourcePath}`);
  appendLog(`[DESTINO FINAL REDE] ${finalPath}`);

  const adUser = config.domainUser || `${company}\\pasta.paralegal`;
  const pureUser = adUser.includes('\\') ? adUser.split('\\')[1] : (adUser || 'pasta.paralegal');
  const adPass = config.adPass || 'Mestre@300';
  const adServerIp = config.adServerIp;

  // 1. LDAP DIRECTORY ENTRY AD CHECK (Strict Isolated Domain Check)
  if (adServerIp) {
    appendLog(`[VALIDAÇÃO AD ${company}] Verificando existência de '${pureUser}' no AD (${adServerIp})...`);
    let userExists = false;
    try {
      const psCheckCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$entry = New-Object System.DirectoryServices.DirectoryEntry('LDAP://${adServerIp}'); $searcher = New-Object System.DirectoryServices.DirectorySearcher($entry); $searcher.Filter = '(sAMAccountName=${pureUser})'; $res = $searcher.FindOne(); if ($res -ne $null) { exit 0 } else { exit 1 }"`;
      execSync(psCheckCmd, { stdio: 'ignore' });
      userExists = true;
      appendLog(`[VALIDAÇÃO AD ${company}] Conta '${pureUser}' confirmada no Active Directory de ${company}.`);
    } catch (e) {
      userExists = false;
    }

    if (!userExists) {
      const errorMsg = `[ERRO CRÍTICO AD] A conta de serviço '${pureUser}' não foi encontrada no Active Directory da ${company} (${adServerIp}).\n\nPor favor, crie a conta '${pureUser}' no Active Directory da ${company} (com a senha '${adPass}') antes de criar pastas nesta rede.`;
      appendLog(`[ABORTADO ${company}] ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  // 2. SEARCH FOR ExecuteAsUser.exe IN ALL BUNDLE LOCATIONS
  const possibleExecutorPaths = [
    path.join(process.resourcesPath, 'core', 'ExecuteAsUser.exe'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'electron', 'core', 'ExecuteAsUser.exe'),
    path.join(__dirname, 'core', 'ExecuteAsUser.exe'),
    path.join(__dirname, 'ExecuteAsUser.exe'),
    path.join(app.getAppPath(), 'dist-electron', 'core', 'ExecuteAsUser.exe'),
    path.join(app.getAppPath(), 'electron', 'core', 'ExecuteAsUser.exe'),
  ];

  let executorPath = '';
  for (const p of possibleExecutorPaths) {
    if (fs.existsSync(p)) {
      executorPath = p;
      break;
    }
  }

  if (!executorPath) {
    const errorMsg = `[ERRO CRÍTICO INSTALAÇÃO] O executável nativo ExecuteAsUser.exe não foi encontrado em nenhuma das pastas do sistema.`;
    appendLog(errorMsg);
    return { success: false, error: errorMsg };
  }

  const srcArg = effectiveSourcePath.replace(/\\$/, '');
  const destArg = finalPath.replace(/\\$/, '');

  appendLog(`[IMPERSONAÇÃO AD] Executando Robocopy via execFile estritamente sob o token de '${adUser}'...`);

  return new Promise((resolve) => {
    const startTime = Date.now();

    execFile(executorPath, [adUser, adPass, srcArg, destArg], { encoding: 'buffer' }, (error, stdout, stderr) => {
      const stdoutStr = decodeProcessOutput(stdout);
      const stderrStr = decodeProcessOutput(stderr);
      if (stdoutStr) {
        stdoutStr.split('\n').filter(Boolean).forEach((line) => appendLog(`[ROBOCOPY STDOUT] ${line.trim()}`));
      }
      if (stderrStr) {
        stderrStr.split('\n').filter(Boolean).forEach((line) => appendLog(`[ROBOCOPY STDERR] ${line.trim()}`));
      }

      let exitCode = 0;
      if (error) {
        exitCode = typeof error.code === 'number' ? error.code : 16;
      }

      const durationSec = Math.round((Date.now() - startTime) / 1000);

      // ExecuteAsUser.exe traduz Robocopy exit code < 8 para 0 (sucesso absoluto)
      if (exitCode === 0) {
        appendLog(`[SUCESSO INTEGRAL] Transmissão de estrutura e permissões NTFS finalizada com sucesso em ${durationSec}s.`);

        if (mainWindow) {
          mainWindow.webContents.send('folders-updated', { company, folderName: trimmedName, action: 'created' });
        }

        saveHistoryEntry({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString('pt-BR'),
          company,
          folderName: trimmedName,
          finalPath,
          executedBy: adUser,
          status: 'SUCCESS',
          durationSeconds: durationSec,
        });

        resolve({ success: true });
      } else {
        const failMsg = `A autenticação ou cópia sob o usuário '${adUser}' falhou (Código de saída: ${exitCode}).\nOperação cancelada para impedir o uso da conta logada na máquina.`;
        appendLog(`[ERRO CRÍTICO IMPERSONAÇÃO] ${failMsg}`);

        saveHistoryEntry({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString('pt-BR'),
          company,
          folderName: trimmedName,
          finalPath,
          executedBy: adUser,
          status: 'FAILED',
          durationSeconds: durationSec,
          error: failMsg,
        });

        resolve({ success: false, error: failMsg });
      }
    });
  });
});

// Window controls
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());
