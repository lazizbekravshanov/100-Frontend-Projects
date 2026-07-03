'use strict';

/*
 * Vanilla QR Code encoder (byte mode, versions 1-40, EC levels L/M/Q/H).
 * Implements Reed-Solomon error correction over GF(256), the standard
 * function patterns (finder / timing / alignment), data masking with
 * penalty-based selection, and format/version information.
 * Algorithm reference: ISO/IEC 18004. No external libraries.
 */

// --- Error correction level definitions (ordinal indexes the tables below) ---
const ECL = {
  L: { ordinal: 0, formatBits: 1 },
  M: { ordinal: 1, formatBits: 0 },
  Q: { ordinal: 2, formatBits: 3 },
  H: { ordinal: 3, formatBits: 2 }
};

// EC codewords per block, indexed [ecl.ordinal][version]. Index 0 is unused.
const ECC_CODEWORDS_PER_BLOCK = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
];

// Number of EC blocks, indexed [ecl.ordinal][version].
const NUM_ERROR_CORRECTION_BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
];

function getBit(value, i) {
  return ((value >>> i) & 1) !== 0;
}

// Total number of data + EC modules available for a given version.
function getNumRawDataModules(ver) {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

function getNumDataCodewords(ver, ecl) {
  return Math.floor(getNumRawDataModules(ver) / 8)
    - ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
}

// --- Reed-Solomon arithmetic over GF(256) with primitive polynomial 0x11D ---
function rsMultiply(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function rsComputeDivisor(degree) {
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = rsMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = rsMultiply(root, 0x02);
  }
  return result;
}

function rsComputeRemainder(data, divisor) {
  const result = new Array(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ result.shift();
    result.push(0);
    for (let i = 0; i < result.length; i++) {
      result[i] ^= rsMultiply(divisor[i], factor);
    }
  }
  return result;
}

// --- QR symbol builder ---
class QrCode {
  constructor(version, ecl, dataCodewords) {
    this.version = version;
    this.ecl = ecl;
    this.size = version * 4 + 17;
    this.modules = [];
    this.isFunction = [];
    for (let y = 0; y < this.size; y++) {
      this.modules.push(new Array(this.size).fill(false));
      this.isFunction.push(new Array(this.size).fill(false));
    }
    this.drawFunctionPatterns();
    const allCodewords = this.addEccAndInterleave(dataCodewords);
    this.drawCodewords(allCodewords);
    this.mask = this.selectMask();
    this.applyMask(this.mask);
    this.drawFormatBits(this.mask);
  }

  setFunctionModule(x, y, isDark) {
    this.modules[y][x] = isDark;
    this.isFunction[y][x] = true;
  }

  drawFunctionPatterns() {
    const size = this.size;
    for (let i = 0; i < size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0);
      this.setFunctionModule(i, 6, i % 2 === 0);
    }
    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(size - 4, 3);
    this.drawFinderPattern(3, size - 4);

    const alignPos = this.getAlignmentPatternPositions();
    const n = alignPos.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        this.drawAlignmentPattern(alignPos[i], alignPos[j]);
      }
    }
    this.drawFormatBits(0);
    this.drawVersion();
  }

  drawFinderPattern(x, y) {
    const size = this.size;
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) {
          this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    }
  }

  drawAlignmentPattern(x, y) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  getAlignmentPatternPositions() {
    if (this.version === 1) return [];
    const numAlign = Math.floor(this.version / 7) + 2;
    const step = (this.version === 32)
      ? 26
      : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    const result = [6];
    for (let pos = this.size - 7; result.length < numAlign; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  }

  drawFormatBits(mask) {
    const size = this.size;
    const data = (this.ecl.formatBits << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, getBit(bits, i));
    this.setFunctionModule(8, 7, getBit(bits, 6));
    this.setFunctionModule(8, 8, getBit(bits, 7));
    this.setFunctionModule(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, getBit(bits, i));

    for (let i = 0; i < 8; i++) this.setFunctionModule(size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++) this.setFunctionModule(8, size - 15 + i, getBit(bits, i));
    this.setFunctionModule(8, size - 8, true);
  }

  drawVersion() {
    if (this.version < 7) return;
    let rem = this.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = getBit(bits, i);
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFunctionModule(a, b, bit);
      this.setFunctionModule(b, a, bit);
    }
  }

  addEccAndInterleave(data) {
    const ver = this.version;
    const ecl = this.ecl;
    const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
    const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
    const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);

    const blocks = [];
    const rsDiv = rsComputeDivisor(blockEccLen);
    let k = 0;
    for (let i = 0; i < numBlocks; i++) {
      const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
      const dat = data.slice(k, k + datLen);
      k += datLen;
      const ecc = rsComputeRemainder(dat, rsDiv);
      if (i < numShortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }

    const result = [];
    for (let i = 0; i < blocks[0].length; i++) {
      for (let j = 0; j < blocks.length; j++) {
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
          result.push(blocks[j][i]);
        }
      }
    }
    return result;
  }

  drawCodewords(data) {
    const size = this.size;
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (!this.isFunction[y][x] && i < data.length * 8) {
            this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  }

  applyMask(mask) {
    const size = this.size;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (this.isFunction[y][x]) continue;
        let invert;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          case 7: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: invert = false;
        }
        if (invert) this.modules[y][x] = !this.modules[y][x];
      }
    }
  }

  selectMask() {
    let best = 0;
    let minPenalty = Infinity;
    for (let m = 0; m < 8; m++) {
      this.applyMask(m);
      this.drawFormatBits(m);
      const penalty = this.getPenaltyScore();
      if (penalty < minPenalty) {
        minPenalty = penalty;
        best = m;
      }
      this.applyMask(m);
    }
    return best;
  }

  getPenaltyScore() {
    const size = this.size;
    const m = this.modules;
    let result = 0;
    const N1 = 3, N2 = 3, N3 = 40, N4 = 10;

    // Rule 1: rows and columns of 5+ same-colored modules.
    for (let y = 0; y < size; y++) {
      let run = 1;
      for (let x = 1; x < size; x++) {
        if (m[y][x] === m[y][x - 1]) run++;
        else { if (run >= 5) result += N1 + (run - 5); run = 1; }
      }
      if (run >= 5) result += N1 + (run - 5);
    }
    for (let x = 0; x < size; x++) {
      let run = 1;
      for (let y = 1; y < size; y++) {
        if (m[y][x] === m[y - 1][x]) run++;
        else { if (run >= 5) result += N1 + (run - 5); run = 1; }
      }
      if (run >= 5) result += N1 + (run - 5);
    }

    // Rule 2: 2x2 blocks of the same color.
    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const c = m[y][x];
        if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) result += N2;
      }
    }

    // Rule 3: finder-like 1:1:3:1:1 patterns with a 4-wide light margin.
    const pA = [true, false, true, true, true, false, true, false, false, false, false];
    const pB = [false, false, false, false, true, false, true, true, true, false, true];
    const matches = (get, i) => {
      let a = true, b = true;
      for (let k = 0; k < 11; k++) {
        const v = get(i + k);
        if (v !== pA[k]) a = false;
        if (v !== pB[k]) b = false;
      }
      return a || b;
    };
    for (let y = 0; y < size; y++) {
      for (let x = 0; x <= size - 11; x++) {
        if (matches((c) => m[y][c], x)) result += N3;
      }
    }
    for (let x = 0; x < size; x++) {
      for (let y = 0; y <= size - 11; y++) {
        if (matches((r) => m[r][x], y)) result += N3;
      }
    }

    // Rule 4: proportion of dark modules deviating from 50%.
    let dark = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (m[y][x]) dark++;
      }
    }
    const total = size * size;
    const k = Math.floor(Math.abs(dark * 100 / total - 50) / 5);
    result += k * N4;
    return result;
  }
}

