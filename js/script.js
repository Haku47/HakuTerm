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

// --- REPOSITORI PAKET BARU ---
const packageRepo = {
    'cmatrix': { installed: true, description: 'Simulates the falling green code effect.' },
    'neofetch': { installed: false, description: 'A fast, highly customizable system info script.' },
    'btop': { installed: false, description: 'Resource monitor that shows usage and stats.' },
    'hollywood': { installed: false, description: 'Fill your console with technobabble.' }
};

// Data Manual Pages untuk perintah 'man'
const manPages = {
    help: "Shows a list of all available commands, divided into pages. Usage: help [page_number].",
    man: "An interface to the system reference manuals. Usage: man [command].",
    ds: "Dream Shell package manager (requires sudo). Usage: sudo ds [install|uninstall|purge] [package].",
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
            // Page 1: Core & File System
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

            // Page 2: System & Network
            `  --- Page 2/3: System & Network ---
  whoami         - Displays info about you
  who            - Shows who is logged on
  history        - Displays the command history
  uname          - Displays system info (-a for details)
  free           - Displays RAM usage (-h for Gigabytes)
  sudo [cmd]     - Executes a command as superuser
  ip a (ipa)     - Displays simulated IP address
  ping [target]  - Sends simulated packets to a host (pg)
  speedtest-cli  - Simulates an internet speed test (stc)
  reboot         - Reboots the terminal`,

            // Page 3: Fun & Utilities
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
            if (pageIndex < helpPages.length - 1) {
                footer += `Type 'help ${pageIndex + 2}' for the next page.`;
            }
            return helpPages[pageIndex] + footer;
        } else {
            return `Invalid help page. Please enter a number between 1 and ${helpPages.length}.`;
        }
    },
    
    man: (commandName) => {
        if (!commandName) return "What manual page do you want? Usage: man [command]";
        const description = manPages[commandName];
        if (description) {
            return `${commandName.toUpperCase()}(1)                                       HakuTerm Manual\n\nNAME\n    ${commandName} - ${description}`;
        }
        return `No manual entry for ${commandName}`;
    },

    echo: (...args) => args.join(' '),
    
    who: () => {
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `${user}     tty7         ${time} (:0)`;
    },

    whoami: `User: ${user}\nStatus: Linux enthusiast, Web Developer in training.\nSkills: HTML, CSS, JavaScript, Java, Mikrotik Networking.`,
    
    history: () => {
        return history.map((cmd, index) => `  ${index + 1}  ${cmd}`).reverse().join('\n');
    },
    
    neko: () => `\n    _._     _,-'""\`-._\n   (,-.\`._,'(       |\\\`-/|\n       \`-.-' \\ )- \`( , o o)\n             \`-    \\\`_\`"'-`,

    projects: () => `Here are some projects currently in progress:\n- <b>SatuToko</b>: E-commerce project with a dark theme.\n- <b>Animora</b>: Anime Streaming project for fun.\n- <b>Haku Side</b>: Building a private Discord community.\n- <b>Web Terminal</b>: The terminal you are currently using.`,
    
    ls: () => {
        const currentFiles = fileSystem[currentDir] || {};
        const items = [];
        if (currentDir === '~') {
            Object.keys(fileSystem).forEach(key => {
                if (key.startsWith('~/') && key !== '~') items.push(`<span style="color: #66ff66;">${key.substring(2)}/</span>`);
            });
        }
        for (const file in currentFiles) { items.push(file); }
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
        const currentFiles = fileSystem[currentDir];
        const dirPath = `~/${targetName}`;

        if (currentFiles && currentFiles[targetName] !== undefined) {
            delete currentFiles[targetName];
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
        
        // --- LOGIKA BARU: Package Manager 'ds' ---
        if (commandToRun === 'ds') {
            return commands.ds(...args);
        }
        // ------------------------------------

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

    // --- PERINTAH BARU: DREAM SHELL (ds) Package Manager ---
    ds: (action, pkgName) => {
        if (!action || !pkgName) {
            return `Usage: sudo ds [install|uninstall|purge] [package_name]`;
        }
    
        const pkg = packageRepo[pkgName];
    
        switch (action) {
            case 'install':
                if (!pkg) return `[ERROR] Package '${pkgName}' not found in repository.`;
                if (pkg.installed) return `[INFO] Package '${pkgName}' is already installed.`;
                
                printOutput(`[INFO] Fetching package details for '${pkgName}'...`);
                let progress = 0;
                const id = `install-${Date.now()}`;
                const progressLine = document.createElement('div');
                progressLine.id = id;
                progressLine.classList.add('output');
                outputContainer.appendChild(progressLine);
    
                const interval = setInterval(() => {
                    progress += 20;
                    const bar = '[' + '#'.repeat(progress / 10) + ' '.repeat(10 - (progress / 10)) + ']';
                    progressLine.textContent = `Installing ${pkgName} ${bar} ${progress}%`;
                    terminal.scrollTop = terminal.scrollHeight;
    
                    if (progress >= 100) {
                        clearInterval(interval);
                        progressLine.textContent = `Installing ${pkgName} ${bar} 100%`;
                        pkg.installed = true;
                        printOutput(`[SUCCESS] Successfully installed '${pkgName}'.`);
                    }
                }, 400);
    
                return ' ';
    
            case 'uninstall':
            case 'purge':
                if (!pkg) return `[ERROR] Package '${pkgName}' not found.`;
                if (!pkg.installed) return `[INFO] Package '${pkgName}' is not installed.`;
                
                printOutput(`[INFO] Removing package '${pkgName}'...`);
                setTimeout(() => {
                    pkg.installed = false;
                    if (action === 'purge') {
                        printOutput(`[INFO] Purging configuration files for '${pkgName}'...`);
                    }
                    setTimeout(() => {
                        printOutput(`[SUCCESS] Successfully removed '${pkgName}'.`);
                    }, 800);
                }, 1000);
                
                return ' ';
    
            default:
                return `[ERROR] Action '${action}' not recognized. Use install, uninstall, or purge.`;
        }
    },
    
    uname: (flag) => {
        if (flag === '-a') {
            return `Neko OS ${hostname} 17.8.45-moe-hardened x86_64 GNU/Linux`;
        }
        return 'Neko OS';
    },

    cat: (fileName) => {
        if (!fileName) { return "Error: cat requires a filename."; }
        const currentFiles = fileSystem[currentDir] || {};
        return currentFiles[fileName] !== undefined ? currentFiles[fileName] : `cat: ${fileName}: No such file or directory`;
    },

    nano: (fileName) => {
        if (!fileName) { return "Error: nano requires a filename."; }
        const content = (fileSystem[currentDir] && fileSystem[currentDir][fileName]) || "";
        isEditing = true;
        currentFile = fileName;
        inputLine.style.display = 'none';
        const editorContainer = document.createElement('div');
        editorContainer.id = 'nano-editor';
        editorContainer.style.cssText = 'height:100vh;position:fixed;top:0;left:0;width:100%;z-index:100;padding:0;margin:0;background-color:var(--bg-dark);';
        editorContainer.innerHTML = `
            <div style="background:#333;color:#fff;padding:5px 10px;font-weight:bold;font-size:0.9rem;">[ GNU nano 5.4 | File: ${fileName} ]</div>
            <textarea id="nano-textarea" style="width:100%;height:calc(100vh - 50px);background:var(--bg-dark);color:var(--neon-green);border:none;resize:none;font-family:inherit;font-size:1rem;outline:none;padding:10px;box-sizing:border-box;caret-color:var(--neon-green);">${content}</textarea>
            <div style="background:#333;color:#fff;padding:5px 10px;font-size:0.8rem;position:fixed;bottom:0;width:100%;box-sizing:border-box;">^X Save & Exit</div>`;
        document.body.appendChild(editorContainer);
        const textarea = document.getElementById('nano-textarea');
        textarea.focus();
        textarea.addEventListener('keydown', handleNanoExit);
        return '';
    },
    
    ip: (subcommand) => {
        if (!['a', 'addr'].includes(subcommand)) return `Usage: ip a`;
        return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000\n    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff\n    inet 192.168.1.10/24 brd 192.168.1.255 scope global dynamic eth0\n       valid_lft 86400sec preferred_lft 86400sec`;
    },
    ipa: () => commands.ip('a'),
    
    ping: (target = '127.0.0.1', count = 4) => {
        if (!target) return "Usage: ping [host]";
        const maxPackets = Math.min(Math.max(1, parseInt(count)), 10);
        let packetsSent = 0, packetsReceived = 0, totalTime = 0, minTime = Infinity, maxTime = 0;
        printOutput(`PING ${target}: 56 data bytes`);
        const interval = setInterval(() => {
            if (packetsSent >= maxPackets) {
                clearInterval(interval);
                const loss = ((maxPackets - packetsReceived) / maxPackets) * 100;
                const avgTime = packetsReceived > 0 ? (totalTime / packetsReceived) : 0;
                printOutput(`--- ${target} ping statistics ---\n${maxPackets} packets transmitted, ${packetsReceived} received, ${loss.toFixed(0)}% packet loss\nround-trip min/avg/max = ${minTime.toFixed(3)}/${avgTime.toFixed(3)}/${maxTime.toFixed(3)} ms`);
                return;
            }
            packetsSent++;
            if (Math.random() > 0.15) {
                const time = 5 + Math.random() * 80;
                packetsReceived++; totalTime += time; minTime = Math.min(minTime, time); maxTime = Math.max(maxTime, time);
                printOutput(`64 bytes from ${target}: icmp_seq=${packetsSent} ttl=115 time=${time.toFixed(3)} ms`);
            } else { printOutput(`Request timeout for icmp_seq ${packetsSent}`); }
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
            let text = '';
            const spinner = `<span class="spinner spinner-neon"></span>`;
            if (step === 1) text = `${spinner} Testing Latency...`;
            else if (step === 2) text = `${spinner} Testing Download...`;
            else if (step === 3) text = `${spinner} Testing Upload...`;
            else {
                clearInterval(interval);
                if (document.getElementById(id)) document.getElementById(id).remove();
                printOutput(`--- Speedtest Complete ---\n[RESULT] Ping: ${values.latency} ms\n[RESULT] Download: ${values.download.toFixed(2)} Mbps\n[RESULT] Upload: ${values.upload.toFixed(2)} Mbps`, true);
                return;
            }
            outputLine.innerHTML = text;
            terminal.scrollTop = terminal.scrollHeight;
        }, 1500);
        return ' ';
    },
    stc: () => commands['speedtest-cli'](),
    
    free: (flag) => {
        const totalMem = 206158430208;
        const totalSwap = 68719476736;
        const usedMem = Math.floor(totalMem * (0.05 + Math.random() * 0.1));
        const freeMem = totalMem - usedMem;
        const usedSwap = Math.floor(totalSwap * Math.random() * 0.01);
        const freeSwap = totalSwap - usedSwap;
        
        const formatHuman = (kib) => {
            if (kib >= 1024 * 1024 * 1024) return `${(kib / (1024 * 1024 * 1024)).toFixed(1)}Ti`;
            if (kib >= 1024 * 1024) return `${(kib / (1024 * 1024)).toFixed(1)}Gi`;
            if (kib >= 1024) return `${(kib / 1024).toFixed(1)}Mi`;
            return `${kib}Ki`;
        };
        const pad = (str, len) => str.toString().padStart(len, ' ');

        if (flag === '-h') {
            return `              total        used        free
Mem:    ${pad(formatHuman(totalMem), 10)} ${pad(formatHuman(usedMem), 10)} ${pad(formatHuman(freeMem), 10)}
Swap:   ${pad(formatHuman(totalSwap), 10)} ${pad(formatHuman(usedSwap), 10)} ${pad(formatHuman(freeSwap), 10)}`;
        }
        
        return `              total        used        free
Mem:    ${pad(totalMem, 15)} ${pad(usedMem, 15)} ${pad(freeMem, 15)}
Swap:   ${pad(totalSwap, 15)} ${pad(usedSwap, 15)} ${pad(freeSwap, 15)}`;
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
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const rainDrops = Array.from({ length: Math.ceil(columns) }).fill(1);
        let matrixInterval;
        const drawMatrix = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#25D58F';
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) rainDrops[i] = 0;
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
        const p = ["A reincarnated programmer", "An ordinary high school student", "A former hitman"], 
              s = ["in a magical fantasy world", "in a cyberpunk city", "at a hero academy"], 
              g = ["who must defeat the demon lord", "who is caught in a global conspiracy", "who is searching for a legendary power"], 
              t = ["with a leveling system.", "but has lost their memory.", "accompanied by a mysterious AI."];
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
    if (!commandText.startsWith('sudo')) {
      history.unshift(commandText);
    }
    historyIndex = -1;
    const [command, ...args] = commandText.split(' ');
    
    if (commands[command]) {
        const result = commands[command];
        const output = typeof result === 'function' ? result(...args) : result;
        if (output) {
            printOutput(output, ['projects', 'ls', 'speedtest-cli', 'stc', 'reboot', 'fortune'].includes(command));
        }
    } else {
        printOutput(`bash: command not found: ${command}`); 
    }
    input.value = '';
}

// --- Event Listener ---
input.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const currentInput = input.value.trimStart();
        const parts = currentInput.split(' ');
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
    else if (e.key === 'Enter') {
        e.preventDefault();
        handleCommand(input.value.trim());
    } else if (e.key === 'ArrowUp') {
        if (historyIndex < history.length - 1) input.value = history[++historyIndex];
    } else if (e.key === 'ArrowDown') {
        if (historyIndex > 0) input.value = history[--historyIndex];
        else { historyIndex = -1; input.value = ''; }
    }
});

document.addEventListener('click', () => { if (!isEditing) input.focus(); });

// --- Inisialisasi Terminal dengan PRELOADER ---
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 800);
        
        const terminalEl = document.getElementById('terminal');
        terminalEl.style.opacity = '1';

        showPrompt();
        input.focus();
        const welcomeMessage = `Welcome to HakuTerm v1.0.\nType 'help' to see available commands.\n\nDISCLAIMER: This terminal is a simulation created for educational and entertainment purposes only.`;
        typeEffect(welcomeMessage, 25);
    }, 2500); // Durasi preloader
});
