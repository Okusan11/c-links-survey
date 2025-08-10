import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import RequiredBadge from './common/RequiredBadge';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import { ProgressBar } from './common/ProgressBar';
import SelectOption from './common/SelectOption';
import ErrorMessage from './common/ErrorMessage';

// 質問セクションコンポーネント
import NewCustomerQuestions from './survey-sections/NewCustomerQuestions';
import SecondVisitQuestions from './survey-sections/SecondVisitQuestions';
import RepeaterQuestions from './survey-sections/RepeaterQuestions';

// アイコン
import {
  UserPlus,
  Repeat,
  Users,
  Crown,
} from 'lucide-react';

// 型とローカル設定のインポート
import { getSurveyConfig } from '../config/surveyConfig';
import { SurveyConfig, ServiceKey } from '../types';

type CustomerType = 'new' | 'second-visit' | 'repeater' | '';

interface CustomerTypeOption {
  value: CustomerType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface ImpressionRating {
  category: string;
  rating: string;
}

// 統合されたエラー型
interface UnifiedFormErrors {
  // 顧客属性
  customerType: boolean;
  // 新規顧客
  heardFrom: boolean;
  impressions: boolean;
  willReturn: boolean;
  otherHeardFrom: boolean;
  otherWillReturn: boolean;
  // 2回目・リピーター共通
  satisfaction: boolean;
  usagePurpose: boolean;
  satisfiedPoints: boolean;
  improvementPoints: boolean;
  otherSatisfaction: boolean;
  otherSatisfiedPoints: boolean;
  otherImprovementPoints: boolean;
  serviceSatisfiedPoints: Partial<Record<ServiceKey, boolean>>;
  serviceImprovementPoints: Partial<Record<ServiceKey, boolean>>;
  // 2回目顧客専用
  returnReasons: boolean;
  otherReturnReasons: boolean;
}

const UnifiedSurvey: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // SSMパラメータ（JSON）をパースして保持
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

  useEffect(() => {
    getSurveyConfig().then(config => {
      setSurveyConfig(config);
    });
  }, []);

  // 顧客属性選択
  const [customerType, setCustomerType] = useState<CustomerType>(state?.customerType || '');

  // 新規顧客用の状態
  const [heardFrom, setHeardFrom] = useState<string[]>(state?.heardFrom || []);
  const [otherHeardFrom, setOtherHeardFrom] = useState<string>(state?.otherHeardFrom || '');
  const [impressionRatings, setImpressionRatings] = useState<ImpressionRating[]>(state?.impressionRatings || []);
  const [willReturn, setWillReturn] = useState<string>(state?.willReturn || '');
  const [otherWillReturn, setOtherWillReturn] = useState<string>(state?.otherWillReturn || '');

  // 2回目顧客用の状態
  const [returnReasons, setReturnReasons] = useState<string[]>(state?.returnReasons || []);
  const [otherReturnReasons, setOtherReturnReasons] = useState<string>(state?.otherReturnReasons || '');

  // 2回目・リピーター共通の状態
  const [satisfaction, setSatisfaction] = useState<string>(state?.satisfaction || '');
  const [otherSatisfaction, setOtherSatisfaction] = useState<string>(state?.otherSatisfaction || '');
  const [usagePurpose, setUsagePurpose] = useState<ServiceKey[]>(state?.usagePurpose || []);
  const [satisfiedPoints, setSatisfiedPoints] = useState<Partial<Record<ServiceKey, string[]>>>(state?.satisfiedPoints || {});
  const [improvementPoints, setImprovementPoints] = useState<Partial<Record<ServiceKey, string[]>>>(state?.improvementPoints || {});
  const [otherSatisfiedPoints, setOtherSatisfiedPoints] = useState<Partial<Record<ServiceKey, string>>>(state?.otherSatisfiedPoints || {});
  const [otherImprovementPoints, setOtherImprovementPoints] = useState<Partial<Record<ServiceKey, string>>>(state?.otherImprovementPoints || {});

  // GoogleAccountから戻ってきた場合のstate
  const [hasGoogleAccount, setHasGoogleAccount] = useState<string>(state?.hasGoogleAccount || '');
  const [feedback, setFeedback] = useState<string>(state?.feedback || '');

