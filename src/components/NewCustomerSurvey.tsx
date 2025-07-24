import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import RequiredBadge from './common/RequiredBadge';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import { ProgressBar } from './common/ProgressBar';

// UI コンポーネント
import { Input } from './ui/input';
import { Label } from './ui/label';

// アイコン
import {
  Info,
  Star,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// 型とローカル設定のインポート
import { getSurveyConfig } from '../config/surveyConfig';
import { SurveyConfig, ServiceKey, ImpressionEvaluation } from '../types';

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
      "group relative flex items-center gap-4 p-5 sm:p-6 rounded-2xl cursor-pointer touch-target stagger-item",
      "border transition-all duration-300 ease-out hover-lift mobile-touch-feedback",
      selected 
        ? "border-primary/30 bg-gradient-to-br from-primary/8 via-primary/4 to-accent/5 shadow-card-hover selected-glow" 
        : "border-gray-100/80 hover:border-primary/20 hover:bg-gradient-to-br hover:from-primary/2 hover:to-accent/2 shadow-soft hover:shadow-medium"
    )}
  >
    {/* 選択インジケーター */}
    <div className={cn(
      "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
      selected ? "border-primary bg-gradient-to-br from-primary to-primary/80 shadow-medium" : "border-gray-300 group-hover:border-primary/40"
    )}>
      {selected && (
        <div className="w-3 h-3 rounded-full bg-white animate-scale-in" />
      )}
    </div>
    
    {/* コンテンツ */}
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "flex-shrink-0 transition-all duration-300",
            selected ? "text-primary scale-110" : "text-primary/60 group-hover:text-primary/80"
          )}>
            {icon}
          </div>
        )}
        <span className={cn(
          "text-base sm:text-lg leading-tight font-medium transition-colors duration-300",
          selected ? "text-primary" : "text-gray-700 group-hover:text-gray-900"
        )}>
          {children}
        </span>
      </div>
      {description && (
        <p className={cn(
          "text-sm transition-colors duration-300 pl-0.5",
          selected ? "text-primary/70" : "text-gray-500 group-hover:text-gray-600"
        )}>
          {description}
        </p>
      )}
    </div>
    
    {/* 選択時のチェックマーク */}
    {selected && (
      <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-medium animate-scale-in">
        <svg 
          viewBox="0 0 24 24"
          width="14" 
          height="14" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none" 
          className="text-white"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    )}
    
    {/* ホバー時のシマー効果 */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none" />
    
    {/* 装飾ドット */}
    <div className={cn(
      "absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full transition-all duration-300",
      selected ? "bg-accent opacity-80" : "bg-gray-300 opacity-40 group-hover:bg-primary/40 group-hover:opacity-60"
    )} />
  </div>
);

// 印象評価のインターフェース
interface ImpressionRating {
  category: string;
  rating: string; // "良い" | "普通" | "悪い"
}

interface FormErrors {
  heardFrom: boolean;
  impressions: boolean;
  willReturn: boolean;
  otherHeardFrom: boolean;
}

