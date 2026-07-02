const form = document.getElementById('form');
const dobInput = document.getElementById('dob');
const errorEl = document.getElementById('error');
const result = document.getElementById('result');
const yearsEl = document.getElementById('years');
const monthsEl = document.getElementById('months');
const daysEl = document.getElementById('days');
const totalDaysEl = document.getElementById('totalDays');
const totalMonthsEl = document.getElementById('totalMonths');
const totalWeeksEl = document.getElementById('totalWeeks');
const birthdayEl = document.getElementById('birthday');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Prevent future dates in the picker.
const today = new Date();
dobInput.max = today.toISOString().split('T')[0];

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  result.hidden = true;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function pluralize(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function diff(birth, now) {
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = (now.getMonth() - 1 + 12) % 12;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    days += daysInMonth(prevYear, prevMonth);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function nextBirthday(birth, now) {
  let next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (next < startOfToday) {
    next = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const isToday = next.getTime() === startOfToday.getTime();
  const daysAway = Math.round((next - startOfToday) / MS_PER_DAY);
  return { next, isToday, daysAway };
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const raw = dobInput.value;
  if (!raw) {
    showError('Please choose your date of birth.');
    return;
  }

  const parts = raw.split('-').map(Number);
  const birth = new Date(parts[0], parts[1] - 1, parts[2]);
  if (isNaN(birth.getTime())) {
    showError('That date is not valid.');
    return;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (birth > startOfToday) {
    showError('Date of birth cannot be in the future.');
    return;
  }

  const { years, months, days } = diff(birth, startOfToday);
  yearsEl.textContent = years;
  monthsEl.textContent = months;
  daysEl.textContent = days;

  const totalDays = Math.floor((startOfToday - birth) / MS_PER_DAY);
  totalDaysEl.textContent = totalDays.toLocaleString();
  totalMonthsEl.textContent = (years * 12 + months).toLocaleString();
  totalWeeksEl.textContent = Math.floor(totalDays / 7).toLocaleString();

  const { next, isToday, daysAway } = nextBirthday(birth, startOfToday);
  if (isToday) {
    birthdayEl.textContent = '🎉 Happy birthday! Today is the day.';
  } else {
    const dateLabel = next.toLocaleDateString(undefined, {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    birthdayEl.textContent = `Next birthday in ${pluralize(daysAway, 'day')} — ${dateLabel}.`;
  }

  result.hidden = false;
});
