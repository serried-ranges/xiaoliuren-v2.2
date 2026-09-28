// build-single.cjs
// 把 V2.2 多文件工程化结构打包回单 HTML 文件（零依赖，不需要 npm install）
// 用法：node build-single.cjs [--out 相对输出路径]
// 默认输出：dist/index.html（可双击直接执行，file:// 协议零依赖）
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;  // V2.2 目录
const indexPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

function resolveOutputPath() {
    const flagIndex = process.argv.indexOf('--out');
    if (flagIndex === -1) return path.join(ROOT, 'dist', 'index.html');
    const requested = process.argv[flagIndex + 1];
    if (!requested) throw new Error('缺少 --out 的输出路径');
    const resolved = path.resolve(ROOT, requested);
    const relative = path.relative(ROOT, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error('输出路径必须位于 V2.2 目录内');
    }
    return resolved;
}

let stats = { css: 0, js: 0, cssBytes: 0, jsBytes: 0 };

// 1. 替换 <link rel="stylesheet" href="..."> 为 <style>...</style>
html = html.replace(/<link rel="stylesheet" href="([^"]+)"[^>]*\/?>/g, (match, href) => {
    const cssPath = path.join(ROOT, href.replace(/^\.\//, ''));
    if (!fs.existsSync(cssPath)) {
        console.error('❌ CSS 文件不存在：' + cssPath);
        process.exit(1);
    }
    const css = fs.readFileSync(cssPath, 'utf8');
    stats.css++;
    stats.cssBytes += css.length;
    return '<style>\n' + css + '\n</style>';
});

// 2. 替换 <script src="..."></script> 为 <script>...</script>
html = html.replace(/<script src="([^"]+)"><\/script>/g, (match, src) => {
    const jsPath = path.join(ROOT, src.replace(/^\.\//, ''));
    if (!fs.existsSync(jsPath)) {
        console.error('❌ JS 文件不存在：' + jsPath);
        process.exit(1);
    }
    let js = fs.readFileSync(jsPath, 'utf8');
    // 安全检查：如果 JS 代码里包含字面量 </script>，需要转义
    if (js.indexOf('</script>') !== -1) {
        console.warn('⚠️ 警告：' + src + ' 包含字面量 </script>，自动转义为 <\\/script>');
        js = js.replace(/<\/script>/gi, '<\\/script>');
    }
    stats.js++;
    stats.jsBytes += js.length;
    return '<script>\n' + js + '\n</script>';
});

// 3. 输出到指定文件（默认 dist/index.html）
const outPath = resolveOutputPath();
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');

console.log('========== V2.2 单 HTML 打包完成 ==========');
console.log('内联 CSS：' + stats.css + ' 个文件，' + stats.cssBytes.toLocaleString() + ' chars');
console.log('内联 JS： ' + stats.js + ' 个文件，' + stats.jsBytes.toLocaleString() + ' chars');
console.log('输出文件：' + outPath);
console.log('文件大小：' + fs.statSync(outPath).size.toLocaleString() + ' bytes');
console.log('✅ 双击可直接打开运行（file:// 协议零依赖）');
