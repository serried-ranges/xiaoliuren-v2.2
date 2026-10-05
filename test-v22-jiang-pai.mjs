/**
 * V2.2 单元测试：江氏排盘 (jiang-pai)
 * 从 V2.2 src/core/browser-core.js（运行时核心）与 calculator.js 提取可测试逻辑
 * 2026-10-05 修正：排地支=自身宫起、排六神=按六神起点表轮转、排六星=自 A 宫起木星
 */

// ===== V2.2 原始逻辑（1:1 提取） =====
const SHEN_NAMES = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'];
const DZ_WUXING = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };
const YANG_DZ = ['子', '寅', '辰', '午', '申', '戌'];
const YIN_DZ = ['丑', '卯', '巳', '未', '酉', '亥'];
const LIU_SHEN_NAMES = ['青龙', '朱雀', '勾陈', '白虎', '玄武', '腾蛇'];
const LIU_XING_NAMES = ['木星', '火星', '土星', '金星', '水星', '天星'];

function generateJiangPai(answers, shiChenDz) {
    const renGongName = answers[2].shen.name;
    const renIdx = Math.max(0, SHEN_NAMES.indexOf(renGongName));
    const isYang = YANG_DZ.includes(shiChenDz);
    const dzList = isYang ? YANG_DZ : YIN_DZ;
    const startIdx = Math.max(0, dzList.indexOf(shiChenDz));
    // 排地支：以“自身宫（人宫）”起、落“时辰地支”，按阴/阳序列隔位相排
    let diZhiMap = {};
    for (let i = 0; i < 6; i++) {
        let shenName = SHEN_NAMES[i];
        diZhiMap[shenName] = dzList[(startIdx + (i - renIdx) + 12) % 6];
    }
    const selfDz = diZhiMap[renGongName];
    const selfWx = DZ_WUXING[selfDz] || '';
    let qinMap = {};
    for (let shenName of SHEN_NAMES) {
        if (shenName === renGongName) { qinMap[shenName] = '自身'; continue; }
        let wx = DZ_WUXING[diZhiMap[shenName]] || '';
        if (!selfWx || !wx) { qinMap[shenName] = ''; continue; }
        const sheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
        const ke = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
        if (selfWx === wx) qinMap[shenName] = '兄弟';
        else if (sheng[selfWx] === wx) qinMap[shenName] = '子孙';
        else if (sheng[wx] === selfWx) qinMap[shenName] = '父母';
        else if (ke[selfWx] === wx) qinMap[shenName] = '妻财';
        else if (ke[wx] === selfWx) qinMap[shenName] = '官鬼';
        else qinMap[shenName] = '';
    }
    // 排六神：按身宫（人宫）地支查六神起点表，青龙自起点宫起，顺时针轮转
    const LIU_SHEN_START = { '子': 0, '午': 0, '丑': 1, '未': 1, '寅': 2, '申': 2, '卯': 3, '酉': 3, '辰': 4, '戌': 4, '巳': 5, '亥': 5 };
    const shenStart = LIU_SHEN_START[shiChenDz] != null ? LIU_SHEN_START[shiChenDz] : 0;
    let shenMap = {};
    for (let i = 0; i < 6; i++) { shenMap[SHEN_NAMES[i]] = LIU_SHEN_NAMES[(i - shenStart + 6) % 6]; }
    // 排六星：自 A 宫（第一落宫）起木星，顺时针轮转
    const aIdx = Math.max(0, answers[0].shen.index);
    let xingMap = {};
    for (let i = 0; i < 6; i++) { xingMap[SHEN_NAMES[i]] = LIU_XING_NAMES[(i - aIdx + 6) % 6]; }
    let result = [];
    for (let shenName of SHEN_NAMES) {
        result.push({ gong: shenName, dz: diZhiMap[shenName], qin: qinMap[shenName] || '', shen: shenMap[shenName] || '', xing: xingMap[shenName] || '' });
    }
    return result;
}

