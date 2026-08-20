/**
 * 构建脚本
 * 用于打包扩展为 .zip 文件
 *
 * 使用方法:
 *   npm run build        # 构建到 dist/ 目录
 *   npm run package      # 构建并打包为 .zip
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SRC_DIR = ROOT_DIR;

// 需要复制的文件列表
const FILES_TO_COPY = [
  'manifest.json',
  'background.js',
  'content.js',
  'content.css',
  'popup/popup.html',
  'popup/popup.js',
  'popup/popup.css',
  'options/options.html',
  'options/options.js',
  'options/options.css',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'icons/icon16-locked.png',
  'icons/icon32-locked.png',
  'icons/icon48-locked.png',
  'icons/icon128-locked.png',
  '_locales/zh_CN/messages.json',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
}

function build() {
  console.log('🔨 开始构建...\n');

  // 清理并创建 dist 目录
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  ensureDir(DIST_DIR);

  // 复制文件
  let copied = 0;
  for (const file of FILES_TO_COPY) {
    const src = path.join(SRC_DIR, file);
    const dest = path.join(DIST_DIR, file);

    if (fs.existsSync(src)) {
      copyFile(src, dest);
      console.log(`  ✅ ${file}`);
      copied++;
    } else {
      console.log(`  ⚠️  跳过 (不存在): ${file}`);
    }
  }

  console.log(`\n📦 构建完成！共复制 ${copied} 个文件到 dist/`);
  return copied;
}

function packageZip() {
  const copied = build();
  if (copied === 0) {
    console.error('❌ 没有文件可打包');
    process.exit(1);
  }

  const zipName = `page-lock-v1.0.0.zip`;
  const zipPath = path.join(ROOT_DIR, zipName);

  // 删除旧的 zip
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  try {
    // 使用 PowerShell 压缩（Windows）
    execSync(
      `powershell -Command "Compress-Archive -Path '${distPath}\\*' -DestinationPath '${zipPath}' -Force"`,
      { stdio: 'inherit' }
    );
    console.log(`\n📦 打包完成: ${zipName}`);
  } catch (e) {
    console.error('打包失败:', e.message);
    process.exit(1);
  }
}

const isPackage = process.argv.includes('--package');
const distPath = DIST_DIR;

if (isPackage) {
  packageZip();
} else {
  build();
}
