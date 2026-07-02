const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');
const sizeValue = document.getElementById('sizeValue');
const brushBtn = document.getElementById('brush');
const eraserBtn = document.getElementById('eraser');
const undoBtn = document.getElementById('undo');
const clearBtn = document.getElementById('clear');
const downloadBtn = document.getElementById('download');

const MAX_HISTORY = 25;
let drawing = false;
let erasing = false;
let lastX = 0;
let lastY = 0;
let history = [];

function paintWhite() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function saveState() {
  if (history.length >= MAX_HISTORY) history.shift();
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

paintWhite();
saveState();

function getPos(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const source = event.touches ? event.touches[0] : event;
  return {
    x: (source.clientX - rect.left) * scaleX,
    y: (source.clientY - rect.top) * scaleY
  };
}

function startDraw(event) {
  event.preventDefault();
  drawing = true;
  saveState();
  const pos = getPos(event);
  lastX = pos.x;
  lastY = pos.y;
  drawDot(pos.x, pos.y);
}

function drawDot(x, y) {
  ctx.beginPath();
  ctx.fillStyle = erasing ? '#ffffff' : colorInput.value;
  ctx.arc(x, y, sizeInput.value / 2, 0, Math.PI * 2);
  ctx.fill();
}

function moveDraw(event) {
  if (!drawing) return;
  event.preventDefault();
  const pos = getPos(event);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.strokeStyle = erasing ? '#ffffff' : colorInput.value;
  ctx.lineWidth = sizeInput.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  lastX = pos.x;
  lastY = pos.y;
}

function endDraw() {
  drawing = false;
}

function setTool(toEraser) {
  erasing = toEraser;
  brushBtn.setAttribute('aria-pressed', String(!toEraser));
  eraserBtn.setAttribute('aria-pressed', String(toEraser));
  canvas.style.cursor = toEraser ? 'cell' : 'crosshair';
}

function undo() {
  if (history.length <= 1) {
    history = [];
    paintWhite();
    saveState();
    return;
  }
  history.pop();
  ctx.putImageData(history[history.length - 1], 0, 0);
}

function clearCanvas() {
  saveState();
  paintWhite();
}

function download() {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

sizeInput.addEventListener('input', () => {
  sizeValue.textContent = sizeInput.value;
});

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', moveDraw);
window.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);

canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', moveDraw, { passive: false });
canvas.addEventListener('touchend', endDraw);

brushBtn.addEventListener('click', () => setTool(false));
eraserBtn.addEventListener('click', () => setTool(true));
undoBtn.addEventListener('click', undo);
clearBtn.addEventListener('click', clearCanvas);
downloadBtn.addEventListener('click', download);
