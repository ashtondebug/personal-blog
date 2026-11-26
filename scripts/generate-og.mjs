#!/usr/bin/env node
/**
 * 生成默认 OG / 社交分享图（1200×630）。
 *
 * 不含文字（命令行没有字体渲染能力），用站点图形语汇：深底 + 月牙 + 地平线 + 强调色条。
 * 作者以后想换成带标题的图，直接替换 public/og-default.png 即可。
 */
import { writeFileSync } from 'node:fs';
import { encodePng } from './lib/png.mjs';

const W = 1200;
const H = 630;
const BG = [14, 17, 22];
const FG = [242, 244, 247];
const MUTED = [169, 180, 194];
const ACCENT = [34, 211, 238];

const moonX = W * 0.74;
const moonY = H * 0.38;
const moonR = H * 0.22;
const horizonY = H * 0.66;

const png = encodePng(W, H, (x, y) => {
  // 右下角网点渐隐（漫画半调）
  const dotX = Math.floor(x / 14);
  const dotY = Math.floor(y / 14);
  const dotCenterX = dotX * 14 + 7;
  const dotCenterY = dotY * 14 + 7;
  const dotDistance = Math.hypot(x - dotCenterX, y - dotCenterY);
  if (x > W * 0.52 && y > H * 0.58 && dotDistance < 2.2) {
    const fadeLeft = Math.min(1, (x - W * 0.52) / 160);
    const fadeTop = Math.min(1, (y - H * 0.58) / 90);
    return [...MUTED, Math.round(80 * fadeLeft * fadeTop)];
  }

  // 月牙：先挖缺再画实心
  if (Math.hypot(x - (moonX - moonR * 0.5), y - (moonY - moonR * 0.42)) <= moonR) return [...BG, 255];
  if (Math.hypot(x - moonX, y - moonY) <= moonR) return [...FG, 255];

  // 地平线
  if (Math.abs(y - horizonY) <= 1.5 && x > W * 0.08 && x < W * 0.92) return [...FG, 255];

  // 左下强调色竖条
  if (x >= W * 0.08 && x <= W * 0.08 + 10 && y > H * 0.72 && y < H * 0.86) return [...ACCENT, 255];

  return [...BG, 255];
});

writeFileSync('public/og-default.png', png);
console.log(`wrote public/og-default.png (${png.length} bytes, ${W}x${H})`);
