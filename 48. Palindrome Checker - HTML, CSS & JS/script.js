const input = document.getElementById('input');
const result = document.getElementById('result');
const resultIcon = document.getElementById('resultIcon');
const resultText = document.getElementById('resultText');
const normalizedBox = document.getElementById('normalizedBox');
const normalizedEl = document.getElementById('normalized');
const tags = document.querySelectorAll('.tag');

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isPalindrome(clean) {
  return clean === [...clean].reverse().join('');
}

function check() {
  const raw = input.value;
  const clean = normalize(raw);

  if (raw.trim() === '') {
    result.dataset.state = 'idle';
    resultIcon.textContent = '•';
    resultText.textContent = 'Start typing to check.';
    normalizedBox.hidden = true;
    return;
  }

  if (clean === '') {
    result.dataset.state = 'idle';
    resultIcon.textContent = '•';
    resultText.textContent = 'Add some letters or numbers to check.';
    normalizedBox.hidden = true;
    return;
  }

  normalizedEl.textContent = clean;
  normalizedBox.hidden = false;

  if (isPalindrome(clean)) {
    result.dataset.state = 'yes';
    resultIcon.textContent = '✓';
    resultText.textContent = 'Yes — this is a palindrome.';
  } else {
    result.dataset.state = 'no';
    resultIcon.textContent = '✕';
    resultText.textContent = 'No — this is not a palindrome.';
  }
}

input.addEventListener('input', check);

tags.forEach((tag) => {
  tag.addEventListener('click', () => {
    input.value = tag.dataset.example;
    input.focus();
    check();
  });
});
