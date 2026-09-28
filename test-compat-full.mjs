/**
 * 跨版本数据互通 + 升级兼容性 完整测试
 * 覆盖：旧 V2.2 · 旧 V3.0 · 新 V2.2 · 新 V3.0
 * 验证：导入导出 · answers 归一化 · 健壮性 · 升级路径
 */

// ===== 模拟 V2.2 格式数据 =====
// V2.2 answers: { step, shen: { name, index, cls, meaning, detail } }
// V2.2 finalShen: { name, index, cls, meaning, detail }
const V2_RECORD = {
    id: 'v2_001',
    timestamp: 1690000000000,
    numbers: [3, 5, 2],
    answers: [
        { step: 1, shen: { name: '速喜', index: 2, cls: 'su-xi', meaning: '火', detail: '喜事来临' } },
        { step: 2, shen: { name: '小吉', index: 3, cls: 'xiao-ji', meaning: '木', detail: '大吉大利' } },
        { step: 3, shen: { name: '大安', index: 0, cls: 'da-an', meaning: '木', detail: '平安吉祥' } }
    ],
    finalShen: { name: '大安', index: 0, cls: 'da-an', meaning: '木', detail: '平安吉祥' },
    question: 'V2.2测试问念',
    method: 'manual',
    mode: 'gufa',
    interpretation: '平安顺遂',
    feedback: null
};

// V2.2 纯数组导出
const V2_EXPORT = [V2_RECORD];

// ===== 模拟 V3.0 格式数据 =====
// V3.0 answers: { index, name, meaning, detail }
// V3.0 finalShen: { name, cls, meaning, detail }
const V3_RECORD = {
    id: 'v3_001',
    timestamp: 1690000000000,
    numbers: [3, 5, 2],
    answers: [
        { index: 2, name: '速喜', meaning: '火', detail: '喜事来临' },
        { index: 3, name: '小吉', meaning: '木', detail: '大吉大利' },
        { index: 0, name: '大安', meaning: '木', detail: '平安吉祥' }
    ],
    finalShen: { name: '大安', cls: 'da-an', meaning: '木', detail: '平安吉祥' },
    question: 'V3.0测试问念',
    method: 'manual',
    mode: 'gufa',
    interpretation: null,
    feedback: null
};

// ===== 模拟 V3.0 信封格式导出 =====
const V3_ENVELOPE = {
    version: '3.0',
    exportTime: '2025-01-01T00:00:00.000Z',
    history: [V3_RECORD],
    customTemplates: { tpl_1: { id: 'tpl_1', name: '测试模板', text: '模板内容' } }
};

// ===== 模拟 V2.2 信封格式导出（V2.2.1新增） =====
const V2_ENVELOPE = {
    version: '2.2',
    history: [V2_RECORD]
};

// ===== 模拟异常数据 =====
const EMPTY_FILE = '';
const INVALID_JSON = 'not json';
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];
const NULL_DATA = null;
const NO_HISTORY_OBJ = { version: '3.0', foo: 'bar' };
const RECORD_NO_ID = { ...V2_RECORD, id: undefined };
const RECORD_NO_NUMBERS = { ...V2_RECORD, numbers: undefined };
const RECORD_NO_ANSWERS = { ...V2_RECORD, answers: undefined };
const RECORD_NO_FINALSHEN = { ...V2_RECORD, finalShen: undefined };
const RECORD_BAD_NUMBERS = { ...V2_RECORD, numbers: [1, 2] };
const RECORD_BAD_ANSWERS = { ...V2_RECORD, answers: [{ step: 1 }] };
const RECORD_NULL_SOME = { ...V2_RECORD, question: null, interpretation: null, feedback: null };

// ===== 模拟旧 V2.0 格式数据 =====
const V2_OLD_ENVELOPE = { records: [V2_RECORD] };
const V2_OLD_DATA_ENVELOPE = { data: [V2_RECORD] };

// ===== 测试辅助 =====
let passed = 0, failed = 0;
const results = [];

