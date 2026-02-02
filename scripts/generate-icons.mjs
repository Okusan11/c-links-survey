#!/usr/bin/env node
/**
 * アイコン生成スクリプト
 *
 * S3からダウンロードしたicon-1024.pngから、
 * 各サイズのPNGアイコンを生成してpublic/ディレクトリに出力します。
 *
 * Usage:
 *   node scripts/generate-icons.mjs [source-file]
 *
 * Example:
 *   node scripts/generate-icons.mjs icon-1024.png
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 生成するアイコンのサイズ定義
const ICON_SIZES = [
  // 標準ファビコン
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },

  // PWA Manifest アイコン
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },

  // Apple Touch Icon
  { size: 180, name: 'apple-touch-icon.png' },

  // Maskable アイコン（Android用）
  { size: 192, name: 'icon-maskable-192x192.png', maskable: true },
  { size: 512, name: 'icon-maskable-512x512.png', maskable: true },
];

// 出力ディレクトリ
const OUTPUT_DIR = resolve(__dirname, '../public');

async function generateIcons(sourceFile) {
  if (!sourceFile) {
    console.error('❌ Error: Source file path is required');
    console.log('Usage: node scripts/generate-icons.mjs <source-file>');
    process.exit(1);
  }

  const sourcePath = resolve(process.cwd(), sourceFile);

  // ソースファイルの存在確認
  if (!existsSync(sourcePath)) {
    console.error(`❌ Error: Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  // 出力ディレクトリの作成
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created output directory: ${OUTPUT_DIR}`);
  }

  console.log(`📦 Generating icons from: ${sourcePath}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  // 各サイズのアイコンを生成
  for (const { size, name, maskable } of ICON_SIZES) {
    try {
      const outputPath = join(OUTPUT_DIR, name);

      // sharpでリサイズ
      // maskableアイコンの場合は、安全領域を考慮したリサイズ（80%の領域を使用）
      if (maskable) {
        // maskableアイコン: 中央80%の領域を使用（Androidのアダプティブアイコン仕様）
        const safeArea = Math.floor(size * 0.8);
        const offset = Math.floor((size - safeArea) / 2);

        await sharp(sourcePath)
          .resize(safeArea, safeArea, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .extend({
            top: offset,
            bottom: offset,
            left: offset,
            right: offset,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .resize(size, size)
          .png()
          .toFile(outputPath);
      } else {
        // 通常アイコン: そのままリサイズ
        await sharp(sourcePath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      }

      console.log(`✓ Generated: ${name} (${size}x${size})`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
      errorCount++;
    }
  }

  console.log('');
  console.log('=== Icon Generation Summary ===');
  console.log(`✓ Success: ${successCount} icons`);
  if (errorCount > 0) {
    console.log(`✗ Errors: ${errorCount} icons`);
    process.exit(1);
  }
  console.log('✅ All icons generated successfully!');
}

// メイン実行
const sourceFile = process.argv[2];
generateIcons(sourceFile).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
