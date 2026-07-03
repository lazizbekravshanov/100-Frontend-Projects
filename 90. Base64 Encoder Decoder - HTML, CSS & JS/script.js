/*
 * Base64 Encoder / Decoder
 * UTF-8 safe: text is round-tripped through TextEncoder/TextDecoder so that
 * multi-byte characters (emoji, accents, CJK) encode and decode correctly,
 * instead of using the byte-limited btoa/atob directly on the string.
 */

const els = {
  input: document.getElementById('input'),
  output: document.getElementById('output'),
  inputLabel: document.getElementById('input-label'),
  outputLabel: document.getElementById('output-label'),
  inputCount: document.getElementById('input-count'),
  outputCount: document.getElementById('output-count'),
  error: document.getElementById('error'),
  status: document.getElementById('status'),
  modeEncode: document.getElementById('mode-encode'),
  modeDecode: document.getElementById('mode-decode'),
  file: document.getElementById('file')
};

let mode = 'encode'; // 'encode' | 'decode'

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function decodeBase64(b64) {
  const normalized = b64.trim().replace(/\s+/g, '');
  // Validate the alphabet before handing it to atob for a clearer error.
  if (normalized && !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error('Contains characters that are not valid Base64.');
  }
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = false;
}

function clearError() {
  els.error.hidden = true;
  els.error.textContent = '';
}

function setCounts() {
  const inLen = els.input.value.length;
  const outLen = els.output.value.length;
  els.inputCount.textContent = `${inLen} char${inLen === 1 ? '' : 's'}`;
  els.outputCount.textContent = `${outLen} char${outLen === 1 ? '' : 's'}`;
}

function convert() {
  const value = els.input.value;
  if (!value) {
    els.output.value = '';
    clearError();
    setCounts();
    return;
  }
  try {
    els.output.value = mode === 'encode' ? encodeBase64(value) : decodeBase64(value);
    clearError();
  } catch (err) {
    els.output.value = '';
    const label = mode === 'encode' ? 'Could not encode' : 'Invalid Base64';
    showError(`${label}: ${err.message}`);
  }
  setCounts();
}

function applyModeLabels() {
  const encoding = mode === 'encode';
  els.inputLabel.textContent = encoding ? 'Text' : 'Base64';
  els.outputLabel.textContent = encoding ? 'Base64' : 'Text';
  els.input.placeholder = encoding
    ? 'Type or paste text to encode...'
    : 'Paste Base64 to decode...';
  els.modeEncode.setAttribute('aria-selected', String(encoding));
  els.modeDecode.setAttribute('aria-selected', String(!encoding));
}

function setMode(next) {
  if (next === mode) return;
  mode = next;
  applyModeLabels();
  convert();
}

function swap() {
  const output = els.output.value;
  mode = mode === 'encode' ? 'decode' : 'encode';
  applyModeLabels();
  els.input.value = output;
  convert();
  setStatus('Swapped input and output.');
}

function setStatus(message) {
  els.status.textContent = message;
}

async function copyOutput() {
  if (!els.output.value) { setStatus('Nothing to copy yet.'); return; }
  try {
    await navigator.clipboard.writeText(els.output.value);
    setStatus('Output copied to clipboard.');
  } catch {
    setStatus('Copy failed - select the text manually.');
  }
}

function clearAll() {
  els.input.value = '';
  els.output.value = '';
  els.file.value = '';
  clearError();
  setStatus('');
  setCounts();
  els.input.focus();
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    // reader result is a data URL: strip the "data:...;base64," prefix.
    const result = String(reader.result);
    const base64 = result.slice(result.indexOf(',') + 1);
    setMode('encode');
    els.input.value = `[file: ${file.name}]`;
    els.output.value = base64;
    clearError();
    setCounts();
    setStatus(`Encoded ${file.name} (${file.size} bytes) to Base64.`);
  };
  reader.onerror = () => showError('Could not read the selected file.');
  reader.readAsDataURL(file);
}

/* Wiring */
els.input.addEventListener('input', () => { convert(); setStatus(''); });
els.modeEncode.addEventListener('click', () => setMode('encode'));
els.modeDecode.addEventListener('click', () => setMode('decode'));
document.getElementById('swap-btn').addEventListener('click', swap);
document.getElementById('copy-btn').addEventListener('click', copyOutput);
document.getElementById('clear-btn').addEventListener('click', clearAll);
els.file.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

/* Initial demo content */
applyModeLabels();
els.input.value = 'Hello, world! Café · 日本語 · 🚀';
convert();
