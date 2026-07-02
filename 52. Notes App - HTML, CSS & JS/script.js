const STORAGE_KEY = 'notes-app.notes';

const grid = document.getElementById('notes-grid');
const emptyState = document.getElementById('empty-state');
const emptyText = document.getElementById('empty-text');
const noteCount = document.getElementById('note-count');
const searchInput = document.getElementById('search');
const newNoteBtn = document.getElementById('new-note');

const modal = document.getElementById('modal');
const editorForm = document.getElementById('editor');
const titleInput = document.getElementById('note-title');
const bodyInput = document.getElementById('note-body');
const editorMeta = document.getElementById('editor-meta');

let notes = load();
let query = '';
let editingId = null;
let lastFocused = null;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFull(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

function visibleNotes() {
  const q = query.trim().toLowerCase();
  const sorted = [...notes].sort((a, b) => b.updated - a.updated);
  if (!q) return sorted;
  return sorted.filter(
    (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
  );
}

function render() {
  grid.innerHTML = '';
  const items = visibleNotes();

  items.forEach((note) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'note';
    card.setAttribute('aria-label', `Open note: ${note.title || 'Untitled'}`);
    card.addEventListener('click', () => openEditor(note.id));

    const title = document.createElement('h2');
    title.className = 'note__title';
    title.textContent = note.title || 'Untitled';

    const body = document.createElement('p');
    body.className = 'note__body';
    body.textContent = note.body || 'No additional text';

    const footer = document.createElement('div');
    footer.className = 'note__footer';

    const date = document.createElement('span');
    date.className = 'note__date';
    date.textContent = formatDate(note.updated);

    const del = document.createElement('span');
    del.className = 'note__delete';
    del.setAttribute('role', 'button');
    del.tabIndex = 0;
    del.setAttribute('aria-label', 'Delete note');
    del.textContent = '×';
    const remove = (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    };
    del.addEventListener('click', remove);
    del.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        remove(e);
      }
    });

    footer.append(date, del);
    card.append(title, body, footer);
    grid.appendChild(card);
  });

  const total = notes.length;
  noteCount.textContent = `${total} note${total === 1 ? '' : 's'}`;

  if (items.length === 0) {
    emptyState.hidden = false;
    emptyText.textContent = total === 0
      ? 'No notes yet. Create your first note.'
      : 'No notes match your search.';
  } else {
    emptyState.hidden = true;
  }
}

function openEditor(id) {
  lastFocused = document.activeElement;
  editingId = id;
  const note = notes.find((n) => n.id === id);
  titleInput.value = note ? note.title : '';
  bodyInput.value = note ? note.body : '';
  editorMeta.textContent = note ? `Edited ${formatFull(note.updated)}` : 'New note';
  modal.hidden = false;
  titleInput.focus();
  document.addEventListener('keydown', onKeydown);
}

function closeEditor() {
  modal.hidden = true;
  editingId = null;
  editorForm.reset();
  document.removeEventListener('keydown', onKeydown);
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

function onKeydown(e) {
  if (e.key === 'Escape') closeEditor();
}

function deleteNote(id) {
  notes = notes.filter((n) => n.id !== id);
  save();
  render();
}

editorForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title && !body) {
    closeEditor();
    return;
  }

  const now = Date.now();
  if (editingId) {
    const note = notes.find((n) => n.id === editingId);
    if (note) {
      note.title = title;
      note.body = body;
      note.updated = now;
    }
  } else {
    notes.push({ id: uid(), title, body, created: now, updated: now });
  }
  save();
  render();
  closeEditor();
});

newNoteBtn.addEventListener('click', () => openEditor(null));

modal.querySelectorAll('[data-close]').forEach((el) => {
  el.addEventListener('click', closeEditor);
});

searchInput.addEventListener('input', () => {
  query = searchInput.value;
  render();
});

render();
