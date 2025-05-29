// サービスキーの型
export type ServiceKey = 'cut' | 'color' | 'perm' | 'straightPerm' | 'treatment' | 'headSpa' | 'hairSet';

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

// 訪問日の型
export interface VisitDate {
  year: string;
  month: string;
  day: string;
}

// フォームのエラー型
export interface FormErrors {
  heardFrom: boolean;
  visitDate: boolean;
  usagePurpose: boolean;
  satisfiedPoints: boolean;
  improvementPoints: boolean;
  otherHeardFrom: boolean;
  isNewCustomer: boolean;
} 