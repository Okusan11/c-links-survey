import React from 'react';
import { cn } from '../../lib/utils';

// 共通コンポーネント
import RequiredBadge from '../common/RequiredBadge';
import QuestionBox from '../common/QuestionBox';
import SelectOption from '../common/SelectOption';
import ErrorMessage from '../common/ErrorMessage';

// UI コンポーネント
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// アイコン
import {
  Info,
  Star,
  Heart,
} from 'lucide-react';

// 型
import { SurveyConfig, ServiceKey } from '../../types';

interface FormErrors {
  returnReasons: boolean;
  satisfaction: boolean;
  usagePurpose: boolean;
  satisfiedPoints: boolean;
  improvementPoints: boolean;
  otherReturnReasons: boolean;
  otherSatisfaction: boolean;
  otherSatisfiedPoints: boolean;
  otherImprovementPoints: boolean;
  serviceSatisfiedPoints: Partial<Record<ServiceKey, boolean>>;
  serviceImprovementPoints: Partial<Record<ServiceKey, boolean>>;
}

interface SecondVisitQuestionsProps {
  surveyConfig: SurveyConfig;
  // 状態
  returnReasons: string[];
  setReturnReasons: (value: string[]) => void;
  otherReturnReasons: string;
  setOtherReturnReasons: (value: string) => void;
  satisfaction: string;
  setSatisfaction: (value: string) => void;
  otherSatisfaction: string;
  setOtherSatisfaction: (value: string) => void;
  usagePurpose: ServiceKey[];
  setUsagePurpose: (value: ServiceKey[]) => void;
  satisfiedPoints: Partial<Record<ServiceKey, string[]>>;
  setSatisfiedPoints: (value: Partial<Record<ServiceKey, string[]>>) => void;
  improvementPoints: Partial<Record<ServiceKey, string[]>>;
  setImprovementPoints: (value: Partial<Record<ServiceKey, string[]>>) => void;
  otherSatisfiedPoints: Partial<Record<ServiceKey, string>>;
  setOtherSatisfiedPoints: (value: Partial<Record<ServiceKey, string>>) => void;
  otherImprovementPoints: Partial<Record<ServiceKey, string>>;
  setOtherImprovementPoints: (value: Partial<Record<ServiceKey, string>>) => void;
  // エラー状態
  errors: FormErrors;
}