// Build a QR symbol from text in byte mode, choosing the smallest fitting version.
function encodeQr(text, eclKey) {
  const ecl = ECL[eclKey];
  const bytes = Array.from(new TextEncoder().encode(text));

  let version = 0;
  for (let ver = 1; ver <= 40; ver++) {
    const capacityBits = getNumDataCodewords(ver, ecl) * 8;
    const countBits = ver <= 9 ? 8 : 16;
    const needed = 4 + countBits + bytes.length * 8;
    if (needed <= capacityBits) { version = ver; break; }
  }
  if (version === 0) throw new Error('Data too long for a QR code at this error-correction level.');

  const countBits = version <= 9 ? 8 : 16;
  const bb = [];
  const appendBits = (value, len) => {
    for (let i = len - 1; i >= 0; i--) bb.push((value >>> i) & 1);
  };

  appendBits(0x4, 4);                 // byte mode indicator
  appendBits(bytes.length, countBits);
  for (const b of bytes) appendBits(b, 8);

  const capacityBits = getNumDataCodewords(version, ecl) * 8;
  appendBits(0, Math.min(4, capacityBits - bb.length));            // terminator
  appendBits(0, (8 - (bb.length % 8)) % 8);                        // byte alignment
  for (let pad = 0xec; bb.length < capacityBits; pad ^= 0xec ^ 0x11) appendBits(pad, 8);

  const dataCodewords = [];
  for (let i = 0; i < bb.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bb[i + j];
    dataCodewords.push(byte);
  }

  return new QrCode(version, ecl, dataCodewords);
}

