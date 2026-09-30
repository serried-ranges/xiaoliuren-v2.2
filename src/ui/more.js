// =========================================================
// 更多菜单：鸣谢名单 / 联系作者 / 赞助支持
// =========================================================
'use strict';

// ===== 模块级 DOM 引用（模块内部自己获取，不依赖 state.js 内部局部变量）=====
var __moreBtn = null;
var __moreMenu = null;
var __moreModalMask = null;
var __moreModalClose = null;
var __moreModalBody = null;
var __moreModalTitle = null;

function __getMoreDOM() {
    if (!__moreBtn)       __moreBtn       = document.getElementById('moreBtn');
    if (!__moreMenu)      __moreMenu      = document.getElementById('moreMenu');
    if (!__moreModalMask) __moreModalMask = document.getElementById('moreModalMask');
    if (!__moreModalClose)__moreModalClose= document.getElementById('moreModalClose');
    if (!__moreModalBody) __moreModalBody = document.getElementById('moreModalBody');
    if (!__moreModalTitle)__moreModalTitle= document.getElementById('moreModalTitle');
}

// ===== 鸣谢名单（按用户指定：徐峥 / 博士 / 佐治亚 / 高林 / 小熊 / 萨摩耶 / 明镜）=====
var ACKNOWLEDGE_TEXT = [
    '<div class="more-section">',
    '  <div class="acknowledge-header">',
    '    <div class="acknowledge-title">感谢首批试用者的反馈与宝贵建议</div>',
    '  </div>',
    '  <ul class="acknowledge-grid">',
    '    <li class="acknowledge-card">',
    '      <div class="acknowledge-name">小熊</div>',
    '    </li>',
    '    <li class="acknowledge-card">',
    '      <div class="acknowledge-name">凉生</div>',
    '    </li>',
    '    <li class="acknowledge-card">',
    '      <div class="acknowledge-name">徐峥</div>',
    '    </li>',
    '    <li class="acknowledge-card">',
    '      <div class="acknowledge-name">博士</div>',
    '    </li>',
    '    <li class="acknowledge-card">',
    '      <div class="acknowledge-name">佐治亚</div>',
    '    </li>',
    '    <li class="acknowledge-card">',
    '      <div class="acknowledge-name">高林</div>',
    '    </li>',
    '    <li class="acknowledge-card">',
    '      <div class="acknowledge-name">萨摩耶</div>',
    '    </li>',
    '    <li class="acknowledge-card">',
    '      <div class="acknowledge-name">明镜</div>',
    '    </li>',
    '    <li class="acknowledge-card">',
    '      <div class="acknowledge-name">电电电</div>',
    '    </li>',
    '  </ul>',
    '</div>'
].join('');

// ===== 联系作者（点击即复制）=====
var CONTACT_TEXT = [
    '<div class="more-section">',
    '  <div class="more-contact">',
    '    <div class="more-contact__row">',
    '      <span class="more-contact__label">📧 邮箱</span>',
    '      <span class="more-contact__value more-contact__copy" data-copy="serried_ranges@outlook.com" title="点击即可复制邮箱">serried_ranges@outlook.com</span>',
    '    </div>',
    '    <div class="more-contact__hint">📋 <b>点击邮箱即可复制</b>，来信请备注「小六壬」</div>',
    '  </div>',
    '</div>'
].join('');

// ===== 赞助支持（按用户指定文案）=====
var DONATE_TEXT = [
    '<div class="more-section">',
    '  <div class="more-donate">',
    '    <div class="more-donate__msg">',
    '      <p>你的善念，</p>',
    '      <p>把工具用于造福更多的人，</p>',
    '      <p><b>就是最好的赞助。</b></p>',
    '      <p style="margin-top:8px;">欢迎在使用过程中，</p>',
    '      <p>提出更好的建议和意见。</p>',
    '    </div>',
    '    <div class="more-donate__qr-placeholder">',
    '      <div class="qr-placeholder-box">',
    '        <div class="qr-placeholder-icon">🙏</div>',
    '        <div class="qr-placeholder-label">就当这是二维码</div>',
    '      </div>',
    '    </div>',
    '    <div class="more-donate__footer">善念常在，利他即利己。</div>',
    '  </div>',
    '</div>'
].join('');

// ===== 菜单交互 =====
var _moreMenuOpen = false;
function toggleMoreMenu(force) {
    __getMoreDOM();
    if (!__moreBtn || !__moreMenu) return;
    if (typeof force === 'boolean') { _moreMenuOpen = force; }
    else { _moreMenuOpen = !_moreMenuOpen; }
    __moreMenu.classList.toggle('open', _moreMenuOpen);
}
document.addEventListener('click', function(e) {
    __getMoreDOM();
    if (!__moreMenu || !__moreBtn) return;
    if (__moreMenu.contains(e.target) || __moreBtn.contains(e.target)) return;
    _moreMenuOpen = false;
    __moreMenu.classList.remove('open');
});