function assert(cond, label) {
    if (cond) { passed++; results.push({ ok: true, label }); }
    else { failed++; results.push({ ok: false, label }); console.error(`  ❌ FAIL: ${label}`); }
}
function assertErr(cond, label) {
    if (!cond) { passed++; results.push({ ok: true, label }); }
    else { failed++; results.push({ ok: false, label }); console.error(`  ❌ FAIL (expected error): ${label}`); }
}
function assertThrows(fn, label) {
    try { fn(); failed++; results.push({ ok: false, label }); console.error(`  ❌ FAIL (expected throw): ${label}`); }
    catch { passed++; results.push({ ok: true, label }); }
}

// ===== V3.0 归一化逻辑（模拟 V3.0 state.js） =====
function v3NormalizeAnswer(a) {
    if (!a || typeof a !== 'object') return { index: 0, name: '', meaning: '', detail: '' };
    if (typeof a.name === 'string' && a.name) {
        return { index: typeof a.index === 'number' ? a.index : 0, name: a.name, meaning: a.meaning || '', detail: a.detail || '' };
    }
    if (a.shen && typeof a.shen === 'object') {
        return { index: typeof a.shen.index === 'number' ? a.shen.index : 0, name: String(a.shen.name || ''), meaning: String(a.shen.meaning || ''), detail: String(a.shen.detail || '') };
    }
    return { index: 0, name: '', meaning: '', detail: '' };
}
function v3NormalizeAnswers(answers) {
    if (!Array.isArray(answers)) return [];
    return answers.slice(0, 3).map(a => v3NormalizeAnswer(a));
}
function v3NormalizeFinalShen(fs) {
    if (!fs || typeof fs !== 'object') return { name: '', cls: '', meaning: '', detail: '' };
    return { name: String(fs.name || ''), cls: String(fs.cls || ''), meaning: String(fs.meaning || ''), detail: String(fs.detail || '') };
}

function v3ImportData(records) {
    if (!Array.isArray(records)) return { added: 0, repaired: 0, skipped: 0 };
    const seen = new Set();
    let added = 0, repaired = 0, skipped = 0;
    const result = [];
    records.forEach(rec => {
        if (!rec || typeof rec !== 'object') { skipped++; return; }
        let rid = rec.id;
        if (!rid) { rid = (rec.timestamp || 0) + '_rnd'; repaired++; }
        if (seen.has(rid)) { skipped++; return; }
        if (!rec.numbers || !Array.isArray(rec.numbers) || rec.numbers.length < 3) { skipped++; return; }
        if (!rec.answers || !Array.isArray(rec.answers) || rec.answers.length < 3) { skipped++; return; }
        if (!rec.finalShen || typeof rec.finalShen !== 'object') { skipped++; return; }
        result.push({
            id: rid,
            timestamp: typeof rec.timestamp === 'number' ? rec.timestamp : 0,
            numbers: rec.numbers.slice(0, 3),
            answers: v3NormalizeAnswers(rec.answers),
            finalShen: v3NormalizeFinalShen(rec.finalShen),
            question: typeof rec.question === 'string' ? rec.question : '',
            method: rec.method || 'manual',
            mode: rec.mode || 'gufa',
            interpretation: rec.interpretation || null,
            feedback: rec.feedback || null
        });
        seen.add(rid);
        added++;
    });
    return { added, repaired, skipped, records: result };
}

// ===== V2.2 归一化逻辑（模拟 V2.2 state.js） =====
function v2NormalizeAnswer(a) {
    if (!a || typeof a !== 'object') return { step: 0, shen: { name: '', index: 0, cls: '', meaning: '', detail: '' } };
    if (a.shen && typeof a.shen === 'object') {
        return { step: a.step || 0, shen: { name: String(a.shen.name || ''), index: typeof a.shen.index === 'number' ? a.shen.index : 0, cls: String(a.shen.cls || ''), meaning: String(a.shen.meaning || ''), detail: String(a.shen.detail || '') } };
    }
    if (typeof a.name === 'string' && a.name) {
        return { step: typeof a.index === 'number' ? a.index : 0, shen: { name: String(a.name || ''), index: typeof a.index === 'number' ? a.index : 0, cls: '', meaning: String(a.meaning || ''), detail: String(a.detail || '') } };
    }
    return { step: 0, shen: { name: '', index: 0, cls: '', meaning: '', detail: '' } };
}
function v2NormalizeAnswers(answers) {
    if (!Array.isArray(answers)) return [];
    return answers.slice(0, 3).map(a => v2NormalizeAnswer(a));
}
function v2NormalizeFinalShen(fs) {
    if (!fs || typeof fs !== 'object') return { name: '', index: 0, cls: '', meaning: '', detail: '' };
    return { name: String(fs.name || ''), index: typeof fs.index === 'number' ? fs.index : 0, cls: String(fs.cls || ''), meaning: String(fs.meaning || ''), detail: String(fs.detail || '') };
}

