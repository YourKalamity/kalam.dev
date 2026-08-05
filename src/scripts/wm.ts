type WinState = 'normal' | 'minimized' | 'maximized';
type SnapZone = 'left' | 'right' | 'max' | null;

interface Rect { x: number; y: number; w: number; h: number }

interface WinRec {
  el: HTMLElement;
  app: string;
  state: WinState;
  rect: Rect;
  placed: boolean;
}

export interface WMConfig {
  routes: Record<string, string | null>;
  onChange?: (info: { focused: string | null; open: string[]; running: string[] }) => void;
  onRoute?: (path: string) => void;
  onClose?: (app: string) => void;
  onLaunching?: (app: string, ms: number) => void;
}

const MIN_W = 320;
const MIN_H = 240;
const SNAP_EDGE = 24;
const LAUNCH_MS = 1000;

export class WindowManager {
  private wins = new Map<string, WinRec>();
  private z = 10;
  private launching = new Set<string>();
  private focused: string | null = null;
  private snapOverlay: HTMLElement;
  private cfg: WMConfig;
  private cascade = 0;

  constructor(cfg: WMConfig) {
    this.cfg = cfg;
    this.snapOverlay = document.getElementById('snapOverlay') as HTMLElement;

    document.querySelectorAll<HTMLElement>('.window[data-app]').forEach((el) => {
      const app = el.dataset.app!;
      this.wins.set(app, { el, app, state: 'normal', rect: { x: 0, y: 0, w: 0, h: 0 }, placed: false });
      this.wireWindow(el, app);
    });

    const openApp = document.body.dataset.openApp;
    this.wins.forEach((rec) => {
      if (!rec.el.hidden) this.place(rec, rec.app === openApp);
    });
    if (openApp && this.wins.has(openApp)) this.focus(openApp, false);

    window.addEventListener('resize', () => this.clampAll());
    window.addEventListener('popstate', () => this.syncFromLocation());
    window.addEventListener('keydown', (e) => this.onKey(e));
  }

  private bounds() {
    const taskbar = document.querySelector<HTMLElement>('.taskbar');
    const th = taskbar ? taskbar.offsetHeight : 40;
    return { w: window.innerWidth, h: window.innerHeight - th };
  }

  private apply(rec: WinRec) {
    const { el, rect } = rec;
    el.style.left = `${rect.x}px`;
    el.style.top = `${rect.y}px`;
    el.style.width = `${rect.w}px`;
    el.style.height = `${rect.h}px`;
    el.style.right = 'auto';
    el.style.margin = '0';
  }

  private place(rec: WinRec, primary: boolean) {
    if (rec.placed) return;
    const b = this.bounds();
    const w = Math.min(rec.el.offsetWidth || 640, b.w - 20);
    const h = Math.min(rec.el.offsetHeight || 480, b.h - 20);
    const offset = primary ? 0 : ((this.cascade++ % 5) + 1) * 28;
    const x = Math.max(10, Math.round((b.w - w) / 2) + offset);
    const y = Math.max(10, Math.round((b.h - h) / 2) - 20 + offset);
    rec.rect = { x, y, w, h };
    rec.placed = true;
    this.apply(rec);
  }

  private clampAll() {
    const b = this.bounds();
    this.wins.forEach((rec) => {
      if (!rec.placed || rec.state !== 'normal') return;
      rec.rect.x = Math.min(Math.max(rec.rect.x, 80 - rec.rect.w), b.w - 80);
      rec.rect.y = Math.min(Math.max(0, rec.rect.y), b.h - 40);
      this.apply(rec);
    });
  }

  open(app: string, navigate = true) {
    const rec = this.wins.get(app);
    if (!rec) return;
    if (rec.state === 'minimized') {
      this.restoreFromMinimize(rec);
    } else if (rec.el.hidden) {
      if (this.launching.has(app)) return;
      this.launching.add(app);
      this.cfg.onLaunching?.(app, LAUNCH_MS);
      setTimeout(() => {
        this.launching.delete(app);
        rec.el.hidden = false;
        rec.state = 'normal';
        this.place(rec, false);
        this.focus(app, navigate);
      }, LAUNCH_MS);
      return;
    }
    this.focus(app, navigate);
  }

