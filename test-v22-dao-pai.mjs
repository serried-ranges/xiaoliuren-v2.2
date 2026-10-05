/**
 * V2.2 单元测试：道传排盘 (dao-pai)
 * 从 V2.2 src/core/calculator.js 提取可测试逻辑
 */

// ===== V2.2 原始逻辑（1:1 提取） =====
const SHEN_NAMES = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'];
const DAO_DZ = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const DAO_DZ_WUXING = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];

const DAO_SI_LIU_SHEN = [
    { name: '青龙', wx: '木', desc: '主喜庆、贵人、顺利、婚姻、升迁' },
    { name: '腾蛇', wx: '土', desc: '主虚惊、多疑、缠绕、梦魇、幻象' },
    { name: '朱雀', wx: '火', desc: '主口舌、文书、信息、诉讼、喜事' },
    { name: '白虎', wx: '金', desc: '主凶灾、血光、压力、疾病、刑伤' },
    { name: '玄武', wx: '水', desc: '主暗昧、盗贼、暧昧、小人、隐藏' },
    { name: '勾陈', wx: '土', desc: '主阻滞、牵连、旧事、拖延、田宅' }
];

const DAO_HUO_LIU_SHEN_ORDER = ['青龙', '朱雀', '勾陈', '白虎', '玄武', '腾蛇'];
const DAO_HUO_LIU_SHEN_DESC = {
    '青龙': '主喜庆、贵人、顺利、婚姻、升迁',
    '朱雀': '主口舌、文书、信息、诉讼、争吵',
    '勾陈': '主勾连、阻滞、旧事、拖延、牵连',
    '白虎': '主凶灾、血光、压力、疾病、刑伤',
    '玄武': '主暗昧、盗贼、暧昧、小人、隐藏',
    '腾蛇': '主虚惊、多疑、缠绕、梦魇、幻象'
};

const DAO_HUO_SHEN_START_GONG = {
    '子': 0, '午': 0, '丑': 1, '未': 1, '寅': 2, '申': 2,
    '卯': 3, '酉': 3, '辰': 4, '戌': 4, '巳': 5, '亥': 5
};

const DAO_GONG_WUXING = ['木', '土', '火', '金', '水', '土'];

function daoCalcQin(selfWx, otherWx) {
    if (selfWx === otherWx) return { name: '兄弟', desc: '同我者，代表朋友、同事、竞争、破财' };
    const SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    const KE = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
    if (SHENG[otherWx] === selfWx) return { name: '父母', desc: '生我者，代表长辈、文书、学业、房产' };
    if (SHENG[selfWx] === otherWx) return { name: '子孙', desc: '我生者，代表晚辈、下属、投资、福气' };
    if (KE[selfWx] === otherWx) return { name: '妻财', desc: '我克者，代表妻子、财物、感情、收益' };
    if (KE[otherWx] === selfWx) return { name: '官鬼', desc: '克我者，代表事业、压力、疾病、官非' };
    return { name: '自身', desc: '代表问卦者本人，一切以我为中心' };
}

function generateDaoPai(answers, shiChen) {
    const shiChenIdx = DAO_DZ.indexOf(shiChen);
    if (shiChenIdx === -1) return [];
    const rows = [];
    const startGongIdx = DAO_HUO_SHEN_START_GONG[shiChen] != null ? DAO_HUO_SHEN_START_GONG[shiChen] : 0;
    const renIdx = answers[2].shen.index;
    for (let i = 0; i < 3; i++) {
        const gong = answers[i].shen.name;
        const gongIdx = answers[i].shen.index;
        const offset = (gongIdx - renIdx + 6) % 6;
        const dzIdx = (shiChenIdx + 2 * offset) % 12;
        const dz = DAO_DZ[dzIdx];
        const dzWx = DAO_DZ_WUXING[dzIdx];
        const gongWx = DAO_GONG_WUXING[gongIdx];
        const siShenObj = DAO_SI_LIU_SHEN[gongIdx] || { name: '', wx: '', desc: '' };
        const huoShenIdx = (gongIdx - startGongIdx + 6) % 6;
        const huoShen = DAO_HUO_LIU_SHEN_ORDER[huoShenIdx];
        const renWx = DAO_GONG_WUXING[answers[2].shen.index];
        const qinObj = i === 2
            ? { name: '自身', desc: '代表问卦者本人，一切以我为中心' }
            : daoCalcQin(renWx, gongWx);
        rows.push({
            position: i === 0 ? '天宫' : (i === 1 ? '地宫' : '人宫'),
            gong, gongIdx, dz, dzWx, gongWx,
            qin: qinObj.name, qinDesc: qinObj.desc,
            siShen: siShenObj.name, siShenWx: siShenObj.wx, siShenDesc: siShenObj.desc,
            huoShen, huoShenDesc: DAO_HUO_LIU_SHEN_DESC[huoShen] || ''
        });
    }
    return rows;
}

