// Pengambilan elemen DOM
const input = document.getElementById('command-input');
const outputContainer = document.getElementById('output-container');
const promptElement = document.getElementById('prompt');
const terminal = document.getElementById('terminal');
const inputLine = document.querySelector('.input-line');

// Konfigurasi User & State
const user = 'haku';
const hostname = 'geekpoi'; 
let currentDir = '~'; 

const history = [];
let historyIndex = -1;

// State untuk simulasi nano
let isEditing = false;
let currentFile = null;

// Simulated File System (Isi file virtual)
const fileSystem = {
    '~': {
        'whoami.txt': "This is a file about me. I am Haku, a JS learner and Linux enthusiast.",
        'help.txt': 'Type "help" to see all commands.',
        'notes.md': "# Project Notes\n- Use 'nano notes.md' to edit this file.\n- Use 'cat notes.md' to view its contents.",
    },
    '~/projects': {},
    '~/hacks': {}
};

// --- REPOSITORI PAKET & DAFTAR PROSES ---
const packageRepo = {
    'cmatrix': { installed: true, description: 'Simulates the falling green code effect.' },
    'htop': { installed: false, description: 'A monitoring system can as do,'},
    'fesbuk': { installed: false, description: 'A fesbuk can allow you to scrolling again lol.'},
    'neofetch': { installed: false, description: 'A fast, highly customizable system info script.' },
    'btop': { installed: false, description: 'Resource monitor that shows usage and stats.' },
    'hollywood': { installed: false, description: 'Fill your console with technobabble.' }
};

let processList = [
    { pid: 1, user: 'root', cpu: '0.1', mem: '0.2', cmd: 'systemd' },
    { pid: 2, user: 'root', cpu: '0.0', mem: '0.0', cmd: 'kthreadd' },
    { pid: 1337, user: 'haku', cpu: '5.8', mem: '15.4', cmd: 'waifu-renderer --high-poly' },
    { pid: 1400, user: 'haku', cpu: '2.3', mem: '8.1', cmd: 'chrome --no-sandbox' },
    { pid: 1450, user: 'root', cpu: '0.5', mem: '1.1', cmd: 'neko-daemon -v' },
    { pid: 1500, user: 'haku', cpu: '1.2', mem: '0.8', cmd: 'bash' }
];


// Data Manual Pages untuk perintah 'man'
const manPages = {
    help: "Shows a list of all available commands, divided into pages. Usage: help [page_number].",
    man: "An interface to the system reference manuals. Usage: man [command].",
    ds: "Dream Shell package manager (requires sudo). Usage: sudo ds [install|uninstall|purge] [package1] [package2]...",
    echo: "Display a line of text. Usage: echo [text to display].",
    whoami: "Displays information about the current user's identity and skills.",
    who: "Show who is logged on to the system (simulated).",
    projects: "Displays a list of the user's current fictional projects.",
    ls: "Lists contents of the current directory. Directories are colored green.",
    cd: "Change the current working directory. Usage: cd [dir] or cd ..",
    mkdir: "Make directories. Usage: mkdir [directory_name]. Only allowed in ~.",
    touch: "Change file timestamps (simulated: creates an empty file if it doesn't exist). Usage: touch [file_name].",
    rm: "Remove files or directories (non-recursively for directories). Usage: rm [file/dir].",
    sudo: "Execute a command as another user (simulated as superuser). Grants special permissions to some commands like 'rm'.",
    uname: "Print system information. Use 'uname -a' for all details.",
    nano: "Launches the fictional text editor to modify files. Use Ctrl+X to save and exit. Usage: nano [file].",
    cat: "Concatenate files and print on the standard output. Usage: cat [file_name].",
    ip: "Show / manipulate routing, devices, policy routing and tunnels (simulated: ip a).",
    ipa: "Alias for 'ip a'. Shows simulated network interface details.",
    ping: "Send ICMP ECHO_REQUEST packets to network hosts (simulated). Usage: ping [host] [count].",
    pg: "Alias for 'ping'.",
    'speedtest-cli': "Simulates internet bandwidth testing. Displays latency, download, and upload speeds.",
    stc: "Alias for 'speedtest-cli'.",
    wibufetch: "A custom Neofetch clone displaying absurdly cool, wibu-themed system specs.",
    wf: "Alias for 'wibufetch'.",
    plot: "Generates a random, absurd light novel plot idea.",
    fortune: "Displays a random, inspirational, or funny quote/message.",
    history: "Displays the command history list.",
    neko: "Displays a cute cat made of ASCII art.",
    cmatrix: "Simulates the falling green code effect from the movie The Matrix.",
    btop: "A resource monitor that shows usage and stats for processor, memory, and processes.",
    kill: "Terminate a running process by its PID. Usage: kill [PID]",
    'cpu-g': "Displays detailed fictional CPU information, similar to CPU-X.",
    'gpu-g': "Displays detailed fictional GPU information, similar to GPU-Z.",
    'mem-g': "Displays detailed fictional Memory (RAM) information.",
    'drive-g': "Displays detailed fictional storage drive information.",
    free: "Display amount of free and used memory in the system. Use 'free -h' for human-readable output.",
    date: "Prints the current date and time.",
    reboot: "Simulates a system reboot (reloads the terminal page).",
    clear: "Clears the terminal screen.",
    hack: "Simulates a dramatic, progress-bar-based network intrusion.",
};