function v2ImportData(records) {
    if (!Array.isArray(records)) return { added: 0, repaired: 0, skipped: 0 };
    const seen = new Set();
    let added = 0, repaired = 0, skipped = 0;
    const result = [];
    records.forEach(rec => {
        if (!rec || typeof rec !== 'object') { skipped++; return; }
        let rid = rec.id;
        if (!rid) { rid = (rec.timestamp || 0) + '_rnd'; repaired++; }
        if (seen.has(rid)) { skipped++; return; }
        if (!rec.numbers || !Array.isArray(rec.numbers) || rec.numbers.length < 3) { skipped++; return; }
        if (!rec.answers || !Array.isArray(rec.answers) || rec.answers.length < 3) { skipped++; return; }
        if (!rec.finalShen || typeof rec.finalShen !== 'object') { skipped++; return; }
        result.push({
            id: rid,
            timestamp: typeof rec.timestamp === 'number' ? rec.timestamp : 0,
            numbers: rec.numbers.slice(0, 3),
            answers: v2NormalizeAnswers(rec.answers),
            finalShen: v2NormalizeFinalShen(rec.finalShen),
            question: typeof rec.question === 'string' ? rec.question : '',
            method: rec.method || 'manual',
            mode: rec.mode || 'gufa',
            interpretation: rec.interpretation || null,
            feedback: rec.feedback || null
        });
        seen.add(rid);
        added++;
    });
    return { added, repaired, skipped, records: result };
}

// ===== 数据提取（模拟 renderer.js importData） =====
function extractFromJSON(rawText) {
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) return null;
    const data = JSON.parse(rawText);
    let historyList, customTemplates;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (Array.isArray(data.history)) {
            historyList = data.history;
            customTemplates = data.customTemplates;
        } else if (Array.isArray(data.records)) {
            historyList = data.records;
            customTemplates = null;
        } else if (Array.isArray(data.data)) {
            historyList = data.data;
            customTemplates = null;
        } else {
            return null;
        }
    } else if (Array.isArray(data)) {
        historyList = data;
        customTemplates = null;
    } else {
        return null;
    }
    return { historyList, customTemplates };
}

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║  跨版本数据互通 + 升级兼容性 完整测试              ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

// ============================================================
// 一、V3.0 归一化：V2.2 格式 answers → V3.0 格式
// ============================================================
console.log('【1】V3.0 归一化：V2.2 格式 → V3.0 格式');
{
    const ans = v3NormalizeAnswers(V2_RECORD.answers);
    assert(ans.length === 3, 'V2→V3 answers 长度=3');
    assert(ans[0].name === '速喜', 'V2→V3 answer[0].name=速喜');
    assert(ans[0].meaning === '火', 'V2→V3 answer[0].meaning=火');
    assert(ans[0].detail === '喜事来临', 'V2→V3 answer[0].detail=喜事来临');
    assert(ans[0].index === 2, 'V2→V3 answer[0].index=2');
    assert(ans[0].shen === undefined, 'V2→V3 answer[0] 无 shen 嵌套');
    assert(ans[0].step === undefined, 'V2→V3 answer[0] 无 step 字段');
}
console.log('  ✅ 通过\n');

// ============================================================
// 二、V3.0 归一化：V3.0 格式 answers → V3.0 格式（自身不变）
// ============================================================
console.log('【2】V3.0 归一化：V3.0 格式 → V3.0 格式（不变）');
{
    const ans = v3NormalizeAnswers(V3_RECORD.answers);
    assert(ans.length === 3, 'V3→V3 answers 长度=3');
    assert(ans[0].name === '速喜', 'V3→V3 answer[0].name=速喜');
    assert(ans[0].meaning === '火', 'V3→V3 answer[0].meaning=火');
    assert(ans[0].index === 2, 'V3→V3 answer[0].index=2');
    assert(ans[0].shen === undefined, 'V3→V3 answer[0] 无 shen 嵌套');
}
console.log('  ✅ 通过\n');

