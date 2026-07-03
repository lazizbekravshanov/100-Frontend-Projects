const swatch = document.getElementById('swatch');
const angleField = document.getElementById('angle-field');
const angleInput = document.getElementById('angle');
const angleVal = document.getElementById('angle-val');
const track = document.getElementById('track');
const stopsList = document.getElementById('stops');
const output = document.getElementById('css-output');
const addStopBtn = document.getElementById('add-stop');
const randomBtn = document.getElementById('random');
const copyBtn = document.getElementById('copy');
const typeButtons = Array.from(document.querySelectorAll('.toggle__btn'));

const state = {
  type: 'linear',
  angle: 90,
  stops: [
    { color: '#7c3aed', pos: 0 },
    { color: '#2563eb', pos: 100 }
  ],
  selected: 0
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function sortedStops() {
  return state.stops
    .map((s, i) => ({ ...s, i }))
    .sort((a, b) => a.pos - b.pos);
}

function gradientCss() {
  const stops = sortedStops()
    .map((s) => `${s.color} ${Math.round(s.pos)}%`)
    .join(', ');
  return state.type === 'linear'
    ? `linear-gradient(${state.angle}deg, ${stops})`
    : `radial-gradient(circle at center, ${stops})`;
}

function renderHandles() {
  track.querySelectorAll('.handle').forEach((h) => h.remove());
  state.stops.forEach((stop, i) => {
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'handle' + (i === state.selected ? ' is-selected' : '');
    handle.style.left = `${stop.pos}%`;
    handle.style.background = stop.color;
    handle.setAttribute('aria-label', `Color stop at ${Math.round(stop.pos)}%`);
    handle.addEventListener('pointerdown', (e) => startDrag(e, i));
    track.appendChild(handle);
  });
}

function renderStops() {
  stopsList.innerHTML = '';
  const canRemove = state.stops.length > 2;
  state.stops.forEach((stop, i) => {
    const li = document.createElement('li');
    li.className = 'stop';

    const color = document.createElement('input');
    color.type = 'color';
    color.value = stop.color;
    color.setAttribute('aria-label', 'Stop color');
    color.addEventListener('input', () => {
      stop.color = color.value;
      state.selected = i;
      render();
    });

    const posText = document.createElement('span');
    posText.className = 'stop__pos';
    posText.textContent = `Stop ${i + 1}`;

    const posInput = document.createElement('input');
    posInput.type = 'number';
    posInput.className = 'stop__pos-input';
    posInput.min = '0';
    posInput.max = '100';
    posInput.value = Math.round(stop.pos);
    posInput.setAttribute('aria-label', 'Stop position percent');
    posInput.addEventListener('input', () => {
      stop.pos = clamp(Number(posInput.value) || 0, 0, 100);
      state.selected = i;
      render();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'stop__remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Remove stop');
    remove.disabled = !canRemove;
    remove.addEventListener('click', () => {
      if (state.stops.length <= 2) return;
      state.stops.splice(i, 1);
      state.selected = clamp(state.selected, 0, state.stops.length - 1);
      render();
    });

    li.append(color, posText, posInput, remove);
    stopsList.appendChild(li);
  });
}

function render() {
  const css = gradientCss();
  swatch.style.background = css;
  output.textContent = `background: ${css};`;
  angleField.style.display = state.type === 'linear' ? '' : 'none';
  angleVal.textContent = state.angle;
  renderHandles();
  renderStops();
}

function startDrag(e, index) {
  e.preventDefault();
  state.selected = index;
  const rect = track.getBoundingClientRect();
  const move = (ev) => {
    const pos = clamp(((ev.clientX - rect.left) / rect.width) * 100, 0, 100);
    state.stops[index].pos = pos;
    render();
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  render();
}

track.addEventListener('pointerdown', (e) => {
  if (e.target !== track) return;
  const rect = track.getBoundingClientRect();
  const pos = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
  const neighbour = sortedStops().find((s) => s.pos >= pos) || state.stops[0];
  state.stops.push({ color: neighbour.color, pos });
  state.selected = state.stops.length - 1;
  render();
});

typeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    typeButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
    state.type = btn.dataset.type;
    render();
  });
});

angleInput.addEventListener('input', () => {
  state.angle = Number(angleInput.value);
  render();
});

addStopBtn.addEventListener('click', () => {
  const s = sortedStops();
  const mid = s.length ? (s[0].pos + s[s.length - 1].pos) / 2 : 50;
  state.stops.push({ color: randomColor(), pos: mid });
  state.selected = state.stops.length - 1;
  render();
});

function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 60 + Math.floor(Math.random() * 30);
  const l = 45 + Math.floor(Math.random() * 20);
  return hslToHex(h, s, l);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

randomBtn.addEventListener('click', () => {
  const count = 2 + Math.floor(Math.random() * 3);
  state.stops = Array.from({ length: count }, (_, i) => ({
    color: randomColor(),
    pos: Math.round((i / (count - 1)) * 100)
  }));
  state.angle = Math.floor(Math.random() * 361);
  angleInput.value = state.angle;
  state.selected = 0;
  render();
});

copyBtn.addEventListener('click', async () => {
  const text = output.textContent;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  const original = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = original), 1400);
});

render();
