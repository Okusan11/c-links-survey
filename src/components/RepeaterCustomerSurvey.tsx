import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import RequiredBadge from './common/RequiredBadge';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import { ProgressBar } from './common/ProgressBar';

// アイコン
import {
  Info,
  Star,
  AlertCircle,
} from 'lucide-react';

// 型とローカル設定のインポート
import { getSurveyConfig } from '../config/surveyConfig';
import { SurveyConfig, ServiceKey } from '../types';

// 選択肢のレンダリング用コンポーネント
const SelectOption: React.FC<{
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
}> = ({ selected, onClick, children, icon, description }) => (
  <div
    onClick={onClick}
    className={cn(
      "group relative flex items-center gap-3 p-4 sm:p-5 rounded-xl cursor-pointer touch-target",
      "border shadow-soft",
      selected 
        ? "border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent" 
        : "border-gray-100 hover:border-gray-200"
    )}
  >
    <div className={cn(
      "flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center self-center",
      selected ? "border-primary" : "border-gray-300"
    )}>
      {selected && (
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary" />
      )}
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        {icon && (
          <div className={cn(
            "flex-shrink-0 text-primary/80",
            selected ? "scale-105" : ""
          )}>
            {icon}
          </div>
        )}
        <span className={cn(
          "text-[16px] sm:text-[17px] leading-tight font-medium",
          selected ? "text-primary" : "text-gray-700"
        )}>
          {children}
        </span>
      </div>
      {description && (
        <p className="text-[14px] text-gray-500 pl-0.5 mt-1">
          {description}
        </p>
      )}
    </div>
    {selected && (
      <div className="absolute top-0 right-0 w-5 h-5 bg-primary rounded-bl-xl rounded-tr-xl flex items-center justify-center">
        <svg 
          viewBox="0 0 24 24"
          width="12" 
          height="12" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none" 
          className="text-white"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    )}
  </div>
);

interface FormErrors {
  satisfaction: boolean;
  usagePurpose: boolean;
  satisfiedPoints: boolean;
  improvementPoints: boolean;
}

