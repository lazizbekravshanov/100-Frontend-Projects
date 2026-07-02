const display = document.getElementById('display');
const phaseLabel = document.getElementById('phase-label');
const startPauseBtn = document.getElementById('start-pause');
const resetBtn = document.getElementById('reset');
const sessionCount = document.getElementById('session-count');
const ringProgress = document.getElementById('ring-progress');
const modeBtns = document.querySelectorAll('.modes__btn');
const workInput = document.getElementById('work-mins');
const breakInput = document.getElementById('break-mins');

const RING_LENGTH = 2 * Math.PI * 100;
ringProgress.style.strokeDasharray = RING_LENGTH.toFixed(1);

let mode = 'work';
let durations = { work: 25 * 60, break: 5 * 60 };
let remaining = durations.work;
let total = durations.work;
let running = false;
let intervalId = null;
let sessions = 0;

function readDurations() {
  const work = clamp(parseInt(workInput.value, 10), 1, 90, 25);
  const brk = clamp(parseInt(breakInput.value, 10), 1, 60, 5);
  durations = { work: work * 60, break: brk * 60 };
}

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateDisplay() {
  display.textContent = formatTime(remaining);
  const progress = total > 0 ? remaining / total : 0;
  ringProgress.style.strokeDashoffset = (RING_LENGTH * (1 - progress)).toFixed(1);
  document.title = `${formatTime(remaining)} · ${mode === 'work' ? 'Focus' : 'Break'}`;
}

function setMode(nextMode) {
  mode = nextMode;
  phaseLabel.textContent = mode === 'work' ? 'Focus' : 'Break';
  document.body.classList.toggle('is-break', mode === 'break');
  modeBtns.forEach((btn) => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  total = durations[mode];
  remaining = durations[mode];
  updateDisplay();
}

function tick() {
  remaining -= 1;
  if (remaining <= 0) {
    remaining = 0;
    updateDisplay();
    complete();
    return;
  }
  updateDisplay();
}

function start() {
  if (running) return;
  readDurations();
  if (remaining === total) {
    total = durations[mode];
    remaining = durations[mode];
  }
  running = true;
  startPauseBtn.textContent = 'Pause';
  toggleInputs(true);
  intervalId = setInterval(tick, 1000);
}

function pause() {
  running = false;
  startPauseBtn.textContent = 'Start';
  clearInterval(intervalId);
  intervalId = null;
}

function reset() {
  pause();
  readDurations();
  total = durations[mode];
  remaining = durations[mode];
  toggleInputs(false);
  updateDisplay();
}

function complete() {
  pause();
  chime();
  document.body.classList.remove('flash');
  void document.body.offsetWidth;
  document.body.classList.add('flash');

  if (mode === 'work') {
    sessions += 1;
    sessionCount.textContent = String(sessions);
    setMode('break');
  } else {
    setMode('work');
  }
  toggleInputs(false);
}

function toggleInputs(disabled) {
  workInput.disabled = disabled;
  breakInput.disabled = disabled;
}

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => ctx.close();
  } catch (err) {
    /* Audio not available; the flash still signals completion. */
  }
}

startPauseBtn.addEventListener('click', () => {
  if (running) pause();
  else start();
});

resetBtn.addEventListener('click', reset);

modeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode === mode) return;
    pause();
    readDurations();
    setMode(btn.dataset.mode);
    toggleInputs(false);
  });
});

[workInput, breakInput].forEach((input) => {
  input.addEventListener('change', () => {
    if (running) return;
    readDurations();
    total = durations[mode];
    remaining = durations[mode];
    updateDisplay();
  });
});

readDurations();
setMode('work');
