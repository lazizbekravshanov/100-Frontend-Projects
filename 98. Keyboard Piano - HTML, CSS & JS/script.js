(() => {
  'use strict';

  // One octave of notes. Semitone offset from C is used to compute frequency.
  const NOTES = [
    { name: 'C', type: 'white', key: 'a', semitone: 0 },
    { name: 'C#', type: 'black', key: 'w', semitone: 1 },
    { name: 'D', type: 'white', key: 's', semitone: 2 },
    { name: 'D#', type: 'black', key: 'e', semitone: 3 },
    { name: 'E', type: 'white', key: 'd', semitone: 4 },
    { name: 'F', type: 'white', key: 'f', semitone: 5 },
    { name: 'F#', type: 'black', key: 't', semitone: 6 },
    { name: 'G', type: 'white', key: 'g', semitone: 7 },
    { name: 'G#', type: 'black', key: 'y', semitone: 8 },
    { name: 'A', type: 'white', key: 'h', semitone: 9 },
    { name: 'A#', type: 'black', key: 'u', semitone: 10 },
    { name: 'B', type: 'white', key: 'j', semitone: 11 },
    { name: 'C2', type: 'white', key: 'k', semitone: 12 }
  ];

  const pianoEl = document.querySelector('[data-piano]');
  const octaveValue = document.querySelector('[data-octave-value]');
  const volumeInput = document.querySelector('[data-volume]');
  const sustainInput = document.querySelector('[data-sustain]');
  const labelsInput = document.querySelector('[data-labels]');
  const hintEl = document.querySelector('[data-hint]');

  let octave = 4;
  let audioCtx = null;
  // Map of active voices keyed by note id so we can stop them individually.
  const voices = new Map();

  // Frequency for a semitone relative to C in the current octave.
  const freqFor = (semitone) => {
    // A4 = 440Hz is 9 semitones above C4. Compute distance from A4.
    const semitonesFromA4 = semitone + (octave - 4) * 12 - 9;
    return 440 * Math.pow(2, semitonesFromA4 / 12);
  };

  const ensureContext = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  const startNote = (id, semitone) => {
    if (voices.has(id)) return;
    const ctx = ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const level = (parseInt(volumeInput.value, 10) / 100) * 0.3;

    osc.type = 'triangle';
    osc.frequency.value = freqFor(semitone);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.01);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    voices.set(id, { osc, gain });
  };

  const stopNote = (id) => {
    const voice = voices.get(id);
    if (!voice) return;
    const ctx = audioCtx;
    const now = ctx.currentTime;
    // Sustain lets the tone ring out longer after release.
    const release = sustainInput.checked ? 1.2 : 0.12;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.linearRampToValueAtTime(0, now + release);
    voice.osc.stop(now + release + 0.02);
    voices.delete(id);
  };

  // Build the keyboard.
  const keyEls = new Map();
  NOTES.forEach((note, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `key key--${note.type}`;
    btn.dataset.index = String(index);
    btn.setAttribute('aria-label', `${note.name} key`);
    btn.innerHTML = `<span class="key__label">${note.key.toUpperCase()}</span>`;
    pianoEl.appendChild(btn);
    keyEls.set(index, btn);
  });

  const press = (index) => {
    const note = NOTES[index];
    const el = keyEls.get(index);
    if (!note || !el) return;
    startNote(index, note.semitone);
    el.classList.add('is-active');
    if (hintEl.textContent) hintEl.textContent = '';
  };

  const release = (index) => {
    const el = keyEls.get(index);
    if (!el) return;
    stopNote(index);
    el.classList.remove('is-active');
  };

  // Mouse / touch on keys.
  keyEls.forEach((el, index) => {
    el.addEventListener('mousedown', () => press(index));
    el.addEventListener('mouseup', () => release(index));
    el.addEventListener('mouseleave', () => release(index));
    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      press(index);
    }, { passive: false });
    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      release(index);
    });
    // Keyboard activation for accessibility (space / enter).
    el.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        press(index);
      }
    });
    el.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') release(index);
    });
  });

  // Computer keyboard mapping.
  const keyToIndex = new Map(NOTES.map((n, i) => [n.key, i]));

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const index = keyToIndex.get(e.key.toLowerCase());
    if (index !== undefined) {
      e.preventDefault();
      press(index);
    }
  });

  window.addEventListener('keyup', (e) => {
    const index = keyToIndex.get(e.key.toLowerCase());
    if (index !== undefined) release(index);
  });

  // Octave controls.
  document.querySelector('[data-octave-up]').addEventListener('click', () => {
    if (octave < 6) octave += 1;
    octaveValue.textContent = String(octave);
  });
  document.querySelector('[data-octave-down]').addEventListener('click', () => {
    if (octave > 2) octave -= 1;
    octaveValue.textContent = String(octave);
  });

  // Label visibility.
  labelsInput.addEventListener('change', () => {
    pianoEl.classList.toggle('hide-labels', !labelsInput.checked);
  });
})();
