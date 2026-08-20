/**
 * Page Lock - Options Script
 * 设置页面逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 元素
  const showBannerEl = document.getElementById('showBanner');
  const defaultLockEl = document.getElementById('defaultLock');
  const autoLockEl = document.getElementById('autoLock');
  const autoLockUrlsEl = document.getElementById('autoLockUrls');
  const welcomeBanner = document.getElementById('welcomeBanner');
  const welcomeClose = document.getElementById('welcomeClose');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // ==================== 设置加载/保存 ====================

  function loadSettings() {
    chrome.storage.local.get(['pageLockSettings'], (result) => {
      const settings = result.pageLockSettings || {
        showBanner: true,
        autoLock: false,
        autoLockUrls: [],
        defaultLock: false,
      };

      showBannerEl.checked = settings.showBanner;
      defaultLockEl.checked = settings.defaultLock;
      autoLockEl.checked = settings.autoLock;
      autoLockUrlsEl.value = (settings.autoLockUrls || []).join('\n');
    });
  }

  function saveSettings() {
    const urls = autoLockUrlsEl.value
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const settings = {
      showBanner: showBannerEl.checked,
      defaultLock: defaultLockEl.checked,
      autoLock: autoLockEl.checked,
      autoLockUrls: urls,
    };

    chrome.storage.local.set({ pageLockSettings: settings });
  }

  // ==================== 导航 ====================

  function switchSection(sectionName) {
    navItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.section === sectionName);
    });
    sections.forEach((section) => {
      section.classList.toggle('active', section.id === `section-${sectionName}`);
    });
  }

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      switchSection(item.dataset.section);
    });
  });

  // ==================== 欢迎横幅 ====================

  function checkWelcome() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') === 'true') {
      welcomeBanner.style.display = 'flex';
    } else {
      welcomeBanner.style.display = 'none';
    }
  }

  welcomeClose.addEventListener('click', () => {
    welcomeBanner.style.display = 'none';
    // 移除 URL 参数
    const url = new URL(window.location.href);
    url.searchParams.delete('welcome');
    window.history.replaceState({}, '', url.toString());
  });

  // ==================== 预设按钮 ====================

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      const current = autoLockUrlsEl.value.split('\n').map((s) => s.trim()).filter(Boolean);
      if (!current.includes(url)) {
        current.push(url);
        autoLockUrlsEl.value = current.join('\n');
        saveSettings();
        // 视觉反馈
        btn.style.background = '#f0f1ff';
        btn.style.borderColor = '#667eea';
        btn.style.color = '#667eea';
        setTimeout(() => {
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 1000);
      }
    });
  });

  // ==================== 事件绑定 ====================

  showBannerEl.addEventListener('change', saveSettings);
  defaultLockEl.addEventListener('change', saveSettings);
  autoLockEl.addEventListener('change', saveSettings);
  autoLockUrlsEl.addEventListener('input', debounce(saveSettings, 500));

  // ==================== 工具函数 ====================

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ==================== 初始化 ====================

  checkWelcome();
  loadSettings();
});
