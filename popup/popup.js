/**
 * Page Lock - Popup Script
 * 处理弹出窗口的交互逻辑
 */

document.addEventListener('DOMContentLoaded', async () => {
  const statusCard = document.getElementById('statusCard');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusLabel = document.getElementById('statusLabel');
  const statusUrl = document.getElementById('statusUrl');
  const toggleBtn = document.getElementById('toggleBtn');
  const toggleBtnIcon = document.getElementById('toggleBtnIcon');
  const toggleBtnText = document.getElementById('toggleBtnText');

  // 获取当前活动标签页
  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  // 获取当前页面的锁定状态
  async function getLockStatus(tab) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
      return response?.locked ?? false;
    } catch (e) {
      // content script 可能未注入
      return false;
    }
  }

  // 更新 UI
  function updateUI(locked, url) {
    if (locked) {
      statusIndicator.classList.add('locked');
      statusIndicator.classList.remove('unlocked');
      statusLabel.textContent = '页面已锁定';
      statusLabel.style.color = '#52c41a';
      toggleBtn.className = 'toggle-btn unlock';
      toggleBtnText.textContent = '解锁页面';
      toggleBtnIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
        </svg>
      `;
    } else {
      statusIndicator.classList.remove('locked');
      statusIndicator.classList.add('unlocked');
      statusLabel.textContent = '页面未锁定';
      statusLabel.style.color = '#faad14';
      toggleBtn.className = 'toggle-btn lock';
      toggleBtnText.textContent = '锁定页面';
      toggleBtnIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      `;
    }

    if (url) {
      try {
        const urlObj = new URL(url);
        statusUrl.textContent = urlObj.hostname + urlObj.pathname;
      } catch {
        statusUrl.textContent = url;
      }
    }
  }

  // 切换锁定
  async function toggle() {
    const tab = await getCurrentTab();
    if (!tab || !tab.id) return;

    // 先注入 content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css'],
      });
    } catch (e) {
      // 可能已经注入，忽略
    }

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
      updateUI(response.locked, tab.url);
    } catch (e) {
      statusLabel.textContent = '无法在此页面使用';
      statusLabel.style.color = '#ff4d4f';
      console.error('[Page Lock Popup] 切换失败:', e);
    }
  }

  // 初始化
  async function init() {
    const tab = await getCurrentTab();
    if (!tab || !tab.url) {
      statusLabel.textContent = '无法获取当前页面';
      statusLabel.style.color = '#999';
      return;
    }

    // 检查是否是受限页面
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('chrome-extension://')) {
      statusLabel.textContent = '此页面不支持锁定';
      statusLabel.style.color = '#999';
      toggleBtn.disabled = true;
      toggleBtn.style.opacity = '0.5';
      toggleBtn.style.cursor = 'not-allowed';
      return;
    }

    const locked = await getLockStatus(tab);
    updateUI(locked, tab.url);
  }

  // 事件绑定
  toggleBtn.addEventListener('click', toggle);

  // 启动
  init();
});