const NewCustomerSurvey: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // SSMパラメータ（JSON）をパースして保持
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

  useEffect(() => {
    getSurveyConfig().then(config => {
      setSurveyConfig(config);
    });
  }, []);

  // 「当サロンをどこで知ったか」の選択リスト + その他入力欄
  const [heardFrom, setHeardFrom] = useState<string[]>(state?.heardFrom || []);
  const [otherHeardFrom, setOtherHeardFrom] = useState<string>(state?.otherHeardFrom || '');

  // 「印象評価用のstate（カテゴリごとの評価を保存）」
  const [impressionRatings, setImpressionRatings] = useState<ImpressionRating[]>(state?.impressionRatings || []);
  
  // 「また来たいと思いますか？」
  const [willReturn, setWillReturn] = useState<string>(state?.willReturn || '');

  // GoogleAccountから戻ってきた場合のstate
  const [hasGoogleAccount, setHasGoogleAccount] = useState<string>(state?.hasGoogleAccount || '');
  const [feedback, setFeedback] = useState<string>(state?.feedback || '');

  // エラー状態
  const [errors, setErrors] = useState<FormErrors>({
    heardFrom: false,
    impressions: false,
    willReturn: false,
    otherHeardFrom: false,
  });

  // 印象評価の更新関数
  const updateImpressionRating = (category: string, rating: string) => {
    setImpressionRatings(prev => {
      const existing = prev.find(item => item.category === category);
      if (existing) {
        // 既存の評価を更新
        return prev.map(item => 
          item.category === category ? { ...item, rating } : item
        );
      } else {
        // 新しい評価を追加
        return [...prev, { category, rating }];
      }
    });
  };

  // 印象評価の取得関数
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

    let newErrors = {
      heardFrom: false,
      impressions: false,
      willReturn: false,
      otherHeardFrom: false,
    };

    // 必須チェック1: 当サロンをどこで知ったか
    if (heardFrom.length === 0) {
      newErrors.heardFrom = true;
    }
    // その他が含まれる場合はテキスト未入力ならエラー
    if (heardFrom.includes('その他') && !otherHeardFrom) {
      newErrors.otherHeardFrom = true;
    }

    // 必須チェック2: 印象評価
    if (impressionRatings.length === 0) {
      newErrors.impressions = true;
    }

    // 必須チェック3: また来たいと思うか
    if (!willReturn) {
      newErrors.willReturn = true;
    }

    setErrors(newErrors);

    // エラーがあればreturn
    if (
      newErrors.heardFrom || 
      newErrors.otherHeardFrom || 
      newErrors.impressions || 
      newErrors.willReturn
    ) {
      return;
    }

    // Google確認画面に遷移
    navigate('/googleaccount', {
      state: {
        heardFrom,
        otherHeardFrom,
        impressionRatings,
        willReturn,
        hasGoogleAccount,
        feedback,
        isNewCustomer: true,
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

  const subtitle = `この度は当サロンをご利用いただきありがとうございます。お客様からのご意見を今後のサービス向上に役立てたいと考えておりますので、以下のアンケートにご協力いただけますと幸いです。`;

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

        {/* 当サロンをどこでお知りになりましたか */}
        <QuestionBox>
          <div className="space-y-8">
            <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                  どこで当店をお知りになりましたか？
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">該当するものをすべて選択してください</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surveyConfig.newCustomerOptions.heardFromOptions.map((option) => (
                <SelectOption
                  key={option}
                  selected={heardFrom.includes(option)}
                  onClick={() => {
                    const newHeardFrom = heardFrom.includes(option)
                      ? heardFrom.filter(item => item !== option)
                      : [...heardFrom, option];
                    setHeardFrom(newHeardFrom);
                  }}
                >
                  {option}
                </SelectOption>
              ))}
            </div>
            
            {errors.heardFrom && (
              <div className="flex items-center gap-2 text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[14px]">「どこで知ったか」を1つ以上選択してください</p>
              </div>
            )}
            
            {/* その他をチェックしたらテキスト入力欄表示 */}
            {heardFrom.includes('その他') && (
              <div className="mt-3 animate-slide-down">
                <Label htmlFor="other-heard-from" className="text-[13px] font-medium text-gray-700">
                  その他（具体的に）
                </Label>
                <Input
                  id="other-heard-from"
                  value={otherHeardFrom}
                  onChange={(e) => setOtherHeardFrom(e.target.value)}
                  className={cn(
                    "mt-1.5 h-10 transition-all duration-200 text-[14px]",
                    "border rounded-lg shadow-sm",
                    "focus:border-primary focus:ring-1 focus:ring-primary/30",
                    errors.otherHeardFrom ? "border-destructive" : "border-gray-200"
                  )}
                  placeholder="具体的な内容を入力してください"
                />
              </div>
            )}
          </div>
        </QuestionBox>

        {/* 印象評価 */}
        <QuestionBox>
          <div className="space-y-6">
            <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                  今回、印象に残った点を教えてください。
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">
                  1つ以上の項目について、該当する評価を選択してください
                </p>
              </div>
            </div>

            {/* 統一されたコンパクトカード形式 */}
            <div className="space-y-3">
              {surveyConfig.newCustomerOptions.impressionEvaluations.map((evaluation) => {
                const currentRating = getImpressionRating(evaluation.category);
                
                return (
                  <div 
                    key={evaluation.category} 
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                  >
                    {/* カテゴリヘッダー */}
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                      <h4 className="font-medium text-gray-900 text-base">{evaluation.category}</h4>
                    </div>
                    
                    {/* 評価ボタン（横並び） */}
                    <div className="p-1.5">
                      <div className="grid grid-cols-3 gap-1.5">
                        {evaluation.ratingOptions.map((rating) => {
                          const isSelected = currentRating === rating;
                          
                          return (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => updateImpressionRating(evaluation.category, rating)}
                              className={cn(
                                "flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-3 px-1 sm:px-2 transition-all rounded-lg",
                                "text-sm sm:text-lg font-medium border border-transparent min-h-[40px] sm:min-h-[44px]",
                                isSelected && rating === "良い" && "bg-green-500 text-white",
                                isSelected && rating === "普通" && "bg-gray-500 text-white", 
                                isSelected && rating === "要改善" && "bg-amber-500 text-white",
                                !isSelected && rating === "良い" && "text-green-700 hover:bg-green-50",
                                !isSelected && rating === "普通" && "text-gray-700 hover:bg-gray-50",
                                !isSelected && rating === "要改善" && "text-amber-700 hover:bg-amber-50"
                              )}
                            >
                              {/* 表情アイコン（常に横並び） */}
                              {rating === "良い" && <Smile className={cn("h-4 w-4 sm:h-5 sm:w-5", isSelected ? "text-white" : "text-green-600")} />}
                              {rating === "普通" && <Meh className={cn("h-4 w-4 sm:h-5 sm:w-5", isSelected ? "text-white" : "text-gray-600")} />}
                              {rating === "要改善" && <Frown className={cn("h-4 w-4 sm:h-5 sm:w-5", isSelected ? "text-white" : "text-amber-600")} />}
                              <span>{rating}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {errors.impressions && (
              <div className="flex items-center gap-2 text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[14px]">印象に残った点を少なくとも1つ選択してください</p>
              </div>
            )}
          </div>
        </QuestionBox>

        {/* また来たいと思いますか？ */}
        <QuestionBox>
          <div className="space-y-8">
            <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                  また来たいと思いますか？
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">またのご来店の意向を教えてください</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {surveyConfig.newCustomerOptions.willReturnOptions.map((option) => (
                <SelectOption
                  key={option}
                  selected={willReturn === option}
                  onClick={() => setWillReturn(option)}
                >
                  {option}
                </SelectOption>
              ))}
            </div>
            
            {errors.willReturn && (
              <div className="flex items-center gap-2 text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[14px]">選択肢から1つ選んでください</p>
              </div>
            )}
          </div>
        </QuestionBox>

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

export default NewCustomerSurvey; 