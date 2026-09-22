using System;
using System.IO;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Text;

namespace ExecuteAsUser {
    class Program {
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        public struct STARTUPINFO {
            public int cb;
            public string lpReserved;
            public string lpDesktop;
            public string lpTitle;
            public int dwX;
            public int dwY;
            public int dwXSize;
            public int dwYSize;
            public int dwXCountChars;
            public int dwYCountChars;
            public int dwFillAttribute;
            public int dwFlags;
            public short wShowWindow;
            public short cbReserved2;
            public IntPtr lpReserved2;
            public IntPtr hStdInput;
            public IntPtr hStdOutput;
            public IntPtr hStdError;
        }

        [StructLayout(LayoutKind.Sequential)]
        public struct PROCESS_INFORMATION {
            public IntPtr hProcess;
            public IntPtr hThread;
            public int dwProcessId;
            public int dwThreadId;
        }

        [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        public static extern bool CreateProcessWithLogonW(
            string userName,
            string domain,
            string password,
            int logonFlags,
            string applicationName,
            string commandLine,
            int creationFlags,
            IntPtr environment,
            string currentDirectory,
            ref STARTUPINFO startupInfo,
            out PROCESS_INFORMATION processInformation
        );

        [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        public static extern bool LogonUser(
            string lpszUsername,
            string lpszPDomain,
            string lpszPassword,
            int dwLogonType,
            int dwLogonProvider,
            out IntPtr phToken
        );

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool CloseHandle(IntPtr hObject);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern int WaitForSingleObject(IntPtr hHandle, int dwMilliseconds);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool GetExitCodeProcess(IntPtr hProcess, out int lpExitCode);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool TerminateProcess(IntPtr hProcess, uint uExitCode);

        const int LOGON_NETCREDENTIALS_ONLY = 2;
        const int CREATE_NO_WINDOW = 0x08000000;
        const int LOGON32_LOGON_NEW_CREDENTIALS = 9;
        const int LOGON32_PROVIDER_DEFAULT = 0;
        const int WAIT_TIMEOUT = 0x00000102;

        private static string ExtractServerName(string path) {
            if (string.IsNullOrEmpty(path)) return "";
            string clean = path.TrimStart('\\');
            int slashIdx = clean.IndexOf('\\');
            if (slashIdx > 0) return @"\\" + clean.Substring(0, slashIdx);
            return @"\\" + clean;
        }

        private static string EscapeJson(string s) {
            if (string.IsNullOrEmpty(s)) return "";
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "").Replace("\n", "");
        }

        private static int ListDirectories(string fullUser, string password, string targetPath) {
            targetPath = targetPath.TrimEnd('\\');
            if (!targetPath.StartsWith(@"\\")) targetPath = @"\\" + targetPath.TrimStart('\\');

            string domain = "";
            string userOnly = fullUser;
            if (fullUser.Contains("\\")) {
                string[] parts = fullUser.Split('\\');
                domain = parts[0];
                userOnly = parts[1];
            } else if (fullUser.Contains("@")) {
                string[] parts = fullUser.Split('@');
                userOnly = parts[0];
                domain = parts[1];
            }

            string server = ExtractServerName(targetPath);
            // ConnectServer not needed here as LogonUser with LOGON32_LOGON_NEW_CREDENTIALS handles network credentials

            IntPtr token = IntPtr.Zero;
            bool logonOk = LogonUser(userOnly, domain, password, LOGON32_LOGON_NEW_CREDENTIALS, LOGON32_PROVIDER_DEFAULT, out token);

            WindowsImpersonationContext ctx = null;
            if (logonOk) {
                try {
                    ctx = WindowsIdentity.Impersonate(token);
                } catch {}
            }

            try {
                if (!Directory.Exists(targetPath)) {
                    Console.WriteLine("{\"success\": false, \"error\": \"Diretório não encontrado no servidor\", \"folders\": []}");
                    return 1;
                }

                string[] subdirs = Directory.GetDirectories(targetPath);
                List<string> jsonItems = new List<string>();

                foreach (string d in subdirs) {
                    try {
                        DirectoryInfo di = new DirectoryInfo(d);
                        if ((di.Attributes & FileAttributes.Hidden) == FileAttributes.Hidden) {
                            continue;
                        }

                        Directory.GetFileSystemEntries(d);

                        string name = Path.GetFileName(d);
                        string mtime = "";
                        try {
                            mtime = Directory.GetLastWriteTime(d).ToString("dd/MM/yyyy");
                        } catch {}

                        jsonItems.Add("{\"name\":\"" + EscapeJson(name) + "\",\"fullPath\":\"" + EscapeJson(d) + "\",\"mtime\":\"" + EscapeJson(mtime) + "\"}");
                    } catch (UnauthorizedAccessException) {
                        // PERMISSÃO NEGADA PELO TI NO AD (Ex: _ATA de REUNIOES)!
                        // Oculta estritamente da tela!
                        continue;
                    } catch (Exception) {
                        continue;
                    }
                }

                Console.WriteLine("{\"success\": true, \"folders\": [" + String.Join(",", jsonItems.ToArray()) + "]}");
                return 0;
            } catch (Exception ex) {
                Console.WriteLine("{\"success\": false, \"error\": \"" + EscapeJson(ex.Message) + "\", \"folders\": []}");
                return 1;
            } finally {
                if (ctx != null) { ctx.Dispose(); }
                if (token != IntPtr.Zero) { CloseHandle(token); }
            }
        }

        private static void RemoveAttributesRecursive(string path) {
            try {
                if (File.Exists(path)) {
                    File.SetAttributes(path, FileAttributes.Normal);
                    return;
                }
                if (Directory.Exists(path)) {
                    DirectoryInfo di = new DirectoryInfo(path);
                    di.Attributes = FileAttributes.Normal;
                }
            } catch {}
        }

        private static int DeleteDirectory(string fullUser, string password, string targetPath) {
            targetPath = targetPath.TrimEnd('\\');
            if (!targetPath.StartsWith(@"\\")) targetPath = @"\\" + targetPath.TrimStart('\\');

            string domain = "";
            string userOnly = fullUser;
            if (fullUser.Contains("\\")) {
                string[] parts = fullUser.Split('\\');
                domain = parts[0];
                userOnly = parts[1];
            } else if (fullUser.Contains("@")) {
                string[] parts = fullUser.Split('@');
                userOnly = parts[0];
                domain = parts[1];
            }

            IntPtr token = IntPtr.Zero;
            bool logonOk = LogonUser(userOnly, domain, password, LOGON32_LOGON_NEW_CREDENTIALS, LOGON32_PROVIDER_DEFAULT, out token);
            WindowsImpersonationContext ctx = null;
            if (logonOk) {
                try { ctx = WindowsIdentity.Impersonate(token); } catch {}
            }

            try {
                // 1. Se a pasta já não existe fisicamente no servidor, retorna sucesso imediato em 0ms
                if (!Directory.Exists(targetPath) && !File.Exists(targetPath)) {
                    Console.WriteLine("{\"success\": true, \"message\": \"Pasta já não existe no servidor.\", \"deleted\": \"" + EscapeJson(targetPath) + "\"}");
                    return 0;
                }

                // 2. Exclusão direta e limpa via Robocopy /MIR a partir de pasta temporária vazia
                // Purga instantânea do conteúdo multithread sem criar pastas intermediárias .trash no compartilhamento
                string tempEmpty = @"C:\Windows\Temp\_fw_empty_purge";
                try {
                    if (!Directory.Exists(tempEmpty)) {
                        Directory.CreateDirectory(tempEmpty);
                    }
                } catch {
                    tempEmpty = Path.Combine(Path.GetTempPath(), "_fw_empty_purge");
                    if (!Directory.Exists(tempEmpty)) Directory.CreateDirectory(tempEmpty);
                }

                STARTUPINFO si = new STARTUPINFO();
                si.cb = Marshal.SizeOf(typeof(STARTUPINFO));
                PROCESS_INFORMATION pi = new PROCESS_INFORMATION();
                string appPath = @"C:\Windows\System32\robocopy.exe";
                string cmdLine = String.Format("\"{0}\" \"{1}\" \"{2}\" /MIR /MT:128 /IPG:0 /R:1 /W:1 /NFL /NDL /NJH /NJS /nc /ns /np", appPath, tempEmpty, targetPath);

                bool ok = CreateProcessWithLogonW(
                    userOnly, domain, password,
                    LOGON_NETCREDENTIALS_ONLY, null, cmdLine,
                    CREATE_NO_WINDOW, IntPtr.Zero, @"C:\Windows\System32",
                    ref si, out pi
                );

                if (ok) {
                    int waitRes = WaitForSingleObject(pi.hProcess, 60000);
                    if (waitRes == WAIT_TIMEOUT) {
                        try { TerminateProcess(pi.hProcess, 1); } catch {}
                    }
                    CloseHandle(pi.hProcess);
                    CloseHandle(pi.hThread);
                }

                // 3. Remover a pasta raiz vazia remanescente com Directory.Delete
                try {
                    if (Directory.Exists(targetPath)) Directory.Delete(targetPath, true);
                    else if (File.Exists(targetPath)) File.Delete(targetPath);
                } catch {}

                // 4. Se ainda persistir, executar rmdir /s /q sob o token autenticado
                bool purgeOk = !Directory.Exists(targetPath) && !File.Exists(targetPath);
                if (!purgeOk) {
                    try {
                        STARTUPINFO si2 = new STARTUPINFO();
                        si2.cb = Marshal.SizeOf(typeof(STARTUPINFO));
                        PROCESS_INFORMATION pi2 = new PROCESS_INFORMATION();
                        string cmdRmdir = String.Format("cmd.exe /c rmdir /s /q \"{0}\"", targetPath);
                        bool ok2 = CreateProcessWithLogonW(
                            userOnly, domain, password,
                            LOGON_NETCREDENTIALS_ONLY, null, cmdRmdir,
                            CREATE_NO_WINDOW, IntPtr.Zero, @"C:\Windows\System32",
                            ref si2, out pi2
                        );
                        if (ok2) {
                            int waitRmdir = WaitForSingleObject(pi2.hProcess, 15000);
                            if (waitRmdir == WAIT_TIMEOUT) {
                                try { TerminateProcess(pi2.hProcess, 1); } catch {}
                            }
                            CloseHandle(pi2.hProcess);
                            CloseHandle(pi2.hThread);
                        }
                    } catch {}
                }

                bool targetDeleted = !Directory.Exists(targetPath) && !File.Exists(targetPath);
                if (targetDeleted) {
                    Console.WriteLine("{\"success\": true, \"deleted\": \"" + EscapeJson(targetPath) + "\"}");
                    return 0;
                } else {
                    Console.WriteLine("{\"success\": false, \"error\": \"Não foi possível excluir a pasta '" + EscapeJson(targetPath) + "'. Verifique se há arquivos abertos em uso por outro usuário.\"}");
                    return 1;
                }
            } catch (Exception ex) {
                Console.WriteLine("{\"success\": false, \"error\": \"" + EscapeJson(ex.Message) + "\"}");
                return 1;
            } finally {
                if (ctx != null) { ctx.Dispose(); }
                if (token != IntPtr.Zero) { CloseHandle(token); }
            }
        }

        private static int MoveDirectory(string fullUser, string password, string srcPath, string destPath) {
            srcPath = srcPath.TrimEnd('\\');
            destPath = destPath.TrimEnd('\\');
            if (!srcPath.StartsWith(@"\\")) srcPath = @"\\" + srcPath.TrimStart('\\');
            if (!destPath.StartsWith(@"\\")) destPath = @"\\" + destPath.TrimStart('\\');

            string domain = "";
            string userOnly = fullUser;
            if (fullUser.Contains("\\")) {
                string[] parts = fullUser.Split('\\');
                domain = parts[0];
                userOnly = parts[1];
            } else if (fullUser.Contains("@")) {
                string[] parts = fullUser.Split('@');
                userOnly = parts[0];
                domain = parts[1];
            }

            IntPtr token = IntPtr.Zero;
            bool logonOk = LogonUser(userOnly, domain, password, LOGON32_LOGON_NEW_CREDENTIALS, LOGON32_PROVIDER_DEFAULT, out token);
            WindowsImpersonationContext ctx = null;
            if (logonOk) {
                try { ctx = WindowsIdentity.Impersonate(token); } catch {}
            }

            try {
                if (!Directory.Exists(srcPath)) {
                    Console.WriteLine("{\"success\": false, \"error\": \"Pasta de origem não encontrada no servidor: " + EscapeJson(srcPath) + "\"}");
                    return 1;
                }

                if (Directory.Exists(destPath)) {
                    Console.WriteLine("{\"success\": false, \"error\": \"Já existe uma pasta com o nome destino no servidor: " + EscapeJson(destPath) + "\"}");
                    return 1;
                }

                // Garantir que a pasta pai de destino exista
                string destParent = Path.GetDirectoryName(destPath);
                if (!string.IsNullOrEmpty(destParent) && !Directory.Exists(destParent)) {
                    try { Directory.CreateDirectory(destParent); } catch {}
                }

                // 1. Tentar movimentação atômica nativa MFT (1-2s para milhares de arquivos)
                bool moved = false;
                try {
                    Directory.Move(srcPath, destPath);
                    moved = Directory.Exists(destPath) && !Directory.Exists(srcPath);
                } catch {}

                if (!moved) {
                    try {
                        STARTUPINFO si = new STARTUPINFO();
                        si.cb = Marshal.SizeOf(typeof(STARTUPINFO));
                        PROCESS_INFORMATION pi = new PROCESS_INFORMATION();
                        string cmdLine = String.Format("cmd.exe /c move \"{0}\" \"{1}\"", srcPath, destPath);
                        bool ok = CreateProcessWithLogonW(
                            userOnly, domain, password,
                            LOGON_NETCREDENTIALS_ONLY, null, cmdLine,
                            CREATE_NO_WINDOW, IntPtr.Zero, @"C:\Windows\System32",
                            ref si, out pi
                        );
                        if (ok) {
                            WaitForSingleObject(pi.hProcess, 30000);
                            CloseHandle(pi.hProcess);
                            CloseHandle(pi.hThread);
                        }
                    } catch {}
                    moved = Directory.Exists(destPath) && !Directory.Exists(srcPath);
                }

                // 2. Se a movimentação atômica falhou (ex: volumes ou servidores distintos), acionar Robocopy /MT:128
                if (!moved) {
                    STARTUPINFO siRobo = new STARTUPINFO();
                    siRobo.cb = Marshal.SizeOf(typeof(STARTUPINFO));
                    PROCESS_INFORMATION piRobo = new PROCESS_INFORMATION();
                    string appPath = @"C:\Windows\System32\robocopy.exe";
                    string cmdRobo = String.Format("\"{0}\" \"{1}\" \"{2}\" /E /COPY:DATS /DCOPY:DAT /MT:128 /IPG:0 /R:0 /W:0 /NFL /NDL /NJH /NJS /nc /ns /np", appPath, srcPath, destPath);
                    bool okRobo = CreateProcessWithLogonW(
                        userOnly, domain, password,
                        LOGON_NETCREDENTIALS_ONLY, null, cmdRobo,
                        CREATE_NO_WINDOW, IntPtr.Zero, @"C:\Windows\System32",
                        ref siRobo, out piRobo
                    );
                    int exitCode = 16;
                    if (okRobo) {
                        WaitForSingleObject(piRobo.hProcess, 180000);
                        GetExitCodeProcess(piRobo.hProcess, out exitCode);
                        CloseHandle(piRobo.hProcess);
                        CloseHandle(piRobo.hThread);
                    }
                    if (exitCode < 8 && Directory.Exists(destPath)) {
                        Console.WriteLine("{\"success\": true, \"sourcePath\": \"" + EscapeJson(srcPath) + "\", \"destPath\": \"" + EscapeJson(destPath) + "\", \"method\": \"robocopy\"}");
                        return 0;
                    } else {
                        Console.WriteLine("{\"success\": false, \"error\": \"Não foi possível mover a pasta no servidor. Verifique permissões ou arquivos abertos.\"}");
                        return 1;
                    }
                }

                Console.WriteLine("{\"success\": true, \"sourcePath\": \"" + EscapeJson(srcPath) + "\", \"destPath\": \"" + EscapeJson(destPath) + "\", \"method\": \"atomic_move\"}");
                return 0;
            } catch (Exception ex) {
                Console.WriteLine("{\"success\": false, \"error\": \"" + EscapeJson(ex.Message) + "\"}");
                return 1;
            } finally {
                if (ctx != null) { ctx.Dispose(); }
                if (token != IntPtr.Zero) { CloseHandle(token); }
            }
        }

        private static int RenameDirectory(string fullUser, string password, string oldPath, string newPath) {
            oldPath = oldPath.TrimEnd('\\');
            newPath = newPath.TrimEnd('\\');
            if (!oldPath.StartsWith(@"\\")) oldPath = @"\\" + oldPath.TrimStart('\\');
            if (!newPath.StartsWith(@"\\")) newPath = @"\\" + newPath.TrimStart('\\');

            string domain = "";
            string userOnly = fullUser;
            if (fullUser.Contains("\\")) {
                string[] parts = fullUser.Split('\\');
                domain = parts[0];
                userOnly = parts[1];
            } else if (fullUser.Contains("@")) {
                string[] parts = fullUser.Split('@');
                userOnly = parts[0];
                domain = parts[1];
            }

            IntPtr token = IntPtr.Zero;
            bool logonOk = LogonUser(userOnly, domain, password, LOGON32_LOGON_NEW_CREDENTIALS, LOGON32_PROVIDER_DEFAULT, out token);
            WindowsImpersonationContext ctx = null;
            if (logonOk) {
                try { ctx = WindowsIdentity.Impersonate(token); } catch {}
            }

            try {
                if (!Directory.Exists(oldPath)) {
                    Console.WriteLine("{\"success\": false, \"error\": \"Pasta de origem não encontrada no servidor: " + EscapeJson(oldPath) + "\"}");
                    return 1;
                }

                if (Directory.Exists(newPath)) {
                    Console.WriteLine("{\"success\": false, \"error\": \"Já existe uma pasta com o nome destino no servidor: " + EscapeJson(newPath) + "\"}");
                    return 1;
                }

                bool renamed = false;
                try {
                    Directory.Move(oldPath, newPath);
                    renamed = Directory.Exists(newPath);
                } catch {}

                if (!renamed) {
                    try {
                        STARTUPINFO si = new STARTUPINFO();
                        si.cb = Marshal.SizeOf(typeof(STARTUPINFO));
                        PROCESS_INFORMATION pi = new PROCESS_INFORMATION();
                        string cmdLine = String.Format("cmd.exe /c move \"{0}\" \"{1}\"", oldPath, newPath);
                        bool ok = CreateProcessWithLogonW(
                            userOnly, domain, password,
                            LOGON_NETCREDENTIALS_ONLY, null, cmdLine,
                            CREATE_NO_WINDOW, IntPtr.Zero, @"C:\Windows\System32",
                            ref si, out pi
                        );
                        if (ok) {
                            WaitForSingleObject(pi.hProcess, 30000);
                            CloseHandle(pi.hProcess);
                            CloseHandle(pi.hThread);
                        }
                    } catch {}
                    renamed = Directory.Exists(newPath);
                }

                if (renamed) {
                    Console.WriteLine("{\"success\": true, \"oldPath\": \"" + EscapeJson(oldPath) + "\", \"newPath\": \"" + EscapeJson(newPath) + "\"}");
                    return 0;
                } else {
                    Console.WriteLine("{\"success\": false, \"error\": \"Não foi possível renomear a pasta no servidor. Verifique permissões ou se há arquivos em uso.\"}");
                    return 1;
                }
            } catch (Exception ex) {
                Console.WriteLine("{\"success\": false, \"error\": \"" + EscapeJson(ex.Message) + "\"}");
                return 1;
            } finally {
                if (ctx != null) { ctx.Dispose(); }
                if (token != IntPtr.Zero) { CloseHandle(token); }
            }
        }

        static int Main(string[] args) {
            try {
                Console.OutputEncoding = new UTF8Encoding(false);
                Console.InputEncoding = new UTF8Encoding(false);
            } catch {}

            if (args == null || args.Length < 4) {
                Console.WriteLine(@"Usage: ExecuteAsUser.exe <--list | --delete | --rename | --move | Domain\User> <Password> <Source> <TargetPath>");
                return 16;
            }

            if (args[0] == "--list") {
                return ListDirectories(args[1], args[2], args[3]);
            }

            if (args[0] == "--delete") {
                return DeleteDirectory(args[1], args[2], args[3]);
            }

            if (args[0] == "--move") {
                if (args.Length < 5) {
                    Console.WriteLine("{\"success\": false, \"error\": \"Argumentos insuficientes para --move. Esperado: --move <User> <Password> <Source> <Destination>\"}");
                    return 16;
                }
                return MoveDirectory(args[1], args[2], args[3], args[4]);
            }

            if (args[0] == "--rename") {
                if (args.Length < 5) {
                    Console.WriteLine("{\"success\": false, \"error\": \"Argumentos insuficientes para --rename. Esperado: --rename <User> <Password> <OldPath> <NewPath>\"}");
                    return 16;
                }
                return RenameDirectory(args[1], args[2], args[3], args[4]);
            }

            string fullUser = args[0];
            string password = args[1];
            string src = args[2].TrimEnd('\\');
            string dest = args[3].TrimEnd('\\');

            if (!src.StartsWith(@"\\")) src = @"\\" + src.TrimStart('\\');
            if (!dest.StartsWith(@"\\")) dest = @"\\" + dest.TrimStart('\\');

            string domain = "";
            string userOnly = fullUser;
            if (fullUser.Contains("\\")) {
                string[] parts = fullUser.Split('\\');
                domain = parts[0];
                userOnly = parts[1];
            } else if (fullUser.Contains("@")) {
                string[] parts = fullUser.Split('@');
                userOnly = parts[0];
                domain = parts[1];
            }

            Console.WriteLine(String.Format("[IMPERSONAÇÃO WIN32] Disparando Robocopy sob o token nativo de '{0}\\{1}' via CreateProcessWithLogonW...", domain, userOnly));
            Console.WriteLine(String.Format("[IMPERSONACAO WIN32] Disparando Robocopy sob o token nativo de '{0}\\{1}' via CreateProcessWithLogonW...", domain, userOnly));

            STARTUPINFO si = new STARTUPINFO();
            si.cb = Marshal.SizeOf(typeof(STARTUPINFO));
            PROCESS_INFORMATION pi = new PROCESS_INFORMATION();

            string appPath = @"C:\Windows\System32\robocopy.exe";
            string cmdLine = String.Format("\"{0}\" \"{1}\" \"{2}\" /E /COPY:DATS /DCOPY:DAT /MT:128 /IPG:0 /R:0 /W:0 /NFL /NDL /NJH /NJS /nc /ns /np", appPath, src, dest);

            bool ok = CreateProcessWithLogonW(
                userOnly,
                domain,
                password,
                LOGON_NETCREDENTIALS_ONLY,
                null,
                cmdLine,
                CREATE_NO_WINDOW,
                IntPtr.Zero,
                @"C:\Windows\System32",
                ref si,
                out pi
            );

            int exitCode = 16;
            if (ok) {
                WaitForSingleObject(pi.hProcess, 180000);
                GetExitCodeProcess(pi.hProcess, out exitCode);
                CloseHandle(pi.hProcess);
                CloseHandle(pi.hThread);
                Console.WriteLine(String.Format("[EXECUTOR ROBOCOPY] Transmissão finalizada sob o token do usuário com código Robocopy: {0}", exitCode));
                Console.WriteLine(String.Format("[EXECUTOR ROBOCOPY] Transmissao finalizada sob o token do usuario com codigo Robocopy: {0}", exitCode));
            } else {
                int win32Err = Marshal.GetLastWin32Error();
                Console.WriteLine(String.Format("[ERRO IMPERSONAÇÃO] Falha ao criar processo como '{0}\\{1}': Win32 Error {2}", domain, userOnly, win32Err));
                Console.WriteLine(String.Format("[ERRO IMPERSONACAO] Falha ao criar processo como '{0}\\{1}': Win32 Error {2}", domain, userOnly, win32Err));
                return 16;
            }

            if (exitCode < 8) {
                return 0;
            } else {
                return exitCode;
            }
        }
    }
}