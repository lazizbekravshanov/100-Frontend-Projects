const form = document.getElementById('search-form');
const input = document.getElementById('username');
const statusEl = document.getElementById('status');
const profileEl = document.getElementById('profile');
const reposList = document.getElementById('repos-list');

const API = 'https://api.github.com';

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.hidden = !message;
  statusEl.classList.toggle('status--error', isError);
  profileEl.hidden = Boolean(message);
};

const numberFmt = new Intl.NumberFormat('en');

async function fetchUser(username) {
  const res = await fetch(`${API}/users/${encodeURIComponent(username)}`);
  if (res.status === 404) {
    throw new Error(`No GitHub user found for “${username}”.`);
  }
  if (res.status === 403) {
    throw new Error('GitHub rate limit reached. Please wait a minute and try again.');
  }
  if (!res.ok) throw new Error('Could not load this profile. Please try again.');
  return res.json();
}

async function fetchRepos(username) {
  const res = await fetch(`${API}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`);
  if (!res.ok) return [];
  const repos = await res.json();
  return repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);
}

function renderProfile(user) {
  const avatar = document.getElementById('avatar');
  avatar.src = user.avatar_url;
  avatar.alt = `${user.login} avatar`;
  document.getElementById('name').textContent = user.name || user.login;
  const login = document.getElementById('login');
  login.textContent = `@${user.login}`;
  login.href = user.html_url;
  document.getElementById('bio').textContent = user.bio || '';
  document.getElementById('repos').textContent = numberFmt.format(user.public_repos);
  document.getElementById('followers').textContent = numberFmt.format(user.followers);
  document.getElementById('following').textContent = numberFmt.format(user.following);
}

function renderRepos(repos) {
  if (repos.length === 0) {
    reposList.innerHTML = '<li class="repo"><p class="repo__desc">No public repositories to show.</p></li>';
    return;
  }
  reposList.innerHTML = repos.map((r) => `
    <li class="repo">
      <a class="repo__name" href="${r.html_url}" target="_blank" rel="noopener">${r.name}</a>
      ${r.description ? `<p class="repo__desc">${escapeHtml(r.description)}</p>` : ''}
      <div class="repo__meta">
        <span>★ ${numberFmt.format(r.stargazers_count)}</span>
        <span>⑂ ${numberFmt.format(r.forks_count)}</span>
        ${r.language ? `<span>● ${escapeHtml(r.language)}</span>` : ''}
      </div>
    </li>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadProfile(username) {
  setStatus('Loading profile…');
  try {
    const [user, repos] = await Promise.all([fetchUser(username), fetchRepos(username)]);
    renderProfile(user);
    renderRepos(repos);
    setStatus('');
  } catch (err) {
    setStatus(err.message || 'Something went wrong. Please try again.', true);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = input.value.trim();
  if (!username) {
    setStatus('Please enter a username.', true);
    return;
  }
  loadProfile(username);
});

// Default profile on load.
loadProfile('torvalds');
