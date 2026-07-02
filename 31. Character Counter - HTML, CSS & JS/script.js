const counter = document.querySelector('.counter');
const textarea = document.getElementById('message');
const charCountEl = document.getElementById('charCount');
const wordCountEl = document.getElementById('wordCount');
const remainingEl = document.getElementById('remainingCount');
const usedEl = document.getElementById('usedCount');
const limitLabelEl = document.getElementById('limitLabel');
const progressBar = document.getElementById('progressBar');
const limitInput = document.getElementById('limitInput');
const clearBtn = document.getElementById('clearBtn');

let maxLength = Number(limitInput.value);

const countWords = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

const update = () => {
  const text = textarea.value;
  const chars = text.length;
  const remaining = maxLength - chars;
  const ratio = maxLength > 0 ? chars / maxLength : 0;

  charCountEl.textContent = chars;
  wordCountEl.textContent = countWords(text);
  remainingEl.textContent = remaining;
  usedEl.textContent = chars;
  limitLabelEl.textContent = maxLength;
  progressBar.style.width = `${Math.min(ratio, 1) * 100}%`;

  counter.classList.remove('is-warn', 'is-danger');
  if (ratio >= 0.95) {
    counter.classList.add('is-danger');
  } else if (ratio >= 0.8) {
    counter.classList.add('is-warn');
  }
};

const applyLimit = () => {
  let value = Number(limitInput.value);
  if (!Number.isFinite(value) || value < 10) value = 10;
  if (value > 2000) value = 2000;
  maxLength = value;
  limitInput.value = value;
  textarea.setAttribute('maxlength', String(value));
  if (textarea.value.length > value) {
    textarea.value = textarea.value.slice(0, value);
  }
  update();
};

textarea.addEventListener('input', update);
limitInput.addEventListener('change', applyLimit);
clearBtn.addEventListener('click', () => {
  textarea.value = '';
  textarea.focus();
  update();
});

update();
