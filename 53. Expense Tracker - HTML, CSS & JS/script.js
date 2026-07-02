const STORAGE_KEY = 'expense-tracker.transactions';

const form = document.getElementById('tx-form');
const labelInput = document.getElementById('label');
const amountInput = document.getElementById('amount');
const list = document.getElementById('tx-list');
const emptyState = document.getElementById('empty-state');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income-total');
const expenseEl = document.getElementById('expense-total');

let transactions = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function money(value) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function render() {
  list.innerHTML = '';

  transactions.forEach((tx) => {
    const li = document.createElement('li');
    li.className = 'tx tx--' + tx.type;

    const label = document.createElement('span');
    label.className = 'tx__label';
    label.textContent = tx.label;

    const amount = document.createElement('span');
    amount.className = 'tx__amount';
    const sign = tx.type === 'income' ? '+' : '−';
    amount.textContent = `${sign} ${money(tx.amount)}`;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'tx__delete';
    del.setAttribute('aria-label', `Delete ${tx.label}`);
    del.textContent = '×';
    del.addEventListener('click', () => remove(tx.id));

    li.append(label, amount, del);
    list.appendChild(li);
  });

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  balanceEl.textContent = money(balance);
  balanceEl.classList.toggle('is-negative', balance < 0);
  incomeEl.textContent = money(income);
  expenseEl.textContent = money(expense);

  emptyState.hidden = transactions.length > 0;
}

function remove(id) {
  transactions = transactions.filter((t) => t.id !== id);
  save();
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const label = labelInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = form.querySelector('input[name="type"]:checked').value;

  if (!label || !Number.isFinite(amount) || amount <= 0) return;

  transactions.unshift({ id: uid(), label, amount, type });
  save();
  render();

  form.reset();
  form.querySelector('input[value="expense"]').checked = true;
  labelInput.focus();
});

render();