  close(app: string) {
    const rec = this.wins.get(app);
    if (!rec || rec.el.hidden) return;
    rec.el.hidden = true;
    rec.el.classList.remove('is-focused', 'is-max', 'is-minimizing');
    rec.state = 'normal';
    rec.placed = false;
    ['left', 'top', 'width', 'height', 'margin', 'right'].forEach((p) =>
      rec.el.style.removeProperty(p),
    );
    this.cfg.onClose?.(app);
    if (this.focused === app) {
      this.focused = null;
      const next = this.topmostVisible();
      if (next) this.focus(next, true);
      else this.navigate('/');
    }
    this.emit();
  }

  minimize(app: string) {
    const rec = this.wins.get(app);
    if (!rec || rec.el.hidden) return;
    rec.state = 'minimized';
    rec.el.classList.add('is-minimizing');
    const done = () => {
      rec.el.removeEventListener('transitionend', done);
      if (rec.state !== 'minimized') return;
      rec.el.hidden = true;
      rec.el.classList.remove('is-minimizing');
    };
    rec.el.addEventListener('transitionend', done);
    setTimeout(done, 260);
    if (this.focused === app) {
      this.focused = null;
      const next = this.topmostVisible();
      if (next) this.focus(next, false);
    }
    this.emit();
  }

  private restoreFromMinimize(rec: WinRec) {
    const backToMax = rec.el.classList.contains('is-max');
    rec.state = backToMax ? 'maximized' : 'normal';
    if (!backToMax) this.apply(rec);
    rec.el.classList.add('is-minimizing');
    rec.el.hidden = false;
    void rec.el.offsetWidth;
    rec.el.classList.remove('is-minimizing');
  }

  toggleMinimize(app: string) {
    const rec = this.wins.get(app);
    if (!rec) return;
    if (rec.el.hidden || rec.state === 'minimized') this.open(app);
    else if (this.focused === app) this.minimize(app);
    else this.focus(app, true);
  }

  private canResize(rec: WinRec) { return !rec.el.hasAttribute('data-no-resize'); }
  private canMax(rec: WinRec) { return !rec.el.hasAttribute('data-no-max'); }

  private isMobile() { return window.matchMedia('(max-width: 800px)').matches; }

  private allowedZone(rec: WinRec, zone: SnapZone): SnapZone {
    if (zone === 'max') return this.canMax(rec) ? zone : null;
    if (zone === 'left' || zone === 'right') return this.canResize(rec) ? zone : null;
    return null;
  }

  maximize(app: string) {
    const rec = this.wins.get(app);
    if (!rec || !this.canMax(rec)) return;
    if (rec.state === 'maximized') {
      rec.state = 'normal';
      rec.el.classList.remove('is-max');
      this.apply(rec);
    } else {
      rec.state = 'maximized';
      rec.el.classList.add('is-max');
    }
    this.focus(app, true);
  }

  focus(app: string, navigate = true) {
    const rec = this.wins.get(app);
    if (!rec) return;
    const alreadyFocused = this.focused === app;
    this.wins.forEach((r) => {
      r.el.classList.toggle('is-focused', r === rec);
      r.el.classList.toggle('active', r === rec);
    });
    rec.el.style.zIndex = String(++this.z);
    this.focused = app;
    if (navigate && !alreadyFocused) this.navigate(this.cfg.routes[app] ?? null);
    this.emit();
  }

  private topmostVisible(): string | null {
    let best: string | null = null;
    let bestZ = -1;
    this.wins.forEach((rec, app) => {
      if (rec.el.hidden || rec.state === 'minimized') return;
      const z = parseInt(rec.el.style.zIndex || '0', 10);
      if (z >= bestZ) { bestZ = z; best = app; }
    });
    return best;
  }

