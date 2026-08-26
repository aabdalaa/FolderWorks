import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec, execFile, execSync } from 'child_process';

let mainWindow: BrowserWindow | null = null;

// Persistent Logs & History Path
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');
const historyPath = path.join(userDataPath, 'history.json');
const logsPath = path.join(userDataPath, 'app.log');

// Default Config
const defaultConfig = {
  companyName: 'RELIQUIA',
  domainUser: String.raw`RELIQUIA\pasta.paralegal`,
  adPass: 'Mestre@300',
  adServerIp: '192.168.100.30',
  sourcePath: String.raw`\\192.168.100.30\gpo\criarpastas_paralegal\MODELO`,
  destSharePath: String.raw`\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS`,
};

// Corporate Default Config embedded in MSI resources
const bundledConfigPath = path.join(process.resourcesPath, 'default_config.json');

function loadConfig() {
  if (fs.existsSync(bundledConfigPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(bundledConfigPath, 'utf-8'));
      return { ...parsed, isLockedByMSI: true };
    } catch (e) {}
  }
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {}
  }
  return defaultConfig;
}

function saveConfig(cfg: any) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
}

function appendLog(msg: string) {
  const time = new Date().toLocaleTimeString('pt-BR');
  const line = `[${time}] ${msg}`;
  fs.appendFileSync(logsPath, line + '\n', 'utf-8');
  if (mainWindow) {
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

ipcMain.handle('get-history', () => {
  if (fs.existsSync(historyPath)) {
    try {
      return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch (e) {}
  }
  return [];
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