// --- Fungsi Utilitas ---
function printOutput(message, isHTML = false) {
    const outputDiv = document.createElement('div');
    outputDiv.classList.add('output');
    if (isHTML) { outputDiv.innerHTML = message; } 
    else { outputDiv.textContent = message; }
    outputContainer.appendChild(outputDiv);
    terminal.scrollTop = terminal.scrollHeight;
}

function showPrompt() {
    promptElement.textContent = `${user}@${hostname}:${currentDir}$`;
}

function typeEffect(text, speed = 20) {
    let i = 0;
    const outputDiv = document.createElement('div');
    outputDiv.classList.add('output');
    outputContainer.appendChild(outputDiv);

    const cursor = document.createElement('span');
    cursor.textContent = '█';
    cursor.style.cssText = 'animation: blink 0.7s step-end infinite alternate; margin-left: 2px; display: inline-block;';
    
    function typing() {
        if (i < text.length) {
            cursor.insertAdjacentText('beforebegin', text.charAt(i));
            i++;
            terminal.scrollTop = terminal.scrollHeight;
            setTimeout(typing, speed);
        } else {
            cursor.remove();
        }
    }
    
    outputDiv.appendChild(cursor);
    typing();
}

function handleNanoExit(e) {
    if (e.key === 'x' && e.ctrlKey) { 
        e.preventDefault(); 
        const textarea = document.getElementById('nano-textarea');
        const editorContainer = document.getElementById('nano-editor');

        if (currentFile && fileSystem[currentDir]) {
            fileSystem[currentDir][currentFile] = textarea.value;
            printOutput(`[SUCCESS] File '${currentFile}' saved.`);
        } else {
            printOutput(`[ERROR] Failed to save file.`);
        }
        editorContainer.remove();
        inputLine.style.display = 'flex';
        isEditing = false;
        currentFile = null;
        input.focus();
        textarea.removeEventListener('keydown', handleNanoExit);
    }
}

