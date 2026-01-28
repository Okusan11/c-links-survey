/**
 * C-Links 店舗マスター 共通型定義
 *
 * このファイルは全アプリケーションで共有される店舗情報の型定義です。
 * Note: Create React Appの制限により、shared/types/store.tsからコピー
 */

/**
 * 店舗ステータス
 */
export type StoreStatus = 'active' | 'inactive' | 'coming-soon' | 'closed';

/**
 * 地域
 */
export type Region = 'tokyo' | 'osaka' | 'nagoya' | 'fukuoka';

/**
 * サービス種別
 */
export type ServiceType = 'cut' | 'color' | 'perm' | 'treatment' | 'head-spa' | 'styling';

/**
 * 営業時間
 */
export interface BusinessHours {
  weekday: string;  // "10:00-20:00"
  weekend: string;  // "10:00-19:00"
}

/**
 * 店舗メタデータ
 */
export interface StoreMetadata {
  openDate?: string;          // "2020-01-01"
  phoneNumber?: string;       // "03-1234-5678"
  address?: string;           // "東京都中央区銀座..."
  businessHours?: BusinessHours;
  [key: string]: unknown;     // 拡張可能
}

/**
 * 店舗情報（完全版）
 */
export interface Store {
  storeId: string;            // "ginza" (必須)
  storeName: string;          // "銀座店" (必須)
  displayName?: string;       // "affi-t 銀座店" (オプション)
  region?: Region;            // "tokyo" (オプション - survey-dashboardで設定)
  status?: StoreStatus;       // "active" (オプション - survey-dashboardで設定)
  services?: ServiceType[];   // ["cut", "color", "perm"] (オプション - survey-dashboardで設定)
  metadata?: StoreMetadata;   // 店舗メタデータ (オプション - survey-dashboardで設定)
}

/**
 * 店舗マスター設定
 */
export interface StoreMasterConfig {
  version: string;            // "1.0.0"
  lastUpdated?: string;       // "2025-01-01T00:00:00Z"
  stores: Store[];
}

/**
 * 店舗情報（簡易版 - 後方互換性用）
 */
export interface StoreInfo {
  name: string;               // "銀座店"
}

/**
 * 店舗リストアイテム（ID + 名前のみ）
 */
export interface StoreListItem {
  id: string;                 // "ginza"
  name: string;               // "銀座店"
}

/**
 * レガシーフォーマット変換ユーティリティ
 */
export class StoreUtils {
  /**
   * Store[] → Record<string, StoreInfo> 変換
   * survey-dashboard-appの既存コードとの互換性のため
   */
  static toStoreInfoMap(stores: Store[]): Record<string, StoreInfo> {
    return stores.reduce((acc, store) => {
      acc[store.storeId] = { name: store.storeName };
      return acc;
    }, {} as Record<string, StoreInfo>);
  }

  /**
   * Store[] → StoreListItem[] 変換
   * SSMパラメータの簡易版フォーマット用
   */
  static toStoreList(stores: Store[]): StoreListItem[] {
    return stores.map(store => ({
      id: store.storeId,
      name: store.storeName
    }));
  }

  /**
   * StoreListItem[] → Store[] 変換（簡易版）
   * SSMから取得したデータを完全版に変換
   */
  static fromStoreList(items: StoreListItem[]): Store[] {
    return items.map(item => ({
      storeId: item.id,
      storeName: item.name
    }));
  }

  /**
   * アクティブな店舗のみフィルタ
   * statusが未設定の場合は、その店舗を含める（デフォルトでアクティブとみなす）
   */
  static filterActive(stores: Store[]): Store[] {
    return stores.filter(store => !store.status || store.status === 'active');
  }

  /**
   * 店舗IDで検索
   */
  static findById(stores: Store[], storeId: string): Store | undefined {
    return stores.find(store => store.storeId === storeId);
  }

  /**
   * 地域でフィルタ
   */
  static filterByRegion(stores: Store[], region: Region): Store[] {
    return stores.filter(store => store.region === region);
  }

  /**
   * サービスでフィルタ
   */
  static filterByService(stores: Store[], service: ServiceType): Store[] {
    return stores.filter(store =>
      store.services && store.services.includes(service)
    );
  }
}
