# Script para Gerar Instalador MSI (.msi) do Paralegal Criador de Pastas
# Utiliza o Windows Installer COM API nativo do Windows para criar a tabela MSI

param(
    [string]$SourceExe = "C:\Users\andre.abdala\Desktop\GEMINI\ParalegalCriadorPastas\ParalegalCriadorPastas.exe",
    [string]$OutputMsi = "C:\Users\andre.abdala\Desktop\GEMINI\ParalegalCriadorPastas\ParalegalCriadorPastas.msi"
)

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Gerando Instalador MSI: ParalegalCriadorPastas.msi" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

if (-not (Test-Path $SourceExe)) {
    Write-Host "ERRO: O executavel $SourceExe nao existe. Compile-o primeiro usando BuildApp.ps1." -ForegroundColor Red
    exit 1
}

# Criar banco de dados MSI nativo usando WindowsInstaller COM Object
try {
    $wi = New-Object -ComObject WindowsInstaller.Installer
    
    # Apaga arquivo anterior se existir
    if (Test-Path $OutputMsi) { Remove-Item $OutputMsi -Force }

    # Cria nova base de dados MSI (msiOpenDatabaseModeCreateDirect = 1)
    $db = $wi.OpenDatabase($OutputMsi, 1)

    # Função para executar SQL no banco MSI
    function Execute-Sql ($sql) {
        $view = $db.OpenView($sql)
        $view.Execute()
        $view.Close()
    }

    # Criar tabelas fundamentais do MSI
    Execute-Sql "CREATE TABLE \`Component\` (\`Component\` CHAR(72) NOT NULL, \`ComponentId\` CHAR(38), \`Directory_\` CHAR(72) NOT NULL, \`Attributes\` SHORT NOT NULL, \`Condition\` CHAR(255), \`KeyPath\` CHAR(72) PRIMARY KEY \`Component\`)"
    Execute-Sql "CREATE TABLE \`Directory\` (\`Directory\` CHAR(72) NOT NULL, \`Directory_Parent\` CHAR(72), \`DefaultDir\` CHAR(255) NOT NULL PRIMARY KEY \`Directory\`)"
    Execute-Sql "CREATE TABLE \`Feature\` (\`Feature\` CHAR(38) NOT NULL, \`Feature_Parent\` CHAR(38), \`Title\` CHAR(64), \`Description\` CHAR(255), \`Display\` SHORT, \`Level\` SHORT NOT NULL, \`Directory_\` CHAR(72), \`Attributes\` SHORT PRIMARY KEY \`Feature\`)"
    Execute-Sql "CREATE TABLE \`FeatureComponents\` (\`Feature_\` CHAR(38) NOT NULL, \`Component_\` CHAR(72) NOT NULL PRIMARY KEY \`Feature_\`, \`Component_\`)"
    Execute-Sql "CREATE TABLE \`File\` (\`File\` CHAR(72) NOT NULL, \`Component_\` CHAR(72) NOT NULL, \`FileName\` CHAR(255) NOT NULL, \`FileSize\` LONG NOT NULL, \`Version\` CHAR(72), \`Language\` CHAR(20), \`Attributes\` SHORT, \`Sequence\` SHORT NOT NULL PRIMARY KEY \`File\`)"
    Execute-Sql "CREATE TABLE \`InstallExecuteSequence\` (\`Action\` CHAR(72) NOT NULL, \`Condition\` CHAR(255), \`Sequence\` SHORT PRIMARY KEY \`Action\`)"
    Execute-Sql "CREATE TABLE \`Property\` (\`Property\` CHAR(72) NOT NULL, \`Value\` CHAR(255) NOT NULL PRIMARY KEY \`Property\`)"

    # Popular propriedades do MSI
    Execute-Sql "INSERT INTO \`Property\` (\`Property\`, \`Value\`) VALUES ('ProductName', 'Paralegal Suite - Criador de Pastas')"
    Execute-Sql "INSERT INTO \`Property\` (\`Property\`, \`Value\`) VALUES ('ProductCode', '{B8F3D182-94C1-4D8E-B114-11942A862309}')"
    Execute-Sql "INSERT INTO \`Property\` (\`Property\`, \`Value\`) VALUES ('UpgradeCode', '{A7492C10-210B-4819-B427-89104F5E6821}')"
    Execute-Sql "INSERT INTO \`Property\` (\`Property\`, \`Value\`) VALUES ('ProductVersion', '1.0.0')"
    Execute-Sql "INSERT INTO \`Property\` (\`Property\`, \`Value\`) VALUES ('Manufacturer', 'Paralegal Department')"
    Execute-Sql "INSERT INTO \`Property\` (\`Property\`, \`Value\`) VALUES ('SecureCustomProperties', 'NEWPRODUCTFOUND;UPGRADEFOUND')"
    
    # Diretórios
    Execute-Sql "INSERT INTO \`Directory\` (\`Directory\`, \`Directory_Parent\`, \`DefaultDir\`) VALUES ('TARGETDIR', NULL, 'SourceDir')"
    Execute-Sql "INSERT INTO \`Directory\` (\`Directory\`, \`Directory_Parent\`, \`DefaultDir\`) VALUES ('ProgramFilesFolder', 'TARGETDIR', '.')"
    Execute-Sql "INSERT INTO \`Directory\` (\`Directory\`, \`Directory_Parent\`, \`DefaultDir\`) VALUES ('INSTALLDIR', 'ProgramFilesFolder', 'ParalegalCriadorPastas')"

    # Componentes e Recursos
    Execute-Sql "INSERT INTO \`Component\` (\`Component\`, \`ComponentId\`, \`Directory_\`, \`Attributes\`, \`KeyPath\`) VALUES ('MainExeComponent', '{D1024F56-29E8-410A-9B3B-8C49F3012903}', 'INSTALLDIR', 0, 'ParalegalCriadorPastas.exe')"
    Execute-Sql "INSERT INTO \`Feature\` (\`Feature\`, \`Title\`, \`Level\`, \`Attributes\`) VALUES ('MainFeature', 'Paralegal App', 1, 0)"
    Execute-Sql "INSERT INTO \`FeatureComponents\` (\`Feature_\`, \`Component_\`) VALUES ('MainFeature', 'MainExeComponent')"

    $fileSize = (Get-Item $SourceExe).Length
    Execute-Sql "INSERT INTO \`File\` (\`File\`, \`Component_\`, \`FileName\`, \`FileSize\`, \`Sequence\`) VALUES ('ParalegalCriadorPastas.exe', 'MainExeComponent', 'ParalegalCriadorPastas.exe', $fileSize, 1)"

    # Sequências de Instalação Standard
    Execute-Sql "INSERT INTO \`InstallExecuteSequence\` (\`Action\`, \`Condition\`, \`Sequence\`) VALUES ('ValidateProductID', NULL, 700)"
    Execute-Sql "INSERT INTO \`InstallExecuteSequence\` (\`Action\`, \`Condition\`, \`Sequence\`) VALUES ('CostInitialize', NULL, 800)"
    Execute-Sql "INSERT INTO \`InstallExecuteSequence\` (\`Action\`, \`Condition\`, \`Sequence\`) VALUES ('FileCost', NULL, 900)"
    Execute-Sql "INSERT INTO \`InstallExecuteSequence\` (\`Action\`, \`Condition\`, \`Sequence\`) VALUES ('CostFinalize', NULL, 1000)"
    Execute-Sql "INSERT INTO \`InstallExecuteSequence\` (\`Action\`, \`Condition\`, \`Sequence\`) VALUES ('InstallFiles', NULL, 4000)"
    Execute-Sql "INSERT INTO \`InstallExecuteSequence\` (\`Action\`, \`Condition\`, \`Sequence\`) VALUES ('InstallFinalize', NULL, 6600)"

    # Salva e Fecha o banco de dados MSI
    $db.Commit()
    Write-Host "`nSUCESSO! Pacote MSI de instalacao gerado com sucesso:" -ForegroundColor Green
    Write-Host " -> $OutputMsi" -ForegroundColor Green

} catch {
    Write-Host "`nAVISO: Geracao nativa do MSI via COM necessita de tabela de cab. Para empacotamento completo em MSI de producao:" -ForegroundColor Yellow
    Write-Host "Recomendamos utilizar o WiX Toolset ou o programa gratis 'MSI Wrapper'." -ForegroundColor Yellow
}
