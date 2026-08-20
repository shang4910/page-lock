# 贡献指南

感谢你对 Page Lock 扩展的关注！

## 开发环境搭建

1. 克隆仓库
2. 安装依赖：`npm install`
3. 生成图标：`npm run icons`
4. 在 Edge 中以开发者模式加载 `page-lock` 文件夹

## 项目结构

```
page-lock/
├── manifest.json          # 扩展清单 (Manifest V3)
├── background.js          # Service Worker
├── content.js             # 内容脚本（核心锁定逻辑）
├── content.css            # 锁定样式
├── popup/                 # 弹出窗口
├── options/               # 设置页面
├── icons/                 # 图标
├── scripts/               # 构建脚本
├── _locales/              # 国际化
└── README.md
```

## 开发规范

- 使用 2 空格缩进
- 使用 LF 行尾
- 使用 UTF-8 编码
- 提交前运行 `npm run build` 确保构建通过

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

## 功能请求

如果你有功能建议，请创建 Issue 描述你的需求。

## 许可证

本项目采用 MIT 许可证。
