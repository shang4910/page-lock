# 变更日志

所有重要变更将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2024-01-XX

### 新增
- 🔒 核心页面锁定功能
  - 禁止插入内容
  - 禁止拖拽内容
  - 禁止编辑文档
  - 允许浏览和复制
- 🎨 美观的锁定提示横幅
- ⌨️ 快捷键支持 (Ctrl+Shift+L)
- ⚙️ 设置页面
  - 常规设置（提示条、默认锁定）
  - 自动锁定（URL 匹配规则）
  - 预设规则（腾讯云文档、Google Docs 等）
- 🌐 国际化支持（中文）
- 📦 构建和打包工具
- 🎨 SVG 图标自动生成 PNG

### 技术
- 基于 Manifest V3
- 使用 MutationObserver 监听 DOM 变化
- 事件捕获阶段拦截
- Service Worker 后台管理
