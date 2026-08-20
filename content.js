/**
 * Page Lock - Content Script
 * 锁定页面：禁止插入、编辑、拖拽，仅允许浏览和复制
 */

(function () {
  'use strict';

  // 状态键
  const STORAGE_KEY = 'pageLockState';

  // 防止重复注入
  if (window.__pageLockInjected) return;
  window.__pageLockInjected = true;

  // ==================== 锁定状态管理 ====================

  let isLocked = false;
  let observer = null;
  let styleInjected = false;

  // ==================== 核心锁定逻辑 ====================

  /**
   * 注入全局锁定样式
   */
  function injectLockStyles() {
    if (styleInjected) return;
    styleInjected = true;

    const style = document.createElement('style');
    style.id = 'page-lock-styles';
    style.textContent = `
      /* 锁定状态下禁止文本选择拖动（但允许复制） */
      html.page-lock-active * {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
      }

      /* 锁定状态下禁止编辑 */
      html.page-lock-active [contenteditable="true"],
      html.page-lock-active [contenteditable=""] {
        -webkit-user-modify: read-only !important;
        user-modify: read-only !important;
        pointer-events: none !important;
      }

      /* 锁定状态下禁止输入 */
      html.page-lock-active input,
      html.page-lock-active textarea {
        pointer-events: none !important;
        -webkit-user-modify: read-only !important;
        user-modify: read-only !important;
      }

      /* 锁定提示条 */
      #page-lock-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 2147483647;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 8px 16px;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease, opacity 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      #page-lock-banner .lock-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      #page-lock-banner .lock-text {
        font-weight: 500;
      }

      #page-lock-banner .lock-hint {
        font-size: 12px;
        opacity: 0.8;
      }

      /* 页面顶部留出提示条空间 */
      html.page-lock-active {
        scroll-padding-top: 40px;
      }
    `;
    document.documentElement.appendChild(style);
  }

  /**
   * 显示锁定提示条
   */
  function showBanner() {
    if (document.getElementById('page-lock-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'page-lock-banner';
    banner.innerHTML = `
      <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <span class="lock-text">🔒 页面已锁定 — 仅可浏览和复制</span>
      <span class="lock-hint">| 按 Ctrl+Shift+L 或点击工具栏图标解锁</span>
    `;
    document.body.appendChild(banner);
  }

  /**
   * 隐藏锁定提示条
   */
  function hideBanner() {
    const banner = document.getElementById('page-lock-banner');
    if (banner) banner.remove();
  }

  // ==================== 事件拦截 ====================

  /**
   * 阻止拖拽开始
   */
  function blockDragStart(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  /**
   * 阻止拖放
   */
  function blockDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  /**
   * 阻止拖入
   */
  function blockDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  /**
   * 阻止输入（键盘）
   */
  function blockInput(e) {
    // 允许复制快捷键
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A')) {
      return;
    }
    // 允许 F5 刷新
    if (e.key === 'F5') return;
    // 允许 Escape
    if (e.key === 'Escape') return;

    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  /**
   * 阻止粘贴
   */
  function blockPaste(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  /**
   * 阻止剪切
   */
  function blockCut(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  /**
   * 阻止右键菜单中的编辑操作（仅阻止粘贴/插入相关）
   */
  function blockContextMenu(e) {
    // 允许右键菜单（用户可能需要"复制"选项）
    // 但阻止通过右键菜单的粘贴
    // 这里不阻止 contextMenu，让复制菜单可用
  }

  /**
   * 阻止 beforeinput 事件
   */
  function blockBeforeInput(e) {
    // 允许复制
    if (e.inputType === 'insertFromPaste') {
      e.preventDefault();
      return false;
    }
    // 阻止所有插入类操作
    if (e.inputType && e.inputType.startsWith('insert')) {
      e.preventDefault();
      return false;
    }
    // 阻止删除类操作
    if (e.inputType && e.inputType.startsWith('delete')) {
      e.preventDefault();
      return false;
    }
    // 阻止格式操作
    if (e.inputType && e.inputType.startsWith('format')) {
      e.preventDefault();
      return false;
    }
  }

  // ==================== MutationObserver ====================

  /**
   * 监听 DOM 变化，移除 contenteditable 属性
   */
  function setupMutationObserver() {
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          // 移除 contenteditable
          if (target.contentEditable === 'true' || target.getAttribute('contenteditable') === 'true') {
            target.contentEditable = 'false';
            target.removeAttribute('contenteditable');
          }
          // 移除 draggable
          if (target.getAttribute('draggable') === 'true') {
            target.removeAttribute('draggable');
          }
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['contenteditable', 'draggable'],
      subtree: true,
    });
  }

  // ==================== 锁定/解锁 ====================

  /**
   * 锁定页面
   */
  function lockPage() {
    if (isLocked) return;
    isLocked = true;

    injectLockStyles();
    document.documentElement.classList.add('page-lock-active');
    showBanner();

    // 移除所有 contenteditable
    document.querySelectorAll('[contenteditable]').forEach((el) => {
      el.contentEditable = 'false';
      el.removeAttribute('contenteditable');
    });

    // 移除所有 draggable
    document.querySelectorAll('[draggable="true"]').forEach((el) => {
      el.removeAttribute('draggable');
    });

    // 禁用所有输入框
    document.querySelectorAll('input, textarea').forEach((el) => {
      el.setAttribute('readonly', 'readonly');
      el.disabled = true;
    });

    // 绑定事件拦截
    document.addEventListener('dragstart', blockDragStart, true);
    document.addEventListener('drop', blockDrop, true);
    document.addEventListener('dragover', blockDragOver, true);
    document.addEventListener('dragenter', blockDragOver, true);
    document.addEventListener('keydown', blockInput, true);
    document.addEventListener('paste', blockPaste, true);
    document.addEventListener('cut', blockCut, true);
    document.addEventListener('beforeinput', blockBeforeInput, true);

    // 启动 MutationObserver
    if (document.body) {
      setupMutationObserver();
    }

    console.log('[Page Lock] 页面已锁定');
  }

  /**
   * 解锁页面
   */
  function unlockPage() {
    if (!isLocked) return;
    isLocked = false;

    document.documentElement.classList.remove('page-lock-active');
    hideBanner();

    // 移除事件拦截
    document.removeEventListener('dragstart', blockDragStart, true);
    document.removeEventListener('drop', blockDrop, true);
    document.removeEventListener('dragover', blockDragOver, true);
    document.removeEventListener('dragenter', blockDragOver, true);
    document.removeEventListener('keydown', blockInput, true);
    document.removeEventListener('paste', blockPaste, true);
    document.removeEventListener('cut', blockCut, true);
    document.removeEventListener('beforeinput', blockBeforeInput, true);

    // 停止 MutationObserver
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    console.log('[Page Lock] 页面已解锁');
  }

  /**
   * 切换锁定状态
   */
  function toggleLock() {
    if (isLocked) {
      unlockPage();
    } else {
      lockPage();
    }
    return isLocked;
  }

  // ==================== 消息通信 ====================

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'lock':
        lockPage();
        sendResponse({ locked: true });
        break;
      case 'unlock':
        unlockPage();
        sendResponse({ locked: false });
        break;
      case 'toggle':
        const nowLocked = toggleLock();
        sendResponse({ locked: nowLocked });
        break;
      case 'getStatus':
        sendResponse({ locked: isLocked });
        break;
      default:
        sendResponse({ error: 'Unknown action' });
    }
    return true; // 保持消息通道开放
  });

  // ==================== 初始化 ====================

  /**
   * 从存储中恢复锁定状态
   */
  async function init() {
    try {
      const result = await chrome.storage.session.get([STORAGE_KEY]);
      if (result[STORAGE_KEY]) {
        const { locked, url, timestamp } = result[STORAGE_KEY];
        // 检查是否是当前页面且未过期（30分钟内）
        if (locked && url === window.location.href && (Date.now() - timestamp < 30 * 60 * 1000)) {
          // 等待 DOM 加载
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', lockPage);
          } else {
            lockPage();
          }
        }
      }
    } catch (e) {
      // storage.session 可能不可用，忽略
    }
  }

  init();

  // 暴露 API 供 background 调用
  window.__pageLockAPI = {
    lock: lockPage,
    unlock: unlockPage,
    toggle: toggleLock,
    getStatus: () => isLocked,
  };

})();
