// サービスキーの型 - 動的に推論されるように変更
export type ServiceKey = string;  // より柔軟に

// サービスごとの定義
export interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  satisfiedOptions: string[];
  improvementOptions: string[];
}

// ============================================
// 新しい柔軟な質問カードシステム（V2）
// ============================================

// 質問カードの種類
export type QuestionCardType = 
  | 'single-choice'      // 単一選択（ラジオボタン）
  | 'multiple-choice'    // 複数選択（チェックボックス）
  | 'rating-scale'       // 印象評価/レーティング
  | 'text-input'         // 自由記述
  | 'service-evaluation' // サービス別評価
  | 'service-usage'      // サービス利用選択
  | 'date-time'          // 日時選択
  | 'customer-type';     // 顧客タイプ選択（特別な単一選択）

// 選択肢の定義
export interface ChoiceOption {
  value: string;
  label: string;
  icon?: string;  // アイコン名（Lucide Reactのアイコン名）
  description?: string;
  isOther?: boolean;  // 「その他」選択肢フラグ
}

// レーティングカテゴリの定義
export interface RatingCategory {
  category: string;
  ratingOptions: string[];
}

// 条件表示の設定
export interface ConditionalDisplay {
  dependsOn: string;  // 依存する質問のID
  showWhen: string | string[];  // 表示条件となる値
}

// カードタイプ別のオプション設定
export interface SingleChoiceOptions {
  choices: ChoiceOption[];
  variant?: 'default' | 'enhanced';
  otherLabel?: string;  // 「その他」選択肢のテキスト入力ラベル
  otherPlaceholder?: string;  // 「その他」選択肢のプレースホルダー
}

export interface MultipleChoiceOptions {
  choices: ChoiceOption[];
  maxSelections?: number;  // 最大選択数制限
  otherLabel?: string;  // 「その他」選択肢のテキスト入力ラベル
  otherPlaceholder?: string;  // 「その他」選択肢のプレースホルダー
}

// レーティングスケールの種類
export type RatingScaleType = '3-point' | '5-point';

// レーティングスケールのプリセット設定
export interface RatingScalePreset {
  type: RatingScaleType;
  options: Array<{
    value: string;
    label: string;
    emoji: string;
    color: {
      selected: string;
      unselected: string;
      hover: string;
    };
  }>;
}

export interface RatingScaleOptions {
  categories: RatingCategory[];
  preset?: RatingScaleType; // プリセットタイプ（3段階 or 5段階）
}

export interface TextInputOptions {
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
}

export interface ServiceEvaluationOptions {
  serviceKey: ServiceKey;
  evaluationType: 'satisfaction' | 'improvement' | 'both';
}

export interface ServiceUsageOptions {
  availableServices: string[]; // 利用可能なサービス一覧
}

export interface DateTimeOptions {
  format: 'date' | 'time' | 'datetime';
  minDate?: string;
  maxDate?: string;
}

export interface CustomerTypeOptions {
  types: Array<{
    value: string; // 動的な値に対応（将来的に年齢層、性別、会員ランクなどにも対応可能）
    label: string;
    icon: string;
  }>;
}

// 「その他」選択肢のレスポンス型
export interface SingleChoiceResponse {
  value: string;
  otherText?: string;  // 「その他」が選択された場合のテキスト
}

export interface MultipleChoiceResponse {
  values: string[];
  otherText?: string;  // 「その他」が選択された場合のテキスト
}

// すべてのオプション型のユニオン
export type QuestionOptions = 
  | SingleChoiceOptions
  | MultipleChoiceOptions  
  | RatingScaleOptions
  | TextInputOptions
  | ServiceEvaluationOptions
  | ServiceUsageOptions
  | DateTimeOptions
  | CustomerTypeOptions;

// 質問カード定義
export interface QuestionCard {
  id: string;
  type: QuestionCardType;
  title: string;
  description?: string;
  required: boolean;
  conditionalDisplay?: ConditionalDisplay;
  options: QuestionOptions;
  validation?: {
    minSelections?: number;
    maxSelections?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;  // 正規表現パターン
  };
}


// ============================================
// 新しい柔軟なアンケート設定構造（V2）
// ============================================

// 顧客タイプの定義（動的に対応）
export type CustomerType = string; // 動的な顧客タイプに対応
// 後方互換性のため、従来の値も使用可能
export type LegacyCustomerType = 'new' | 'second-visit' | 'repeater';

// 質問フローの定義（顧客タイプごとの質問順序）
// 動的な顧客タイプキーに対応（将来的に異なる分類方法にも対応可能）
export type QuestionFlow = Record<string, string[]>; // 動的な顧客タイプキーに対応

// アンケートテンプレートの定義
export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;  // 例: 'beauty-salon', 'restaurant', 'retail'
  questionCards: QuestionCard[];
  questionFlow: QuestionFlow;
}

// アンケート設定構造
export interface SurveyConfig {
  version: '2.0';
  meta: {
    createdAt: string;
    updatedAt: string;
    title: string;
    description?: string;
  };
  questionMode?: 'customer-type-based' | 'unified'; // 質問モード（デフォルト: 'customer-type-based'）
  customerTypes: CustomerType[];
  questionFlow: QuestionFlow;
  questionCards: QuestionCard[];
  serviceDefinitions: ServiceDefinition[];  // 後方互換性のため保持
  templates?: {
    [templateId: string]: SurveyTemplate;
  };
  settings?: {
    allowSkipOptional?: boolean;
    showProgress?: boolean;
    theme?: {
      primaryColor?: string;
      accentColor?: string;
      variant?: 'default' | 'enhanced';
    };
  };
}

// 設定の型ガード
export function isSurveyConfig(config: SurveyConfig): config is SurveyConfig {
  // questionModeはオプショナルなので、versionとquestionCards、questionFlowがあれば有効
  return 'version' in config && config.version === '2.0' && 'questionCards' in config && 'questionFlow' in config;
}

// 型安全性を保ちながら動的にServiceKeyを扱うためのユーティリティ型
export type InferServiceKeys<T extends SurveyConfig> = T['serviceDefinitions'][number]['key'];

// ServiceDefinitionから特定のサービスキーの型を推論
export type ServiceDefinitionByKey<
  T extends SurveyConfig, 
  K extends InferServiceKeys<T>
> = Extract<T['serviceDefinitions'][number], { key: K }>;

// 実行時の型ガード関数
export function isValidServiceKey(
  key: string, 
  serviceDefinitions: ServiceDefinition[]
): key is ServiceKey {
  return serviceDefinitions.some(service => service.key === key);
}

// サービスキーの配列を取得するヘルパー関数
export function getServiceKeys(serviceDefinitions: ServiceDefinition[]): ServiceKey[] {
  return serviceDefinitions.map(service => service.key);
}

// 特定のサービス定義を安全に取得するヘルパー関数
export function getServiceDefinition(
  key: ServiceKey, 
  serviceDefinitions: ServiceDefinition[]
): ServiceDefinition | undefined {
  return serviceDefinitions.find(service => service.key === key);
}

// フォームのエラー型 - 動的サービスキーに対応
export interface FormErrors {
  heardFrom: boolean;
  usagePurpose: boolean;
  satisfiedPoints: boolean;
  improvementPoints: boolean;
  otherHeardFrom: boolean;
  isNewCustomer: boolean;
  // 動的サービスエラーのための汎用フィールド
  [key: string]: boolean;
} 