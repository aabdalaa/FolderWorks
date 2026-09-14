const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const MSICreator = require('electron-wix-msi').MSICreator;

console.log('=========================================================');
console.log(' ENTROPY FOLDERWORKS - COMPILADOR DINÂMICO DE MSI');
console.log('=========================================================');

const projectRoot = path.join(__dirname, '..');
const desktopPath = path.join(process.env.USERPROFILE || 'C:\\Users\\andre.abdala', 'Desktop');

// Adiciona WiX Toolset v3.14 ao PATH do processo
process.env.PATH = `${process.env.PATH};C:\\Program Files (x86)\\WiX Toolset v3.14\\bin`;

async function compileCustomMSI(customConfig, customMsiName = 'FolderWorks_Custom.msi') {
  console.log('[1/3] Empacotando aplicação base via electron-packager...');
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
    throw new Error('Falha na compilação do Vite: ' + e.message);
  }

  console.log('[1/3] Empacotando aplicação base via electron-packager (Otimizado com ASAR e Exclusões)...');
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
    throw new Error('Falha no empacotador base Electron: ' + e.message);
  }

  const appDir = path.join(projectRoot, 'dist', 'win-unpacked', 'FolderWorks-win32-x64');
  console.log(`✓ Aplicação base empacotada em: ${appDir}`);

  // Copiar binário nativo ExecuteAsUser.exe para pasta resources/core
  const resourcesCoreDir = path.join(appDir, 'resources', 'core');
  if (!fs.existsSync(resourcesCoreDir)) fs.mkdirSync(resourcesCoreDir, { recursive: true });
  fs.copyFileSync(path.join(projectRoot, 'electron', 'core', 'ExecuteAsUser.exe'), path.join(resourcesCoreDir, 'ExecuteAsUser.exe'));
  console.log(`✓ Binário ExecuteAsUser.exe copiado para: ${resourcesCoreDir}`);

  // Injetar customConfig como default_config.json na pasta de recursos do aplicativo
  const resourcesDir = path.join(appDir, 'resources');
  if (!fs.existsSync(resourcesDir)) fs.mkdirSync(resourcesDir, { recursive: true });
  
  const configToEmbed = {
    isLockedByMSI: true,
    ...customConfig
  };

  const masterConfigPath = path.join(resourcesDir, 'default_config.json');
  fs.writeFileSync(masterConfigPath, JSON.stringify(configToEmbed, null, 2), 'utf-8');
  console.log(`✓ Configurações corporativas personalizadas gravadas dentro do pacote MSI em: ${masterConfigPath}`);

  console.log('[2/3] Gerando pacote .MSI pré-configurado via WiX Toolset v3.14...');
  const msiCreator = new MSICreator({
    appDirectory: appDir,
    description: 'FolderWorks - Suíte de Automação de Criador de Pastas (Pré-configurado)',
    exe: 'FolderWorks.exe',
    name: 'FolderWorks',
    shortcutName: 'FolderWorks',
    shortcutFolderName: 'FolderWorks',
    upgradeCode: '8f74a92c-561b-4632-9b21-3a218d6e9f10', // GUID FIXO PARA ATUALIZAÇÃO IN-PLACE
    manufacturer: 'ENTROPY - André Abdala',
    version: '2.8.1',
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
    console.log('✓ Injetado encerramento forçado de instâncias ativas (taskkill + util:CloseApplication) no FolderWorks.wxs');
  }

  await msiCreator.compile();

  const sourceMsi = path.join(projectRoot, 'dist', 'msi', 'FolderWorks.msi');
  const targetMsiName = customMsiName.endsWith('.msi') ? customMsiName : `${customMsiName}.msi`;
  const desktopMsi = path.join(desktopPath, targetMsiName);

  if (fs.existsSync(sourceMsi)) {
    try {
      if (fs.existsSync(desktopMsi)) {
        try { fs.unlinkSync(desktopMsi); } catch (eUnlink) {}
      }
      fs.copyFileSync(sourceMsi, desktopMsi);
    } catch (eCopy) {
      console.log(`[AVISO] O MSI gerado está disponível em: ${sourceMsi}`);
    }
  }

  console.log('=========================================================');
  console.log(' SUCESSO! PACOTE MSI PERSONALIZADO GERADO EM:');
  console.log(` -> ${desktopMsi} (Área de Trabalho)`);
  console.log('=========================================================');

  return desktopMsi;
}

// Se for chamado diretamente via linha de comando
if (require.main === module) {
  const customConfigPath = process.argv[2];
  let customConfig = {};
  if (customConfigPath && fs.existsSync(customConfigPath)) {
    customConfig = JSON.parse(fs.readFileSync(customConfigPath, 'utf-8'));
  }
  compileCustomMSI(customConfig);
}

module.exports = { compileCustomMSI };
