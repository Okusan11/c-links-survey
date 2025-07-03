import { SurveyConfig, ServiceDefinition, ServiceKey, getServiceKeys, getServiceDefinition, isValidServiceKey } from '../types';

// ローカル開発用のモックデータ
export const localSurveyConfig: SurveyConfig = {
  "newCustomerOptions": {
    "heardFromOptions": [
      "Google検索",
      "当サロンのホームページ",
      "SNS(インスタグラム、Xなど)",
      "ホットペッパービューティーなどの検索サイト",
      "ご友人・知人からのご紹介",
      "広告(チラシ・看板など)",
      "その他"
    ],
    "impressionEvaluations": [
      {
        "category": "店舗の雰囲気",
        "ratingOptions": ["良い", "普通", "要改善"]
      },
      {
        "category": "技術・仕上がり",
        "ratingOptions": ["良い", "普通", "要改善"]
      },
      {
        "category": "接客サービス",
        "ratingOptions": ["良い", "普通", "要改善"]
      },
      {
        "category": "メニュー料金",
        "ratingOptions": ["良い", "普通", "要改善"]
      },
      {
        "category": "総合満足度",
        "ratingOptions": ["良い", "普通", "要改善"]
      }
    ],
    "willReturnOptions": [
      "ぜひ行きたい",
      "どちらとも言えない",
      "行きたくない"
    ]
  },
  "repeaterOptions": {
    "satisfactionOptions": [
      "良くなった",
      "同じ",
      "悪くなった"
    ]
  },
  "serviceDefinitions": [
    {
      "key": "cut",
      "label": "カット",
      "satisfiedOptions": [
        "理想のスタイルに仕上がり、細かな要望もくみ取ってくれた",
        "スタイリングやホームケアのアドバイスをもらえた",
        "スタイリストの細やかな気配りが感じられた",
        "特になし"
      ],
      "improvementOptions": [
        "待ち時間を短くしてほしい",
        "予約を取りやすくしてほしい",
        "スタイリングなどのアドバイスを詳しくしてほしい",
        "特になし"
      ]
    },
    {
      "key": "color",
      "label": "カラー",
      "satisfiedOptions": [
        "事前カウンセリングで希望した色味で満足できた",
        "髪への負担を考慮された施術で安心できた",
        "色落ちやアフターケアに関する説明が分かりやすかった",
        "特になし"
      ],
      "improvementOptions": [
        "カラーのデザインをもっと提案してほしい",
        "カラー持ちが良くなるアドバイスがほしい",
        "カラー後のケアメニューを充実させてほしい",
        "特になし"
      ]
    },
    {
      "key": "perm",
      "label": "パーマ",
      "satisfiedOptions": [
        "イメージ通りに仕上がった",
        "髪質やダメージに合わせて提案してもらい安心できた",
        "スタイリングの仕方を丁寧にアドバイスしてくれた",
        "特になし"
      ],
      "improvementOptions": [
        "パーマを長持ちさせる方法をもっと詳しく教えてほしい",
        "パーマ後のトリートメントケアの選択肢を増やしてほしい",
        "ダメージをもっと抑えられるように工夫してほしい",
        "特になし"
      ]
    },
    {
      "key": "straightPerm",
      "label": "ストレート",
      "satisfiedOptions": [
        "髪が扱いやすくなり朝のスタイリングが楽になった",
        "ダメージを最小限に抑えてくれてツヤのある仕上がりになった",
        "スタイリストの知識、技術が豊富で安心できた",
        "特になし"
      ],
      "improvementOptions": [
        "ホームケアの方法をもっと詳しくアドバイスしてほしい",
        "まっすぐになりすぎないストレートに調整してほしい",
        "料金が高めなのでキャンペーンを検討してほしい",
        "特になし"
      ]
    },
    {
      "key": "treatment",
      "label": "トリートメント",
      "satisfiedOptions": [
        "手触りが良くなり、スタイリングがしやすくなった",
        "パサつきや、枝毛が改善して見た目も良くなった",
        "香りが良く、リラックスできた",
        "特になし"
      ],
      "improvementOptions": [
        "もう少し価格を抑えたメニューがあると嬉しい",
        "効果が長持ちするような追加メニューを提案してほしい",
        "髪質や悩みに合わせたメニューの種類を増やしてほしい",
        "特になし"
      ]
    },
    {
      "key": "headSpa",
      "label": "ヘッドスパ",
      "satisfiedOptions": [
        "気持ちよくリラックスでき、ストレス解消できた",
        "頭皮と状態などをみて、アドバイスをもらえた",
        "血行が良くなり、コリなどがほぐれて髪にもハリコシが出た",
        "特になし"
      ],
      "improvementOptions": [
        "照明などもっとリラックスできる空間に工夫してほしい",
        "施術時間や料金を分かりやすくしてほしい",
        "音楽やアロマなどよりリラックスゼーションを出来るようにしてほしい",
        "特になし"
      ]
    },
    {
      "key": "hairSet",
      "label": "ヘアセット",
      "satisfiedOptions": [
        "希望通りのヘアアレンジをしてもらえた",
        "短時間で仕上げてくれて、予定通り出発できた",
        "崩れにくく、長時間きれいな状態を保てた",
        "特になし"
      ],
      "improvementOptions": [
        "アレンジのバリエーションをもっと提案してほしい",
        "仕上がりのイメージ共有をより細かくしてほしい",
        "料金プランを分かりやすくしてほしい",
        "特になし"
      ]
    }
  ]
};

