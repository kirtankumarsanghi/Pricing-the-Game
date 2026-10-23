import type { Tone } from "./game";

let audioContext: AudioContext | null = null;
let muted = false;

export function setSoundMuted(value: boolean): void {
  muted = value;
}

function getContext(): AudioContext | null {
  if (muted || typeof window === "undefined") return null;
  try {
    if (!audioContext) {
      const Ctor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      audioContext = new Ctor();
    }
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

interface NoteOptions {
  freq: number;
  duration: number;
  offset?: number;
  type?: OscillatorType;
  volume?: number;
  slideTo?: number;
}

function note(options: NoteOptions): void {
  const ctx = getContext();
  if (!ctx) return;
  const {
    freq,
    duration,
    offset = 0,
    type = "sine",
    volume = 0.045,
    slideTo,
  } = options;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + offset;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), start + duration);
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function noiseBurst(volume = 0.035, duration = 0.055): void {
  const ctx = getContext();
  if (!ctx) return;
  const size = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / size);
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  filter.Q.value = 0.8;
  gain.gain.value = volume;
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export function playSound(tone: Tone): void {
  if (muted) return;
  switch (tone) {
    case "click":
      note({ freq: 620, duration: 0.03, type: "square", volume: 0.022 });
      noiseBurst(0.015, 0.025);
      break;
    case "cash":
      note({ freq: 880, duration: 0.07, type: "triangle", volume: 0.035 });
      note({ freq: 1174, duration: 0.1, offset: 0.07, type: "triangle", volume: 0.03 });
      break;
    case "win":
      note({ freq: 523.25, duration: 0.15, type: "sine", volume: 0.04 });
      note({ freq: 659.25, duration: 0.16, offset: 0.09, type: "sine", volume: 0.038 });
      note({ freq: 783.99, duration: 0.25, offset: 0.18, type: "sine", volume: 0.04 });
      break;
    case "war":
      note({
        freq: 155,
        duration: 0.28,
        type: "sawtooth",
        volume: 0.03,
        slideTo: 82,
      });
      note({ freq: 108, duration: 0.3, offset: 0.04, type: "square", volume: 0.018 });
      break;
    case "coin":
      note({ freq: 1320, duration: 0.05, type: "square", volume: 0.02 });
      note({ freq: 1760, duration: 0.08, offset: 0.055, type: "triangle", volume: 0.024 });
      note({ freq: 2217, duration: 0.08, offset: 0.12, type: "sine", volume: 0.015 });
      break;
    case "stamp":
      noiseBurst(0.06, 0.06);
      note({ freq: 92, duration: 0.13, offset: 0.01, type: "sine", volume: 0.05 });
      break;
  }
}
