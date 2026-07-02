"use strict";

const employees = [
  { name: "Amara Okafor", role: "Product Designer", team: "Design", salary: 98000, start: "2019-03-11" },
  { name: "Liam Chen", role: "Frontend Engineer", team: "Engineering", salary: 112000, start: "2021-07-02" },
  { name: "Sofia Marino", role: "Engineering Manager", team: "Engineering", salary: 148000, start: "2016-11-20" },
  { name: "Noah Bergström", role: "Data Analyst", team: "Analytics", salary: 87500, start: "2022-01-17" },
  { name: "Priya Nair", role: "UX Researcher", team: "Design", salary: 94000, start: "2020-09-08" },
  { name: "Diego Fernández", role: "Backend Engineer", team: "Engineering", salary: 121000, start: "2018-05-14" },
  { name: "Hana Kobayashi", role: "Marketing Lead", team: "Marketing", salary: 103000, start: "2017-02-27" },
  { name: "Oliver Grant", role: "QA Engineer", team: "Engineering", salary: 79000, start: "2023-04-03" },
  { name: "Zara Ahmed", role: "Content Strategist", team: "Marketing", salary: 76000, start: "2021-12-06" },
  { name: "Mateo Rossi", role: "DevOps Engineer", team: "Engineering", salary: 128000, start: "2019-08-19" },
  { name: "Elena Petrova", role: "Finance Partner", team: "Operations", salary: 91000, start: "2015-06-30" },
  { name: "Kwame Mensah", role: "Data Scientist", team: "Analytics", salary: 134000, start: "2020-02-10" },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const tableBody = document.getElementById("table-body");
const filterInput = document.getElementById("filter-input");
const emptyState = document.getElementById("empty-state");
const resultCount = document.getElementById("result-count");
const headers = Array.from(document.querySelectorAll("th[data-key]"));

const sortState = { key: null, direction: "ascending" };

function compareValues(a, b, type) {
  if (type === "number") {
    return a - b;
  }
  if (type === "date") {
    return new Date(a).getTime() - new Date(b).getTime();
  }
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

function getVisibleRows() {
  const query = filterInput.value.trim().toLowerCase();
  let rows = employees.filter((employee) => {
    if (!query) return true;
    return [employee.name, employee.role, employee.team].some((field) =>
      field.toLowerCase().includes(query)
    );
  });

  if (sortState.key) {
    const header = headers.find((th) => th.dataset.key === sortState.key);
    const type = header.dataset.type;
    const factor = sortState.direction === "ascending" ? 1 : -1;
    rows = rows
      .slice()
      .sort((a, b) => compareValues(a[sortState.key], b[sortState.key], type) * factor);
  }

  return rows;
}

function buildRow(employee) {
  const tr = document.createElement("tr");

  const nameTd = document.createElement("td");
  nameTd.className = "cell-name";
  nameTd.textContent = employee.name;

  const roleTd = document.createElement("td");
  roleTd.className = "cell-muted";
  roleTd.textContent = employee.role;

  const teamTd = document.createElement("td");
  const teamTag = document.createElement("span");
  teamTag.className = "team-tag";
  teamTag.textContent = employee.team;
  teamTd.appendChild(teamTag);

  const salaryTd = document.createElement("td");
  salaryTd.className = "num";
  salaryTd.textContent = currencyFormatter.format(employee.salary);

  const startTd = document.createElement("td");
  startTd.className = "cell-muted";
  startTd.textContent = dateFormatter.format(new Date(employee.start));

  tr.append(nameTd, roleTd, teamTd, salaryTd, startTd);
  return tr;
}

function render() {
  const rows = getVisibleRows();
  tableBody.replaceChildren();

  rows.forEach((employee) => {
    tableBody.appendChild(buildRow(employee));
  });

  const hasResults = rows.length > 0;
  emptyState.hidden = hasResults;
  resultCount.textContent = `${rows.length} of ${employees.length} employees`;
}

function updateHeaderStates() {
  headers.forEach((th) => {
    if (th.dataset.key === sortState.key) {
      th.setAttribute("aria-sort", sortState.direction);
    } else {
      th.setAttribute("aria-sort", "none");
    }
  });
}

function handleSort(key) {
  if (sortState.key === key) {
    sortState.direction =
      sortState.direction === "ascending" ? "descending" : "ascending";
  } else {
    sortState.key = key;
    sortState.direction = "ascending";
  }
  updateHeaderStates();
  render();
}

headers.forEach((th) => {
  const button = th.querySelector(".th-sort");
  button.addEventListener("click", () => handleSort(th.dataset.key));
});

filterInput.addEventListener("input", render);

render();
