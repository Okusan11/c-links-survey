/**
 * 店舗設定管理
 *
 * 環境に応じて店舗マスターを読み込みます：
 * - 本番環境: REACT_APP_STORE_MASTER環境変数（SSMから取得）
 * - 開発環境: /config/stores.json（ローカルファイル）
 */

import type {
  Store,
  StoreMasterConfig,
  StoreInfo,
  StoreListItem
} from '../types/store';
import { StoreUtils } from '../types/store';

/**
 * 環境変数から店舗マスター設定を取得
 */
function loadStoreMasterFromEnv(): StoreMasterConfig | null {
  const storeMasterJson = process.env.REACT_APP_STORE_MASTER;

  if (!storeMasterJson || storeMasterJson === '{}' || storeMasterJson === '[]') {
    return null;
  }

  try {
    return JSON.parse(storeMasterJson) as StoreMasterConfig;
  } catch (error) {
    console.error('Failed to parse REACT_APP_STORE_MASTER:', error);
    return null;
  }
}

/**
 * デフォルト店舗設定を読み込み（ローカル開発環境用）
 */
async function loadDefaultStores(): Promise<StoreMasterConfig> {
  try {
    console.log('📂 Fetching /config/stores.json...');
    const response = await fetch('/config/stores.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✓ Successfully fetched stores.json:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to load /config/stores.json:', error);
    console.warn('⚠️  Using hardcoded fallback stores');
    // フォールバック: 最小限の設定を返す
    return {
      version: '1.0.0',
      stores: [
        { storeId: 'ginza', storeName: '銀座店', displayName: 'affi-t 銀座店' },
        { storeId: 'aoyama', storeName: '青山店', displayName: 'affi-t 青山店' },
        { storeId: 'shibuya', storeName: '渋谷店', displayName: 'affi-t 渋谷店' }
      ]
    };
  }
}

/**
 * 店舗設定を読み込み（非同期）
 */
export async function loadStoreConfiguration(): Promise<Record<string, StoreInfo>> {
  // 1. 環境変数から取得を試行（本番環境）
  const storeMaster = loadStoreMasterFromEnv();

  if (storeMaster) {
    console.log('✓ Loaded stores from REACT_APP_STORE_MASTER:', storeMaster.stores.length, 'stores');
    const activeStores = StoreUtils.filterActive(storeMaster.stores);
    return StoreUtils.toStoreInfoMap(activeStores);
  }

  // 2. フォールバック: デフォルト設定を読み込み（開発環境）
  console.log('ℹ️  Loading default store configuration from /config/stores.json');
  const defaultConfig = await loadDefaultStores();
  const activeStores = StoreUtils.filterActive(defaultConfig.stores);
  return StoreUtils.toStoreInfoMap(activeStores);
}

/**
 * 利用可能な店舗一覧を取得（同期版）
 *
 * 注意: 環境変数が設定されていない場合は空配列を返します。
 * 初期化時は loadStoreConfiguration() を使用してください。
 */
export function getAvailableStores(): Store[] {
  const storeMaster = loadStoreMasterFromEnv();

  if (storeMaster) {
    return StoreUtils.filterActive(storeMaster.stores);
  }

  // 同期的には取得できないため空配列
  return [];
}

/**
 * 利用可能な店舗一覧を取得（非同期版）
 */
export async function getAvailableStoresAsync(): Promise<Store[]> {
  // 環境変数から取得を試行
  const storeMaster = loadStoreMasterFromEnv();

  if (storeMaster) {
    console.log('✓ Loaded stores from REACT_APP_STORE_MASTER (production):', storeMaster.stores.length, 'stores');
    return StoreUtils.filterActive(storeMaster.stores);
  }

  // フォールバック: デフォルト設定（ローカル環境）
  console.log('ℹ️  Loading stores from /config/stores.json (local development)');
  const defaultConfig = await loadDefaultStores();
  console.log('✓ Loaded', defaultConfig.stores.length, 'stores from stores.json');
  return StoreUtils.filterActive(defaultConfig.stores);
}

/**
 * 店舗リスト（簡易版）を取得
 *
 * 後方互換性のため、既存のコードで使用されている形式に変換します。
 */
export async function getStoreList(): Promise<StoreListItem[]> {
  const stores = await getAvailableStoresAsync();
  return StoreUtils.toStoreList(stores);
}

/**
 * 特定の店舗情報を取得
 */
export async function getStoreInfo(storeId: string): Promise<StoreInfo | null> {
  const stores = await getAvailableStoresAsync();
  const store = StoreUtils.findById(stores, storeId);

  if (!store) {
    return null;
  }

  return { name: store.storeName };
}
