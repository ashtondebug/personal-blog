#!/usr/bin/env node
/**
 * 设计 token 对比度检查（无第三方依赖）。
 *
 * 从 src/styles/tokens.css 读取浅色/深色两套灰阶，按 WCAG 2.x 公式计算对比度：
 * 正文与次要文字要求 ≥ 4.5:1，反白块要求 ≥ 4.5:1。
 *
 * 用法：node scripts/check-contrast.mjs
 * 退出码：0 通过，1 有不达标组合。
 */
import { readFileSync } from 'node:fs';

const TOKENS_FILE = new URL('../src/styles/tokens.css', import.meta.url);
const MIN_TEXT = 4.5;

/** 找出顶层（不嵌套在 @media 里）指定选择器的变量块 */
function readBlock(css, selector) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let depth = 0;
  let currentSelector = '';
  let bodyStart = -1;
  let scanFrom = 0;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') {
      if (depth === 0) {
        currentSelector = source.slice(scanFrom, i).trim();
        bodyStart = i + 1;
      }
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        scanFrom = i + 1;
        if (currentSelector === selector) {
          return source.slice(bodyStart, i);
        }
        currentSelector = '';
        bodyStart = -1;
      }
    }
  }
  return null;
}

function parseColors(body) {
  const colors = {};
  for (const match of body.matchAll(/--color-([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    colors[match[1]] = match[2];
  }
  return colors;
}

function toRgb(hex) {
  let value = hex.replace('#', '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (value.length !== 6) throw new Error(`暂不支持的颜色格式：${hex}`);
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const css = readFileSync(TOKENS_FILE, 'utf8');
const lightBlock = readBlock(css, ':root');
const darkBlock = readBlock(css, "[data-theme='dark']");
if (!lightBlock || !darkBlock) {
  console.error('无法从 tokens.css 找到 :root 或 [data-theme=\'dark\'] 变量块');
  process.exit(1);
}

const themes = [
  ['浅色', parseColors(lightBlock)],
  ['深色', parseColors(darkBlock)],
];

const PAIRS = [
  ['text', 'bg', '正文 / 背景'],
  ['text', 'surface', '正文 / 次级背景'],
  ['muted', 'bg', '次要文字 / 背景'],
  ['muted', 'surface', '次要文字 / 次级背景'],
  ['invert-text', 'invert-bg', '反白文字 / 反白底'],
];

/** 首页主视觉与强调色：不随主题变化，只校验一次（ADR-0011） */
const SHARED_PAIRS = [
  ['hero-text', 'hero-bg', '主视觉文字 / 主视觉底'],
  ['hero-muted', 'hero-bg', '主视觉次要文字 / 主视觉底'],
  ['accent-ink', 'accent', '强调色上的文字 / 强调色'],
  ['accent', 'hero-bg', '强调色 / 主视觉底'],
];

let failures = 0;
for (const [themeName, colors] of themes) {
  console.log(`\n${themeName}主题`);
  for (const [fg, bg, label] of PAIRS) {
    const fgColor = colors[fg];
    const bgColor = colors[bg];
    if (!fgColor || !bgColor) {
      console.log(`  ?  ${label}: 缺少 token --color-${fg} 或 --color-${bg}`);
      failures += 1;
      continue;
    }
    const ratio = contrast(fgColor, bgColor);
    const ok = ratio >= MIN_TEXT;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? 'OK  ' : 'FAIL'} ${label}: ${ratio.toFixed(2)}:1 (${fgColor} on ${bgColor})`,
    );
  }
}

console.log('\n首页主视觉（不随主题变化）');
const sharedColors = themes[0][1];
for (const [fg, bg, label] of SHARED_PAIRS) {
  const fgColor = sharedColors[fg];
  const bgColor = sharedColors[bg];
  if (!fgColor || !bgColor) {
    console.log(`  ?  ${label}: 缺少 token --color-${fg} 或 --color-${bg}`);
    failures += 1;
    continue;
  }
  const ratio = contrast(fgColor, bgColor);
  const ok = ratio >= MIN_TEXT;
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${label}: ${ratio.toFixed(2)}:1 (${fgColor} on ${bgColor})`);
}

if (failures > 0) {
  console.error(`\n对比度检查失败：${failures} 项低于 ${MIN_TEXT}:1`);
  process.exit(1);
}
console.log(`\n通过：所有组合均 ≥ ${MIN_TEXT}:1（阈值为 WCAG AA 正文标准）`);
