const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

const el = {
  password: document.getElementById('password'),
  copyBtn: document.getElementById('copyBtn'),
  copyStatus: document.getElementById('copyStatus'),
  strength: document.querySelector('.strength'),
  strengthLabel: document.getElementById('strengthLabel'),
  length: document.getElementById('length'),
  lengthValue: document.getElementById('lengthValue'),
  uppercase: document.getElementById('uppercase'),
  lowercase: document.getElementById('lowercase'),
  numbers: document.getElementById('numbers'),
  symbols: document.getElementById('symbols'),
  generateBtn: document.getElementById('generateBtn'),
};

let currentPassword = '';

function randomInt(max) {
  // Rejection sampling with crypto for an unbiased index in [0, max).
  const array = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let value;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

function activePools() {
  return ['uppercase', 'lowercase', 'numbers', 'symbols']
    .filter((key) => el[key].checked)
    .map((key) => CHARSETS[key]);
}

function generate() {
  const pools = activePools();
  if (pools.length === 0) {
    currentPassword = '';
    el.password.textContent = 'Select at least one option';
    updateStrength();
    return;
  }

  const length = Number(el.length.value);
  const all = pools.join('');
  const chars = [];

  // Guarantee at least one character from each selected pool.
  pools.forEach((pool) => {
    chars.push(pool[randomInt(pool.length)]);
  });
  while (chars.length < length) {
    chars.push(all[randomInt(all.length)]);
  }

  // Fisher–Yates shuffle so guaranteed chars are not front-loaded.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  currentPassword = chars.slice(0, length).join('');
  el.password.textContent = currentPassword;
  resetCopyState();
  updateStrength();
}

function updateStrength() {
  if (!currentPassword) {
    el.strength.removeAttribute('data-level');
    el.strengthLabel.textContent = '—';
    return;
  }
  const length = currentPassword.length;
  const poolCount = activePools().length;
  let score = 0;
  if (length >= 8) score++;
  if (length >= 14) score++;
  if (length >= 20) score++;
  if (poolCount >= 3) score++;
  if (poolCount === 4) score++;

  let level;
  let label;
  if (length < 8 || score <= 1) { level = 1; label = 'Weak'; }
  else if (score === 2) { level = 2; label = 'Fair'; }
  else if (score === 3 || score === 4) { level = 3; label = 'Good'; }
  else { level = 4; label = 'Strong'; }

  el.strength.setAttribute('data-level', String(level));
  el.strengthLabel.textContent = label;
}

async function copyPassword() {
  if (!currentPassword) return;
  try {
    await navigator.clipboard.writeText(currentPassword);
  } catch {
    // Fallback for browsers without async clipboard access (e.g. file://).
    const temp = document.createElement('textarea');
    temp.value = currentPassword;
    temp.setAttribute('readonly', '');
    temp.style.position = 'absolute';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
  }
  el.copyBtn.classList.add('is-copied');
  el.copyStatus.textContent = 'Copied to clipboard';
  setTimeout(resetCopyState, 1800);
}

function resetCopyState() {
  el.copyBtn.classList.remove('is-copied');
  el.copyStatus.textContent = '';
}

el.length.addEventListener('input', () => {
  el.lengthValue.textContent = el.length.value;
});
el.length.addEventListener('change', generate);
['uppercase', 'lowercase', 'numbers', 'symbols'].forEach((key) => {
  el[key].addEventListener('change', generate);
});
el.generateBtn.addEventListener('click', generate);
el.copyBtn.addEventListener('click', copyPassword);

generate();