// --- Daftar Perintah ---
const commands = {
    help: (page = '1') => {
        const helpPages = [
            `  --- Page 1/3: Core & File System ---
  help [page]    - Shows this help message
  man [cmd]      - Displays the manual page for a command
  ls             - Lists virtual files/directories
  cd [dir]       - Changes the virtual directory
  mkdir [dir]    - Creates a new directory
  touch [file]   - Creates a new empty file
  rm [file/dir]  - Removes a file or directory
  nano [file]    - Edits a virtual file
  cat [file]     - Displays the content of a file
  clear          - Clears the terminal screen`,
            `  --- Page 2/3: System & Network ---
  whoami         - Displays info about you
  who            - Shows who is logged on
  history        - Displays the command history
  uname          - Displays system info (-a for details)
  free           - Displays RAM usage (-h for Gigabytes)
  btop           - Shows an interactive resource monitor
  cpu-g          - Displays detailed CPU information
  gpu-g          - Displays detailed GPU information
  mem-g          - Displays detailed Memory information
  drive-g        - Displays detailed Storage Drive information
  kill [pid]     - Terminates a simulated process
  sudo [cmd]     - Executes a command as superuser
  ip a (ipa)     - Displays simulated IP address
  ping [target]  - Sends simulated packets to a host (pg)
  speedtest-cli  - Simulates an internet speed test (stc)
  reboot         - Reboots the terminal`,
            `  --- Page 3/3: Fun & Utilities ---
  wibufetch (wf) - Displays wibu-themed system info
  neko           - Displays a cat ASCII art
  fortune        - Displays a random fortune cookie quote
  plot           - Generates a random Light Novel plot
  echo [text]    - Displays text to the terminal
  cmatrix        - Displays 'The Matrix' effect
  date           - Displays the current date and time
  hack           - Simulates a hacking sequence`
        ];
        const pageIndex = parseInt(page) - 1;
        if (pageIndex >= 0 && pageIndex < helpPages.length) {
            let footer = `\nPage ${pageIndex + 1} of ${helpPages.length}. `;
            if (pageIndex < helpPages.length - 1) footer += `Type 'help ${pageIndex + 2}' for the next page.`;
            return helpPages[pageIndex] + footer;
        }
        return `Invalid help page. Please enter a number between 1 and ${helpPages.length}.`;
    },
    
    man: (commandName) => {
        if (!commandName) return "What manual page do you want? Usage: man [command]";
        const description = manPages[commandName];
        if (description) return `${commandName.toUpperCase()}(1)                                       HakuTerm Manual\n\nNAME\n    ${commandName} - ${description}`;
        return `No manual entry for ${commandName}`;
    },

    echo: (...args) => args.join(' '),
    who: () => `${user}     tty7         ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (:0)`,
    whoami: `User: ${user}\nStatus: Linux enthusiast, Web Developer in training.\nSkills: HTML, CSS, JavaScript, Java, Mikrotik Networking.`,
    history: () => history.map((cmd, index) => `  ${index + 1}  ${cmd}`).reverse().join('\n'),
    neko: () => `\n    _._     _,-'""\`-._\n   (,-.\`._,'(       |\\\`-/|\n       \`-.-' \\ )- \`( , o o)\n             \`-    \\\`_\`"'-`,
    projects: () => `Here are some projects currently in progress:\n- <b>SatuToko</b>: E-commerce project with a dark theme.\n- <b>Animora</b>: Anime Streaming project for fun.\n- <b>Haku Side</b>: Building a private Discord community.\n- <b>Web Terminal</b>: The terminal you are currently using.`,
    
    ls: () => {
        const items = [];
        if (currentDir === '~') {
            Object.keys(fileSystem).forEach(key => {
                if (key.startsWith('~/') && key !== '~') items.push(`<span style="color: #66ff66;">${key.substring(2)}/</span>`);
            });
        }
        for (const file in fileSystem[currentDir] || {}) { items.push(file); }
        return items.length === 0 ? '' : items.join('   ');
    },
    
    cd: (targetDir) => {
        if (!targetDir || ['~', '/'].includes(targetDir)) { currentDir = '~'; } 
        else if (currentDir === '~' && fileSystem[`~/${targetDir}`]) { currentDir = `~/${targetDir}`; } 
        else if (targetDir === '..') { if (currentDir.includes('/')) { currentDir = '~'; } } 
        else { return `bash: cd: ${targetDir}: No such file or directory`; }
        showPrompt();
        return '';
    },
    
    mkdir: (dirName) => {
        if (!dirName) return "Usage: mkdir [directory_name]";
        if (currentDir !== '~') return "Error: Can only create directories in home (~).";
        const newDirPath = `~/${dirName}`;
        if (fileSystem[newDirPath]) return `mkdir: cannot create directory ‘${dirName}’: File exists`;
        fileSystem[newDirPath] = {};
        return '';
    },
    
    touch: (fileName) => {
        if (!fileName) return "Usage: touch [file_name]";
        if (fileSystem[currentDir][fileName] === undefined) fileSystem[currentDir][fileName] = '';
        return '';
    },

    rm: (targetName) => {
        if (!targetName) return "Usage: rm [file_or_directory_name]";
        const dirPath = `~/${targetName}`;
        if (fileSystem[currentDir] && fileSystem[currentDir][targetName] !== undefined) {
            delete fileSystem[currentDir][targetName];
            return '';
        }
        if (currentDir === '~' && fileSystem[dirPath]) {
            if(Object.keys(fileSystem[dirPath]).length > 0) return `rm: cannot remove '${targetName}': Directory not empty`;
            delete fileSystem[dirPath];
            return '';
        }
        return `rm: cannot remove '${targetName}': No such file or directory`;
    },
    
    sudo: (...args) => {
        const commandToRun = args.shift();
        if (!commandToRun) return "usage: sudo <command>";
        printOutput(`[sudo] password for ${user}:`);
        
        if (commandToRun === 'ds') return commands.ds(...args);
        if (!commands[commandToRun]) return `sudo: ${commandToRun}: command not found`;

        if (commandToRun === 'rm') {
            const targetName = args[0];
            if (!targetName) return "Usage: rm [file_or_directory_name]";
            const dirPath = `~/${targetName}`;
            if (currentDir === '~' && fileSystem[dirPath]) {
                delete fileSystem[dirPath];
                return `[SUCCESS] Directory '${targetName}' forcefully removed.`;
            }
        }
        
        const result = commands[commandToRun];
        return typeof result === 'function' ? result(...args) : result;
    },

    ds: (action, ...pkgNames) => {
        if (!action || pkgNames.length === 0) return `Usage: sudo ds [install|uninstall|purge] [package1] [package2]...`;
        switch (action) {
            case 'install':
                if (pkgNames.length > 1) return `[ERROR] 'install' only supports one package at a time.`;
                const pkgName = pkgNames[0];
                const pkgToInstall = packageRepo[pkgName];
                if (!pkgToInstall) return `[ERROR] Package '${pkgName}' not found in repository.`;
                if (pkgToInstall.installed) return `[INFO] Package '${pkgName}' is already installed.`;
                printOutput(`[INFO] Fetching package details for '${pkgName}'...`);
                let progress = 0;
                const id = `install-${Date.now()}`;
                const progressLine = document.createElement('div');
                progressLine.id = id; progressLine.classList.add('output');
                outputContainer.appendChild(progressLine);
                const installInterval = setInterval(() => {
                    progress += 20;
                    const bar = '[' + '#'.repeat(progress / 10) + ' '.repeat(10 - (progress / 10)) + ']';
                    progressLine.textContent = `Installing ${pkgName} ${bar} ${progress}%`;
                    terminal.scrollTop = terminal.scrollHeight;
                    if (progress >= 100) {
                        clearInterval(installInterval);
                        progressLine.textContent = `Installing ${pkgName} ${bar} 100%`;
                        pkgToInstall.installed = true;
                        printOutput(`[SUCCESS] Successfully installed '${pkgName}'.`);
                    }
                }, 400);
                return ' ';
            case 'uninstall':
            case 'purge':
                printOutput(`[INFO] Reading package lists... Done`);
                const processNextPackage = (index) => {
                    if (index >= pkgNames.length) {
                        printOutput(`[SUCCESS] Operation completed.`);
                        return;
                    }
                    const currentPkgName = pkgNames[index];
                    const pkgToRemove = packageRepo[currentPkgName];
                    setTimeout(() => {
                        if (!pkgToRemove) printOutput(`[INFO] Package '${currentPkgName}' not found. Skipping.`);
                        else if (!pkgToRemove.installed) printOutput(`[INFO] Package '${currentPkgName}' is not installed. Skipping.`);
                        else {
                            pkgToRemove.installed = false;
                            printOutput(`[INFO] Removing ${currentPkgName}...`);
                            if (action === 'purge') printOutput(`[INFO] Purging configuration for ${currentPkgName}...`);
                        }
                        processNextPackage(index + 1);
                    }, 800);
                };
                processNextPackage(0);
                return ' ';
            default: return `[ERROR] Action '${action}' not recognized. Use install, uninstall, or purge.`;
        }
    },
    
    uname: (flag) => (flag === '-a') ? `Neko OS ${hostname} 17.8.45-moe-hardened x86_64 GNU/Linux` : 'Neko OS',
    cat: (fileName) => (!fileName) ? "Error: cat requires a filename." : (fileSystem[currentDir] || {})[fileName] ?? `cat: ${fileName}: No such file or directory`,

    nano: (fileName) => {
        if (!fileName) return "Error: nano requires a filename.";
        const content = (fileSystem[currentDir]?.[fileName]) || "";
        isEditing = true;
        currentFile = fileName;
        inputLine.style.display = 'none';
        const editorContainer = document.createElement('div');
        editorContainer.id = 'nano-editor';
        editorContainer.style.cssText = 'height:100vh;position:fixed;top:0;left:0;width:100%;z-index:100;padding:0;margin:0;background-color:var(--bg-dark);';
        editorContainer.innerHTML = `<div style="background:#333;color:#fff;padding:5px 10px;font-weight:bold;font-size:0.9rem;">[ GNU nano 5.4 | File: ${fileName} ]</div><textarea id="nano-textarea" style="width:100%;height:calc(100vh - 50px);background:var(--bg-dark);color:var(--neon-green);border:none;resize:none;font-family:inherit;font-size:1rem;outline:none;padding:10px;box-sizing:border-box;caret-color:var(--neon-green);">${content}</textarea><div style="background:#333;color:#fff;padding:5px 10px;font-size:0.8rem;position:fixed;bottom:0;width:100%;box-sizing:border-box;">^X Save & Exit</div>`;
        document.body.appendChild(editorContainer);
        const textarea = document.getElementById('nano-textarea');
        textarea.focus();
        textarea.addEventListener('keydown', handleNanoExit);
        return '';
    },
    
    ip: (subcommand) => (!['a', 'addr'].includes(subcommand)) ? `Usage: ip a` : `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000\n    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff\n    inet 192.168.1.10/24 brd 192.168.1.255 scope global dynamic eth0\n       valid_lft 86400sec preferred_lft 86400sec`,
    ipa: () => commands.ip('a'),
    
    ping: (target = '127.0.0.1', count = 4) => {
        if (!target) return "Usage: ping [host]";
        const maxPackets = Math.min(Math.max(1, parseInt(count)), 10);
        let sent = 0, received = 0, totalTime = 0, minTime = Infinity, maxTime = 0;
        printOutput(`PING ${target}: 56 data bytes`);
        const interval = setInterval(() => {
            if (sent >= maxPackets) {
                clearInterval(interval);
                const loss = ((sent - received) / sent) * 100;
                const avgTime = received > 0 ? (totalTime / received) : 0;
                printOutput(`--- ${target} ping statistics ---\n${sent} packets transmitted, ${received} received, ${loss.toFixed(0)}% packet loss\nround-trip min/avg/max = ${minTime.toFixed(3)}/${avgTime.toFixed(3)}/${maxTime.toFixed(3)} ms`);
                return;
            }
            sent++;
            if (Math.random() > 0.15) {
                const time = 5 + Math.random() * 80;
                received++; totalTime += time; minTime = Math.min(minTime, time); maxTime = Math.max(maxTime, time);
                printOutput(`64 bytes from ${target}: icmp_seq=${sent} ttl=115 time=${time.toFixed(3)} ms`);
            } else { printOutput(`Request timeout for icmp_seq ${sent}`); }
        }, 1200);
        return ' ';
    },
    pg: (target, count) => commands.ping(target, count),

    'speedtest-cli': () => {
        const id = `speedtest-${Date.now()}`;
        printOutput(`[INFO] Testing from GABUT SEJAHTERA, Inc. (192.168.1.1)...`);
        const outputLine = document.createElement('div');
        outputLine.id = id;
        outputLine.classList.add('output');
        outputContainer.appendChild(outputLine);
        terminal.scrollTop = terminal.scrollHeight;
        let step = 0;
        const values = { latency: 50 + Math.floor(Math.random() * 10), download: 25 + Math.random() * 50, upload: 15 + Math.random() * 20 };
        const interval = setInterval(() => {
            step++;
            const spinner = `<span class="spinner spinner-neon"></span>`;
            if (step === 1) outputLine.innerHTML = `${spinner} Testing Latency...`;
            else if (step === 2) outputLine.innerHTML = `${spinner} Testing Download...`;
            else if (step === 3) outputLine.innerHTML = `${spinner} Testing Upload...`;
            else {
                clearInterval(interval);
                if (document.getElementById(id)) document.getElementById(id).remove();
                printOutput(`--- Speedtest Complete ---\n[RESULT] Ping: ${values.latency} ms\n[RESULT] Download: ${values.download.toFixed(2)} Mbps\n[RESULT] Upload: ${values.upload.toFixed(2)} Mbps`, true);
                return;
            }
            terminal.scrollTop = terminal.scrollHeight;
        }, 1500);
        return ' ';
    },
    stc: () => commands['speedtest-cli'](),
    
    free: (flag) => {
        const totalMem = 206158430208, totalSwap = 68719476736;
        const usedMem = Math.floor(totalMem * (0.05 + Math.random() * 0.1)), freeMem = totalMem - usedMem;
        const usedSwap = Math.floor(totalSwap * Math.random() * 0.01), freeSwap = totalSwap - usedSwap;
        const formatHuman = (k) => (k >= 1073741824) ? `${(k/1073741824).toFixed(1)}Ti` : (k>=1048576) ? `${(k/1048576).toFixed(1)}Gi` : `${(k/1024).toFixed(1)}Mi`;
        const pad = (s, l) => s.toString().padStart(l, ' ');
        if (flag === '-h') return `              total        used        free\nMem:    ${pad(formatHuman(totalMem),10)} ${pad(formatHuman(usedMem),10)} ${pad(formatHuman(freeMem),10)}\nSwap:   ${pad(formatHuman(totalSwap),10)} ${pad(formatHuman(usedSwap),10)} ${pad(formatHuman(freeSwap),10)}`;
        return `              total        used        free\nMem:    ${pad(totalMem,15)} ${pad(usedMem,15)} ${pad(freeMem,15)}\nSwap:   ${pad(totalSwap,15)} ${pad(usedSwap,15)} ${pad(freeSwap,15)}`;
    },
    
    kill: (pid) => {
        const processId = parseInt(pid);
        if (isNaN(processId)) return "kill: usage: kill [pid]";
        if (processId <= 2) return `kill: (${processId}) - Operation not permitted`;
        const processIndex = processList.findIndex(p => p.pid === processId);
        if (processIndex > -1) {
            const processName = processList[processIndex].cmd.split(' ')[0];
            processList.splice(processIndex, 1);
            return `[SUCCESS] Terminated process ${processId} (${processName}).`;
        }
        return `kill: (${processId}) - No such process`;
    },

    'cpu-g': () => `
    --- HakuTerm CPU-G v1.0 ---
    
    Processor:
      Name:           Intel Core i9-99000K
      Codename:       Gabut Lake
      Specification:  Intel(R) Core(TM) i9-99000K CPU @ 12.00GHz
      Technology:     1nm SuperFin++
      Cores / Threads: 128 / 192 (Pure Gabut Cores)
    
    Clocks:
      Core Speed:     12000.00 MHz (OC)
      Multiplier:     x 120.0
      Bus Speed:      100.00 MHz
      Turbo Boost:    25.00 GHz
    
    Caches:
      L1 Data:        128 x 64 KiB
      L1 Inst.:       128 x 32 KiB
      L2 Cache:       128 x 2 MiB
      L3 Cache:       256 MiB
    
    Instruction Set:
      x86-64, MMX, SSE, SSE2, SSE3, SSSE3, SSE4.1, SSE4.2, AVX, AVX2, AVX512, FMA3, Moe-V Extensions, Quantum Hyper-Threading
    `,

    'gpu-g': () => `
    --- HakuTerm GPU-G v1.0 ---

    GPU 0:
      Name:           NVIDIA GeForce RTX 9000 Ti "Waifu Edition"
      Codename:       GK2077-UWU
      VRAM:           36 GB
      Memory Type:    GDDR7X (Quantum Entangled)
      Bus Width:      1024-bit
      Core Clock:     8000 MHz
      Memory Clock:   30.0 Gbps
      Features:       Real-Time Anime Upscaling, Holographic Waifu Projection, DLSS 5.0

    GPU 1:
      Name:           AMD Radeon RX 69240 XT "Perfected IT Edition"
      Codename:       Navi 69 XTXH
      VRAM:           192 GB
      Memory Type:    HBM3+
      Bus Width:      8192-bit
      Core Clock:     7500 MHz
      Memory Clock:   25.0 Gbps
      Features:       FidelityFX Super Duper Resolution, Anti-Isekai Ghosting, Ray Tracing Overdrive
    `,

    'mem-g': () => `
    --- HakuTerm MEM-G v1.0 ---

    General:
      Type:           DDR6
      Size:           192 TiB
      Channels:       Octa (8)
      Mode:           Quantum Entangled
    
    Timings:
      Frequency:      64000 MHz
      CAS# Latency:    10.0
      RAS# to CAS#:   12
      RAS# Precharge:  10
      Cycle Time:     20
      Command Rate:   1T

    DIMM 1 (48 TiB):
      Manufacturer:   Waifu Dynamics
      Part Number:    WD-ANIME-64000-CL10
      Voltage:        1.80 V
    DIMM 2 (48 TiB):
      Manufacturer:   Waifu Dynamics
      Part Number:    WD-ANIME-64000-CL10
      Voltage:        1.80 V
    DIMM 3 (48 TiB):
      Manufacturer:   Waifu Dynamics
      Part Number:    WD-ANIME-64000-CL10
      Voltage:        1.80 V
    DIMM 4 (48 TiB):
      Manufacturer:   Waifu Dynamics
      Part Number:    WD-ANIME-64000-CL10
      Voltage:        1.80 V
    `,
    
    // --- PERINTAH BARU: DRIVE-G ---
    'drive-g': () => `
    --- HakuTerm DRIVE-G v1.0 ---

    [DRIVE 0: Primary OS & Anime Vault]
      Type:           NVMe M.2 Gen7
      Model:          Waifu Dynamics WD-VAULT-P32
      Capacity:       32 Petabytes
      Read Speed:     150.0 GB/s
      Write Speed:    120.0 GB/s
      Usage:          Neko OS, /home, /waifu-collection

    [DRIVE 1: Game Library]
      Type:           SSHD (SATA 4.0)
      Model:          Seagate FireCuda Ultra-X
      Capacity:       256 Petabytes
      Cache:          8 TiB Optane-NAND
      Spindle Speed:  25000 RPM (Liquid Bearing)
      Usage:          /games, /isekai-simulations

    [DRIVE 2: Cold Storage Archive]
      Type:           HDD (SAS-X)
      Model:          Quantum Rift Archive QRA-1024
      Capacity:       1 Exabyte
      Spindle Speed:  7200 RPM (Helium Sealed)
      Usage:          /mnt/cold-storage, /backups
    `,

    btop: () => {
        isEditing = true;
        inputLine.style.display = 'none';
        const btopContainer = document.createElement('div');
        btopContainer.id = 'btop-container';
        btopContainer.style.cssText = 'height:100vh;width:100%;position:fixed;top:0;left:0;background:var(--bg-dark);z-index:1000;font-family:monospace;padding:1em;box-sizing:border-box;display:flex;flex-direction:column;gap:1em;';
        btopContainer.innerHTML = `<div id="btop-header" style="text-align:center;font-weight:bold;">HakuTerm Resource Monitor (btop) - Press 'q' to quit</div><div id="btop-cpu"></div><div id="btop-mem"></div><div id="btop-proc" style="flex-grow:1;overflow-y:auto;"></div>`;
        document.body.appendChild(btopContainer);
        const cpuEl = document.getElementById('btop-cpu'), memEl = document.getElementById('btop-mem'), procEl = document.getElementById('btop-proc');
        let btopInterval;
        const updateBtop = () => {
            const cpuUsage = 5 + Math.random() * 20;
            cpuEl.innerHTML = `CPU Usage: [${'█'.repeat(Math.ceil(cpuUsage / 4))}${' '.repeat(25 - Math.ceil(cpuUsage / 4))}] ${cpuUsage.toFixed(2)}%`;
            const totalMem = 192, usedMem = totalMem * (0.05 + Math.random() * 0.1);
            memEl.innerHTML = `MEM Usage: [${'█'.repeat(Math.ceil((usedMem / totalMem * 100) / 4))}${' '.repeat(25 - Math.ceil((usedMem / totalMem * 100) / 4))}] ${usedMem.toFixed(2)}/${totalMem} TiB`;
            let procHTML = '<pre>PID    USER   %CPU   %MEM   COMMAND\n';
            processList.forEach(p => {
                p.cpu = (parseFloat(p.cpu) + (Math.random() - 0.5) * 0.2).toFixed(1);
                if (p.cpu < 0) p.cpu = '0.1';
                procHTML += `${String(p.pid).padEnd(6)} ${p.user.padEnd(6)} ${String(p.cpu).padEnd(6)} ${String(p.mem).padEnd(6)} ${p.cmd}\n`;
            });
            procEl.innerHTML = procHTML + '</pre>';
        };
        btopInterval = setInterval(updateBtop, 1000);
        updateBtop();
        const exitBtop = (e) => {
            if (e.key === 'q') {
                e.preventDefault();
                clearInterval(btopInterval);
                document.body.removeChild(btopContainer);
                document.removeEventListener('keydown', exitBtop);
                isEditing = false;
                inputLine.style.display = 'flex';
                input.focus();
            }
        };
        document.addEventListener('keydown', exitBtop);
        return '';
    },

    wibufetch: () => `
      /\\_/\\         OS: Neko OS
     ( o.o )        Kernel: 17.8.45-moe-hardened
     > ^ <          Shell: Bash-senpai
     -----          DE: Moe Desktop Environment (Blah blah Fork)
                    Project: HakuTerm v1.0
                    
                    CPU: Intel Core i9-99000K (128 P-Cores of Pure Gabut)
                    GPU: NVIDIA GeForce RTX 9000 Ti "Waifu Edition" (36GB VRAM)
                    GPU1: AMD Radeon RX 69240 XT "Perfected IT Edition" (192GB VRAM)
                    RAM: 192TB DDR6 64000Mhz (ECC, Liquid-Cooled)
                    SSD: NVMe M.2 32 Petabytes (Anime Vault)
                    SSHD: SATA3 256 Petabytes (Collection Game)
                    HDD: SATA3 1 Exabytes (Cold Storage Archive)
                    Monitor: 8K OLED, 1000 Hz Refresh Rate (Used only for 60FPS anime)
                    Monitor: 12K OLED, 2400 Hz Refresh Rate (used only for linux whatever)
                    
                    Uptime: 420 Days 69 Hours (Since Last Anime Marathon)
`,
    wf: () => commands.wibufetch(),
    
    fortune: () => {
        const fortunes = ["Your luck today is as good as the WiFi connection at a con.", "Your future is as bright as the 12K OLED screen in wibufetch.", "Remember: boredom is the root of all the best innovations.", "Don't forget Ctrl+X. It's your key to freedom (and saving files).", "The best ninja way is the path filled with coffee and code."];
        return `\n${fortunes[Math.floor(Math.random() * fortunes.length)]}\n`;
    },
    
    cmatrix: () => {
        isEditing = true;
        inputLine.style.display = 'none';
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const alphabet = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 16, columns = canvas.width / fontSize;
        const rainDrops = Array.from({ length: Math.ceil(columns) }).fill(1);
        let matrixInterval;
        const drawMatrix = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#25D58F';
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < rainDrops.length; i++) {
                ctx.fillText(alphabet.charAt(Math.floor(Math.random() * alphabet.length)), i*fontSize, rainDrops[i]*fontSize);
                if (rainDrops[i]*fontSize > canvas.height && Math.random() > 0.975) rainDrops[i] = 0;
                rainDrops[i]++;
            }
        };
        matrixInterval = setInterval(drawMatrix, 33);
        const exitMatrix = (e) => {
            e.preventDefault();
            clearInterval(matrixInterval);
            document.body.removeChild(canvas);
            document.removeEventListener('keydown', exitMatrix);
            isEditing = false;
            inputLine.style.display = 'flex';
            input.focus();
            printOutput("\nMatrix simulation terminated.");
        };
        document.addEventListener('keydown', exitMatrix);
        return ' ';
    },

    plot: () => {
        const p=["A reincarnated programmer", "An ordinary high school student", "A former hitman"], s=["in a magical fantasy world", "in a cyberpunk city", "at a hero academy"], g=["who must defeat the demon lord", "who is caught in a global conspiracy", "who is searching for a legendary power"], t=["with a leveling system.", "but has lost their memory.", "accompanied by a mysterious AI."];
        const random = arr => arr[Math.floor(Math.random() * arr.length)];
        return `${random(p)} ${random(s)} ${random(g)} ${random(t)}`;
    },

    date: () => new Date().toLocaleString('en-US'),
    reboot: () => {
        printOutput(`<span class="spinner spinner-neon"></span> [INFO] Rebooting system...`, true);
        setTimeout(() => location.reload(), 2000);
        return ' ';
    },
    clear: () => { outputContainer.innerHTML = ''; return ''; },

    hack: (target = 'mainframe') => {
        printOutput(`[+] Initiating hack on ${target}...`);
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                clearInterval(interval);
                printOutput(`[SUCCESS] Access Granted. Welcome, ${user}.`);
            } else {
                printOutput(`[INFO] Bypassing firewall... ${progress.toFixed(2)}%`); 
            }
        }, 500);
        return ' ';
    }
};

