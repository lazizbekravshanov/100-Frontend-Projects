const billInput = document.getElementById('bill');
const peopleInput = document.getElementById('people');
const customTip = document.getElementById('custom-tip');
const presets = document.getElementById('presets');
const presetButtons = presets.querySelectorAll('.preset[data-tip]');

const billError = document.getElementById('bill-error');
const peopleError = document.getElementById('people-error');

const tipAmountEl = document.getElementById('tip-amount');
const totalEl = document.getElementById('total');
const perPersonEl = document.getElementById('per-person');

let tipPercent = 18;

const money = (n) => `$${n.toFixed(2)}`;

function clearActivePresets() {
  presetButtons.forEach((b) => b.classList.remove('is-active'));
}

function calculate() {
  const bill = parseFloat(billInput.value);
  const people = parseInt(peopleInput.value, 10);

  const billValid = !Number.isNaN(bill) && bill >= 0;
  const peopleValid = !Number.isNaN(people) && people >= 1;

  billError.textContent = billInput.value !== '' && !billValid ? 'Enter a valid amount.' : '';
  billInput.parentElement.classList.toggle('is-invalid', billInput.value !== '' && !billValid);

  peopleError.textContent = !peopleValid ? 'At least 1 person required.' : '';
  peopleInput.parentElement.classList.toggle('is-invalid', !peopleValid);

  if (!billValid || !peopleValid) {
    tipAmountEl.textContent = money(0);
    totalEl.textContent = money(0);
    perPersonEl.textContent = money(0);
    return;
  }

  const tipTotal = bill * (tipPercent / 100);
  const total = bill + tipTotal;

  tipAmountEl.textContent = money(tipTotal);
  totalEl.textContent = money(total);
  perPersonEl.textContent = money(total / people);
}

presetButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tipPercent = parseFloat(btn.dataset.tip);
    clearActivePresets();
    btn.classList.add('is-active');
    customTip.value = '';
    calculate();
  });
});

customTip.addEventListener('input', () => {
  const value = parseFloat(customTip.value);
  if (!Number.isNaN(value) && value >= 0) {
    tipPercent = value;
    clearActivePresets();
  }
  calculate();
});

billInput.addEventListener('input', calculate);
peopleInput.addEventListener('input', calculate);

calculate();