  private navigate(path: string | null) {
    if (!path) return;
    const clean = path.replace(/\/$/, '') || '/';
    if (location.pathname.replace(/\/$/, '') !== clean.replace(/\/$/, '')) {
      history.pushState({}, '', clean);
    }
    this.cfg.onRoute?.(clean);
  }

  setPath(path: string) {
    const clean = path.replace(/\/$/, '') || '/';
    history.pushState({}, '', clean);
    this.cfg.onRoute?.(clean);
  }

  private syncFromLocation() {
    const path = location.pathname.replace(/\/$/, '') || '/';
    this.cfg.onRoute?.(path);
    const entry = Object.entries(this.cfg.routes).find(([, r]) => {
      if (!r) return false;
      const rr = r.replace(/\/$/, '') || '/';
      if (rr.startsWith('/projects')) return path.startsWith('/projects');
      return rr === path;
    });
    if (entry) this.open(entry[0], false);
  }

  private emit() {
    const open: string[] = [];
    const running: string[] = [];
    this.wins.forEach((rec, app) => {
      if (rec.el.hidden) return;
      running.push(app);
      if (rec.state !== 'minimized') open.push(app);
    });
    this.cfg.onChange?.({ focused: this.focused, open, running });
  }

  private wireWindow(el: HTMLElement, app: string) {
    el.addEventListener('pointerdown', () => this.focus(app), true);

    const bar = el.querySelector<HTMLElement>('[data-wm-drag]');
    bar?.addEventListener('pointerdown', (e) => this.startDrag(e, app));
    bar?.addEventListener('dblclick', () => this.maximize(app));

    el.querySelectorAll<HTMLElement>('[data-wm-resize]').forEach((h) =>
      h.addEventListener('pointerdown', (e) => this.startResize(e, app, h.dataset.wmResize!)),
    );

    el.querySelectorAll<HTMLElement>('[data-wm-action]').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.wmAction;
        if (action === 'close') this.close(app);
        else if (action === 'minimize') this.minimize(app);
        else if (action === 'maximize') this.maximize(app);
      }),
    );
  }

  private startDrag(e: PointerEvent, app: string) {
    if (this.isMobile()) return;
    if ((e.target as HTMLElement).closest('[data-wm-action]')) return;
    const rec = this.wins.get(app)!;
    if (rec.state === 'maximized') {
      rec.state = 'normal';
      rec.el.classList.remove('is-max');
      rec.rect.w = Math.min(rec.rect.w || 640, this.bounds().w - 40);
      rec.rect.y = 0;
      this.apply(rec);
    }
    e.preventDefault();
    this.focus(app);
    const startX = e.clientX, startY = e.clientY;
    const orig = { ...rec.rect };
    let zone: SnapZone = null;
    rec.el.classList.add('is-interacting');
    rec.el.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const nx = orig.x + (ev.clientX - startX);
      const ny = orig.y + (ev.clientY - startY);
      const b = this.bounds();
      rec.rect.x = nx;
      rec.rect.y = Math.min(Math.max(0, ny), b.h - 36);
      this.apply(rec);
      zone = this.allowedZone(rec, this.snapZoneFor(ev.clientX, ev.clientY));
      this.showSnapPreview(zone);
    };
    const cleanup = () => {
      rec.el.removeEventListener('pointermove', move);
      rec.el.removeEventListener('pointerup', up);
      rec.el.removeEventListener('pointercancel', cancel);
      rec.el.classList.remove('is-interacting');
      this.showSnapPreview(null);
    };
    const up = (ev: PointerEvent) => {
      rec.el.releasePointerCapture(ev.pointerId);
      cleanup();
      if (zone) this.applySnap(app, zone);
      else this.clampAll();
    };
    const cancel = () => {
      cleanup();
      this.clampAll();
    };
    rec.el.addEventListener('pointermove', move);
    rec.el.addEventListener('pointerup', up);
    rec.el.addEventListener('pointercancel', cancel);
  }

  private startResize(e: PointerEvent, app: string, dir: string) {
    if (this.isMobile()) return;
    e.preventDefault();
    e.stopPropagation();
    const rec = this.wins.get(app)!;
    if (rec.state === 'maximized') return;
    this.focus(app);
    const startX = e.clientX, startY = e.clientY;
    const orig = { ...rec.rect };
    rec.el.classList.add('is-interacting');
    rec.el.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let { x, y, w, h } = orig;
      if (dir.includes('e')) w = Math.max(MIN_W, orig.w + dx);
      if (dir.includes('s')) h = Math.max(MIN_H, orig.h + dy);
      if (dir.includes('w')) { w = Math.max(MIN_W, orig.w - dx); x = orig.x + (orig.w - w); }
      if (dir.includes('n')) { h = Math.max(MIN_H, orig.h - dy); y = orig.y + (orig.h - h); }
      rec.rect = { x, y, w, h };
      this.apply(rec);
    };
    const cleanup = () => {
      rec.el.removeEventListener('pointermove', move);
      rec.el.removeEventListener('pointerup', up);
      rec.el.removeEventListener('pointercancel', cleanup);
      rec.el.classList.remove('is-interacting');
    };
    const up = (ev: PointerEvent) => {
      rec.el.releasePointerCapture(ev.pointerId);
      cleanup();
    };
    rec.el.addEventListener('pointermove', move);
    rec.el.addEventListener('pointerup', up);
    rec.el.addEventListener('pointercancel', cleanup);
  }

  private snapZoneFor(cx: number, cy: number): SnapZone {
    if (cy <= SNAP_EDGE) return 'max';
    if (cx <= SNAP_EDGE) return 'left';
    if (cx >= window.innerWidth - SNAP_EDGE) return 'right';
    return null;
  }

  private snapRect(zone: Exclude<SnapZone, null>): Rect {
    const b = this.bounds();
    if (zone === 'left') return { x: 0, y: 0, w: Math.round(b.w / 2), h: b.h };
    if (zone === 'right') return { x: Math.round(b.w / 2), y: 0, w: Math.round(b.w / 2), h: b.h };
    return { x: 0, y: 0, w: b.w, h: b.h };
  }

  private showSnapPreview(zone: SnapZone) {
    if (!zone) { this.snapOverlay.classList.remove('show'); return; }
    const r = this.snapRect(zone);
    Object.assign(this.snapOverlay.style, {
      left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px`,
    });
    this.snapOverlay.classList.add('show');
  }

  private applySnap(app: string, zone: Exclude<SnapZone, null>) {
    const rec = this.wins.get(app)!;
    if (zone === 'max') {
      if (rec.state !== 'maximized') this.maximize(app);
      return;
    }
    rec.el.classList.remove('is-max');
    rec.state = 'normal';
    rec.rect = this.snapRect(zone);
    this.apply(rec);
  }

  private onKey(e: KeyboardEvent) {
    if (!this.focused) return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (!e.ctrlKey && !e.metaKey) return;
    const app = this.focused;
    const rec = this.wins.get(app)!;
    if (e.key === 'ArrowLeft') { if (!this.canResize(rec)) return; e.preventDefault(); this.applySnap(app, 'left'); }
    else if (e.key === 'ArrowRight') { if (!this.canResize(rec)) return; e.preventDefault(); this.applySnap(app, 'right'); }
    else if (e.key === 'ArrowUp') { if (!this.canMax(rec)) return; e.preventDefault(); if (rec.state !== 'maximized') this.maximize(app); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); rec.state === 'maximized' ? this.maximize(app) : this.minimize(app); }
  }

  isOpen(app: string) {
    const rec = this.wins.get(app);
    return !!rec && !rec.el.hidden && rec.state !== 'minimized';
  }
}
