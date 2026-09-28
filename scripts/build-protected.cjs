// V2.2 可选受保护发布构建（仅构建期依赖，不增加浏览器运行时依赖）。
//
// 目的：让单 HTML 分发包不再直接暴露可读的业务源码，抬高“查看源代码”的门槛。
// 边界：浏览器必须能执行 JavaScript，因此这不是加密、不是防破解，也不能阻止有经验的调试者。
// 不注入反调试/禁用快捷键，不影响用户复制、无障碍工具或正常排错。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const JavaScriptObfuscator = require('javascript-obfuscator');

const ROOT = path.resolve(__dirname, '..');
const RELEASE_DIR = path.join(ROOT, 'release');
const RAW_PATH = path.join(RELEASE_DIR, 'index.raw.html');
const OUTPUT_PATH = path.join(RELEASE_DIR, 'index.html');

function xorBytes(bytes, key) {
    const result = Buffer.alloc(bytes.length);
    for (let index = 0; index < bytes.length; index++) {
        result[index] = bytes[index] ^ key[index % key.length] ^ (index & 0xff);
    }
    return result;
}

function encodePayload(source, key = crypto.randomBytes(16)) {
    const plain = Buffer.from(source, 'utf8');
    return {
        key: key.toString('base64'),
        payload: xorBytes(plain, key).toString('base64')
    };
}

function decodePayload(payload, key) {
    const keyBytes = Buffer.from(key, 'base64');
    return xorBytes(Buffer.from(payload, 'base64'), keyBytes).toString('utf8');
}

function obfuscateSource(source) {
    return JavaScriptObfuscator.obfuscate(source, {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        renameProperties: false,
        selfDefending: false,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.65,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        transformObjectKeys: false,
        unicodeEscapeSequence: false,
        target: 'browser',
        seed: 220
    }).getObfuscatedCode();
}

function createLoader({ key, payload }) {
    return `<script data-xll-protected="xor-base64-v1">
(function(){'use strict';
  var k=Uint8Array.from(atob('${key}'),function(c){return c.charCodeAt(0)});
  var e=atob('${payload}'),b=new Uint8Array(e.length);
  for(var i=0;i<e.length;i++)b[i]=e.charCodeAt(i)^k[i%k.length]^(i&255);
  var s=document.createElement('script');
  s.textContent=new TextDecoder().decode(b);
  document.head.appendChild(s);
}());
</script>`;
}

function protectHtml(html) {
    const scripts = [];
    const withoutScripts = html.replace(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi, (_match, code) => {
        if (code.trim()) scripts.push(code);
        return '';
    });
    if (!scripts.length) throw new Error('未找到可保护的内联脚本');

    const obfuscatedSource = obfuscateSource(scripts.join('\n'));
    const encoded = encodePayload(obfuscatedSource);
    const loader = createLoader(encoded);
    const protectedHtml = withoutScripts.includes('</body>')
        ? withoutScripts.replace('</body>', loader + '\n</body>')
        : withoutScripts + '\n' + loader;
    return {
        protectedHtml,
        encoded,
        scripts: scripts.length,
        sourceBytes: Buffer.byteLength(scripts.join('\n'), 'utf8'),
        obfuscatedBytes: Buffer.byteLength(obfuscatedSource, 'utf8')
    };
}

function buildProtected() {
    const build = spawnSync(process.execPath, [path.join(ROOT, 'build-single.cjs'), '--out', 'release/index.raw.html'], {
        cwd: ROOT,
        stdio: 'inherit'
    });
    if (build.status !== 0) process.exit(build.status || 1);

    const rawHtml = fs.readFileSync(RAW_PATH, 'utf8');
    const result = protectHtml(rawHtml);
    fs.writeFileSync(OUTPUT_PATH, result.protectedHtml, 'utf8');
    fs.unlinkSync(RAW_PATH); // 仅删除本次刚生成的明文中间文件。

    console.log('========== V2.2 受保护发布构建完成 ==========');
    console.log('已封装脚本：' + result.scripts + ' 段');
    console.log('混淆前脚本：' + result.sourceBytes.toLocaleString() + ' bytes');
    console.log('混淆后脚本：' + result.obfuscatedBytes.toLocaleString() + ' bytes');
    console.log('输出文件：' + OUTPUT_PATH);
    console.log('文件大小：' + fs.statSync(OUTPUT_PATH).size.toLocaleString() + ' bytes');
    console.log('说明：这是源码可读性保护，不是安全边界；不要在前端放置密钥或敏感数据。');
    return OUTPUT_PATH;
}

module.exports = { encodePayload, decodePayload, obfuscateSource, protectHtml, buildProtected };

if (require.main === module) buildProtected();