/*
 * JSON Formatter - prettify, minify, validate and explore JSON.
 * Validation reports a line/column derived from the parser error position.
 */

const els = {
  input: document.getElementById('input'),
  output: document.getElementById('output'),
  tree: document.getElementById('tree'),
  status: document.getElementById('status'),
  indent: document.getElementById('indent'),
  tabText: document.getElementById('tab-text'),
  tabTree: document.getElementById('tab-tree')
};

const SAMPLE = {
  name: 'Dispatch API',
  version: 2.4,
  active: true,
  tags: ['news', 'json', 'demo'],
  limits: { requestsPerMinute: 120, burst: null },
  endpoints: [
    { path: '/articles', method: 'GET', cached: true },
    { path: '/subscribe', method: 'POST', cached: false }
  ]
};

let lastValue = null; // last successfully parsed value

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getIndent() {
  const v = els.indent.value;
  return v === 'tab' ? '\t' : Number(v);
}

// Derive a 1-based line/column from a character offset.
function lineInfo(text, offset) {
  const upto = text.slice(0, offset);
  const line = upto.split('\n').length;
  const col = offset - upto.lastIndexOf('\n');
  return { line, col };
}

// Try to extract a numeric position from a native SyntaxError message.
function errorPosition(text, message) {
  const posMatch = message.match(/position (\d+)/i);
  if (posMatch) return lineInfo(text, Number(posMatch[1]));
  const lineMatch = message.match(/line (\d+) column (\d+)/i);
  if (lineMatch) return { line: Number(lineMatch[1]), col: Number(lineMatch[2]) };
  return null;
}

function setStatus(message, isError) {
  els.status.textContent = message;
  els.status.classList.toggle('status--error', Boolean(isError));
}

function parseInput() {
  const text = els.input.value.trim();
  if (!text) {
    setStatus('Nothing to parse yet.', false);
    return { ok: false };
  }
  try {
    const value = JSON.parse(text);
    lastValue = value;
    return { ok: true, value };
  } catch (err) {
    const pos = errorPosition(els.input.value, err.message);
    const where = pos ? ` (line ${pos.line}, column ${pos.col})` : '';
    setStatus(`Invalid JSON: ${err.message}${where}`, true);
    return { ok: false };
  }
}

// Highlight a pretty-printed JSON string with span tokens.
function highlight(json) {
  const escaped = escapeHtml(json);
  return escaped.replace(
    /("(\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (match, str, _inner, colon) => {
      if (str) {
        const cls = colon ? 'tok-key' : 'tok-string';
        return `<span class="${cls}">${str}</span>${colon || ''}`;
      }
      if (match === 'true' || match === 'false') return `<span class="tok-boolean">${match}</span>`;
      if (match === 'null') return `<span class="tok-null">${match}</span>`;
      return `<span class="tok-number">${match}</span>`;
    }
  );
}

function renderText(value) {
  const pretty = JSON.stringify(value, null, getIndent());
  els.output.innerHTML = highlight(pretty);
}

function preview(value) {
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (value && typeof value === 'object') return `Object(${Object.keys(value).length})`;
  return '';
}

function leafHtml(value) {
  if (value === null) return `<span class="tok-null">null</span>`;
  const type = typeof value;
  if (type === 'string') return `<span class="tok-string">"${escapeHtml(value)}"</span>`;
  if (type === 'number') return `<span class="tok-number">${value}</span>`;
  if (type === 'boolean') return `<span class="tok-boolean">${value}</span>`;
  return escapeHtml(String(value));
}

function buildNode(key, value) {
  const li = document.createElement('li');
  const isObject = value && typeof value === 'object';
  const keyHtml = key !== null ? `<span class="node__key">${escapeHtml(key)}</span>: ` : '';

  if (!isObject) {
    li.className = 'node--leaf';
    li.innerHTML = `${keyHtml}${leafHtml(value)}`;
    return li;
  }

  const entries = Array.isArray(value)
    ? value.map((v, idx) => [String(idx), v])
    : Object.entries(value);

  const toggle = document.createElement('button');
  toggle.className = 'node__toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'true');
  toggle.textContent = '▾';

  const label = document.createElement('span');
  label.innerHTML = `${keyHtml}<span class="node__preview">${preview(value)}</span>`;

  const childList = document.createElement('ul');
  entries.forEach(([k, v]) => childList.appendChild(buildNode(k, v)));

  toggle.addEventListener('click', () => {
    const collapsed = li.classList.toggle('node--collapsed');
    toggle.textContent = collapsed ? '▸' : '▾';
    toggle.setAttribute('aria-expanded', String(!collapsed));
  });

  li.appendChild(toggle);
  li.appendChild(label);
  li.appendChild(childList);
  return li;
}

function renderTree(value) {
  const root = document.createElement('ul');
  root.appendChild(buildNode(null, value));
  els.tree.replaceChildren(root);
}

function isTreeActive() {
  return els.tabTree.getAttribute('aria-selected') === 'true';
}

function refreshOutput() {
  if (lastValue === null && els.input.value.trim() === '') return;
  if (lastValue === null) return;
  if (isTreeActive()) renderTree(lastValue);
  else renderText(lastValue);
}

/* Actions */
function format() {
  const res = parseInput();
  if (!res.ok) return;
  const pretty = JSON.stringify(res.value, null, getIndent());
  els.input.value = pretty;
  renderText(res.value);
  if (isTreeActive()) renderTree(res.value);
  setStatus('Formatted successfully.', false);
}

function minify() {
  const res = parseInput();
  if (!res.ok) return;
  const min = JSON.stringify(res.value);
  els.input.value = min;
  els.output.innerHTML = highlight(min);
  if (isTreeActive()) renderTree(res.value);
  setStatus(`Minified to ${min.length} characters.`, false);
}

function validate() {
  const res = parseInput();
  if (res.ok) setStatus('Valid JSON.', false);
}

function clearAll() {
  els.input.value = '';
  els.output.innerHTML = '';
  els.tree.replaceChildren();
  lastValue = null;
  setStatus('', false);
  els.input.focus();
}

async function copyOutput() {
  const text = isTreeActive()
    ? (lastValue !== null ? JSON.stringify(lastValue, null, getIndent()) : '')
    : els.output.textContent;
  if (!text) { setStatus('Nothing to copy.', false); return; }
  try {
    await navigator.clipboard.writeText(text);
    setStatus('Output copied to clipboard.', false);
  } catch {
    setStatus('Copy failed - select the text manually.', true);
  }
}

function switchTab(tree) {
  els.tabTree.setAttribute('aria-selected', String(tree));
  els.tabText.setAttribute('aria-selected', String(!tree));
  els.tree.hidden = !tree;
  els.output.hidden = tree;
  refreshOutput();
}

/* Wiring */
document.getElementById('format-btn').addEventListener('click', format);
document.getElementById('minify-btn').addEventListener('click', minify);
document.getElementById('validate-btn').addEventListener('click', validate);
document.getElementById('clear-btn').addEventListener('click', clearAll);
document.getElementById('copy-btn').addEventListener('click', copyOutput);
document.getElementById('sample-btn').addEventListener('click', () => {
  els.input.value = JSON.stringify(SAMPLE, null, getIndent());
  format();
});
els.tabText.addEventListener('click', () => switchTab(false));
els.tabTree.addEventListener('click', () => switchTab(true));
els.indent.addEventListener('change', () => { if (lastValue !== null && !isTreeActive()) renderText(lastValue); });

els.input.value = JSON.stringify(SAMPLE, null, 2);
format();
