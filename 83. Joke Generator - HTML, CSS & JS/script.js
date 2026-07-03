'use strict';

const API_URL = 'https://official-joke-api.appspot.com/random_joke';
const REVEAL_DELAY = 3500; // auto-reveal punchline after this many ms

// Embedded fallback jokes, used when the API endpoint is unreachable
// or returns an error. Comment: keeps the app functional offline.
const FALLBACK_JOKES = [
  { setup: 'Why did the scarecrow win an award?', punchline: 'Because he was outstanding in his field.' },
  { setup: 'Why don’t scientists trust atoms?', punchline: 'Because they make up everything.' },
  { setup: 'What do you call fake spaghetti?', punchline: 'An impasta.' },
  { setup: 'Why did the developer go broke?', punchline: 'Because they used up all their cache.' },
  { setup: 'How do you organize a space party?', punchline: 'You planet.' }
];

const setupEl = document.getElementById('setup');
const punchlineEl = document.getElementById('punchline');
const revealBtn = document.getElementById('reveal');
const errorEl = document.getElementById('error');
const nextBtn = document.getElementById('next');
const cardEl = document.querySelector('.card');

let revealTimer = null;

function resetCard() {
  clearTimeout(revealTimer);
  punchlineEl.hidden = true;
  punchlineEl.textContent = '';
  revealBtn.hidden = true;
  errorEl.hidden = true;
}

function showPunchline(text) {
  clearTimeout(revealTimer);
  revealBtn.hidden = true;
  punchlineEl.textContent = text;
  punchlineEl.hidden = false;
}

function displayJoke(joke) {
  resetCard();
  setupEl.textContent = joke.setup;
  revealBtn.hidden = false;
  revealBtn.onclick = () => showPunchline(joke.punchline);
  revealTimer = setTimeout(() => showPunchline(joke.punchline), REVEAL_DELAY);
}

async function loadJoke() {
  nextBtn.setAttribute('aria-busy', 'true');
  cardEl.classList.add('is-loading');
  resetCard();
  setupEl.textContent = 'Fetching a fresh joke…';

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.setup || !data.punchline) throw new Error('Bad payload');
    displayJoke(data);
  } catch (err) {
    // Fall back to a random embedded joke.
    const joke = FALLBACK_JOKES[Math.floor(Math.random() * FALLBACK_JOKES.length)];
    displayJoke(joke);
    errorEl.hidden = false;
    errorEl.textContent = 'Offline mode — showing a local joke.';
  } finally {
    nextBtn.removeAttribute('aria-busy');
    cardEl.classList.remove('is-loading');
  }
}

nextBtn.addEventListener('click', loadJoke);

loadJoke();
