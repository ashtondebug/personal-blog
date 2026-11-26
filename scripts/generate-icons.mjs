#!/usr/bin/env node
/**
 * 生成站点图标（无第三方依赖）。
 *
 * 图形：深色圆角方块 + 月牙 + 地平线，呼应站名 "The Commons" 的空间意象。
 * 作者若要换成自己的图形，替换 public/icons/ 下的文件即可。
 *
 * 用法：node scripts/generate-icons.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { encodePng } from './lib/png.mjs';

const OUT_DIR = 'public/icons';
const BG = [18, 18, 18];
const FG = [237, 237, 237];

/** 圆角方块内的绘制：size 像素，inset 为安全边距比例（maskable 用更大值） */
function draw(size, inset) {
  const pad = size * inset;
  const radius = size * 0.22;
  const inner = size - pad * 2;

  return encodePng(size, size, (x, y) => {
    const cx = Math.min(Math.max(x, pad + radius), size - pad - radius);
    const cy = Math.min(Math.max(y, pad + radius), size - pad - radius);
    if (Math.hypot(x - cx, y - cy) > radius) return [0, 0, 0, 0];

    const horizon = pad + inner * 0.66;
    if (
      Math.abs(y - horizon) <= Math.max(1, size * 0.02) &&
      x > pad + inner * 0.12 &&
      x < size - pad - inner * 0.12
    ) {
      return [...FG, 255];
    }

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