// --- Fungsi Utama untuk Menangani Input ---
function handleCommand(commandText) {
    if (commandText === '') return;
    printOutput(`${promptElement.textContent} ${commandText}`);
    if (!commandText.startsWith('sudo')) history.unshift(commandText);
    historyIndex = -1;
    const [command, ...args] = commandText.split(' ');
    
    if (commands[command]) {
        const output = typeof commands[command] === 'function' ? commands[command](...args) : commands[command];
        if (output) printOutput(output, ['projects', 'ls', 'speedtest-cli', 'stc', 'reboot'].includes(command));
    } else {
        printOutput(`bash: command not found: ${command}`); 
    }
    input.value = '';
}

// --- Event Listener ---
input.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const parts = input.value.trimStart().split(' ');
        const toComplete = parts.pop() || "";
        let suggestions = [];
        if (parts.length === 0) {
            suggestions = Object.keys(commands).filter(cmd => cmd.startsWith(toComplete));
        } else {
            const itemsInDir = [...Object.keys(fileSystem[currentDir] || {})];
            if(currentDir === '~') {
                Object.keys(fileSystem).forEach(key => { if (key.startsWith('~/') && key !== '~') itemsInDir.push(key.substring(2)); });
            }
            suggestions = itemsInDir.filter(item => item.startsWith(toComplete));
        }
        if (suggestions.length === 1) input.value = `${parts.join(' ')} ${suggestions[0]} `;
    }
    else if (e.key === 'Enter') { e.preventDefault(); handleCommand(input.value.trim()); }
    else if (e.key === 'ArrowUp') { if (historyIndex < history.length - 1) input.value = history[++historyIndex]; } 
    else if (e.key === 'ArrowDown') { (historyIndex > 0) ? input.value = history[--historyIndex] : (historyIndex = -1, input.value = ''); }
});

document.addEventListener('click', () => { if (!isEditing) input.focus(); });

// --- Inisialisasi Terminal dengan PRELOADER ---
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 800);
        
        const terminalEl = document.getElementById('terminal');
        terminalEl.style.opacity = '1';

        showPrompt();
        input.focus();
        const welcomeMessage = `Welcome to HakuTerm v1.0.\nType 'help' to see available commands.\n\nDISCLAIMER: This terminal is a simulation created for educational and entertainment purposes only.`;
        typeEffect(welcomeMessage, 25);
    }, 2500); // Durasi preloader
});
