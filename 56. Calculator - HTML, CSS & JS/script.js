const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const keys = document.querySelector('.calculator__keys');

const state = {
  display: '0',
  firstOperand: null,
  operator: null,
  waitingForSecond: false,
};

function formatNumber(value) {
  if (typeof value === 'string') {
    if (value === 'Error') return value;
    // Keep a trailing decimal or partial input readable while typing.
    if (value.endsWith('.')) {
      return groupInteger(value.slice(0, -1)) + '.';
    }
    if (value.includes('.')) {
      const [intPart, decPart] = value.split('.');
      return groupInteger(intPart) + '.' + decPart;
    }
    return groupInteger(value);
  }
  if (!isFinite(value)) return 'Error';
  if (Number.isInteger(value) && Math.abs(value) < 1e16) {
    return value.toLocaleString('en-US');
  }
  const rounded = Number(value.toPrecision(12));
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function groupInteger(str) {
  const negative = str.startsWith('-');
  const digits = negative ? str.slice(1) : str;
  const num = Number(digits);
  if (!isFinite(num)) return str;
  return (negative ? '-' : '') + num.toLocaleString('en-US');
}

function render() {
  currentEl.textContent = formatNumber(state.display);
  if (state.operator && state.firstOperand !== null) {
    historyEl.textContent = `${formatNumber(state.firstOperand)} ${state.operator}`;
  } else {
    historyEl.textContent = '';
  }
  highlightOperator();
}

function highlightOperator() {
  document.querySelectorAll('.key--op').forEach((btn) => {
    const active = state.operator === btn.dataset.op && state.waitingForSecond;
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function inputDigit(digit) {
  if (state.display === 'Error') resetAll();
  if (state.waitingForSecond) {
    state.display = digit;
    state.waitingForSecond = false;
  } else if (state.display === '0') {
    state.display = digit;
  } else if (state.display.replace(/[^0-9]/g, '').length < 15) {
    state.display += digit;
  }
  render();
}

function inputDecimal() {
  if (state.display === 'Error') resetAll();
  if (state.waitingForSecond) {
    state.display = '0.';
    state.waitingForSecond = false;
    render();
    return;
  }
  if (!state.display.includes('.')) {
    state.display += '.';
  }
  render();
}

function compute(a, b, operator) {
  switch (operator) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function chooseOperator(nextOperator) {
  if (state.display === 'Error') return;
  const inputValue = Number(state.display);

  if (state.operator && state.waitingForSecond) {
    // Allow swapping the pending operator before entering the second operand.
    state.operator = nextOperator;
    render();
    return;
  }

  if (state.firstOperand === null) {
    state.firstOperand = inputValue;
  } else if (state.operator) {
    const result = compute(state.firstOperand, inputValue, state.operator);
    if (!isFinite(result)) return showError();
    state.firstOperand = result;
    state.display = String(result);
  }

  state.operator = nextOperator;
  state.waitingForSecond = true;
  render();
}

function equals() {
  if (state.operator === null || state.firstOperand === null) return;
  if (state.waitingForSecond) return;
  const inputValue = Number(state.display);
  const result = compute(state.firstOperand, inputValue, state.operator);
  if (!isFinite(result)) return showError();
  historyEl.textContent =
    `${formatNumber(state.firstOperand)} ${state.operator} ${formatNumber(inputValue)} =`;
  state.display = String(result);
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecond = false;
  currentEl.textContent = formatNumber(state.display);
  highlightOperator();
}

function percent() {
  if (state.display === 'Error') return;
  const value = Number(state.display) / 100;
  state.display = String(value);
  render();
}

function del() {
  if (state.display === 'Error') { resetAll(); render(); return; }
  if (state.waitingForSecond) return;
  const d = state.display;
  if (d.length <= 1 || (d.length === 2 && d.startsWith('-'))) {
    state.display = '0';
  } else {
    state.display = d.slice(0, -1);
  }
  render();
}

function resetAll() {
  state.display = '0';
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecond = false;
}

function clear() {
  resetAll();
  render();
}

function showError() {
  resetAll();
  state.display = 'Error';
  render();
  setTimeout(() => {
    if (state.display === 'Error') { resetAll(); render(); }
  }, 1000);
}

keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const { action, value, op } = btn.dataset;
  switch (action) {
    case 'number': inputDigit(value); break;
    case 'decimal': inputDecimal(); break;
    case 'operator': chooseOperator(op); break;
    case 'equals': equals(); break;
    case 'clear': clear(); break;
    case 'delete': del(); break;
    case 'percent': percent(); break;
  }
});

const keyMap = { '*': '×', '/': '÷', '-': '−', '+': '+' };

window.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k >= '0' && k <= '9') { inputDigit(k); return; }
  if (k === '.') { inputDecimal(); return; }
  if (k in keyMap) { e.preventDefault(); chooseOperator(keyMap[k]); return; }
  if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); return; }
  if (k === 'Backspace') { del(); return; }
  if (k === 'Escape') { clear(); return; }
  if (k === '%') { percent(); return; }
});

render();
