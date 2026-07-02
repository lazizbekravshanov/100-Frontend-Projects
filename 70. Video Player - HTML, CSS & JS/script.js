const player = document.getElementById('player');
const video = document.getElementById('video');
const bigPlay = document.getElementById('bigPlay');
const playBtn = document.getElementById('playBtn');
const iconPlay = playBtn.querySelector('.icon-play');
const iconPause = playBtn.querySelector('.icon-pause');
const seek = document.getElementById('seek');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const muteBtn = document.getElementById('muteBtn');
const iconVol = muteBtn.querySelector('.icon-vol');
const iconMuted = muteBtn.querySelector('.icon-muted');
const volume = document.getElementById('volume');
const speedBtn = document.getElementById('speedBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const SPEEDS = [1, 1.5, 2, 0.5];
let speedIndex = 0;

// Public-domain fallback used only if the browser cannot generate a local
// clip (no canvas.captureStream / MediaRecorder support).
const FALLBACK_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Generate a short, self-contained video clip by recording an animated
// canvas. This produces a real, seekable video with no external files.
function generateVideo() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');

  const supportsCapture = typeof canvas.captureStream === 'function';
  if (!supportsCapture || typeof MediaRecorder === 'undefined') {
    useFallback();
    return;
  }

  const stream = canvas.captureStream(30);
  let recorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  } catch (e) {
    useFallback();
    return;
  }

  const chunks = [];
  recorder.addEventListener('dataavailable', (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  });
  recorder.addEventListener('stop', () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    video.src = URL.createObjectURL(blob);
    video.load();
  });

  const start = performance.now();
  const duration = 6000;

  function drawFrame(now) {
    const t = (now - start) / 1000;
    const w = canvas.width;
    const h = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, `hsl(${(t * 40) % 360}, 65%, 22%)`);
    grad.addColorStop(1, `hsl(${(t * 40 + 80) % 360}, 65%, 12%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 5; i++) {
      const angle = t * 0.8 + (i * Math.PI * 2) / 5;
      const cx = w / 2 + Math.cos(angle) * (90 + i * 18);
      const cy = h / 2 + Math.sin(angle * 1.3) * (60 + i * 10);
      ctx.beginPath();
      ctx.arc(cx, cy, 26 + i * 6, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(t * 60 + i * 60) % 360}, 80%, 60%, 0.85)`;
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = '600 30px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generated Clip', w / 2, h / 2 - 6);
    ctx.font = '500 20px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`${t.toFixed(1)}s`, w / 2, h / 2 + 26);

    if (now - start < duration) {
      requestAnimationFrame(drawFrame);
    } else if (recorder.state === 'recording') {
      recorder.stop();
    }
  }

  recorder.start();
  requestAnimationFrame(drawFrame);
}

function useFallback() {
  video.src = FALLBACK_SRC;
  video.crossOrigin = 'anonymous';
  video.load();
}

function setPlayIcon(playing) {
  iconPlay.hidden = playing;
  iconPause.hidden = !playing;
  playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  bigPlay.hidden = playing;
  player.classList.toggle('is-paused', !playing);
}

function togglePlay() {
  if (video.paused || video.ended) {
    video.play();
  } else {
    video.pause();
  }
}

video.addEventListener('play', () => setPlayIcon(true));
video.addEventListener('pause', () => setPlayIcon(false));
video.addEventListener('ended', () => setPlayIcon(false));

video.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(video.duration);
});

video.addEventListener('timeupdate', () => {
  if (video.duration) {
    seek.value = String(Math.round((video.currentTime / video.duration) * 1000));
  }
  currentTimeEl.textContent = formatTime(video.currentTime);
});

seek.addEventListener('input', () => {
  if (video.duration) {
    video.currentTime = (seek.value / 1000) * video.duration;
  }
});

playBtn.addEventListener('click', togglePlay);
bigPlay.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

function updateMuteIcon() {
  const muted = video.muted || video.volume === 0;
  iconVol.hidden = muted;
  iconMuted.hidden = !muted;
  muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
}

muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  if (!video.muted && video.volume === 0) {
    video.volume = 1;
    volume.value = '100';
  }
  updateMuteIcon();
});

volume.addEventListener('input', () => {
  video.volume = volume.value / 100;
  video.muted = video.volume === 0;
  updateMuteIcon();
});

speedBtn.addEventListener('click', () => {
  speedIndex = (speedIndex + 1) % SPEEDS.length;
  const rate = SPEEDS[speedIndex];
  video.playbackRate = rate;
  speedBtn.textContent = `${rate}x`;
});

fullscreenBtn.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (player.requestFullscreen) {
    player.requestFullscreen();
  } else if (player.webkitRequestFullscreen) {
    player.webkitRequestFullscreen();
  }
});

// Keyboard shortcuts when the player has focus.
player.tabIndex = 0;
player.addEventListener('keydown', (e) => {
  if (e.target.matches('input')) return;
  if (e.key === ' ' || e.key === 'k') {
    e.preventDefault();
    togglePlay();
  } else if (e.key === 'ArrowRight') {
    video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
  } else if (e.key === 'ArrowLeft') {
    video.currentTime = Math.max(0, video.currentTime - 5);
  } else if (e.key === 'm') {
    muteBtn.click();
  } else if (e.key === 'f') {
    fullscreenBtn.click();
  }
});

setPlayIcon(false);
updateMuteIcon();
generateVideo();
