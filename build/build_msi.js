const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const MSICreator = require('electron-wix-msi').MSICreator;

console.log('=========================================================');
console.log(' FOLDERWORKS (ENTROPY) - GERADOR DE MSI EMBUTIDO VIA .ENV');
console.log('=========================================================');

const projectRoot = path.join(__dirname, '..');
const desktopPath = path.join(process.env.USERPROFILE || 'C:\\Users\\andre.abdala', 'Desktop');

// Adiciona WiX Toolset v3.14 ao PATH do processo
process.env.PATH = `${process.env.PATH};C:\\Program Files (x86)\\WiX Toolset v3.14\\bin`;

// Carrega .env manualmente se existir
function loadDotEnv() {
  const envPath = path.join(projectRoot, '.env');
  const envVars = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*"(.*)"\s*$/);
      if (match) {
        envVars[match[1]] = match[2].replace(/\\\\/g, '\\');
      }
    });
  }
  return envVars;
}

async function buildMSI() {
  const env = loadDotEnv();
  const isCru = process.argv.includes('--cru') || !process.argv.includes('--internal');

  // Configuração crua universal para o MSI limpo (sem dados confidenciais)
  const cruConfig = {
    isLockedByMSI: false,
    "Empresa Modelo": {
      name: "Empresa Modelo",
      companyName: "Empresa Modelo",
      sourcePath: "C:\\FolderWorks\\MODELO",
      destinationParentPath: "C:\\FolderWorks\\CLIENTES\\EMPRESAS",
      destSharePath: "C:\\FolderWorks\\CLIENTES\\EMPRESAS",
      allowedBasePath: "C:\\FolderWorks\\CLIENTES",
      defaultSourceFolder: "C:\\FolderWorks\\CLIENTES\\EMPRESAS",
      logDirectory: "C:\\FolderWorks\\LOGS",
      selectedLogFile: "",
      presetDestinations: [
        { name: "00 - EX CLIENTES", path: "C:\\FolderWorks\\CLIENTES\\00 - EX CLIENTES", isPredefined: true },
        { name: "01 - EMPRESAS ENCERRADAS", path: "C:\\FolderWorks\\CLIENTES\\01 - EMPRESAS ENCERRADAS", isPredefined: true }
      ],
      adServerIp: "",
      domainUser: "",
      adPass: ""
    },
    tiLogsPassword: ""
  };

  // Configuração corporativa sanitizada para o repositório público (valores de exemplo)
  const corporateNetworkConfig = {
    isLockedByMSI: false,
    EMPRESA_1: {
      name: env.EMPRESA1_NAME || 'Empresa Modelo 01',
      companyName: 'Empresa Modelo 01',
      sourcePath: env.EMPRESA1_SOURCE_PATH || '\\\\servidor\\compartilhamento\\MODELO',
      destinationParentPath: env.EMPRESA1_DESTINATION_PATH || '\\\\servidor\\compartilhamento\\CLIENTES\\EMPRESAS',
      destSharePath: env.EMPRESA1_DESTINATION_PATH || '\\\\servidor\\compartilhamento\\CLIENTES\\EMPRESAS',
      allowedBasePath: '\\\\servidor\\compartilhamento\\CLIENTES',
      defaultSourceFolder: '\\\\servidor\\compartilhamento\\CLIENTES\\EMPRESAS',
      logDirectory: '\\\\servidor\\compartilhamento\\LOGS',
      selectedLogFile: '',
      presetDestinations: [
        { name: '00 - EX CLIENTES', path: '\\\\servidor\\compartilhamento\\CLIENTES\\00 - EX CLIENTES', isPredefined: true },
        { name: '01 - EMPRESAS ENCERRADAS', path: '\\\\servidor\\compartilhamento\\CLIENTES\\01 - EMPRESAS ENCERRADAS', isPredefined: true }
      ],
      adServerIp: env.EMPRESA1_AD_IP || '',
      domainUser: env.EMPRESA1_AD_USER || 'DOMINIO\\pasta.servico',
      adPass: env.EMPRESA1_AD_PASS || ''
    },
    EMPRESA_2: {
      name: env.EMPRESA2_NAME || 'Empresa Modelo 02',
      companyName: 'Empresa Modelo 02',
      sourcePath: env.EMPRESA2_SOURCE_PATH || '\\\\servidor\\filial\\MODELO',
      destinationParentPath: env.EMPRESA2_DESTINATION_PATH || '\\\\servidor\\filial\\CLIENTES\\EMPRESAS',
      destSharePath: env.EMPRESA2_DESTINATION_PATH || '\\\\servidor\\filial\\CLIENTES\\EMPRESAS',
      allowedBasePath: '\\\\servidor\\filial\\CLIENTES',
      defaultSourceFolder: '\\\\servidor\\filial\\CLIENTES\\EMPRESAS',
      logDirectory: '\\\\servidor\\filial\\LOGS',
      selectedLogFile: '',
      presetDestinations: [
        { name: '00 - EX CLIENTES', path: '\\\\servidor\\filial\\CLIENTES\\00 - EX CLIENTES', isPredefined: true },
        { name: '01 - EMPRESAS ENCERRADAS', path: '\\\\servidor\\filial\\CLIENTES\\01 - EMPRESAS ENCERRADAS', isPredefined: true }
      ],
      adServerIp: env.EMPRESA2_AD_IP || '',
      domainUser: env.EMPRESA2_AD_USER || 'DOMINIO\\pasta.servico',
      adPass: env.EMPRESA2_AD_PASS || ''
    },
    tiLogsPassword: env.TI_LOGS_PASSWORD || ''
  };

  const masterConfig = isCru ? cruConfig : corporateNetworkConfig;
  console.log(`[-] Modo de compilação do MSI: ${isCru ? 'CRU / UNIVERSAL (Sem dados corporativos embutidos)' : 'INTERNAL / EMBUTIDO'}`);

  console.log('[-] Limpando diretórios temporários e de compilação anteriores...');
  const distDir = path.join(projectRoot, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('✓ Pasta dist anterior removida com sucesso.');
  }

  console.log('[0/3] Compilando React e Electron via npx vite build...');
  try {
    execSync('npx vite build', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
  } catch (e) {
    console.error('Falha no vite build:', e);
    process.exit(1);
  }

  console.log('[1/3] Empacotando aplicação via electron-packager (Otimizado com ASAR e Exclusões)...');
  const unpackedDir = path.join(projectRoot, 'dist', 'win-unpacked');
  try {
    if (fs.existsSync(unpackedDir)) {
      fs.rmSync(unpackedDir, { recursive: true, force: true });
    }
    const ignoreRegex = '^/(src|electron|build|scratch|node_modules|dist/(msi|win-unpacked)|.*\\.cs$|.*\\.ps1$|.*\\.wxs$|\\.git|\\.env)';
    const packCmd = `npx electron-packager . FolderWorks --platform=win32 --arch=x64 --out=dist/win-unpacked --overwrite --icon=src/assets/icon.ico --asar --prune=true --ignore="${ignoreRegex}"`;
    execSync(packCmd, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
  } catch (e) {
    console.error('Falha no electron-packager:', e);
    process.exit(1);
  }

  const appDir = path.join(projectRoot, 'dist', 'win-unpacked', 'FolderWorks-win32-x64');
  
  // Copiar binário nativo ExecuteAsUser.exe para pasta resources/core
  const resourcesCoreDir = path.join(appDir, 'resources', 'core');
  if (!fs.existsSync(resourcesCoreDir)) fs.mkdirSync(resourcesCoreDir, { recursive: true });
  fs.copyFileSync(path.join(projectRoot, 'electron', 'core', 'ExecuteAsUser.exe'), path.join(resourcesCoreDir, 'ExecuteAsUser.exe'));
  console.log(`✓ Binário ExecuteAsUser.exe copiado para: ${resourcesCoreDir}`);
  console.log(`✓ Aplicação empacotada em: ${appDir}`);

  // Embutir master default_config.json na pasta de recursos
  const resourcesDir = path.join(appDir, 'resources');
  if (!fs.existsSync(resourcesDir)) fs.mkdirSync(resourcesDir, { recursive: true });
  const masterConfigPath = path.join(resourcesDir, 'default_config.json');
  fs.writeFileSync(masterConfigPath, JSON.stringify(masterConfig, null, 2), 'utf-8');
  console.log(`✓ Configurações corporativas salvas dentro do pacote MSI em: ${masterConfigPath}`);

  console.log('[2/3] Gerando pacote .MSI com suporte a Atualização Automática (UpgradeCode)...');
  const msiCreator = new MSICreator({
    appDirectory: appDir,
    description: isCru ? 'FolderWorks - Suíte de Automação de Criador de Pastas (Universal)' : 'FolderWorks - Suíte de Automação de Criador de Pastas',
    exe: 'FolderWorks.exe',
    name: 'FolderWorks',
    shortcutName: 'FolderWorks',
    shortcutFolderName: 'FolderWorks',
    upgradeCode: '8f74a92c-561b-4632-9b21-3a218d6e9f10', // GUID FIXO PARA ATUALIZAÇÃO IN-PLACE
    manufacturer: 'ENTROPY - André Abdala',
    version: '3.0.0',
    icon: path.join(projectRoot, 'src', 'assets', 'icon.ico'),
    outputDirectory: path.join(projectRoot, 'dist', 'msi'),
    ui: {
      chooseDirectory: true
    }
  });

  await msiCreator.create();

  // Injetar encerramento forçado e automático de instâncias em execução
  const wxsFilePath = path.join(projectRoot, 'dist', 'msi', 'FolderWorks.wxs');
  if (fs.existsSync(wxsFilePath)) {
    let wxsContent = fs.readFileSync(wxsFilePath, 'utf-8');
    
    // Substituir regra restritiva de downgrade por atualização permissiva
    wxsContent = wxsContent.replace(
      /<MajorUpgrade\s+[^>]*\/>/g,
      '<MajorUpgrade AllowDowngrades="yes" Schedule="afterInstallInitialize" />'
    );

    const killAppSnippet = `
    <!-- Encerramento Automático de Instâncias Anteriores do FolderWorks (Evita Files in Use) -->
    <CustomAction Id="SetKillAppCmd" Property="QtExecCmdLine" Value="&quot;[SystemFolder]taskkill.exe&quot; /F /IM FolderWorks.exe /T" Execute="immediate" />
    <CustomAction Id="KillRunningApp" BinaryKey="WixCA" DllEntry="CAQuietExec" Execute="immediate" Return="ignore" />
    
    <util:CloseApplication Id="CloseFolderWorks" Target="FolderWorks.exe" CloseMessage="no" Description="Fechando FolderWorks em execução..." TerminateProcess="1" Timeout="3" RebootPrompt="no" />

    <InstallUISequence>
      <Custom Action="SetKillAppCmd" Before="KillRunningApp">1</Custom>
      <Custom Action="KillRunningApp" Before="CostInitialize">1</Custom>
    </InstallUISequence>
    <InstallExecuteSequence>
      <Custom Action="SetKillAppCmd" Before="KillRunningApp">1</Custom>
      <Custom Action="KillRunningApp" Before="InstallValidate">1</Custom>
    </InstallExecuteSequence>
`;
    wxsContent = wxsContent.replace('</Product>', killAppSnippet + '\n</Product>');
    fs.writeFileSync(wxsFilePath, wxsContent, 'utf-8');
    console.log('✓ Injetado encerramento forçado e AllowDowngrades="yes" no FolderWorks.wxs');
  }

  await msiCreator.compile();

  const sourceMsi = path.join(projectRoot, 'dist', 'msi', 'FolderWorks.msi');
  const desktopMsi = path.join(desktopPath, 'FolderWorks.msi');
  const internalInstallerDir = path.join(projectRoot, '..', '01 - Instalador', 'Internal');
  const publicInstallerDir = path.join(projectRoot, '..', '01 - Instalador', 'Public');
  const oneFileDir = path.join(projectRoot, '..', '01 - Instalador', 'OneFile', 'FolderWorks-win32-x64');

  if (fs.existsSync(sourceMsi)) {
    // 1. Diretório Internal
    if (!fs.existsSync(internalInstallerDir)) fs.mkdirSync(internalInstallerDir, { recursive: true });
    try { fs.copyFileSync(sourceMsi, path.join(internalInstallerDir, 'FolderWorks-v3.0.0-win-x64.msi')); } catch (e) {}
    try { fs.copyFileSync(sourceMsi, path.join(internalInstallerDir, 'FolderWorks.msi')); } catch (e) {}

    // 2. Diretório Public (Para publicação no GitHub Releases)
    if (!fs.existsSync(publicInstallerDir)) fs.mkdirSync(publicInstallerDir, { recursive: true });
    try { fs.copyFileSync(sourceMsi, path.join(publicInstallerDir, 'FolderWorks-v3.0.0-win-x64.msi')); } catch (e) {}
    try { fs.copyFileSync(sourceMsi, path.join(publicInstallerDir, 'FolderWorks.msi')); } catch (e) {}

    // 3. Desktop
    try {
      if (fs.existsSync(desktopMsi)) {
        try { fs.unlinkSync(desktopMsi); } catch (eUnlink) {}
      }
      fs.copyFileSync(sourceMsi, desktopMsi);
    } catch (eCopy) {
      console.log(`[AVISO] Não foi possível copiar para Área de Trabalho: ${eCopy.message}`);
    }
  }

  // 4. Salvar arquivo de configuração corporativo pré-disponibilizado na rede (SMB)
  const corporateJsonContent = JSON.stringify(corporateNetworkConfig, null, 2);
  const internalConfigPath = path.join(internalInstallerDir, 'folderworks_config.json');
  try {
    fs.writeFileSync(internalConfigPath, corporateJsonContent, 'utf-8');
    console.log(`✓ Arquivo de configuração corporativo salvo em: ${internalConfigPath}`);
  } catch (e) {}

  // Salvar template sanitizado em Public
  const exampleJsonContent = JSON.stringify(cruConfig, null, 2);
  const publicExamplePath = path.join(publicInstallerDir, 'folderworks_config.example.json');
  try {
    fs.writeFileSync(publicExamplePath, exampleJsonContent, 'utf-8');
    console.log(`✓ Template sanitizado salvo em: ${publicExamplePath}`);
  } catch (e) {}

  // Publicar diretamente nas pastas de rede corporativa se configurado via .env
  const networkShares = env.SHARED_CONFIG_NETWORK_PATHS ? env.SHARED_CONFIG_NETWORK_PATHS.split(';') : [];

  for (const netPath of networkShares) {
    if (!netPath || !netPath.trim()) continue;
    try {
      const netDir = path.dirname(netPath.trim());
      if (fs.existsSync(netDir)) {
        fs.writeFileSync(netPath.trim(), corporateJsonContent, 'utf-8');
        console.log(`✓ Configuração sincronizada na rede: ${netPath}`);
      }
    } catch (netErr) {
      console.log(`[AVISO REDE] Compartilhamento '${netPath}' offline ou sem permissão de escrita.`);
    }
  }

  console.log('');
  console.log('=========================================================');
  console.log(` SUCESSO! INSTALADOR FOLDERWORKS v3.0.0 GERADO EM:`);
  console.log(` -> Public:   ${path.join(publicInstallerDir, 'FolderWorks-v3.0.0-win-x64.msi')}`);
  console.log(` -> Internal: ${path.join(internalInstallerDir, 'FolderWorks-v3.0.0-win-x64.msi')}`);
  console.log(` -> Desktop:  ${desktopMsi}`);
  console.log('=========================================================');
}

buildMSI();
