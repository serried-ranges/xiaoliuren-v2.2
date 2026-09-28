// =========================================================
// 状态/存储：localStorage keys + DOM 元素引用 + 全局状态变量 + 历史/模板/反馈 CRUD + 导入导出
// （从 V2.1.2 app-all.js 物理切分，保持 1:1 逻辑不变；去 IIFE 后共享 Script scope）
// =========================================================
'use strict';

// ===== safeLS: localStorage 安全包装（file:// 下 LS 可能被禁用，所有调用走这里）=====
// V2.2.1：记录最近一次底层异常（lastError），供 detectLSAvailability 区分「禁用(Security)/配额不足(Quota)」
var safeLS = (function() {
    var _ls = null;
    var _lastError = null;
    try { _ls = window.localStorage; } catch (_e) { _lastError = _e; _ls = null; }
    return {
        lastError: function() { return _lastError; },
        getItem: function(key) {
            try { return _ls ? _ls.getItem(key) : null; } catch (_e) { _lastError = _e; return null; }
        },
        setItem: function(key, value) {
            try { if (_ls) _ls.setItem(key, value); _lastError = null; return true; } catch (_e) { _lastError = _e; return false; }
        },
        removeItem: function(key) {
            try { if (_ls) _ls.removeItem(key); _lastError = null; } catch (_e) { _lastError = _e; }
        },
        isAvailable: function() {
            try {
                if (!_ls) return false;
                var k = '__t_' + Date.now();
                _ls.setItem(k, '1');
                var v = _ls.getItem(k);
                _ls.removeItem(k);
                _lastError = null;
                return v === '1';
            } catch (_e) { _lastError = _e; return false; }
        }
    };
})();
console.log('[V2.2-fix] safeLS 初始化 | LS 可用=' + safeLS.isAvailable() + ' | protocol=' + location.protocol);

            // ===== 用户身份隔离 =====
            var USER_ID_KEY = 'xll_userId';
            function _ensureUserId() {
                var uid = safeLS.getItem(USER_ID_KEY);
                if (!uid) {
                    uid = 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
                    safeLS.setItem(USER_ID_KEY, uid);
                }
                return uid;
            }
            var _currentUid = _ensureUserId();
            function _hkey() { return 'liuShenHistory_' + _currentUid; }
            function _tkey() { return 'liuShenTemplates_' + _currentUid; }
            function _mkey() { return 'xll_divination_mode_' + _currentUid; }

            // 无命名空间旧键不能在共享部署中自动认领；旧数据须由用户导出后显式导入。
            var legacyDataPending = ['liuShenHistory', 'liuShenTemplates', 'xll_divination_mode']
                .filter(function(key) { return safeLS.getItem(key) !== null; });
            if (legacyDataPending.length) {
                console.info('[V2.2] 检测到旧版数据，已保持隔离；请通过导入功能确认迁移。', legacyDataPending);
            }

            // 全局身份管理函数
            var getProfileId = function() { return _currentUid; };
            var switchProfile = function(newUid) {
                if (!newUid || newUid === _currentUid) return false;
                _currentUid = newUid;
                safeLS.setItem(USER_ID_KEY, newUid);
                location.reload();
                return true;
            };
            var clearProfile = function() {
                safeLS.removeItem(_hkey());
                safeLS.removeItem(_tkey());
                safeLS.removeItem(_mkey());
                safeLS.removeItem('xll_legacy_migrated_' + _currentUid);
                location.reload();
            };

            // ===== DOM 引用 =====
            var num1 = document.getElementById('num1');
            var num2 = document.getElementById('num2');
            var num3 = document.getElementById('num3');
            var questionInput = document.getElementById('questionInput');
            var charCount = document.getElementById('charCount');
            // 问念字符计数：实时更新 + 硬截断，maxlength=200
            if (questionInput && charCount) {
                (function initQCounter() {
                    var MAX_Q = 200;
                    var counterWrap = charCount.closest('.counter');
                    function updateCount() {
                        var v = questionInput.value || '';
                        if (v.length > MAX_Q) {
                            v = v.slice(0, MAX_Q);
                            questionInput.value = v;
                        }
                        charCount.textContent = v.length;
                        var isFull = v.length >= MAX_Q;
                        charCount.classList.toggle('full', isFull);
                        if (counterWrap) counterWrap.classList.toggle('full', isFull);
                    }
                    questionInput.addEventListener('input', updateCount);
                    questionInput.addEventListener('change', updateCount);
                    questionInput.addEventListener('paste', function() {
                        setTimeout(updateCount, 0);
                    });
                    updateCount();
                })();
            }
            var btnCalc = document.getElementById('btnCalc');
            var btnReset = document.getElementById('btnReset');
            var jiangBtn = document.getElementById('jiangBtn');
            var aiBtn = document.getElementById('aiBtn');
            var resultSection = document.getElementById('resultSection');
            var threeInline = document.getElementById('threeInline');
            var finalName = document.getElementById('finalName');
            var finalMeaning = document.getElementById('finalMeaning');
            var attrLine = document.getElementById('attrLine');
            var resultTimestamp = document.getElementById('resultTimestamp');
            var emptyHint = document.getElementById('emptyHint');
            var timeHint = document.getElementById('timeHint');
            var interpretationArea = document.getElementById('interpretationArea');
            var interpretationContent = document.getElementById('interpretationContent');
            var guFaDisplay = document.getElementById('guFaDisplay');
            var jiangDisplay = document.getElementById('jiangDisplay');
            var jiangInfo = document.getElementById('jiangInfo');
            var jiangTableBody = document.getElementById('jiangTableBody');
            var jieGua = document.getElementById('jieGua');
            var jieGuaContent = document.getElementById('jieGuaContent');

            var toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
            var historyPanel = document.getElementById('historyPanel');
            var historyList = document.getElementById('historyList');
            var historyBadge = document.getElementById('historyBadge');
            var clearHistoryBtn = document.getElementById('clearHistoryBtn');
            var timeToggleBtn = document.getElementById('timeToggleBtn');
            var randomBtn = document.getElementById('randomBtn');
            var menuExport = document.getElementById('menuExport');
            var menuImport = document.getElementById('menuImport');
            var fileInput = document.getElementById('fileInput');
            var templateFileInput = document.getElementById('templateFileInput');
            var refToggleBtn = document.getElementById('refToggleBtn');
            var refArrow = document.getElementById('refArrow');
            var referenceContent = document.getElementById('referenceContent');
            var shenRefGrid = document.getElementById('shenRefGrid');
            var qinRefGrid = document.getElementById('qinRefGrid');
            var shenRefGrid2 = document.getElementById('shenRefGrid2');
            var xingRefGrid = document.getElementById('xingRefGrid');

            // 更多菜单 DOM
            var moreBtn = document.getElementById('moreBtn');
            var moreMenu = document.getElementById('moreMenu');
            var moreModalMask = document.getElementById('moreModalMask');
            var moreModalClose = document.getElementById('moreModalClose');
            var moreModalBody = document.getElementById('moreModalBody');
            var moreModalTitle = document.getElementById('moreModalTitle');

            // 进阶排盘面板
            var advancedPanel = document.getElementById('advancedPanel');
            var tabJiang = document.getElementById('tabJiang');
            var tabDao = document.getElementById('tabDao');
            var advModeBadge = document.getElementById('advModeBadge');
            var advBadgeRow = document.getElementById('advBadgeRow');

            // 道传排盘 DOM
            var daoDisplay = document.getElementById('daoDisplay');
            var daoInfo = document.getElementById('daoInfo');
            var daoTableBody = document.getElementById('daoTableBody');
            var daoJieGuaContent = document.getElementById('daoJieGuaContent');

            var toast = document.getElementById('toast');
            var toastMessage = document.getElementById('toastMessage');

            // ===== 状态 =====
            var isJiangMethod = false;
            // 排盘模式：gufa / jiang / daochuan
            var currentDivinationMode = safeLS.getItem(_mkey()) || 'gufa';
            var pendingMethod = 'manual';
            var currentResult = null;
            var toastTimer = null;

            // ===== 历史记录 =====
            function saveToHistory(numbers, answers, finalShen, question, method, interpretation) {
                const records = loadHistoryRecords();
                if (records.length > 0) {
                    const last = records[0];
                    if (last.numbers[0] === numbers[0] && last.numbers[1] === numbers[1] && last.numbers[2] === numbers[
                            2] &&
                        (last.question || '') === question && last.finalShen.name === finalShen.name) {
                        // 相同卦例不新建，但把排盘模式/时间同步更新（用户可能在卦出后切到江氏/道传再保存）
                        last.mode = currentDivinationMode || 'gufa';
                        last.timestamp = Date.now();
                        safeLS.setItem(_hkey(), JSON.stringify(records));
                        renderHistoryList(records);
                        return last.id;
                    }
                }
                const record = {
                    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                    timestamp: Date.now(),
                    numbers,
                    answers: answers.map(a => ({ step: a.step, shen: { ...a.shen } })),
                    finalShen: { ...finalShen },
                    question: question || '',
                    method: method || 'manual',
                    mode: currentDivinationMode || 'gufa', // P1.3：历史记录模式标记
                    interpretation: interpretation || null
                };
                records.unshift(record);
                safeLS.setItem(_hkey(), JSON.stringify(records));
                updateBadge(records.length);
                renderHistoryList(records);
                return record.id;
            }

            // 同步最近一条卦例的排盘模式（切江氏/道传时，把当前显示的卦例记录也更新）
            function syncLastHistoryMode() {
                try {
                    if (!currentResult) return null;
                    const recs = loadHistoryRecords();
                    if (!recs || recs.length === 0) return null;
                    const last = recs[0];
                    const wantMode = currentDivinationMode || 'gufa';
                    if (last.mode === wantMode) return last.id;
                    // 只在"三宫+终卦名+数字"能对应上时才同步更新，避免串到别的卦
                    const matchNames = last.answers.every((a, i) => a.shen.name === (currentResult.answers[i] && currentResult.answers[i].shen.name))
                        && last.finalShen.name === currentResult.finalShen.name
                        && last.numbers[0] === (currentResult.numbers ? currentResult.numbers[0] : last.numbers[0]);
                    if (!matchNames) return null;
                    last.mode = wantMode;
                    safeLS.setItem(_hkey(), JSON.stringify(recs));
                    renderHistoryList(recs);
                    return last.id;
                } catch (e) { return null; }
            }

            function loadHistoryRecords() {
                try { const data = safeLS.getItem(_hkey()); return data ? JSON.parse(data) : []; } catch { return []; }
            }

            function deleteHistoryRecord(id) {
                let records = loadHistoryRecords();
                records = records.filter(r => r.id !== id);
                safeLS.setItem(_hkey(), JSON.stringify(records));
                updateBadge(records.length);
                renderHistoryList(records);
            }

            function editHistoryQuestion(id, newQuestion) {
                let records = loadHistoryRecords();
                const rec = records.find(r => r.id === id);
                if (rec) { rec.question = newQuestion.slice(0, 50);
                    safeLS.setItem(_hkey(), JSON.stringify(records));
                    renderHistoryList(records); }
            }

            function clearAllHistory() {
                if (confirm('确定清空所有占卜记录吗？')) { safeLS.removeItem(_hkey());
                    updateBadge(0);
                    renderHistoryList([]); }
            }

            function loadHistoryRecordById(id) {
                const records = loadHistoryRecords();
                const rec = records.find(r => r.id === id);
                if (!rec) return;
                // P1.3：历史记录模式标记 — 加载历史时同步切换排盘模式
                if (rec.mode && typeof switchDivinationMode === 'function') {
                    switchDivinationMode(rec.mode, /*silent*/ true);
                }
                num1.value = rec.numbers[0];
                num2.value = rec.numbers[1];
                num3.value = rec.numbers[2];
                if (rec.question) { questionInput.value = rec.question;
                    charCount.textContent = rec.question.length; } else { questionInput.value = '';
                    charCount.textContent = '0'; }
                const answers = rec.answers.map(a => ({ step: a.step, shen: a.shen }));
                saveAndDisplay(answers, rec.finalShen, rec.timestamp, rec.interpretation || null, rec.question || '',
                    rec.method || 'manual', rec.numbers);
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }



            var refOpen = false;
            try {
                if (refToggleBtn) {
                    refToggleBtn.addEventListener('click', function() {
                        refOpen = !refOpen;
                        referenceContent.classList.toggle('open', refOpen);
                        refArrow.classList.toggle('open', refOpen);
                        refArrow.textContent = refOpen ? '▼' : '▶';
                        if (refOpen) renderKnowledge();
                    });
                }
            } catch (_e) { console.error('[V2.2-fix] refToggleBtn binding failed:', _e); }

            // ===== 导入导出 =====
            // 互通说明：
            //   V2.2 导出纯数组 [{...}]，兼容旧 V2.2（旧版只认数组）
            //   V3.0 导出信封 {history:[...]}，兼容旧 V3.0（旧版只认信封）
            //   V2.2 导入兼容数组 + 信封（V3.0 格式）
            //   V3.0 导入兼容数组 + 信封（V2.2 格式）+ 额外提供「导出V2.2格式」
            function exportData() {
                const records = loadHistoryRecords();
                if (records.length === 0) { alert('暂无数据可导出。'); return; }
                const json = JSON.stringify(records, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `liuShen_export_${formatTime(Date.now()).replace(/[:-\s]/g, '')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            function importData(file) {
                if (!file) { alert('未选择文件。'); return; }
                var reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        var rawText = e.target.result;
                        if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
                            alert('文件内容为空。'); return;
                        }
                        var raw = JSON.parse(rawText);
                        var imported, importMeta;
                        // 兼容四种格式（按优先级）：
                        // 1) V3.0 信封：{ version, history, customTemplates }
                        // 2) V2.2.1 信封：{ version: "2.2", history }
                        // 3) V2.2 旧格式：纯数组 [...]
                        // 4) V2.0 旧格式：{ records: [...] } 或 { data: [...] }
                        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
                            if (Array.isArray(raw.history)) {
                                imported = raw.history;
                                importMeta = { version: raw.version || 'unknown', hasTemplates: !!raw.customTemplates };
                            } else if (Array.isArray(raw.records)) {
                                imported = raw.records;
                                importMeta = { version: raw.version || 'unknown', hasTemplates: false };
                            } else if (Array.isArray(raw.data)) {
                                imported = raw.data;
                                importMeta = { version: raw.version || 'unknown', hasTemplates: false };
                            } else {
                                alert('JSON 格式错误：未找到 history/records/data 数组。'); return;
                            }
                        } else if (Array.isArray(raw)) {
                            imported = raw;
                            importMeta = { version: 'unknown', hasTemplates: false };
                        } else {
                            alert('JSON 格式错误：期望为数组或 { history/records/data: [...] } 信封格式。'); return;
                        }
                        if (!imported || imported.length === 0) {
                            alert('文件中没有可导入的记录。'); return;
                        }
                        var currentRecords = loadHistoryRecords();
                        var existingIds = {};
                        for (var i = 0; i < currentRecords.length; i++) {
                            if (currentRecords[i].id) existingIds[currentRecords[i].id] = true;
                        }
                        var added = 0, skipped = 0, repaired = 0;
                        imported.forEach(function(rec) {
                            if (!rec || typeof rec !== 'object') { skipped++; return; }
                            var rid = rec.id;
                            if (!rid) {
                                rid = (rec.timestamp || Date.now()) + '_' + Math.random().toString(36).slice(2, 6);
                                repaired++;
                            }
                            if (existingIds[rid]) { skipped++; return; }
                            if (!rec.numbers || !Array.isArray(rec.numbers) || rec.numbers.length < 3) { skipped++; return; }
                            if (!rec.answers || !Array.isArray(rec.answers) || rec.answers.length < 3) { skipped++; return; }
                            if (!rec.finalShen || typeof rec.finalShen !== 'object') { skipped++; return; }
                            var clean = {
                                id: rid,
                                timestamp: typeof rec.timestamp === 'number' ? rec.timestamp : Date.now(),
                                numbers: rec.numbers.slice(0, 3),
                                answers: rec.answers.slice(0, 3).map(function(a) {
                                    // V2.2 格式：{step, shen:{name, index, cls, meaning, detail}}
                                    if (a.shen && typeof a.shen === 'object') {
                                        return {
                                            step: a.step || 0,
                                            shen: {
                                                name: String(a.shen.name || ''),
                                                index: typeof a.shen.index === 'number' ? a.shen.index : 0,
                                                cls: String(a.shen.cls || ''),
                                                meaning: String(a.shen.meaning || ''),
                                                detail: String(a.shen.detail || '')
                                            }
                                        };
                                    }
                                    // V3.0 格式：{index, name, meaning, detail} → 转换为 V2.2 格式
                                    if (typeof a.name === 'string' && a.name) {
                                        return {
                                            step: typeof a.index === 'number' ? a.index : 0,
                                            shen: {
                                                name: String(a.name || ''),
                                                index: typeof a.index === 'number' ? a.index : 0,
                                                cls: '',
                                                meaning: String(a.meaning || ''),
                                                detail: String(a.detail || '')
                                            }
                                        };
                                    }
                                    // 无法识别的格式，提供空占位
                                    return { step: 0, shen: { name: '', index: 0, cls: '', meaning: '', detail: '' } };
                                }),
                                finalShen: {
                                    name: String(rec.finalShen.name || ''),
                                    index: typeof rec.finalShen.index === 'number' ? rec.finalShen.index : 0,
                                    cls: String(rec.finalShen.cls || ''),
                                    meaning: String(rec.finalShen.meaning || ''),
                                    detail: String(rec.finalShen.detail || '')
                                },
                                question: typeof rec.question === 'string' ? rec.question : '',
                                method: rec.method || 'manual',
                                mode: rec.mode || 'gufa',
                                interpretation: rec.interpretation || null,
                                feedback: rec.feedback || null
                            };
                            currentRecords.push(clean);
                            existingIds[rid] = true;
                            added++;
                        });
                        currentRecords.sort(function(a, b) { return b.timestamp - a.timestamp; });
                        safeLS.setItem(_hkey(), JSON.stringify(currentRecords));
                        updateBadge(currentRecords.length);
                        renderHistoryList(currentRecords);
                        var msg = '导入成功！新增 ' + added + ' 条记录';
                        if (repaired > 0) msg += '，修复 ' + repaired + ' 条缺失ID的记录';
                        if (skipped > 0) msg += '，跳过 ' + skipped + ' 条无效/重复记录';
                        msg += '，共 ' + currentRecords.length + ' 条。';
                        alert(msg);
                    } catch (err) { alert('解析 JSON 失败：' + err.message); }
                };
                reader.onerror = function() { alert('读取文件失败，请重试。'); };
                reader.readAsText(file);
                fileInput.value = '';
            }


            var currentTplId = 'gufa';
            var currentAiBox = null;
            // P0.7 + P1.2：当前 AI 提示词 key（gupai / jiangshi / daochuan），与排盘模式绑定并持久化
            var currentAIPromptKey = safeLS.getItem('xll_ai_prompt_key') || 'gupai';

            // P0.7：三套 AI 提示词模板（从 V3.0 迁移）
            var AI_PROMPTS = {
                gupai: {
                    id: 'gupai',
                    name: '古法排盘',
                    description: '小六壬古法三宫推算，适用ChatGPT、DeepSeek等',
                    icon: '📜'
                },
                jiangshi: {
                    id: 'jiangshi',
                    name: '江氏小六壬',
                    description: '江氏排盘，侧重六亲六神六星分析',
                    icon: '☯'
                },
                daochuan: {
                    id: 'daochuan',
                    name: '道传小六壬',
                    description: '道传体系，死活六神双轨合参 + 六亲分析',
                    icon: '🔯'
                }
            };

            function loadCustomTemplates() {
                try { return JSON.parse(safeLS.getItem(_tkey()) || '{}'); } catch { return {}; }
            }
            function saveCustomTemplates(obj) {
                try { safeLS.setItem(_tkey(), JSON.stringify(obj)); }
                catch (e) { alert('模板保存失败：' + e.message); }
            }


            /* ---------- 解卦反馈 ---------- */
            var currentFbId = null;
            var currentFbRating = 0;
            var currentFbBox = null;
            var FB_RATING_LABELS = ['', '很不准', '不太准', '一般', '较准', '非常准'];

            function updateHistoryRecord(id, patch) {
                const records = loadHistoryRecords();
                const rec = records.find(function (r) { return r.id === id; });
                if (!rec) return false;
                Object.assign(rec, patch);
                safeLS.setItem(_hkey(), JSON.stringify(records));
                renderHistoryList(records);
                return true;
            }
