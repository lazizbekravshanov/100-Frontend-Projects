const menu = document.querySelector('[data-menu]');
const trigger = menu.querySelector('.menu__trigger');
const panel = menu.querySelector('.menu__panel');

const submenu = menu.querySelector('[data-submenu]');
const subTrigger = submenu.querySelector('.submenu__trigger');
const subPanel = submenu.querySelector('.menu__panel--sub');

// Top-level menu items = direct children, treating the submenu trigger as one item.
const topItems = () =>
  Array.from(panel.children)
    .map((li) => li.querySelector('a[role="menuitem"], button[role="menuitem"]'))
    .filter(Boolean);

const subItems = () =>
  Array.from(subPanel.querySelectorAll('[role="menuitem"]'));

function openMenu() {
  panel.dataset.open = 'true';
  trigger.setAttribute('aria-expanded', 'true');
}

function closeMenu({ focusTrigger = false } = {}) {
  closeSubmenu();
  delete panel.dataset.open;
  trigger.setAttribute('aria-expanded', 'false');
  clearActive();
  if (focusTrigger) trigger.focus();
}

function openSubmenu({ focusFirst = false } = {}) {
  subPanel.dataset.open = 'true';
  subTrigger.setAttribute('aria-expanded', 'true');
  if (focusFirst) focusItem(subItems(), 0);
}

function closeSubmenu({ focusTrigger = false } = {}) {
  delete subPanel.dataset.open;
  subTrigger.setAttribute('aria-expanded', 'false');
  if (focusTrigger) subTrigger.focus();
}

const isOpen = () => panel.dataset.open === 'true';
const isSubOpen = () => subPanel.dataset.open === 'true';

function clearActive() {
  panel
    .querySelectorAll('.is-active')
    .forEach((el) => el.classList.remove('is-active'));
}

function focusItem(items, index) {
  if (!items.length) return;
  const i = (index + items.length) % items.length;
  clearActive();
  const el = items[i];
  el.classList.add('is-active');
  el.focus();
}

/* ---------- Top-level trigger ---------- */
trigger.addEventListener('click', () => {
  isOpen() ? closeMenu() : openMenu();
});

trigger.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openMenu();
    focusItem(topItems(), 0);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    openMenu();
    focusItem(topItems(), topItems().length - 1);
  }
});

/* ---------- Keyboard nav inside the panel ---------- */
panel.addEventListener('keydown', (e) => {
  const items = topItems();
  const current = items.indexOf(document.activeElement);
  const onSubTrigger = document.activeElement === subTrigger;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      focusItem(items, current + 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusItem(items, current - 1);
      break;
    case 'Home':
      e.preventDefault();
      focusItem(items, 0);
      break;
    case 'End':
      e.preventDefault();
      focusItem(items, items.length - 1);
      break;
    case 'ArrowRight':
      if (onSubTrigger) {
        e.preventDefault();
        openSubmenu({ focusFirst: true });
      }
      break;
    case 'Escape':
      e.preventDefault();
      closeMenu({ focusTrigger: true });
      break;
    case 'Tab':
      closeMenu();
      break;
  }
});

/* ---------- Submenu trigger ---------- */
subTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  isSubOpen() ? closeSubmenu() : openSubmenu();
});

subPanel.addEventListener('keydown', (e) => {
  const items = subItems();
  const current = items.indexOf(document.activeElement);

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      focusItem(items, current + 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusItem(items, current - 1);
      break;
    case 'ArrowLeft':
    case 'Escape':
      e.preventDefault();
      closeSubmenu({ focusTrigger: true });
      break;
    case 'Home':
      e.preventDefault();
      focusItem(items, 0);
      break;
    case 'End':
      e.preventDefault();
      focusItem(items, items.length - 1);
      break;
    case 'Tab':
      closeMenu();
      break;
  }
});

/* ---------- Dismiss on outside click ---------- */
document.addEventListener('click', (e) => {
  if (isOpen() && !menu.contains(e.target)) closeMenu();
});
