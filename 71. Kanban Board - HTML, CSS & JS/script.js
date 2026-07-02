const STORAGE_KEY = "kanban-board-state-v1";

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const board = document.getElementById("board");
const columnTemplate = document.getElementById("column-template");
const cardTemplate = document.getElementById("card-template");

/**
 * State shape: { [columnId]: Array<{ id, text }> }
 */
let state = loadState();

function loadState() {
  const fallback = { todo: [], progress: [], done: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState(fallback);
    const parsed = JSON.parse(raw);
    for (const column of COLUMNS) {
      if (!Array.isArray(parsed[column.id])) parsed[column.id] = [];
    }
    return parsed;
  } catch {
    return seedState(fallback);
  }
}

function seedState(base) {
  base.todo = [
    { id: createId(), text: "Sketch out the project layout" },
    { id: createId(), text: "Draft the README" },
  ];
  base.progress = [{ id: createId(), text: "Build the drag-and-drop logic" }];
  base.done = [{ id: createId(), text: "Set up the color system" }];
  return base;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId() {
  return `card-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function findCard(cardId) {
  for (const column of COLUMNS) {
    const index = state[column.id].findIndex((card) => card.id === cardId);
    if (index !== -1) {
      return { columnId: column.id, index };
    }
  }
  return null;
}

/* ---------- Rendering ---------- */

function render() {
  board.innerHTML = "";
  for (const column of COLUMNS) {
    board.appendChild(buildColumn(column));
  }
  saveState();
}

function buildColumn(column) {
  const fragment = columnTemplate.content.cloneNode(true);
  const section = fragment.querySelector(".column");
  const title = fragment.querySelector(".column__title");
  const count = fragment.querySelector(".column__count");
  const list = fragment.querySelector(".column__list");
  const form = fragment.querySelector(".add-card");
  const input = fragment.querySelector(".add-card__input");
  const label = fragment.querySelector("label");

  const cards = state[column.id];
  const headingId = `column-${column.id}-title`;
  const inputId = `add-card-${column.id}`;

  section.dataset.column = column.id;
  section.setAttribute("aria-labelledby", headingId);
  title.id = headingId;
  title.textContent = column.title;
  count.textContent = String(cards.length);
  label.setAttribute("for", inputId);
  label.textContent = `Add a card to ${column.title}`;
  input.id = inputId;
  input.setAttribute(
    "aria-label",
    `Add a card to ${column.title}`
  );

  if (cards.length > 0) section.classList.add("has-cards");

  for (const card of cards) {
    list.appendChild(buildCard(card));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    state[column.id].push({ id: createId(), text });
    input.value = "";
    render();
    input.focus();
  });

  registerColumnDropZone(list, column.id);

  return fragment;
}

function buildCard(card) {
  const fragment = cardTemplate.content.cloneNode(true);
  const item = fragment.querySelector(".card");
  const text = fragment.querySelector(".card__text");
  const deleteBtn = fragment.querySelector(".card__delete");

  item.dataset.cardId = card.id;
  text.textContent = card.text;
  deleteBtn.setAttribute("aria-label", `Delete card: ${card.text}`);

  deleteBtn.addEventListener("click", () => deleteCard(card.id));

  item.addEventListener("keydown", (event) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteCard(card.id);
    }
  });

  registerCardDragSource(item, card.id);

  return fragment;
}

function deleteCard(cardId) {
  const location = findCard(cardId);
  if (!location) return;
  state[location.columnId].splice(location.index, 1);
  render();
}

/* ---------- Drag and drop ---------- */

let draggedCardId = null;

function registerCardDragSource(item, cardId) {
  item.addEventListener("dragstart", (event) => {
    draggedCardId = cardId;
    item.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", cardId);
  });

  item.addEventListener("dragend", () => {
    draggedCardId = null;
    item.classList.remove("is-dragging");
    clearDropIndicators();
    document
      .querySelectorAll(".column.is-drop-target")
      .forEach((col) => col.classList.remove("is-drop-target"));
  });
}

function registerColumnDropZone(list, columnId) {
  const column = list.closest(".column");

  list.addEventListener("dragover", (event) => {
    if (!draggedCardId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    column.classList.add("is-drop-target");
    showDropIndicator(list, event.clientY);
  });

  list.addEventListener("dragleave", (event) => {
    if (!list.contains(event.relatedTarget)) {
      column.classList.remove("is-drop-target");
      removeIndicatorFrom(list);
    }
  });

  list.addEventListener("drop", (event) => {
    if (!draggedCardId) return;
    event.preventDefault();
    const indicator = list.querySelector(".drop-indicator");
    const targetIndex = indicator
      ? [...list.children]
          .filter((el) => !el.classList.contains("drop-indicator"))
          .indexOf(indicator.nextElementSibling)
      : state[columnId].length;

    moveCard(draggedCardId, columnId, targetIndex);
  });
}

function moveCard(cardId, targetColumnId, requestedIndex) {
  const source = findCard(cardId);
  if (!source) return;

  let insertIndex = requestedIndex;

  // The requested index is measured before removal. When reordering within the
  // same column, removing the card ahead of the target shifts it down by one.
  if (source.columnId === targetColumnId && source.index < insertIndex) {
    insertIndex -= 1;
  }

  const [card] = state[source.columnId].splice(source.index, 1);

  if (insertIndex < 0 || insertIndex > state[targetColumnId].length) {
    insertIndex = state[targetColumnId].length;
  }

  state[targetColumnId].splice(insertIndex, 0, card);
  render();
}

function showDropIndicator(list, clientY) {
  removeIndicatorFrom(list);
  const indicator = document.createElement("li");
  indicator.className = "drop-indicator";
  indicator.setAttribute("aria-hidden", "true");

  const afterCard = getCardAfterPosition(list, clientY);
  if (afterCard) {
    list.insertBefore(indicator, afterCard);
  } else {
    list.appendChild(indicator);
  }
}

function getCardAfterPosition(list, clientY) {
  const cards = [...list.querySelectorAll(".card:not(.is-dragging)")];
  for (const card of cards) {
    const box = card.getBoundingClientRect();
    if (clientY < box.top + box.height / 2) {
      return card;
    }
  }
  return null;
}

function removeIndicatorFrom(list) {
  const existing = list.querySelector(".drop-indicator");
  if (existing) existing.remove();
}

function clearDropIndicators() {
  document
    .querySelectorAll(".drop-indicator")
    .forEach((indicator) => indicator.remove());
}

/* ---------- Init ---------- */

render();