function generateJieGua(jiangData, renGongName) {
    let renItem = jiangData.find(d => d.gong === renGongName);
    if (!renItem) return '暂无解卦信息。';
    const qin = renItem.qin;
    const shen = renItem.shen;
    const xing = renItem.xing;
    let parts = [];
    if (qin === '自身') parts.push('此卦以人宫为自身，主问事之人本身状态。');
    else if (qin === '父母') parts.push('父母主长辈、文书、学业、房产等，临此宫需关注相关事宜。');
    else if (qin === '兄弟') parts.push('兄弟主朋友、同事、竞争、破财等，临此宫需注意人际关系与财务。');
    else if (qin === '子孙') parts.push('子孙主晚辈、下属、投资、福气等，临此宫多主福泽与付出。');
    else if (qin === '妻财') parts.push('妻财主财运、感情、女性等，临此宫多主财物与情感之事。');
    else if (qin === '官鬼') parts.push('官鬼主事业、压力、疾病、官非等，临此宫需谨慎应对。');
    if (shen === '青龙') parts.push('青龙主吉庆、喜事、贵人，临此宫多主顺利。');
    else if (shen === '朱雀') parts.push('朱雀主口舌、文书、信息，临此宫需注意沟通与是非。');
    else if (shen === '勾陈') parts.push('勾陈主勾连、阻滞、旧事，临此宫多主牵连与拖延。');
    else if (shen === '白虎') parts.push('白虎主凶灾、血光、压力，临此宫需防范意外。');
    else if (shen === '玄武') parts.push('玄武主暗昧、盗贼、暧昧，临此宫需防小人暗算。');
    else if (shen === '腾蛇') parts.push('螣蛇主虚惊、多疑、缠绕，临此宫需放宽心态。');
    if (xing === '木星') parts.push('木星主生机、扩张，宜积极进取。');
    else if (xing === '火星') parts.push('火星主急躁、快速，宜速战速决。');
    else if (xing === '土星') parts.push('土星主迟缓、稳定，宜耐心等待。');
    else if (xing === '金星') parts.push('金星主果断、变革，宜果断决策。');
    else if (xing === '水星') parts.push('水星主智慧、流动，宜灵活应变。');
    else if (xing === '天星') parts.push('天空主虚无、落空，宜保守观望。');
    if (parts.length === 0) return '此卦信息不足，请重新起卦。';
    return parts.join(' ');
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
console.log('║  V2.2 单元测试：江氏排盘(jiang-pai)         ║');
console.log('╚══════════════════════════════════════════════╝');

// 构造 V2.2 格式的 answers（step + shen 嵌套）
function makeAnswers(idx1, idx2, idx3) {
    return [
        { step: 1, shen: { name: SHEN_NAMES[idx1], index: idx1 } },
        { step: 2, shen: { name: SHEN_NAMES[idx2], index: idx2 } },
        { step: 3, shen: { name: SHEN_NAMES[idx3], index: idx3 } }
    ];
}

// ==================== 1. 子时排盘 ====================
console.log('\n【1】子时排盘（5,6,7 → 大安/留连/速喜；人宫=速喜）');
const ans567 = makeAnswers(0, 1, 2);
const rowsZi = generateJiangPai(ans567, '子');
check('子时 6 行', rowsZi.length, 6);
// 排地支：自身宫（速喜）起子，隔位相排
check('速喜(人宫)地支=子', rowsZi[2].dz, '子');
check('大安地支', rowsZi[0].dz, '申');
check('留连地支', rowsZi[1].dz, '戌');
check('赤口地支', rowsZi[3].dz, '寅');
check('小吉地支', rowsZi[4].dz, '辰');
check('空亡地支', rowsZi[5].dz, '午');
check('大安六神', rowsZi[0].shen, '青龙');
check('留连六神', rowsZi[1].shen, '朱雀');
check('速喜六神', rowsZi[2].shen, '勾陈');
check('大安六星', rowsZi[0].xing, '木星');
check('留连六星', rowsZi[1].xing, '火星');
check('速喜六星', rowsZi[2].xing, '土星');
check('人宫(速喜)六亲', rowsZi[2].qin, '自身');

// ==================== 2. 午时排盘 ====================
console.log('\n【2】午时排盘（5,6,7）');
const rowsWu = generateJiangPai(ans567, '午');
check('午时速喜(人宫)地支=午', rowsWu[2].dz, '午');
check('午时大安地支', rowsWu[0].dz, '寅');
check('午时留连地支', rowsWu[1].dz, '辰');
check('午时赤口地支', rowsWu[3].dz, '申');

// ==================== 3. 丑时（阴支） ====================
console.log('\n【3】丑时排盘（阴支）');
const rowsChou = generateJiangPai(ans567, '丑');
check('丑时速喜(人宫)地支=丑', rowsChou[2].dz, '丑');
check('丑时大安地支', rowsChou[0].dz, '酉');
check('丑时留连地支', rowsChou[1].dz, '亥');
check('丑时赤口地支', rowsChou[3].dz, '卯');
check('丑时小吉地支', rowsChou[4].dz, '巳');
check('丑时空亡地支', rowsChou[5].dz, '未');

// ==================== 4. 六亲关系 ====================
console.log('\n【4】六亲关系');
const ans000 = makeAnswers(0, 0, 0);
const rowsQin = generateJiangPai(ans000, '子');
check('大安(自身)六亲', rowsQin[0].qin, '自身');
// 人宫大安落子水：寅木受水生为子孙；辰土克子水为官鬼。
check('留连六亲(水生木=子孙)', rowsQin[1].qin, '子孙');
check('速喜六亲(土克水=官鬼)', rowsQin[2].qin, '官鬼');

// 人宫速喜（子时落子水），看其他宫
const ans222 = makeAnswers(2, 2, 2);
const rowsQin2 = generateJiangPai(ans222, '子');
check('人宫(速喜)自身', rowsQin2[2].qin, '自身');
// 人宫速喜落子水：大安申金生水为父母；小吉辰土克水为官鬼。
check('大安对速喜(金生水=父母)', rowsQin2[0].qin, '父母');
check('小吉对速喜(土克水=官鬼)', rowsQin2[4].qin, '官鬼');

// ==================== 5. 解卦 ====================
console.log('\n【5】解卦');
const jieText = generateJieGua(rowsQin, '大安');
checkTrue('解卦含自身', jieText.includes('自身'));
checkTrue('解卦含青龙', jieText.includes('青龙'));
checkTrue('解卦含木星', jieText.includes('木星'));

// ==================== 6. 解卦边界 ====================
console.log('\n【6】解卦边界');
const emptyJie = generateJieGua([], '大安');
check('空数据解卦', emptyJie, '暂无解卦信息。');

// ==================== 7. 所有时辰轮转 ====================
console.log('\n【7】所有时辰轮转');
const allDZ = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
allDZ.forEach(dz => {
    const rows = generateJiangPai(ans567, dz);
    checkTrue(dz + '时 6 行', rows.length === 6);
    checkTrue(dz + '时 人宫地支非空', rows[2].dz && rows[2].dz.length > 0);
    checkTrue(dz + '时 大安六神非空', rows[0].shen && rows[0].shen.length > 0);
    checkTrue(dz + '时 大安六星非空', rows[0].xing && rows[0].xing.length > 0);
});

// ==================== 8. 六神/六星 起点轮转 ====================
console.log('\n【8】六神/六星 起点轮转');
// 子时（起点=大安）：六神序列与大安起一致
SHEN_NAMES.forEach((name, i) => {
    const rows = generateJiangPai(ans567, '子');
    check(name + '六神(子时)', rows[i].shen, LIU_SHEN_NAMES[i]);
});
// 戌时（起点=小吉）：青龙起于小吉，大安为勾陈
const rowsXu = generateJiangPai(ans567, '戌');
check('戌时小吉六神=青龙', rowsXu[4].shen, '青龙');
check('戌时大安六神=勾陈', rowsXu[0].shen, '勾陈');
check('戌时速喜六神=玄武', rowsXu[2].shen, '玄武');
// 六星：A 宫（天宫）起木星——A=大安 时序列不变；A=速喜 时轮转
SHEN_NAMES.forEach((name, i) => {
    const rows = generateJiangPai(ans567, '子');
    check(name + '六星(A=大安)', rows[i].xing, LIU_XING_NAMES[i]);
});
check('A宫速喜→速喜=木星', rowsQin2[2].xing, '木星');
check('A宫速喜→大安=水星', rowsQin2[0].xing, '水星');

// ==================== 汇总 ====================
const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log('\n╔══════════════════════════════════════════════╗');
console.log('║  V2.2 汇总：通过 ' + passed + '  失败 ' + failed + '                          ║');
console.log('║  ' + (failed === 0 ? '✅ 全部通过！' : '❌ 存在失败用例！') + '                              ║');
console.log('╚══════════════════════════════════════════════╝');

process.exit(failed > 0 ? 1 : 0);