  // エラー状態
  const [errors, setErrors] = useState<UnifiedFormErrors>({
    customerType: false,
    heardFrom: false,
    impressions: false,
    willReturn: false,
    otherHeardFrom: false,
    otherWillReturn: false,
    returnReasons: false,
    otherReturnReasons: false,
    satisfaction: false,
    usagePurpose: false,
    satisfiedPoints: false,
    improvementPoints: false,
    otherSatisfaction: false,
    otherSatisfiedPoints: false,
    otherImprovementPoints: false,
    serviceSatisfiedPoints: {},
    serviceImprovementPoints: {},
  });

  const customerTypeOptions: CustomerTypeOption[] = [
    {
      value: 'new',
      label: '初回ご利用のお客様',
      description: '当サロンを初めてご利用いただくお客様',
      icon: <UserPlus className="h-6 w-6" />
    },
    {
      value: 'second-visit',
      label: '2回目ご利用のお客様',
      description: '当サロンを2回目ご利用いただくお客様',
      icon: <Repeat className="h-6 w-6" />
    },
    {
      value: 'repeater',
      label: '3回以上ご利用のお客様',
      description: '当サロンを3回以上ご利用いただいているお客様',
      icon: <Crown className="h-6 w-6" />
    }
  ];

  // 印象評価の更新関数（新規顧客用）
  const updateImpressionRating = (category: string, rating: string) => {
    setImpressionRatings(prev => {
      const existing = prev.find(item => item.category === category);
      if (existing) {
        return prev.map(item => 
          item.category === category ? { ...item, rating } : item
        );
      } else {
        return [...prev, { category, rating }];
      }
    });
  };

  // 印象評価の取得関数（新規顧客用）
  const getImpressionRating = (category: string): string | null => {
    const rating = impressionRatings.find(item => item.category === category);
    return rating ? rating.rating : null;
  };

