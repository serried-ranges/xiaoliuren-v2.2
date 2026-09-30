// =========================================================
// DOM 工具：showToast（顶部 Toast 提示） + fallbackCopy（剪贴板 fallback）
// （从 V2.1.2 app-all.js 物理切分，保持 1:1 逻辑不变；去 IIFE 后共享 Script scope）
// =========================================================
'use strict';


            // ===== Toast 函数 =====
            function showToast(msg, icon) {
                icon = icon || '✅';
                toastMessage.textContent = msg;
                toast.querySelector('.toast-icon').textContent = icon;
                toast.classList.add('show');
                clearTimeout(toastTimer);
                toastTimer = setTimeout(function() {
                    toast.classList.remove('show');
                }, 3000);
            }

            function fallbackCopy(text, successMessage) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                textarea.style.top = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showToast(successMessage || '已复制到剪贴板，请粘贴到AI工具中', '📋');
                } catch (e) {
                    alert('复制失败，请手动复制以下内容：\n\n' + text);
                }
                document.body.removeChild(textarea);
            }