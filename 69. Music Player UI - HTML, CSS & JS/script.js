// The playlist is driven by a simulated timeline. Each "track" plays a soft
// Web Audio oscillator tone so the controls act on real, audible playback —
// no audio files are used.
const tracks = [
  { title: 'Midnight Drift', artist: 'Nocturne', duration: 42, freq: 220 },
  { title: 'Paper Planes', artist: 'Aster', duration: 55, freq: 277 },
  { title: 'Slow Tide', artist: 'Marleen', duration: 38, freq: 330 },
  { title: 'Neon Rain', artist: 'Vela', duration: 60, freq: 196 },
  { title: 'Amber Light', artist: 'Corvid', duration: 47, freq: 262 }
];

const artEl = document.getElementById('art');
const titleEl = document.getElementById('trackTitle');
const artistEl = document.getElementById('trackArtist');
const seek = document.getElementById('seek');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const iconPlay = playBtn.querySelector('.icon-play');
const iconPause = playBtn.querySelector('.icon-pause');
const muteBtn = document.getElementById('muteBtn');
const volume = document.getElementById('volume');
const playlistEl = document.getElementById('playlist');

let index = 0;
let elapsed = 0;
let isPlaying = false;
let lastFrame = 0;
let rafId = null;

let audioCtx = null;
let osc = null;
let gainNode = null;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function buildPlaylist() {
  tracks.forEach((track, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'playlist__item';
    btn.innerHTML = `
      <span class="playlist__song">
        <span class="playlist__song-title">${track.title}</span>
        <span class="playlist__song-artist">${track.artist}</span>
      </span>
      <span class="playlist__length">${formatTime(track.duration)}</span>`;
    btn.addEventListener('click', () => selectTrack(i, true));
    li.appendChild(btn);
    playlistEl.appendChild(li);
  });
}

function highlightPlaylist() {
  playlistEl.querySelectorAll('.playlist__item').forEach((item, i) => {
    item.classList.toggle('is-active', i === index);
    if (i === index) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  });
}

function loadTrack() {
  const track = tracks[index];
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  durationEl.textContent = formatTime(track.duration);
  elapsed = 0;
  updateProgress();
  highlightPlaylist();
}

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function targetGain() {
  return muteBtn.classList.contains('is-muted') ? 0 : (volume.value / 100) * 0.08;
}

function startOsc() {
  ensureAudio();
  stopOsc();
  osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = tracks[index].freq;
  osc.connect(gainNode);
  gainNode.gain.setTargetAtTime(targetGain(), audioCtx.currentTime, 0.05);
  osc.start();
}

function stopOsc() {
  if (osc) {
    try {
      osc.stop();
    } catch (e) {
      // already stopped
    }
    osc.disconnect();
    osc = null;
  }
}

function play() {
  isPlaying = true;
  iconPlay.hidden = true;
  iconPause.hidden = false;
  playBtn.setAttribute('aria-label', 'Pause');
  artEl.classList.add('is-playing');
  startOsc();
  lastFrame = performance.now();
  tick();
}

function pause() {
  isPlaying = false;
  iconPlay.hidden = false;
  iconPause.hidden = true;
  playBtn.setAttribute('aria-label', 'Play');
  artEl.classList.remove('is-playing');
  stopOsc();
  cancelAnimationFrame(rafId);
}

function togglePlay() {
  if (isPlaying) pause();
  else play();
}

function tick() {
  const now = performance.now();
  const delta = (now - lastFrame) / 1000;
  lastFrame = now;
  elapsed += delta;

  const track = tracks[index];
  if (elapsed >= track.duration) {
    elapsed = 0;
    next();
    return;
  }

  updateProgress();
  rafId = requestAnimationFrame(tick);
}

function updateProgress() {
  const track = tracks[index];
  seek.value = String(Math.round((elapsed / track.duration) * 1000));
  currentTimeEl.textContent = formatTime(elapsed);
}

function selectTrack(i, autoplay) {
  index = (i + tracks.length) % tracks.length;
  const wasPlaying = isPlaying;
  loadTrack();
  if (wasPlaying || autoplay) play();
  else pause();
}

function next() {
  selectTrack(index + 1, isPlaying);
}

function prev() {
  // Restart current track if more than 3s in, else go to previous.
  if (elapsed > 3) {
    elapsed = 0;
    updateProgress();
    if (isPlaying) startOsc();
  } else {
    selectTrack(index - 1, isPlaying);
  }
}

seek.addEventListener('input', () => {
  const track = tracks[index];
  elapsed = (seek.value / 1000) * track.duration;
  currentTimeEl.textContent = formatTime(elapsed);
  lastFrame = performance.now();
});

volume.addEventListener('input', () => {
  if (Number(volume.value) > 0) muteBtn.classList.remove('is-muted');
  if (gainNode && audioCtx) {
    gainNode.gain.setTargetAtTime(targetGain(), audioCtx.currentTime, 0.05);
  }
});

muteBtn.addEventListener('click', () => {
  muteBtn.classList.toggle('is-muted');
  const muted = muteBtn.classList.contains('is-muted');
  muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
  if (gainNode && audioCtx) {
    gainNode.gain.setTargetAtTime(targetGain(), audioCtx.currentTime, 0.05);
  }
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);

buildPlaylist();
loadTrack();
