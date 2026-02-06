/**
 * 店舗ユーティリティ関数
 */

/**
 * ビルド時に注入された「このビルドの店舗ID」を取得する。
 */
export function getExpectedStoreId(): string | null {
  const id = process.env.REACT_APP_STORE_ID;
  return id && id.trim() !== '' ? id.trim() : null;
}

/**
 * URL（path / query）から店舗IDを解決する
 *
 * 優先順位:
 * 1) REACT_APP_STORE_ID（店舗別ビルドならこれ）
 * 2) /survey/<storeId>/... の <storeId>
 * 3) ?storeId=xxx（後方互換）
 */
export function resolveStoreId(): string | null {
  // 1) build-time injected store id (best for per-store builds)
  const expected = getExpectedStoreId();
  if (expected) return expected;

  // 2) path-based: /survey/<storeId>/...
  const path = window.location.pathname; // e.g. "/survey/beautysalon" or "/survey/beautysalon/thanks"
  const m = path.match(/^\/survey\/([^\/?#]+)/);
  if (m?.[1]) return decodeURIComponent(m[1]).trim();

  // 3) query-based: ?storeId=xxx (legacy)
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get('storeId');
  return storeId && storeId.trim() !== '' ? storeId.trim() : null;
}

/**
 * URLから店舗IDを抽出する（resolveStoreId のエイリアス・後方互換）
 */
export function extractStoreIdFromUrl(): string | null {
  return resolveStoreId();
}
