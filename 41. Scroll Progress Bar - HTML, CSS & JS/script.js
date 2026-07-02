const bar = document.getElementById('progressBar');
const progress = document.querySelector('.progress');
const readTime = document.getElementById('readTime');
const article = document.querySelector('.article');

let ticking = false;

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
  const percent = Math.round(ratio * 100);

  bar.style.width = percent + '%';
  progress.setAttribute('aria-valuenow', String(percent));
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(updateProgress);
    ticking = true;
  }
}

function estimateReadTime() {
  const words = article.textContent.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  readTime.textContent = `${minutes} min read`;
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateProgress);
estimateReadTime();
updateProgress();
