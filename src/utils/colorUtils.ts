/**
 * カラーユーティリティ
 * プライマリカラーの輝度によってテキストカラーを自動計算
 */

/**
 * HEX カラーを RGB に変換
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // #RGB または #RRGGBB 形式に対応
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const expandedHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expandedHex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * RGB カラーの相対輝度を計算（WCAG 2.1 準拠）
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const srgb = c / 255
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * 2つの色のコントラスト比を計算（WCAG 2.1 準拠）
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const l1 = getRelativeLuminance(color1.r, color1.g, color1.b)
  const l2 = getRelativeLuminance(color2.r, color2.g, color2.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 背景色に対して適切なテキストカラーを自動計算
 * WCAG AA 基準（4.5:1）を満たすかどうかで白/黒を判定
 *
 * @param backgroundColor 背景色（HEX形式）
 * @param lightColor 明るい色（デフォルト: white）
 * @param darkColor 暗い色（デフォルト: black）
 * @returns 適切なテキストカラー
 */
export function getContrastingTextColor(
  backgroundColor: string,
  lightColor: string = '#FFFFFF',
  darkColor: string = '#000000'
): string {
  const bgRgb = hexToRgb(backgroundColor)
  if (!bgRgb) return darkColor

  const whiteRgb = { r: 255, g: 255, b: 255 }
  const blackRgb = { r: 0, g: 0, b: 0 }

  const contrastWithWhite = getContrastRatio(bgRgb, whiteRgb)
  const contrastWithBlack = getContrastRatio(bgRgb, blackRgb)

  // より高いコントラスト比を持つ色を選択
  return contrastWithWhite >= contrastWithBlack ? lightColor : darkColor
}

/**
 * 背景色が明るいかどうかを判定
 * 輝度0.5を閾値として使用
 */
export function isLightBackground(backgroundColor: string): boolean {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return true

  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.179 // WCAG の推奨閾値
}

/**
 * HEX カラーを HSL に変換
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * HSL を HEX に変換
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else if (300 <= h && h < 360) {
    r = c
    g = 0
    b = x
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * 指定した輝度でカラーバリアントを生成
 */
export function generateColorWithLightness(baseColor: string, lightness: number): string {
  const hsl = hexToHsl(baseColor)
  if (!hsl) return baseColor
  return hslToHex(hsl.h, hsl.s, lightness)
}