  /**
   * フォーム送信
   */
  const handleNext = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }

    let newErrors: UnifiedFormErrors = {
      customerType: false,
      heardFrom: false,
      impressions: false,
      willReturn: false,
      otherHeardFrom: false,
      otherWillReturn: false,
      returnReasons: false,
      otherReturnReasons: false,
      satisfaction: false,
      usagePurpose: false,
      satisfiedPoints: false,
      improvementPoints: false,
      otherSatisfaction: false,
      otherSatisfiedPoints: false,
      otherImprovementPoints: false,
      serviceSatisfiedPoints: {},
      serviceImprovementPoints: {},
    };

    // 顧客属性が未選択の場合
    if (!customerType) {
      newErrors.customerType = true;
      setErrors(newErrors);
      setTimeout(() => {
        const element = document.querySelector('[data-question="customer-type"]');
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    // 顧客属性別のバリデーション
    if (customerType === 'new') {
      // 新規顧客のバリデーション
      if (heardFrom.length === 0) {
        newErrors.heardFrom = true;
      }
      if (surveyConfig?.newCustomerOptions.heardFromOptions.includes('その他') && heardFrom.includes('その他') && !otherHeardFrom) {
        newErrors.otherHeardFrom = true;
      }
      if (impressionRatings.length === 0) {
        newErrors.impressions = true;
      }
      if (!willReturn) {
        newErrors.willReturn = true;
      }
      if (surveyConfig?.newCustomerOptions.willReturnOptions.includes('その他') && willReturn === 'その他' && !otherWillReturn) {
        newErrors.otherWillReturn = true;
      }
    } else if (customerType === 'second-visit') {
      // 2回目顧客のバリデーション
      if (returnReasons.length === 0) {
        newErrors.returnReasons = true;
      }
      if (surveyConfig?.secondVisitOptions.returnReasons.includes('その他') && returnReasons.includes('その他') && !otherReturnReasons) {
        newErrors.otherReturnReasons = true;
      }
      if (!satisfaction) {
        newErrors.satisfaction = true;
      }
      if (surveyConfig?.secondVisitOptions.satisfactionOptions.includes('その他') && satisfaction === 'その他' && !otherSatisfaction) {
        newErrors.otherSatisfaction = true;
      }
      // サービス関連のバリデーション（共通）
      if (usagePurpose.length === 0) {
        newErrors.usagePurpose = true;
      }
      // サービス別チェック（共通ロジック）
      validateServicePoints(newErrors);
    } else if (customerType === 'repeater') {
      // リピーター顧客のバリデーション
      if (!satisfaction) {
        newErrors.satisfaction = true;
      }
      if (surveyConfig?.repeaterOptions.satisfactionOptions.includes('その他') && satisfaction === 'その他' && !otherSatisfaction) {
        newErrors.otherSatisfaction = true;
      }
      // サービス関連のバリデーション（共通）
      if (usagePurpose.length === 0) {
        newErrors.usagePurpose = true;
      }
      // サービス別チェック（共通ロジック）
      validateServicePoints(newErrors);
    }

    setErrors(newErrors);

    // エラーがあれば最初のエラー項目にスクロール
    if (hasErrors(newErrors)) {
      scrollToFirstError(newErrors);
      return;
    }

    // Google確認画面に遷移（顧客属性に応じたデータを渡す）
    const navigationState = buildNavigationState();
    navigate('/googleaccount', { state: navigationState });
  };

  // サービス関連のバリデーション（共通ロジック）
  const validateServicePoints = (newErrors: UnifiedFormErrors) => {
    if (Object.keys(satisfiedPoints).length === 0) {
      newErrors.satisfiedPoints = true;
    }
    if (Object.keys(improvementPoints).length === 0) {
      newErrors.improvementPoints = true;
    }

    // サービス別の満足点・改善点チェック
    for (const serviceKey of usagePurpose) {
      const serviceSatisfiedPoints = satisfiedPoints[serviceKey] || [];
      if (serviceSatisfiedPoints.length === 0) {
        newErrors.serviceSatisfiedPoints[serviceKey] = true;
      }

      const serviceImprovementPoints = improvementPoints[serviceKey] || [];
      if (serviceImprovementPoints.length === 0) {
        newErrors.serviceImprovementPoints[serviceKey] = true;
      }
    }

    // 「その他」選択時の自由記述欄チェック
    if (surveyConfig) {
      for (const serviceKey of usagePurpose) {
        const service = surveyConfig.serviceDefinitions.find(s => s.key === serviceKey);
        
        // 満足点の「その他」チェック
        if (service?.satisfiedOptions.includes('その他')) {
          const selectedPoints = satisfiedPoints[serviceKey] || [];
          if (selectedPoints.includes('その他') && !otherSatisfiedPoints[serviceKey]) {
            newErrors.otherSatisfiedPoints = true;
            break;
          }
        }

        // 改善点の「その他」チェック  
        if (service?.improvementOptions.includes('その他')) {
          const selectedPoints = improvementPoints[serviceKey] || [];
          if (selectedPoints.includes('その他') && !otherImprovementPoints[serviceKey]) {
            newErrors.otherImprovementPoints = true;
            break;
          }
        }
      }
    }
  };

  // エラーの存在チェック
  const hasErrors = (errors: UnifiedFormErrors): boolean => {
    const hasServiceErrors = Object.values(errors.serviceSatisfiedPoints).some(Boolean) || 
                             Object.values(errors.serviceImprovementPoints).some(Boolean);
    
    return Object.values(errors).some(error => 
      typeof error === 'boolean' ? error : false
    ) || hasServiceErrors;
  };

  // 最初のエラーにスクロール
  const scrollToFirstError = (errors: UnifiedFormErrors) => {
    setTimeout(() => {
      if (errors.customerType) {
        const element = document.querySelector('[data-question="customer-type"]');
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (customerType === 'new') {
        // 新規顧客のエラー優先順位
        if (errors.heardFrom || errors.otherHeardFrom) {
          const element = document.querySelector('[data-question="heard-from"]');
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (errors.impressions) {
          const element = document.querySelector('[data-question="impressions"]');
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (errors.willReturn || errors.otherWillReturn) {
          const element = document.querySelector('[data-question="will-return"]');
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (customerType === 'second-visit') {
        // 2回目顧客のエラー優先順位
        if (errors.returnReasons || errors.otherReturnReasons) {
          const element = document.querySelector('[data-question="return-reasons"]');
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (errors.satisfaction || errors.otherSatisfaction) {
          const element = document.querySelector('[data-question="satisfaction"]');
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (errors.usagePurpose) {
          const element = document.querySelector('[data-question="usage-purpose"]');
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          scrollToServiceError(errors);
        }
      } else if (customerType === 'repeater') {
        // リピーター顧客のエラー優先順位
        if (errors.satisfaction || errors.otherSatisfaction) {
          const element = document.querySelector('[data-question="satisfaction"]');
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (errors.usagePurpose) {
          const element = document.querySelector('[data-question="usage-purpose"]');
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          scrollToServiceError(errors);
        }
      }
    }, 100);
  };

  // サービスエラーへのスクロール
  const scrollToServiceError = (errors: UnifiedFormErrors) => {
    const hasServiceErrors = Object.values(errors.serviceSatisfiedPoints).some(Boolean) || 
                             Object.values(errors.serviceImprovementPoints).some(Boolean);
    if (hasServiceErrors) {
      const firstErrorServiceKey = Object.keys(errors.serviceSatisfiedPoints).find(key => errors.serviceSatisfiedPoints[key]) ||
                                  Object.keys(errors.serviceImprovementPoints).find(key => errors.serviceImprovementPoints[key]);
      if (firstErrorServiceKey) {
        const element = document.querySelector(`[data-service="${firstErrorServiceKey}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // ナビゲーション用の状態構築
  const buildNavigationState = () => {
    const baseState = {
      customerType,
      hasGoogleAccount,
      feedback,
    };

    if (customerType === 'new') {
      return {
        ...baseState,
        heardFrom,
        otherHeardFrom,
        impressionRatings,
        willReturn,
        otherWillReturn,
        isNewCustomer: true,
      };
    } else if (customerType === 'second-visit') {
      const usagePurposeLabels = usagePurpose.map((key) => {
        const service = surveyConfig?.serviceDefinitions.find((sd) => sd.key === key);
        return service ? service.label : key;
      });

      return {
        ...baseState,
        returnReasons,
        otherReturnReasons,
        satisfaction,
        otherSatisfaction,
        usagePurpose,
        usagePurposeLabels,
        satisfiedPoints,
        improvementPoints,
        otherSatisfiedPoints,
        otherImprovementPoints,
        isSecondVisit: true,
      };
    } else if (customerType === 'repeater') {
      const usagePurposeLabels = usagePurpose.map((key) => {
        const service = surveyConfig?.serviceDefinitions.find((sd) => sd.key === key);
        return service ? service.label : key;
      });

      return {
        ...baseState,
        satisfaction,
        otherSatisfaction,
        usagePurpose,
        usagePurposeLabels,
        satisfiedPoints,
        improvementPoints,
        otherSatisfiedPoints,
        otherImprovementPoints,
        isRepeater: true,
      };
    }

    return baseState;
  };

  if (!surveyConfig) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-destructive">アンケートを読み込んでいます...</p>
      </div>
    );
  }

  const subtitle = `当サロンをご利用いただきありがとうございます。お客様に最適なアンケートをご案内いたしますので、まずはご来店回数をお選びください。`;

  const progressSteps = [
    {
      title: "アンケート入力",
      description: "ご利用に関する質問"
    },
    {
      title: "Google確認",
      description: "アカウントの確認"
    },
    {
      title: "感想入力",
      description: "最終ステップ"
    }
  ];

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleNext();
    }}>
      <PageLayout
        title="アンケートにご協力ください"
        subtitle={subtitle}
      >
        <ProgressBar 
          currentStep={1} 
          totalSteps={3} 
          steps={progressSteps}
        />

        {/* 顧客属性選択 */}
        <QuestionBox data-question="customer-type">
          <div className="space-y-8">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 whitespace-normal text-wrap">
                  ご来店回数をお選びください
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-sm text-gray-500 mt-1">お客様の来店回数に応じた質問をご用意しております</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {customerTypeOptions.map((option) => (
                <SelectOption
                  key={option.value}
                  selected={customerType === option.value}
                  onClick={() => {
                    setCustomerType(option.value);
                    setErrors(prev => ({ ...prev, customerType: false }));
                  }}
                  icon={option.icon}
                  description={option.description}
                  variant="enhanced"
                >
                  {option.label}
                </SelectOption>
              ))}
            </div>
            
            {errors.customerType && (
              <ErrorMessage message="ご来店回数を選択してください" />
            )}
          </div>
        </QuestionBox>

        {/* 顧客属性に応じた質問セクション */}
        {customerType === 'new' && (
          <NewCustomerQuestions
            surveyConfig={surveyConfig}
            heardFrom={heardFrom}
            setHeardFrom={setHeardFrom}
            otherHeardFrom={otherHeardFrom}
            setOtherHeardFrom={setOtherHeardFrom}
            impressionRatings={impressionRatings}
            setImpressionRatings={setImpressionRatings}
            willReturn={willReturn}
            setWillReturn={setWillReturn}
            otherWillReturn={otherWillReturn}
            setOtherWillReturn={setOtherWillReturn}
            errors={{
              heardFrom: errors.heardFrom,
              impressions: errors.impressions,
              willReturn: errors.willReturn,
              otherHeardFrom: errors.otherHeardFrom,
              otherWillReturn: errors.otherWillReturn,
            }}
            updateImpressionRating={updateImpressionRating}
            getImpressionRating={getImpressionRating}
          />
        )}

        {customerType === 'second-visit' && (
          <SecondVisitQuestions
            surveyConfig={surveyConfig}
            returnReasons={returnReasons}
            setReturnReasons={setReturnReasons}
            otherReturnReasons={otherReturnReasons}
            setOtherReturnReasons={setOtherReturnReasons}
            satisfaction={satisfaction}
            setSatisfaction={setSatisfaction}
            otherSatisfaction={otherSatisfaction}
            setOtherSatisfaction={setOtherSatisfaction}
            usagePurpose={usagePurpose}
            setUsagePurpose={setUsagePurpose}
            satisfiedPoints={satisfiedPoints}
            setSatisfiedPoints={setSatisfiedPoints}
            improvementPoints={improvementPoints}
            setImprovementPoints={setImprovementPoints}
            otherSatisfiedPoints={otherSatisfiedPoints}
            setOtherSatisfiedPoints={setOtherSatisfiedPoints}
            otherImprovementPoints={otherImprovementPoints}
            setOtherImprovementPoints={setOtherImprovementPoints}
            errors={{
              returnReasons: errors.returnReasons,
              satisfaction: errors.satisfaction,
              usagePurpose: errors.usagePurpose,
              satisfiedPoints: errors.satisfiedPoints,
              improvementPoints: errors.improvementPoints,
              otherReturnReasons: errors.otherReturnReasons,
              otherSatisfaction: errors.otherSatisfaction,
              otherSatisfiedPoints: errors.otherSatisfiedPoints,
              otherImprovementPoints: errors.otherImprovementPoints,
              serviceSatisfiedPoints: errors.serviceSatisfiedPoints,
              serviceImprovementPoints: errors.serviceImprovementPoints,
            }}
          />
        )}

        {customerType === 'repeater' && (
          <RepeaterQuestions
            surveyConfig={surveyConfig}
            satisfaction={satisfaction}
            setSatisfaction={setSatisfaction}
            otherSatisfaction={otherSatisfaction}
            setOtherSatisfaction={setOtherSatisfaction}
            usagePurpose={usagePurpose}
            setUsagePurpose={setUsagePurpose}
            satisfiedPoints={satisfiedPoints}
            setSatisfiedPoints={setSatisfiedPoints}
            improvementPoints={improvementPoints}
            setImprovementPoints={setImprovementPoints}
            otherSatisfiedPoints={otherSatisfiedPoints}
            setOtherSatisfiedPoints={setOtherSatisfiedPoints}
            otherImprovementPoints={otherImprovementPoints}
            setOtherImprovementPoints={setOtherImprovementPoints}
            errors={{
              satisfaction: errors.satisfaction,
              usagePurpose: errors.usagePurpose,
              satisfiedPoints: errors.satisfiedPoints,
              improvementPoints: errors.improvementPoints,
              otherSatisfaction: errors.otherSatisfaction,
              otherSatisfiedPoints: errors.otherSatisfiedPoints,
              otherImprovementPoints: errors.otherImprovementPoints,
              serviceSatisfiedPoints: errors.serviceSatisfiedPoints,
              serviceImprovementPoints: errors.serviceImprovementPoints,
            }}
          />
        )}

        <FormButtons 
          onNext={handleNext}
          rightAligned={true} 
          showBackButton={false}
          nextButtonText={customerType ? "次のステップへ" : "アンケート開始"}
        />
      </PageLayout>
    </form>
  );
};

export default UnifiedSurvey;