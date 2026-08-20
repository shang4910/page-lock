/**
 * Page Lock - Background Service Worker
 * 处理扩展的后台逻辑
 */

// 存储每个标签页的锁定状态
const lockState = new Map();

// ==================== 安装/更新处理 ====================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装，设置默认配置
    chrome.storage.local.get(['pageLockSettings'], (result) => {
      if (!result.pageLockSettings) {
        chrome.storage.local.set({
          pageLockSettings: {
            showBanner: true,
            autoLock: false,
            autoLockUrls: [],
            defaultLock: false,
          },
        });
      }
    });

    // 打开欢迎页面
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/options.html?welcome=true'),
    });
  }
});

// ==================== 快捷键处理 ====================

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-lock') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    // 跳过受限页面
    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://')) return;

    try {
      // 确保 content script 已注入
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css'],
      });

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
      if (response) {
        lockState.set(tab.id, response.locked);
        updateIcon(tab.id, response.locked);
      }
    } catch (e) {
      console.error('[Page Lock Background] 快捷键切换失败:', e);
    }
  }
});

// ==================== 图标更新 ====================

/**
 * 更新扩展图标状态
 */
function updateIcon(tabId, locked) {
  const iconPath = locked
    ? { 16: 'icons/icon16-locked.png', 32: 'icons/icon32-locked.png', 48: 'icons/icon48-locked.png', 128: 'icons/icon128-locked.png' }
    : { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' };

  chrome.action.setIcon({ tabId, path: iconPath }).catch(() => {});

  chrome.action.setTitle({
    tabId,
    title: locked ? 'Page Lock - 🔒 页面已锁定 (Ctrl+Shift+L 解锁)' : 'Page Lock - 🔓 点击锁定页面 (Ctrl+Shift+L)',
  });
}

// ==================== 标签页事件 ====================

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // 检查自动锁定配置
    chrome.storage.local.get(['pageLockSettings'], (result) => {
      const settings = result.pageLockSettings;
      if (settings?.autoLock && settings.autoLockUrls?.length > 0) {
        const url = tab.url || '';
        const shouldAutoLock = settings.autoLockUrls.some(
          (pattern) => url.includes(pattern) || new RegExp(pattern).test(url)
        );
        if (shouldAutoLock) {
          autoLockTab(tabId);
        }
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  lockState.delete(tabId);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const locked = lockState.get(activeInfo.tabId) || false;
  updateIcon(activeInfo.tabId, locked);
});

// ==================== 消息处理 ====================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'updateLockState':
      if (sender.tab?.id) {
        lockState.set(sender.tab.id, message.locked);
        updateIcon(sender.tab.id, message.locked);
      }
      sendResponse({ success: true });
      break;

    case 'getLockState':
      if (sender.tab?.id) {
        sendResponse({ locked: lockState.get(sender.tab.id) || false });
      } else {
        sendResponse({ locked: false });
      }
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }
  return true;
});

// ==================== 自动锁定 ====================

async function autoLockTab(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['content.css'],
    });
    await chrome.tabs.sendMessage(tabId, { action: 'lock' });
    lockState.set(tabId, true);
    updateIcon(tabId, true);
  } catch (e) {
    console.error('[Page Lock Background] 自动锁定失败:', e);
  }
}
