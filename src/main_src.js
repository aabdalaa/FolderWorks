const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ESTRUTURAS EMBUTIDAS DE SUBPASTAS (FALLBACK)
const embeddedTemplates = require('./embeddedTemplates');
const permissionsData = require('./permissionsData');

// CAMINHO DO ARQUIVO DE LOG ÚNICO (%APPDATA%\Entropy\FolderWorks\entropy_folderworks.log)
const logDir = path.join(app.getPath('appData'), 'Entropy', 'FolderWorks');
const logFilePath = path.join(logDir, 'entropy_folderworks.log');

function initializeSingleLogFile() {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const initialText = `=========================================================\n LOG ENTROPY FOLDERWORKS - INICIALIZADO EM ${new Date().toLocaleString('pt-BR')}\n=========================================================\n\n`;
    fs.writeFileSync(logFilePath, initialText, 'utf8');
  } catch (err) {
    console.error('Erro ao inicializar log:', err);
  }
}

function appendLog(msg) {
  try {
    const time = new Date().toLocaleTimeString('pt-BR');
    fs.appendFileSync(logFilePath, `[${time}] ${msg}\n`, 'utf8');
  } catch (err) { }
}

// SANITIZAÇÃO E CORREÇÃO RIGOROSA DE CAMINHOS UNC DA REDE
function cleanUncPath(p) {
  if (!p) return p;
  let clean = p;

  // 1. Trata escape do CR \r antes de 'to' ou 'eliquia'/'reliquia'
  clean = clean.replace(/\rto/gi, '\\rto');
  clean = clean.replace(/\relia/gi, '\\reliquia');
  clean = clean.replace(/\reliquia/gi, '\\reliquia');
  clean = clean.replace(/\r(?=to)/gi, '\\r');
  clean = clean.replace(/\r(?=eliquia)/gi, '\\reliquia');
  clean = clean.replace(/\r(?=reliquia)/gi, '\\reliquia');

  // 2. Corrige sequências corrompidas tipo \r\ ou \r isolado antes do nome da pasta
  clean = clean.replace(/192\.168\.1\.242\\r\\/gi, '192.168.1.242\\');
  clean = clean.replace(/192\.168\.1\.242\\r/gi, '192.168.1.242\\');
  clean = clean.replace(/192\.168\.1\.242eliquia/gi, '192.168.1.242\\reliquia');
  clean = clean.replace(/192\.168\.50\.102to/gi, '192.168.50.102\\rto');
  clean = clean.replace(/\\r\\reliquia/gi, '\\reliquia');
  clean = clean.replace(/eliquia-arquivos/gi, 'reliquia-arquivos');

  // 3. Elimina qualquer CR/LF remanescente
  clean = clean.replace(/[\r\n]/g, '');

  // 4. Normaliza barras duplas mantendo apenas o \\ inicial do servidor UNC
  clean = clean.replace(/\\+/g, '\\');
  if (!clean.startsWith('\\\\')) {
    clean = '\\\\' + clean.replace(/^\\+/, '');
  }
  return clean;
}

