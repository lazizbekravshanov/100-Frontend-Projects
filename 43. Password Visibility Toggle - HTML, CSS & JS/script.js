const EYE_OPEN = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`;

const EYE_OFF = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-6.5 0-10-8-10-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <path d="M9.9 9.9a3 3 0 0 0 4.24 4.24"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>`;

const LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

function setupToggle(button) {
  const targetId = button.dataset.toggle;
  const input = document.getElementById(targetId);
  const icon = button.querySelector('[data-icon]');
  icon.innerHTML = EYE_OFF;

  button.addEventListener('click', () => {
    const willShow = input.type === 'password';
    input.type = willShow ? 'text' : 'password';
    icon.innerHTML = willShow ? EYE_OPEN : EYE_OFF;
    button.setAttribute('aria-pressed', String(willShow));
    button.setAttribute('aria-label', willShow ? 'Hide password' : 'Show password');
    input.focus();
  });
}

function scorePassword(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(4, score);
}

function setupStrength() {
  const input = document.getElementById('password');
  const wrap = document.querySelector('[data-strength]');
  const bar = wrap.querySelector('[data-bar]');
  const text = wrap.querySelector('[data-strength-text]');

  input.addEventListener('input', () => {
    const value = input.value;
    if (!value) {
      wrap.hidden = true;
      bar.removeAttribute('data-level');
      text.textContent = '';
      return;
    }
    const level = scorePassword(value);
    wrap.hidden = false;
    if (level === 0) {
      bar.removeAttribute('data-level');
    } else {
      bar.setAttribute('data-level', String(level));
    }
    text.textContent = `Password strength: ${LABELS[level]}`;
  });
}

function setupForm() {
  const form = document.querySelector('.form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password');
    const confirm = document.getElementById('confirm');
    if (password.value && password.value === confirm.value) {
      form.reset();
      document.querySelectorAll('[data-strength]').forEach((el) => (el.hidden = true));
    }
  });
}

document.querySelectorAll('[data-toggle]').forEach(setupToggle);
setupStrength();
setupForm();
