#!/usr/bin/env node
/**
 * 生成站点图标（无第三方依赖，用 zlib 手写 PNG）。
 *
 * 图形：深色圆角方块 + 白色地平线 + 圆月，呼应站名 "The Commons" 的空间意象。
 * 这是可复现的占位图标；作者若要换成自己的图形，替换 public/icons/ 下的文件即可。
 *
 * 用法：node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT_DIR = 'public/icons';

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(width, height, pixelAt) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    raw[offset] = 0; // filter: none
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = pixelAt(x, y);
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
      offset += 4;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BG = [18, 18, 18];
const FG = [237, 237, 237];

/** 圆角方块内的绘制：size 像素，inset 为安全边距比例（maskable 用更大值） */
function draw(size, inset) {
  const pad = size * inset;
  const radius = size * 0.22;
  const inner = size - pad * 2;

  return encodePng(size, size, (x, y) => {
    // 圆角遮罩
    const cx = Math.min(Math.max(x, pad + radius), size - pad - radius);
    const cy = Math.min(Math.max(y, pad + radius), size - pad - radius);
    const inCorner = Math.hypot(x - cx, y - cy) > radius;
    if (inCorner) return [0, 0, 0, 0];

    // 地平线：底部 1/3 处一条横线
    const horizon = pad + inner * 0.66;
    if (Math.abs(y - horizon) <= Math.max(1, size * 0.02) && x > pad + inner * 0.12 && x < size - pad - inner * 0.12) {
      return [...FG, 255];
    }

    // 月亮：右上方的圆，先挖缺口再画实心，形成月牙
    const moonX = pad + inner * 0.66;
    const moonY = pad + inner * 0.3;
    const moonR = inner * 0.16;
    if (Math.hypot(x - (moonX - moonR * 0.5), y - (moonY - moonR * 0.4)) <= moonR) return [...BG, 255];
    if (Math.hypot(x - moonX, y - moonY) <= moonR) return [...FG, 255];

    return [...BG, 255];
  });
}

mkdirSync(OUT_DIR, { recursive: true });

const outputs = [
  ['icon-192.png', draw(192, 0)],
  ['icon-512.png', draw(512, 0)],
  ['icon-maskable-512.png', draw(512, 0.1)],
  ['apple-touch-icon-180.png', draw(180, 0)],
];

for (const [name, buffer] of outputs) {
  writeFileSync(`${OUT_DIR}/${name}`, buffer);
  console.log(`wrote ${OUT_DIR}/${name} (${buffer.length} bytes)`);
}

writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="The Commons">
  <rect width="100" height="100" rx="22" fill="#121212"/>
  <circle cx="66" cy="30" r="16" fill="#ededed"/>
  <circle cx="59" cy="25" r="16" fill="#121212"/>
  <line x1="14" y1="66" x2="86" y2="66" stroke="#ededed" stroke-width="3"/>
</svg>
`,
);
console.log('wrote public/favicon.svg');
