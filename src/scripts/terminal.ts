import { PROMPT, HEADER, BANNER, ABOUT } from '../lib/terminal-content.ts';

export interface TermProject {
  slug: string;
  title: string;
  subtitle: string;
  tags?: string[];
  source?: string;
  live?: string;
}

export interface TerminalConfig {
  projects: TermProject[];
  socials: { name: string; href: string }[];
  onOpenProject: (slug: string) => void;
  onOpenApp: (app: string) => void;
  onExit: () => void;
}

export interface TerminalHandle {
  reset: () => void;
  ensureBooted: () => void;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const OUT_CPS = 900;
const CMD_CPS = 14;

export function initTerminal(cfg: TerminalConfig): TerminalHandle | undefined {
  const output = document.getElementById('terminalOutput');
  const input = document.getElementById('terminalInput') as HTMLInputElement | null;
  const promptEl = document.getElementById('terminalPrompt');
  const inputRow = document.querySelector<HTMLElement>('.terminal-input-row');
  const termEl = document.getElementById('terminal');
  if (!output || !input || !promptEl || !inputRow || !termEl) return;

  promptEl.textContent = PROMPT;

  const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let gen = 0;
  let chain: Promise<void> = Promise.resolve();
  const q = (fn: () => Promise<void> | void) => {
    const g = gen;
    chain = chain.then(() => (g === gen ? fn() : undefined));
  };

  const scroll = () => { termEl.scrollTop = termEl.scrollHeight; };

  const newLine = (cls = '') => {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    output.appendChild(div);
    scroll();
    return div;
  };

  const typeInto = (div: HTMLElement, text: string, cps: number, prefix = '') =>
    new Promise<void>((res) => {
      const done = () => {
        div.textContent = prefix + text;
        if (!div.textContent) div.innerHTML = '&nbsp;';
        scroll();
        res();
      };
      if (reducedMotion() || cps <= 0 || !text) return done();
      const g = gen;
      const perFrame = Math.max(1, Math.round(cps / 60));
      let i = 0;
      const tick = () => {
        if (g !== gen) return res();
        i = Math.min(text.length, i + perFrame);
        div.textContent = prefix + text.slice(0, i);
        scroll();
        if (i < text.length) {
          cps >= 60 ? requestAnimationFrame(tick) : setTimeout(tick, 1000 / cps);
        } else res();
      };
      div.textContent = prefix;
      tick();
    });

  const printBlock = (text: string, cls = '') =>
    q(async () => {
      const g = gen;
      for (const line of text.split('\n')) {
        if (g !== gen) return;
        await typeInto(newLine(cls), line, OUT_CPS);
      }
    });

  const printHtml = (html: string, cls = '') =>
    q(() => {
      const div = newLine(cls);
      div.innerHTML = html === '' ? '&nbsp;' : html;
      scroll();
    });

  const blank = () => printHtml('');
  const echoCommand = (raw: string) => printHtml(esc(PROMPT + raw));
  const notRecognized = (cmd: string) =>
    printBlock(`'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`);

  const pad = (name: string) => name.padEnd(14);

  const cmdHelp = () =>
    printBlock(
      [
        'For more information on a specific command, ask kalam.',
        '',
        `${pad('ABOUT')}Displays information about kalam.`,
        `${pad('EXPERIENCE')}Displays employment history, newest first.`,
        `${pad('PROJECTS')}Lists projects. START <name> opens one.`,
        `${pad('SKILLS')}Displays the skill tree.`,
        `${pad('INTERESTS')}Displays what kalam does when not at a keyboard.`,
        `${pad('CONTACT')}Displays ways to reach kalam.`,
        `${pad('START')}Starts a project, window, or URL.`,
        `${pad('SYSTEMINFO')}Displays machine specific properties.`,
        `${pad('DIR')}Displays the contents of this directory.`,
        `${pad('TYPE')}Displays the contents of a text file.`,
        `${pad('COLOR')}Sets the console colours (try COLOR 0A).`,
        `${pad('VER')}Displays the kalamOS version.`,
        `${pad('CLS')}Clears the screen.`,
        `${pad('EXIT')}Quits CMD.EXE and closes the window.`,
      ].join('\n'),
    );

  const cmdAbout = () => {
    printBlock(BANNER, 'bright');
    printBlock(ABOUT);
  };

  const cmdExperience = () =>
    printBlock(
      [
        'EXPERIENCE                                          newest first',
        '===============================================================',
        '',
        '2026-        Garman Technology Ltd ........ Software Engineer',
        '             Directed AI-assisted delivery of a HubSpot-integrated',
        '             booking & case-management platform.',
        '',
        '',
        '2025-2026    Aston University ............. Undergraduate TA',
        '             Taught first-years OOP fundamentals and the ancient art',
        '             of reading the error message before panicking.',
        '',
        '2024-2025    Blueberry Consultants Ltd .... Software Engineer',
        '             Led 6 client-facing projects end-to-end on C#/Angular',
        '             SaaS platforms. Shipped a YOLO ML pipeline for a medical',
        '             device (~85% acc @ 103ms) and cut an NHS data pipeline',
        '             from 3 hours to 12 minutes (-93%). Mentored 4 students;',
        '             2 landed internships.',
        '',
        '2022-2023    Cash Generator ............... Sales / repair bench',
        '             Sold and bought things. Fixed phones, laptops and tablets, often',
        '             demo-ready in minutes.',
        '',
        'ongoing      Whimsico ..................... Co-founder',
        '             Freelance delivery under a shared brand: I take backend,',
        '             cloud and deploys; my partner takes frontend and',
        '             clients. Also: domains, mail, and everything nobody',
        '             else wants to run.',
      ].join('\n'),
    );

  const cmdProjects = () => {
    const lines = ['PROJECTS      (START <name> opens the write-up)', ''];
    for (const p of cfg.projects) {
      lines.push(`  ${p.slug.padEnd(28)}${p.subtitle || p.title}`);
    }
    printBlock(lines.join('\n'));
  };

  const cmdSkills = () =>
    printBlock(
      [
        'C:\\SKILLS',
        '\u251C\u2500 core ........ Python \u00B7 Java \u00B7 C \u00B7 C# \u00B7 SQL \u00B7 Docker \u00B7 Linux',
        '\u2502              TypeScript \u00B7 PHP \u00B7 Flutter/Dart',
        '\u251C\u2500 familiar .... Angular \u00B7 CI/CD (GitHub Actions, GitLab CI) \u00B7 Bash',
        '\u2502              PowerShell \u00B7 AWS',
        '\u2514\u2500 ai/ml ....... YOLO \u00B7 TFLite \u00B7 NumPy \u00B7 Pandas \u00B7 TensorFlow',
        '               Roboflow',
      ].join('\n'),
    );

  const cmdInterests = () =>
    printBlock(
      [
        'INTERESTS.TXT',
        '',
        '  * retro tech restoration ....... why let it go to waste?',
        '  * photography .................. digital and film',
        '  * automotive ................... currently a',
        '                                   2006 E87 116i,',
        '                                   retrofitted the following:',
        '                                   - OEM LCI Bixenon headlights',
        '                                   - OEM LED tail lights',
        '                                   - Apple CarPlay head unit',
        '  * self-hosting ................. the homelab runs the house;',
        '                                   Proxmox, OpenMediaVault, Caddy, OPNsense',
      ].join('\n'),
    );

  const cmdContact = () => {
    printBlock('CONTACT\n');
    for (const s of cfg.socials) {
      printHtml(
        `  ${esc(s.name.padEnd(12))}<a href="${esc(s.href)}" target="_blank" rel="noopener noreferrer">${esc(s.href)}</a>`,
      );
    }
  };

  const cmdDir = () =>
    printBlock(
      [
        ' Volume in drive C is KlamGate Barracuda',
        ' Volume Serial Number is HEHE-HAHA',
        '',
        ' Directory of C:\\Users\\friend',
        '',
        '04/08/2026  09:00    <DIR>          .',
        '04/08/2026  09:00    <DIR>          ..',
        '14/02/2024  19:42    <DIR>          car-projects',
        '02/06/2025  11:23    <DIR>          film-rolls',
        '30/01/2026  03:14    <DIR>          homelab',
        '17/09/2023  16:05    <DIR>          retro-tech',
        '01/08/2026  08:00             2,048 interests.txt',
        '04/08/2026  20:53                42 secret-plans.txt',
        '               3 File(s)         17,090 bytes',
        '               6 Dir(s)   persistence remaining',
      ].join('\n'),
    );

  const cmdType = (args: string[]) => {
    const f = (args[0] ?? '').toLowerCase();
    if (!f) return printBlock('The syntax of the command is incorrect.');
    if (f === 'secret-plans.txt') return printBlock('Access is denied.');
    if (f === 'interests.txt') return cmdInterests();
    printBlock('The system cannot find the file specified.');
  };

  const cmdSysteminfo = () =>
    printBlock(
      [
        'Host Name:                 klamPC',
        'OS Name:                   klamOS 7 Ultimate',
        'OS Version:                6.1.7601 Flower Pack 1',
        'System Manufacturer:       hand-rolled, no framework',
        'System Type:               carbon-based developer',
        'Boot Device:               \\Device\\HarddiskVolume1',
        'Total Physical Memory:     enough, usually',
        'Available Physical Memory: none, i forgot it all',
        'Hotfix(s):                 2 installed.',
        '                           [01]: KB-2026-0001',
        '                           [02]: KB-2026-0002',
      ].join('\n'),
    );

  const cmdColor = (args: string[]) => {
    const code = (args[0] ?? '').toLowerCase();
    if (code === '0a') { q(() => { termEl.classList.add('green'); }); return; }
    if (code === '07' || code === '') { q(() => { termEl.classList.remove('green'); }); return; }
    printBlock('Sets the default console foreground and background colors.\n\nCOLOR 0A   phosphor green\nCOLOR 07   factory settings');
  };

  const cmdStart = (args: string[]) => {
    const t = args[0];
    if (!t) return printBlock('The syntax of the command is incorrect.');
    if (/^https?:\/\//.test(t)) { window.open(t, '_blank', 'noopener'); return; }
    const key = t.toLowerCase();
    if (key === 'projects' || key === 'explorer') { q(() => cfg.onOpenApp('projectsApp')); return; }
    if (key === 'socials' || key === 'iexplore') { q(() => cfg.onOpenApp('socialsApp')); return; }
    const p = cfg.projects.find((x) => x.slug === key);
    if (!p) return printBlock(`klamOS cannot find '${t}'. Make sure you typed the name correctly. (Try PROJECTS for the list.)`);
    q(() => cfg.onOpenProject(p.slug));
  };

  const commands: Record<string, (args: string[]) => void> = {
    help: cmdHelp,
    about: cmdAbout,
    kalam: cmdAbout,
    whoami: () => printBlock('klamPC\\kalam\n(but you can call me kalam :>)'),
    experience: cmdExperience,
    projects: cmdProjects,
    skills: cmdSkills,
    tree: cmdSkills,
    interests: cmdInterests,
    contact: cmdContact,
    socials: cmdContact,
    start: cmdStart,
    dir: cmdDir,
    ls: () => printBlock("'ls' is not recognized. This is klamOS. We say DIR here."),
    type: cmdType,
    cat: (a) => cmdType(a),
    systeminfo: cmdSysteminfo,
    neofetch: cmdSysteminfo,
    color: cmdColor,
    ver: () => printBlock('\n' + HEADER.split('\n')[0]),
    date: () => printBlock(`The current date is: ${new Date().toLocaleDateString()}\nEnter the new date: (just kidding, time is read-only)`),
    time: () => printBlock(`The current time is: ${new Date().toLocaleTimeString()}\nEnter the new time: (no)`),
    echo: (args) => printBlock(args.length ? args.join(' ') : 'ECHO is on.'),
    cls: () => q(() => { output.innerHTML = ''; }),
    exit: () => q(() => cfg.onExit()),
  };

  const history: string[] = [];
  let histIdx = -1;

  const run = (raw: string) => {
    const line = raw.trim();
    echoCommand(raw);
    if (!line) return;
    history.push(line);
    histIdx = history.length;
    const [cmd, ...args] = line.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    if (fn) fn(args);
    else notRecognized(cmd);
    blank();
  };

  let booted = false;

  const boot = () => {
    output.innerHTML = '';
    inputRow.hidden = true;
    printBlock(HEADER, '');
    blank();
    q(() => typeInto(newLine(), 'about', CMD_CPS, PROMPT));
    blank();
    cmdAbout();
    blank();
    q(() => {
      inputRow.hidden = false;
      scroll();
      if (window.matchMedia('(pointer: fine)').matches) input.focus({ preventScroll: true });
    });
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (histIdx > 0) input.value = history[--histIdx]; }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) input.value = history[++histIdx];
      else { histIdx = history.length; input.value = ''; }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); output.innerHTML = ''; }
  });

  termEl.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) return;
    if (!window.getSelection()?.isCollapsed) return;
    if (!inputRow.hidden) input.focus({ preventScroll: true });
  });

  return {
    reset() {
      gen++;
      chain = Promise.resolve();
      output.innerHTML = '';
      input.value = '';
      inputRow.hidden = true;
      termEl.classList.remove('green');
      history.length = 0;
      histIdx = -1;
      booted = false;
    },
    ensureBooted() {
      if (booted) return;
      booted = true;
      boot();
    },
  };
}
