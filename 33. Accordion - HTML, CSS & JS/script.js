const accordion = document.getElementById('accordion');
const singleOpen = accordion.dataset.single === 'true';
const triggers = Array.from(accordion.querySelectorAll('.accordion__trigger'));

const getPanel = (trigger) =>
  document.getElementById(trigger.getAttribute('aria-controls'));

const openPanel = (trigger) => {
  const panel = getPanel(trigger);
  trigger.setAttribute('aria-expanded', 'true');
  panel.style.height = `${panel.scrollHeight}px`;
};

const closePanel = (trigger) => {
  const panel = getPanel(trigger);
  trigger.setAttribute('aria-expanded', 'false');
  panel.style.height = `${panel.scrollHeight}px`;
  requestAnimationFrame(() => {
    panel.style.height = '0px';
  });
};

const toggle = (trigger) => {
  const isOpen = trigger.getAttribute('aria-expanded') === 'true';
  if (isOpen) {
    closePanel(trigger);
    return;
  }
  if (singleOpen) {
    triggers.forEach((other) => {
      if (other !== trigger && other.getAttribute('aria-expanded') === 'true') {
        closePanel(other);
      }
    });
  }
  openPanel(trigger);
};

triggers.forEach((trigger, index) => {
  const panel = getPanel(trigger);

  if (trigger.getAttribute('aria-expanded') === 'true') {
    panel.style.height = `${panel.scrollHeight}px`;
  } else {
    panel.style.height = '0px';
  }

  panel.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'height') return;
    if (trigger.getAttribute('aria-expanded') === 'true') {
      panel.style.height = 'auto';
    }
  });

  trigger.addEventListener('click', () => toggle(trigger));

  trigger.addEventListener('keydown', (event) => {
    let targetIndex = null;
    switch (event.key) {
      case 'ArrowDown':
        targetIndex = (index + 1) % triggers.length;
        break;
      case 'ArrowUp':
        targetIndex = (index - 1 + triggers.length) % triggers.length;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = triggers.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    triggers[targetIndex].focus();
  });
});

window.addEventListener('resize', () => {
  triggers.forEach((trigger) => {
    if (trigger.getAttribute('aria-expanded') === 'true') {
      const panel = getPanel(trigger);
      panel.style.height = 'auto';
    }
  });
});
