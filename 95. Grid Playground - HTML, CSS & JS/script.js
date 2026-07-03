const demo = document.getElementById('demo');
const output = document.getElementById('css-output');
const copyBtn = document.getElementById('copy');

const controls = {
  cols: document.getElementById('cols'),
  rows: document.getElementById('rows'),
  gap: document.getElementById('gap'),
  justify: document.getElementById('justify'),
  align: document.getElementById('align'),
  preset: document.getElementById('preset')
};
const vals = {
  cols: document.getElementById('cols-val'),
  rows: document.getElementById('rows-val'),
  gap: document.getElementById('gap-val')
};

const presets = {
  equal: (cols) => `repeat(${cols}, 1fr)`,
  sidebar: () => '220px 1fr',
  holy: () => '160px 1fr 160px'
};

function columnsTemplate() {
  const cols = Number(controls.cols.value);
  const preset = controls.preset.value;
  if (preset === 'sidebar') return { css: presets.sidebar(), count: 2 };
  if (preset === 'holy') return { css: presets.holy(), count: 3 };
  return { css: presets.equal(cols), count: cols };
}

function render() {
  const { css: colsCss, count: colCount } = columnsTemplate();
  const rows = Number(controls.rows.value);
  const gap = `${controls.gap.value}px`;
  const rowsCss = `repeat(${rows}, minmax(48px, auto))`;

  // Sync preset with the columns slider: presets override the count display.
  const presetActive = controls.preset.value !== 'equal';
  controls.cols.disabled = presetActive;

  demo.style.gridTemplateColumns = colsCss;
  demo.style.gridTemplateRows = rowsCss;
  demo.style.gap = gap;
  demo.style.justifyItems = controls.justify.value;
  demo.style.alignItems = controls.align.value;

  const total = colCount * rows;
  demo.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = i + 1;
    demo.appendChild(cell);
  }

  vals.cols.textContent = presetActive ? colCount : controls.cols.value;
  vals.rows.textContent = controls.rows.value;
  vals.gap.textContent = controls.gap.value;

  output.textContent =
    `.container {\n` +
    `  display: grid;\n` +
    `  grid-template-columns: ${colsCss};\n` +
    `  grid-template-rows: ${rowsCss};\n` +
    `  gap: ${gap};\n` +
    `  justify-items: ${controls.justify.value};\n` +
    `  align-items: ${controls.align.value};\n` +
    `}`;
}

Object.values(controls).forEach((el) => el.addEventListener('input', render));

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
