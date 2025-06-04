// サービスキーの型 - 動的に推論されるように変更
export type ServiceKey = string;  // より柔軟に

// サービスごとの定義
export interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  satisfiedOptions: string[];
  improvementOptions: string[];
}

// 印象評価のカテゴリと評価オプション
export interface ImpressionEvaluation {
  category: string;
  ratingOptions: string[];
}

// 新規のお客様向けアンケートの選択肢
export interface NewCustomerOptions {
  heardFromOptions: string[]; // どこで知ったか
  impressionEvaluations: ImpressionEvaluation[]; // 印象評価（カテゴリごと）
  willReturnOptions: string[]; // また来たいと思うか
}

// リピーター向けアンケートの選択肢
export interface RepeaterOptions {
  satisfactionOptions: string[]; // 前回と比べた満足度
}

// SSMに格納したJSON全体を受け取るための型
export interface SurveyConfig {
  serviceDefinitions: ServiceDefinition[];
  newCustomerOptions: NewCustomerOptions;
  repeaterOptions: RepeaterOptions;
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

// 訪問日の型
export interface VisitDate {
  year: string;
  month: string;
  day: string;
}

// フォームのエラー型 - 動的サービスキーに対応
export interface FormErrors {
  heardFrom: boolean;
  visitDate: boolean;
  usagePurpose: boolean;
  satisfiedPoints: boolean;
  improvementPoints: boolean;
  otherHeardFrom: boolean;
  isNewCustomer: boolean;
  // 動的サービスエラーのための汎用フィールド
  [key: string]: boolean;
} 