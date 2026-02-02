/**
 * 店舗ユーティリティ関数
 */

/**
 * ビルド時に注入された「このビルドの店舗ID」を取得する。
 * CodePipeline で店舗ごとにビルドする際に REACT_APP_STORE_ID が設定される。
 * ローカル開発時は未設定のことが多い。
 */
export function getExpectedStoreId(): string | null {
  const id = process.env.REACT_APP_STORE_ID;
  return id && id.trim() !== '' ? id.trim() : null;
}

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