/**
 * SSMパラメータをパースしてSurveyConfigオブジェクトを返す関数
 */
export const getSurveyConfig = (): Promise<SurveyConfig> => {
  return new Promise((resolve) => {
    const rawConfig = process.env.REACT_APP_SURVEY_CONFIG;
    
    // デバッグ: 環境変数の状況をログ出力
    console.log('=== Survey Config Debug Info ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REACT_APP_SURVEY_CONFIG defined:', !!rawConfig);
    console.log('REACT_APP_SURVEY_CONFIG length:', rawConfig ? rawConfig.length : 0);
    
    if (rawConfig) {
      console.log('REACT_APP_SURVEY_CONFIG first 200 chars:', rawConfig.substring(0, 200) + '...');
      console.log('REACT_APP_SURVEY_CONFIG full content:', rawConfig);
    }
    
    // 環境変数が設定されている場合はそちらを使用
    if (rawConfig) {
      try {
        const parsed = JSON.parse(rawConfig) as SurveyConfig;
        console.log('✓ Successfully parsed REACT_APP_SURVEY_CONFIG');
        console.log('Parsed config keys:', Object.keys(parsed));
        console.log('Using SSM-based survey config');
        resolve(parsed);
      } catch (err) {
        console.error('Failed to parse REACT_APP_SURVEY_CONFIG:', err);
        console.error('Raw config that failed to parse:', rawConfig);
        // パース失敗時はローカルデータを使用
        console.info('Using local survey config instead.');
        resolve(localSurveyConfig);
      }
    } else {
      // 環境変数が未設定の場合はローカルデータを使用
      console.info('REACT_APP_SURVEY_CONFIG is not defined. Using local survey config for development.');
      resolve(localSurveyConfig);
    }
    
    console.log('=== End Survey Config Debug ===');
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
    console.log(`Total services: ${config.serviceDefinitions.length}`);
    
    config.serviceDefinitions.forEach((service, index) => {
      console.log(`${index + 1}. ${service.key} (${service.label})`);
      console.log(`   満足点選択肢: ${service.satisfiedOptions.length}個`);
      console.log(`   改善点選択肢: ${service.improvementOptions.length}個`);
    });
    
    console.log('=== Service Keys Only ===');
    console.log(getServiceKeys(config.serviceDefinitions));
    console.log('=========================');
  } catch (error) {
    console.error('Failed to log available services:', error);
  }
}; 