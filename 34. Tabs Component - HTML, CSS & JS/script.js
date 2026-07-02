const tablist = document.querySelector('.tabs__list');
const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
const indicator = document.querySelector('.tabs__indicator');

const moveIndicator = (tab) => {
  indicator.style.width = `${tab.offsetWidth}px`;
  indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
};

const selectTab = (tab, setFocus = true) => {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.setAttribute('tabindex', selected ? '0' : '-1');
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    panel.hidden = !selected;
  });
  moveIndicator(tab);
  if (setFocus) tab.focus();
};

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab, false));

  tab.addEventListener('keydown', (event) => {
    let targetIndex = null;
    switch (event.key) {
      case 'ArrowRight':
        targetIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        targetIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectTab(tabs[targetIndex]);
  });
});

const initial = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
moveIndicator(initial);

window.addEventListener('resize', () => {
  const active = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
  if (active) moveIndicator(active);
});
