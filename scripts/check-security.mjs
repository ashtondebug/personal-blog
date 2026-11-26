#!/usr/bin/env node
/**
 * 构建产物安全检查（无第三方依赖，需先 npm run build）。
 *
 * 检查项：
 *  1. 外链必须带 rel="noopener"（本站统一 noopener noreferrer）
 *  2. 不出现 http:// 资源（混合内容）
 *  3. 不出现内联事件处理器（onclick= 之类）
 *  4. 不引用第三方脚本（<script src="http...">）
 *  5. 页面引用的 manifest / sw 存在
 *
 * 用法：node scripts/check-security.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const problems = [];
let htmlCount = 0;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (name.endsWith('.html')) files.push(full);
  }
  return files;
}

for (const file of walk(DIST)) {
  htmlCount += 1;
  const html = readFileSync(file, 'utf8');
  const short = file.replace(`${DIST}/`, '');

  for (const match of html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"[^>]*>/g)) {
    const tag = match[0];
    if (!/rel="[^"]*noopener/.test(tag)) {
      problems.push(`${short}: 外链缺少 rel="noopener" → ${match[1]}`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)="(http:\/\/[^"]+)"/g)) {
    problems.push(`${short}: 出现 http:// 资源 → ${match[1]}`);
  }

  for (const match of html.matchAll(/\son(?:click|load|error|mouseover|submit)="/g)) {
    problems.push(`${short}: 出现内联事件处理器 ${match[0].trim()}`);
  }

  for (const match of html.matchAll(/<script[^>]+src="(https?:\/\/[^"]+)"/g)) {
    problems.push(`${short}: 引用第三方脚本 → ${match[1]}`);
  }
}

if (!existsSync(`${DIST}/site.webmanifest`)) problems.push('缺少 site.webmanifest');
if (!existsSync(`${DIST}/sw.js`)) problems.push('缺少 sw.js');

if (problems.length > 0) {
  console.error(`安全检查失败 ${problems.length} 条：`);
  for (const problem of problems.slice(0, 40)) console.error(`  x ${problem}`);
  process.exit(1);
}

console.log(`通过：扫描 ${htmlCount} 个 HTML，外链属性、混合内容、内联事件、第三方脚本均无问题。`);
