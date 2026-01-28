import type { 
  SurveyConfig, 
  ServiceDefinition, 
  ServiceKey, 
  QuestionCard,
  CustomerType
} from '../types';
import { 
  getServiceKeys, 
  getServiceDefinition, 
  isValidServiceKey, 
  isSurveyConfig
} from '../types';

/**
 * デフォルト設定を生成する関数
 */
function getDefaultConfig(): SurveyConfig {
  const currentTime = new Date().toISOString();
  
  return {
    version: '2.0',
    meta: {
      createdAt: currentTime,
      updatedAt: currentTime,
      title: '顧客満足度アンケート',
      description: '当サロンのサービス向上のためのアンケートです'
    },
    questionMode: 'customer-type-based', // デフォルトは顧客タイプ別
    customerTypes: ['new', 'second-visit', 'repeater'],
    questionFlow: {
      'new': ['heard-from', 'impressions', 'will-return'],
      'second-visit': ['return-reasons', 'satisfaction-second', 'service-usage', 'service-cut-evaluation', 'service-color-evaluation', 'service-perm-evaluation'],
      'repeater': ['satisfaction-repeater', 'service-usage', 'service-cut-evaluation', 'service-color-evaluation', 'service-perm-evaluation']
    },
    questionCards: [
      {
        id: 'customer-type',
        type: 'customer-type',
        title: 'ご来店いただいた回数をお選びください',
        description: 'お客様の来店回数に応じた質問をご用意しております',
        required: true,
        options: {
          types: [
            { value: 'new', label: '初回ご利用のお客様', icon: 'UserPlus' },
            { value: 'second-visit', label: '2回目ご利用のお客様', icon: 'Repeat' },
            { value: 'repeater', label: '3回以上ご利用のお客様', icon: 'Crown' }
          ]
        }
      },
      {
        id: 'heard-from',
        type: 'multiple-choice',
        title: '当サロンをどこで知りましたか？',
        description: '該当するものをすべて選択してください',
        required: true,
        conditionalDisplay: {
          dependsOn: 'customer-type',
          showWhen: 'new'
        },
        options: {
          choices: [
            { value: 'Google検索', label: 'Google検索' },
            { value: '当サロンのホームページ', label: '当サロンのホームページ' },
            { value: 'SNS(インスタグラム、Xなど)', label: 'SNS(インスタグラム、Xなど)' },
            { value: 'ホットペッパービューティーなどの検索サイト', label: 'ホットペッパービューティーなどの検索サイト' },
            { value: 'ご友人・知人からのご紹介', label: 'ご友人・知人からのご紹介' },
            { value: '広告(チラシ・看板など)', label: '広告(チラシ・看板など)' },
            { value: 'その他', label: 'その他' }
          ]
        }
      },
      {
        id: 'impressions',
        type: 'rating-scale',
        title: '当サロンの印象をお聞かせください',
        description: '各項目について評価をお選びください',
        required: true,
        conditionalDisplay: {
          dependsOn: 'customer-type',
          showWhen: 'new'
        },
        options: {
          preset: '3-point',
          categories: [
            { category: '店舗の雰囲気', ratingOptions: ['良い', '普通', '要改善'] },
            { category: '技術・仕上がり', ratingOptions: ['良い', '普通', '要改善'] },
            { category: '接客サービス', ratingOptions: ['良い', '普通', '要改善'] },
            { category: 'メニュー料金', ratingOptions: ['良い', '普通', '要改善'] },
            { category: '総合満足度', ratingOptions: ['良い', '普通', '要改善'] }
          ]
        }
      },
      {
        id: 'will-return',
        type: 'single-choice',
        title: 'また当サロンを利用したいと思いますか？',
        description: '率直なご意見をお聞かせください',
        required: true,
        conditionalDisplay: {
          dependsOn: 'customer-type',
          showWhen: 'new'
        },
        options: {
          choices: [
            { value: 'ぜひ行きたい', label: 'ぜひ行きたい' },
            { value: 'どちらとも言えない', label: 'どちらとも言えない' },
            { value: '行きたくない', label: '行きたくない' }
          ]
        }
      },
      {
        id: 'satisfaction-repeater',
        type: 'single-choice',
        title: '前回と比べて、満足度はいかがでしたか？',
        description: '前回と比較してお答えください',
        required: true,
        conditionalDisplay: {
          dependsOn: 'customer-type',
          showWhen: 'repeater'
        },
        options: {
          choices: [
            { value: '良くなった', label: '良くなった' },
            { value: '同じ', label: '同じ' },
            { value: '悪くなった', label: '悪くなった' },
            { value: 'その他', label: 'その他' }
          ]
        }
      },
      {
        id: 'return-reasons',
        type: 'multiple-choice',
        title: '再度ご来店いただいた理由は何ですか？',
        description: '該当するものをすべて選択してください',
        required: true,
        conditionalDisplay: {
          dependsOn: 'customer-type',
          showWhen: 'second-visit'
        },
        options: {
          choices: [
            { value: '前回のサービスに満足したため', label: '前回のサービスに満足したため' },
            { value: 'スタッフの対応が良かったため', label: 'スタッフの対応が良かったため' },
            { value: '技術力が高いと感じたため', label: '技術力が高いと感じたため' },
            { value: '立地・アクセスが良いため', label: '立地・アクセスが良いため' },
            { value: '料金が適正だと感じたため', label: '料金が適正だと感じたため' },
            { value: '友人・知人に勧められたため', label: '友人・知人に勧められたため' },
            { value: 'その他', label: 'その他' }
          ]
        }
      },
      {
        id: 'satisfaction-second',
        type: 'single-choice',
        title: '初回来店時と比べて、満足度はいかがでしたか？',
        description: '前回と比較してお答えください',
        required: true,
        conditionalDisplay: {
          dependsOn: 'customer-type',
          showWhen: 'second-visit'
        },
        options: {
          choices: [
            { value: 'とても満足', label: 'とても満足' },
            { value: '満足', label: '満足' },
            { value: '普通', label: '普通' },
            { value: 'やや不満', label: 'やや不満' },
            { value: '不満', label: '不満' },
            { value: 'その他', label: 'その他' }
          ]
        }
      },
      {
        id: 'service-usage',
        type: 'service-usage',
        title: '今回利用されたサービスを選択してください',
        description: '該当するサービスをすべて選択してください',
        required: true,
        conditionalDisplay: {
          dependsOn: 'customer-type',
          showWhen: ['second-visit', 'repeater']
        },
        options: {
          availableServices: ['cut', 'color', 'perm']
        }
      },
      {
        id: 'service-cut-evaluation',
        type: 'service-evaluation',
        title: 'カットサービスについて評価をお聞かせください',
        description: '今回のカットサービスについてお答えください',
        required: false,
        conditionalDisplay: {
          dependsOn: 'service-usage',
          showWhen: 'cut'
        },
        options: {
          serviceKey: 'cut',
          evaluationType: 'both'
        }
      },
      {
        id: 'service-color-evaluation',
        type: 'service-evaluation',
        title: 'カラーサービスについて評価をお聞かせください',
        description: '今回のカラーサービスについてお答えください',
        required: false,
        conditionalDisplay: {
          dependsOn: 'service-usage',
          showWhen: 'color'
        },
        options: {
          serviceKey: 'color',
          evaluationType: 'both'
        }
      },
      {
        id: 'service-perm-evaluation',
        type: 'service-evaluation',
        title: 'パーマサービスについて評価をお聞かせください',
        description: '今回のパーマサービスについてお答えください',
        required: false,
        conditionalDisplay: {
          dependsOn: 'service-usage',
          showWhen: 'perm'
        },
        options: {
          serviceKey: 'perm',
          evaluationType: 'both'
        }
      }
    ],
    serviceDefinitions: [
      {
        key: "cut",
        label: "カット",
        satisfiedOptions: [
          "理想のスタイルに仕上がり、細かな要望もくみ取ってくれた",
          "スタイリングやホームケアのアドバイスをもらえた",
          "スタイリストの細やかな気配りが感じられた",
          "特になし",
          "その他"
        ],
        improvementOptions: [
          "待ち時間を短くしてほしい",
          "予約を取りやすくしてほしい",
          "スタイリングなどのアドバイスを詳しくしてほしい",
          "特になし",
          "その他"
        ]
      },
      {
        key: "color",
        label: "カラー",
        satisfiedOptions: [
          "事前カウンセリングで希望した色味で満足できた",
          "髪への負担を考慮された施術で安心できた",
          "色落ちやアフターケアに関する説明が分かりやすかった",
          "特になし",
          "その他"
        ],
        improvementOptions: [
          "カラーのデザインをもっと提案してほしい",
          "カラー持ちが良くなるアドバイスがほしい",
          "カラー後のケアメニューを充実させてほしい",
          "特になし",
          "その他"
        ]
      },
      {
        key: "perm",
        label: "パーマ",
        satisfiedOptions: [
          "イメージ通りに仕上がった",
          "髪質やダメージに合わせて提案してもらい安心できた",
          "スタイリングの仕方を丁寧にアドバイスしてくれた",
          "特になし",
          "その他"
        ],
        improvementOptions: [
          "パーマを長持ちさせる方法をもっと詳しく教えてほしい",
          "パーマ後のトリートメントケアの選択肢を増やしてほしい",
          "ダメージをもっと抑えられるように工夫してほしい",
          "特になし",
          "その他"
        ]
      }
    ],
    settings: {
      allowSkipOptional: false,
      showProgress: true,
      theme: {
        variant: 'enhanced'
      }
    }
  };
}


/**
 * SSMパラメータをパースしてアンケート設定オブジェクトを返す関数
 */
export const getSurveyConfig = (): Promise<SurveyConfig> => {
  return new Promise((resolve) => {
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
    
    // 環境変数が設定されている場合はそちらを使用
    if (rawConfig) {
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
          throw new Error('Invalid config format: missing version, questionCards, or questionFlow');
        }
      } catch (err) {
        console.error('Failed to parse REACT_APP_SURVEY_CONFIG:', err);
        console.error('Raw config that failed to parse:', rawConfig);
        // パース失敗時はローカル設定を使用
        console.info('Using local survey config instead.');
        resolve(getDefaultConfig());
      }
    } else {
      // 環境変数が未設定の場合はローカル設定を使用
      console.info('REACT_APP_SURVEY_CONFIG is not defined. Using local survey config for development.');
      resolve(getDefaultConfig());
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