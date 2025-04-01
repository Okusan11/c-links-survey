// サービスキーの型
export type ServiceKey = 'cut' | 'color' | 'perm' | 'straightPerm' | 'treatment' | 'headSpa' | 'hairSet';

// サービスごとの定義
export interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  satisfiedOptions: string[];
  improvementOptions: string[];
}

// SSMに格納したJSON全体を受け取るための型
export interface SurveyConfig {
  heardFromOptions: string[];
  serviceDefinitions: ServiceDefinition[];
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