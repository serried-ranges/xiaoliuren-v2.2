/**
 * V2.2 单元测试：农历/时辰/工具函数 (lunar+utils)
 * 从 V2.2 src/core/calculator.js 提取可测试逻辑
 */

// ===== V2.2 原始逻辑（1:1 提取） =====
function getShiChen(hours) {
    const sc = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    let idx = Math.floor((hours + 1) / 2) % 12;
    return sc[idx];
}

function toChineseLunar(year, month, day, isLeap) {
    const cnNums = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    const yearStr = String(year).split('').map(d => cnNums[parseInt(d)]).join('');
    const monthNames = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
    const monthStr = (isLeap ? '闰' : '') + monthNames[month] + '月';
    function dayToChinese(d) {
        if (d === 10) return '初十';
        if (d < 10) return '初' + cnNums[d];
        if (d === 20) return '二十';
        if (d < 20) return '十' + cnNums[d - 10];
        if (d === 30) return '三十';
        return '廿' + cnNums[d - 20];
    }
    return yearStr + '年 ' + monthStr + dayToChinese(day);
}

function formatTime(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
console.log('║  V2.2 单元测试：农历/时辰/工具函数          ║');
console.log('╚══════════════════════════════════════════════╝');

// ==================== 1. getShiChen 时辰映射 ====================
console.log('\n【1】getShiChen 时辰映射');
const scMap = { 0: '子', 1: '丑', 2: '丑', 3: '寅', 4: '寅', 5: '卯',
    6: '卯', 7: '辰', 8: '辰', 9: '巳', 10: '巳', 11: '午',
    12: '午', 13: '未', 14: '未', 15: '申', 16: '申', 17: '酉',
    18: '酉', 19: '戌', 20: '戌', 21: '亥', 22: '亥', 23: '子' };
for (let h = 0; h < 24; h++) {
    check(h + '时→' + scMap[h], getShiChen(h), scMap[h]);
}

// ==================== 2. getShiChen 边界 ====================
console.log('\n【2】getShiChen 边界');
check('负值', getShiChen(-1), '子');
check('24时', getShiChen(24), '子');
check('25时', getShiChen(25), '丑');

// ==================== 3. toChineseLunar ====================
console.log('\n【3】toChineseLunar 农历中文');
check('2025年正月', toChineseLunar(2025, 1, 1, false), '二〇二五年 正月初一');
check('2024年腊月', toChineseLunar(2024, 12, 30, false), '二〇二四年 腊月三十');
check(' 闰六月', toChineseLunar(2025, 6, 1, true), '二〇二五年 闰六月初一');
check('初十', toChineseLunar(2025, 1, 10, false), '二〇二五年 正月初十');
check('二十', toChineseLunar(2025, 1, 20, false), '二〇二五年 正月二十');
check('廿一', toChineseLunar(2025, 1, 21, false), '二〇二五年 正月廿一');
check('三十', toChineseLunar(2025, 1, 30, false), '二〇二五年 正月三十');

// ==================== 4. toChineseLunar 边界 ====================
console.log('\n【4】toChineseLunar 边界');
check('1900年', toChineseLunar(1900, 1, 5, false), '一九〇〇年 正月初五');
check('2010年', toChineseLunar(2010, 10, 10, false), '二〇一〇年 十月初十');
check('冬月', toChineseLunar(2025, 11, 15, false), '二〇二五年 冬月十五');

// ==================== 5. formatTime ====================
console.log('\n【5】formatTime');
const ts = new Date(2025, 0, 29, 14, 30, 5).getTime();
const formatted = formatTime(ts);
check('formatTime 结果', formatted, '2025-01-29 14:30:05');

// ==================== 汇总 ====================
const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log('\n╔══════════════════════════════════════════════╗');
console.log('║  V2.2 汇总：通过 ' + passed + '  失败 ' + failed + '                          ║');
console.log('║  ' + (failed === 0 ? '✅ 全部通过！' : '❌ 存在失败用例！') + '                              ║');
console.log('╚══════════════════════════════════════════════╝');

process.exit(failed > 0 ? 1 : 0);