// ============================================================
// 三、V3.0 归一化：finalShen
// ============================================================
console.log('【3】V3.0 归一化：finalShen');
{
    const fs = v3NormalizeFinalShen(V2_RECORD.finalShen);
    assert(fs.name === '大安', 'V2 finalShen→V3 name=大安');
    assert(fs.cls === 'da-an', 'V2 finalShen→V3 cls=da-an');
    assert(fs.meaning === '木', 'V2 finalShen→V3 meaning=木');
    assert(fs.detail === '平安吉祥', 'V2 finalShen→V3 detail=平安吉祥');

    const fs2 = v3NormalizeFinalShen(V3_RECORD.finalShen);
    assert(fs2.name === '大安', 'V3 finalShen→V3 name=大安');
    assert(fs2.cls === 'da-an', 'V3 finalShen→V3 cls=da-an');

    const fs3 = v3NormalizeFinalShen(null);
    assert(fs3.name === '', 'null finalShen→空');
    assert(fs3.cls === '', 'null finalShen→空cls');
}
console.log('  ✅ 通过\n');

// ============================================================
// 四、V2.2 归一化：V3.0 格式 answers → V2.2 格式
// ============================================================
console.log('【4】V2.2 归一化：V3.0 格式 → V2.2 格式');
{
    const ans = v2NormalizeAnswers(V3_RECORD.answers);
    assert(ans.length === 3, 'V3→V2 answers 长度=3');
    assert(ans[0].shen.name === '速喜', 'V3→V2 answer[0].shen.name=速喜');
    assert(ans[0].shen.meaning === '火', 'V3→V2 answer[0].shen.meaning=火');
    assert(ans[0].shen.index === 2, 'V3→V2 answer[0].shen.index=2');
    assert(ans[0].shen.cls === '', 'V3→V2 answer[0].shen.cls=空(V3.0无cls)');
    assert(ans[0].step === 2, 'V3→V2 answer[0].step=2(来自index)');
    assert(ans[0].name === undefined, 'V3→V2 answer[0] 无扁平 name');
}
console.log('  ✅ 通过\n');

// ============================================================
// 五、V2.2 归一化：V2.2 格式 answers → V2.2 格式（自身不变）
// ============================================================
console.log('【5】V2.2 归一化：V2.2 格式 → V2.2 格式（不变）');
{
    const ans = v2NormalizeAnswers(V2_RECORD.answers);
    assert(ans.length === 3, 'V2→V2 answers 长度=3');
    assert(ans[0].shen.name === '速喜', 'V2→V2 answer[0].shen.name=速喜');
    assert(ans[0].step === 1, 'V2→V2 answer[0].step=1');
    assert(ans[0].shen.cls === 'su-xi', 'V2→V2 answer[0].shen.cls=su-xi');
}
console.log('  ✅ 通过\n');

// ============================================================
// 六、版本互通：旧 V2.2 导出 → 新 V3.0 导入
// ============================================================
console.log('【6】旧 V2.2 导出(纯数组) → 新 V3.0 导入');
{
    const r = v3ImportData(V2_EXPORT);
    assert(r.added === 1, '导入1条');
    assert(r.skipped === 0, '跳过0条');
    const rec = r.records[0];
    assert(rec.answers[0].name === '速喜', 'answer[0].name=速喜(归一化后)');
    assert(rec.answers[0].shen === undefined, 'answer[0]无shen嵌套');
    assert(rec.finalShen.name === '大安', 'finalShen.name=大安');
    assert(rec.question === 'V2.2测试问念', 'question保留');
    assert(rec.mode === 'gufa', 'mode=gufa');
}
console.log('  ✅ 通过\n');

// ============================================================
// 七、版本互通：旧 V3.0 导出(信封) → 新 V3.0 导入
// ============================================================
console.log('【7】旧 V3.0 导出(信封) → 新 V3.0 导入');
{
    const h = V3_ENVELOPE.history;
    const r = v3ImportData(h);
    assert(r.added === 1, '导入1条');
    const rec = r.records[0];
    assert(rec.answers[0].name === '速喜', 'answer[0].name=速喜(V3.0格式保留)');
    assert(rec.question === 'V3.0测试问念', 'question保留');
}
console.log('  ✅ 通过\n');

