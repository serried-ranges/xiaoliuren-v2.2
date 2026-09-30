// =========================================================
// 入口：时间起卦 / 随机 / 手动排盘 / init + DOMContentLoaded
// （从 V2.1.2 app-all.js 物理切分，保持 1:1 逻辑不变；去 IIFE 后共享 Script scope）
// =========================================================
'use strict';

// ===== V2.2.0 版本标记（方便用户确认加载的是最新版）=====
console.log('[小六壬] V2.2.0 loaded @ ' + new Date().toISOString());

/**
 * V2.1.2 应用代码（整块整体迁移至 V2.2，保证 1:1 逻辑/UI 不变）
 * =========================================================
 * 包含以下功能模块（V2.2 后续可继续细拆为子文件）：
 *   · showToast / fallbackCopy        → src/utils/dom.js
 *   · 农历查询 / 排盘核心逻辑            → src/core/calculator.js
 *   · 模板管理（导入/导出/编辑）       → src/ui/template.js
 *   · 解卦反馈（星级 + 文字）          → src/ui/feedback.js
 *   · 历史记录（CRUD + id 迁移）       → src/store/state.js
 *   · 排盘渲染器 + 事件绑定入口        → src/ui/renderer.js + main.js
 */


            // ===== 时间起卦 =====
            function getCurrentTimeNumbers() {
                const now = new Date();
                let hours = now.getHours();
                // 0点取10，11点取11，12点取12，13点取1...
                if (hours === 0) hours = 10;
                else if (hours > 12) hours = hours - 12;
                const minutes = now.getMinutes();
                const tens = Math.floor(minutes / 10);
                const ones = minutes % 10;
                const n2 = tens === 0 ? 10 : tens;
                const n3 = ones === 0 ? 10 : ones;
                return [hours, n2, n3];
            }

            function timeGo() {
                const nums = getCurrentTimeNumbers();
                num1.value = nums[0];
                num2.value = nums[1];
                num3.value = nums[2];
                const now = new Date();
                const h = now.getHours() % 12 || 12;
                const m = now.getMinutes();
                timeHint.textContent = `⏱️ 当前时间 ${h}:${String(m).padStart(2, '0')} → 数字 ${nums.join('、')}`;
                timeHint.classList.add('show');
                pendingMethod = 'time';
            }

            function randomGo() {
                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                num1.value = rand(1, 999);
                num2.value = rand(1, 999);
                num3.value = rand(1, 999);
                timeHint.classList.remove('show');
                pendingMethod = 'random';
            }

            function runCalculation(method) {
                method = method || 'manual';
                const vals = getInputValues();
                if (!vals) { alert('请填写三个有效的数字'); return; }
                const [n1, n2, n3] = vals.map(v => Math.abs(v));
                const result = calculate(n1, n2, n3);
                const question = questionInput.value.trim().slice(0, 200);
                // 先 saveAndDisplay（currentResult 有 numbers 字段），再 saveToHistory
                saveAndDisplay(result.answers, result.finalShen, Date.now(), result.interpretation, question, method, result.numbers);
                saveToHistory(result.numbers, result.answers, result.finalShen, question, method, result.interpretation);
                // 推算完成后启用进阶排盘和 AI 解析
                if (jiangBtn) { jiangBtn.disabled = false; jiangBtn.classList.remove('btn-disabled'); }
                if (aiBtn) { aiBtn.disabled = false; aiBtn.classList.remove('btn-disabled'); }
            }

            function resetAll() {
                num1.value = '';
                num2.value = '';
                num3.value = '';
                questionInput.value = '';
                charCount.textContent = '0';
                clearResult();
                num1.focus();
                // 重置为古法模式
                switchDivinationMode('gufa', /*silent*/ false);
                // 重置后禁用进阶排盘和 AI 解析
                if (jiangBtn) { jiangBtn.disabled = true; jiangBtn.classList.add('btn-disabled'); }
                if (aiBtn) { aiBtn.disabled = true; aiBtn.classList.add('btn-disabled'); }
            }

            // ===== P0.5/P0.6 + P1.1/P1.2：排盘模式切换（古法 / 江氏 / 道传）+ 徽章 + 持久化 =====
            function renderDivinationModeBadge() {
                if (!advModeBadge) return;
                var mode = currentDivinationMode || 'gufa';
                // 背景色已区分类型（蓝/绿/紫胶囊），文字只显示类型名，不再重复前缀
                if (mode === 'gufa') {
                    advModeBadge.textContent = '古法排盘';
                    advModeBadge.className = 'adv-mode-badge badge-gufa';
                } else if (mode === 'jiang') {
                    advModeBadge.textContent = '江氏小六壬';
                    advModeBadge.className = 'adv-mode-badge badge-jiang';
                } else if (mode === 'daochuan') {
                    advModeBadge.textContent = '道传小六壬';
                    advModeBadge.className = 'adv-mode-badge badge-dao';
                }
            }

            function syncAdvancedTabUI() {
                if (!tabJiang || !tabDao) return;
                var mode = currentDivinationMode || 'gufa';
                tabJiang.classList.toggle('active', mode === 'jiang');
                tabDao.classList.toggle('active', mode === 'daochuan');
            }

            function syncJiangBtnUI() {
                if (!jiangBtn) return;
                var mode = currentDivinationMode || 'gufa';
                var inAdvanced = (mode === 'jiang' || mode === 'daochuan');
                jiangBtn.textContent = inAdvanced ? '返回古法' : '进阶排盘';
                jiangBtn.classList.toggle('active', inAdvanced);
            }

            function bindPromptKeyToMode(mode) {
                // P0.7：选了哪种排盘，提示词就对应哪种
                var key = 'gupai';
                if (mode === 'jiang') key = 'jiangshi';
                else if (mode === 'daochuan') key = 'daochuan';
                currentAIPromptKey = key;
                currentTplId = (mode === 'jiang') ? 'jiangshi' : 'gufa'; // 兼容旧模板 UI
                safeLS.setItem('xll_ai_prompt_key', key);
            }

            function switchDivinationMode(mode, silent) {
                // mode: 'gufa' | 'jiang' | 'daochuan'
                if (!mode) mode = 'gufa';
                currentDivinationMode = mode;
                safeLS.setItem(_mkey(), mode);
                // 同步最近一条历史记录的排盘模式（如果当前显示的卦例存在）
                try { if (typeof syncLastHistoryMode === 'function') syncLastHistoryMode(); } catch (e) {}
                // 同步 isJiangMethod（兼容旧代码）
                isJiangMethod = (mode === 'jiang' || mode === 'daochuan');
                // 同步提示词模板
                bindPromptKeyToMode(mode);
                // 同步 UI
                syncJiangBtnUI();
                syncAdvancedTabUI();
                renderDivinationModeBadge();
                // 进阶面板显隐
                if (advancedPanel) {
                    if (mode === 'gufa') advancedPanel.style.display = 'none';
                    else advancedPanel.style.display = '';
                }
                if (advBadgeRow) {
                    if (mode === 'gufa') advBadgeRow.style.display = 'none';
                    else advBadgeRow.style.display = '';
                }
                if (!silent && currentResult) displayResult();
            }

            function toggleJiangMethod() {
                // 原「江氏排法」升级为「进阶排盘」按钮：gufa ⇄ 江氏（若面板已打开则切回古法）
                var cur = currentDivinationMode || 'gufa';
                if (cur === 'gufa') switchDivinationMode('jiang', false);
                else switchDivinationMode('gufa', false);
            }


            // ===== 初始化 =====
            function init() {
                // 每个绑定独立 try/catch，防止单点失败导致关键按钮不绑定
                function safeBind(domEl, event, handler, label) {
                    try {
                        if (!domEl) { console.warn('[V2.2-fix] init: ' + label + ' DOM 引用为 null，跳过绑定'); return; }
                        domEl.addEventListener(event, handler);
                    } catch (_e) { console.error('[V2.2-fix] init: ' + label + ' 绑定失败:', _e); }
                }

                // 初始化：恢复上次使用的排盘模式（默认古法）；V2.1.2 不持久化，本版为行为修复
                try {
                    var _initMode = (currentDivinationMode === 'jiang' || currentDivinationMode === 'daochuan') ? currentDivinationMode : 'gufa';
                    switchDivinationMode(_initMode, true);
                } catch (_e) { console.warn('[V2.2-fix] 模式初始化失败:', _e); }

                // 初始禁用进阶排盘和 AI 解析（需先完成推算）
                if (jiangBtn) { jiangBtn.disabled = true; jiangBtn.classList.add('btn-disabled'); }
                if (aiBtn) { aiBtn.disabled = true; aiBtn.classList.add('btn-disabled'); }

                safeBind(toggleHistoryBtn, 'click', toggleHistoryPanel, 'toggleHistoryBtn');
                safeBind(clearHistoryBtn, 'click', clearAllHistory, 'clearHistoryBtn');
                safeBind(btnCalc, 'click', function() { runCalculation(pendingMethod); }, 'btnCalc');
                [num1, num2, num3].forEach(function(el) {
                    if (el) { try { el.addEventListener('input', function() { pendingMethod = 'manual'; }); } catch(_e) {} }
                });
                safeBind(btnReset, 'click', resetAll, 'btnReset');
                safeBind(timeToggleBtn, 'click', timeGo, 'timeToggleBtn');
                safeBind(randomBtn, 'click', randomGo, 'randomBtn');
                safeBind(jiangBtn, 'click', toggleJiangMethod, 'jiangBtn');

                // P0.5/P0.6：进阶排盘面板 Tab 切换
                safeBind(tabJiang, 'click', function() { switchDivinationMode('jiang', false); }, 'tabJiang');
                safeBind(tabDao, 'click', function() { switchDivinationMode('daochuan', false); }, 'tabDao');

                safeBind(aiBtn, 'click', showAIPrompt, 'aiBtn');

                safeBind(menuExport, 'click', function() { toggleMoreMenu(false); exportData(); }, 'menuExport');
                safeBind(menuImport, 'click', function() { toggleMoreMenu(false); fileInput.click(); }, 'menuImport');
                safeBind(fileInput, 'change', function(e) {
                    if (this.files.length > 0) importData(this.files[0]);
                }, 'fileInput');

                if (templateFileInput) {
                    safeBind(templateFileInput, 'change', function(e) {
                        if (this.files.length > 0) importTemplates(this.files[0]);
                    }, 'templateFileInput');
                }

                try {
                    document.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            var active = document.activeElement;
                            if (active === num1 || active === num2 || active === num3 || active === questionInput) {
                                e.preventDefault();
                                runCalculation('manual');
                            }
                        }
                    });
                } catch(_e) { console.error('[V2.2-fix] keydown 绑定失败:', _e); }

                [num1, num2, num3].forEach(function(el) {
                    if (!el) return;
                    try {
                        el.addEventListener('input', function() {
                            if (resultSection && resultSection.classList.contains('visible')) {
                                clearTimeout(el._clearTimer);
                                el._clearTimer = setTimeout(function() {
                                    if (resultSection && resultSection.classList.contains('visible')) clearResult();
                                }, 350);
                            }
                        });
                    } catch(_e) {}
                });

                // 安全加载历史记录（localStorage 禁用时返回空数组，不会崩溃）
                try {
                    var records = loadHistoryRecords();
                    if (typeof updateBadge === 'function') updateBadge(records.length);
                } catch(_e) { console.warn('[V2.2-fix] 历史记录加载失败（可能 localStorage 被禁用）:', _e.message); }

                console.log('[V2.2-fix] ✅ init() 完成，所有按钮绑定就绪');
            }

            window.addEventListener('DOMContentLoaded', init);
            console.log('小六壬 · 速断排盘 V2.2.0 已加载（农历采用 lunar-javascript 权威库，数据源：紫金山天文台 GB/T 33661-2017）');