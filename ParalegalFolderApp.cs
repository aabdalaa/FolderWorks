using System;
using System.Diagnostics;
using System.IO;
using System.Security.AccessControl;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;

namespace ParalegalFolderApp
{
    /// <summary>
    /// Aplicativo Principal de Criação de Pastas Paralegal.
    /// Desenvolvido em C# com WPF (.NET Framework / .NET Core).
    /// 
    /// REQUISITOS & DESIGN SYSTEM (v2026.5):
    /// 1. Inicialização Automática em Tela Cheia (WindowState.Maximized).
    /// 2. Renderização Suave e Anti-Serrilhada (ClearType, SnapsToDevicePixels, UseLayoutRounding).
    /// 3. Botão Explícito "Sair / Encerrar" no Cabeçalho.
    /// 4. Log Único Reescrito por Execução em %APPDATA%\ParalegalSuite\paralegal_app.log.
    /// 5. Fluxo Contínuo Sem Travamentos (App permanece 100% aberto e pronto após cada criação).
    /// </summary>
    public class MainWindow : Window
    {
        #region Configurações de Servidores e Estruturas Embutidas
        private class CompanyConfig
        {
            public string Key { get; set; }
            public string Name { get; set; }
            public string FullDisplayName { get; set; }
            public string SourcePath { get; set; }
            public string DestinationParentPath { get; set; }
            public string[] EmbeddedFolders { get; set; }
        }

        // Opção 1: RTO CONSULTORIA EMPRESARIAL
        private readonly CompanyConfig ConfigRTO = new CompanyConfig
        {
            Key = "1",
            Name = "RTO",
            FullDisplayName = "RTO CONSULTORIA EMPRESARIAL",
            SourcePath = @"\\192.168.50.102\gpo\criarpastas_paralegal\MODELO 2026",
            DestinationParentPath = @"\\192.168.50.102\rto\CLIENTES\EMPRESAS",
            EmbeddedFolders = EmbeddedTemplates.RTO_FOLDERS
        };

        // Opção 2: RELIQUIA ASSESSORIA CONTÁBIL
        private readonly CompanyConfig ConfigReliquia = new CompanyConfig
        {
            Key = "2",
            Name = "RELIQUIA",
            FullDisplayName = "RELIQUIA ASSESSORIA CONTÁBIL",
            SourcePath = @"\\192.168.100.30\gpo\criarpastas_paralegal\MODELO 2026",
            DestinationParentPath = @"\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS",
            EmbeddedFolders = EmbeddedTemplates.RELIQUIA_FOLDERS
        };

        private CompanyConfig _selectedConfig = null;

        // Caminho do Log Único do Aplicativo (Substituído a cada execução)
        private static readonly string LogFilePath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "ParalegalSuite",
            "paralegal_app.log"
        );
        #endregion

        #region Componentes da Interface Gráfica (WPF UI Controls)
        private Border _cardRTO;
        private Border _cardReliquia;
        private TextBlock _radioRTO;
        private TextBlock _radioReliquia;

        private Border _bannerSelectedCompany;
        private TextBlock _lblSelectedCompanyText;

        private TextBox _txtClientName;
        private StackPanel _panelConfirmation;
        private TextBlock _lblConfirmEmpresa;
        private TextBlock _lblConfirmCliente;
        private TextBlock _lblConfirmOperacao;

        private ProgressBar _progressBar;
        private TextBlock _lblProgressStatus;
        private Button _btnCreateFolder;
        private Button _btnExitHeader;

        private Border _statusBadge;
        private TextBlock _lblStatusBadgeText;
        private ScrollViewer _logScrollViewer;
        private TextBlock _lblLogOutput;
        #endregion

