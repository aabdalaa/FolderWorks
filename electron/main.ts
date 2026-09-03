import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec, execFile, execSync } from 'child_process';

let mainWindow: BrowserWindow | null = null;

// Persistent Logs & History Path
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');
const historyPath = path.join(userDataPath, 'history.json');
const logsPath = path.join(userDataPath, 'app.log');

// Default Corporate Config with IT Governance Perimeter
const defaultCompanyConfigs: Record<string, any> = {
  RELIQUIA: {
    companyName: 'RELIQUIA',
    domainUser: String.raw`RELIQUIA\pasta.paralegal`,
    adPass: 'Mestre@300',
    adServerIp: '192.168.100.30',
    sourcePath: String.raw`\\192.168.100.30\gpo\criarpastas_paralegal\MODELO`,
    destSharePath: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS`,
    allowedBasePath: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES`,
    defaultSourceFolder: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS`,
    presetDestinations: [
      { name: '00 - EX CLIENTES', path: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS\00 - EX CLIENTES` },
      { name: '01 - EMPRESAS ENCERRADAS', path: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS\01 - EMPRESAS ENCERRADAS` }
    ]
  },
  RTO: {
    companyName: 'RTO',
    domainUser: String.raw`RTO\pasta.paralegal`,
    adPass: 'Mestre@300',
    adServerIp: '192.168.50.102',
    sourcePath: String.raw`\\192.168.50.102\gpo\criarpastas_paralegal\MODELO`,
    destSharePath: String.raw`\\192.168.50.102\rto\CLIENTES\EMPRESAS`,
    allowedBasePath: String.raw`\\192.168.50.102\rto\CLIENTES`,
    defaultSourceFolder: String.raw`\\192.168.50.102\rto\CLIENTES\EMPRESAS`,
    presetDestinations: [
      { name: '00 - EX CLIENTES', path: String.raw`\\192.168.50.102\rto\CLIENTES\EMPRESAS\00 - EX CLIENTES` },
      { name: '01 - EMPRESAS ENCERRADAS', path: String.raw`\\192.168.50.102\rto\CLIENTES\EMPRESAS\01 - EMPRESAS ENCERRADAS` }
    ]
  }
};

// Corporate Default Config embedded in MSI resources
const bundledConfigPath = path.join(process.resourcesPath, 'default_config.json');

function loadConfig() {
  if (fs.existsSync(bundledConfigPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(bundledConfigPath, 'utf-8'));
      return { ...defaultCompanyConfigs, ...parsed, isLockedByMSI: true };
    } catch (e) {}
  }
  if (fs.existsSync(configPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return { ...defaultCompanyConfigs, ...parsed };
    } catch (e) {}
  }
  return defaultCompanyConfigs;
}

function getCompanyConfig(company: string) {
  const all = loadConfig();
  return all[company] || defaultCompanyConfigs[company] || defaultCompanyConfigs['RELIQUIA'];
}

function saveConfig(cfg: any) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
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

function saveHistoryEntry(entry: any) {
  let list = [];
  if (fs.existsSync(historyPath)) {
    try {
      list = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch (e) {}
  }
  list.unshift(entry);
  fs.writeFileSync(historyPath, JSON.stringify(list, null, 2), 'utf-8');
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

function createWindow() {
  mainWindow = new BrowserWindow({
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

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  appendLog('=========================================================');
  appendLog(' LOG ENTROPY FOLDERWORKS - INICIALIZADO EM ' + new Date().toLocaleString('pt-BR'));
  appendLog('=========================================================');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-config', () => loadConfig());
ipcMain.handle('save-config', (_, cfg) => {
  saveConfig(cfg);
  appendLog('[CONFIG] Configurações de rede atualizadas com sucesso.');
  return { success: true };
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

ipcMain.handle('get-history', () => {
  if (fs.existsSync(historyPath)) {
    try {
      return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch (e) {}
  }
  return [];
});

ipcMain.handle('clear-history', () => {
  fs.writeFileSync(historyPath, '[]', 'utf-8');
  appendLog('[AUDITORIA] Histórico de auditoria limpo pelo operador.');
  return [];
});

// Test AD / SMB Connection
ipcMain.handle('test-connection', async (_, company: 'RELIQUIA' | 'RTO') => {
  const config = getCompanyConfig(company);
  const ip = config.adServerIp;
  return new Promise((resolve) => {
    exec(`powershell -NoProfile -Command "Test-NetConnection -ComputerName '${ip}' -Port 445 -InformationLevel Quiet"`, { timeout: 5000 }, (err, stdout) => {
      const ok = stdout && stdout.trim().toLowerCase() === 'true';
      if (ok) {
        resolve({ success: true, message: `Conexão SMB/AD com ${company} (${ip}:445) ativa e respondendo.` });
      } else {
        resolve({ success: false, message: `Servidor AD ${company} (${ip}) indisponível ou porta 445 inacessível.` });
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

function fallbackListSubdirectories(targetDir: string) {
  if (!fs.existsSync(targetDir)) {
    return { success: false, error: `Pasta não encontrada ou inacessível no servidor: ${targetDir}`, folders: [] };
  }
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const folders = entries
    .filter((e) => e.isDirectory())
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
      return new Promise((resolve) => {
        execFile(executor, ['--list', cfg.domainUser, cfg.adPass, targetDir], { timeout: 25000 }, (err, stdout, stderr) => {
          if (err) {
            appendLog(`[LISTAGEM AD] Aviso ao consultar via token de '${cfg.domainUser}': ${err.message}. Usando leitura direta.`);
            resolve(fallbackListSubdirectories(targetDir));
            return;
          }
          try {
            const outStr = (stdout || '').trim();
            const parsed = JSON.parse(outStr);
            if (parsed && parsed.success) {
              parsed.folders.sort((a: any, b: any) => a.name.localeCompare(b.name));
              resolve({ success: true, folders: parsed.folders });
              return;
            } else {
              appendLog(`[LISTAGEM AD] Retorno do executor: ${parsed?.error || 'Erro desconhecido'}`);
              resolve(fallbackListSubdirectories(targetDir));
              return;
            }
          } catch (pErr: any) {
            appendLog(`[LISTAGEM AD] Erro ao decodificar JSON: ${pErr.message}.`);
            resolve(fallbackListSubdirectories(targetDir));
          }
        });
      });
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
// Safe Folder Transfer (Robocopy / NTFS DACL Preserved)
// -------------------------------------------------------------
ipcMain.handle('safe-transfer-copy', async (_, { company, sourcePath, destParentPath }: { company: 'RELIQUIA' | 'RTO'; sourcePath: string; destParentPath: string }) => {
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

  if (!fs.existsSync(sourcePath)) {
    const errorMsg = `[ERRO ORIGEM] A pasta de origem não existe: '${sourcePath}'.`;
    appendLog(errorMsg);
    return { success: false, error: errorMsg };
  }

  // Ensure destination parent directory exists
  if (!fs.existsSync(destParentPath)) {
    try {
      fs.mkdirSync(destParentPath, { recursive: true });
    } catch (mkErr: any) {
      const errorMsg = `[ERRO DESTINO] Não foi possível criar a pasta destino '${destParentPath}': ${mkErr.message}`;
      appendLog(errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  const folderName = path.basename(sourcePath);
  const finalDestPath = path.join(destParentPath, folderName);

  appendLog('---------------------------------------------------------');
  appendLog(`[TRANSFERÊNCIA SEGURA] Empresa: ${company} | Pasta: ${folderName}`);
  appendLog(`[ORIGEM] ${sourcePath}`);
  appendLog(`[DESTINO] ${finalDestPath}`);

  // Pre-transfer metrics on source
  const sourceMetrics = getFolderMetrics(sourcePath);
  appendLog(`[MÉTRICAS ORIGEM] ${sourceMetrics.fileCount} arquivos, ${sourceMetrics.dirCount} subpastas, ${(sourceMetrics.totalSize / 1024 / 1024).toFixed(2)} MB`);

  const adUser = config.domainUser;
  const adPass = config.adPass;
  const executorPath = getExecutorPath();

  const srcArg = sourcePath.replace(/\\$/, '');
  const destArg = finalDestPath.replace(/\\$/, '');

  return new Promise((resolve) => {
    const startTime = Date.now();

    if (executorPath) {
      appendLog(`[IMPERSONAÇÃO AD] Disparando Robocopy sob o token de '${adUser}'...`);
      execFile(executorPath, [adUser, adPass, srcArg, destArg], (error, stdout, stderr) => {
        if (stdout) {
          stdout.split('\n').filter(Boolean).forEach((line) => appendLog(`[ROBOCOPY STDOUT] ${line.trim()}`));
        }
        if (stderr) {
          stderr.split('\n').filter(Boolean).forEach((line) => appendLog(`[ROBOCOPY STDERR] ${line.trim()}`));
        }

        let exitCode = 0;
        if (error) {
          exitCode = typeof error.code === 'number' ? error.code : 16;
        }

        const durationSec = Math.round((Date.now() - startTime) / 1000);
        const destMetrics = getFolderMetrics(finalDestPath);

        if (exitCode === 0 || (fs.existsSync(finalDestPath) && destMetrics.fileCount >= sourceMetrics.fileCount)) {
          appendLog(`[CÓPIA CONCLUÍDA] Transmissão segura finalizada em ${durationSec}s. Validando destino...`);
          resolve({
            success: true,
            folderName,
            sourcePath,
            finalDestPath,
            sourceMetrics,
            destMetrics,
            durationSeconds: durationSec,
          });
        } else {
          const failMsg = `Falha na cópia Robocopy sob '${adUser}' (Código: ${exitCode}).`;
          appendLog(`[ERRO CRÍTICO] ${failMsg}`);
          resolve({ success: false, error: failMsg });
        }
      });
    } else {
      appendLog(`[ROBOCOPY NATIVO] Executando Robocopy direto...`);
      const robocopyCmd = `robocopy "${srcArg}" "${destArg}" /E /COPY:DAT /DCOPY:DAT /MT:16 /R:1 /W:1 /NFL /NDL /NJH /NJS /nc /ns /np`;
      exec(robocopyCmd, (error) => {
        let exitCode = 0;
        if (error) {
          exitCode = typeof error.code === 'number' ? error.code : 16;
        }
        const durationSec = Math.round((Date.now() - startTime) / 1000);
        const destMetrics = getFolderMetrics(finalDestPath);

        if (exitCode < 8 || (fs.existsSync(finalDestPath) && destMetrics.fileCount >= sourceMetrics.fileCount)) {
          appendLog(`[CÓPIA CONCLUÍDA] Transmissão direta concluída em ${durationSec}s.`);
          resolve({
            success: true,
            folderName,
            sourcePath,
            finalDestPath,
            sourceMetrics,
            destMetrics,
            durationSeconds: durationSec,
          });
        } else {
          const failMsg = `Falha no Robocopy direto (Código: ${exitCode}).`;
          appendLog(`[ERRO CRÍTICO] ${failMsg}`);
          resolve({ success: false, error: failMsg });
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

  for (const srcPath of foldersToDelete) {
    try {
      const normSrc = path.normalize(path.resolve(srcPath)).toLowerCase();
      // Safety check: Cannot be root, cannot be equal to allowed boundary root
      if (!normSrc.startsWith(normAllowed) || normSrc === normAllowed || normSrc.endsWith(':\\') || normSrc === '\\\\') {
        const msg = `Exclusão bloqueada: caminho '${srcPath}' viola regras de integridade do sistema.`;
        appendLog(`[BLOQUEIO EXCLUSÃO] ${msg}`);
        errors.push(msg);
        continue;
      }

      if (!fs.existsSync(srcPath)) {
        errors.push(`Pasta já não existe: ${srcPath}`);
        continue;
      }

      // Execute safe recursive delete
      fs.rmSync(srcPath, { recursive: true, force: true });
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
  }

  return { success: errors.length === 0, deleted, errors };
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

  const configs: Record<string, any> = {
    RELIQUIA: {
      domainUser: String.raw`RELIQUIA\pasta.paralegal`,
      adPass: 'Mestre@300',
      adServerIp: '192.168.100.30',
      sourcePath: String.raw`\\192.168.100.30\gpo\criarpastas_paralegal\MODELO`,
      destSharePath: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS`,
    },
    RTO: {
      domainUser: String.raw`RTO\pasta.paralegal`,
      adPass: 'Mestre@300',
      adServerIp: '192.168.50.102',
      sourcePath: String.raw`\\192.168.50.102\gpo\criarpastas_paralegal\MODELO`,
      destSharePath: String.raw`\\192.168.50.102\rto\CLIENTES\EMPRESAS`,
    },
  };

  const config = configs[company] || loadConfig();
  const finalPath = path.join(config.destSharePath, trimmedName);

  appendLog('---------------------------------------------------------');
  appendLog(`[SOLICITAÇÃO DE CRIAÇÃO] Empresa: ${company} | Cliente: ${trimmedName}`);
  appendLog(`[ORIGEM GPO MODELO] ${config.sourcePath}`);
  appendLog(`[DESTINO FINAL REDE] ${finalPath}`);

  const pureUser = 'pasta.paralegal';
  const adUser = config.domainUser;
  const adPass = config.adPass;
  const adServerIp = config.adServerIp;

  // 1. LDAP DIRECTORY ENTRY AD CHECK (Strict Isolated Domain Check)
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
    const errorMsg = `[ERRO CRÍTICO AD] A conta de serviço '${pureUser}' não foi encontrada no Active Directory da ${company} (${adServerIp}).\n\nPor favor, crie a conta '${pureUser}' no Active Directory da ${company} (com a senha 'Mestre@300') antes de criar pastas nesta rede.`;
    appendLog(`[ABORTADO ${company}] ${errorMsg}`);
    return { success: false, error: errorMsg };
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

  const srcArg = config.sourcePath.replace(/\\$/, '');
  const destArg = finalPath.replace(/\\$/, '');

  appendLog(`[IMPERSONAÇÃO AD] Executando Robocopy via execFile estritamente sob o token de '${adUser}'...`);

  return new Promise((resolve) => {
    const startTime = Date.now();

    execFile(executorPath, [adUser, adPass, srcArg, destArg], (error, stdout, stderr) => {
      if (stdout) {
        stdout.split('\n').filter(Boolean).forEach((line) => appendLog(`[ROBOCOPY STDOUT] ${line.trim()}`));
      }
      if (stderr) {
        stderr.split('\n').filter(Boolean).forEach((line) => appendLog(`[ROBOCOPY STDERR] ${line.trim()}`));
      }

      let exitCode = 0;
      if (error) {
        exitCode = typeof error.code === 'number' ? error.code : 16;
      }

      const durationSec = Math.round((Date.now() - startTime) / 1000);

      // ExecuteAsUser.exe traduz Robocopy exit code < 8 para 0 (sucesso absoluto)
      if (exitCode === 0) {
        appendLog(`[SUCESSO INTEGRAL] Transmissão de estrutura e permissões NTFS finalizada com sucesso em ${durationSec}s.`);

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
