// =========================================================
// 渲染器：排盘结果渲染（古法/江氏）+ 历史列表 + 知识面板 + 历史面板切换
// （从 V2.1.2 app-all.js 物理切分，保持 1:1 逻辑不变；去 IIFE 后共享 Script scope）
// =========================================================
'use strict';

            // ===== 渲染古法 =====
            function renderGuFa(answers, finalShen, timestamp) {
                const shenItems = answers.map((item, index) => {
                    const s = item.shen;
                    let html = `<span class="shen-item ${s.cls}">${s.name}</span>`;
                    if (index < answers.length - 1) html += `<span class="arrow">→</span>`;
                    return html;
                }).join('');
                threeInline.innerHTML = `<span class="label">三宫：</span>${shenItems}`;
                finalName.textContent = finalShen.name;
                finalName.className = 'name ' + finalShen.cls;
                finalMeaning.textContent = finalShen.meaning;
                attrLine.textContent = finalShen.detail;
                resultTimestamp.textContent = timestamp ? '🕐 ' + formatTime(timestamp) : '';
            }

            // ===== 渲染江氏排盘 =====
            function renderJiang(answers, finalShen, timestamp, question) {
                const now = new Date(timestamp || Date.now());
                const shiChenDz = getShiChen(now.getHours());
                const lunar = solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
                const lunarChinese = lunar.lunarYear ? toChineseLunar(lunar.lunarYear, lunar.lunarMonth, lunar.lunarDay, lunar.isLeap) : '--';
                const lunarPlain = lunar.lunarYear ? `${lunar.lunarYear}年${lunar.lunarMonth}月${lunar.lunarDay}日` : '--';

                const jiangData = generateJiangPai(answers, shiChenDz);
                const renGongName = answers[2].shen.name;
                const tianGongName = answers[0].shen.name;
                const diGongName = answers[1].shen.name;

                jiangInfo.innerHTML = `
                    <div class="item"><span class="label">起卦时间</span><span class="value">${formatTime(timestamp)}</span></div>
                    <div class="item"><span class="label">当前时辰</span><span class="value">${shiChenDz}时</span></div>
                    <div class="item"><span class="label">农历</span><span class="value lunar-clickable" style="cursor:pointer;border-bottom:1px dashed #c8a84e;" title="${lunarPlain}&#10;点击查看排盘逻辑">${lunarChinese}</span></div>
                    <div class="item"><span class="label">落点</span><span class="value"><span class="tag ${finalShen.cls}">${finalShen.name}</span> ${finalShen.meaning}</span></div>
                    <div class="item"><span class="label">三宫</span><span class="value">
                        <span class="tag tag-tian">${tianGongName}</span> → 
                        <span class="tag tag-di">${diGongName}</span> → 
                        <span class="tag tag-ren">${renGongName}</span>
                    </span></div>
                    ${question ? `<div class="item" style="grid-column:1/-1;"><span class="label">问念</span><span class="value">${question}</span></div>` : ''}
                `;

                const lunarEl = jiangInfo.querySelector('.lunar-clickable');
                if (lunarEl) {
                    lunarEl.addEventListener('click', function(e) {
                        e.stopPropagation();
                        showPaiPanDetail(answers, shiChenDz, jiangData);
                    });
                }

                let tbody = '';
                jiangData.forEach(item => {
                    const isRen = item.gong === renGongName;
                    const isTian = item.gong === tianGongName;
                    const isDi = item.gong === diGongName;

                    let rowCls = `row-${SHEN_CLS[item.gong]}`;
                    let highlightCls = '';
                    if (isTian) highlightCls += ' highlight-tian';
                    if (isDi) highlightCls += ' highlight-di';
                    if (isRen) highlightCls += ' highlight-ren';

                    let marks = [];
                    if (isTian) marks.push({ type: 'tian', label: '天' });
                    if (isDi) marks.push({ type: 'di', label: '地' });
                    if (isRen) marks.push({ type: 'ren', label: '人' });
                    // 同一宫位同时落天/地/人时，合并为单个紧凑标签，避免多标签错位（参照 V3.0）
                    let markStr = '';
                    if (marks.length === 3) {
                        markStr = ' <span class="tag-ren tag-merged">天地人</span>';
                    } else if (marks.length === 2) {
                        const cls = marks.some(m => m.type === 'ren') ? 'tag-ren' : 'tag-di';
                        markStr = ` <span class="${cls} tag-merged">${marks.map(m => m.label).join('')}</span>`;
                    } else if (marks.length === 1) {
                        const cls = 'tag-' + marks[0].type;
                        markStr = ` <span class="${cls}">${marks[0].label}</span>`;
                    }

                    const gongTag = `<span class="tag ${SHEN_CLS[item.gong]}">${item.gong}</span>`;
                    const qinCls = item.qin ? `tag-qin ${SHEN_CLS[item.gong]}` : '';
                    const qinTag = item.qin ? `<span class="${qinCls}">${item.qin}</span>` : '—';
                    const shenCls = item.shen ? `tag-shen ${SHEN_CLS[item.gong]}` : '';
                    const shenTag = item.shen ? `<span class="${shenCls}">${item.shen}</span>` : '—';
                    const xingCls = item.xing ? `tag-xing ${SHEN_CLS[item.gong]}` : '';
                    const xingTag = item.xing ? `<span class="${xingCls}">${item.xing}</span>` : '—';

                    tbody += `
                        <tr class="${rowCls}${highlightCls}">
                            <td>${gongTag}${markStr}</td>
                            <td>${item.dz}</td>
                            <td>${qinTag}</td>
                            <td>${shenTag}</td>
                            <td>${xingTag}</td>
                        </tr>
                    `;
                });
                jiangTableBody.innerHTML = tbody;

                const jieText = generateJieGua(jiangData, renGongName);
                jieGuaContent.textContent = jieText;
            }

            // ===== 渲染道传排盘 =====
            function renderDao(answers, finalShen, timestamp, question) {
                var now = new Date(timestamp || Date.now());
                var shiChenDz = getShiChen(now.getHours());
                var lunar = solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
                var lunarChinese = lunar.lunarYear ? toChineseLunar(lunar.lunarYear, lunar.lunarMonth, lunar.lunarDay, lunar.isLeap) : '--';
                var lunarPlain = lunar.lunarYear ? `${lunar.lunarYear}年${lunar.lunarMonth}月${lunar.lunarDay}日` : '--';

                var daoRows = generateDaoPai(answers, shiChenDz);
                var renGongName = answers[2].shen.name;
                var tianGongName = answers[0].shen.name;
                var diGongName = answers[1].shen.name;

                daoInfo.innerHTML = `
                    <div class="item"><span class="label">起卦时间</span><span class="value">${formatTime(timestamp)}</span></div>
                    <div class="item"><span class="label">当前时辰</span><span class="value">${shiChenDz}时</span></div>
                    <div class="item"><span class="label">农历</span><span class="value lunar-clickable" style="cursor:pointer;border-bottom:1px dashed #7b1fa2;" title="${lunarPlain}&#10;点击查看道传排盘逻辑">${lunarChinese}</span></div>
                    <div class="item"><span class="label">落点</span><span class="value"><span class="tag ${finalShen.cls}">${finalShen.name}</span> ${finalShen.meaning}</span></div>
                    <div class="item"><span class="label">三宫</span><span class="value">
                        <span class="tag tag-tian">${tianGongName}</span> → 
                        <span class="tag tag-di">${diGongName}</span> → 
                        <span class="tag tag-ren">${renGongName}</span>
                    </span></div>
                    ${question ? `<div class="item" style="grid-column:1/-1;"><span class="label">问念</span><span class="value">${question}</span></div>` : ''}
                `;

                // 绑定农历点击事件 → 显示道传排盘逻辑弹窗
                var daoLunarEl = daoInfo.querySelector('.lunar-clickable');
                if (daoLunarEl) {
                    daoLunarEl.addEventListener('click', function(e) {
                        e.stopPropagation();
                        showDaoPaiPanDetail(answers, shiChenDz, daoRows);
                    });
                }

                var tbody = '';
                daoRows.forEach(function(r) {
                    var isRen = r.position === '人宫';
                    var isTian = r.position === '天宫';
                    var isDi = r.position === '地宫';
                    var rowCls = 'row-' + SHEN_CLS[r.gong];
                    var highlightCls = '';
                    if (isTian) highlightCls += ' highlight-tian';
                    if (isDi) highlightCls += ' highlight-di';
                    if (isRen) highlightCls += ' highlight-ren';
                    var marks = [];
                    if (isTian) marks.push('<span class="tag-tian">🏷️天</span>');
                    if (isDi) marks.push('<span class="tag-di">🏷️地</span>');
                    if (isRen) marks.push('<span class="tag-ren">🏷️人</span>');
                    var markStr = marks.length ? ' ' + marks.join(' ') : '';
                    var gongTag = '<span class="tag ' + SHEN_CLS[r.gong] + '">' + r.gong + '</span>';
                    var qinTag = r.qin ? '<span class="tag-qin ' + SHEN_CLS[r.gong] + '">' + r.qin + '</span>' : '—';
                    var siShenTag = r.siShen ? '<span class="tag-shen ' + SHEN_CLS[r.gong] + '">' + r.siShen + '</span>' : '—';
                    var huoShenTag = r.huoShen ? '<span class="tag-xing ' + SHEN_CLS[r.gong] + '">' + r.huoShen + '</span>' : '—';
                    tbody += `
                        <tr class="${rowCls}${highlightCls}">
                            <td>${r.position}</td>
                            <td>${gongTag}${markStr}</td>
                            <td>${r.dz}</td>
                            <td>${qinTag}</td>
                            <td>${siShenTag}</td>
                            <td>${huoShenTag}</td>
                        </tr>
                    `;
                });
                daoTableBody.innerHTML = tbody;

                var jieText = generateDaoJieGuaText(daoRows, shiChenDz);
                daoJieGuaContent.textContent = jieText;
            }
            // ===== 显示结果 =====
            function displayResult() {
                if (!currentResult) {
                    resultSection.classList.remove('visible');
                    emptyHint.style.display = 'block';
                    return;
                }
                const { answers, finalShen, timestamp, interpretation, question } = currentResult;
                resultSection.classList.add('visible');
                emptyHint.style.display = 'none';

                if (interpretation) {
                    interpretationContent.textContent = interpretation;
                    interpretationArea.classList.add('visible');
                } else {
                    interpretationArea.classList.remove('visible');
                }

                // 依据 currentDivinationMode 切换显示（gufa / jiang / daochuan）
                var mode = currentDivinationMode || 'gufa';
                if (mode === 'gufa') {
                    guFaDisplay.style.display = 'block';
                    jiangDisplay.style.display = '';
                    jiangDisplay.classList.remove('visible');
                    daoDisplay.style.display = 'none';
                    daoDisplay.classList.remove('visible');
                    renderGuFa(answers, finalShen, timestamp);
                } else if (mode === 'jiang') {
                    guFaDisplay.style.display = 'none';
                    jiangDisplay.style.display = '';
                    jiangDisplay.classList.add('visible');
                    daoDisplay.style.display = 'none';
                    daoDisplay.classList.remove('visible');
                    renderJiang(answers, finalShen, timestamp, question);
                } else if (mode === 'daochuan') {
                    guFaDisplay.style.display = 'none';
                    jiangDisplay.style.display = '';
                    jiangDisplay.classList.remove('visible');
                    daoDisplay.style.display = '';
                    daoDisplay.classList.add('visible');
                    renderDao(answers, finalShen, timestamp, question);
                }
            }

            // ===== 保存状态 =====
            function saveAndDisplay(answers, finalShen, timestamp, interpretation, question, method, numbers) {
                currentResult = { answers, finalShen, timestamp, interpretation, question, method: method || 'manual', numbers: numbers || null };
                displayResult();
            }

            function clearResult() {
                currentResult = null;
                resultSection.classList.remove('visible');
                emptyHint.style.display = 'block';
                guFaDisplay.style.display = 'block';
                jiangDisplay.classList.remove('visible');
                threeInline.innerHTML =
                    `<span class="label">三宫：</span><span class="shen-item da-an">大安</span><span class="arrow">→</span><span class="shen-item liu-lian">留连</span><span class="arrow">→</span><span class="shen-item su-xi">速喜</span>`;
                finalName.textContent = '大安';
                finalName.className = 'name da-an';
                finalMeaning.textContent = '平安吉祥，诸事顺利';
                attrLine.textContent = '';
                resultTimestamp.textContent = '';
                interpretationArea.classList.remove('visible');
                timeHint.classList.remove('show');
            }

            function getInputValues() {
                const v1 = parseInt(num1.value);
                const v2 = parseInt(num2.value);
                const v3 = parseInt(num3.value);
                if (isNaN(v1) || isNaN(v2) || isNaN(v3)) return null;
                return [v1, v2, v3];
            }



            function updateBadge(count) {
                historyBadge.textContent = count;
                historyBadge.style.display = count > 0 ? 'inline-block' : 'none';
            }

            function renderHistoryList(records) {
                if (!records) records = loadHistoryRecords();
                if (records.length === 0) {
                    historyList.innerHTML = `<div class="history-empty">暂无记录，开始占卜吧</div>`;
                    return;
                }
                let html = '';
                records.forEach(rec => {
                    const fs = rec.finalShen;
                    const nums = rec.numbers.join('、');
                    const ansNames = rec.answers.map(a => a.shen.name).join(' · ');
                    const timeStr = formatTime(rec.timestamp);
                    const question = rec.question || '';
                    const method = rec.method || 'manual';
                    let methodLabel = '✏️ 手动输入',
                        methodClass = 'method-manual';
                    if (method === 'time') { methodLabel = '🕒 时间起卦';
                        methodClass = 'method-time'; } else if (method === 'random') { methodLabel = '🎲 随机起卦';
                        methodClass = 'method-random'; }
                    // P1.3：历史记录模式徽章（古法/江氏/道传）—— 背景色已区分类型，文字不再重复前缀
                    const mode = rec.mode || 'gufa';
                    let modeLabel = '古法', modeCls = 'mode-gufa';
                    if (mode === 'jiang') { modeLabel = '江氏'; modeCls = 'mode-jiang'; }
                    else if (mode === 'daochuan') { modeLabel = '道传'; modeCls = 'mode-dao'; }
                    const fb = rec.feedback;
                    const fbTitle = fb ? ('已有反馈：' + fb.rating + '星' + (fb.content ? ' · ' + fb.content.slice(0, 40) : '')) : '';
                    const fbBadge = fb ? `<span class="fb-badge" title="${fbTitle.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">${'★'.repeat(fb.rating)}</span>` : '';
                    html += `
                        <div class="history-item" data-id="${rec.id}">
                            <div class="info" data-id="${rec.id}">
                                ${question ? `<div class="question-line">📝 ${question}</div>` : ''}
                                <div class="answers-line">${ansNames}${fbBadge}</div>
                                <div class="meta-line">
                                    <span class="h-nums">${nums}</span>
                                    <span class="h-method ${methodClass}">${methodLabel}</span>
                                    <span class="h-mode ${modeCls}">${modeLabel}</span>
                                </div>
                                <div class="time">${timeStr}</div>
                            </div>
                            <div class="actions">
                                <button class="fb-btn" data-id="${rec.id}" title="解卦反馈">💬</button>
                                <button class="edit-btn" data-id="${rec.id}" title="编辑问念">✎</button>
                                <button class="del-btn" data-id="${rec.id}" title="删除">✕</button>
                            </div>
                        </div>
                    `;
                });
                historyList.innerHTML = html;
                document.querySelectorAll('.history-item .info').forEach(el => {
                    el.addEventListener('click', function(e) {
                        if (e.target.closest('.actions')) return;
                        const id = this.dataset.id;
                        loadHistoryRecordById(id);
                    });
                });
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const id = this.dataset.id;
                        const rec = loadHistoryRecords().find(r => r.id === id);
                        if (!rec) return;
                        const newQ = prompt('编辑问念（最多50字）：', rec.question || '');
                        if (newQ !== null) editHistoryQuestion(id, newQ.trim());
                    });
                });
                document.querySelectorAll('.del-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const id = this.dataset.id;
                        deleteHistoryRecord(id);
                    });
                });
                document.querySelectorAll('.fb-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openFeedbackPopup(this.dataset.id);
                    });
                });
            }


            function toggleHistoryPanel() {
                const isOpen = historyPanel.classList.toggle('open');
                if (isOpen) renderHistoryList(loadHistoryRecords());
            }



            // ===== 知识面板渲染 =====
            function renderKnowledge() {
                let shenHtml = '';
                SHEN_NAMES.forEach(name => {
                    const cls = SHEN_CLS[name];
                    shenHtml += `
                        <div class="ref-item ${cls}">
                            <div class="ref-name">${name}</div>
                            <div class="ref-desc">${SHEN_MEANING[name]} · ${SHEN_DETAIL[name]}</div>
                        </div>
                    `;
                });
                shenRefGrid.innerHTML = shenHtml;

                let qinHtml = '';
                QIN_KNOWLEDGE.forEach(item => {
                    qinHtml += `
                        <div class="ref-item">
                            <div class="ref-name">${item.name}</div>
                            <div class="ref-desc">${item.desc}</div>
                        </div>
                    `;
                });
                qinRefGrid.innerHTML = qinHtml;

                let shenHtml2 = '';
                SHEN_KNOWLEDGE.forEach(item => {
                    shenHtml2 += `
                        <div class="ref-item">
                            <div class="ref-name">${item.name}</div>
                            <div class="ref-desc">${item.desc}</div>
                        </div>
                    `;
                });
                shenRefGrid2.innerHTML = shenHtml2;

                let xingHtml = '';
                XING_KNOWLEDGE.forEach(item => {
                    xingHtml += `
                        <div class="ref-item">
                            <div class="ref-name">${item.name}</div>
                            <div class="ref-desc">${item.desc}</div>
                        </div>
                    `;
                });
                xingRefGrid.innerHTML = xingHtml;
            }
