"use strict";

/* Embedded dataset: country name + flag emoji */
const COUNTRIES = [
  { name: "Afghanistan", flag: "🇦🇫" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Algeria", flag: "🇩🇿" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Bolivia", flag: "🇧🇴" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Bulgaria", flag: "🇧🇬" },
  { name: "Cambodia", flag: "🇰🇭" },
  { name: "Cameroon", flag: "🇨🇲" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "China", flag: "🇨🇳" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Costa Rica", flag: "🇨🇷" },
  { name: "Croatia", flag: "🇭🇷" },
  { name: "Cuba", flag: "🇨🇺" },
  { name: "Czechia", flag: "🇨🇿" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Ecuador", flag: "🇪🇨" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Estonia", flag: "🇪🇪" },
  { name: "Ethiopia", flag: "🇪🇹" },
  { name: "Finland", flag: "🇫🇮" },
  { name: "France", flag: "🇫🇷" },
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Greece", flag: "🇬🇷" },
  { name: "Guatemala", flag: "🇬🇹" },
  { name: "Hungary", flag: "🇭🇺" },
  { name: "Iceland", flag: "🇮🇸" },
  { name: "India", flag: "🇮🇳" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Iran", flag: "🇮🇷" },
  { name: "Iraq", flag: "🇮🇶" },
  { name: "Ireland", flag: "🇮🇪" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Jamaica", flag: "🇯🇲" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Jordan", flag: "🇯🇴" },
  { name: "Kazakhstan", flag: "🇰🇿" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "Kuwait", flag: "🇰🇼" },
  { name: "Latvia", flag: "🇱🇻" },
  { name: "Lebanon", flag: "🇱🇧" },
  { name: "Lithuania", flag: "🇱🇹" },
  { name: "Luxembourg", flag: "🇱🇺" },
  { name: "Malaysia", flag: "🇲🇾" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Nepal", flag: "🇳🇵" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "New Zealand", flag: "🇳🇿" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Pakistan", flag: "🇵🇰" },
  { name: "Panama", flag: "🇵🇦" },
  { name: "Paraguay", flag: "🇵🇾" },
  { name: "Peru", flag: "🇵🇪" },
  { name: "Philippines", flag: "🇵🇭" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "Romania", flag: "🇷🇴" },
  { name: "Russia", flag: "🇷🇺" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Serbia", flag: "🇷🇸" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Slovakia", flag: "🇸🇰" },
  { name: "Slovenia", flag: "🇸🇮" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Sweden", flag: "🇸🇪" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Tunisia", flag: "🇹🇳" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "Ukraine", flag: "🇺🇦" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "Uzbekistan", flag: "🇺🇿" },
  { name: "Venezuela", flag: "🇻🇪" },
  { name: "Vietnam", flag: "🇻🇳" },
  { name: "Zimbabwe", flag: "🇿🇼" }
];

const input = document.getElementById("search-input");
const listbox = document.getElementById("suggestions");
const clearButton = document.getElementById("clear-button");
const selectedValue = document.getElementById("selected-value");

const OPTION_ID_PREFIX = "option-";

/* Current render state */
let matches = [];
let activeIndex = -1;

/* Escape any characters that are special inside a RegExp */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Build an option element with the matched substring wrapped in <mark> */
const createOption = (country, query, index) => {
  const li = document.createElement("li");
  li.className = "option";
  li.id = OPTION_ID_PREFIX + index;
  li.setAttribute("role", "option");
  li.setAttribute("aria-selected", "false");
  li.dataset.name = country.name;

  const flag = document.createElement("span");
  flag.className = "option__flag";
  flag.setAttribute("aria-hidden", "true");
  flag.textContent = country.flag;

  const name = document.createElement("span");
  name.className = "option__name";
  appendHighlightedName(name, country.name, query);

  const check = document.createElement("span");
  check.className = "option__check";
  check.setAttribute("aria-hidden", "true");
  check.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" ' +
    'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ' +
    'stroke-linejoin="round"/></svg>';

  li.append(flag, name, check);
  return li;
};

/* Split the name into text nodes and a <mark> for the matched portion */
const appendHighlightedName = (container, name, query) => {
  const matchStart = name.toLowerCase().indexOf(query.toLowerCase());
  if (query === "" || matchStart === -1) {
    container.textContent = name;
    return;
  }

  const before = name.slice(0, matchStart);
  const matched = name.slice(matchStart, matchStart + query.length);
  const after = name.slice(matchStart + query.length);

  if (before) container.append(document.createTextNode(before));
  const mark = document.createElement("mark");
  mark.textContent = matched;
  container.append(mark);
  if (after) container.append(document.createTextNode(after));
};

/* Find matching countries (case-insensitive, matches anywhere in the name) */
const findMatches = (query) => {
  const needle = query.trim().toLowerCase();
  if (needle === "") return [];
  return COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(needle)
  );
};

const openListbox = () => {
  listbox.hidden = false;
  input.setAttribute("aria-expanded", "true");
};

const closeListbox = () => {
  listbox.hidden = true;
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
  activeIndex = -1;
};

/* Render the empty ("no matches") state */
const renderEmpty = (query) => {
  matches = [];
  activeIndex = -1;
  const safeQuery = query.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  listbox.innerHTML =
    '<li class="empty" role="option" aria-disabled="true">' +
    "No matches for <strong>" +
    safeQuery +
    "</strong></li>";
  input.removeAttribute("aria-activedescendant");
  openListbox();
};

/* Render the list of matches */
const renderMatches = (query) => {
  matches = findMatches(query);

  if (query.trim() === "") {
    closeListbox();
    listbox.innerHTML = "";
    return;
  }

  if (matches.length === 0) {
    renderEmpty(query.trim());
    return;
  }

  const fragment = document.createDocumentFragment();
  matches.forEach((country, index) => {
    const option = createOption(country, query.trim(), index);
    if (country.name === input.dataset.selected) {
      option.setAttribute("aria-selected", "true");
    }
    fragment.append(option);
  });

  listbox.innerHTML = "";
  listbox.append(fragment);
  activeIndex = -1;
  input.removeAttribute("aria-activedescendant");
  openListbox();
};

/* Move visual focus to the option at the given index */
const setActive = (index) => {
  const options = listbox.querySelectorAll(".option");
  if (options.length === 0) return;

  const clamped = (index + options.length) % options.length;
  options.forEach((option) => option.classList.remove("is-active"));

  const active = options[clamped];
  active.classList.add("is-active");
  active.scrollIntoView({ block: "nearest" });
  input.setAttribute("aria-activedescendant", active.id);
  activeIndex = clamped;
};

/* Commit a selection */
const selectCountry = (name) => {
  input.value = name;
  input.dataset.selected = name;
  const country = COUNTRIES.find((item) => item.name === name);
  selectedValue.classList.add("selected--filled");
  selectedValue.innerHTML =
    "Selected " +
    (country ? country.flag + " " : "") +
    '<span class="selected__value"></span>';
  selectedValue.querySelector(".selected__value").textContent = name;
  clearButton.hidden = false;
  closeListbox();
  input.focus();
};

/* Reset everything */
const clearAll = () => {
  input.value = "";
  delete input.dataset.selected;
  selectedValue.textContent = "";
  selectedValue.classList.remove("selected--filled");
  clearButton.hidden = true;
  listbox.innerHTML = "";
  closeListbox();
  input.focus();
};

/* Debounce helper */
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const handleInput = () => {
  const value = input.value;
  clearButton.hidden = value.length === 0;
  renderMatches(value);
};

const debouncedInput = debounce(handleInput, 120);

/* Events */
input.addEventListener("input", debouncedInput);

input.addEventListener("keydown", (event) => {
  const options = listbox.querySelectorAll(".option");
  const listOpen = !listbox.hidden;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (!listOpen || options.length === 0) {
        renderMatches(input.value);
      }
      if (matches.length > 0) setActive(activeIndex + 1);
      break;

    case "ArrowUp":
      event.preventDefault();
      if (listOpen && matches.length > 0) {
        setActive(activeIndex - 1);
      }
      break;

    case "Enter":
      if (listOpen && activeIndex >= 0 && matches[activeIndex]) {
        event.preventDefault();
        selectCountry(matches[activeIndex].name);
      }
      break;

    case "Escape":
      if (listOpen) {
        event.preventDefault();
        closeListbox();
      }
      break;

    case "Home":
      if (listOpen && matches.length > 0) {
        event.preventDefault();
        setActive(0);
      }
      break;

    case "End":
      if (listOpen && matches.length > 0) {
        event.preventDefault();
        setActive(matches.length - 1);
      }
      break;

    default:
      break;
  }
});

input.addEventListener("focus", () => {
  if (input.value.trim() !== "") renderMatches(input.value);
});

/* Use mousedown so the click registers before the input blurs */
listbox.addEventListener("mousedown", (event) => {
  const option = event.target.closest(".option");
  if (!option || !option.dataset.name) return;
  event.preventDefault();
  selectCountry(option.dataset.name);
});

listbox.addEventListener("mousemove", (event) => {
  const option = event.target.closest(".option");
  if (!option) return;
  const options = Array.from(listbox.querySelectorAll(".option"));
  const index = options.indexOf(option);
  if (index !== -1 && index !== activeIndex) setActive(index);
});

clearButton.addEventListener("click", clearAll);

/* Close when clicking outside the combobox */
document.addEventListener("click", (event) => {
  if (!event.target.closest(".combobox")) closeListbox();
});
