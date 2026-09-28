// =========================================================
// 解卦反馈：星级评分弹窗 + 保存/清除反馈
// （从 V2.1.2 app-all.js 物理切分，保持 1:1 逻辑不变；去 IIFE 后共享 Script scope）
// =========================================================
'use strict';

            function closeFeedbackPopup() {
                if (currentFbBox) { currentFbBox.remove(); currentFbBox = null; }
                currentFbId = null;
                currentFbRating = 0;
            }
            function setFbRating(v) {
                currentFbRating = v;
                if (!currentFbBox) return;
                currentFbBox.querySelectorAll('#fbStars .star').forEach(function (s) {
                    s.classList.toggle('active', parseInt(s.dataset.v, 10) <= v);
                });
                const label = currentFbBox.querySelector('#fbRatingLabel');
                if (label) label.textContent = v > 0 ? (v + ' 星 · ' + (FB_RATING_LABELS[v] || '')) : '请选择评分';
            }
            function openFeedbackPopup(id) {
                const records = loadHistoryRecords();
                const rec = records.find(function (r) { return r.id === id; });
                if (!rec) { showToast('记录不存在', '⚠️'); return; }
                if (currentFbBox) { currentFbBox.remove(); currentFbBox = null; }
                currentFbId = id;
                currentFbRating = 0;
                const ans = rec.answers.map(function (a) { return a.shen.name; }).join(' · ');
                const fb = rec.feedback || {};
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;justify-content:center;';
                overlay.innerHTML =
                    '<div class="fb-dialog" style="background:#fffef9;border-radius:13px;padding:21px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:460px;width:90%;max-height:85vh;overflow:auto;font-family:system-ui,\'Microsoft YaHei\',sans-serif;">' +
                      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;">' +
                        '<div style="font-size:16px;font-weight:600;color:#2c2416;">💬 解卦反馈</div>' +
                        '<button id="fbClose" style="border:none;background:#e8dcc4;color:#6b5d44;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:14px;">✕</button>' +
                      '</div>' +
                      '<div class="fb-rec-info">' +
                        '<div class="fb-rec-row"><span>时间</span><span>' + tplEscape(formatTime(rec.timestamp)) + '</span></div>' +
                        '<div class="fb-rec-row"><span>三宫</span><span>' + tplEscape(ans) + '</span></div>' +
                        '<div class="fb-rec-row"><span>落点</span><span>' + tplEscape(rec.finalShen ? rec.finalShen.name : '—') + '</span></div>' +
                        (rec.question ? '<div class="fb-rec-row"><span>问念</span><span>' + tplEscape(rec.question) + '</span></div>' : '') +
                      '</div>' +
                      '<label class="fb-label">准确度评分</label>' +
                      '<div class="fb-stars" id="fbStars">' +
                        [1, 2, 3, 4, 5].map(function (v) { return '<span class="star" data-v="' + v + '">★</span>'; }).join('') +
                      '</div>' +
                      '<div class="fb-rating-label" id="fbRatingLabel">请选择评分</div>' +
                      '<label class="fb-label" for="fbContent">反馈内容（最多 500 字）</label>' +
                      '<textarea class="fb-textarea" id="fbContent" maxlength="500" placeholder="记录这次解卦的准确度、应验情况、补充说明等，便于后续复盘整理…"></textarea>' +
                      '<div class="fb-counter"><span id="fbCount">0</span>/500</div>' +
                      '<div style="display:flex;justify-content:space-between;margin-top:13px;gap:8px;">' +
                        '<button id="fbClear" style="padding:6px 14px;border:1px solid #e0d4b8;border-radius:8px;background:#fffdf6;color:#6b5d44;font-size:12px;cursor:pointer;">清除反馈</button>' +
                        '<button id="fbSave" style="padding:6px 16px;border:none;border-radius:8px;background:#c8a84e;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">💾 保存反馈</button>' +
                      '</div>' +
                    '</div>';
                document.body.appendChild(overlay);
                currentFbBox = overlay;
                overlay.querySelector('#fbClose').addEventListener('click', closeFeedbackPopup);
                overlay.addEventListener('click', function (e) { if (e.target === overlay) closeFeedbackPopup(); });
                const stars = overlay.querySelectorAll('#fbStars .star');
                stars.forEach(function (s) {
                    s.addEventListener('click', function () { setFbRating(parseInt(s.dataset.v, 10)); });
                    s.addEventListener('mouseenter', function () {
                        const v = parseInt(s.dataset.v, 10);
                        stars.forEach(function (x) { x.classList.toggle('active', parseInt(x.dataset.v, 10) <= v); });
                    });
                });
                overlay.querySelector('#fbStars').addEventListener('mouseleave', function () {
                    stars.forEach(function (x) { x.classList.toggle('active', parseInt(x.dataset.v, 10) <= currentFbRating); });
                });
                const contentEl = overlay.querySelector('#fbContent');
                contentEl.addEventListener('input', function () {
                    overlay.querySelector('#fbCount').textContent = String(contentEl.value.length);
                });
                overlay.querySelector('#fbSave').addEventListener('click', saveFeedback);
                overlay.querySelector('#fbClear').addEventListener('click', clearFeedback);
                setFbRating(fb.rating || 0);
                if (fb.content) {
                    contentEl.value = fb.content;
                    overlay.querySelector('#fbCount').textContent = String(fb.content.length);
                }
            }
            function saveFeedback() {
                if (!currentFbId) { showToast('未选择记录', '⚠️'); return; }
                if (currentFbRating < 1) { showToast('请选择准确度评分', '⚠️'); return; }
                const content = currentFbBox.querySelector('#fbContent').value.trim().slice(0, 500);
                const ok = updateHistoryRecord(currentFbId, { feedback: { rating: currentFbRating, content: content, time: Date.now() } });
                if (ok) {
                    closeFeedbackPopup();
                    showToast('反馈已保存', '✅');
                } else {
                    showToast('保存失败：记录不存在', '⚠️');
                }
            }
            function clearFeedback() {
                if (!currentFbId) return;
                if (!confirm('确定清除该记录的反馈？')) return;
                updateHistoryRecord(currentFbId, { feedback: null });
                closeFeedbackPopup();
                showToast('已清除反馈', '🗑️');
            }
