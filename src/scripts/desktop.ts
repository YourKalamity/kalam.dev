import { WindowManager } from './wm.ts';
import { initTerminal, type TermProject, type TerminalHandle } from './terminal.ts';
import { initCursors } from './cursors.ts';
import { kalamTextPairs, socials } from '../lib/site.ts';

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const session = {
  get(key: string): string | null {
    try { return sessionStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
  },
  remove(key: string) {
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
  },
};

export function initDesktop() {
  const routes: Record<string, string | null> = {
    kalamApp: '/',
    projectsApp: '/projects',
    socialsApp: '/socials',
    terminalApp: '/about',
  };

  const urlBar = document.getElementById('socialsURL') as HTMLInputElement | null;

  let term: TerminalHandle | undefined;
  let desktopReady = false;

  const cursors = initCursors();
  cursors.startAmbient();

  const wm = new WindowManager({
    routes,
    onLaunching: (_app, ms) => cursors.working(ms),
    onChange: ({ focused, open, running }) => {
      document.querySelectorAll<HTMLElement>('[data-wm-taskbar]').forEach((el) => {
        const app = el.dataset.wmTaskbar!;
        if (el.dataset.wmUnpinned !== undefined) el.hidden = !running.includes(app);
        el.classList.remove('is-active', 'is-open');
        if (app === focused) el.classList.add('is-active');
        else if (open.includes(app)) el.classList.add('is-open');
      });
      if (open.includes('terminalApp')) term?.ensureBooted();
      if (desktopReady && open.includes('projectsApp') && !activating && !document.querySelector('.project-detail.active')) {
        const first = document.querySelector<HTMLElement>('.explorer-navpane .project');
        if (first?.dataset.project) void activateProject(first.dataset.project, false);
      }
    },
    onClose: (app) => resetApp(app),
    onRoute: (path) => {
      if (urlBar) urlBar.value = new URL(path, location.origin).href;
      const m = path.match(/^\/projects\/(.+)$/);
      if (m) activateProject(m[1], false);
    },
  });

  const footerSource = document.getElementById('sourceButton') as HTMLButtonElement | null;
  const footerLink = document.getElementById('linkButton') as HTMLButtonElement | null;

  function setFooterButton(btn: HTMLButtonElement | null, href: string) {
    if (!btn) return;
    const enabled = href.length > 0;
    btn.classList.toggle('disabled', !enabled);
    btn.setAttribute('aria-disabled', String(!enabled));
    btn.dataset.href = href;
  }

  const crumbCurrent = document.getElementById('crumbCurrent');
  const crumbTail = document.getElementById('crumbTail');
  const detailsIcon = document.getElementById('detailsIcon') as HTMLImageElement | null;
  const detailsName = document.getElementById('detailsName');
  const detailsDesc = document.getElementById('detailsDesc');
  const previewPane = document.querySelector<HTMLElement>('.preview-pane');

  const detailFetches = new Map<string, Promise<HTMLElement | null>>();
  function fetchProjectDetail(slug: string): Promise<HTMLElement | null> {
    let p = detailFetches.get(slug);
    if (!p) {
      p = fetch(`/projects/${slug}/`)
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const detail = doc.querySelector<HTMLElement>(`.project-detail[data-project="${slug}"]`);
          if (!detail || !previewPane) return null;
          detail.classList.remove('active');
          previewPane.appendChild(document.adoptNode(detail));
          detail.querySelectorAll('video').forEach((v) => {
            v.muted = true;
            v.load();
            if (v.autoplay) v.play().catch(() => { /* ignore */ });
          });
          return detail;
        })
        .catch(() => {
          detailFetches.delete(slug);
          return null;
        });
      detailFetches.set(slug, p);
    }
    return p;
  }

  let activateSeq = 0;
  let activating = false;
  async function activateProject(slug: string, push: boolean) {
    const seq = ++activateSeq;
    let detail = document.querySelector<HTMLElement>(`.project-detail[data-project="${slug}"]`);
    if (!detail) {
      activating = true;
      try {
        detail = await fetchProjectDetail(slug);
      } finally {
        activating = false;
      }
    }
    if (!detail || seq !== activateSeq) return;
    document.querySelectorAll('.project-detail.active').forEach((d) => d.classList.remove('active'));
    document.querySelectorAll('.explorer-navpane .project.active').forEach((d) => d.classList.remove('active'));
    detail.classList.add('active');
    document.querySelector(`.explorer-navpane .project[data-project="${slug}"]`)?.classList.add('active');

    const title = detail.dataset.title ?? '';
    if (crumbTail) crumbTail.hidden = false;
    if (crumbCurrent) crumbCurrent.textContent = title;
    if (detailsName) detailsName.textContent = title;
    if (detailsDesc) detailsDesc.textContent = detail.dataset.desc ?? '';
    if (detailsIcon && detail.dataset.icon) detailsIcon.src = detail.dataset.icon;

    setFooterButton(footerSource, detail.dataset.source ?? '');
    setFooterButton(footerLink, detail.dataset.live ?? '');
    previewPane?.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    routes.projectsApp = `/projects/${slug}`;
    if (push) wm.setPath(`/projects/${slug}`);
  }

  const initialActive = document.querySelector<HTMLElement>('.project-detail.active');
  if (initialActive) {
    setFooterButton(footerSource, initialActive.dataset.source ?? '');
    setFooterButton(footerLink, initialActive.dataset.live ?? '');
  }

  const navpane = document.querySelector<HTMLElement>('.explorer-navpane');
  const navBackdrop = document.querySelector<HTMLElement>('.navpane-backdrop');
  const navToggle = document.querySelector<HTMLElement>('.toggle-sidebar-btn');
  function setNavpane(open: boolean) {
    navpane?.classList.toggle('open', open);
    navBackdrop?.classList.toggle('show', open);
    navToggle?.setAttribute('aria-expanded', String(open));
  }
  navToggle?.addEventListener('click', () => setNavpane(!navpane?.classList.contains('open')));
  navBackdrop?.addEventListener('click', () => setNavpane(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navpane?.classList.contains('open')) setNavpane(false);
  });

  navpane?.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLElement>('.project');
    if (!link) return;
    e.preventDefault();
    wm.open('projectsApp');
    activateProject(link.dataset.project!, true);
    if (window.innerWidth <= 800) setNavpane(false);
  });

  document.getElementById('explorerBack')?.addEventListener('click', () => history.back());
  document.getElementById('explorerFwd')?.addEventListener('click', () => history.forward());

  const projectSearch = document.getElementById('projectSearch') as HTMLInputElement | null;
  projectSearch?.addEventListener('input', () => {
    const q = projectSearch.value.trim().toLowerCase();
    document.querySelectorAll<HTMLElement>('.navpane-list li').forEach((li) => {
      const name = li.textContent?.toLowerCase() ?? '';
      li.style.display = !q || name.includes(q) ? '' : 'none';
    });
  });

  const hitDigits = document.getElementById('hitCounter');
  if (hitDigits) {
    let n = 1337;
    try {
      n = parseInt(localStorage.getItem('kalam-hits') ?? '1336', 10) + 1;
      localStorage.setItem('kalam-hits', String(n));
    } catch { /* keep default */ }
    hitDigits.replaceChildren(
      ...String(Math.min(n, 999999)).padStart(6, '0').split('').map((d) => {
        const s = document.createElement('span');
        s.textContent = d;
        return s;
      }),
    );
  }

  document.getElementById('socialsBack')?.addEventListener('click', () => history.back());
  document.getElementById('socialsForward')?.addEventListener('click', () => history.forward());
  document.getElementById('ieHome')?.addEventListener('click', () => wm.open('kalamApp'));
  document.getElementById('iePrint')?.addEventListener('click', () => window.print());
  const socialsSearch = document.getElementById('socialsSearch') as HTMLInputElement | null;
  socialsSearch?.addEventListener('keydown', (e) => {
    const q = socialsSearch.value.trim();
    if (e.key === 'Enter' && q) {
      window.open('https://www.bing.com/search?q=' + encodeURIComponent(q), '_blank', 'noopener');
    }
  });

  footerSource?.addEventListener('click', () => {
    const href = footerSource.dataset.href;
    if (href) window.open(href, '_blank', 'noopener');
  });
  footerLink?.addEventListener('click', () => {
    const href = footerLink.dataset.href;
    if (href) window.open(href, '_blank', 'noopener');
  });

  function activateControl(target: HTMLElement): boolean {
    const opener = target.closest<HTMLElement>('[data-wm-open]');
    if (opener) { wm.open(opener.dataset.wmOpen!); closeStartMenu(); return true; }
    const task = target.closest<HTMLElement>('[data-wm-taskbar]');
    if (task) { wm.toggleMinimize(task.dataset.wmTaskbar!); return true; }
    return false;
  }
  document.body.addEventListener('click', (e) => {
    activateControl(e.target as HTMLElement);
  });
  document.body.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const target = e.target as HTMLElement;
    if (target.matches('input, textarea, button, a')) return;
    if (activateControl(target)) e.preventDefault();
  });

  const startBtn = document.querySelector<HTMLElement>('.start');
  const startMenu = document.getElementById('startMenu');
  const startImg = document.querySelector<HTMLImageElement>('.start img');
  function closeStartMenu() {
    startMenu?.classList.remove('active');
    startBtn?.setAttribute('aria-expanded', 'false');
    if (startImg) startImg.src = '/images/startNormal.webp';
  }
  function toggleStartMenu() {
    const active = startMenu?.classList.toggle('active');
    startBtn?.setAttribute('aria-expanded', String(!!active));
    if (startImg) startImg.src = active ? '/images/startClicked.webp' : '/images/startNormal.webp';
  }
  startBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggleStartMenu(); });
  if (location.hash === '#start') toggleStartMenu();
  startBtn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStartMenu(); }
  });
  document.addEventListener('click', (e) => {
    if (!startMenu?.classList.contains('active')) return;
    const t = e.target as HTMLElement;
    if (!t.closest('#startMenu') && !t.closest('.start')) closeStartMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeStartMenu(); });

  startMenu?.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    const items = [...startMenu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')];
    if (!items.length) return;
    e.preventDefault();
    const idx = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'Home' ? 0 :
      e.key === 'End' ? items.length - 1 :
      e.key === 'ArrowDown' ? (idx + 1) % items.length :
      (idx - 1 + items.length) % items.length;
    items[next].focus();
  });

  const showDesktop = document.querySelector<HTMLElement>('.show-desktop-button');
  const minimizeAll = () => {
    ['kalamApp', 'projectsApp', 'socialsApp', 'terminalApp'].forEach((a) => {
      if (wm.isOpen(a)) wm.minimize(a);
    });
  };
  showDesktop?.addEventListener('click', minimizeAll);
  showDesktop?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); minimizeAll(); }
  });

  const shutdownScreen = document.getElementById('shutdown');
  const powerOffScreen = document.getElementById('powerOff');
  document.querySelector('.sm-shutdown')?.addEventListener('click', () => {
    if (!shutdownScreen || !powerOffScreen) return;
    closeStartMenu();
    shutdownScreen.hidden = false;
    const powerOff = () => {
      shutdownScreen.hidden = true;
      powerOffScreen.hidden = false;
      const bootUp = () => {
        session.remove('booted');
        location.href = '/';
      };
      powerOffScreen.addEventListener('click', bootUp, { once: true });
      window.addEventListener('keydown', bootUp, { once: true });
    };
    setTimeout(powerOff, reducedMotion() ? 400 : 2600);
  });
  if (location.hash === '#shutdown') document.querySelector<HTMLElement>('.sm-shutdown')?.click();

  const timeEl = document.getElementById('tray-time');
  const dateEl = document.getElementById('tray-date');
  const tick = () => {
    const now = new Date();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString();
    setTimeout(tick, 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50);
  };
  tick();

  startTyping();

  const projects: TermProject[] = [...document.querySelectorAll<HTMLElement>('.explorer-navpane .project')].map((a) => ({
    slug: a.dataset.project ?? '',
    title: a.dataset.title ?? '',
    subtitle: a.dataset.desc ?? '',
  }));
  term = initTerminal({
    projects,
    socials: socials.map((s) => ({ name: s.name, href: s.href })),
    onOpenProject: (slug) => { wm.open('projectsApp'); activateProject(slug, true); },
    onOpenApp: (app) => wm.open(app),
    onExit: () => wm.close('terminalApp'),
  });
  if (wm.isOpen('terminalApp')) term?.ensureBooted();

  function resetApp(app: string) {
    if (app === 'projectsApp') {
      const first = document.querySelector<HTMLElement>('.explorer-navpane .project');
      if (first?.dataset.project) activateProject(first.dataset.project, false);
      if (projectSearch) projectSearch.value = '';
      document.querySelectorAll<HTMLElement>('.navpane-list li').forEach((li) => { li.style.display = ''; });
      setNavpane(false);
      document.querySelector('.preview-pane')?.scrollTo({ top: 0 });
    } else if (app === 'socialsApp') {
      if (socialsSearch) socialsSearch.value = '';
      document.querySelector('.socialsApp-content')?.scrollTo({ top: 0 });
    } else if (app === 'terminalApp') {
      term?.reset();
    }
  }

  desktopReady = true;
  if (wm.isOpen('projectsApp') && !document.querySelector('.project-detail.active')) {
    const first = document.querySelector<HTMLElement>('.explorer-navpane .project');
    if (first?.dataset.project) void activateProject(first.dataset.project, false);
  }

  const startupApp = document.body.dataset.openApp;
  runBoot({
    onWillBoot: () => { if (startupApp) wm.close(startupApp); },
    onDone: () => {
      if (!startupApp) return;
      setTimeout(() => {
        if (!document.querySelector('.window:not([hidden])')) wm.open(startupApp);
      }, 650);
    },
  });
}