const SecondVisitQuestions: React.FC<SecondVisitQuestionsProps> = ({
  surveyConfig,
  returnReasons,
  setReturnReasons,
  otherReturnReasons,
  setOtherReturnReasons,
  satisfaction,
  setSatisfaction,
  otherSatisfaction,
  setOtherSatisfaction,
  usagePurpose,
  setUsagePurpose,
  satisfiedPoints,
  setSatisfiedPoints,
  improvementPoints,
  setImprovementPoints,
  otherSatisfiedPoints,
  setOtherSatisfiedPoints,
  otherImprovementPoints,
  setOtherImprovementPoints,
  errors,
}) => {
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

  return (
    <>
      {/* 再来店いただいた理由 */}
      <QuestionBox>
        <div data-question="return-reasons">
          <div className="space-y-8">
          <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                再来店いただいた理由をお聞かせください
                <RequiredBadge className="inline-block ml-1.5" />
              </h3>
              <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">該当するものをすべて選択してください</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveyConfig.secondVisitOptions.returnReasons.map((reason) => (
              <SelectOption
                key={reason}
                selected={returnReasons.includes(reason)}
                onClick={() => {
                  const newReturnReasons = returnReasons.includes(reason)
                    ? returnReasons.filter(item => item !== reason)
                    : [...returnReasons, reason];
                  setReturnReasons(newReturnReasons);
                }}
              >
                {reason}
              </SelectOption>
            ))}
          </div>
          
          {errors.returnReasons && (
            <ErrorMessage message="再来店理由を1つ以上選択してください" />
          )}
          
          {/* その他をチェックしたらテキスト入力欄表示 */}
          {surveyConfig.secondVisitOptions.returnReasons.includes('その他') && returnReasons.includes('その他') && (
            <div className="mt-3 animate-slide-down">
              <Label htmlFor="other-return-reasons" className="text-[13px] font-medium text-gray-700">
                その他（自由記述）
              </Label>
              <Input
                id="other-return-reasons"
                value={otherReturnReasons}
                onChange={(e) => setOtherReturnReasons(e.target.value)}
                className={cn(
                  "mt-1.5 h-10 transition-all duration-200 text-[14px]",
                  "border rounded-lg shadow-sm",
                  "focus:border-primary focus:ring-1 focus:ring-primary/30",
                  errors.otherReturnReasons ? "border-destructive" : "border-gray-200"
                )}
                placeholder="具体的な内容を入力してください"
              />
              {errors.otherReturnReasons && (
                <ErrorMessage 
                  message="「その他」の具体的な内容を入力してください" 
                  size="sm"
                  className="mt-1"
                />
              )}
            </div>
          )}
          </div>
        </div>
      </QuestionBox>

      {/* 初回来店と比べた満足度 */}
      <QuestionBox>
        <div data-question="satisfaction">
        <div className="space-y-8">
          <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                初回来店と比べた満足度をお聞かせください
                <RequiredBadge className="inline-block ml-1.5" />
              </h3>
              <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">前回のご利用と比較した満足度を教えてください</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {surveyConfig.secondVisitOptions.satisfactionOptions.map((option) => (
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
            <ErrorMessage message="選択肢から1つ選んでください" />
          )}
          
          {/* その他をチェックしたらテキスト入力欄表示 */}
          {surveyConfig.secondVisitOptions.satisfactionOptions.includes('その他') && satisfaction === 'その他' && (
            <div className="mt-3 animate-slide-down">
              <Label htmlFor="other-satisfaction" className="text-[13px] font-medium text-gray-700">
                その他（自由記述）
              </Label>
              <Input
                id="other-satisfaction"
                value={otherSatisfaction}
                onChange={(e) => setOtherSatisfaction(e.target.value)}
                className={cn(
                  "mt-1.5 h-10 transition-all duration-200 text-[14px]",
                  "border rounded-lg shadow-sm",
                  "focus:border-primary focus:ring-1 focus:ring-primary/30",
                  errors.otherSatisfaction ? "border-destructive" : "border-gray-200"
                )}
                placeholder="具体的な内容を入力してください"
              />
              {errors.otherSatisfaction && (
                <ErrorMessage 
                  message="「その他」の具体的な内容を入力してください" 
                  size="sm"
                  className="mt-1"
                />
              )}
            </div>
          )}
          </div>
        </div>
      </QuestionBox>

      {/* 利用目的(サービス) */}
      <QuestionBox>
        <div data-question="usage-purpose">
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
            <ErrorMessage message="ご利用されたサービスを1つ以上選択してください" />
          )}
          </div>
        </div>
      </QuestionBox>

      {/* 選択されたサービスごとの満足点・改善点 */}
      {usagePurpose.map((serviceKey) => {
        const service = surveyConfig.serviceDefinitions.find((s) => s.key === serviceKey);
        if (!service) return null;

        return (
          <QuestionBox key={service.key} data-service={serviceKey}>
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
                <p className="text-[13px] text-gray-500 leading-relaxed">該当するものをすべて選択してください</p>
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
                
                {/* その他をチェックしたらテキスト入力欄表示 */}
                {service.satisfiedOptions.includes('その他') && (satisfiedPoints[serviceKey] || []).includes('その他') && (
                  <div className="mt-3 animate-slide-down">
                    <Label htmlFor={`other-satisfied-${serviceKey}`} className="text-[13px] font-medium text-gray-700">
                      その他（自由記述）
                    </Label>
                    <Input
                      id={`other-satisfied-${serviceKey}`}
                      value={otherSatisfiedPoints[serviceKey] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newValue = e.target.value;
                        setOtherSatisfiedPoints({
                          ...otherSatisfiedPoints,
                          [serviceKey]: newValue
                        });
                      }}
                      className={cn(
                        "mt-1.5 h-10 transition-all duration-200 text-[14px]",
                        "border rounded-lg shadow-sm",
                        "focus:border-primary focus:ring-1 focus:ring-primary/30",
                        errors.otherSatisfiedPoints ? "border-destructive" : "border-gray-200"
                      )}
                      placeholder="具体的な内容を入力してください"
                    />
                    {errors.otherSatisfiedPoints && (
                      <ErrorMessage 
                        message="「その他」の具体的な内容を入力してください" 
                        size="sm"
                        className="mt-1"
                      />
                    )}
                  </div>
                )}
                
                {/* 満足点の未選択エラーメッセージ */}
                {errors.serviceSatisfiedPoints[serviceKey] && (
                  <ErrorMessage message="良かった点を1つ以上選択してください" />
                )}
              </div>

              {/* 改善してほしい点 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-[15px] font-medium text-amber-700">改善してほしい点</h4>
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed">該当するものをすべて選択してください</p>
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
                
                {/* その他をチェックしたらテキスト入力欄表示 */}
                {service.improvementOptions.includes('その他') && (improvementPoints[serviceKey] || []).includes('その他') && (
                  <div className="mt-3 animate-slide-down">
                    <Label htmlFor={`other-improvement-${serviceKey}`} className="text-[13px] font-medium text-gray-700">
                      その他（自由記述）
                    </Label>
                    <Input
                      id={`other-improvement-${serviceKey}`}
                      value={otherImprovementPoints[serviceKey] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newValue = e.target.value;
                        setOtherImprovementPoints({
                          ...otherImprovementPoints,
                          [serviceKey]: newValue
                        });
                      }}
                      className={cn(
                        "mt-1.5 h-10 transition-all duration-200 text-[14px]",
                        "border rounded-lg shadow-sm",
                        "focus:border-primary focus:ring-1 focus:ring-primary/30",
                        errors.otherImprovementPoints ? "border-destructive" : "border-gray-200"
                      )}
                      placeholder="具体的な内容を入力してください"
                    />
                    {errors.otherImprovementPoints && (
                      <ErrorMessage 
                        message="「その他」の具体的な内容を入力してください" 
                        size="sm"
                        className="mt-1"
                      />
                    )}
                  </div>
                )}
                
                {/* 改善点の未選択エラーメッセージ */}
                {errors.serviceImprovementPoints[serviceKey] && (
                  <ErrorMessage message="改善してほしい点を1つ以上選択してください" />
                )}
              </div>
            </div>
          </QuestionBox>
        );
      })}
    </>
  );
};

export default SecondVisitQuestions;