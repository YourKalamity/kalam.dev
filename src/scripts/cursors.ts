import { CURSOR_ANI, type AniState } from '../lib/cursor-manifest.ts';

export interface CursorControl {
  working: (ms: number) => void;
  busy: (ms: number) => void;
  startAmbient: () => void;
}

function initTouchCursor() {
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const el = document.createElement('img');
  el.src = '/cursors/arrow.png';
  el.alt = '';
  el.className = 'touch-cursor';
  el.setAttribute('aria-hidden', 'true');

  const SIZE = 32;
  const marginX = window.innerWidth * 0.2;
  const marginY = window.innerHeight * 0.2;
  let x = marginX + Math.random() * Math.max(0, window.innerWidth - marginX * 2 - SIZE);
  let y = marginY + Math.random() * Math.max(0, window.innerHeight - marginY * 2 - SIZE);

  const render = () => { el.style.transform = `translate(${x}px, ${y}px)`; };
  render();

  const show = () => document.body.appendChild(el);
  const boot = document.getElementById('boot');
  if (boot?.parentNode) {
    new MutationObserver((_, obs) => {
      if (!document.getElementById('boot')) {
        obs.disconnect();
        show();
      }
    }).observe(boot.parentNode, { childList: true });
  } else {
    show();
  }

  const clamp = () => {
    x = Math.min(x, Math.max(0, window.innerWidth - SIZE));
    y = Math.min(y, Math.max(0, window.innerHeight - SIZE));
    render();
  };

  const onPointer = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      el.remove();
      window.removeEventListener('pointerdown', onPointer, true);
      window.removeEventListener('pointermove', onPointer, true);
      window.removeEventListener('resize', clamp);
      return;
    }
    x = e.clientX;
    y = e.clientY;
    render();
  };
  window.addEventListener('pointerdown', onPointer, true);
  window.addEventListener('pointermove', onPointer, true);
  window.addEventListener('resize', clamp);
}

export function initCursors(): CursorControl {
  const root = document.documentElement;
  const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initTouchCursor();

  const warm = () => {
    for (const state of Object.values(CURSOR_ANI)) {
      for (const url of new Set(state.frames)) fetch(url).catch(() => {});
    }
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(warm);
  else setTimeout(warm, 2500);

  let token = 0;

  function play(state: AniState, ms: number, fallback: string) {
    const t = ++token;
    root.classList.add('cursor-anim');
    const end = performance.now() + ms;
    const finish = () => {
      if (t !== token) return;
      root.classList.remove('cursor-anim');
      root.style.removeProperty('--cur-anim');
    };
    if (reducedMotion()) {
      root.style.setProperty('--cur-anim', `url(${state.frames[0]}), ${fallback}`);
      setTimeout(finish, ms);
      return;
    }
    let i = 0;
    const step = () => {
      if (t !== token) return;
      if (performance.now() >= end) return finish();
      root.style.setProperty('--cur-anim', `url(${state.frames[i % state.frames.length]}), ${fallback}`);
      const delay = state.delays[i % state.delays.length];
      i++;
      setTimeout(step, delay);
    };
    step();
  }

  const working = (ms: number) => play(CURSOR_ANI.working, ms, 'progress');
  const busy = (ms: number) => play(CURSOR_ANI.busy, ms, 'wait');

  let ambientStarted = false;
  const startAmbient = () => {
    if (ambientStarted) return;
    ambientStarted = true;
    const tick = () => {
      const idle = 8000 + Math.random() * 12000;
      setTimeout(() => {
        if (Math.random() < 0.2) busy(800 + Math.random() * 900);
        else working(1200 + Math.random() * 1400);
        tick();
      }, idle);
    };
    tick();
  };

  return { working, busy, startAmbient };
}
