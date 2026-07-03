const form = document.getElementById('search-form');
const input = document.getElementById('word');
const statusEl = document.getElementById('status');
const entryEl = document.getElementById('entry');
const wordEl = document.getElementById('entry-word');
const phoneticEl = document.getElementById('entry-phonetic');
const audioBtn = document.getElementById('audio-btn');
const meaningsEl = document.getElementById('meanings');

const API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

let currentAudio = null;

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.hidden = !message;
  statusEl.classList.toggle('status--error', isError);
  entryEl.hidden = Boolean(message);
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function pickPhonetic(data) {
  const withText = data.find((e) => e.phonetic) || {};
  let text = withText.phonetic || '';
  let audio = '';
  for (const entry of data) {
    for (const p of entry.phonetics || []) {
      if (!text && p.text) text = p.text;
      if (!audio && p.audio) audio = p.audio;
    }
  }
  return { text, audio };
}

function renderEntry(data) {
  const first = data[0];
  wordEl.textContent = first.word;

  const { text, audio } = pickPhonetic(data);
  phoneticEl.textContent = text || '';
  phoneticEl.hidden = !text;

  if (audio) {
    currentAudio = new Audio(audio);
    audioBtn.hidden = false;
  } else {
    currentAudio = null;
    audioBtn.hidden = true;
  }

  const meanings = data.flatMap((entry) => entry.meanings || []);
  meaningsEl.innerHTML = meanings.map((m) => {
    const defs = m.definitions.slice(0, 4).map((d) => `
      <li class="definition">
        <span class="definition__marker" aria-hidden="true">—</span>
        <span>
          ${escapeHtml(d.definition)}
          ${d.example ? `<span class="definition__example">“${escapeHtml(d.example)}”</span>` : ''}
        </span>
      </li>`).join('');

    const synonyms = [...new Set(m.synonyms)].slice(0, 8);
    const synHtml = synonyms.length
      ? `<div class="synonyms">
           <span class="synonyms__label">Synonyms</span>
           ${synonyms.map((s) => `<span class="synonym">${escapeHtml(s)}</span>`).join('')}
         </div>`
      : '';

    return `
      <section class="meaning">
        <h3 class="meaning__pos">${escapeHtml(m.partOfSpeech)}</h3>
        <p class="meaning__subtitle">Meaning</p>
        <ul class="definitions">${defs}</ul>
        ${synHtml}
      </section>`;
  }).join('');
}

async function lookup(word) {
  setStatus('Searching…');
  try {
    const res = await fetch(`${API}/${encodeURIComponent(word)}`);
    if (res.status === 404) {
      throw new Error(`No definition found for “${word}”. Try another word.`);
    }
    if (!res.ok) throw new Error('Something went wrong. Please try again.');
    const data = await res.json();
    renderEntry(data);
    setStatus('');
  } catch (err) {
    setStatus(err.message || 'Something went wrong. Please try again.', true);
  }
}

audioBtn.addEventListener('click', () => {
  if (currentAudio) {
    currentAudio.currentTime = 0;
    currentAudio.play().catch(() => {});
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const word = input.value.trim();
  if (!word) {
    setStatus('Please enter a word.', true);
    return;
  }
  lookup(word);
});

// Default word on load.
lookup('serendipity');