const RepeaterCustomerSurvey: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // SSMパラメータ（JSON）をパースして保持
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

  useEffect(() => {
    getSurveyConfig().then(config => {
      setSurveyConfig(config);
    });
  }, []);

  // 前回と比べた満足度
  const [satisfaction, setSatisfaction] = useState<string>(state?.satisfaction || '');
  
  // サービス（利用目的）の選択
  const [usagePurpose, setUsagePurpose] = useState<ServiceKey[]>(state?.usagePurpose || []);

  // サービスごとの満足点/改善点
  const [satisfiedPoints, setSatisfiedPoints] = useState<Partial<Record<ServiceKey, string[]>>>(state?.satisfiedPoints || {});
  const [improvementPoints, setImprovementPoints] = useState<Partial<Record<ServiceKey, string[]>>>(state?.improvementPoints || {});

  // GoogleAccountから戻ってきた場合のstate
  const [hasGoogleAccount, setHasGoogleAccount] = useState<string>(state?.hasGoogleAccount || '');
  const [feedback, setFeedback] = useState<string>(state?.feedback || '');

  // エラー状態
  const [errors, setErrors] = useState<FormErrors>({
    satisfaction: false,
    usagePurpose: false,
    satisfiedPoints: false,
    improvementPoints: false,
  });

  /**
   * サービスの満足点・改善点変更ハンドラー
   */
  const handleServicePointChange = (
    serviceKey: ServiceKey,
    value: string,
    type: 'satisfied' | 'improvement'
  ) => {
    const setter = type === 'satisfied' ? setSatisfiedPoints : setImprovementPoints;
    const current = type === 'satisfied' ? satisfiedPoints : improvementPoints;
    
    const currentValues = current[serviceKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
      
    setter({ ...current, [serviceKey]: newValues });
  };

  /**
   * フォーム送信
   */
  const handleNext = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }

    let newErrors = {
      satisfaction: false,
      usagePurpose: false,
      satisfiedPoints: false,
      improvementPoints: false,
    };

    // 必須チェック1: 前回と比べた満足度
    if (!satisfaction) {
      newErrors.satisfaction = true;
    }

    // 必須チェック2: ご利用目的
    if (usagePurpose.length === 0) {
      newErrors.usagePurpose = true;
    }

    // 必須チェック3: 満足点
    if (Object.keys(satisfiedPoints).length === 0) {
      newErrors.satisfiedPoints = true;
    }

    // 必須チェック4: 改善点
    if (Object.keys(improvementPoints).length === 0) {
      newErrors.improvementPoints = true;
    }

    setErrors(newErrors);

    // エラーがあればreturn
    if (
      newErrors.satisfaction || 
      newErrors.usagePurpose || 
      newErrors.satisfiedPoints || 
      newErrors.improvementPoints
    ) {
      return;
    }

    // サービスラベルを取得
    const usagePurposeLabels = usagePurpose.map((key) => {
      const service = surveyConfig?.serviceDefinitions.find((sd) => sd.key === key);
      return service ? service.label : key;
    });

    // Google確認画面に遷移
    navigate('/googleaccount', {
      state: {
        satisfaction,
        usagePurpose,
        usagePurposeLabels,
        satisfiedPoints,
        improvementPoints,
        hasGoogleAccount,
        feedback,
        isNewCustomer: false,
      },
    });
  };



  if (!surveyConfig) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-destructive">アンケートを読み込んでいます...</p>
      </div>
    );
  }

  const subtitle = `この度も当サロンをご利用いただきありがとうございます。お客様からのご意見を今後のサービス向上に役立てたいと考えておりますので、以下のアンケートにご協力いただけますと幸いです。`;

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
        title="当サロン利用後のアンケート"
        subtitle={subtitle}
      >
        <ProgressBar 
          currentStep={1} 
          totalSteps={3} 
          steps={progressSteps}
        />

        {/* 前回と比べた満足度 */}
        <QuestionBox>
          <div className="space-y-8">
            <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                  今回のご満足度は前回と比べてどうでしたか？
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">前回のご利用と比較した満足度を教えてください</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {surveyConfig.repeaterOptions.satisfactionOptions.map((option) => (
                <SelectOption
                  key={option}
                  selected={satisfaction === option}
                  onClick={() => setSatisfaction(option)}
                  icon={<Info className="h-5 w-5" />}
                >
                  {option}
                </SelectOption>
              ))}
            </div>
            
            {errors.satisfaction && (
              <div className="flex items-center gap-2 text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[14px]">選択肢から1つ選んでください</p>
              </div>
            )}
          </div>
        </QuestionBox>

        {/* 利用目的(サービス) */}
        <QuestionBox>
          <div className="space-y-8">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 whitespace-normal text-wrap">
                  どのサービスをご利用されましたか？
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-sm text-gray-500 mt-1">該当するサービスをすべて選択してください</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveyConfig.serviceDefinitions.map((service) => (
                <SelectOption
                  key={service.key}
                  selected={usagePurpose.includes(service.key)}
                  onClick={() => {
                    const newUsagePurpose = usagePurpose.includes(service.key)
                      ? usagePurpose.filter(key => key !== service.key)
                      : [...usagePurpose, service.key];
                    setUsagePurpose(newUsagePurpose);
                  }}
                  icon={<Star className="h-5 w-5" />}
                >
                  {service.label}
                </SelectOption>
            ))}
            </div>
            
            {errors.usagePurpose && (
              <div className="flex items-center gap-2 text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">1つ以上のサービスを選択してください</p>
              </div>
            )}
          </div>
        </QuestionBox>

        {/* 選択されたサービスごとの満足点・改善点 */}
        {usagePurpose.map((serviceKey) => {
          const service = surveyConfig.serviceDefinitions.find((s) => s.key === serviceKey);
          if (!service) return null;

          return (
            <QuestionBox key={service.key}>
              <div className="space-y-8">
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 whitespace-normal text-wrap">{service.label}について</h3>
                    <p className="text-sm text-gray-500 mt-1">サービスの評価をお願いします</p>
                  </div>
                </div>

                {/* 満足した点 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-[15px] font-medium text-green-700">良かった点</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.satisfiedOptions.map((option) => (
                      <SelectOption
                        key={option}
                        selected={(satisfiedPoints[serviceKey] || []).includes(option)}
                        onClick={() => handleServicePointChange(serviceKey, option, 'satisfied')}
                      >
                        {option}
                      </SelectOption>
                    ))}
                  </div>
                </div>

                {/* 改善してほしい点 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-[15px] font-medium text-amber-700">改善してほしい点</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.improvementOptions.map((option) => (
                      <SelectOption
                        key={option}
                        selected={(improvementPoints[serviceKey] || []).includes(option)}
                        onClick={() => handleServicePointChange(serviceKey, option, 'improvement')}
                      >
                        {option}
                      </SelectOption>
                    ))}
                  </div>
                </div>
              </div>
            </QuestionBox>
          );
        })}

        <FormButtons 
          onNext={handleNext}
          rightAligned={true} 
          showBackButton={false}
          nextButtonText="次のステップへ"
        />
      </PageLayout>
    </form>
  );
};

export default RepeaterCustomerSurvey; 