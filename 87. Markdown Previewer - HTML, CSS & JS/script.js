/*
 * Markdown Previewer - a small vanilla markdown parser.
 * Supports: headings, bold, italic, links, inline code, fenced code blocks,
 * ordered/unordered lists, blockquotes and horizontal rules.
 * All input is HTML-escaped first, so raw HTML in the source is rendered
 * as text rather than executed (basic sanitization).
 */

const input = document.getElementById('input');
const preview = document.getElementById('preview');
const charCount = document.getElementById('char-count');
const resetBtn = document.getElementById('reset-btn');
const clearBtn = document.getElementById('clear-btn');

const DEFAULT_MD = [
  '# Markdown Previewer',
  '',
  'A tiny parser written in **plain JavaScript**. Type on the left and watch it',
  'render *instantly* on the right.',
  '',
  '## What it handles',
  '',
  '- Headings, `#` through `######`',
  '- **Bold**, *italic*, and `inline code`',
  '- [Links](https://example.com) that open safely',
  '- Ordered lists:',
  '',
  '1. First item',
  '2. Second item',
  '3. Third item',
  '',
  '> Blockquotes are handy for pulling a line out of the flow.',
  '',
  '### Code blocks',
  '',
  '```',
  'function greet(name) {',
  '  return "Hello, " + name;',
  '}',
  '```',
  '',
  '---',
  '',
  'Everything is escaped first, so `<script>` tags show up as text.'
].join('\n');

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Emphasis + links, applied only to text that is NOT inside inline code.
function applyEmphasis(text) {
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const safe = /^(https?:\/\/|mailto:|\/|#)/i.test(url) ? url : '#';
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  text = text.replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,!?])/g, '$1<em>$2</em>');
  return text;
}

// Split on inline-code spans so emphasis never rewrites code contents,
// avoiding any need for placeholder tokens.
function inline(text) {
  return text
    .split(/(`[^`]+`)/g)
    .map((part) => {
      const code = part.match(/^`([^`]+)`$/);
      if (code) return `<code>${code[1]}</code>`;
      return applyEmphasis(part);
    })
    .join('');
}

function parse(src) {
  const lines = escapeHtml(src).replace(/\r\n?/g, '\n').split('\n');
  const html = [];
  const paragraph = [];
  let i = 0;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph.length = 0;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line.trim())) {
      flushParagraph();
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      html.push(`<pre><code>${code.join('\n')}</code></pre>`);
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushParagraph();
      html.push('<hr>');
      i++;
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote (one or more consecutive lines)
    if (/^\s*>\s?/.test(line)) {
      flushParagraph();
      const quote = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      html.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*[-*+]\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Blank line ends a paragraph
    if (line.trim() === '') {
      flushParagraph();
      i++;
      continue;
    }

    // Default: paragraph text
    paragraph.push(line.trim());
    i++;
  }

  flushParagraph();
  return html.join('\n');
}

function render() {
  preview.innerHTML = parse(input.value);
  const len = input.value.length;
  charCount.textContent = `${len} char${len === 1 ? '' : 's'}`;
}

input.addEventListener('input', render);

resetBtn.addEventListener('click', () => {
  input.value = DEFAULT_MD;
  render();
  input.focus();
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  render();
  input.focus();
});

input.value = DEFAULT_MD;
render();
