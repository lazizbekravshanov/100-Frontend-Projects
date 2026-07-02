const COPY_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`;

const CHECK_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5"/>
  </svg>`;

const toast = document.getElementById('toast');
let toastTimer;

function showToast(message, isError) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle('toast--error', Boolean(isError));
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => {
      toast.hidden = true;
    }, 200);
  }, 1800);
}

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '-9999px';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (err) {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      return fallbackCopy(text);
    }
  }
  return fallbackCopy(text);
}

function getTargetText(button) {
  const container = button.closest('.snippet__body, .field__wrap, .quote');
  const target = container.querySelector('[data-copy-target]');
  if (!target) return '';
  const value = target.value !== undefined && target.value !== ''
    ? target.value
    : target.textContent;
  return value.trim();
}

function flashButton(button) {
  const icon = button.querySelector('[data-icon]');
  const label = button.querySelector('.copy__text');
  const originalLabel = label.textContent;

  button.classList.add('is-copied');
  icon.innerHTML = CHECK_ICON;
  label.textContent = 'Copied';

  setTimeout(() => {
    button.classList.remove('is-copied');
    icon.innerHTML = COPY_ICON;
    label.textContent = originalLabel;
  }, 1600);
}

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.querySelector('[data-icon]').innerHTML = COPY_ICON;

  button.addEventListener('click', async () => {
    const text = getTargetText(button);
    if (!text) return;
    const ok = await copyText(text);
    if (ok) {
      flashButton(button);
      showToast('Copied to clipboard');
    } else {
      showToast('Copy failed — press Ctrl/Cmd + C', true);
    }
  });
});
