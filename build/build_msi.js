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

  const masterConfig = {
    isLockedByMSI: true,
    RELIQUIA: {
      name: env.RELIQUIA_NAME || 'RELIQUIA',
      companyName: 'RELIQUIA',
      sourcePath: env.RELIQUIA_SOURCE_PATH || '\\\\192.168.100.30\\gpo\\criarpastas_paralegal\\MODELO',
      destinationParentPath: env.RELIQUIA_DESTINATION_PATH || '\\\\192.168.1.242\\reliquia-arquivos\\CLIENTES\\EMPRESAS',
      destSharePath: env.RELIQUIA_DESTINATION_PATH || '\\\\192.168.1.242\\reliquia-arquivos\\CLIENTES\\EMPRESAS',
      allowedBasePath: '\\\\192.168.1.242\\reliquia-arquivos\\CLIENTES',
      defaultSourceFolder: '\\\\192.168.1.242\\reliquia-arquivos\\CLIENTES\\EMPRESAS',
      presetDestinations: [
        { name: '00 - EX CLIENTES', path: '\\\\192.168.1.242\\reliquia-arquivos\\CLIENTES\\00 - EX CLIENTES' },
        { name: '01 - EMPRESAS ENCERRADAS', path: '\\\\192.168.1.242\\reliquia-arquivos\\CLIENTES\\01 - EMPRESAS ENCERRADAS' }
      ],
      adServerIp: env.RELIQUIA_AD_IP || '192.168.100.30',
      domainUser: env.RELIQUIA_AD_USER || 'RELIQUIA\\pasta.paralegal',
      adPass: env.RELIQUIA_AD_PASS || 'Mestre@300'
    },
    RTO: {
      name: env.RTO_NAME || 'RTO',
      companyName: 'RTO',
      sourcePath: env.RTO_SOURCE_PATH || '\\\\192.168.50.102\\gpo\\criarpastas_paralegal\\MODELO',
      destinationParentPath: env.RTO_DESTINATION_PATH || '\\\\192.168.50.102\\rto\\CLIENTES\\EMPRESAS',
      destSharePath: env.RTO_DESTINATION_PATH || '\\\\192.168.50.102\\rto\\CLIENTES\\EMPRESAS',
      allowedBasePath: '\\\\192.168.50.102\\rto\\CLIENTES',
      defaultSourceFolder: '\\\\192.168.50.102\\rto\\CLIENTES\\EMPRESAS',
      presetDestinations: [
        { name: '00 - EX CLIENTES', path: '\\\\192.168.50.102\\rto\\CLIENTES\\00 - EX CLIENTES' },
        { name: '01 - EMPRESAS ENCERRADAS', path: '\\\\192.168.50.102\\rto\\CLIENTES\\01 - EMPRESAS ENCERRADAS' }
      ],
      adServerIp: env.RTO_AD_IP || '192.168.50.102',
      domainUser: env.RTO_AD_USER || 'pasta.paralegal',
      adPass: env.RTO_AD_PASS || 'Mestre@300'
    }
  };

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
    description: 'FolderWorks - Entropy FolderWorks Suíte de Automação de Criador de Pastas (Pré-configurado no MSI)',
    exe: 'FolderWorks.exe',
    name: 'FolderWorks',
    shortcutName: 'FolderWorks',
    shortcutFolderName: 'FolderWorks',
    upgradeCode: '8f74a92c-561b-4632-9b21-3a218d6e9f10', // GUID FIXO PARA ATUALIZAÇÃO IN-PLACE
    manufacturer: 'ENTROPY - André Abdala',
    version: '2.5.5',
    version: '2.5.6',
    icon: path.join(projectRoot, 'src', 'assets', 'icon.ico'),
    outputDirectory: path.join(projectRoot, 'dist', 'msi'),
    ui: {
      chooseDirectory: true
    }
  });

  await msiCreator.create();
  await msiCreator.compile();

  const sourceMsi = path.join(projectRoot, 'dist', 'msi', 'FolderWorks.msi');
  const desktopMsi = path.join(desktopPath, 'FolderWorks.msi');

  if (fs.existsSync(sourceMsi)) {
    try {
      if (fs.existsSync(desktopMsi)) {
        try { fs.unlinkSync(desktopMsi); } catch (eUnlink) {}
      }
      fs.copyFileSync(sourceMsi, desktopMsi);
    } catch (eCopy) {
      console.log(`[AVISO] O MSI gerado está disponível no repositório: ${sourceMsi}`);
    }
  }

  console.log('');
  console.log('=========================================================');
  console.log(' SUCESSO! PACOTE FOLDERWORKS .MSI PRÉ-CONFIGURADO GERADO EM:');
  console.log(` -> ${sourceMsi}`);
  console.log(` -> ${desktopMsi} (Área de Trabalho)`);
  console.log('=========================================================');
}

buildMSI();
