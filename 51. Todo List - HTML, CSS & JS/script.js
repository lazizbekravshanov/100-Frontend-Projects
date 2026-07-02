const STORAGE_KEY = 'todo-list.items';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const footer = document.getElementById('app-footer');
const count = document.getElementById('count');
const clearBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filters__btn');

let todos = load();
let filter = 'all';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function visibleTodos() {
  if (filter === 'active') return todos.filter((t) => !t.done);
  if (filter === 'done') return todos.filter((t) => t.done);
  return todos;
}

function render() {
  list.innerHTML = '';
  const items = visibleTodos();

  items.forEach((todo) => {
    const li = document.createElement('li');
    li.className = 'todo' + (todo.done ? ' is-done' : '');
    li.dataset.id = todo.id;

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'todo__check';
    check.checked = todo.done;
    check.setAttribute('aria-label', todo.done ? 'Mark as active' : 'Mark as done');
    check.addEventListener('change', () => toggle(todo.id));

    const label = document.createElement('span');
    label.className = 'todo__label';
    label.textContent = todo.text;
    label.tabIndex = 0;
    label.title = 'Double-click to edit';
    label.addEventListener('dblclick', () => beginEdit(li, todo));
    label.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') beginEdit(li, todo);
    });

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'todo__delete';
    del.setAttribute('aria-label', 'Delete task');
    del.textContent = '×';
    del.addEventListener('click', () => remove(todo.id));

    li.append(check, label, del);
    list.appendChild(li);
  });

  const hasTodos = todos.length > 0;
  emptyState.hidden = items.length > 0;
  footer.hidden = !hasTodos;

  const left = todos.filter((t) => !t.done).length;
  count.textContent = `${left} item${left === 1 ? '' : 's'} left`;
  clearBtn.hidden = !todos.some((t) => t.done);
}

function beginEdit(li, todo) {
  const label = li.querySelector('.todo__label');
  const editor = document.createElement('input');
  editor.type = 'text';
  editor.className = 'todo__edit';
  editor.value = todo.text;
  editor.maxLength = 120;
  editor.setAttribute('aria-label', 'Edit task');
  li.replaceChild(editor, label);
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);

  const commit = () => {
    const value = editor.value.trim();
    if (value) {
      todo.text = value;
      save();
    }
    render();
  };

  editor.addEventListener('blur', commit);
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editor.blur();
    } else if (e.key === 'Escape') {
      editor.removeEventListener('blur', commit);
      render();
    }
  });
}

function add(text) {
  todos.unshift({ id: uid(), text, done: false });
  save();
  render();
}

function toggle(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    save();
    render();
  }
}

function remove(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  add(value);
  input.value = '';
  input.focus();
});

clearBtn.addEventListener('click', () => {
  todos = todos.filter((t) => !t.done);
  save();
  render();
});

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
    render();
  });
});

render();
