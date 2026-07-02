const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const form = document.getElementById('inviteForm');

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let lastFocused = null;

const getFocusable = () =>
  Array.from(modal.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
  );

const openModal = () => {
  lastFocused = document.activeElement;
  overlay.hidden = false;
  document.body.classList.add('is-locked');
  requestAnimationFrame(() => overlay.classList.add('is-open'));

  const focusable = getFocusable();
  const first = modal.querySelector('#email') || focusable[0];
  if (first) first.focus();

  document.addEventListener('keydown', onKeydown);
};

const closeModal = () => {
  overlay.classList.remove('is-open');
  document.removeEventListener('keydown', onKeydown);

  const finish = () => {
    overlay.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    overlay.removeEventListener('transitionend', finish);
  };
  overlay.addEventListener('transitionend', finish);
};

const onKeydown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
    return;
  }
  if (event.key === 'Tab') {
    const focusable = getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
};

openBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

overlay.addEventListener('mousedown', (event) => {
  if (event.target === overlay) {
    closeModal();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  closeModal();
  form.reset();
});