// APLICAÇÃO DAS PERMISSÕES NTFS REAIS (DACL) PASTA A PASTA EM MEMÓRIA (D:PAI - HERDADO DE: NENHUM)
function applyNtfsPermissions(targetClientPath, sddlMap) {
  return new Promise((resolve) => {
    try {
      const entries = Object.entries(sddlMap);
      appendLog(`[PERMISSÕES] Iniciando aplicação D:PAI em ${entries.length} diretórios...`);

      for (const [relFolder, rawSddl] of entries) {
        if (!rawSddl) continue;
        
        // Determina o caminho final da pasta no disco
        const folderPath = relFolder ? path.join(targetClientPath, relFolder) : targetClientPath;
        if (!fs.existsSync(folderPath)) continue;

        // Garante cabeçalho D:PAI (Herança Protegida/Desabilitada = Herdado de: Nenhum)
        let sddl = rawSddl;
        if (sddl.includes('D:') && !sddl.includes('D:PAI')) {
          if (sddl.includes('D:AI')) {
            sddl = sddl.replace(/D:AI/g, 'D:PAI');
          } else {
            sddl = sddl.replace(/D:/g, 'D:PAI');
          }
        }

        // Script PowerShell limpo executado por pasta
        const psCmd = `$acl = Get-Acl -LiteralPath '${folderPath.replace(/'/g, "''")}'; $acl.SetSecurityDescriptorSddlForm('${sddl}', [System.Security.AccessControl.AccessControlSections]::Access); Set-Acl -LiteralPath '${folderPath.replace(/'/g, "''")}' -AclObject $acl`;
        
        try {
          execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd.replace(/"/g, '\"')}"`, { stdio: 'ignore' });
          appendLog(`[PERMISSÃO OK] ${relFolder || 'Raiz'}`);
        } catch (e) {
          appendLog(`[AVISO PERMISSÃO] ${relFolder || 'Raiz'}: ${e.message}`);
        }
      }
      appendLog(`[SUCESSO PERMISSÕES] Todas as permissões D:PAI aplicadas em ${targetClientPath}.`);
      resolve(true);
    } catch (err) {
      appendLog(`[ERRO PERMISSÕES] ${err.message}`);
      resolve(false);
    }
  });
}

// CAPTURA DE ERROS NÃO TRATADOS (UNCAUGHT EXCEPTIONS LOGGING)
process.on('uncaughtException', (err) => {
  appendLog(`[FATAL UNCAUGHT EXCEPTION] ${err.stack || err.message || err}`);
});

process.on('unhandledRejection', (reason, promise) => {
  appendLog(`[FATAL UNHANDLED REJECTION] ${reason}`);
});

let mainWindow = null;

function createWindow() {
  initializeSingleLogFile();
  appendLog('[INICIALIZAÇÃO] Processo principal Entropy FolderWorks iniciado.');

  const iconPath = path.join(__dirname, 'assets', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 650,
    title: 'Entropy FolderWorks - Suíte de Automação 2026',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize(); // ABERTURA EM TELA CHEIA AUTOMÁTICA
    mainWindow.show();
    appendLog('[INICIALIZAÇÃO] Janela maximizada em Tela Cheia aberta com sucesso.');
  });

  mainWindow.webContents.on('crashed', (event) => {
    appendLog('[ERRO RENDERER] A janela do navegador caiu (crashed).');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// RESPOSTA IPC SAIR / ENCERRAR
ipcMain.on('exit-app', () => {
  appendLog('[ENCERRAR] Aplicativo finalizado pelo usuário.');
  app.quit();
});

// IPC HANDLER ABRIR LINKS EXTERNOS NO NAVEGADOR PADRÃO (GITHUB / LINKEDIN)
ipcMain.on('open-external-url', (event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    appendLog(`[NAVEGADOR EXTERNO] Abrindo link: ${url}`);
    shell.openExternal(url);
  }
});

// CONFIGURAÇÃO DAS EMPRESAS (ENV COM FALLBACKS INTERNOS DA REDE)
function getCompanyConfig(companyKey) {
  if (companyKey === '1') { // RTO
    const rawSrc = (process.env.RTO_SOURCE_PATH || '\\\\192.168.50.102\\gpo\\criarpastas_paralegal\\MODELO').replace(/ 2026/gi, '');
    const rawDest = process.env.RTO_DESTINATION_PATH || '\\\\192.168.50.102\\rto\\CLIENTES\\EMPRESAS';
    return {
      name: 'RTO',
      fullDisplayName: process.env.RTO_DISPLAY_NAME || 'RTO CONSULTORIA EMPRESARIAL',
      sourcePath: cleanUncPath(rawSrc),
      destinationParentPath: cleanUncPath(rawDest),
      embeddedFolders: embeddedTemplates.RTO_FOLDERS,
      sddlMap: permissionsData.RTO_SDDL_MAP
    };
  } else { // RELIQUIA
    const rawSrc = (process.env.RELIQUIA_SOURCE_PATH || '\\\\192.168.1.242\\gpo\\criarpastas_paralegal\\MODELO').replace(/ 2026/gi, '');
    const rawDest = process.env.RELIQUIA_DESTINATION_PATH || '\\\\192.168.1.242\\reliquia-arquivos\\CLIENTES\\EMPRESAS';
    return {
      name: 'RELIQUIA',
      fullDisplayName: process.env.RELIQUIA_DISPLAY_NAME || 'RELIQUIA ASSESSORIA CONTÁBIL',
      sourcePath: cleanUncPath(rawSrc),
      destinationParentPath: cleanUncPath(rawDest),
      embeddedFolders: embeddedTemplates.RELIQUIA_FOLDERS,
      sddlMap: permissionsData.RELIQUIA_SDDL_MAP
    };
  }
}

// IPC CREATION HANDLER - ROBOCOPY ULTRARRÁPIDO /MT:64 E TRANSMISSÃO DIRETA DE PERMISSÕES NTFS
ipcMain.handle('create-folder', async (event, { companyKey, clientName }) => {
  const config = getCompanyConfig(companyKey);
  const parentDir = cleanUncPath(config.destinationParentPath);
  const finalPath = path.join(parentDir, clientName);

  appendLog(`[SOLICITAÇÃO] Empresa: ${config.name} | Cliente: ${clientName}`);
  appendLog(`[ORIGEM MODELO] ${config.sourcePath}`);
  appendLog(`[DESTINO FINAL] ${finalPath}`);

  // 1. VERIFICA SE JÁ EXISTE NO DESTINO
  if (fs.existsSync(finalPath)) {
    const errorMsg = `A pasta do cliente já existe no destino:\n${finalPath}`;
    appendLog(`[ERRO] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  return new Promise(async (resolve) => {
    const rawAdUser = process.env.AD_USER || 'pasta.paralegal';
    const pureUser = rawAdUser.includes('\\') ? rawAdUser.split('\\')[1] : rawAdUser;
    const adUser = config.name === 'RELIQUIA' && !rawAdUser.includes('\\') ? `RELIQUIA\\${rawAdUser}` : rawAdUser;
    const adPass = process.env.AD_PASS || '';
    const adServerIp = config.name === 'RTO' ? '192.168.50.102' : '192.168.1.242';

    // 2. VALIDAÇÃO OBRIGATÓRIA DA EXISTÊNCIA DA CONTA DE SERVIÇO NO AD ESPECÍFICO DA EMPRESA (LDAP DIRECTORYENTRY)
    appendLog(`[VALIDAÇÃO AD ${config.name}] Verificando se a conta de serviço '${pureUser}' existe no Active Directory de ${config.name} (${adServerIp})...`);
    let userExistsInAD = false;
    try {
      const psCheckCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$entry = New-Object System.DirectoryServices.DirectoryEntry('LDAP://${adServerIp}'); $searcher = New-Object System.DirectoryServices.DirectorySearcher($entry); $searcher.Filter = '(sAMAccountName=${pureUser})'; $res = $searcher.FindOne(); if ($res -ne $null) { exit 0 } else { exit 1 }"`;
      execSync(psCheckCmd, { stdio: 'ignore' });
      userExistsInAD = true;
      appendLog(`[VALIDAÇÃO AD ${config.name}] Conta de serviço '${pureUser}' confirmada no Active Directory de ${config.name} (${adServerIp}).`);
    } catch (eAD) {
      userExistsInAD = false;
    }

    // Se o usuário 'pasta.paralegal' NÃO EXISTIR no Active Directory do domínio selecionado, ABORTA A CRIAÇÃO IMEDIATAMENTE!
    if (!userExistsInAD) {
      const errorMsg = `[ERRO CRÍTICO AD] A conta de serviço '${pureUser}' não foi encontrada no Active Directory da ${config.name} (servidor ${adServerIp}).\n\nPor favor, valide a conta '${pureUser}' no Active Directory antes de gerar pastas para esta empresa.`;
      appendLog(`[ABORTADO ${config.name}] ${errorMsg}`);
      return resolve({ success: false, error: errorMsg });
    }

    // 3. IMPERSONAÇÃO E EXECUÇÃO ESTRITA SOB O TOKEN DO USUÁRIO DE SERVIÇO (ExecuteAsUser.exe)
    const executorPath = path.join(__dirname, 'assets', 'ExecuteAsUser.exe');
    const srcArg = config.sourcePath.replace(/\\$/, '');
    const destArg = finalPath.replace(/\\$/, '');

    appendLog(`[IMPERSONAÇÃO AD] Executando Robocopy estritamente sob a conta de serviço '${adUser}'...`);

    const execCmd = `"${executorPath}" "${adUser}" "${adPass}" "${srcArg}" "${destArg}"`;

    exec(execCmd, async (error, stdout, stderr) => {
      const exitCode = error && error.code !== undefined ? error.code : 0;

      if (exitCode < 8 && fs.existsSync(finalPath)) {
        appendLog(`[SUCESSO INTEGRAL AD] Transmissão de estrutura e permissões NTFS finalizada sob a conta '${adUser}' com código ${exitCode}.`);
        
        // Ajustes pós-robocopy: Renomeia EXPEDICAO -> EXPEDIÇÃO se necessário
        try {
          const expOld = path.join(finalPath, 'EXPEDICAO');
          const expNew = path.join(finalPath, 'EXPEDIÇÃO');
          if (fs.existsSync(expOld) && !fs.existsSync(expNew)) {
            fs.renameSync(expOld, expNew);
            appendLog(`[AJUSTE NOME] Pasta EXPEDICAO renomeada para EXPEDIÇÃO.`);
          }
          // Remove pasta GERÊNCIA/GERENCIA se existir
          const ger1 = path.join(finalPath, 'GERÊNCIA');
          const ger2 = path.join(finalPath, 'GERENCIA');
          if (fs.existsSync(ger1)) fs.rmdirSync(ger1, { recursive: true });
          if (fs.existsSync(ger2)) fs.rmdirSync(ger2, { recursive: true });
        } catch (errName) {}

        resolve({ success: true });
      } else {
        const failMsg = `A autenticação ou criação sob o usuário de serviço '${adUser}' falhou (Código de saída: ${exitCode}).\n\nA criação foi abortada para impedir o uso do usuário logado na máquina.`;
        appendLog(`[ERRO CRÍTICO IMPERSONAÇÃO] ${failMsg}`);
        resolve({ success: false, error: failMsg });
      }
    });
  });
});