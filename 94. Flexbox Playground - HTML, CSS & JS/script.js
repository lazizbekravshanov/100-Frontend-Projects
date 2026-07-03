const demo = document.getElementById('demo');
const output = document.getElementById('css-output');
const copyBtn = document.getElementById('copy');
const addBtn = document.getElementById('add-item');
const removeBtn = document.getElementById('remove-item');
const gapVal = document.getElementById('gap-val');

const controls = {
  direction: document.getElementById('direction'),
  justify: document.getElementById('justify'),
  align: document.getElementById('align'),
  wrap: document.getElementById('wrap'),
  gap: document.getElementById('gap')
};

function render() {
  const styles = {
    'flex-direction': controls.direction.value,
    'justify-content': controls.justify.value,
    'align-items': controls.align.value,
    'flex-wrap': controls.wrap.value,
    gap: `${controls.gap.value}px`
  };

  demo.style.flexDirection = styles['flex-direction'];
  demo.style.justifyContent = styles['justify-content'];
  demo.style.alignItems = styles['align-items'];
  demo.style.flexWrap = styles['flex-wrap'];
  demo.style.gap = styles.gap;

  gapVal.textContent = controls.gap.value;

  const body = Object.entries(styles)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');
  output.textContent = `.container {\n  display: flex;\n${body}\n}`;
}

Object.values(controls).forEach((el) => el.addEventListener('input', render));

addBtn.addEventListener('click', () => {
  const item = document.createElement('div');
  item.className = 'item';
  item.textContent = demo.children.length + 1;
  demo.appendChild(item);
});

removeBtn.addEventListener('click', () => {
  if (demo.children.length > 1) {
    demo.removeChild(demo.lastElementChild);
  }
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
