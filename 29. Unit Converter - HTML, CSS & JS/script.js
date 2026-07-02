// Length and weight use factors relative to a base unit (metre / gram).
// Temperature is handled with explicit conversion functions.
const categories = {
  length: {
    base: 'Meter',
    units: {
      Millimeter: 0.001,
      Centimeter: 0.01,
      Meter: 1,
      Kilometer: 1000,
      Inch: 0.0254,
      Foot: 0.3048,
      Yard: 0.9144,
      Mile: 1609.344
    }
  },
  weight: {
    base: 'Gram',
    units: {
      Milligram: 0.001,
      Gram: 1,
      Kilogram: 1000,
      Ounce: 28.349523125,
      Pound: 453.59237,
      Ton: 1000000
    }
  },
  temperature: {
    units: ['Celsius', 'Fahrenheit', 'Kelvin']
  }
};

const tabs = document.querySelectorAll('.tab');
const fromValue = document.getElementById('from-value');
const toValue = document.getElementById('to-value');
const fromUnit = document.getElementById('from-unit');
const toUnit = document.getElementById('to-unit');
const swapBtn = document.getElementById('swap');
const equationEl = document.getElementById('equation');

let currentCategory = 'length';

function unitNames(category) {
  const cat = categories[category];
  return Array.isArray(cat.units) ? cat.units : Object.keys(cat.units);
}

function populateSelects(category) {
  const names = unitNames(category);
  [fromUnit, toUnit].forEach((select) => {
    select.innerHTML = '';
    names.forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  });
  fromUnit.selectedIndex = 0;
  toUnit.selectedIndex = names.length > 1 ? 1 : 0;
}

function convertTemperature(value, from, to) {
  let celsius;
  if (from === 'Celsius') celsius = value;
  else if (from === 'Fahrenheit') celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15;

  if (to === 'Celsius') return celsius;
  if (to === 'Fahrenheit') return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

function convert() {
  const value = parseFloat(fromValue.value);
  const from = fromUnit.value;
  const to = toUnit.value;

  if (Number.isNaN(value)) {
    toValue.value = '';
    equationEl.textContent = '';
    return;
  }

  let result;
  if (currentCategory === 'temperature') {
    result = convertTemperature(value, from, to);
  } else {
    const units = categories[currentCategory].units;
    result = (value * units[from]) / units[to];
  }

  const rounded = Math.round(result * 1e6) / 1e6;
  toValue.value = rounded;
  equationEl.textContent = `${value} ${from} = ${rounded} ${to}`;
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    currentCategory = tab.dataset.category;
    populateSelects(currentCategory);
    convert();
  });
});

swapBtn.addEventListener('click', () => {
  const temp = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = temp;
  convert();
});

[fromValue, fromUnit, toUnit].forEach((el) => el.addEventListener('input', convert));

populateSelects(currentCategory);
convert();
