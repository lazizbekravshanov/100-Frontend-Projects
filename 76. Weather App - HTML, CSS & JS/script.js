const form = document.getElementById('search-form');
const input = document.getElementById('city-input');
const statusEl = document.getElementById('status');
const currentEl = document.getElementById('current');
const forecastEl = document.getElementById('forecast');
const forecastList = document.getElementById('forecast-list');

// WMO weather codes -> label + emoji icon.
const WEATHER_CODES = {
  0: ['Clear sky', '☀️'],
  1: ['Mainly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'],
  48: ['Rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Dense drizzle', '🌧️'],
  56: ['Freezing drizzle', '🌧️'],
  57: ['Freezing drizzle', '🌧️'],
  61: ['Light rain', '🌦️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  66: ['Freezing rain', '🌧️'],
  67: ['Freezing rain', '🌧️'],
  71: ['Light snow', '🌨️'],
  73: ['Snow', '🌨️'],
  75: ['Heavy snow', '❄️'],
  77: ['Snow grains', '❄️'],
  80: ['Rain showers', '🌦️'],
  81: ['Rain showers', '🌧️'],
  82: ['Violent showers', '⛈️'],
  85: ['Snow showers', '🌨️'],
  86: ['Snow showers', '🌨️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm', '⛈️'],
  99: ['Thunderstorm', '⛈️']
};

const describe = (code) => WEATHER_CODES[code] || ['Unknown', '·'];

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.hidden = !message;
  statusEl.classList.toggle('status--error', isError);
};

const showPanels = (show) => {
  currentEl.hidden = !show;
  forecastEl.hidden = !show;
};

async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding request failed.');
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No results for “${city}”. Check the spelling and try again.`);
  }
  return data.results[0];
}

async function getForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '5'
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Weather request failed.');
  return res.json();
}

function renderCurrent(place, data) {
  const c = data.current;
  const [label, icon] = describe(c.weather_code);
  document.getElementById('place').textContent =
    place.admin1 ? `${place.name}, ${place.country_code}` : `${place.name}, ${place.country_code}`;
  document.getElementById('desc').textContent = label;
  document.getElementById('icon').textContent = icon;
  document.getElementById('temp').textContent = Math.round(c.temperature_2m);
  document.getElementById('feels').textContent = `${Math.round(c.apparent_temperature)}°C`;
  document.getElementById('wind').textContent = `${Math.round(c.wind_speed_10m)} km/h`;
  document.getElementById('humidity').textContent = `${c.relative_humidity_2m}%`;
  document.getElementById('precip').textContent = `${c.precipitation} mm`;
}

function renderForecast(data) {
  const d = data.daily;
  const days = d.time.map((iso, i) => {
    const [label, icon] = describe(d.weather_code[i]);
    const name = new Date(iso + 'T00:00').toLocaleDateString('en', { weekday: 'short' });
    return `
      <li class="day">
        <span class="day__name">${name}</span>
        <span class="day__icon" role="img" aria-label="${label}">${icon}</span>
        <span class="day__temps">
          <span class="day__hi">${Math.round(d.temperature_2m_max[i])}°</span>
          <span class="day__lo">${Math.round(d.temperature_2m_min[i])}°</span>
        </span>
      </li>`;
  });
  forecastList.innerHTML = days.join('');
}

async function loadWeather(city) {
  setStatus('Loading weather…');
  showPanels(false);
  try {
    const place = await geocode(city);
    const data = await getForecast(place.latitude, place.longitude);
    renderCurrent(place, data);
    renderForecast(data);
    setStatus('');
    showPanels(true);
  } catch (err) {
    showPanels(false);
    setStatus(err.message || 'Something went wrong. Please try again.', true);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) {
    setStatus('Please enter a city name.', true);
    return;
  }
  loadWeather(city);
});

// Default city on first load.
loadWeather('London');
