# Script de Compilação Automatizada do Aplicativo Paralegal Criador de Pastas (Autossuficiente)
# Compila os arquivos C# (EmbeddedTemplates.cs e ParalegalFolderApp.cs) em um executável nativo Windows (.exe)

$cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$tmplFile = "C:\Users\andre.abdala\Desktop\GEMINI\ParalegalCriadorPastas\EmbeddedTemplates.cs"
$mainFile = "C:\Users\andre.abdala\Desktop\GEMINI\ParalegalCriadorPastas\ParalegalFolderApp.cs"
$outputExe = "C:\Users\andre.abdala\Desktop\GEMINI\ParalegalCriadorPastas\ParalegalCriadorPastas.exe"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Compilando ParalegalCriadorPastas em C# WPF (Autossuficiente)" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

if (-not (Test-Path $cscPath)) {
    Write-Host "ERRO: Compilador csc.exe nao encontrado em $cscPath" -ForegroundColor Red
    exit 1
}

# Finalizar qualquer processo ativo antes da compilação
Get-Process ParalegalCriadorPastas -ErrorAction SilentlyContinue | Stop-Process -Force

$wpfDir = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF"
$fxDir = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319"

$references = @(
    "`"$wpfDir\PresentationFramework.dll`"",
    "`"$wpfDir\PresentationCore.dll`"",
    "`"$wpfDir\WindowsBase.dll`"",
    "`"$fxDir\System.Xaml.dll`"",
    "`"$fxDir\System.dll`"",
    "`"$fxDir\System.Core.dll`""
) -join ","

$args = @(
    "/target:winexe",
    "/optimize+",
    "/out:`"$outputExe`"",
    "/r:$references",
    "`"$tmplFile`"",
    "`"$mainFile`""
)

Write-Host "Executando compilador C#..." -ForegroundColor Yellow
$process = Start-Process -FilePath $cscPath -ArgumentList $args -Wait -NoNewWindow -PassThru

if ($process.ExitCode -eq 0 -and (Test-Path $outputExe)) {
    Write-Host "`nSUCESSO! Executavel autossuficiente gerado em:" -ForegroundColor Green
    Write-Host " -> $outputExe" -ForegroundColor Green
} else {
    Write-Host "`nERRO NA COMPILAÇÃO. Codigo de saida: $($process.ExitCode)" -ForegroundColor Red
    exit 1
}
