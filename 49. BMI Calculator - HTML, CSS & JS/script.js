const form = document.getElementById('form');
const units = document.querySelectorAll('.unit');
const heightLabel = document.getElementById('heightLabel');
const weightLabel = document.getElementById('weightLabel');
const heightInput = document.getElementById('height');
const inchesField = document.getElementById('inchesField');
const inchesInput = document.getElementById('inches');
const weightInput = document.getElementById('weight');
const errorEl = document.getElementById('error');
const result = document.getElementById('result');
const bmiValue = document.getElementById('bmiValue');
const categoryEl = document.getElementById('category');
const marker = document.getElementById('marker');
const noteEl = document.getElementById('note');
const resetBtn = document.getElementById('resetBtn');

const SCALE_MIN = 15;
const SCALE_MAX = 40;

let system = 'metric';

function setUnits(next) {
  system = next;
  units.forEach((u) => {
    const active = u.dataset.units === next;
    u.classList.toggle('is-active', active);
    u.setAttribute('aria-checked', String(active));
  });

  if (next === 'metric') {
    heightLabel.textContent = 'Height (cm)';
    weightLabel.textContent = 'Weight (kg)';
    heightInput.placeholder = '175';
    weightInput.placeholder = '70';
    inchesField.hidden = true;
  } else {
    heightLabel.textContent = 'Height (ft)';
    weightLabel.textContent = 'Weight (lb)';
    heightInput.placeholder = '5';
    weightInput.placeholder = '154';
    inchesField.hidden = false;
  }

  heightInput.value = '';
  inchesInput.value = '';
  weightInput.value = '';
  errorEl.hidden = true;
  result.hidden = true;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  result.hidden = true;
}

function classify(bmi) {
  if (bmi < 18.5) return { cat: 'under', label: 'Underweight', note: 'Below the healthy range — consider a check-up.' };
  if (bmi < 25) return { cat: 'normal', label: 'Normal', note: 'Within the healthy weight range.' };
  if (bmi < 30) return { cat: 'over', label: 'Overweight', note: 'Slightly above the healthy range.' };
  return { cat: 'obese', label: 'Obese', note: 'Well above the healthy range — consider medical advice.' };
}

function computeBmi() {
  const weight = parseFloat(weightInput.value);
  let bmi;

  if (system === 'metric') {
    const cm = parseFloat(heightInput.value);
    if (!(cm > 0) || !(weight > 0)) return null;
    const m = cm / 100;
    bmi = weight / (m * m);
  } else {
    const feet = parseFloat(heightInput.value) || 0;
    const inches = parseFloat(inchesInput.value) || 0;
    const totalInches = feet * 12 + inches;
    if (!(totalInches > 0) || !(weight > 0)) return null;
    bmi = (weight / (totalInches * totalInches)) * 703;
  }

  if (!isFinite(bmi) || bmi <= 0) return null;
  return bmi;
}

function render(bmi) {
  const { cat, label, note } = classify(bmi);
  bmiValue.textContent = bmi.toFixed(1);
  categoryEl.textContent = label;
  categoryEl.dataset.cat = cat;
  noteEl.textContent = note;

  const clamped = Math.min(Math.max(bmi, SCALE_MIN), SCALE_MAX);
  const pct = ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  marker.style.left = `${pct}%`;

  result.hidden = false;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  const bmi = computeBmi();
  if (bmi === null) {
    showError('Please enter valid, positive height and weight values.');
    return;
  }
  render(bmi);
});

form.addEventListener('reset', () => {
  window.setTimeout(() => {
    errorEl.hidden = true;
    result.hidden = true;
  }, 0);
});

units.forEach((u) => {
  u.addEventListener('click', () => setUnits(u.dataset.units));
});