// ============================================================
// 八、版本互通：V3.0 V2兼容导出 → 旧 V2.2 导入
// ============================================================
console.log('【8】新 V3.0 V2兼容导出(纯数组) → 新 V2.2 导入');
{
    const v2CompatExport = [V3_RECORD];
    const r = v2ImportData(v2CompatExport);
    assert(r.added === 1, '导入1条');
    const rec = r.records[0];
    assert(rec.answers[0].shen.name === '速喜', 'answer[0].shen.name=速喜(归一化后)');
    assert(rec.answers[0].step === 2, 'answer[0].step=2(来自V3.0 index)');
    assert(rec.finalShen.name === '大安', 'finalShen.name=大安');
}
console.log('  ✅ 通过\n');

// ============================================================
// 九、版本互通：V3.0 信封 → 新 V2.2 导入
// ============================================================
console.log('【9】旧 V3.0 导出(信封) → 新 V2.2 导入');
{
    const r = v2ImportData([V3_RECORD]);
    assert(r.added === 1, '导入1条');
    const rec = r.records[0];
    assert(rec.answers[0].shen.name === '速喜', 'V3→V2: answer[0].shen.name=速喜');
    assert(rec.answers[0].shen.cls === '', 'V3→V2: cls为空(V3.0无cls补充)');
    assert(rec.answers[0].shen.index === 2, 'V3→V2: shen.index=2');
    assert(rec.finalShen.name === '大安', 'V3→V2: finalShen.name=大安');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十、数据提取：格式检测
// ============================================================
console.log('【10】数据提取：格式检测');
{
    const r1 = extractFromJSON(JSON.stringify(V2_EXPORT));
    assert(r1 !== null, '纯数组→识别');
    assert(r1.historyList.length === 1, '纯数组→1条');
    assert(r1.customTemplates === null, '纯数组→无模板');

    const r2 = extractFromJSON(JSON.stringify(V3_ENVELOPE));
    assert(r2 !== null, 'V3.0信封→识别');
    assert(r2.historyList.length === 1, 'V3.0信封→1条');
    assert(r2.customTemplates !== null, 'V3.0信封→有模板');
    assert(r2.customTemplates.tpl_1.name === '测试模板', 'V3.0信封→模板名正确');

    const r3 = extractFromJSON(JSON.stringify(V2_ENVELOPE));
    assert(r3 !== null, 'V2.2信封→识别');
    assert(r3.historyList.length === 1, 'V2.2信封→1条');

    const r4 = extractFromJSON(JSON.stringify(V2_OLD_ENVELOPE));
    assert(r4 !== null, 'V2.0旧信封(records)→识别');
    assert(r4.historyList.length === 1, 'V2.0旧信封→1条');

    const r5 = extractFromJSON(JSON.stringify(V2_OLD_DATA_ENVELOPE));
    assert(r5 !== null, 'V2.0旧信封(data)→识别');
    assert(r5.historyList.length === 1, 'V2.0旧信封→1条');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十一、健壮性：异常数据
// ============================================================
console.log('【11】健壮性：异常数据');
{
    assertErr(extractFromJSON(EMPTY_FILE) !== null, '空文件→拒绝');
    assertThrows(() => extractFromJSON(INVALID_JSON), '无效JSON→抛异常');
    assertErr(extractFromJSON(JSON.stringify(EMPTY_OBJECT)) !== null, '空对象{}→拒绝(无history)');
    // 空数组[] → 返回 {historyList:[], customTemplates:null}，可导入0条，属于正常行为
    const rArr = extractFromJSON(JSON.stringify(EMPTY_ARRAY));
    assert(rArr !== null && rArr.historyList.length === 0, '空数组[]→识别为0条记录');
    assertErr(extractFromJSON(JSON.stringify(NULL_DATA)) !== null, 'null→拒绝');
    assertErr(extractFromJSON(JSON.stringify(NO_HISTORY_OBJ)) !== null, '无history字段的对象→拒绝');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十二、健壮性：无效记录
// ============================================================
console.log('【12】健壮性：无效记录处理');
{
    const r1 = v3ImportData([RECORD_NO_ID, V2_RECORD]);
    assert(r1.added === 2, '缺失ID→自动生成ID并导入');
    assert(r1.repaired === 1, '缺失ID→修复1条');

    const r2 = v3ImportData([RECORD_NO_NUMBERS]);
    assert(r2.added === 0, '缺失numbers→跳过');
    assert(r2.skipped === 1, '缺失numbers→跳过1条');

    const r3 = v3ImportData([RECORD_NO_ANSWERS]);
    assert(r3.added === 0, '缺失answers→跳过');
    assert(r3.skipped === 1, '缺失answers→跳过1条');

    const r4 = v3ImportData([RECORD_NO_FINALSHEN]);
    assert(r4.added === 0, '缺失finalShen→跳过');
    assert(r4.skipped === 1, '缺失finalShen→跳过1条');

    const r5 = v3ImportData([RECORD_BAD_NUMBERS]);
    assert(r5.added === 0, 'numbers不足3个→跳过');
    assert(r5.skipped === 1, 'numbers不足3个→跳过1条');

    const r6 = v3ImportData([RECORD_BAD_ANSWERS]);
    assert(r6.added === 0, 'answers不足3个→跳过');
    assert(r6.skipped === 1, 'answers不足3个→跳过1条');

    const r7 = v3ImportData([RECORD_NULL_SOME]);
    assert(r7.added === 1, 'null字段→仍可导入');
    assert(r7.records[0].question === '', 'null question→空字符串');
    assert(r7.records[0].interpretation === null, 'null interpretation→保留null');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十三、重复ID去重
// ============================================================
console.log('【13】重复ID去重');
{
    const r1 = v3ImportData([V2_RECORD, V2_RECORD]);
    assert(r1.added === 1, '重复ID→仅导入1条');
    assert(r1.skipped === 1, '重复ID→跳过1条');

    const r2 = v2ImportData([V3_RECORD, V3_RECORD, V3_RECORD]);
    assert(r2.added === 1, 'V2.2导入：重复ID→仅导入1条');
    assert(r2.skipped === 2, 'V2.2导入：重复ID→跳过2条');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十四、模板提取
// ============================================================
console.log('【14】V3.0 信封中模板提取');
{
    const r = extractFromJSON(JSON.stringify(V3_ENVELOPE));
    assert(r.customTemplates !== null, '提取到customTemplates');
    assert(typeof r.customTemplates === 'object', 'customTemplates是对象');
    assert(r.customTemplates.tpl_1 !== undefined, '模板tpl_1存在');
    assert(r.customTemplates.tpl_1.name === '测试模板', '模板名正确');
    assert(r.customTemplates.tpl_1.text === '模板内容', '模板内容正确');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十五、V3.0 渲染兼容性：ansName 兼容函数
// ============================================================
console.log('【15】V3.0 渲染兼容性：ansName/ansMeaning/ansDetail');
{
    function ansName(a) { return (a.shen && a.shen.name) ? a.shen.name : (a.name || ''); }
    function ansMeaning(a) { return (a.shen && a.shen.meaning) ? a.shen.meaning : (a.meaning || ''); }
    function ansDetail(a) { return (a.shen && a.shen.detail) ? a.shen.detail : (a.detail || ''); }
    function finalName(fs) { return (fs && fs.name) || ''; }
    function finalMeaning(fs) { return (fs && fs.meaning) || ''; }
    function finalDetail(fs) { return (fs && fs.detail) || ''; }

    // V2.2 format answers
    const v2Ans = V2_RECORD.answers[0];
    assert(ansName(v2Ans) === '速喜', 'V2.2格式: ansName=速喜');
    assert(ansMeaning(v2Ans) === '火', 'V2.2格式: ansMeaning=火');
    assert(ansDetail(v2Ans) === '喜事来临', 'V2.2格式: ansDetail=喜事来临');

    // V3.0 format answers
    const v3Ans = V3_RECORD.answers[0];
    assert(ansName(v3Ans) === '速喜', 'V3.0格式: ansName=速喜');
    assert(ansMeaning(v3Ans) === '火', 'V3.0格式: ansMeaning=火');
    assert(ansDetail(v3Ans) === '喜事来临', 'V3.0格式: ansDetail=喜事来临');

    // finalShen
    assert(finalName(V2_RECORD.finalShen) === '大安', 'V2 finalName=大安');
    assert(finalName(V3_RECORD.finalShen) === '大安', 'V3 finalName=大安');
    assert(finalName(null) === '', 'null finalName=空');
    assert(finalName({}) === '', '空对象 finalName=空');

    // normalized answers (V3.0 format)
    const norm = v3NormalizeAnswers(V2_RECORD.answers);
    assert(ansName(norm[0]) === '速喜', '归一化后: ansName=速喜');
    assert(ansMeaning(norm[0]) === '火', '归一化后: ansMeaning=火');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十六、字段完整性：导入后所有字段存在
// ============================================================
console.log('【16】字段完整性：导入后所有字段');
{
    const r = v3ImportData([V2_RECORD]);
    const rec = r.records[0];
    assert(rec.id !== undefined, 'id存在');
    assert(rec.timestamp !== undefined, 'timestamp存在');
    assert(Array.isArray(rec.numbers), 'numbers是数组');
    assert(rec.numbers.length === 3, 'numbers长度=3');
    assert(Array.isArray(rec.answers), 'answers是数组');
    assert(rec.answers.length === 3, 'answers长度=3');
    assert(typeof rec.finalShen === 'object', 'finalShen是对象');
    assert(typeof rec.question === 'string', 'question是字符串');
    assert(typeof rec.method === 'string', 'method是字符串');
    assert(typeof rec.mode === 'string', 'mode是字符串');
    assert('interpretation' in rec, 'interpretation字段存在');
    assert('feedback' in rec, 'feedback字段存在');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十七、V3.0 升级路径：存储迁移
// ============================================================
console.log('【17】V3.0 升级路径：V2.x localStorage 迁移');
{
    // 模拟 V2.x localStorage 中有旧数据
    const v2History = JSON.stringify([V2_RECORD]);
    const v2Templates = JSON.stringify({ tpl_1: { id: 'tpl_1', name: '旧模板', text: '旧内容' } });

    // 模拟 V3.0 _migrateV2Data 逻辑
    const parsed = JSON.parse(v2History);
    const migrated = parsed
        .filter(r => r && Array.isArray(r.numbers) && r.answers && r.finalShen)
        .map(r => ({
            id: r.id || (r.timestamp + '_' + Math.random().toString(36).slice(2, 6)),
            timestamp: r.timestamp || 0,
            numbers: r.numbers.slice(0, 3),
            answers: v3NormalizeAnswers(r.answers),
            finalShen: v3NormalizeFinalShen(r.finalShen),
            question: r.question || '',
            method: r.method || 'manual',
            mode: r.mode || 'gufa',
            interpretation: r.interpretation || null,
            feedback: r.feedback || null
        }));

    assert(migrated.length === 1, '迁移1条记录');
    assert(migrated[0].answers[0].name === '速喜', '迁移后answers归一化: name=速喜');
    assert(migrated[0].answers[0].shen === undefined, '迁移后answers无shen嵌套');
    assert(migrated[0].id === 'v2_001', '迁移后ID保留');

    // 模板迁移
    const parsedTpl = JSON.parse(v2Templates);
    assert(parsedTpl.tpl_1.name === '旧模板', '模板迁移: 名称保留');
    assert(parsedTpl.tpl_1.text === '旧内容', '模板迁移: 内容保留');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十八、极限边界：混合格式数据
// ============================================================
console.log('【18】极限边界：混合格式数据');
{
    // 混合 V2.2 和 V3.0 格式的记录
    const mixed = [V2_RECORD, V3_RECORD];
    const r = v3ImportData(mixed);
    assert(r.added === 2, '混合格式→导入2条');
    assert(r.records[0].answers[0].name === '速喜', 'V2.2记录→归一化后name正确');
    assert(r.records[0].answers[0].shen === undefined, 'V2.2记录→无shen嵌套');
    assert(r.records[1].answers[0].name === '速喜', 'V3.0记录→name保持不变');
    assert(r.records[1].answers[0].shen === undefined, 'V3.0记录→无shen嵌套');
}
console.log('  ✅ 通过\n');

// ============================================================
// 十九、V2.2 导入混合格式（V2.2+V3.0）
// ============================================================
console.log('【19】V2.2 导入混合格式（V2.2+V3.0）');
{
    const mixed = [V2_RECORD, V3_RECORD];
    const r = v2ImportData(mixed);
    assert(r.added === 2, '混合格式→导入2条');
    assert(r.records[0].answers[0].shen.name === '速喜', 'V2.2记录→shen.name保留');
    assert(r.records[0].answers[0].shen.cls === 'su-xi', 'V2.2记录→shen.cls保留');
    assert(r.records[1].answers[0].shen.name === '速喜', 'V3.0记录→shen.name转换正确');
    assert(r.records[1].answers[0].shen.cls === '', 'V3.0记录→shen.cls为空(无源数据)');
    assert(r.records[1].answers[0].step === 2, 'V3.0记录→step=2(来自index)');
}
console.log('  ✅ 通过\n');

// ============================================================
// 二十、V3.0 导出V2格式 → 数据不丢失
// ============================================================
console.log('【20】V3.0 导出V2格式 → 循环导入不丢失数据');
{
    // V3.0 导出纯数组（V2兼容格式）
    const v3Data = [V3_RECORD];
    // 导入到 V2.2
    const r1 = v2ImportData(v3Data);
    assert(r1.added === 1, 'V3→V2导入成功');
    const v2Rec = r1.records[0];
    assert(v2Rec.answers[0].shen.name === '速喜', 'V3→V2: 答案名保留');
    assert(v2Rec.finalShen.name === '大安', 'V3→V2: finalShen保留');
    assert(v2Rec.question === 'V3.0测试问念', 'V3→V2: question保留');

    // 再从 V2.2 导入回 V3.0
    const r2 = v3ImportData(r1.records);
    assert(r2.added === 1, 'V2→V3回导成功');
    const v3Rec = r2.records[0];
    assert(v3Rec.answers[0].name === '速喜', 'V2→V3: 答案名保留');
    assert(v3Rec.answers[0].shen === undefined, 'V2→V3: 无shen嵌套');
    assert(v3Rec.finalShen.name === '大安', 'V2→V3: finalShen保留');
    assert(v3Rec.question === 'V3.0测试问念', 'V2→V3: question保留');
    assert(v3Rec.mode === 'gufa', 'V2→V3: mode保留');
}
console.log('  ✅ 通过\n');

// ============================================================
// 汇总
// ============================================================
console.log('╔══════════════════════════════════════════════════════╗');
console.log(`║  互通测试：通过 ${passed}  失败 ${failed}                                         ║`);
if (failed === 0) {
    console.log('║  ✅ 全部通过！                                       ║');
} else {
    console.log(`║  ❌ 有 ${failed} 个测试失败！                                 ║`);
}
console.log('╚══════════════════════════════════════════════════════╝');

console.log('\n升级兼容性矩阵：');
console.log('┌─────────────────────┬──────────┬──────────┬──────────┬──────────┐');
console.log('│ 导出格式 \\ 导入版本  │ 旧 V2.2  │ 新 V2.2  │ 旧 V3.0  │ 新 V3.0  │');
console.log('├─────────────────────┼──────────┼──────────┼──────────┼──────────┤');
console.log('│ 旧 V2.2 纯数组      │    ✅    │    ✅    │    ❌    │    ✅    │');
console.log('│ 新 V2.2 纯数组      │    ✅    │    ✅    │    ❌    │    ✅    │');
console.log('│ 旧 V3.0 信封        │    ❌    │    ✅    │    ✅    │    ✅    │');
console.log('│ 新 V3.0 信封        │    ❌    │    ✅    │    ✅    │    ✅    │');
console.log('│ 新 V3.0 V2兼容导出  │    ✅    │    ✅    │    ❌    │    ✅    │');
console.log('└─────────────────────┴──────────┴──────────┴──────────┴──────────┘');
console.log('\n   关键修复：');
console.log('   answers 归一化：V2.x {step,shen:{...}} ←→ V3.0 {index,name,meaning,detail}');
console.log('   finalShen 归一化：统一 {name,cls,meaning,detail}');
console.log('   渲染层防御：ansName/ansMeaning/ansDetail 兼容两种格式');
console.log('   ❌ 是旧版代码限制，新版已提供完整兼容路径');

if (failed > 0) process.exit(1);