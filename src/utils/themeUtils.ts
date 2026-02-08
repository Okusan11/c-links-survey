import { getContrastingTextColor } from './colorUtils';

/**
 * HEX カラーを HSL 形式に変換（CSS変数用）
 * 例: "#E64545" → "0 76% 59%"
 */
export function hexToHslString(hex: string): string {
  // HEX → RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0,
    s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * 指定のlightnessでHSL文字列を生成
 */
function hslWithLightness(h: number, s: number, lightness: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(lightness)}%`;
}

/**
 * 環境変数からテーマカラーを取得してCSS変数に適用
 */
export function applyThemeColors(): void {
  const primary = process.env.REACT_APP_THEME_PRIMARY;
  const accent = process.env.REACT_APP_THEME_ACCENT;

  if (primary && primary.startsWith('#')) {
    const primaryHsl = hexToHslString(primary);
    const [hStr, sStr] = primaryHsl.split(' ');
    const h = parseFloat(hStr);
    const s = parseFloat(sStr);

    document.documentElement.style.setProperty('--primary', primaryHsl);

    // プライマリカラーの輝度に基づいて foreground を自動計算
    // 明るい背景の場合は色相を保った「インクカラー」、暗い背景の場合は白
    const foregroundColor = getContrastingTextColor(primary);
    const foregroundHsl = hexToHslString(foregroundColor);
    document.documentElement.style.setProperty('--primary-foreground', foregroundHsl);

    // シェード生成（50-900）
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    const lightnesses = [97, 94, 87, 75, 62, 50, 42, 35, 28, 21];
    shades.forEach((shade, i) => {
      document.documentElement.style.setProperty(
        `--primary-${shade}`,
        hslWithLightness(h, s, lightnesses[i])
      );
    });

    // ring カラーも更新
    document.documentElement.style.setProperty('--ring', primaryHsl);

    console.log(`✓ Theme primary applied: ${primary} → ${primaryHsl}`);
    console.log(`✓ Theme primary-foreground: ${foregroundColor} → ${foregroundHsl}`);
  }

  if (accent && accent.startsWith('#')) {
    const accentHsl = hexToHslString(accent);
    const [hStr, sStr] = accentHsl.split(' ');
    const h = parseFloat(hStr);
    const s = parseFloat(sStr);

    document.documentElement.style.setProperty('--accent', accentHsl);

    // アクセントカラーの輝度に基づいて foreground を自動計算
    // 明るい背景の場合は色相を保った「インクカラー」、暗い背景の場合は白
    const accentForegroundColor = getContrastingTextColor(accent);
    const accentForegroundHsl = hexToHslString(accentForegroundColor);
    document.documentElement.style.setProperty('--accent-foreground', accentForegroundHsl);

    document.documentElement.style.setProperty(
      '--accent-50',
      hslWithLightness(h, s, 97)
    );
    document.documentElement.style.setProperty(
      '--accent-100',
      hslWithLightness(h, s, 94)
    );

    console.log(`✓ Theme accent applied: ${accent} → ${accentHsl}`);
    console.log(`✓ Theme accent-foreground: ${accentForegroundColor} → ${accentForegroundHsl}`);
  }
}
