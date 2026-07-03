(() => {
  'use strict';

  const STORAGE_KEY = 'stt-notes';

  const editor = document.querySelector('[data-editor]');
  const interimEl = document.querySelector('[data-interim]');
  const toggleBtn = document.querySelector('[data-toggle]');
  const toggleLabel = document.querySelector('[data-toggle-label]');
  const clearBtn = document.querySelector('[data-clear]');
  const copyBtn = document.querySelector('[data-copy]');
  const wordcountEl = document.querySelector('[data-wordcount]');
  const statusEl = document.querySelector('[data-status]');
  const statusText = document.querySelector('[data-status-text]');
  const unsupportedEl = document.querySelector('[data-unsupported]');
  const savedEl = document.querySelector('[data-saved]');

  // Restore saved notes.
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) editor.textContent = saved;

  const updateWordCount = () => {
    const text = editor.textContent.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordcountEl.textContent = `${words} word${words === 1 ? '' : 's'}`;
  };

  let saveTimer = null;
  const persist = () => {
    localStorage.setItem(STORAGE_KEY, editor.textContent);
    savedEl.textContent = 'Saved locally in this browser.';
  };
  const scheduleSave = () => {
    savedEl.textContent = 'Saving…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 400);
  };

  editor.addEventListener('input', () => {
    updateWordCount();
    scheduleSave();
  });

  updateWordCount();

  // Detect Speech Recognition support.
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    unsupportedEl.hidden = false;
    toggleBtn.disabled = true;
    toggleLabel.textContent = 'Dictation unavailable';
    statusText.textContent = 'Unsupported';
    setupCopy();
    setupClear();
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = navigator.language || 'en-US';

  let listening = false;
  // True when the user asked to stop, so we don't auto-restart.
  let manualStop = false;

  const setListeningUI = (on) => {
    listening = on;
    toggleBtn.setAttribute('aria-pressed', String(on));
    toggleLabel.textContent = on ? 'Stop dictation' : 'Start dictation';
    statusEl.classList.toggle('is-listening', on);
    statusText.textContent = on ? 'Listening' : 'Idle';
    if (!on) interimEl.textContent = '';
  };

  const appendFinal = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const current = editor.textContent;
    const needsSpace = current.length && !/\s$/.test(current);
    // Capitalise the first letter of a new sentence-ish chunk.
    const chunk = (needsSpace ? ' ' : '') + trimmed;
    editor.textContent = current + chunk;
    updateWordCount();
    scheduleSave();
  };

  recognition.addEventListener('result', (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal) {
        appendFinal(result[0].transcript);
      } else {
        interim += result[0].transcript;
      }
    }
    interimEl.textContent = interim;
  });

  recognition.addEventListener('end', () => {
    // Chrome ends the session periodically; restart unless the user stopped it.
    if (!manualStop) {
      try {
        recognition.start();
        return;
      } catch (err) {
        /* start() can throw if called too quickly; fall through to idle. */
      }
    }
    setListeningUI(false);
  });

  recognition.addEventListener('error', (event) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      manualStop = true;
      statusText.textContent = 'Mic blocked';
    }
  });

  toggleBtn.addEventListener('click', () => {
    if (listening) {
      manualStop = true;
      recognition.stop();
      setListeningUI(false);
    } else {
      manualStop = false;
      try {
        recognition.start();
        setListeningUI(true);
        editor.focus();
      } catch (err) {
        /* Already started — ignore. */
      }
    }
  });

  setupCopy();
  setupClear();

  function setupClear() {
    clearBtn.addEventListener('click', () => {
      editor.textContent = '';
      interimEl.textContent = '';
      updateWordCount();
      persist();
      editor.focus();
    });
  }

  function setupCopy() {
    copyBtn.addEventListener('click', async () => {
      const text = editor.textContent;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied';
      } catch (err) {
        // Fallback selection-based copy for older browsers.
        const range = document.createRange();
        range.selectNodeContents(editor);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
        copyBtn.textContent = 'Copied';
      }
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
    });
  }
})();
