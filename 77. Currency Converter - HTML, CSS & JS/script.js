const amountEl = document.getElementById('amount');
const fromEl = document.getElementById('from');
const toEl = document.getElementById('to');
const swapEl = document.getElementById('swap');
const statusEl = document.getElementById('status');
const resultBody = document.getElementById('result-body');
const convertedEl = document.getElementById('converted');
const rateEl = document.getElementById('rate');
const dateEl = document.getElementById('date');

const API = 'https://api.frankfurter.app';

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.hidden = !message;
  statusEl.classList.toggle('result__status--error', isError);
  resultBody.hidden = Boolean(message);
};

const money = (value, currency) =>
  new Intl.NumberFormat('en', { style: 'currency', currency }).format(value);

async function loadCurrencies() {
  setStatus('Loading currencies…');
  try {
    const res = await fetch(`${API}/currencies`);
    if (!res.ok) throw new Error('Could not load currency list.');
    const currencies = await res.json();
    const options = Object.entries(currencies)
      .map(([code, name]) => `<option value="${code}">${code} — ${name}</option>`)
      .join('');
    fromEl.innerHTML = options;
    toEl.innerHTML = options;
    fromEl.value = 'USD';
    toEl.value = 'EUR';
    await convert();
  } catch (err) {
    setStatus(err.message || 'Failed to load currencies.', true);
  }
}

async function convert() {
  const amount = parseFloat(amountEl.value);
  const from = fromEl.value;
  const to = toEl.value;

  if (!Number.isFinite(amount) || amount < 0) {
    setStatus('Enter a valid amount.', true);
    return;
  }
  if (!from || !to) return;

  if (from === to) {
    convertedEl.textContent = money(amount, to);
    rateEl.textContent = `1 ${from} = 1.0000 ${to}`;
    dateEl.textContent = 'Same currency';
    setStatus('');
    return;
  }

  setStatus('Converting…');
  try {
    const res = await fetch(`${API}/latest?amount=${amount}&from=${from}&to=${to}`);
    if (!res.ok) throw new Error('Conversion request failed.');
    const data = await res.json();
    const value = data.rates[to];
    const unitRate = value / amount;
    convertedEl.textContent = money(value, to);
    rateEl.textContent = `1 ${from} = ${unitRate.toFixed(4)} ${to}`;
    dateEl.textContent = `Rate as of ${data.date}`;
    setStatus('');
  } catch (err) {
    setStatus(err.message || 'Something went wrong. Please try again.', true);
  }
}

let debounce;
const scheduleConvert = () => {
  clearTimeout(debounce);
  debounce = setTimeout(convert, 250);
};

amountEl.addEventListener('input', scheduleConvert);
fromEl.addEventListener('change', convert);
toEl.addEventListener('change', convert);
swapEl.addEventListener('click', () => {
  [fromEl.value, toEl.value] = [toEl.value, fromEl.value];
  convert();
});

loadCurrencies();
