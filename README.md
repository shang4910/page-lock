# Page Lock - Edge 页面锁定扩展

一个轻量级的 Microsoft Edge 浏览器扩展，用于锁定当前页面，仅支持浏览和复制，禁止插入、编辑、拖拽内容。

## ✨ 功能特性

- 🔒 **一键锁定** - 点击工具栏图标或按 `Ctrl+Shift+L` 锁定当前页面
- 🚫 **禁止插入** - 阻止在页面中插入新内容
- 🚫 **禁止拖拽** - 阻止拖拽页面元素
- 🚫 **禁止编辑** - 将可编辑区域设为只读
- ✅ **允许复制** - 正常浏览和复制内容
- 🎯 **自动锁定** - 支持 URL 匹配规则，访问指定页面自动锁定
- 🎨 **美观提示** - 锁定后顶部显示渐变提示横幅

## 📦 安装方法

### 开发者模式安装

1. 打开 Edge 浏览器，进入 `edge://extensions/`
2. 开启左下角的 **开发人员模式**
3. 点击 **加载解压缩的扩展**
4. 选择本项目的 `page-lock` 文件夹
5. 安装完成！工具栏会出现锁形图标

### 打包安装（可选）

1. 在 `edge://extensions/` 页面点击 **打包扩展程序**
2. 选择 `page-lock` 文件夹
3. 生成 `.crx` 文件和 `.pem` 私钥文件

## 🚀 使用方法

### 手动锁定/解锁

- **方式一**：点击 Edge 工具栏上的 Page Lock 图标
- **方式二**：按快捷键 `Ctrl+Shift+L`（Mac: `Cmd+Shift+L`）

### 自动锁定

1. 点击扩展图标 → 设置（或右键扩展图标 → 选项）
2. 进入 **自动锁定** 页面
3. 开启 **启用自动锁定**
4. 添加 URL 匹配规则（每行一个），例如：
   ```
   cloud.tencent.com/document
   docs.google.com
   notion.so
   ```
5. 点击预设按钮快速添加常用站点

## 📁 项目结构

```
page-lock/
├── manifest.json          # 扩展清单文件 (Manifest V3)
├── background.js          # 后台 Service Worker
├── content.js             # 内容脚本（核心锁定逻辑）
├── content.css            # 锁定状态样式
├── popup/                 # 弹出窗口
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/               # 设置页面
│   ├── options.html
│   ├── options.js
│   └── options.css
├── icons/                 # 图标文件
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   ├── icon16-locked.png
│   ├── icon32-locked.png
│   ├── icon48-locked.png
│   └── icon128-locked.png
└── README.md
```

## 🔧 技术实现

### 锁定机制

| 拦截方式 | 说明 |
|---------|------|
| `dragstart` | 阻止拖拽开始 |
| `drop` / `dragover` | 阻止拖放操作 |
| `keydown` | 拦截输入（保留复制快捷键） |
| `paste` / `cut` | 阻止粘贴和剪切 |
| `beforeinput` | 拦截所有输入事件 |
| `MutationObserver` | 监听并移除 `contenteditable` 属性 |
| CSS `user-drag` | 全局禁止拖拽样式 |
| CSS `user-modify` | 全局禁止编辑样式 |

### 存储

- `chrome.storage.local` - 持久化用户设置
- `chrome.storage.session` - 会话级锁定状态

## 🌐 适用场景

- 📄 腾讯云文档、阿里云文档等在线文档
- 📝 Google Docs、Notion、语雀等协作平台
- 📚 知乎、掘金、CSDN 等技术博客
- 🏢 企业内部知识库、Wiki 系统
- 📋 任何需要防止意外编辑的网页

## ⚠️ 注意事项

- 本扩展仅在客户端层面提供保护，无法阻止有意的开发者工具操作
- 部分网站可能使用特殊的内容编辑框架，锁定效果可能有限
- 锁定状态下仍可正常浏览、滚动和复制内容
- 不支持 `chrome://` 和 `edge://` 等浏览器内置页面

## 📄 许可证

MIT License
