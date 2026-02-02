import type {
  SurveyConfig,
  ServiceDefinition,
  ServiceKey
} from '../types';
import {
  getServiceKeys,
  getServiceDefinition,
  isValidServiceKey
} from '../types';

/**
 * 設定読み込みエラーを表すクラス
 */
export class SurveyConfigError extends Error {
  constructor(message: string, public readonly details?: string) {
    super(message);
    this.name = 'SurveyConfigError';
  }
}


/**
 * SSMパラメータをパースしてアンケート設定オブジェクトを返す関数
 * 設定が無効な場合はエラーをスローします
 */
export const getSurveyConfig = (): Promise<SurveyConfig> => {
  return new Promise((resolve, reject) => {
    const rawConfig = process.env.REACT_APP_SURVEY_CONFIG;

    // デバッグ: 環境変数の状況をログ出力
    console.log('=== Survey Config Debug Info ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REACT_APP_SURVEY_CONFIG defined:', !!rawConfig);
    console.log('REACT_APP_SURVEY_CONFIG length:', rawConfig ? rawConfig.length : 0);
    console.log('REACT_APP_SURVEY_CONFIG type:', typeof rawConfig);

    // 全ての環境変数をチェック
    const allReactAppVars = Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'));
    console.log('All REACT_APP_ environment variables:', allReactAppVars);

    if (rawConfig) {
      console.log('REACT_APP_SURVEY_CONFIG first 200 chars:', rawConfig.substring(0, 200) + '...');

      // 本番環境では全内容の出力を制限
      if (process.env.NODE_ENV === 'development') {
        console.log('REACT_APP_SURVEY_CONFIG full content:', rawConfig);
      } else {
        console.log('REACT_APP_SURVEY_CONFIG (production - content truncated for security)');
      }
    } else {
      console.warn('⚠️ REACT_APP_SURVEY_CONFIG is undefined, null, or empty string');
    }

    console.log('=== End Survey Config Debug ===');

    // 環境変数が設定されていない場合はエラー
    if (!rawConfig) {
      reject(new SurveyConfigError(
        'アンケート設定が読み込めません',
        'REACT_APP_SURVEY_CONFIG環境変数が設定されていません。S3からの設定読み込みに失敗した可能性があります。'
      ));
      return;
    }

    try {
      const parsed = JSON.parse(rawConfig) as SurveyConfig;

      // 設定形式であることを確認
      if (parsed.version === '2.0' && parsed.questionCards && parsed.questionFlow) {
        console.log('✓ Successfully parsed REACT_APP_SURVEY_CONFIG');
        console.log('Config version:', parsed.version);
        console.log('Question cards count:', parsed.questionCards.length);
        console.log('Customer types:', parsed.customerTypes);
        console.log('Using SSM-based survey config');
        resolve(parsed);
      } else {
        reject(new SurveyConfigError(
          'アンケート設定の形式が無効です',
          `必須フィールドが不足しています: version=${parsed.version}, questionCards=${!!parsed.questionCards}, questionFlow=${!!parsed.questionFlow}`
        ));
      }
    } catch (err) {
      console.error('Failed to parse REACT_APP_SURVEY_CONFIG:', err);
      console.error('Raw config that failed to parse:', rawConfig);
      reject(new SurveyConfigError(
        'アンケート設定のパースに失敗しました',
        err instanceof Error ? err.message : String(err)
      ));
    }
  });
};


// 動的サービス管理のためのヘルパー関数群

/**
 * 設定からサービスキー一覧を取得
 */
export const getAvailableServiceKeys = async (): Promise<ServiceKey[]> => {
  const config = await getSurveyConfig();
  return getServiceKeys(config.serviceDefinitions);
};

/**
 * 設定から特定のサービス定義を取得
 */
export const getServiceDefinitionByKey = async (key: ServiceKey): Promise<ServiceDefinition | undefined> => {
  const config = await getSurveyConfig();
  return getServiceDefinition(key, config.serviceDefinitions);
};

/**
 * サービスキーが有効かチェック
 */
export const validateServiceKey = async (key: string): Promise<boolean> => {
  const config = await getSurveyConfig();
  return isValidServiceKey(key, config.serviceDefinitions);
};

/**
 * サービス定義をラベルでソートして取得
 */
export const getServiceDefinitionsSorted = async (): Promise<ServiceDefinition[]> => {
  const config = await getSurveyConfig();
  return config.serviceDefinitions.sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * サービスキーと人間が読みやすいラベルのマッピングを取得
 */
export const getServiceKeyLabelMap = async (): Promise<Record<ServiceKey, string>> => {
  const config = await getSurveyConfig();
  return config.serviceDefinitions.reduce(
    (map, service) => {
      map[service.key] = service.label;
      return map;
    },
    {} as Record<ServiceKey, string>
  );
};

/**
 * 新しいサービス定義の検証
 */
export const validateServiceDefinition = (service: ServiceDefinition): boolean => {
  return !!(
    service.key &&
    service.label &&
    Array.isArray(service.satisfiedOptions) &&
    service.satisfiedOptions.length > 0 &&
    Array.isArray(service.improvementOptions) &&
    service.improvementOptions.length > 0
  );
};

/**
 * デバッグ用：利用可能なサービス情報を表示
 */
export const logAvailableServices = async (): Promise<void> => {
  try {
    const config = await getSurveyConfig();
    console.log('=== Available Services ===');
    console.log(`Config version: ${config.version}`);
    console.log(`Total services: ${config.serviceDefinitions.length}`);
    console.log(`Total question cards: ${config.questionCards.length}`);
    
    config.serviceDefinitions.forEach((service, index) => {
      console.log(`${index + 1}. ${service.key} (${service.label})`);
      console.log(`   満足点選択肢: ${service.satisfiedOptions.length}個`);
      console.log(`   改善点選択肢: ${service.improvementOptions.length}個`);
    });
    
    console.log('=== Service Keys Only ===');
    console.log(getServiceKeys(config.serviceDefinitions));
    console.log('============================');
  } catch (error) {
    console.error('Failed to log available services:', error);
  }
}; 