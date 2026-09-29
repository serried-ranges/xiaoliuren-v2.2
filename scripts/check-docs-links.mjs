// scripts/check-docs-links.mjs
// 文档链接检查：扫描仓库内 Markdown 的相对链接，报告失效目标。
// 用法：node scripts/check-docs-links.mjs（CI 通过 npm run check:docs 调用）
//
// 规则：
// - 只检查相对路径链接；http(s) / mailto / tel / data / file / 页内 #锚点 一律跳过
//   （历史审计文档中的 file:/// 本机路径属于证据留存，不参与检查）；
// - 跳过 node_modules、.git 与隐藏目录、dist、release；
// - 带 #锚点的目标只校验文件部分是否存在；
// - 发现任一失效链接时输出清单并返回退出码 1。

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', 'dist', 'release']);
const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/** 收集仓库内全部 Markdown 文件 */
const mdFiles = [];
(function walk(dir) {
    for (const name of readdirSync(dir)) {
        if (SKIP_DIRS.has(name) || name.startsWith('.')) continue;
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (name.toLowerCase().endsWith('.md')) mdFiles.push(p);
    }
})(ROOT);

let broken = 0;
for (const file of mdFiles) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(LINK_RE)) {
        const raw = match[1];
        if (/^(?:https?:|mailto:|tel:|data:|file:|#)/i.test(raw)) continue;
        const target = decodeURI(raw.split('#')[0]);
        if (!target) continue;
        if (!existsSync(resolve(dirname(file), target))) {
            broken++;
            console.log(`✗ ${relative(ROOT, file).replace(/\\/g, '/')} -> ${raw}`);
        }
    }
}

if (broken > 0) {
    console.error(`\n文档链接检查失败：${broken} 个失效链接（共扫描 ${mdFiles.length} 个 Markdown 文件）`);
    process.exit(1);
}
console.log(`文档链接检查通过：${mdFiles.length} 个 Markdown 文件，无失效相对链接`);
