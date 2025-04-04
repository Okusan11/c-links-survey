import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import RequiredFormLabel from './common/RequiredFormLabel';
import RequiredBadge from './common/RequiredBadge';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import { ProgressBar } from './common/ProgressBar';

// UI コンポーネント
import { CheckboxGroup } from './ui/checkbox-group';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// 型とローカル設定のインポート
import { getSurveyConfig } from '../config/surveyConfig';
import { SurveyConfig, ServiceKey, FormErrors } from '../types';

// アイコン
import {
  CalendarDays,
  Info,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';

// 型定義
interface VisitDate {
  year: string;
  month: string;
  day: string;
}

interface SurveyFormState {
  visitDate: VisitDate;
  heardFrom: string[];
  otherHeardFrom: string;
  usagePurpose: string[];
  usagePurposeLabels: string[];
  isNewCustomer: boolean | null;
}

const SurveyForm: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // SSMパラメータ（JSON）をパースして保持
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

  // 新規・リピーター選択
  const [isNewCustomer, setIsNewCustomer] = useState<boolean | null>(state?.isNewCustomer ?? null);

  useEffect(() => {
    getSurveyConfig().then(config => {
      setSurveyConfig(config);
    });
  }, []);

  // 日付等のステート管理
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1);
  const currentDay = String(currentDate.getDate());

  const [visitDate, setVisitDate] = useState(state?.visitDate || {
    year: String(currentYear),
    month: currentMonth,
    day: currentDay,
  });

  // 「当サロンをどこで知ったか」の選択リスト + その他入力欄
  const [heardFrom, setHeardFrom] = useState<string[]>(state?.heardFrom || []);
  const [otherHeardFrom, setOtherHeardFrom] = useState<string>(state?.otherHeardFrom || '');

  // サービス（利用目的）の選択
  const [usagePurpose, setUsagePurpose] = useState<ServiceKey[]>(state?.usagePurpose || []);

  // サービスのラベルとキーのマッピングをメモ化
  const serviceMap = React.useMemo(() => {
    if (!surveyConfig) return new Map();
    const map = new Map();
    surveyConfig.serviceDefinitions.forEach(s => {
      map.set(s.label, s.key);
      map.set(s.key, s.label);
    });
    return map;
  }, [surveyConfig]);

  // サービスごとの満足点/改善点
  const [satisfiedPoints, setSatisfiedPoints] = useState<Partial<Record<ServiceKey, string[]>>>(
    state?.satisfiedPoints || {}
  );
  const [improvementPoints, setImprovementPoints] = useState<Partial<Record<ServiceKey, string[]>>>(
    state?.improvementPoints || {}
  );

  /**
   * フォーム送信
   */
  const [errors, setErrors] = useState<FormErrors>({
    heardFrom: false,
    visitDate: false,
    usagePurpose: false,
    satisfiedPoints: false,
    improvementPoints: false,
    otherHeardFrom: false,
    isNewCustomer: false,
  });

  const handleNext = (event?: React.MouseEvent) => {
    if (event) {
    event.preventDefault();
    }

    let newErrors = {
      heardFrom: false,
      visitDate: false,
      usagePurpose: false,
      satisfiedPoints: false,
      improvementPoints: false,
      otherHeardFrom: false,
      isNewCustomer: false,
    };

    // 必須チェック0: 新規・リピーター選択
    if (isNewCustomer === null) {
      newErrors.isNewCustomer = true;
    }

    // 必須チェック1: 当サロンをどこで知ったか（新規のお客様のみ）
    if (isNewCustomer && heardFrom.length === 0) {
      newErrors.heardFrom = true;
    }
    // その他が含まれる場合はテキスト未入力ならエラー（新規のお客様のみ）
    if (isNewCustomer && heardFrom.includes('その他') && !otherHeardFrom) {
      newErrors.otherHeardFrom = true;
    }

    // 必須チェック2: 利用日時
    if (!visitDate.year || !visitDate.month || !visitDate.day) {
      newErrors.visitDate = true;
    }

    // 必須チェック3: ご利用目的
    if (usagePurpose.length === 0) {
      newErrors.usagePurpose = true;
    }

    // 必須チェック4: 満足点
    if (Object.keys(satisfiedPoints).length === 0) {
      newErrors.satisfiedPoints = true;
    }

    // 必須チェック5: 改善点
    if (Object.keys(improvementPoints).length === 0) {
      newErrors.improvementPoints = true;
    }

    setErrors(newErrors);

    // エラーがあればreturn
    if (
      newErrors.isNewCustomer ||
      (isNewCustomer && (newErrors.heardFrom || newErrors.otherHeardFrom)) ||
      newErrors.visitDate ||
      newErrors.usagePurpose ||
      newErrors.satisfiedPoints ||
      newErrors.improvementPoints
    ) {
      return;
    }

    // ここでusagePurposeのkeyに対応するラベルを配列に変換
    const usagePurposeLabels = usagePurpose.map((key) => {
      const service = surveyConfig?.serviceDefinitions.find((sd) => sd.key === key);
      return service ? service.label : key;
    });

    navigate('/googleaccount', {
      state: {
        visitDate,
        heardFrom: isNewCustomer ? heardFrom : [],
        otherHeardFrom: isNewCustomer ? otherHeardFrom : '',
        usagePurpose,
        usagePurposeLabels,
        satisfiedPoints,
        improvementPoints,
        isNewCustomer,
      },
    });
  };

  /**
   * 年月日のセレクト用配列
   */
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => String(2020 + i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  /**
   * レンダリング
   */
  if (!surveyConfig) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-destructive">アンケートを読み込んでいます...</p>
      </div>
    );
  }

  const subtitle = `この度は当サロンをご利用いただきありがとうございます。お客様からのご意見を今後のサービス向上に役立てたいと考えておりますので、以下のアンケートにご協力いただけますと幸いです。`;

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

  // 日付選択用のカスタムコンポーネント
  const DateSelect: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    error?: boolean;
  }> = ({ label, value, onChange, options, error }) => (
    <div className="space-y-1.5">
      <Label htmlFor={`${label}-select`} className="text-[14px] font-medium text-gray-700">
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger 
          id={`${label}-select`} 
          className={cn(
            "w-full h-10 transition-all duration-200 text-[15px]",
            "border rounded-lg shadow-sm",
            "hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/30",
            error ? "border-destructive" : "border-gray-200"
          )}
        >
          <SelectValue placeholder="選択" />
        </SelectTrigger>
        <SelectContent className="rounded-lg border shadow-lg">
          <div className="max-h-[250px] overflow-y-auto">
            {options.map((option) => (
              <SelectItem 
                key={option} 
                value={option}
                className={cn(
                  "py-2 px-3 cursor-pointer transition-colors text-[15px]",
                  "hover:bg-primary/5 focus:bg-primary/5",
                  "data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-medium"
                )}
              >
                {option}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );

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
        
        {/* 新規・リピーター選択 */}
        <QuestionBox>
          <div className="space-y-8">
            <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                  当サロンのご利用は初めてですか？
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">該当する方を選択してください</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectOption
                selected={isNewCustomer === true}
                onClick={() => setIsNewCustomer(true)}
                icon={<Info className="h-5 w-5" />}
              >
                はい、初めてのご利用です
              </SelectOption>
              <SelectOption
                selected={isNewCustomer === false}
                onClick={() => setIsNewCustomer(false)}
                icon={<Info className="h-5 w-5" />}
              >
                いいえ、2回目以降のご利用です
              </SelectOption>
            </div>
            
            {errors.isNewCustomer && (
              <div className="flex items-center gap-2 text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[14px]">選択してください</p>
              </div>
            )}
          </div>
        </QuestionBox>
        
        {/* 当サロンをどこでお知りになりましたか（新規のお客様のみ表示） */}
        {isNewCustomer && (
      <QuestionBox>
            <div className="space-y-8">
              <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
                <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                    当サロンをどこでお知りになりましたか？
                    <RequiredBadge className="inline-block ml-1.5" />
                  </h3>
                  <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">該当するものをすべて選択してください</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveyConfig.heardFromOptions.map((option) => (
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setOtherHeardFrom(e.target.value)}
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
        )}

      {/* サロンをご利用された日時 */}
      <QuestionBox>
          <div className="space-y-8">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 whitespace-normal text-wrap">
                  当サロンをご利用された日時
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-sm text-gray-500 mt-1">ご来店された日付を選択してください</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <DateSelect
                label="年"
              value={visitDate.year}
                onChange={(value) => setVisitDate((prev: VisitDate) => ({ ...prev, year: value }))}
                options={years}
                error={errors.visitDate}
              />
              <DateSelect
                label="月"
              value={visitDate.month}
                onChange={(value) => setVisitDate((prev: VisitDate) => ({ ...prev, month: value }))}
                options={months}
                error={errors.visitDate}
              />
              <DateSelect
                label="日"
                value={visitDate.day}
                onChange={(value) => setVisitDate((prev: VisitDate) => ({ ...prev, day: value }))}
                options={days}
                error={errors.visitDate}
              />
            </div>
            
          {errors.visitDate && (
              <div className="flex items-center gap-2 text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">サロンをご利用された日時を選択してください</p>
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
                    <div className="p-1.5 rounded-lg bg-green-50">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="text-[15px] font-medium text-green-700">満足した点</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.satisfiedOptions.map((option) => (
                      <SelectOption
                    key={option}
                        selected={(satisfiedPoints[serviceKey] || []).includes(option)}
                        onClick={() => handleServicePointChange(serviceKey, option, 'satisfied')}
                        icon={<ThumbsUp className="h-4 w-4" />}
                      >
                        {option}
                      </SelectOption>
                    ))}
                  </div>
                </div>

            {/* 改善してほしい点 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-50">
                      <ThumbsDown className="h-4 w-4 text-amber-600" />
                    </div>
                    <h4 className="text-[15px] font-medium text-amber-700">改善してほしい点</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.improvementOptions.map((option) => (
                      <SelectOption
                    key={option}
                        selected={(improvementPoints[serviceKey] || []).includes(option)}
                        onClick={() => handleServicePointChange(serviceKey, option, 'improvement')}
                        icon={<ThumbsDown className="h-4 w-4" />}
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

export default SurveyForm;
