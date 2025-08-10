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
  Smile,
  Meh,
  Frown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// 型
import { SurveyConfig, ImpressionEvaluation } from '../../types';

interface ImpressionRating {
  category: string;
  rating: string;
}

interface FormErrors {
  heardFrom: boolean;
  impressions: boolean;
  willReturn: boolean;
  otherHeardFrom: boolean;
  otherWillReturn: boolean;
}

interface NewCustomerQuestionsProps {
  surveyConfig: SurveyConfig;
  // 状態
  heardFrom: string[];
  setHeardFrom: (value: string[]) => void;
  otherHeardFrom: string;
  setOtherHeardFrom: (value: string) => void;
  impressionRatings: ImpressionRating[];
  setImpressionRatings: (value: ImpressionRating[]) => void;
  willReturn: string;
  setWillReturn: (value: string) => void;
  otherWillReturn: string;
  setOtherWillReturn: (value: string) => void;
  // エラー状態
  errors: FormErrors;
  // ヘルパー関数
  updateImpressionRating: (category: string, rating: string) => void;
  getImpressionRating: (category: string) => string | null;
}

const NewCustomerQuestions: React.FC<NewCustomerQuestionsProps> = ({
  surveyConfig,
  heardFrom,
  setHeardFrom,
  otherHeardFrom,
  setOtherHeardFrom,
  impressionRatings,
  setImpressionRatings,
  willReturn,
  setWillReturn,
  otherWillReturn,
  setOtherWillReturn,
  errors,
  updateImpressionRating,
  getImpressionRating,
}) => {
  // 印象評価アイコンの取得
  const getImpressionIcon = (rating: string) => {
    switch (rating) {
      case '良い':
        return <Smile className="h-5 w-5" />;
      case '普通':
        return <Meh className="h-5 w-5" />;
      case '要改善':
        return <Frown className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <>
      {/* どこで知ったか */}
      <QuestionBox data-question="heard-from">
        <div className="space-y-8">
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 whitespace-normal text-wrap">
                当サロンをどこで知りましたか？
                <RequiredBadge className="inline-block ml-1.5" />
              </h3>
              <p className="text-sm text-gray-500 mt-1">該当するものをすべて選択してください</p>
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
                variant="enhanced"
              >
                {option}
              </SelectOption>
            ))}
          </div>
          
          {errors.heardFrom && (
            <ErrorMessage message="当サロンを知ったきっかけを1つ以上選択してください" />
          )}
          
          {/* その他をチェックしたらテキスト入力欄表示 */}
          {surveyConfig.newCustomerOptions.heardFromOptions.includes('その他') && heardFrom.includes('その他') && (
            <div className="mt-3 animate-slide-down">
              <Label htmlFor="other-heard-from" className="text-[13px] font-medium text-gray-700">
                その他（自由記述）
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
              {errors.otherHeardFrom && (
                <ErrorMessage 
                  message="「その他」の具体的な内容を入力してください" 
                  size="sm"
                  className="mt-1"
                />
              )}
            </div>
          )}
        </div>
      </QuestionBox>

      {/* 印象評価 */}
      <QuestionBox data-question="impressions">
        <div className="space-y-8">
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 whitespace-normal text-wrap">
                当サロンの印象をお聞かせください
                <RequiredBadge className="inline-block ml-1.5" />
              </h3>
              <p className="text-sm text-gray-500 mt-1">各項目について評価をお選びください</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {surveyConfig.newCustomerOptions.impressionEvaluations.map((evaluation: ImpressionEvaluation) => (
              <div key={evaluation.category} className="bg-gray-50/50 rounded-xl p-5 space-y-4">
                <h4 className="text-base font-medium text-gray-800 flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary/70" />
                  {evaluation.category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {evaluation.ratingOptions.map((rating) => (
                    <SelectOption
                      key={`${evaluation.category}-${rating}`}
                      selected={getImpressionRating(evaluation.category) === rating}
                      onClick={() => updateImpressionRating(evaluation.category, rating)}
                      icon={getImpressionIcon(rating)}
                      variant="enhanced"
                    >
                      {rating}
                    </SelectOption>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {errors.impressions && (
            <ErrorMessage message="すべての項目について評価をお選びください" />
          )}
        </div>
      </QuestionBox>

      {/* また来たいと思うか */}
      <QuestionBox data-question="will-return">
        <div className="space-y-8">
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 whitespace-normal text-wrap">
                また当サロンを利用したいと思いますか？
                <RequiredBadge className="inline-block ml-1.5" />
              </h3>
              <p className="text-sm text-gray-500 mt-1">今回のご利用を踏まえたお気持ちをお聞かせください</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {surveyConfig.newCustomerOptions.willReturnOptions.map((option) => (
              <SelectOption
                key={option}
                selected={willReturn === option}
                onClick={() => setWillReturn(option)}
                icon={<Info className="h-5 w-5" />}
                variant="enhanced"
              >
                {option}
              </SelectOption>
            ))}
          </div>
          
          {errors.willReturn && (
            <ErrorMessage message="選択肢から1つ選んでください" />
          )}
          
          {/* その他をチェックしたらテキスト入力欄表示 */}
          {surveyConfig.newCustomerOptions.willReturnOptions.includes('その他') && willReturn === 'その他' && (
            <div className="mt-3 animate-slide-down">
              <Label htmlFor="other-will-return" className="text-[13px] font-medium text-gray-700">
                その他（自由記述）
              </Label>
              <Input
                id="other-will-return"
                value={otherWillReturn}
                onChange={(e) => setOtherWillReturn(e.target.value)}
                className={cn(
                  "mt-1.5 h-10 transition-all duration-200 text-[14px]",
                  "border rounded-lg shadow-sm",
                  "focus:border-primary focus:ring-1 focus:ring-primary/30",
                  errors.otherWillReturn ? "border-destructive" : "border-gray-200"
                )}
                placeholder="具体的な内容を入力してください"
              />
              {errors.otherWillReturn && (
                <ErrorMessage 
                  message="「その他」の具体的な内容を入力してください" 
                  size="sm"
                  className="mt-1"
                />
              )}
            </div>
          )}
        </div>
      </QuestionBox>
    </>
  );
};

export default NewCustomerQuestions;