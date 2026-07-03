'use strict';

const API_URL =
  'https://api.coingecko.com/api/v3/coins/markets' +
  '?vs_currency=usd&order=market_cap_desc&per_page=25&page=1' +
  '&sparkline=false&price_change_percentage=24h';

// Fallback mock data used when CoinGecko rate-limits (HTTP 429) or the
// network is unavailable, so the UI still renders something sensible.
const MOCK_COINS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', image: '', current_price: 61250.4, price_change_percentage_24h: 1.82, market_cap_rank: 1 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth', image: '', current_price: 3402.1, price_change_percentage_24h: -0.94, market_cap_rank: 2 },
  { id: 'tether', name: 'Tether', symbol: 'usdt', image: '', current_price: 1.0, price_change_percentage_24h: 0.01, market_cap_rank: 3 },
  { id: 'binancecoin', name: 'BNB', symbol: 'bnb', image: '', current_price: 584.72, price_change_percentage_24h: 2.31, market_cap_rank: 4 },
  { id: 'solana', name: 'Solana', symbol: 'sol', image: '', current_price: 143.09, price_change_percentage_24h: -3.12, market_cap_rank: 5 },
  { id: 'ripple', name: 'XRP', symbol: 'xrp', image: '', current_price: 0.487, price_change_percentage_24h: 0.56, market_cap_rank: 6 },
  { id: 'cardano', name: 'Cardano', symbol: 'ada', image: '', current_price: 0.392, price_change_percentage_24h: -1.45, market_cap_rank: 7 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge', image: '', current_price: 0.121, price_change_percentage_24h: 4.02, market_cap_rank: 8 }
];

const listEl = document.getElementById('coin-list');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const refreshBtn = document.getElementById('refresh');

let allCoins = [];

const priceFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 6
});

function formatPrice(value) {
  if (value >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(value);
  }
  return priceFmt.format(value);
}

function renderSkeletons(count = 8) {
  listEl.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const li = document.createElement('li');
    li.className = 'coin coin--skeleton';
    li.innerHTML =
      '<span class="coin__rank">·</span>' +
      '<span class="coin__img"></span>' +
      '<span class="coin__id"><span class="skel skel--name"></span><span class="skel skel--sym"></span></span>' +
      '<span class="coin__figures"><span class="skel skel--price"></span></span>';
    listEl.appendChild(li);
  }
}

function renderCoins(coins) {
  listEl.innerHTML = '';
  if (coins.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No coins match your search.';
    listEl.appendChild(li);
    return;
  }

  coins.forEach((coin) => {
    const change = coin.price_change_percentage_24h ?? 0;
    const dir = change >= 0 ? 'up' : 'down';
    const sign = change >= 0 ? '+' : '';

    const li = document.createElement('li');
    li.className = 'coin';

    const rank = document.createElement('span');
    rank.className = 'coin__rank';
    rank.textContent = coin.market_cap_rank ?? '—';

    const img = document.createElement('img');
    img.className = 'coin__img';
    img.width = 32; img.height = 32;
    img.loading = 'lazy';
    img.alt = '';
    if (coin.image) img.src = coin.image;

    const id = document.createElement('span');
    id.className = 'coin__id';
    id.innerHTML =
      '<span class="coin__name"></span><span class="coin__symbol"></span>';
    id.querySelector('.coin__name').textContent = coin.name;
    id.querySelector('.coin__symbol').textContent = coin.symbol;

    const fig = document.createElement('span');
    fig.className = 'coin__figures';
    const priceSpan = document.createElement('span');
    priceSpan.className = 'coin__price';
    priceSpan.textContent = formatPrice(coin.current_price);
    const changeSpan = document.createElement('span');
    changeSpan.className = 'coin__change coin__change--' + dir;
    changeSpan.textContent = ' ' + sign + change.toFixed(2) + '%';
    fig.append(priceSpan, document.createElement('br'), changeSpan);

    li.append(rank, img, id, fig);
    listEl.appendChild(li);
  });
}

function applyFilter() {
  const q = searchEl.value.trim().toLowerCase();
  if (!q) {
    renderCoins(allCoins);
    return;
  }
  const filtered = allCoins.filter(
    (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
  );
  renderCoins(filtered);
}

async function loadCoins() {
  refreshBtn.setAttribute('aria-busy', 'true');
  statusEl.textContent = 'Loading latest prices…';
  renderSkeletons();

  try {
    const res = await fetch(API_URL, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    allCoins = data;
    statusEl.textContent = 'Updated ' + new Date().toLocaleTimeString();
  } catch (err) {
    // Rate-limited or offline: fall back to embedded mock data.
    allCoins = MOCK_COINS;
    statusEl.textContent = 'Live data unavailable — showing sample prices.';
  } finally {
    refreshBtn.removeAttribute('aria-busy');
    applyFilter();
  }
}

searchEl.addEventListener('input', applyFilter);
refreshBtn.addEventListener('click', loadCoins);

loadCoins();
