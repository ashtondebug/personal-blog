#!/usr/bin/env node
/**
 * 文档一致性检查（无第三方依赖）。
 *
 * 检查项：
 *  1. Markdown 相对链接可达（大小写敏感，与 GitHub 上行为一致）
 *  2. docs/ 与 plans/ 下每个文档都有"用途 / 状态 / 更新 / 相关"四行文档头
 *  3. AGENTS.md 行数不超过 100 行（地图必须短）
 *  4. 不允许链接到不入库的 FOR_AGENT.md
 *
 * 用法：node scripts/check-docs.mjs [--quiet]
 * 退出码：0 通过，1 存在错误。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.astro', '.output', '.cache']);
const HEADER_KEYS = ['**用途**', '**状态**', '**更新**', '**相关**'];
const AGENTS_MAX_LINES = 100;
const FORBIDDEN_TARGET = 'FOR_AGENT.md';

const errors = [];
const warnings = [];

/** 递归收集文件（posix 相对路径 → 是否目录） */
const files = new Map(); // relPath -> true (file)
const dirs = new Set(['']);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const abs = join(dir, name);
    const rel = toPosix(relative(ROOT, abs));
    if (statSync(abs).isDirectory()) {
      dirs.add(rel);
      walk(abs);
    } else {
      files.set(rel, true);
    }
  }
}

function toPosix(p) {
  return p.split(sep).join('/');
}

walk(ROOT);

const docFiles = [...files.keys()].filter((p) => p.endsWith('.md'));
const lowerIndex = new Map([...files.keys()].map((p) => [p.toLowerCase(), p]));

function resolveLink(fromRel, target) {
  const clean = target.split('#')[0].split('?')[0];
  if (clean === '') return null; // 纯锚点
  if (/^[a-z][a-z0-9+.-]*:/i.test(clean)) return null; // http(s)/mailto/...
  if (clean.startsWith('/')) return { absolute: clean };
  let decoded = clean;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    /* 保持原样 */
  }
  const abs = normalize(resolve(ROOT, dirname(fromRel), decoded));
  const rel = toPosix(relative(ROOT, abs));
  return { rel, isDir: decoded.endsWith('/') || decoded.endsWith('.') };
}

function checkLinks(relPath) {
  const text = readFileSync(join(ROOT, relPath), 'utf8');
  const lines = text.split(/\r?\n/);
  let inFence = false;
  const linkRe = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    // 行内代码里的示例链接不算真链接（如 `[目标](../目标/)` 的语法说明）
    const scanLine = line.replace(/`[^`]*`/g, '');
    for (const m of scanLine.matchAll(linkRe)) {
      const raw = m[1].trim();
      const target = raw.replace(/^<|>$/g, '');
      const at = `${relPath}:${i + 1}`;
      if (target.toLowerCase().endsWith(FORBIDDEN_TARGET.toLowerCase())) {
        errors.push(`${at} 链接到不入库的文件 ${target}`);
        continue;
      }
      const r = resolveLink(relPath, target);
      if (!r) continue;
      if (r.absolute) {
        errors.push(`${at} 使用了根绝对路径 ${target}（静态站配置 base 后会 404）`);
        continue;
      }
      const okFile = files.has(r.rel);
      const okDir = dirs.has(r.rel.replace(/\/+$/, ''));
      if (!okFile && !okDir) {
        const hint = lowerIndex.get(r.rel.toLowerCase());
        errors.push(
          `${at} 断链 → ${target}${hint ? `（大小写不符，实际为 ${hint}）` : ''}`,
        );
      }
    }
  });
}

function checkHeader(relPath) {
  if (!relPath.startsWith('docs/') && !relPath.startsWith('plans/')) return;
  const head = readFileSync(join(ROOT, relPath), 'utf8').split(/\r?\n/, 14).join('\n');
  const missing = HEADER_KEYS.filter((k) => !head.includes(k));
  if (missing.length > 0) {
    warnings.push(`${relPath} 缺少文档头字段：${missing.join('、')}`);
  }
}

for (const relPath of docFiles) {
  checkLinks(relPath);
  checkHeader(relPath);
}

// AGENTS.md 篇幅
const agentsPath = 'AGENTS.md';
if (files.has(agentsPath)) {
  const lineCount = readFileSync(join(ROOT, agentsPath), 'utf8').split(/\r?\n/).length;
  if (lineCount > AGENTS_MAX_LINES) {
    errors.push(`${agentsPath} 有 ${lineCount} 行，超过 ${AGENTS_MAX_LINES} 行上限（它是地图，不是手册）`);
  }
} else {
  errors.push('缺少 AGENTS.md');
}

// 必备入口文件
for (const required of ['README.md', 'ARCHITECTURE.md', 'docs/PROJECT_MAP.md', 'docs/index.md']) {
  if (!files.has(required)) errors.push(`缺少必备文档 ${required}`);
}

const quiet = process.argv.includes('--quiet');
if (!quiet) {
  console.log(`检查文件：${docFiles.length} 个 Markdown`);
  if (warnings.length > 0) {
    console.log(`\n警告 ${warnings.length} 条：`);
    for (const w of warnings) console.log(`  ! ${w}`);
  }
}

if (errors.length > 0) {
  console.error(`\n错误 ${errors.length} 条：`);
  for (const e of errors) console.error(`  x ${e}`);
  process.exit(1);
}

if (!quiet) console.log('\n通过：无断链、无根绝对路径、文档头齐备、AGENTS.md 篇幅合规。');