function generateDaoJieGuaText(rows, shiChen) {
    if (!rows || rows.length === 0) return '';
    const ren = rows[2];
    const startGongIdx = DAO_HUO_SHEN_START_GONG[shiChen] != null ? DAO_HUO_SHEN_START_GONG[shiChen] : 0;
    const startGongName = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'][startGongIdx];
    const shiChenIdx = DAO_DZ.indexOf(shiChen);
    const shiChenWx = shiChenIdx >= 0 ? DAO_DZ_WUXING[shiChenIdx] : '';
    const shiChenQin = shiChenWx ? daoCalcQin(ren.gongWx, shiChenWx).name : '';
    return [
        '【道传·死活六神双轨合参】',
        '时辰「' + shiChen + '」→ 青龙起于「' + startGongName + '」（活六神轮值起点）。',
        '地支排法：以人宫时辰「' + shiChen + '」为基准，顺时针隔位相排。',
        '人宫落' + ren.gong + '（五行' + ren.gongWx + '，地支' + ren.dz + '）：',
        '死六神「' + ren.siShen + '」' + ren.siShenWx + '（' + ren.siShenDesc + '）；',
        '活六神「' + ren.huoShen + '」（' + ren.huoShenDesc + '）；',
        '六亲为' + ren.qin + '（' + ren.qinDesc + '）。',
        '时辰（用）「' + shiChen + '」五行' + shiChenWx + '，与人宫（体）关系：' + shiChenQin + '。',
        '体用：人宫为体（所问之事），时辰为用（外缘之变）；死六神定宫位本体之神、活六神按时轮值观机变，双轨合参断事理。'
    ].join('');
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
console.log('║  V2.2 单元测试：道传排盘(dao-pai)           ║');
console.log('╚══════════════════════════════════════════════╝');

function makeAnswers(idx1, idx2, idx3) {
    return [
        { step: 1, shen: { name: SHEN_NAMES[idx1], index: idx1 } },
        { step: 2, shen: { name: SHEN_NAMES[idx2], index: idx2 } },
        { step: 3, shen: { name: SHEN_NAMES[idx3], index: idx3 } }
    ];
}

// ==================== 1. 子时排盘 ====================
console.log('\n【1】子时排盘（大安/留连/速喜）');
const ans567 = makeAnswers(0, 1, 2);
const rowsZi = generateDaoPai(ans567, '子');
check('子时 3 行', rowsZi.length, 3);
check('天宫位置', rowsZi[0].position, '天宫');
check('地宫位置', rowsZi[1].position, '地宫');
check('人宫位置', rowsZi[2].position, '人宫');
check('人宫宫名', rowsZi[2].gong, '速喜');
check('人宫六亲', rowsZi[2].qin, '自身');
check('速喜死六神', rowsZi[2].siShen, '朱雀');
check('速喜活六神（按宫位轮转）', rowsZi[2].huoShen, '勾陈');

// ==================== 2. 寅时排盘 ====================
console.log('\n【2】寅时排盘');
const rowsYin = generateDaoPai(ans567, '寅');
check('寅时人宫活六神', rowsYin[2].huoShen, '青龙');
check('寅时人宫六亲', rowsYin[2].qin, '自身');

// ==================== 3. 午时排盘 ====================
console.log('\n【3】午时排盘');
const rowsWu = generateDaoPai(ans567, '午');
check('午时人宫活六神', rowsWu[2].huoShen, '勾陈');
check('午时天宫活六神', rowsWu[0].huoShen, '青龙');

// ==================== 4. 死六神固定映射 ====================
console.log('\n【4】死六神固定映射');
for (let i = 0; i < 6; i++) {
    const ans = makeAnswers(i, i, i);
    const rows = generateDaoPai(ans, '子');
    check('宫' + i + ' 死六神', rows[2].siShen, DAO_SI_LIU_SHEN[i].name);
}
check('留连死六神=腾蛇（权威口径）', DAO_SI_LIU_SHEN[1].name, '腾蛇');
check('空亡死六神=勾陈（权威口径）', DAO_SI_LIU_SHEN[5].name, '勾陈');

// ==================== 5. 活六神时辰轮转 ====================
console.log('\n【5】活六神时辰轮转');
const dzPairs = [['子', '青龙'], ['丑', '腾蛇'], ['寅', '玄武'], ['卯', '白虎'],
    ['辰', '勾陈'], ['巳', '朱雀'], ['午', '青龙'], ['未', '腾蛇'],
    ['申', '玄武'], ['酉', '白虎'], ['戌', '勾陈'], ['亥', '朱雀']];
dzPairs.forEach(([dz, expected]) => {
    const ans = makeAnswers(0, 0, 0);
    const rows = generateDaoPai(ans, dz);
    check(dz + '时 大安活六神', rows[0].huoShen, expected);
});

// ==================== 6. 六亲关系 ====================
console.log('\n【6】六亲关系');
const ans222 = makeAnswers(2, 2, 2);
const rowsQin = generateDaoPai(ans222, '子');
check('人宫自身', rowsQin[2].qin, '自身');
checkTrue('天宫六亲非空', rowsQin[0].qin && rowsQin[0].qin.length > 0);
checkTrue('地宫六亲非空', rowsQin[1].qin && rowsQin[1].qin.length > 0);

// ==================== 7. 解卦文本 ====================
console.log('\n【7】解卦文本');
const jieText = generateDaoJieGuaText(rowsZi, '子');
checkTrue('解卦含道传', jieText.includes('道传'));
checkTrue('解卦含死活六神', jieText.includes('死活六神'));
checkTrue('解卦含时辰', jieText.includes('子'));
checkTrue('解卦含人宫', jieText.includes('速喜'));
checkTrue('解卦含死六神', jieText.includes('朱雀'));
checkTrue('解卦含活六神', jieText.includes('青龙'));
checkTrue('解卦含体用（人宫为体/时辰为用）', jieText.includes('人宫为体') && jieText.includes('时辰为用'));
checkTrue('解卦含时辰（用）六亲行', jieText.includes('时辰（用）'));

// ==================== 8. 解卦边界 ====================
console.log('\n【8】解卦边界');
check('空数据解卦', generateDaoJieGuaText([], '子'), '');
check('null 解卦', generateDaoJieGuaText(null, '子'), '');

// ==================== 9. 地支排法 ====================
console.log('\n【9】地支排法');
check('子时人宫速喜地支', rowsZi[2].dz, '子');
check('子时天宫大安地支', rowsZi[0].dz, '申');
check('子时地宫留连地支', rowsZi[1].dz, '戌');

// ==================== 10. 全时辰覆盖 ====================
console.log('\n【10】全时辰覆盖');
DAO_DZ.forEach(dz => {
    const rows = generateDaoPai(ans567, dz);
    checkTrue(dz + '时 3 行', rows.length === 3);
    checkTrue(dz + '时 人宫非空', rows[2].gong && rows[2].gong.length > 0);
    checkTrue(dz + '时 死六神非空', rows[2].siShen && rows[2].siShen.length > 0);
    checkTrue(dz + '时 活六神非空', rows[2].huoShen && rows[2].huoShen.length > 0);
    checkTrue(dz + '时 地支非空', rows[2].dz && rows[2].dz.length > 0);
});

// ==================== 汇总 ====================
const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log('\n╔══════════════════════════════════════════════╗');
console.log('║  V2.2 汇总：通过 ' + passed + '  失败 ' + failed + '                          ║');
console.log('║  ' + (failed === 0 ? '✅ 全部通过！' : '❌ 存在失败用例！') + '                              ║');
console.log('╚══════════════════════════════════════════════╝');

process.exit(failed > 0 ? 1 : 0);
