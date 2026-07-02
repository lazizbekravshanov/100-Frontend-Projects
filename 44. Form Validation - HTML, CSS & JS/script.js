const form = document.getElementById('signupForm');
const successPanel = document.getElementById('success');
const resetBtn = document.getElementById('resetBtn');

const fields = {
  name: document.getElementById('name'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  confirm: document.getElementById('confirm'),
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validators = {
  name(value) {
    if (!value.trim()) return 'Please enter your name.';
    if (value.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  },
  email(value) {
    if (!value.trim()) return 'Please enter your email.';
    if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address.';
    return '';
  },
  password(value) {
    if (!value) return 'Please create a password.';
    if (value.length < 8) return 'Use at least 8 characters.';
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
      return 'Include at least one letter and one number.';
    }
    return '';
  },
  confirm(value) {
    if (!value) return 'Please confirm your password.';
    if (value !== fields.password.value) return 'Passwords do not match.';
    return '';
  },
};

function setFieldState(name, message) {
  const input = fields[name];
  const errorEl = document.getElementById(`${name}-error`);
  const isValid = message === '';

  errorEl.textContent = message;
  if (isValid) {
    input.setAttribute('data-valid', 'true');
    input.removeAttribute('aria-invalid');
  } else {
    input.setAttribute('aria-invalid', 'true');
    input.removeAttribute('data-valid');
  }
  return isValid;
}

function validateField(name) {
  return setFieldState(name, validators[name](fields[name].value));
}

Object.keys(fields).forEach((name) => {
  fields[name].addEventListener('input', () => {
    validateField(name);
    if (name === 'password' && fields.confirm.value) {
      validateField('confirm');
    }
  });
  fields[name].addEventListener('blur', () => validateField(name));
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const results = Object.keys(fields).map((name) => validateField(name));
  const allValid = results.every(Boolean);

  if (!allValid) {
    const firstInvalid = Object.keys(fields).find(
      (name) => fields[name].getAttribute('aria-invalid') === 'true'
    );
    if (firstInvalid) fields[firstInvalid].focus();
    return;
  }

  form.hidden = true;
  successPanel.hidden = false;
});

resetBtn.addEventListener('click', () => {
  form.reset();
  Object.keys(fields).forEach((name) => {
    fields[name].removeAttribute('aria-invalid');
    fields[name].removeAttribute('data-valid');
    document.getElementById(`${name}-error`).textContent = '';
  });
  successPanel.hidden = true;
  form.hidden = false;
  fields.name.focus();
});
