/**
 * 纯 Node.js PNG 图标生成脚本（无需外部依赖）
 * 生成简单的锁形图标
 *
 * 使用方法: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ICONS_DIR = path.join(__dirname, '..', 'icons');
const SIZES = [16, 32, 48, 128];

// Simple PNG writer (no dependencies)
function createPNG(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstIdx] = pixels[srcIdx];
      rawData[dstIdx + 1] = pixels[srcIdx + 1];
      rawData[dstIdx + 2] = pixels[srcIdx + 2];
      rawData[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xffffffff;
  const table = getCRC32Table();
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[i] = c;
  }
  return table;
}

function generateLockIcon(size, locked) {
  const pixels = new Uint8Array(size * size * 4);
  const [r1, g1, b1] = locked ? [82, 196, 26] : [102, 126, 234];
  const [r2, g2, b2] = locked ? [19, 194, 194] : [118, 75, 162];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size;
      const ny = y / size;

      // Background gradient
      const t = (nx + ny) / 2;
      let r = r1 + (r2 - r1) * t;
      let g = g1 + (g2 - g1) * t;
      let b = b1 + (b2 - b1) * t;

      // Rounded corners
      const cx = nx - 0.5;
      const cy = ny - 0.5;
      const cornerRadius = 0.15;
      const dx = Math.abs(cx) - (0.5 - cornerRadius);
      const dy = Math.abs(cy) - (0.5 - cornerRadius);
      if (dx > 0 && dy > 0) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > cornerRadius) {
          pixels[idx] = 0;
          pixels[idx + 1] = 0;
          pixels[idx + 2] = 0;
          pixels[idx + 3] = 0;
          continue;
        }
      }

      const lineW = Math.max(1, size * 0.04) / size;

      // Lock body
      const bodyX = 0.25;
      const bodyY = 0.42;
      const bodyW = 0.5;
      const bodyH = 0.33;

      const onBodyBorder =
        ((Math.abs(nx - bodyX) < lineW || Math.abs(nx - (bodyX + bodyW)) < lineW) &&
          ny >= bodyY && ny <= bodyY + bodyH) ||
        ((Math.abs(ny - bodyY) < lineW || Math.abs(ny - (bodyY + bodyH)) < lineW) &&
          nx >= bodyX && nx <= bodyX + bodyW);

      // Lock shackle
      const arcCx = 0.5;
      const arcCy = 0.42;
      const arcR = 0.2;
      const angle = Math.atan2(ny - arcCy, nx - arcCx);
      const deg = ((angle * 180) / Math.PI + 360) % 360;
      const onArc =
        deg >= 0 && deg <= 180 &&
        Math.abs(Math.sqrt((nx - arcCx) ** 2 + (ny - arcCy) ** 2) - arcR) < lineW * 1.5;

      if (onBodyBorder || onArc) {
        r = 255; g = 255; b = 255;
      }

      // Keyhole
      const khCx = 0.5;
      const khCy = 0.55;
      const khR = 0.05;
      const dist = Math.sqrt((nx - khCx) ** 2 + (ny - khCy) ** 2);
      if (dist < khR) {
        r = 255; g = 255; b = 255;
      }
      if (Math.abs(nx - khCx) < lineW * 0.5 && ny > khCy && ny < khCy + 0.12) {
        r = 255; g = 255; b = 255;
      }

      pixels[idx] = Math.round(r);
      pixels[idx + 1] = Math.round(g);
      pixels[idx + 2] = Math.round(b);
      pixels[idx + 3] = 255;
    }
  }

  return pixels;
}

// Main
console.log('Generating icons...\n');

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

for (const size of SIZES) {
  const normalPixels = generateLockIcon(size, false);
  const normalPNG = createPNG(size, size, normalPixels);
  fs.writeFileSync(path.join(ICONS_DIR, `icon${size}.png`), normalPNG);
  console.log(`  icon${size}.png (${size}x${size})`);

  const lockedPixels = generateLockIcon(size, true);
  const lockedPNG = createPNG(size, size, lockedPixels);
  fs.writeFileSync(path.join(ICONS_DIR, `icon${size}-locked.png`), lockedPNG);
  console.log(`  icon${size}-locked.png (${size}x${size})`);
}

console.log('\nDone! Icons generated at:', ICONS_DIR);