function startTyping() {
  const titleEl = document.getElementById('kalamTitle');
  const subtitleEl = document.getElementById('kalamSubtitle');
  if (!titleEl || !subtitleEl) return;
  if (reducedMotion()) return;

  const speed = 40;
  const pause = 2200;
  let idx = 1;

  const type = (el: HTMLElement, text: string, done: () => void) => {
    let i = 0;
    el.textContent = '';
    const step = () => {
      if (i < text.length) { el.textContent += text.charAt(i++); setTimeout(step, speed); }
      else done();
    };
    step();
  };

  const cycle = () => {
    const pair = kalamTextPairs[idx];
    type(titleEl, pair.title, () =>
      type(subtitleEl, pair.subtitle, () =>
        setTimeout(() => { idx = (idx + 1) % kalamTextPairs.length; cycle(); }, pause),
      ),
    );
  };
  setTimeout(cycle, pause);
}

function runBoot(hooks: { onWillBoot?: () => void; onDone?: () => void } = {}) {
  const boot = document.getElementById('boot');
  if (!boot) return;
  const isRoot = (location.pathname.replace(/\/$/, '') || '/') === '/';
  if (!isRoot || session.get('booted') || reducedMotion()) {
    if (isRoot) session.set('booted', '1');
    boot.remove();
    return;
  }

  const post = document.getElementById('bootPost');
  const winb = document.getElementById('bootWin');
  const memEl = document.getElementById('postMem');
  const barFill = document.getElementById('bootBarFill');
  if (!post || !winb || !memEl || !barFill) { boot.remove(); return; }

  hooks.onWillBoot?.();
  boot.hidden = false;

  const timers: number[] = [];
  const intervals: number[] = [];
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    intervals.forEach(clearInterval);
    window.removeEventListener('keydown', keySkip, true);
    session.set('booted', '1');
    boot.classList.add('done');
    setTimeout(() => boot.remove(), 460);
    hooks.onDone?.();
  };
  const keySkip = () => finish();
  boot.addEventListener('click', finish);
  window.addEventListener('keydown', keySkip, true);

  const lines = [...post.querySelectorAll<HTMLElement>('[data-t]')];
  let lastT = 0;
  for (const line of lines) {
    const t = parseInt(line.dataset.t ?? '0', 10);
    lastT = Math.max(lastT, t);
    timers.push(window.setTimeout(() => { line.style.visibility = 'visible'; }, t));
  }

  const memStart = parseInt(memEl.dataset.t ?? '900', 10);
  timers.push(window.setTimeout(() => {
    const dur = 900;
    const step = 40;
    const total = 262144;
    let elapsed = 0;
    const id = window.setInterval(() => {
      elapsed += step;
      const p = Math.min(1, elapsed / dur);
      const k = Math.round((total * p) / 1024) * 1024;
      memEl.textContent = `Memory Test :  ${String(k).padStart(6)}K${p >= 1 ? ' OK' : ''}`;
      if (p >= 1) clearInterval(id);
    }, step);
    intervals.push(id);
  }, memStart));

  timers.push(window.setTimeout(() => {
    post.hidden = true;
    winb.hidden = false;
    const dur = 5000;
    const step = 50;
    let elapsed = 0;
    const id = window.setInterval(() => {
      elapsed += step;
      const p = Math.min(1, elapsed / dur);
      barFill.style.width = `${Math.round(p * 100)}%`;
      if (p >= 1) {
        clearInterval(id);
        timers.push(window.setTimeout(finish, 300));
      }
    }, step);
    intervals.push(id);
  }, lastT + 450));
}