// ===== 弹窗交互 =====
function openMoreModal(title, htmlContent) {
    __getMoreDOM();
    if (!__moreModalMask || !__moreModalBody || !__moreModalTitle) {
        console.warn('[more] 弹窗 DOM 缺失，无法打开：', { mask: !!__moreModalMask, body: !!__moreModalBody, title: !!__moreModalTitle });
        showToast('弹窗暂不可用', '⚠️');
        return;
    }
    __moreModalTitle.textContent = title || '更多';
    // 每个弹窗底部追加雅致风格的【关闭】按钮（象牙色背景 + 金色描边，符合页面调性）
    var footerBtn = '<div style="margin-top:18px;text-align:center;position:sticky;bottom:0;background:'
        + 'linear-gradient(to top, #fffef9 70%, rgba(255,254,249,0));padding-top:12px;">'
        + '<button id="__moreFooterClose" style="padding:8px 48px;border:1px solid #d4af37;border-radius:9px;'
        + 'background:#fffdf6;color:#8a6d1f;font-size:13px;font-weight:600;cursor:pointer;'
        + 'letter-spacing:1px;box-shadow:0 2px 6px rgba(212,175,55,0.12);transition:all .2s;" '
        + 'onmouseover="this.style.background=\'#f9f1d9\';" '
        + 'onmouseout="this.style.background=\'#fffdf6\';">关闭</button></div>';
    __moreModalBody.innerHTML = (htmlContent || '') + footerBtn;
    __moreModalMask.classList.add('show');
    __moreModalMask.style.display = 'flex';   // 兜底：强制显示，防止CSS class不生效
    console.log('[more] 弹窗已打开：', title, 'mask.display=', __moreModalMask.style.display, 'hasClass.show=', __moreModalMask.classList.contains('show'));

    // ---------- 每次打开都强绑 3 种关闭方式（全都是安全幂等）----------
    // 1. 右上角 × 按钮：直接赋值 onclick 兜底（不依赖 addEventListener）
    if (__moreModalClose) {
        __moreModalClose.onclick = function() {
            console.log('[more] 点击右上角 × 关闭');
            closeMoreModal();
        };
    }
    // 2. 底部显眼按钮
    var footer = document.getElementById('__moreFooterClose');
    if (footer) {
        footer.onclick = function() {
            console.log('[more] 点击底部按钮关闭');
            closeMoreModal();
        };
    }
    // 3. 点击遮罩空白区（只点 mask 本身，不点内容区）
    __moreModalMask.onclick = function(e) {
        if (e.target === __moreModalMask) {
            console.log('[more] 点击遮罩空白区关闭');
            closeMoreModal();
        }
    };
    // 4. ESC 键关闭（只绑定一次，用 flag 防重复）
    if (!window.__more_esc_bound) {
        window.__more_esc_bound = true;
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (__moreModalMask && __moreModalMask.style.display === 'flex') {
                    console.log('[more] ESC 键关闭');
                    closeMoreModal();
                }
            }
        });
    }

    // 绑定联系作者点击复制（邮箱）
    var copyEls = __moreModalBody.querySelectorAll('.more-contact__copy');
    copyEls.forEach(function(el) {
        el.addEventListener('click', function() {
            var text = el.getAttribute('data-copy') || el.textContent;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function() {
                        showToast('已复制：' + text, 'success');
                    }).catch(function() {
                        fallbackCopy(text, '已复制：' + text);
                    });
                } else {
                    fallbackCopy(text, '已复制：' + text);
                }
            } catch (e) {
                fallbackCopy(text, '已复制：' + text);
            }
        });
        el.style.cursor = 'pointer';
    });
}

function closeMoreModal() {
    __getMoreDOM();
    if (!__moreModalMask) {
        console.warn('[more] closeMoreModal 无 mask DOM');
        return;
    }
    __moreModalMask.classList.remove('show');
    __moreModalMask.style.display = 'none';  // 兜底：强制隐藏，防止CSS class移除不生效
    console.log('[more] 弹窗已关闭：display=', __moreModalMask.style.display, 'hasClass.show=', __moreModalMask.classList.contains('show'));
}

// ===== 初始化绑定 =====
function bindMoreUI() {
    __getMoreDOM();
    try {
        if (__moreBtn) {
            __moreBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMoreMenu();
            });
        } else {
            console.warn('[more] #moreBtn 元素未找到');
        }
    } catch (e) { console.warn('[more] 更多按钮绑定失败：', e); }

    try {
        var menuAck = document.getElementById('menuAcknowledge');
        if (menuAck) {
            menuAck.addEventListener('click', function() {
                toggleMoreMenu(false);
                openMoreModal('🙏 鸣谢名单', ACKNOWLEDGE_TEXT);
            });
        } else {
            console.warn('[more] #menuAcknowledge 未找到');
        }
        var menuCon = document.getElementById('menuContact');
        if (menuCon) {
            menuCon.addEventListener('click', function() {
                toggleMoreMenu(false);
                openMoreModal('📮 联系作者', CONTACT_TEXT);
            });
        } else {
            console.warn('[more] #menuContact 未找到');
        }
        var menuDon = document.getElementById('menuDonate');
        if (menuDon) {
            menuDon.addEventListener('click', function() {
                toggleMoreMenu(false);
                openMoreModal('💖 赞助支持', DONATE_TEXT);
            });
        } else {
            console.warn('[more] #menuDonate 未找到');
        }
        var menuEdition = document.getElementById('menuEdition');
        if (menuEdition) {
            menuEdition.addEventListener('click', function() {
                toggleMoreMenu(false);
                // 切换标准版：统一跳转到 V3 正式站点（x6ren.cn）；不再区分 file:// 或站点路径。
                window.location.assign('https://x6ren.cn/');
            });
        }
    } catch (e) { console.warn('[more] 菜单项绑定失败：', e); }

    try {
        if (__moreModalClose) {
            __moreModalClose.addEventListener('click', closeMoreModal);
        }
        if (__moreModalMask) {
            __moreModalMask.addEventListener('click', function(e) {
                if (e.target === __moreModalMask) closeMoreModal();
            });
        }
    } catch (e) { console.warn('[more] 弹窗关闭绑定失败：', e); }
}
// 立即绑定（Script 在 body 末尾 DOM 之后加载，DOM 元素存在）
bindMoreUI();