// --- UI wiring ---
const input = document.getElementById('qr-input');
const eccSelect = document.getElementById('qr-ecc');
const sizeRange = document.getElementById('qr-size');
const marginRange = document.getElementById('qr-margin');
const sizeVal = document.getElementById('qr-size-val');
const marginVal = document.getElementById('qr-margin-val');
const canvas = document.getElementById('qr-canvas');
const ctx = canvas.getContext('2d');
const meta = document.getElementById('qr-meta');
const downloadBtn = document.getElementById('qr-download');

const COLOR_DARK = '#18181b';
const COLOR_LIGHT = '#ffffff';

function render() {
  const text = input.value;
  sizeVal.textContent = sizeRange.value;
  marginVal.textContent = marginRange.value;

  if (text.length === 0) {
    canvas.width = 200;
    canvas.height = 200;
    ctx.fillStyle = COLOR_LIGHT;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    meta.textContent = 'Enter text to generate a QR code.';
    downloadBtn.disabled = true;
    return;
  }

  let qr;
  try {
    qr = encodeQr(text, eccSelect.value);
  } catch (err) {
    meta.textContent = err.message;
    downloadBtn.disabled = true;
    return;
  }

  const moduleSize = parseInt(sizeRange.value, 10);
  const margin = parseInt(marginRange.value, 10);
  const count = qr.size + margin * 2;
  const pixels = count * moduleSize;

  canvas.width = pixels;
  canvas.height = pixels;
  ctx.fillStyle = COLOR_LIGHT;
  ctx.fillRect(0, 0, pixels, pixels);
  ctx.fillStyle = COLOR_DARK;
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.modules[y][x]) {
        ctx.fillRect((x + margin) * moduleSize, (y + margin) * moduleSize, moduleSize, moduleSize);
      }
    }
  }

  meta.textContent = `Version ${qr.version} · ${qr.size}×${qr.size} modules · mask ${qr.mask} · ${pixels}px`;
  downloadBtn.disabled = false;
}

function download() {
  const link = document.createElement('a');
  link.download = 'qr-code.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

input.addEventListener('input', render);
eccSelect.addEventListener('change', render);
sizeRange.addEventListener('input', render);
marginRange.addEventListener('input', render);
downloadBtn.addEventListener('click', download);

render();
