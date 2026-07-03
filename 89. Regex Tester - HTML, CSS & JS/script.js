/*
 * Regex Tester - live match highlighting, capture groups, presets.
 * Uses the native RegExp engine; invalid patterns surface a clear error.
 */

const els = {
  pattern: document.getElementById('pattern'),
  test: document.getElementById('test'),
  highlight: document.getElementById('highlight'),
  matches: document.getElementById('matches'),
  matchCount: document.getElementById('match-count'),
  error: document.getElementById('error'),
  flagReadout: document.getElementById('flag-readout'),
  preset: document.getElementById('preset')
};

const FLAG_IDS = ['g', 'i', 'm', 's', 'u'];
const flagInputs = Object.fromEntries(
  FLAG_IDS.map((f) => [f, document.getElementById(`flag-${f}`)])
);

const PRESETS = [
  {
    label: 'Email address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'gi',
    sample: 'Contact us at hello@dispatch.io or press@news-dispatch.co.uk today.'
  },
  {
    label: 'URL',
    pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*',
    flags: 'gi',
    sample: 'Visit https://example.com and http://news.dispatch.io/articles?id=42 now.'
  },
  {
    label: 'Hex color',
    pattern: '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b',
    flags: 'g',
    sample: 'Palette: #fff, #18181b, #2563EB and the invalid #12 tag.'
  },
  {
    label: 'IPv4 address',
    pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    flags: 'g',
    sample: 'Servers respond from 192.168.0.1, 10.0.0.255 and 8.8.8.8 reliably.'
  },
  {
    label: 'Date (YYYY-MM-DD)',
    pattern: '(\\d{4})-(\\d{2})-(\\d{2})',
    flags: 'g',
    sample: 'Published 2026-07-02, updated 2026-07-05, archived 2025-12-31.'
  },
  {
    label: 'Phone number',
    pattern: '\\+?\\d{1,3}[-.\\s]?\\(?\\d{2,4}\\)?[-.\\s]?\\d{3,4}[-.\\s]?\\d{3,4}',
    flags: 'g',
    sample: 'Call +1 (415) 555-0132 or 020-7946-0958 for the newsroom.'
  }
];

const DEFAULT_SAMPLE =
  'The Dispatch newsroom shipped 3 stories today. Reach the desk at editor@dispatch.io ' +
  'or visit https://dispatch.io/latest. Version 2.4 launches 2026-07-10.';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function currentFlags() {
  return FLAG_IDS.filter((f) => flagInputs[f].checked).join('');
}

function buildRegex() {
  const source = els.pattern.value;
  const flags = currentFlags();
  els.flagReadout.textContent = flags || '—';
  if (!source) return { regex: null };
  try {
    return { regex: new RegExp(source, flags) };
  } catch (err) {
    return { error: err.message };
  }
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = false;
}

function clearError() {
  els.error.hidden = true;
  els.error.textContent = '';
}

// Collect all matches. Guards the non-global case and zero-width matches.
function collectMatches(regex, text) {
  const results = [];
  if (!regex) return results;
  if (!regex.global) {
    const m = regex.exec(text);
    if (m) results.push(m);
    return results;
  }
  regex.lastIndex = 0;
  let m;
  let guard = 0;
  while ((m = regex.exec(text)) !== null) {
    results.push(m);
    if (m.index === regex.lastIndex) regex.lastIndex++; // avoid infinite loop
    if (++guard > 10000) break;
  }
  return results;
}

function renderHighlight(text, matches) {
  if (!matches.length) {
    els.highlight.textContent = text;
    return;
  }
  let html = '';
  let cursor = 0;
  matches.forEach((m) => {
    const start = m.index;
    const end = start + m[0].length;
    if (start < cursor) return; // skip overlaps from zero-width edge cases
    html += escapeHtml(text.slice(cursor, start));
    html += `<mark>${escapeHtml(text.slice(start, end)) || '&#8203;'}</mark>`;
    cursor = end;
  });
  html += escapeHtml(text.slice(cursor));
  els.highlight.innerHTML = html;
}

function renderMatches(matches) {
  if (!matches.length) {
    els.matches.innerHTML = '<p class="match__empty">No matches.</p>';
    return;
  }
  els.matches.innerHTML = matches
    .map((m, i) => {
      const groups = m.slice(1);
      const named = m.groups || {};
      let groupHtml = '';
      if (groups.length) {
        groupHtml =
          '<ul class="match__groups">' +
          groups
            .map((g, gi) => {
              const name = Object.keys(named).find((k) => named[k] === g && g !== undefined);
              const label = name ? `$&lt;${name}&gt;` : `$${gi + 1}`;
              const val = g === undefined
                ? '<span class="match__empty">undefined</span>'
                : `<span class="match__value">${escapeHtml(g)}</span>`;
              return `<li class="match__group"><span class="match__group-label">${label}</span>${val}</li>`;
            })
            .join('') +
          '</ul>';
      }
      return `
        <div class="match">
          <div class="match__head">
            <span>Match ${i + 1}</span>
            <span>index ${m.index}</span>
          </div>
          <span class="match__value">${escapeHtml(m[0]) || '(empty)'}</span>
          ${groupHtml}
        </div>`;
    })
    .join('');
}

function run() {
  const text = els.test.value;
  const built = buildRegex();

  if (built.error) {
    showError(`Invalid regular expression: ${built.error}`);
    els.highlight.textContent = text;
    els.matches.innerHTML = '<p class="match__empty">Fix the pattern to see matches.</p>';
    els.matchCount.textContent = '0 matches';
    return;
  }
  clearError();

  const matches = collectMatches(built.regex, text);
  renderHighlight(text, matches);
  renderMatches(matches);
  const n = matches.length;
  els.matchCount.textContent = `${n} match${n === 1 ? '' : 'es'}`;
}

function syncScroll() {
  els.highlight.scrollTop = els.test.scrollTop;
  els.highlight.scrollLeft = els.test.scrollLeft;
}

/* Presets */
PRESETS.forEach((preset, idx) => {
  const opt = document.createElement('option');
  opt.value = String(idx);
  opt.textContent = preset.label;
  els.preset.appendChild(opt);
});

els.preset.addEventListener('change', () => {
  const preset = PRESETS[Number(els.preset.value)];
  if (!preset) return;
  els.pattern.value = preset.pattern;
  els.test.value = preset.sample;
  FLAG_IDS.forEach((f) => { flagInputs[f].checked = preset.flags.includes(f); });
  run();
  els.preset.value = '';
});

/* Wiring */
els.pattern.addEventListener('input', run);
els.test.addEventListener('input', run);
els.test.addEventListener('scroll', syncScroll);
FLAG_IDS.forEach((f) => flagInputs[f].addEventListener('change', run));

/* Initial state */
els.pattern.value = '\\b\\w+@\\w+\\.\\w+\\b';
els.test.value = DEFAULT_SAMPLE;
run();
