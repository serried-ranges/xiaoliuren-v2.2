/**
 * V2.2 单元测试：核心计算引擎 (calculator)
 * 从 V2.2 src/core/calculator.js 提取可测试逻辑
 */

// ===== V2.2 原始逻辑（1:1 提取） =====
const SHEN_NAMES = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'];
const SHEN_CLS = {
    '大安': 'da-an', '留连': 'liu-lian', '速喜': 'su-xi',
    '赤口': 'chi-kou', '小吉': 'xiao-ji', '空亡': 'kong-wang'
};
const SHEN_MEANING = {
    '大安': '平安吉祥，诸事顺利', '留连': '事有拖延，需耐心等待',
    '速喜': '喜事临门，快速达成', '赤口': '口舌是非，谨慎行事',
    '小吉': '小有吉利，渐进成功', '空亡': '谋事落空，徒劳无功'
};
const SHEN_DETAIL = {
    '大安': '五行属木，东方，青龙，主数1、5、7',
    '留连': '五行属土，北方，玄武，主数2、8、10',
    '速喜': '五行属火，南方，朱雀，主数3、6、9',
    '赤口': '五行属金，西方，白虎，主数4、7、10',
    '小吉': '五行属水，东方，六合，主数5、8、11',
    '空亡': '五行属土，中央，勾陈，主数6、9、12'
};

function getShenByIndex(idx) {
    return {
        index: idx, name: SHEN_NAMES[idx], cls: SHEN_CLS[SHEN_NAMES[idx]],
        meaning: SHEN_MEANING[SHEN_NAMES[idx]], detail: SHEN_DETAIL[SHEN_NAMES[idx]]
    };
}

function walk(startIdx, remainder) {
    const offset = remainder === 0 ? 5 : (remainder - 1) % 6;
    return (startIdx + offset) % 6;
}

function getRemainder(num) {
    const n = Math.floor(Math.abs(num));
    return n % 6;
}

function calculate(n1, n2, n3) {
    const r1 = getRemainder(n1);
    const r2 = getRemainder(n2);
    const r3 = getRemainder(n3);
    const idx1 = walk(0, r1);
    const idx2 = walk(idx1, r2);
    const idx3 = walk(idx2, r3);
    const finalShen = getShenByIndex(idx3);
    const answers = [
        { step: 1, shen: getShenByIndex(idx1) },
        { step: 2, shen: getShenByIndex(idx2) },
        { step: 3, shen: getShenByIndex(idx3) }
    ];
    return { answers, finalShen, numbers: [n1, n2, n3] };
}

// ===== 测试 =====
const checks = [];
function check(label, actual, expected) {
    const ok = actual === expected;
    checks.push({ label, ok, actual, expected });
    console.log((ok ? '✅' : '❌') + ' ' + label);
    if (!ok) console.log('   期望: ' + JSON.stringify(expected) + '\n   实际: ' + JSON.stringify(actual));
}
function checkTrue(label, cond) { check(label, cond, true); }

console.log('╔══════════════════════════════════════════════╗');
console.log('║  V2.2 单元测试：核心计算引擎(calculator)    ║');
console.log('╚══════════════════════════════════════════════╝');

// ==================== 1. getRemainder ====================
console.log('\n【1】getRemainder 取余');
check('0%6', getRemainder(0), 0);
check('1%6', getRemainder(1), 1);
check('5%6', getRemainder(5), 5);
check('6%6', getRemainder(6), 0);
check('7%6', getRemainder(7), 1);
check('12%6', getRemainder(12), 0);
check('999%6', getRemainder(999), 3);
check('-1%6', getRemainder(-1), 1);
check('-7%6', getRemainder(-7), 1);

// ==================== 2. walk 步进 ====================
console.log('\n【2】walk 步进');
check('walk(0,0)→', walk(0, 0), 5);
check('walk(0,1)→', walk(0, 1), 0);
check('walk(0,2)→', walk(0, 2), 1);
check('walk(0,3)→', walk(0, 3), 2);
check('walk(0,4)→', walk(0, 4), 3);
check('walk(0,5)→', walk(0, 5), 4);
check('walk(0,6)→', walk(0, 6), 5);
check('walk(0,7)→', walk(0, 7), 0);
check('walk(5,1)→', walk(5, 1), 5);
check('walk(5,2)→', walk(5, 2), 0);

// ==================== 3. getShenByIndex ====================
console.log('\n【3】getShenByIndex');
SHEN_NAMES.forEach((name, i) => {
    const s = getShenByIndex(i);
    check('index ' + i + ' name', s.name, name);
    check('index ' + i + ' cls', s.cls, SHEN_CLS[name]);
    check('index ' + i + ' meaning', s.meaning, SHEN_MEANING[name]);
    check('index ' + i + ' detail', s.detail, SHEN_DETAIL[name]);
});

// ==================== 4. calculate 基本计算 ====================
console.log('\n【4】calculate 基本计算');
const r57 = calculate(5, 6, 7);
check('5/6/7 numbers', r57.numbers.join(','), '5,6,7');
check('5/6/7 answers 长度', r57.answers.length, 3);
checkTrue('5/6/7 finalShen 非空', !!r57.finalShen.name);

// ==================== 5. 边界值 ====================
console.log('\n【5】边界值');
const r111 = calculate(1, 1, 1);
check('1/1/1 finalName', r111.finalShen.name, '大安');
const r666 = calculate(6, 6, 6);
check('6/6/6 finalName', r666.finalShen.name, '赤口');
const r999 = calculate(999, 999, 999);
check('999/999/999 finalName', r999.finalShen.name, '大安');

// ==================== 6. 答案结构 ====================
console.log('\n【6】答案结构');
const r = calculate(3, 7, 2);
r.answers.forEach((a, i) => {
    checkTrue('answer[' + i + '] 有 step', typeof a.step === 'number');
    checkTrue('answer[' + i + '] 有 shen', !!(a.shen && a.shen.name));
    checkTrue('answer[' + i + '] shen.index', typeof a.shen.index === 'number');
    checkTrue('answer[' + i + '] shen.cls', !!(a.shen.cls && a.shen.cls.length > 0));
    checkTrue('answer[' + i + '] shen.meaning', !!(a.shen.meaning && a.shen.meaning.length > 0));
    checkTrue('answer[' + i + '] shen.detail', !!(a.shen.detail && a.shen.detail.length > 0));
});

// ==================== 7. 216 全组合验证 ====================
console.log('\n【7】216 全组合验证');
let allValid = true;
for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
        for (let c = 1; c <= 6; c++) {
            const r = calculate(a, b, c);
            const ok = r.answers.every(ans => SHEN_NAMES[ans.shen.index] === ans.shen.name);
            if (!ok) { allValid = false; break; }
        }
    }
}
checkTrue('216 组合 index 一致', allValid);

// ==================== 8. 大数取模 ====================
console.log('\n【8】大数取模');
const rBig = calculate(5089, 6625, 9939);
const rSmall = calculate(5089 % 6 || 6, 6625 % 6 || 6, 9939 % 6 || 6);
check('大数取模 finalName', rBig.finalShen.name, rSmall.finalShen.name);

// ==================== 汇总 ====================
const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log('\n╔══════════════════════════════════════════════╗');
console.log('║  V2.2 汇总：通过 ' + passed + '  失败 ' + failed + '                          ║');
console.log('║  ' + (failed === 0 ? '✅ 全部通过！' : '❌ 存在失败用例！') + '                              ║');
console.log('╚══════════════════════════════════════════════╝');

process.exit(failed > 0 ? 1 : 0);