import { SurveyConfig } from '../types';

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
        "ratingOptions": ["良い", "普通", "改善が必要"]
      },
      {
        "category": "技術・仕上がり",
        "ratingOptions": ["良い", "普通", "改善が必要"]
      },
      {
        "category": "接客サービス",
        "ratingOptions": ["良い", "普通", "改善が必要"]
      },
      {
        "category": "メニュー料金",
        "ratingOptions": ["良い", "普通", "改善が必要"]
      },
      {
        "category": "総合満足度",
        "ratingOptions": ["良い", "普通", "改善が必要"]
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
      "key": "straightPerm",
      "label": "縮毛矯正",
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
    
    // 環境変数が設定されている場合はそちらを使用
    if (rawConfig) {
      try {
        const parsed = JSON.parse(rawConfig) as SurveyConfig;
        resolve(parsed);
      } catch (err) {
        console.error('Failed to parse REACT_APP_SURVEY_CONFIG:', err);
        // パース失敗時はローカルデータを使用
        console.info('Using local survey config instead.');
        resolve(localSurveyConfig);
      }
    } else {
      // 環境変数が未設定の場合はローカルデータを使用
      console.info('REACT_APP_SURVEY_CONFIG is not defined. Using local survey config for development.');
      resolve(localSurveyConfig);
    }
  });
}; 