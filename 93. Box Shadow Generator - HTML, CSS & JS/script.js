const previewBox = document.getElementById('preview-box');
const layersList = document.getElementById('layers');
const output = document.getElementById('css-output');
const addLayerBtn = document.getElementById('add-layer');
const copyBtn = document.getElementById('copy');

const inputs = {
  x: document.getElementById('x'),
  y: document.getElementById('y'),
  blur: document.getElementById('blur'),
  spread: document.getElementById('spread'),
  color: document.getElementById('color'),
  opacity: document.getElementById('opacity'),
  inset: document.getElementById('inset')
};
const vals = {
  x: document.getElementById('x-val'),
  y: document.getElementById('y-val'),
  blur: document.getElementById('blur-val'),
  spread: document.getElementById('spread-val'),
  opacity: document.getElementById('opacity-val')
};

let layers = [
  { x: 0, y: 10, blur: 25, spread: -5, color: '#18181b', opacity: 20, inset: false }
];
let selected = 0;

function hexToRgba(hex, opacity) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
}

function layerToCss(l) {
  const inset = l.inset ? 'inset ' : '';
  return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`;
}

function shadowValue() {
  return layers.map(layerToCss).join(', ');
}

function renderPreview() {
  const value = shadowValue();
  previewBox.style.boxShadow = value;
  output.textContent = `box-shadow: ${value};`;
}

function renderLayers() {
  layersList.innerHTML = '';
  const canRemove = layers.length > 1;
  layers.forEach((l, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layer' + (i === selected ? ' is-active' : '');
    btn.setAttribute('aria-pressed', String(i === selected));

    const sw = document.createElement('span');
    sw.className = 'layer__swatch';
    sw.style.background = hexToRgba(l.color, l.opacity);

    const label = document.createElement('span');
    label.className = 'layer__label';
    label.textContent = `${l.inset ? 'inset ' : ''}${l.x}, ${l.y}, ${l.blur}, ${l.spread}`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'layer__remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove layer ${i + 1}`);
    remove.disabled = !canRemove;
    remove.addEventListener('click', (e) => {
      e.stopPropagation();
      if (layers.length <= 1) return;
      layers.splice(i, 1);
      selected = Math.min(selected, layers.length - 1);
      render();
    });

    btn.append(sw, label, remove);
    btn.addEventListener('click', () => {
      selected = i;
      render();
    });
    li.appendChild(btn);
    layersList.appendChild(li);
  });
}

function syncControls() {
  const l = layers[selected];
  inputs.x.value = l.x;
  inputs.y.value = l.y;
  inputs.blur.value = l.blur;
  inputs.spread.value = l.spread;
  inputs.color.value = l.color;
  inputs.opacity.value = l.opacity;
  inputs.inset.checked = l.inset;
  vals.x.textContent = l.x;
  vals.y.textContent = l.y;
  vals.blur.textContent = l.blur;
  vals.spread.textContent = l.spread;
  vals.opacity.textContent = l.opacity;
}

function render() {
  syncControls();
  renderLayers();
  renderPreview();
}

['x', 'y', 'blur', 'spread', 'opacity'].forEach((key) => {
  inputs[key].addEventListener('input', () => {
    layers[selected][key] = Number(inputs[key].value);
    render();
  });
});

inputs.color.addEventListener('input', () => {
  layers[selected].color = inputs.color.value;
  render();
});

inputs.inset.addEventListener('change', () => {
  layers[selected].inset = inputs.inset.checked;
  render();
});

addLayerBtn.addEventListener('click', () => {
  layers.push({ x: 0, y: 6, blur: 12, spread: 0, color: '#18181b', opacity: 15, inset: false });
  selected = layers.length - 1;
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
