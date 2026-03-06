let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    audioContext = new AudioCtx();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  options?: { type?: OscillatorType; gain?: number; attack?: number; release?: number },
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  const type = options?.type ?? "sine";
  const gain = options?.gain ?? 0.12;
  const attack = options?.attack ?? 0.01;
  const release = options?.release ?? 0.08;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration + release);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration + release + 0.01);
}

export function playBidLockInSound() {
  playTone(392, 0.08, { type: "square", gain: 0.08, attack: 0.005 });
  setTimeout(() => playTone(587, 0.09, { type: "square", gain: 0.08, attack: 0.005 }), 90);
}

export function playTimerTickSound() {
  playTone(920, 0.025, { type: "triangle", gain: 0.04, attack: 0.002, release: 0.02 });
}

export function playSaboteurRevealSound(isSaboteur: boolean) {
  if (isSaboteur) {
    playTone(180, 0.16, { type: "sawtooth", gain: 0.09, attack: 0.01, release: 0.12 });
    setTimeout(() => playTone(120, 0.22, { type: "sawtooth", gain: 0.08, attack: 0.01, release: 0.14 }), 120);
    return;
  }

  playTone(420, 0.08, { type: "triangle", gain: 0.07 });
  setTimeout(() => playTone(520, 0.1, { type: "triangle", gain: 0.07 }), 70);
}
