const timeEl = document.getElementById('time');
const meridiemEl = document.getElementById('meridiem');
const dateEl = document.getElementById('date');
const dayEl = document.getElementById('day');
const toggle = document.getElementById('format-toggle');
const modeLabel = document.getElementById('mode-label');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

let is24Hour = true;

const pad = (n) => String(n).padStart(2, '0');

function render() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  let meridiem = '';

  if (!is24Hour) {
    meridiem = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }

  timeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  meridiemEl.textContent = meridiem;

  dayEl.textContent = days[now.getDay()];
  dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

function setFormat(twentyFour) {
  is24Hour = twentyFour;
  toggle.setAttribute('aria-checked', String(!is24Hour));
  modeLabel.textContent = is24Hour ? '24-hour' : '12-hour';
  render();
}

toggle.addEventListener('click', () => setFormat(!is24Hour));

setFormat(true);
setInterval(render, 1000);
