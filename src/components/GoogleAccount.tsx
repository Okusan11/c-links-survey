import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import RequiredBadge from './common/RequiredBadge';
import { ProgressBar } from './common/ProgressBar';

// アイコン
import { Info, AlertCircle } from 'lucide-react';

// 型とデータのインポート
import { getSurveyConfig } from '../config/surveyConfig';
import { SurveyConfig, ServiceKey } from '../types';

const GoogleAccount: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 環境変数からURL/エンドポイントを取得
  const googleReviewUrl =
    process.env.REACT_APP_GMAP_REVIEW_URL || 'https://www.google.com/maps';
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';

  // SurveyConfigを読み込み
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);
  const [hasGoogleAccount, setHasGoogleAccount] = useState<string>(state?.hasGoogleAccount || '');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getSurveyConfig().then(config => {
      setSurveyConfig(config);
    });
  }, []);

  // serviceKey -> label を返すヘルパー
  const getLabelFromKey = (key: ServiceKey): string => {
    if (!surveyConfig) return '';
    const found = surveyConfig.serviceDefinitions.find((item) => item.key === key);
    return found ? found.label : '';
  };

  // usagePurpose は serviceKey[] (SurveyForm.tsx でそう送ってきた想定)
  const usagePurposeKeys: ServiceKey[] = state?.usagePurpose || [];

  // usagePurposeKeys をラベルに変換した配列
  const usagePurposeLabels = usagePurposeKeys.map((key) => getLabelFromKey(key));

  // 必要であればデストラクチャリングしておく
  const {
    visitDate,
    heardFrom,
    otherHeardFrom,
    satisfiedPoints,
    improvementPoints,
    feedback,
    isNewCustomer
  } = state || {};

  // 戻るボタン
  const handleBack = () => {
    // SurveyFormに戻り、入力内容を保持しておく
    navigate('/surveyform', {
      state: {
        visitDate,
        heardFrom,
        otherHeardFrom,
        usagePurpose: usagePurposeKeys,
        usagePurposeLabels,
        satisfiedPoints,
        improvementPoints,
        hasGoogleAccount,
        feedback,
        isNewCustomer
      },
    });
  };
  
  // 次へボタン
  const handleNext = (event?: React.FormEvent) => {
    // イベントがある場合はpreventDefaultを呼び出す
    if (event) {
      event.preventDefault();
    }

    if (!hasGoogleAccount) {
      setError(true);
      return;
    }

    const data = {
      visitDate,
      heardFrom,
      otherHeardFrom,
      usagePurpose: usagePurposeKeys,
      usagePurposeLabels,
      satisfiedPoints,
      improvementPoints,
      hasGoogleAccount,
      feedback,
      isNewCustomer
    };

    // 送信データの確認
    console.log('送信するstateの中身', data);

    if (hasGoogleAccount === 'yes') {
      // API Gateway へデータを送信するが、レスポンスを待たずに画面遷移
      if (!apiEndpoint) {
        alert('APIエンドポイントが設定されていません。');
        return;
      }

      // --- fetchは投げるがawaitしない ---
      fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch((error) => {
        // 失敗した場合も、一旦はコンソールエラーのみ表示
        console.error('データ送信中にエラーが発生しました:', error);
      });

      // 非同期のAPI送信を待たずに、すぐにGoogleMapへ
      window.location.href = googleReviewUrl;
    } else {
      // Googleアカウントがない場合は感想入力画面へ遷移
      navigate('/reviewform', {
        state: data,
      });
    }
  };

  if (!surveyConfig) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-destructive">データを読み込んでいます...</p>
      </div>
    );
  }

  const subtitle = '当サロンのサービスをご利用いただいた際の感想をぜひGoogle Mapの口コミとして投稿していただけますと幸いです！';

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
        "group relative flex items-center gap-3 p-4 sm:p-5 rounded-xl cursor-pointer transition-all touch-target",
        "border shadow-soft",
        selected 
          ? "border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent" 
          : "border-gray-100 hover:border-gray-200"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center self-center",
        "transition-colors duration-200",
        selected ? "border-primary" : "border-gray-300"
      )}>
        {selected && (
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary animate-scale-check" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn(
              "flex-shrink-0 text-primary/80 transition-transform duration-200",
              selected ? "scale-105" : ""
            )}>
              {icon}
            </div>
          )}
          <span className={cn(
            "text-[16px] sm:text-[17px] leading-tight transition-colors duration-200 font-medium",
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

  return (
    <form onSubmit={handleNext}>
      <PageLayout
        title="Google Map口コミ投稿のご依頼"
        subtitle={subtitle}
      >
        <ProgressBar 
          currentStep={2} 
          totalSteps={3} 
          steps={progressSteps}
        />
        
        <QuestionBox>
          <div className="space-y-8">
            <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide">
                  Googleアカウントをお持ちですか？
                  <RequiredBadge />
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">口コミを投稿するにはGoogleアカウントが必要です</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectOption
                selected={hasGoogleAccount === 'yes'}
                onClick={() => {
                  setHasGoogleAccount('yes');
                  setError(false);
                }}
                icon={<Info className="h-5 w-5" />}
              >
                はい、持っています
              </SelectOption>
              <SelectOption
                selected={hasGoogleAccount === 'no'}
                onClick={() => {
                  setHasGoogleAccount('no');
                  setError(false);
                }}
                icon={<Info className="h-5 w-5" />}
              >
                いいえ、持っていません
              </SelectOption>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-destructive mt-2 animate-shake">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[14px]">選択してください</p>
              </div>
            )}
          </div>
        </QuestionBox>

        <FormButtons 
          onBack={handleBack} 
          onNext={handleNext} 
          nextButtonText={hasGoogleAccount === 'yes' ? 'Google Mapへ' : '感想入力画面へ'} 
        />
      </PageLayout>
    </form>
  );
};

export default GoogleAccount;
