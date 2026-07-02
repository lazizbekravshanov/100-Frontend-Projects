const pads = document.querySelectorAll('.pad');

let audioCtx;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Short burst of filtered white noise, used for snare/hats/clap/crash.
function noiseBuffer(ctx, duration) {
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playNoise(ctx, { duration, type, frequency, gain }) {
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx, duration);

  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(filter).connect(amp).connect(ctx.destination);
  source.start(now);
  source.stop(now + duration);
}

function playTone(ctx, { startFreq, endFreq, duration, type, gain }) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 0.0001), now + duration);

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(amp).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

const sounds = {
  kick(ctx) {
    playTone(ctx, { startFreq: 150, endFreq: 40, duration: 0.5, type: 'sine', gain: 0.9 });
  },
  snare(ctx) {
    playNoise(ctx, { duration: 0.2, type: 'highpass', frequency: 1500, gain: 0.6 });
    playTone(ctx, { startFreq: 180, endFreq: 90, duration: 0.18, type: 'triangle', gain: 0.35 });
  },
  hihat(ctx) {
    playNoise(ctx, { duration: 0.05, type: 'highpass', frequency: 8000, gain: 0.4 });
  },
  openhat(ctx) {
    playNoise(ctx, { duration: 0.35, type: 'highpass', frequency: 7000, gain: 0.4 });
  },
  clap(ctx) {
    playNoise(ctx, { duration: 0.12, type: 'bandpass', frequency: 1200, gain: 0.5 });
    playNoise(ctx, { duration: 0.2, type: 'bandpass', frequency: 1500, gain: 0.35 });
  },
  tom(ctx) {
    playTone(ctx, { startFreq: 220, endFreq: 80, duration: 0.4, type: 'sine', gain: 0.7 });
  },
  rim(ctx) {
    playTone(ctx, { startFreq: 400, endFreq: 300, duration: 0.06, type: 'square', gain: 0.4 });
  },
  cowbell(ctx) {
    playTone(ctx, { startFreq: 560, endFreq: 560, duration: 0.18, type: 'square', gain: 0.3 });
    playTone(ctx, { startFreq: 845, endFreq: 845, duration: 0.18, type: 'square', gain: 0.25 });
  },
  crash(ctx) {
    playNoise(ctx, { duration: 0.8, type: 'highpass', frequency: 5000, gain: 0.45 });
  }
};

const flashTimers = new WeakMap();

function trigger(pad) {
  const ctx = getContext();
  const sound = sounds[pad.dataset.sound];
  if (sound) sound(ctx);

  pad.classList.add('is-active');
  clearTimeout(flashTimers.get(pad));
  flashTimers.set(pad, setTimeout(() => pad.classList.remove('is-active'), 140));
}

const padByKey = new Map();
pads.forEach((pad) => {
  padByKey.set(pad.dataset.key, pad);
  pad.addEventListener('pointerdown', () => trigger(pad));
});

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const pad = padByKey.get(e.key.toLowerCase());
  if (!pad) return;
  trigger(pad);
});