        public MainWindow()
        {
            // Configurações de Tela Cheia e Anti-Serrilhamento de Altíssima Qualidade
            Title = "Paralegal Suite - Criador de Estrutura de Pastas 2026";
            WindowState = WindowState.Maximized; // Abre em Tela Cheia automaticamente
            WindowStartupLocation = WindowStartupLocation.CenterScreen;
            Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0B0716")); // Deep Violet Dark

            // Configurações de Renderização sem Serrilhados (Anti-Aliasing & Layout Rounding)
            UseLayoutRounding = true;
            SnapsToDevicePixels = true;
            RenderOptions.SetBitmapScalingMode(this, BitmapScalingMode.HighQuality);
            TextOptions.SetTextFormattingMode(this, TextFormattingMode.Display);
            TextOptions.SetTextRenderingMode(this, TextRenderingMode.ClearType);

            // Inicialização do Log Único
            InitializeSingleLogFile();

            // Evento para atalhos de teclado (1 para RTO, 2 para RELIQUIA, ESC para resetar)
            KeyDown += MainWindow_KeyDown;

            // Construção da UI Responsiva
            BuildUI();
        }

        #region Inicialização do Arquivo de Log Único
        private void InitializeSingleLogFile()
        {
            try
            {
                string dir = Path.GetDirectoryName(LogFilePath);
                if (!Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                // Cria ou substitui (sobrescreve) o arquivo de log a cada nova inicialização
                string initialText = string.Format("=========================================================\n LOG PARALEGAL SUITE - INICIALIZADO EM {0}\n=========================================================\n\n", DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss"));
                File.WriteAllText(LogFilePath, initialText);
            }
            catch { }
        }

        private void LogMessage(string msg)
        {
            string timeStamp = DateTime.Now.ToString("HH:mm:ss");
            string formattedMsg = string.Format("[{0}] {1}", timeStamp, msg);
            
            _lblLogOutput.Text = string.Format("[SISTEMA] {0}", formattedMsg);

            try
            {
                File.AppendAllText(LogFilePath, formattedMsg + "\n");
            }
            catch { }
        }
        #endregion

        #region Construção Visual da UI (Responsiva e Anti-Serrilhada)
        private void BuildUI()
        {
            Grid containerGrid = new Grid();
            containerGrid.Margin = new Thickness(24);

            // Limita a largura máxima para manter elegância visual em monitores UltraWide (4K)
            Border centerWrapper = new Border
            {
                MaxWidth = 1300,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Stretch
            };

            Grid mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto }); // Header
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) }); // Body Content
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto }); // Footer / Log

            // ==========================================
            // 1. CABEÇALHO (Header Bar com Botão Encerrar)
            // ==========================================
            Border headerBorder = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#150F28")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#291E47")),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(22, 16, 22, 16),
                Margin = new Thickness(0, 0, 0, 18)
            };

            Grid headerGrid = new Grid();
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            StackPanel titlePanel = new StackPanel();
            TextBlock titleText = new TextBlock
            {
                Text = "Criador de Pastas Paralegal",
                FontSize = 24,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White
            };
            TextBlock subtitleText = new TextBlock
            {
                Text = "Sistema de Automação de Estruturas de Clientes | RTO (1) & RELIQUIA (2)",
                FontSize = 13,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#948BB3")),
                Margin = new Thickness(0, 4, 0, 0)
            };
            titlePanel.Children.Add(titleText);
            titlePanel.Children.Add(subtitleText);

            // Painel de Ações do Cabeçalho (Badge + Botão Sair)
            StackPanel headerRightPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                VerticalAlignment = VerticalAlignment.Center
            };

            _statusBadge = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B1D76")),
                CornerRadius = new CornerRadius(20),
                Padding = new Thickness(14, 8, 14, 8),
                Margin = new Thickness(0, 0, 12, 0),
                VerticalAlignment = VerticalAlignment.Center
            };
            _lblStatusBadgeText = new TextBlock
            {
                Text = "v2026.5 • Automação Inteligente",
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#C4B5FD")),
                FontWeight = FontWeights.SemiBold,
                FontSize = 12
            };
            _statusBadge.Child = _lblStatusBadgeText;

            // Botão Explícito "Sair / Encerrar"
            _btnExitHeader = new Button
            {
                Height = 36,
                Padding = new Thickness(14, 0, 14, 0),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#450A0A")), // Dark Red
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#7F1D1D")),
                BorderThickness = new Thickness(1),
                Cursor = Cursors.Hand,
                VerticalAlignment = VerticalAlignment.Center
            };
            
            StackPanel exitBtnContent = new StackPanel { Orientation = Orientation.Horizontal, VerticalAlignment = VerticalAlignment.Center };
            TextBlock exitIcon = new TextBlock { Text = "🚪 ", FontSize = 13, VerticalAlignment = VerticalAlignment.Center };
            TextBlock exitText = new TextBlock { Text = "Encerrar", FontSize = 13, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FCA5A5")), VerticalAlignment = VerticalAlignment.Center };
            exitBtnContent.Children.Add(exitIcon);
            exitBtnContent.Children.Add(exitText);
            _btnExitHeader.Content = exitBtnContent;
            _btnExitHeader.Click += (s, e) => CloseApplication();

            headerRightPanel.Children.Add(_statusBadge);
            headerRightPanel.Children.Add(_btnExitHeader);

            Grid.SetColumn(titlePanel, 0);
            Grid.SetColumn(headerRightPanel, 1);
            headerGrid.Children.Add(titlePanel);
            headerGrid.Children.Add(headerRightPanel);
            headerBorder.Child = headerGrid;

            Grid.SetRow(headerBorder, 0);
            mainGrid.Children.Add(headerBorder);

            // ==========================================
            // 2. CORPO PRINCIPAL (Formulário Responsivo)
            // ==========================================
            ScrollViewer bodyScrollViewer = new ScrollViewer
            {
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled
            };

            StackPanel bodyPanel = new StackPanel();

            // --- PASSO 1: SELEÇÃO DA EMPRESA ---
            Border step1Card = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#150F28")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#291E47")),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(20),
                Margin = new Thickness(0, 0, 0, 16)
            };

            StackPanel step1Content = new StackPanel();

            Grid step1TitleGrid = new Grid();
            step1TitleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            step1TitleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            Border step1NumBadge = CreateStepNumberBadge("1");
            StackPanel step1TextPanel = new StackPanel { Margin = new Thickness(14, 0, 0, 0), VerticalAlignment = VerticalAlignment.Center };
            TextBlock step1Title = new TextBlock { Text = "Selecione a Empresa", FontSize = 17, FontWeight = FontWeights.Bold, Foreground = Brushes.White };
            TextBlock step1Sub = new TextBlock { Text = "Digite 1 ou 2, ou clique no card", FontSize = 13, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#948BB3")) };
            step1TextPanel.Children.Add(step1Title);
            step1TextPanel.Children.Add(step1Sub);

            Grid.SetColumn(step1NumBadge, 0);
            Grid.SetColumn(step1TextPanel, 1);
            step1TitleGrid.Children.Add(step1NumBadge);
            step1TitleGrid.Children.Add(step1TextPanel);
            step1Content.Children.Add(step1TitleGrid);

            // Grid Responsiva dos Cards RTO e RELIQUIA
            Grid cardsGrid = new Grid { Margin = new Thickness(0, 18, 0, 14) };
            cardsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            cardsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(16) }); // Spacer
            cardsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            _cardRTO = CreateCompanyCard("1", "RTO", "RTO Consultoria Empresarial", out _radioRTO);
            _cardReliquia = CreateCompanyCard("2", "RELIQUIA", "Reliquia Assessoria Contábil", out _radioReliquia);

            _cardRTO.MouseLeftButtonDown += (s, e) => SelectCompany(ConfigRTO);
            _cardReliquia.MouseLeftButtonDown += (s, e) => SelectCompany(ConfigReliquia);

            Grid.SetColumn(_cardRTO, 0);
            Grid.SetColumn(_cardReliquia, 2);
            cardsGrid.Children.Add(_cardRTO);
            cardsGrid.Children.Add(_cardReliquia);
            step1Content.Children.Add(cardsGrid);

            // Banner da Empresa Selecionada
            _bannerSelectedCompany = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#064E3B")), // Deep Emerald
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#059669")),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(16, 12, 16, 12),
                Visibility = Visibility.Collapsed
            };
            _lblSelectedCompanyText = new TextBlock
            {
                Text = "",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#A7F3D0"))
            };
            _bannerSelectedCompany.Child = _lblSelectedCompanyText;
            step1Content.Children.Add(_bannerSelectedCompany);

            step1Card.Child = step1Content;
            bodyPanel.Children.Add(step1Card);

            // --- PASSO 2: IDENTIFICAÇÃO DO CLIENTE & RESUMO ---
            Border step2Card = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#150F28")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#291E47")),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(20),
                Margin = new Thickness(0, 0, 0, 16)
            };

            StackPanel step2Content = new StackPanel();

            Grid step2TitleGrid = new Grid();
            step2TitleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            step2TitleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            Border step2NumBadge = CreateStepNumberBadge("2");
            StackPanel step2TextPanel = new StackPanel { Margin = new Thickness(14, 0, 0, 0), VerticalAlignment = VerticalAlignment.Center };
            TextBlock step2Title = new TextBlock { Text = "Digite a identificação do Cliente", FontSize = 17, FontWeight = FontWeights.Bold, Foreground = Brushes.White };
            TextBlock step2Sub = new TextBlock { Text = "Formato: CÓDIGO - NOME DO CLIENTE", FontSize = 13, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#948BB3")) };
            step2TextPanel.Children.Add(step2Title);
            step2TextPanel.Children.Add(step2Sub);

            Grid.SetColumn(step2NumBadge, 0);
            Grid.SetColumn(step2TextPanel, 1);
            step2TitleGrid.Children.Add(step2NumBadge);
            step2TitleGrid.Children.Add(step2TextPanel);
            step2Content.Children.Add(step2TitleGrid);

            // Campo de Texto do Cliente
            _txtClientName = new TextBox
            {
                Height = 48,
                FontSize = 16,
                Padding = new Thickness(16, 12, 16, 12),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1E1738")),
                Foreground = Brushes.White,
                CaretBrush = Brushes.White,
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B2C68")),
                BorderThickness = new Thickness(1.5),
                Margin = new Thickness(0, 16, 0, 6)
            };
            _txtClientName.TextChanged += TxtClientName_TextChanged;
            step2Content.Children.Add(_txtClientName);

            TextBlock txtClientHint = new TextBlock
            {
                Text = "Exemplo recomendado: 1042 - EMPRESA EXEMPLO LTDA",
                FontSize = 12,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#6B5F8A")),
                Margin = new Thickness(0, 0, 0, 18)
            };
            step2Content.Children.Add(txtClientHint);

            // Painel do Resumo da Operação
            _panelConfirmation = new StackPanel
            {
                Margin = new Thickness(0, 0, 0, 18),
                Visibility = Visibility.Collapsed
            };

            Border confirmCard = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1C153B")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#4F3B8C")),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(18)
            };

            StackPanel confirmContent = new StackPanel();
            TextBlock confirmTitle = new TextBlock
            {
                Text = "Resumo da Operação",
                FontSize = 15,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#C4B5FD")),
                Margin = new Thickness(0, 0, 0, 10)
            };

            _lblConfirmEmpresa = new TextBlock { FontSize = 14, Foreground = Brushes.White, Margin = new Thickness(0, 3, 0, 3) };
            _lblConfirmCliente = new TextBlock { FontSize = 14, Foreground = Brushes.White, Margin = new Thickness(0, 3, 0, 3) };
            _lblConfirmOperacao = new TextBlock { FontSize = 14, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#A7F3D0")), Margin = new Thickness(0, 3, 0, 3) };

            confirmContent.Children.Add(confirmTitle);
            confirmContent.Children.Add(_lblConfirmEmpresa);
            confirmContent.Children.Add(_lblConfirmCliente);
            confirmContent.Children.Add(_lblConfirmOperacao);
            confirmCard.Child = confirmContent;
            _panelConfirmation.Children.Add(confirmCard);
            step2Content.Children.Add(_panelConfirmation);

            // Barra de Progresso
            _progressBar = new ProgressBar
            {
                Height = 8,
                IsIndeterminate = false,
                Value = 0,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#7C3AED")),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#291E47")),
                Margin = new Thickness(0, 0, 0, 8),
                Visibility = Visibility.Collapsed
            };
            step2Content.Children.Add(_progressBar);

            _lblProgressStatus = new TextBlock
            {
                Text = "",
                FontSize = 13,
                FontWeight = FontWeights.SemiBold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#A78BFA")),
                Margin = new Thickness(0, 0, 0, 16),
                Visibility = Visibility.Collapsed
            };
            step2Content.Children.Add(_lblProgressStatus);

            // Botão Principal Fiel ao Mockup
            _btnCreateFolder = CreateStyledActionButton("Criar Pasta de Cliente", "#7C3AED", "#6D28D9", "#2D2354", "#A78BFA");
            _btnCreateFolder.IsEnabled = false;
            _btnCreateFolder.Click += BtnCreateFolder_Click;
            step2Content.Children.Add(_btnCreateFolder);

            step2Card.Child = step2Content;
            bodyPanel.Children.Add(step2Card);

            bodyScrollViewer.Content = bodyPanel;
            Grid.SetRow(bodyScrollViewer, 1);
            mainGrid.Children.Add(bodyScrollViewer);

            // ==========================================
            // 3. RODAPÉ E CONSOLE DE LOGS
            // ==========================================
            Border footerCard = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0A0714")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#21183B")),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(14)
            };

            Grid footerGrid = new Grid();
            footerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            footerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            StackPanel statusDotPanel = new StackPanel { Orientation = Orientation.Horizontal, VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(0, 0, 16, 0) };
            Border greenDot = new Border { Width = 10, Height = 10, CornerRadius = new CornerRadius(5), Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#10B981")), Margin = new Thickness(0, 0, 8, 0) };
            TextBlock statusLabel = new TextBlock { Text = "Status do Sistema", FontSize = 12, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#A78BFA")) };
            statusDotPanel.Children.Add(greenDot);
            statusDotPanel.Children.Add(statusLabel);

            _logScrollViewer = new ScrollViewer
            {
                Height = 45,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto
            };
            _lblLogOutput = new TextBlock
            {
                Text = "[SISTEMA] Aplicativo pronto. Pressione [1] para RTO ou [2] para RELIQUIA.",
                FontFamily = new FontFamily("Consolas, Courier New"),
                FontSize = 11,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#948BB3")),
                VerticalAlignment = VerticalAlignment.Center
            };
            _logScrollViewer.Content = _lblLogOutput;

            Grid.SetColumn(statusDotPanel, 0);
            Grid.SetColumn(_logScrollViewer, 1);
            footerGrid.Children.Add(statusDotPanel);
            footerGrid.Children.Add(_logScrollViewer);
            footerCard.Child = footerGrid;

            Grid.SetRow(footerCard, 2);
            mainGrid.Children.Add(footerCard);

            centerWrapper.Child = mainGrid;
            containerGrid.Children.Add(centerWrapper);
            Content = containerGrid;
        }

        // Criador do Badge de Número dos Passos (1 e 2)
        private Border CreateStepNumberBadge(string num)
        {
            Border badge = new Border
            {
                Width = 34,
                Height = 34,
                CornerRadius = new CornerRadius(8),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#5B21B6"))
            };
            TextBlock txt = new TextBlock
            {
                Text = num,
                FontSize = 17,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };
            badge.Child = txt;
            return badge;
        }

        // Criador dos Cards das Empresas (Com Radio Button visual)
        private Border CreateCompanyCard(string keyNum, string companyName, string companySubtitle, out TextBlock radioBlock)
        {
            Border card = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1E1738")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B2C68")),
                BorderThickness = new Thickness(2),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(18),
                Cursor = Cursors.Hand
            };

            Grid cardGrid = new Grid();
            cardGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            cardGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            cardGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // Radio Button visual (◯ ou ⦿)
            radioBlock = new TextBlock
            {
                Text = "◯",
                FontSize = 24,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#6B5F8A")),
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 14, 0)
            };

            // Badge com o Número (1 ou 2)
            Border numBadge = new Border
            {
                Width = 38,
                Height = 38,
                CornerRadius = new CornerRadius(8),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B2C68")),
                Margin = new Thickness(0, 0, 14, 0),
                VerticalAlignment = VerticalAlignment.Center
            };
            TextBlock numText = new TextBlock
            {
                Text = keyNum,
                FontSize = 19,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };
            numBadge.Child = numText;

            StackPanel infoPanel = new StackPanel { VerticalAlignment = VerticalAlignment.Center };
            TextBlock nameText = new TextBlock
            {
                Text = companyName,
                FontSize = 19,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White
            };
            TextBlock subText = new TextBlock
            {
                Text = companySubtitle,
                FontSize = 13,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#948BB3")),
                Margin = new Thickness(0, 2, 0, 0)
            };

            infoPanel.Children.Add(nameText);
            infoPanel.Children.Add(subText);

            Grid.SetColumn(radioBlock, 0);
            Grid.SetColumn(numBadge, 1);
            Grid.SetColumn(infoPanel, 2);

            cardGrid.Children.Add(radioBlock);
            cardGrid.Children.Add(numBadge);
            cardGrid.Children.Add(infoPanel);
            card.Child = cardGrid;

            return card;
        }

        // Criador do Botão Personalizado de Alta Legibilidade
        private Button CreateStyledActionButton(string text, string activeHex, string hoverHex, string disabledBgHex, string disabledFgHex)
        {
            Button btn = new Button
            {
                Height = 54,
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString(activeHex)),
                BorderThickness = new Thickness(0),
                Cursor = Cursors.Hand
            };

            StackPanel btnContentPanel = new StackPanel { Orientation = Orientation.Horizontal, HorizontalAlignment = HorizontalAlignment.Center };
            TextBlock iconFolder = new TextBlock { Text = "📁  ", FontSize = 17, VerticalAlignment = VerticalAlignment.Center };
            TextBlock txtLabel = new TextBlock { Text = text, VerticalAlignment = VerticalAlignment.Center };
            TextBlock iconArrow = new TextBlock { Text = "  ➔", FontSize = 15, VerticalAlignment = VerticalAlignment.Center };

            btnContentPanel.Children.Add(iconFolder);
            btnContentPanel.Children.Add(txtLabel);
            btnContentPanel.Children.Add(iconArrow);

            btn.Content = btnContentPanel;
            return btn;
        }
        #endregion

        #region Lógica de Eventos e Controle de Fluxo
        // Atalhos globais de teclado (1, 2 e ESC)
        private void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.D1 || e.Key == Key.NumPad1)
            {
                SelectCompany(ConfigRTO);
                LogMessage("Opção [1] selecionada via teclado: RTO");
            }
            else if (e.Key == Key.D2 || e.Key == Key.NumPad2)
            {
                SelectCompany(ConfigReliquia);
                LogMessage("Opção [2] selecionada via teclado: RELIQUIA");
            }
            else if (e.Key == Key.Escape)
            {
                ResetFormStateKeepAppOpen();
            }
        }

        private void CloseApplication()
        {
            LogMessage("Encerrando aplicativo via botão Sair...");
            Application.Current.Shutdown();
        }

        // Seleciona a Empresa (1 - RTO ou 2 - RELIQUIA) e atualiza o estado visual
        private void SelectCompany(CompanyConfig config)
        {
            _selectedConfig = config;

            if (config == ConfigRTO)
            {
                HighlightCard(_cardRTO, _radioRTO, true);
                HighlightCard(_cardReliquia, _radioReliquia, false);

                _bannerSelectedCompany.Visibility = Visibility.Visible;
                _lblSelectedCompanyText.Text = "✓ EMPRESA SELECIONADA: RTO CONSULTORIA EMPRESARIAL";
            }
            else if (config == ConfigReliquia)
            {
                HighlightCard(_cardRTO, _radioRTO, false);
                HighlightCard(_cardReliquia, _radioReliquia, true);

                _bannerSelectedCompany.Visibility = Visibility.Visible;
                _lblSelectedCompanyText.Text = "✓ EMPRESA SELECIONADA: RELIQUIA ASSESSORIA CONTÁBIL";
            }

            ValidateFormAndShowConfirmation();
        }

        private void HighlightCard(Border card, TextBlock radioBlock, bool isSelected)
        {
            if (isSelected)
            {
                card.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#261B4E"));
                card.BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#8B5CF6"));
                radioBlock.Text = "⦿";
                radioBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#C4B5FD"));
            }
            else
            {
                card.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1E1738"));
                card.BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#334155"));
                radioBlock.Text = "◯";
                radioBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#6B5F8A"));
            }
        }

        private void TxtClientName_TextChanged(object sender, TextChangedEventArgs e)
        {
            ValidateFormAndShowConfirmation();
        }

        // Valida as entradas do formulário e atualiza o card de resumo
        private void ValidateFormAndShowConfirmation()
        {
            string clientName = _txtClientName.Text.Trim();

            if (_selectedConfig != null && !string.IsNullOrWhiteSpace(clientName))
            {
                _lblConfirmEmpresa.Text = string.Format("• Empresa: {0}", _selectedConfig.FullDisplayName);
                _lblConfirmCliente.Text = string.Format("• Cliente / Pasta: {0}", clientName);
                _lblConfirmOperacao.Text = "• Ação: Criação da estrutura de pastas de atendimento";

                _panelConfirmation.Visibility = Visibility.Visible;
                
                // Ativa o botão com cor Violeta de alto contraste e legibilidade perfeita
                _btnCreateFolder.IsEnabled = true;
                _btnCreateFolder.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#7C3AED"));
                _btnCreateFolder.Foreground = Brushes.White;
            }
            else
            {
                _panelConfirmation.Visibility = Visibility.Collapsed;
                
                // Desativa o botão mantendo o texto visível e legível
                _btnCreateFolder.IsEnabled = false;
                _btnCreateFolder.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#2A1F45"));
                _btnCreateFolder.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#8C7CB8"));
            }
        }
        #endregion

        #region Processamento Assíncrono com Cópia Exata de Permissões NTFS (/SEC)
        private async void BtnCreateFolder_Click(object sender, RoutedEventArgs e)
        {
            if (_selectedConfig == null)
            {
                MessageBox.Show("Por favor, selecione a empresa (1 - RTO ou 2 - RELIQUIA).", "Aviso", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string clientName = _txtClientName.Text.Trim();
            if (string.IsNullOrWhiteSpace(clientName))
            {
                MessageBox.Show("Por favor, informe a identificação do Cliente (CODIGO - NOME).", "Aviso", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string finalPath = System.IO.Path.Combine(_selectedConfig.DestinationParentPath, clientName);

            // Bloqueia os controles durante a execução
            _btnCreateFolder.IsEnabled = false;
            _txtClientName.IsEnabled = false;
            _progressBar.Visibility = Visibility.Visible;
            _progressBar.IsIndeterminate = true;
            _lblProgressStatus.Visibility = Visibility.Visible;
            _lblProgressStatus.Text = "Iniciando criação da estrutura de atendimento...";
            _lblStatusBadgeText.Text = "Processando...";
            _statusBadge.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#D97706")); // Amber

            LogMessage(string.Format("[INÍCIO] Empresa: {0} | Cliente: {1}", _selectedConfig.Name, clientName));

            bool success = false;
            string errorMessage = "";

            await Task.Run(() =>
            {
                try
                {
                    // 1. Verifica se a pasta já existe
                    if (Directory.Exists(finalPath))
                    {
                        throw new Exception(string.Format("A pasta do cliente já existe no destino:\n{0}", finalPath));
                    }

                    // 2. Executa Robocopy /SEC do modelo oficial GPO
                    if (Directory.Exists(_selectedConfig.SourcePath))
                    {
                        string srcArg = _selectedConfig.SourcePath.TrimEnd('\\');
                        string destArg = finalPath.TrimEnd('\\');
                        
                        string robocopyArgs = string.Format("\"{0}\" \"{1}\" /E /SEC /Z /MT:16 /R:2 /W:3 /NFL /NDL /NJH /NJS", srcArg, destArg);

                        ProcessStartInfo psi = new ProcessStartInfo
                        {
                            FileName = "robocopy.exe",
                            Arguments = robocopyArgs,
                            UseShellExecute = false,
                            CreateNoWindow = true,
                            RedirectStandardOutput = true,
                            RedirectStandardError = true
                        };

                        using (Process proc = Process.Start(psi))
                        {
                            string stdout = proc.StandardOutput.ReadToEnd();
                            string stderr = proc.StandardError.ReadToEnd();
                            proc.WaitForExit();

                            if (proc.ExitCode < 8 && Directory.Exists(finalPath))
                            {
                                success = true;
                            }
                            else
                            {
                                throw new Exception(string.Format("Ocorreu uma falha ao criar as pastas (Código {0}).\nVerifique a conexão de rede.", proc.ExitCode));
                            }
                        }
                    }
                    else
                    {
                        // 3. Fallback Nativo C#
                        Directory.CreateDirectory(finalPath);
                        for (int i = 0; i < _selectedConfig.EmbeddedFolders.Length; i++)
                        {
                            string relFolder = _selectedConfig.EmbeddedFolders[i];
                            string fullPath = System.IO.Path.Combine(finalPath, relFolder);
                            if (!Directory.Exists(fullPath))
                            {
                                Directory.CreateDirectory(fullPath);
                            }
                        }

                        success = true;
                    }
                }
                catch (Exception ex)
                {
                    success = false;
                    errorMessage = ex.Message;
                }
            });

            // Atualização da UI pós-execução
            _progressBar.IsIndeterminate = false;
            _progressBar.Value = 100;

            if (success)
            {
                _lblProgressStatus.Text = string.Format("✓ ESTRUTURA CRIADA COM SUCESSO PARA: {0}", clientName);
                _lblProgressStatus.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#10B981")); // Emerald
                _lblStatusBadgeText.Text = "✓ Concluído com Sucesso";
                _statusBadge.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#065F46"));

                LogMessage(string.Format("[SUCESSO] Estrutura de pastas criada para {0} em {1}.", clientName, _selectedConfig.Name));

                MessageBox.Show(string.Format("Pasta criada com sucesso!\n\nCliente: {0}\nEmpresa: {1}", 
                    clientName, _selectedConfig.FullDisplayName), 
                    "Sucesso Paralegal", MessageBoxButton.OK, MessageBoxImage.Information);

                // Permanece 100% aberto e reseta automaticamente o formulário para a próxima criação
                ResetFormStateKeepAppOpen();
            }
            else
            {
                _lblProgressStatus.Text = string.Format("❌ ERRO NA CRIAÇÃO: {0}", errorMessage);
                _lblProgressStatus.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#EF4444")); // Red
                _lblStatusBadgeText.Text = "❌ Erro no Processo";
                _statusBadge.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#991B1B"));

                LogMessage(string.Format("[ERRO] {0}", errorMessage));

                MessageBox.Show(string.Format("Falha ao criar pasta:\n\n{0}", errorMessage), 
                    "Erro no Processo", MessageBoxButton.OK, MessageBoxImage.Error);

                _txtClientName.IsEnabled = true;
                _btnCreateFolder.IsEnabled = true;
            }
        }

        // Reseta o estado do formulário mantendo a aplicação 100% aberta e pronta
        private void ResetFormStateKeepAppOpen()
        {
            _txtClientName.Text = "";
            _txtClientName.IsEnabled = true;

            _progressBar.Visibility = Visibility.Collapsed;
            _progressBar.Value = 0;
            _lblProgressStatus.Visibility = Visibility.Collapsed;

            _btnCreateFolder.IsEnabled = false;
            _btnCreateFolder.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#2A1F45"));
            _btnCreateFolder.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#8C7CB8"));

            _lblStatusBadgeText.Text = "v2026.5 • Automação Inteligente";
            _statusBadge.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B1D76"));

            LogMessage("[PRONTO] Aplicativo pronto para a próxima criação de pasta.");
            _txtClientName.Focus();
        }
        #endregion

        #region Entry Point (Ponto de Entrada da Aplicação)
        [STAThread]
        public static void Main()
        {
            AppDomain.CurrentDomain.UnhandledException += (s, e) =>
            {
                MessageBox.Show(string.Format("Ocorreu um erro não tratado:\n{0}", e.ExceptionObject), "Erro de Sistema", MessageBoxButton.OK, MessageBoxImage.Error);
            };

            Application app = new Application();
            app.Run(new MainWindow());
        }
        #endregion
    }
}
