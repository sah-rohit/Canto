/**
 * Canto Sound Effects — Web Audio API, no external files.
 * All sounds are synthesized in-browser.
 * Respects user preference stored in localStorage.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  return ctx;
}

export function isSoundEnabled(): boolean {
  try { return localStorage.getItem('canto_sound') !== 'off'; } catch { return true; }
}

export function setSoundEnabled(on: boolean): void {
  try { localStorage.setItem('canto_sound', on ? 'on' : 'off'); } catch {}
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.12): void {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gainNode.gain.setValueAtTime(gain, ac.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch {}
}

/** Soft chime when a search completes */
export function playSearchComplete(): void {
  playTone(880, 0.12, 'sine', 0.1);
  setTimeout(() => playTone(1100, 0.1, 'sine', 0.07), 100);
}

/** Subtle click when a word is clicked */
export function playWordClick(): void {
  playTone(440, 0.06, 'triangle', 0.06);
}

/** Error sound */
export function playError(): void {
  playTone(220, 0.18, 'sawtooth', 0.08);
}


