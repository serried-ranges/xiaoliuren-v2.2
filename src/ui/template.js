// =========================================================
// 模板管理：模板 CRUD + AI 提示词生成 + V2.2 新版 AI 解析弹窗（含模板栏）
// （从 V2.1.2 app-all.js 物理切分，保持 1:1 逻辑不变；去 IIFE 后共享 Script scope）
// =========================================================
'use strict';

            // ===== AI 解析提示词：两个页面共用 serverless/packages/prompts 的新基线 =====
            function generateCanonicalPrompt(mode) {
                if (!currentResult) {
                    alert('请先进行占卜排盘，再使用AI解析功能。');
                    return;
                }
                const prompts = globalThis.XiaoliurenCanonicalPrompts;
                if (!prompts) throw new Error('canonical_prompt_not_loaded');
                return prompts.buildPrompt(mode, currentResult, {
                    formatDate: formatTime,
                    getShiChen,
                    solarToLunar,
                    formatLunar: lunar => lunar && lunar.lunarYear ? `${lunar.lunarYear}年${lunar.lunarMonth}月${lunar.lunarDay}日` : '—',
                    generateJiangPai,
                    generateJiangInterpretation: generateJieGua,
                    generateDaoPai,
                    generateDaoInterpretation: generateDaoJieGuaText
                });
            }
            function generateAIPrompt() { return generateCanonicalPrompt('jiangshi'); }
            function generateGuFaPrompt() {
                return generateCanonicalPrompt('gufa');
            }
            function generateDaoPrompt() {
                return generateCanonicalPrompt('daochuan');
            }

            // ===== V2.2：模板管理 / 解卦反馈 =====

            function tplEscape(s) {
                return String(s == null ? '' : s)
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            }


            /* ---------- 模板管理 ----------
             * 默认模板：古法(gufa)/江氏(jiangshi)，内容由当前排盘动态生成；可导出，不可删除。
             * 自定义模板：存于 localStorage（TPL_KEY），可编辑/删除/导出/导入。
             */

            function getAllTemplates() {
                const list = [
                    { id: 'gufa', name: '古法', isDefault: true },
                    { id: 'jiangshi', name: '江氏', isDefault: true },
                    { id: 'daochuan', name: '道传', isDefault: true }
                ];
                const customs = loadCustomTemplates();
                Object.values(customs).forEach(function (t) {
                    if (t && t.id && t.name) list.push({ id: t.id, name: t.name, isDefault: false });
                });
                return list;
            }
            function getDefaultTemplateText(id) {
                if (!currentResult) return '';
                if (id === 'jiangshi') return generateAIPrompt() || '';
                if (id === 'daochuan') return generateDaoPrompt() || '';
                return generateGuFaPrompt() || '';
            }
            function getTemplateText(id) {
                if (isDefaultTpl(id)) return getDefaultTemplateText(id);
                const c = loadCustomTemplates()[id];
                return c ? (c.text || '') : '';
            }
            function tplIcon(id) {
                if (id === 'gufa') return '📜';
                if (id === 'jiangshi') return '☯';
                if (id === 'daochuan') return '🔯';
                return '⭐';
            }
            function isDefaultTpl(id) { return id === 'gufa' || id === 'jiangshi' || id === 'daochuan'; }
            function renderTplTabs() {
                if (!currentAiBox) return;
                const tabsEl = currentAiBox.querySelector('#tplTabs');
                if (!tabsEl) return;
                const all = getAllTemplates();
                tabsEl.innerHTML = all.map(function (t) {
                    const cls = 'tpl-tab' + (t.id === currentTplId ? ' active' : '') + (t.isDefault ? '' : ' tpl-custom');
                    return '<button class="' + cls + '" data-tpl="' + tplEscape(t.id) + '">' + tplIcon(t.id) + ' ' + tplEscape(t.name) + '</button>';
                }).join('');
                tabsEl.querySelectorAll('.tpl-tab').forEach(function (btn) {
                    btn.addEventListener('click', function () { switchTemplate(btn.dataset.tpl); });
                });
            }
            function updateAiModeLabel() {
                if (!currentAiBox) return;
                const modeEl = currentAiBox.querySelector('#aiPromptMode');
                const t = getAllTemplates().find(function (x) { return x.id === currentTplId; });
                if (modeEl && t) modeEl.innerHTML = tplIcon(t.id) + ' 当前：' + tplEscape(t.name);
            }
            function switchTemplate(id) {
                if (!getAllTemplates().some(function (t) { return t.id === id; })) id = 'gufa';
                currentTplId = id;
                const text = getTemplateText(id);
                const textEl = currentAiBox && currentAiBox.querySelector('#aiPromptText');
                if (textEl) textEl.value = text;
                renderTplTabs();
                updateAiModeLabel();
                syncTplQuickBtns();
                closeTplEditor();
            }
            function openTplEditor() {
                if (!currentAiBox) return;
                const editor = currentAiBox.querySelector('#tplEditor');
                if (!editor) return;
                const custom = !isDefaultTpl(currentTplId);
                const customs = loadCustomTemplates();
                const nameInput = editor.querySelector('#tplName');
                const textEl = editor.querySelector('#tplText');
                const delBtn = editor.querySelector('#tplDelBtn');
                const saveBtn = editor.querySelector('#tplSaveBtn');
                const titleEl = editor.querySelector('#tplEditorTitle');
                if (custom) {
                    const c = customs[currentTplId] || {};
                    if (nameInput) nameInput.value = c.name || '';
                    if (textEl) textEl.value = c.text || getTemplateText(currentTplId);
                    if (delBtn) delBtn.style.display = '';
                    if (saveBtn) saveBtn.textContent = '💾 保存';
                    if (titleEl) titleEl.textContent = '编辑模板：' + (c.name || '');
                } else {
                    if (nameInput) nameInput.value = '';
                    if (textEl) textEl.value = getTemplateText(currentTplId);
                    if (delBtn) delBtn.style.display = 'none';
                    if (saveBtn) saveBtn.textContent = '💾 另存为新模板';
                    if (titleEl) titleEl.textContent = '编辑默认模板（仅可「另存为新模板」）';
                }
                editor.classList.add('show');
                setTimeout(function () { if (textEl) textEl.focus(); }, 50);
            }
            function closeTplEditor() {
                if (!currentAiBox) return;
                const editor = currentAiBox.querySelector('#tplEditor');
                if (editor) editor.classList.remove('show');
            }
            function saveTplFromEditor() {
                if (!currentAiBox) return;
                const editor = currentAiBox.querySelector('#tplEditor');
                const nameInput = editor.querySelector('#tplName');
                const textEl = editor.querySelector('#tplText');
                const text = textEl ? textEl.value : '';
                const customs = loadCustomTemplates();
                if (!isDefaultTpl(currentTplId)) {
                    const c = customs[currentTplId] || {};
                    let name = (nameInput && nameInput.value.trim()) || c.name || '我的模板';
                    name = name.slice(0, 20);
                    customs[currentTplId] = { id: currentTplId, name: name, text: text };
                    saveCustomTemplates(customs);
                    renderTplTabs();
                    updateAiModeLabel();
                    const mainText = currentAiBox.querySelector('#aiPromptText');
                    if (mainText) mainText.value = text;
                    closeTplEditor();
                    showToast('模板「' + name + '」已保存', '💾');
                } else {
                    let name = (nameInput && nameInput.value.trim()) || '我的模板';
                    name = name.slice(0, 20);
                    const id = 'custom_' + Date.now().toString(36);
                    customs[id] = { id: id, name: name, text: text };
                    saveCustomTemplates(customs);
                    currentTplId = id;
                    renderTplTabs();
                    updateAiModeLabel();
                    const mainText = currentAiBox.querySelector('#aiPromptText');
                    if (mainText) mainText.value = text;
                    closeTplEditor();
                    showToast('已另存为新模板「' + name + '」', '⭐');
                }
            }
            function deleteCurrentTpl() {
                if (isDefaultTpl(currentTplId)) { showToast('默认模板不可删除', '⚠️'); return; }
                const customs = loadCustomTemplates();
                const c = customs[currentTplId];
                if (!c) return;
                if (!confirm('确定删除自定义模板「' + (c.name || '') + '」？')) return;
                delete customs[currentTplId];
                saveCustomTemplates(customs);
                closeTplEditor();
                switchTemplate('gufa');
                syncTplQuickBtns();
                showToast('模板已删除', '🗑️');
            }
            // ===== 主面板快捷：💾 一键保存（默认模板→另存为；自定义模板→覆盖保存当前 textarea）
            function quickSaveCurrentTpl() {
                if (!currentAiBox) return;
                const textEl = currentAiBox.querySelector('#aiPromptText');
                const curText = textEl ? textEl.value : '';
                const customs = loadCustomTemplates();
                const custom = !isDefaultTpl(currentTplId);
                if (custom) {
                    const c = customs[currentTplId] || {};
                    const name = (c.name || '我的模板').slice(0, 20);
                    customs[currentTplId] = { id: currentTplId, name: name, text: curText };
                    saveCustomTemplates(customs);
                    showToast('模板「' + name + '」已保存当前内容', '💾');
                    syncTplQuickBtns();
                    return;
                }
                // 默认模板 → 一键另存为新模板
                let name = prompt('请输入新模板名称：', '我的模板');
                if (!name || !name.trim()) return;
                name = name.trim().slice(0, 20);
                const id = 'custom_' + Date.now().toString(36);
                customs[id] = { id: id, name: name, text: curText };
                saveCustomTemplates(customs);
                currentTplId = id;
                renderTplTabs();
                updateAiModeLabel();
                syncTplQuickBtns();
                showToast('已另存为新模板「' + name + '」', '⭐');
            }
            // ===== 主面板快捷：🗑️ 一键删除自定义模板
            function quickDeleteCurrentTpl() {
                if (isDefaultTpl(currentTplId)) { showToast('默认模板不可删除', '⚠️'); return; }
                deleteCurrentTpl();
            }
            // ===== 刷新主面板快捷按钮的启用/文字
            function syncTplQuickBtns() {
                if (!currentAiBox) return;
                const saveBtn = currentAiBox.querySelector('#tplQuickSaveBtn');
                const delBtn = currentAiBox.querySelector('#tplQuickDelBtn');
                const custom = !isDefaultTpl(currentTplId);
                if (saveBtn) {
                    saveBtn.textContent = custom ? '💾 保存模板' : '💾 另存为新模板';
                    saveBtn.disabled = false;
                }
                if (delBtn) {
                    if (custom) { delBtn.disabled = false; delBtn.style.opacity = '1'; delBtn.style.cursor = 'pointer'; }
                    else { delBtn.disabled = true; delBtn.style.opacity = '0.45'; delBtn.style.cursor = 'not-allowed'; }
                }
            }
            function createNewTemplate() {
                const name = prompt('请输入新模板名称：', '我的模板');
                if (!name || !name.trim()) return;
                const trimmed = name.trim().slice(0, 20);
                const id = 'custom_' + Date.now().toString(36);
                let seed = '';
                if (currentAiBox) {
                    const ta = currentAiBox.querySelector('#aiPromptText');
                    if (ta && ta.value) seed = ta.value;
                }
                if (!seed) seed = getTemplateText(currentTplId) || getDefaultTemplateText('gufa');
                const customs = loadCustomTemplates();
                customs[id] = { id: id, name: trimmed, text: seed };
                saveCustomTemplates(customs);
                currentTplId = id;
                if (currentAiBox) {
                    renderTplTabs();
                    const mainText = currentAiBox.querySelector('#aiPromptText');
                    if (mainText) mainText.value = seed;
                    updateAiModeLabel();
                    openTplEditor();
                }
                showToast('已新增模板「' + trimmed + '」，可编辑后保存', '⭐');
            }
            function exportCurrentTpl() {
                const id = currentTplId;
                const custom = !isDefaultTpl(id);
                let name, text;
                // 导出以主面板 textarea 的实际内容为准（用户可能临时改过）
                let liveText = '';
                if (currentAiBox) {
                    const ta = currentAiBox.querySelector('#aiPromptText');
                    if (ta) liveText = ta.value;
                }
                if (custom) {
                    const c = loadCustomTemplates()[id] || {};
                    name = c.name || '自定义模板';
                    text = liveText || c.text || '';
                } else {
                    if (id === 'gufa') name = '古法';
                    else if (id === 'jiangshi') name = '江氏';
                    else if (id === 'daochuan') name = '道传';
                    else name = id;
                    text = liveText || getTemplateText(id) || '';
                }
                const payload = {
                    app: 'xiaoliuren-v2.2',
                    type: 'template',
                    exportedAt: new Date().toISOString(),
                    templates: [{ id: id, name: name, isDefault: !custom, text: text }]
                };
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'template_' + name + '_' + formatTime(Date.now()).replace(/[:-\s]/g, '') + '.json';
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('模板「' + name + '」已导出', '📤');
            }
            function importTemplates(file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        let list = [];
                        if (Array.isArray(data)) list = data;
                        else if (data && Array.isArray(data.templates)) list = data.templates;
                        else if (data && data.id && data.name && typeof data.text === 'string') list = [data];
                        else throw new Error('未识别的模板格式（期望数组、{templates:[...]} 或单个模板对象）');
                        const customs = loadCustomTemplates();
                        let added = 0;
                        list.forEach(function (t, i) {
                            if (!t || !t.name || typeof t.text !== 'string') return;
                            let id = t.id;
                            if (!id || isDefaultTpl(id)) id = 'custom_' + Date.now().toString(36) + '_' + i;
                            while (customs[id]) id = 'custom_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
                            customs[id] = { id: id, name: String(t.name).slice(0, 20), text: t.text };
                            added++;
                        });
                        saveCustomTemplates(customs);
                        if (currentAiBox) renderTplTabs();
                        showToast('导入成功，新增 ' + added + ' 个模板', '📥');
                    } catch (err) {
                        alert('解析模板 JSON 失败：' + err.message);
                    }
                };
                reader.readAsText(file);
                if (templateFileInput) templateFileInput.value = '';
            }


            /* ---------- V2.2 新版 AI 解析弹窗（含模板栏） ---------- */
            function showAIPrompt() {
                if (!currentResult) { alert('请先进行占卜排盘，再使用AI解析功能。'); return; }
                // P0.7：依据 currentDivinationMode / currentAIPromptKey 选择默认模板
                var mode = currentDivinationMode || 'gufa';
                if (mode === 'jiang') currentTplId = 'jiangshi';
                else if (mode === 'daochuan') currentTplId = 'daochuan';
                else currentTplId = 'gufa';
                // 若持久化了提示词 key，且合法，优先用
                if (currentAIPromptKey && (currentAIPromptKey === 'gupai' || currentAIPromptKey === 'jiangshi' || currentAIPromptKey === 'daochuan')) {
                    currentTplId = (currentAIPromptKey === 'gupai') ? 'gufa' : currentAIPromptKey;
                }
                const prompt = getTemplateText(currentTplId);
                if (!prompt) { console.warn('[AI解析] 提示词为空，弹窗未创建（请先排盘）'); return; }

                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;justify-content:center;';

                const box = document.createElement('div');
                box.style.cssText = 'background:#fffef9;border-radius:13px;padding:21px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:560px;width:92%;max-height:88vh;display:flex;flex-direction:column;font-family:system-ui,"Microsoft YaHei",sans-serif;';

                box.innerHTML =
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
                      '<div style="font-size:16px;font-weight:600;color:#2c2416;">🤖 AI 解析提示词</div>' +
                      '<div id="aiPromptMode" style="font-size:12px;color:#fff;background:#c8a84e;padding:3px 10px;border-radius:10px;font-weight:600;"></div>' +
                    '</div>' +
                    '<div class="tpl-bar">' +
                      '<span style="font-size:12px;color:#8a7a5c;">模板：</span>' +
                      '<div class="tpl-tabs" id="tplTabs"></div>' +
                    '</div>' +
                    // 第二行：模板管理按钮（分拆两行，更清晰）
                    '<div class="tpl-bar" style="flex-wrap:wrap;gap:6px;margin-top:6px;">' +
                      '<button class="tpl-mini-btn tpl-add" id="tplNewBtn" title="新增空白自定义模板">➕ 新增</button>' +
                      '<button class="tpl-mini-btn" id="tplEditBtn" title="高级编辑：修改名称/文本/另存为/删除">✏️ 高级编辑</button>' +
                      '<button class="tpl-mini-btn" id="tplQuickSaveBtn" style="background:#4caf50;color:#fff;border-color:#43a047;font-weight:600;" title="保存当前模板内容；默认模板会另存为新模板">💾 另存为新模板</button>' +
                      '<button class="tpl-mini-btn" id="tplQuickDelBtn" style="background:#e53935;color:#fff;border-color:#d32f2f;font-weight:600;" title="仅自定义模板可删除">🗑️ 删除</button>' +
                      '<button class="tpl-mini-btn" id="tplExportBtn" title="导出当前模板为 JSON 文件">📥 导出</button>' +
                      '<button class="tpl-mini-btn" id="tplImportBtn" title="从 JSON 文件导入模板">📤 导入</button>' +
                    '</div>' +
                    // 保存/删除提示条
                    '<div style="font-size:11.5px;color:#7b6d53;margin:7px 0 9px;padding:6px 10px;background:#fbf4dd;border-radius:6px;border:1px dashed #e0cd9a;line-height:1.6;">' +
                    '💡 用法：① 直接在下方文本框改内容 → 点 <b>💾 保存模板</b>（默认模板自动另存为新模板）。② 切换到自定义模板 → 点 <b>🗑️ 删除</b> 即可删除。' +
                    '</div>' +
                    '<div class="tpl-editor" id="tplEditor">' +
                      '<div class="tpl-editor__head"><div class="tpl-editor__title" id="tplEditorTitle">编辑模板</div></div>' +
                      '<div class="tpl-editor__name-row"><label>名称：</label><input id="tplName" type="text" maxlength="20" placeholder="模板名称（最多20字）" /></div>' +
                      '<textarea id="tplText" style="min-height:140px;resize:vertical;"></textarea>' +
                      '<div class="tpl-editor__vars">说明：默认模板（古法/江氏/道传）每次按当前排盘自动刷新内容，可「另存为新模板」固化为自定义模板；自定义模板可自由编辑/删除。导出可将当前模板保存为 JSON，导入可加载 JSON 模板。</div>' +
                      '<div class="tpl-editor__foot">' +
                        '<div class="tpl-editor__actions">' +
                          '<button class="tpl-mini-btn" id="tplSaveBtn">💾 保存</button>' +
                          '<button class="tpl-mini-btn" id="tplDelBtn" style="background:#fdecea;border-color:#f5c6cb;color:#c0392b;">🗑️ 删除</button>' +
                        '</div>' +
                        '<button class="tpl-mini-btn" id="tplCancelBtn">取消</button>' +
                      '</div>' +
                    '</div>' +
                    '<textarea id="aiPromptText" style="flex:1;width:100%;min-height:260px;max-height:55vh;box-sizing:border-box;border:1px solid #e0d4b8;border-radius:8px;padding:12px;font-size:13px;line-height:1.7;color:#3d3226;background:#fffdf6;resize:vertical;font-family:inherit;outline:none;"></textarea>' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:13px;gap:8px;">' +
                      '<div style="font-size:11px;color:#9a8d7a;">提示：直接在上方文本框改完要记得「💾 保存模板」，否则下次打开又回到默认模板。</div>' +
                      '<div style="display:flex;gap:8px;">' +
                        '<button id="aiPromptCopy" style="padding:8px 20px;border:none;border-radius:8px;background:#c8a84e;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">📋 复制</button>' +
                        '<button id="aiPromptClose" style="padding:8px 16px;border:none;border-radius:8px;background:#e8dcc4;color:#6b5d44;font-size:13px;font-weight:600;cursor:pointer;">✖️ 关闭</button>' +
                      '</div>' +
                    '</div>';

                overlay.appendChild(box);
                document.body.appendChild(overlay);
                currentAiBox = box;

                const textEl = box.querySelector('#aiPromptText');
                textEl.value = prompt;

                function closeAi() { overlay.remove(); currentAiBox = null; }
                overlay.addEventListener('click', function (e) { if (e.target === overlay) closeAi(); });
                box.querySelector('#aiPromptClose').addEventListener('click', closeAi);

                renderTplTabs();
                updateAiModeLabel();
                syncTplQuickBtns();
                box.querySelector('#tplNewBtn').addEventListener('click', createNewTemplate);
                box.querySelector('#tplEditBtn').addEventListener('click', openTplEditor);
                box.querySelector('#tplQuickSaveBtn').addEventListener('click', quickSaveCurrentTpl);
                box.querySelector('#tplQuickDelBtn').addEventListener('click', quickDeleteCurrentTpl);
                box.querySelector('#tplExportBtn').addEventListener('click', exportCurrentTpl);
                box.querySelector('#tplImportBtn').addEventListener('click', function () { if (templateFileInput) templateFileInput.click(); });
                box.querySelector('#tplSaveBtn').addEventListener('click', saveTplFromEditor);
                box.querySelector('#tplDelBtn').addEventListener('click', deleteCurrentTpl);
                box.querySelector('#tplCancelBtn').addEventListener('click', closeTplEditor);

                box.querySelector('#aiPromptCopy').addEventListener('click', function () {
                    const text = textEl.value;
                    const btn = this;
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).then(function () {
                            const orig = btn.textContent;
                            btn.textContent = '✅ 已复制';
                            showToast('已复制到剪贴板，请粘贴到AI工具中', '📋');
                            setTimeout(function () { btn.textContent = orig; }, 1500);
                        }).catch(function () { fallbackCopy(text); });
                    } else {
                        fallbackCopy(text);
                    }
                });
            }
