const SIZE = 5;
const paletteEl = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const toastEl = document.getElementById('toast');

const LOCK_OPEN = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
const LOCK_CLOSED = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;

let colors = [];

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function luminance(hex) {
  const rgb = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function textColorFor(hex) {
  return luminance(hex) > 0.45 ? '#18181b' : '#ffffff';
}

function generatePalette() {
  // Build an analogous-with-variation scheme around one base hue for harmony.
  const baseHue = Math.floor(Math.random() * 360);
  const step = 24 + Math.floor(Math.random() * 18);
  const baseSat = 55 + Math.floor(Math.random() * 25);

  const next = [];
  for (let i = 0; i < SIZE; i++) {
    if (colors[i] && colors[i].locked) {
      next.push(colors[i]);
      continue;
    }
    const hue = (baseHue + step * (i - 2) + 360) % 360;
    const sat = clamp(baseSat + (Math.random() * 14 - 7), 40, 90);
    // Spread lightness across the row for a pleasant light-to-dark ramp.
    const light = 78 - i * 12 + (Math.random() * 6 - 3);
    const hex = hslToHex(hue, sat, clamp(light, 20, 88));
    next.push({ hex, locked: false });
  }
  colors = next;
  render();
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function render() {
  paletteEl.innerHTML = '';
  colors.forEach((color, i) => {
    const fg = textColorFor(color.hex);
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'swatch' + (color.locked ? ' is-locked' : '');
    swatch.style.background = color.hex;
    swatch.style.color = fg;
    swatch.setAttribute('aria-label', `${color.hex}, click to copy`);

    swatch.innerHTML = `
      <div class="swatch__actions">
        <span class="swatch__lock" role="button" tabindex="0"
          aria-label="${color.locked ? 'Unlock color' : 'Lock color'}"
          aria-pressed="${color.locked}">${color.locked ? LOCK_CLOSED : LOCK_OPEN}</span>
      </div>
      <span class="swatch__hex">${color.hex}</span>
      <span class="swatch__caption">Click to copy</span>`;

    swatch.addEventListener('click', (e) => {
      if (e.target.closest('.swatch__lock')) return;
      copyHex(color.hex);
    });

    const lock = swatch.querySelector('.swatch__lock');
    lock.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLock(i);
    });
    lock.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        toggleLock(i);
      }
    });

    paletteEl.appendChild(swatch);
  });
}

function toggleLock(i) {
  colors[i].locked = !colors[i].locked;
  render();
}

async function copyHex(hex) {
  try {
    await navigator.clipboard.writeText(hex);
  } catch {
    const temp = document.createElement('textarea');
    temp.value = hex;
    temp.style.position = 'absolute';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
  }
  showToast(`Copied ${hex.toUpperCase()}`);
}

let toastTimer;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 1600);
}

generateBtn.addEventListener('click', generatePalette);

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && !e.target.closest('.swatch__lock')) {
    e.preventDefault();
    generatePalette();
  }
});

generatePalette();
