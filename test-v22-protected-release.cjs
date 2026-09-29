// V2.2 受保护发布包测试：验证编码可逆、原始业务函数不再明文暴露、解码后语法可解析。
const fs = require('fs');
const path = require('path');
const { decodePayload } = require('./scripts/build-protected.cjs');

let passed = 0;
function check(label, condition) {
    if (!condition) throw new Error('❌ ' + label);
    passed++;
    console.log('✅ ' + label);
}

const outputPath = path.join(__dirname, 'release', 'index.html');
check('受保护发布包已生成', fs.existsSync(outputPath));
const html = fs.readFileSync(outputPath, 'utf8');
const loader = html.match(/data-xll-protected="xor-base64-v1"[\s\S]*?atob\('([^']+)'\)[\s\S]*?atob\('([^']+)'\)/);
check('受保护 loader 格式正确', Boolean(loader));

const decoded = decodePayload(loader[2], loader[1]);
check('解码后包含核心计算逻辑', decoded.includes('function calculate('));
check('解码后包含江氏排盘逻辑', decoded.includes('function generateJiangPai('));
check('解码后的脚本已进行变量与字符串混淆', !decoded.includes('function calculate(n1, n2, n3)'));
check('受保护 HTML 不直接暴露核心函数名', !html.includes('function calculate(n1, n2, n3)'));
check('受保护 HTML 不包含外部脚本引用', !/<script[^>]+src=/i.test(html));

try {
    new Function(decoded);
    check('解码后的组合脚本语法可解析', true);
} catch (error) {
    throw new Error('❌ 解码后的组合脚本语法错误：' + error.message);
}

console.log('V2.2 受保护发布测试通过：' + passed);