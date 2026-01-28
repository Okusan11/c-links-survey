/**
 * 店舗ユーティリティ関数
 */

/**
 * URLから店舗IDを抽出する
 *
 * 例:
 * - /survey?storeId=ginza → "ginza"
 * - /survey?storeId=aoyama → "aoyama"
 * - /survey → null (店舗IDなし)
 *
 * @returns 店舗ID または null
 */
export function extractStoreIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get('storeId');
  
  if (storeId) {
    return storeId;
  }
  
  return null;
}

/**
 * 店舗IDが有効かどうかをチェック
 *
 * @param storeId チェックする店舗ID
 * @param validStoreIds 有効な店舗IDの配列
 * @returns 有効な場合true
 */
export function isValidStoreId(storeId: string | null, validStoreIds: string[]): boolean {
  if (!storeId) return false;
  return validStoreIds.includes(storeId);
}
