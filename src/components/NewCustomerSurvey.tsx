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
  ThumbsUp,
  ThumbsDown,
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

// 印象に関する状態を更新
interface ImpressionItem {
  option: string;
  isPositive: boolean;
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

  // 「最も印象に残った点は？」- 複数選択可能な形式に変更
  const [impressions, setImpressions] = useState<ImpressionItem[]>(state?.impressions || []);
  
  // 「また来たいと思いますか？」
  const [willReturn, setWillReturn] = useState<string>(state?.willReturn || '');

  // エラー状態
  const [errors, setErrors] = useState<FormErrors>({
    heardFrom: false,
    impressions: false,
    willReturn: false,
    otherHeardFrom: false,
  });

  // 印象に関する選択を追加/削除するハンドラ
  const toggleImpression = (option: string, isPositive: boolean) => {
    // 既に同じ項目と評価が選択されているか確認
    const existingIndex = impressions.findIndex(
      item => item.option === option && item.isPositive === isPositive
    );

    if (existingIndex >= 0) {
      // 既に選択されている場合は削除
      setImpressions(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // 選択されていない場合は追加
      setImpressions(prev => [...prev, { option, isPositive }]);
    }
  };

  // 指定した項目と評価が選択されているかチェック
  const isImpressionSelected = (option: string, isPositive: boolean) => {
    return impressions.some(item => item.option === option && item.isPositive === isPositive);
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

    // 必須チェック2: 印象に残った点
    if (impressions.length === 0) {
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

    // 良い点と改善点を分離
    const goodImpressions = impressions
      .filter(item => item.isPositive)
      .map(item => item.option);
    
    const badImpressions = impressions
      .filter(item => !item.isPositive)
      .map(item => item.option);

    // Google確認画面に遷移
    navigate('/googleaccount', {
      state: {
        heardFrom,
        otherHeardFrom,
        goodImpressions,
        badImpressions,
        willReturn,
        isNewCustomer: true,
        impressions,
      },
    });
  };

  // 戻るボタン
  const handleBack = () => {
    // ホーム画面に戻る
    navigate('/', { 
      state: {
        // 入力した情報をステートとして保持
        heardFrom,
        otherHeardFrom,
        impressions,
        willReturn,
        isNewCustomer: true
      }
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
                  icon={<Info className="h-5 w-5" />}
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

        {/* 印象に残った点 */}
        <QuestionBox>
          <div className="space-y-8">
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
                  印象に残った点について、「良い」「改善」ボタンを選択してください（複数選択可）
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {surveyConfig.newCustomerOptions.impressionOptions.map((option) => (
                <div key={option} className="flex items-center rounded-lg border border-gray-100 hover:shadow-sm">
                  <div className="flex-1 py-2.5 px-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary/80 flex-shrink-0" />
                    <span className="font-medium text-gray-800">{option}</span>
                  </div>
                  <div className="flex divide-x border-l">
                    <button
                      type="button"
                      onClick={() => toggleImpression(option, true)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2.5 px-3 transition-all",
                        isImpressionSelected(option, true)
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-primary/5 text-gray-700"
                      )}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="whitespace-nowrap">良い</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleImpression(option, false)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2.5 px-3 transition-all",
                        isImpressionSelected(option, false)
                          ? "bg-amber-50 text-amber-600 font-medium"
                          : "hover:bg-amber-50/50 text-gray-700"
                      )}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="whitespace-nowrap">改善</span>
                    </button>
                  </div>
                </div>
              ))}
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
                  icon={<Info className="h-5 w-5" />}
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
          onBack={handleBack}
          rightAligned={true} 
          showBackButton={false}
          nextButtonText="次のステップへ"
        />
      </PageLayout>
    </form>
  );
};

export default NewCustomerSurvey; 