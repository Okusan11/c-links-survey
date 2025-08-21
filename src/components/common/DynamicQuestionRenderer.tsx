import React, { useCallback } from 'react';
import { cn } from '../../lib/utils';

// 型定義
import { 
  QuestionCard, 
  SingleChoiceOptions,
  MultipleChoiceOptions,
  RatingScaleOptions,
  TextInputOptions,
  CustomerTypeOptions,
  ServiceUsageOptions,
  ServiceEvaluationOptions,
  SingleChoiceResponse,
  MultipleChoiceResponse
} from '../../types';

// 共通コンポーネント
import QuestionBox from './QuestionBox';
import SelectOption from './SelectOption';
import RequiredBadge from './RequiredBadge';
import ErrorMessage from './ErrorMessage';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// アイコン（動的アイコン対応）
import * as LucideIcons from 'lucide-react';

// 質問カード応答の型
export interface QuestionResponse {
  [questionId: string]: any;  // 質問IDをキーとした応答値
}

// エラー状態の型
export interface QuestionErrors {
  [questionId: string]: boolean;
}

// 動的質問レンダラーのProps
interface DynamicQuestionRendererProps {
  questionCard: QuestionCard;
  responses: QuestionResponse;
  errors: QuestionErrors;
  onResponseChange: (questionId: string, value: any) => void;
  onErrorClear: (questionId: string) => void;
  className?: string;
  surveyConfig?: any; // サービス定義へのアクセス用
}

/**
 * アイコン名から実際のLucideアイコンコンポーネントを取得
 */
const getIconComponent = (iconName?: string) => {
  if (!iconName) return null;
  
  // Lucide Reactのアイコンコンポーネントを動的に取得
  const IconComponent = (LucideIcons as any)[iconName];
  
  if (IconComponent) {
    return <IconComponent className="h-6 w-6" />;
  }
  
  // フォールバック: 不明なアイコンの場合はHelpCircleを表示
  return <LucideIcons.HelpCircle className="h-6 w-6" />;
};

/**
 * 単一選択カードのレンダラー
 */
const SingleChoiceRenderer: React.FC<{
  questionCard: QuestionCard;
  options: SingleChoiceOptions;
  value: SingleChoiceResponse | string;
  onChange: (value: SingleChoiceResponse | string) => void;
  error: boolean;
}> = ({ questionCard, options, value, onChange, error }) => {
  // レスポンス値の正規化 - 後方互換性のため文字列も受け入れ
  const normalizeValue = (val: SingleChoiceResponse | string | null | undefined): SingleChoiceResponse => {
    if (!val) return { value: '' };
    if (typeof val === 'string') return { value: val };
    return val;
  };

  const currentValue = normalizeValue(value);
  const selectedChoiceValue = currentValue.value;
  const otherText = currentValue.otherText || '';

  // 「その他」選択肢を見つける
  const otherChoice = options.choices.find(choice => choice.isOther || choice.value === 'その他' || choice.label === 'その他');
  const isOtherSelected = otherChoice && selectedChoiceValue === otherChoice.value;

  const handleChoiceChange = useCallback((choiceValue: string) => {
    const newChoice = options.choices.find(choice => choice.value === choiceValue);
    const isOther = newChoice && (newChoice.isOther || newChoice.value === 'その他' || newChoice.label === 'その他');
    
    if (isOther) {
      // 「その他」を選択した場合
      onChange({ value: choiceValue, otherText: otherText });
    } else {
      // 通常の選択肢の場合
      onChange({ value: choiceValue });
    }
  }, [options.choices, otherText, onChange]);

  const handleOtherTextChange = useCallback((newOtherText: string) => {
    if (otherChoice) {
      onChange({ value: otherChoice.value, otherText: newOtherText });
    }
  }, [otherChoice, onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {options.choices.map((choice) => (
          <SelectOption
            key={choice.value}
            selected={selectedChoiceValue === choice.value}
            onClick={() => handleChoiceChange(choice.value)}
            icon={getIconComponent(choice.icon)}
            description={choice.description}
            variant={options.variant || 'default'}
          >
            {choice.label}
          </SelectOption>
        ))}
      </div>

      {/* 「その他」テキスト入力欄 */}
      {isOtherSelected && (
        <div className="mt-3 animate-slide-down">
          <Label htmlFor={`other-text-${questionCard.id}`} className="text-[13px] font-medium text-gray-700">
            {options.otherLabel || 'その他（自由記述）'}
          </Label>
          <Input
            id={`other-text-${questionCard.id}`}
            value={otherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder={options.otherPlaceholder || '具体的な内容を入力してください'}
            className="mt-1.5 h-10 transition-all duration-200 text-[14px] border rounded-lg shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
      )}

      {error && (
        <ErrorMessage message={`${questionCard.title}をお選びください`} />
      )}
    </div>
  );
};

/**
 * 複数選択カードのレンダラー
 */
const MultipleChoiceRenderer: React.FC<{
  questionCard: QuestionCard;
  options: MultipleChoiceOptions;
  value: MultipleChoiceResponse | string[];
  onChange: (value: MultipleChoiceResponse | string[]) => void;
  error: boolean;
}> = ({ questionCard, options, value, onChange, error }) => {
  // レスポンス値の正規化 - 後方互換性のため文字列配列も受け入れ
  const normalizeValue = (val: MultipleChoiceResponse | string[] | null | undefined): MultipleChoiceResponse => {
    if (!val) return { values: [] };
    if (Array.isArray(val)) return { values: val };
    return val;
  };

  const currentValue = normalizeValue(value);
  const selectedValues = currentValue.values || [];
  const otherText = currentValue.otherText || '';

  // 「その他」選択肢を見つける
  const otherChoice = options.choices.find(choice => choice.isOther || choice.value === 'その他' || choice.label === 'その他');
  const isOtherSelected = otherChoice && selectedValues.includes(otherChoice.value);

  const handleSelectionChange = useCallback((choiceValue: string) => {
    const currentSelection = selectedValues || [];
    const isSelected = currentSelection.includes(choiceValue);
    const newChoice = options.choices.find(choice => choice.value === choiceValue);
    const isOtherChoice = newChoice && (newChoice.isOther || newChoice.value === 'その他' || newChoice.label === 'その他');
    
    let newSelection: string[];
    if (isSelected) {
      // 選択解除
      newSelection = currentSelection.filter(v => v !== choiceValue);
      
      if (isOtherChoice) {
        // 「その他」を解除する場合はテキストもクリア
        onChange({ values: newSelection });
      } else {
        onChange({ values: newSelection, otherText });
      }
    } else {
      // 最大選択数制限をチェック
      if (options.maxSelections && currentSelection.length >= options.maxSelections) {
        return; // 制限を超える場合は変更を無視
      }
      // 選択追加
      newSelection = [...currentSelection, choiceValue];
      onChange({ values: newSelection, otherText });
    }
  }, [selectedValues, options.choices, options.maxSelections, otherText, onChange]);

  const handleOtherTextChange = useCallback((newOtherText: string) => {
    onChange({ values: selectedValues, otherText: newOtherText });
  }, [selectedValues, onChange]);

  return (
    <div className="space-y-4">
             <div className="grid grid-cols-1 gap-4">
         {options.choices.map((choice) => (
           <SelectOption
             key={choice.value}
             selected={selectedValues.includes(choice.value)}
             onClick={() => handleSelectionChange(choice.value)}
             icon={getIconComponent(choice.icon)}
             description={choice.description}
           >
             {choice.label}
           </SelectOption>
         ))}
       </div>

      {/* 「その他」テキスト入力欄 */}
      {isOtherSelected && (
        <div className="mt-3 animate-slide-down">
          <Label htmlFor={`other-text-multiple-${questionCard.id}`} className="text-[13px] font-medium text-gray-700">
            {options.otherLabel || 'その他（自由記述）'}
          </Label>
          <Input
            id={`other-text-multiple-${questionCard.id}`}
            value={otherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder={options.otherPlaceholder || '具体的な内容を入力してください'}
            className="mt-1.5 h-10 transition-all duration-200 text-[14px] border rounded-lg shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
      )}

      {options.maxSelections && (
        <p className="text-sm text-gray-500">
          最大{options.maxSelections}個まで選択可能
        </p>
      )}
      {error && (
        <ErrorMessage message={`${questionCard.title}から選択してください`} />
      )}
    </div>
  );
};

/**
 * レーティングスケール（印象評価）カードのレンダラー
 */
const RatingScaleRenderer: React.FC<{
  questionCard: QuestionCard;
  options: RatingScaleOptions;
  value: Array<{ category: string; rating: string }>;
  onChange: (value: Array<{ category: string; rating: string }>) => void;
  error: boolean;
}> = ({ questionCard, options, value, onChange, error }) => {
  const handleRatingChange = (category: string, rating: string) => {
    const currentRatings = value || [];
    const existingIndex = currentRatings.findIndex(r => r.category === category);
    
    if (existingIndex >= 0) {
      // 既存の評価を更新
      const newRatings = [...currentRatings];
      newRatings[existingIndex] = { category, rating };
      onChange(newRatings);
    } else {
      // 新しい評価を追加
      onChange([...currentRatings, { category, rating }]);
    }
  };

  const getRating = (category: string): string | null => {
    const rating = (value || []).find(r => r.category === category);
    return rating ? rating.rating : null;
  };

  // プリセットの評価オプションを生成
  const getRatingPreset = (presetType: string) => {
    switch (presetType) {
      case '3-point':
        return [
          {
            value: '良い',
            label: '良い',
            emoji: '😊',
            color: {
              selected: 'bg-green-500',
              unselected: 'text-green-700',
              hover: 'hover:bg-green-50'
            }
          },
          {
            value: '普通',
            label: '普通',
            emoji: '😐',
            color: {
              selected: 'bg-gray-500',
              unselected: 'text-gray-700',
              hover: 'hover:bg-gray-50'
            }
          },
          {
            value: '要改善',
            label: '要改善',
            emoji: '😞',
            color: {
              selected: 'bg-amber-500',
              unselected: 'text-amber-700',
              hover: 'hover:bg-amber-50'
            }
          }
        ];
      case '5-point':
        return [
          {
            value: 'とても良い',
            label: 'とても良い',
            emoji: '🤩',
            color: {
              selected: 'bg-emerald-500',
              unselected: 'text-emerald-700',
              hover: 'hover:bg-emerald-50'
            }
          },
          {
            value: '良い',
            label: '良い',
            emoji: '😊',
            color: {
              selected: 'bg-green-500',
              unselected: 'text-green-700',
              hover: 'hover:bg-green-50'
            }
          },
          {
            value: '普通',
            label: '普通',
            emoji: '😐',
            color: {
              selected: 'bg-gray-500',
              unselected: 'text-gray-700',
              hover: 'hover:bg-gray-50'
            }
          },
          {
            value: '要改善',
            label: '要改善',
            emoji: '😞',
            color: {
              selected: 'bg-amber-500',
              unselected: 'text-amber-700',
              hover: 'hover:bg-amber-50'
            }
          },
          {
            value: '大幅に要改善',
            label: '大幅に要改善',
            emoji: '😣',
            color: {
              selected: 'bg-red-500',
              unselected: 'text-red-700',
              hover: 'hover:bg-red-50'
            }
          }
        ];
      default:
        return [];
    }
  };

  const usePresetDesign = options.preset && ['3-point', '5-point'].includes(options.preset);
  const presetOptions = usePresetDesign && options.preset ? getRatingPreset(options.preset) : [];

  return (
    <div className="space-y-4">
      {options.categories.map((category) => {
        const currentRating = getRating(category.category);
        
        return (
          <div key={category.category} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
              <h4 className="font-medium text-gray-900 text-base">{category.category}</h4>
            </div>
            
            <div className="p-1.5">
              {usePresetDesign ? (
                // プリセットデザイン（3段階 or 5段階）
                <div className={`grid gap-1.5 ${presetOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
                  {presetOptions.map((option) => {
                    const isSelected = currentRating === option.value;
                    return (
                      <button
                        key={`${category.category}-${option.value}`}
                        type="button"
                        onClick={() => handleRatingChange(category.category, option.value)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 transition-all rounded-lg font-medium border border-transparent",
                          "py-2 sm:py-3 px-1 sm:px-2 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]",
                          isSelected && option.color.selected,
                          isSelected && "text-white",
                          !isSelected && option.color.unselected,
                          !isSelected && option.color.hover
                        )}
                      >
                        <span className="text-base">{option.emoji}</span>
                        <span className={presetOptions.length === 5 ? 'text-xs sm:text-sm' : ''}>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // 従来のカスタムデザイン
                <div className="flex gap-2 flex-wrap">
                  {category.ratingOptions.map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(category.category, rating)}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 transition-all duration-200",
                        "hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
                        currentRating === rating
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {error && (
        <ErrorMessage message="すべての項目についてご評価ください" />
      )}
    </div>
  );
};

/**
 * テキスト入力カードのレンダラー
 */
const TextInputRenderer: React.FC<{
  questionCard: QuestionCard;
  options: TextInputOptions;
  value: string;
  onChange: (value: string) => void;
  error: boolean;
}> = ({ questionCard, options, value, onChange, error }) => {
  return (
    <div className="space-y-3">
      <Label>{questionCard.title}</Label>
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={options.placeholder}
        maxLength={options.maxLength}
        className={cn(error && "border-destructive")}
      />
      {options.maxLength && (
        <p className="text-sm text-gray-500">
          {(value || '').length} / {options.maxLength} 文字
        </p>
      )}
      {error && (
        <ErrorMessage message={`${questionCard.title}をご入力ください`} />
      )}
    </div>
  );
};

/**
 * 顧客タイプ選択カードのレンダラー（特別な単一選択）
 */
const CustomerTypeRenderer: React.FC<{
  questionCard: QuestionCard;
  options: CustomerTypeOptions;
  value: string;
  onChange: (value: string) => void;
  error: boolean;
}> = ({ questionCard, options, value, onChange, error }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {options.types.map((type) => (
          <SelectOption
            key={type.value}
            selected={value === type.value}
            onClick={() => onChange(type.value)}
            icon={getIconComponent(type.icon)}
            variant="enhanced"
          >
            {type.label}
          </SelectOption>
        ))}
      </div>
      {error && (
        <ErrorMessage message="ご来店回数を選択してください" />
      )}
    </div>
  );
};

/**
 * サービス利用選択カードのレンダラー
 */
const ServiceUsageRenderer: React.FC<{
  questionCard: QuestionCard;
  options: ServiceUsageOptions;
  value: string[];
  onChange: (value: string[]) => void;
  error: boolean;
  surveyConfig?: any;
}> = ({ questionCard, options, value, onChange, error, surveyConfig }) => {
  const handleSelectionChange = useCallback((serviceKey: string) => {
    const currentSelection = value || [];
    const isSelected = currentSelection.includes(serviceKey);
    
    if (isSelected) {
      // 選択解除
      onChange(currentSelection.filter(key => key !== serviceKey));
    } else {
      // 選択追加
      onChange([...currentSelection, serviceKey]);
    }
  }, [value, onChange]);

  // サービスキーからラベルを取得
  const getServiceLabel = (serviceKey: string): string => {
    if (surveyConfig?.serviceDefinitions) {
      const serviceDef = surveyConfig.serviceDefinitions.find((s: any) => s.key === serviceKey);
      return serviceDef ? serviceDef.label : serviceKey;
    }
    return serviceKey;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {options.availableServices.map((serviceKey) => (
          <SelectOption
            key={serviceKey}
            selected={(value || []).includes(serviceKey)}
            onClick={() => handleSelectionChange(serviceKey)}
            variant="default"
          >
            {getServiceLabel(serviceKey)}
          </SelectOption>
        ))}
      </div>
      {error && (
        <ErrorMessage message={`${questionCard.title}から選択してください`} />
      )}
    </div>
  );
};

// サービス別評価レスポンス形式の型定義
type ServiceEvaluationValue = {
  satisfied?: string[];
  improvement?: string[];
  otherSatisfied?: string;
  otherImprovement?: string;
} | string[];

// サービス別評価の値正規化関数
const normalizeServiceEvaluationValue = (val: any): { satisfied: string[]; improvement: string[]; otherSatisfied: string; otherImprovement: string } => {
  if (!val) return { satisfied: [], improvement: [], otherSatisfied: '', otherImprovement: '' };
  if (Array.isArray(val)) {
    // 旧形式の配列の場合は満足点として扱う
    return { satisfied: val, improvement: [], otherSatisfied: '', otherImprovement: '' };
  }
  return {
    satisfied: val.satisfied || [],
    improvement: val.improvement || [],
    otherSatisfied: val.otherSatisfied || '',
    otherImprovement: val.otherImprovement || ''
  };
};

/**
 * サービス別評価カードのレンダラー
 */
const ServiceEvaluationRenderer: React.FC<{
  questionCard: QuestionCard;
  options: ServiceEvaluationOptions;
  value: ServiceEvaluationValue;
  onChange: (value: ServiceEvaluationValue) => void;
  error: boolean;
  surveyConfig?: any;
}> = ({ questionCard, options, value, onChange, error, surveyConfig }) => {
  const { serviceKey, evaluationType } = options;

  const currentValue = normalizeServiceEvaluationValue(value);

  // 選択肢変更ハンドラー
  const handleSelectionChange = useCallback((option: string, type: 'satisfied' | 'improvement') => {
    const normalizedValue = normalizeServiceEvaluationValue(value);
    const currentOptions = normalizedValue[type] || [];
    const isSelected = currentOptions.includes(option);
    
    const newOptions = isSelected
      ? currentOptions.filter(item => item !== option)
      : [...currentOptions, option];
    
    onChange({
      ...normalizedValue,
      [type]: newOptions
    });
  }, [value, onChange]);

  // その他テキスト変更ハンドラー
  const handleOtherTextChange = useCallback((text: string, type: 'satisfied' | 'improvement') => {
    const normalizedValue = normalizeServiceEvaluationValue(value);
    const otherKey = type === 'satisfied' ? 'otherSatisfied' : 'otherImprovement';
    onChange({
      ...normalizedValue,
      [otherKey]: text
    });
  }, [value, onChange]);

  // サービス定義を取得
  const service = surveyConfig?.serviceDefinitions?.find((s: any) => s.key === serviceKey);
  if (!service) {
    return <div>サービス定義が見つかりません: {serviceKey}</div>;
  }

  return (
    <div className="space-y-8">
      {/* 満足点セクション */}
      {(evaluationType === 'satisfaction' || evaluationType === 'both') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <h4 className="text-[15px] font-medium text-green-700">良かった点</h4>
          </div>
          <p className="text-[13px] text-gray-500 leading-relaxed">該当するものをすべて選択してください</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {service.satisfiedOptions.map((option: string) => (
              <SelectOption
                key={`satisfied-${option}`}
                selected={currentValue.satisfied.includes(option)}
                onClick={() => handleSelectionChange(option, 'satisfied')}
              >
                {option}
              </SelectOption>
            ))}
          </div>
          
          {/* その他入力欄（満足点） */}
          {service.satisfiedOptions.includes('その他') && currentValue.satisfied.includes('その他') && (
            <div className="mt-3 animate-slide-down">
              <Label htmlFor={`other-satisfied-${serviceKey}`} className="text-[13px] font-medium text-gray-700">
                その他（自由記述）
              </Label>
              <Input
                id={`other-satisfied-${serviceKey}`}
                value={currentValue.otherSatisfied}
                onChange={(e) => handleOtherTextChange(e.target.value, 'satisfied')}
                className="mt-1.5 h-10 transition-all duration-200 text-[14px] border rounded-lg shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/30"
                placeholder="具体的な内容を入力してください"
              />
            </div>
          )}
        </div>
      )}

      {/* 改善点セクション */}
      {(evaluationType === 'improvement' || evaluationType === 'both') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <h4 className="text-[15px] font-medium text-amber-700">改善してほしい点</h4>
          </div>
          <p className="text-[13px] text-gray-500 leading-relaxed">該当するものをすべて選択してください</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {service.improvementOptions.map((option: string) => (
              <SelectOption
                key={`improvement-${option}`}
                selected={currentValue.improvement.includes(option)}
                onClick={() => handleSelectionChange(option, 'improvement')}
              >
                {option}
              </SelectOption>
            ))}
          </div>
          
          {/* その他入力欄（改善点） */}
          {service.improvementOptions.includes('その他') && currentValue.improvement.includes('その他') && (
            <div className="mt-3 animate-slide-down">
              <Label htmlFor={`other-improvement-${serviceKey}`} className="text-[13px] font-medium text-gray-700">
                その他（自由記述）
              </Label>
              <Input
                id={`other-improvement-${serviceKey}`}
                value={currentValue.otherImprovement}
                onChange={(e) => handleOtherTextChange(e.target.value, 'improvement')}
                className="mt-1.5 h-10 transition-all duration-200 text-[14px] border rounded-lg shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/30"
                placeholder="具体的な内容を入力してください"
              />
            </div>
          )}
        </div>
      )}
      
      {error && (
        <ErrorMessage message={`${service.label}サービスの評価を選択してください`} />
      )}
    </div>
  );
};

/**
 * 質問カードタイプに応じたレンダラーを選択
 */
const getQuestionRenderer = (
  questionCard: QuestionCard,
  responses: QuestionResponse,
  errors: QuestionErrors,
  onResponseChange: (questionId: string, value: any) => void,
  surveyConfig?: any
) => {
  const value = responses[questionCard.id];
  const error = errors[questionCard.id] || false;
  const onChange = (newValue: any) => onResponseChange(questionCard.id, newValue);

  switch (questionCard.type) {
    case 'single-choice':
      return (
        <SingleChoiceRenderer
          questionCard={questionCard}
          options={questionCard.options as SingleChoiceOptions}
          value={value || { value: '' }}
          onChange={onChange}
          error={error}
        />
      );

    case 'multiple-choice':
      return (
        <MultipleChoiceRenderer
          questionCard={questionCard}
          options={questionCard.options as MultipleChoiceOptions}
          value={value || { values: [] }}
          onChange={onChange}
          error={error}
        />
      );

    case 'rating-scale':
      return (
        <RatingScaleRenderer
          questionCard={questionCard}
          options={questionCard.options as RatingScaleOptions}
          value={value || []}
          onChange={onChange}
          error={error}
        />
      );

    case 'text-input':
      return (
        <TextInputRenderer
          questionCard={questionCard}
          options={questionCard.options as TextInputOptions}
          value={value || ''}
          onChange={onChange}
          error={error}
        />
      );

    case 'customer-type':
      return (
        <CustomerTypeRenderer
          questionCard={questionCard}
          options={questionCard.options as CustomerTypeOptions}
          value={value || ''}
          onChange={onChange}
          error={error}
        />
      );

    case 'service-usage':
      return (
        <ServiceUsageRenderer
          questionCard={questionCard}
          options={questionCard.options as ServiceUsageOptions}
          value={value || []}
          onChange={onChange}
          error={error}
          surveyConfig={surveyConfig}
        />
      );

    case 'service-evaluation':
      return (
        <ServiceEvaluationRenderer
          questionCard={questionCard}
          options={questionCard.options as ServiceEvaluationOptions}
          value={(value as ServiceEvaluationValue) || { satisfied: [], improvement: [], otherSatisfied: '', otherImprovement: '' }}
          onChange={onChange}
          error={error}
          surveyConfig={surveyConfig}
        />
      );

    case 'date-time':
      // 今後実装予定
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            「{questionCard.type}」タイプは現在開発中です
          </p>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">
            不明な質問タイプ: {questionCard.type}
          </p>
        </div>
      );
  }
};

/**
 * 動的質問レンダラーのメインコンポーネント
 */
const DynamicQuestionRenderer: React.FC<DynamicQuestionRendererProps> = ({
  questionCard,
  responses,
  errors,
  onResponseChange,
  onErrorClear,
  className,
  surveyConfig
}) => {
  const handleResponseChange = useCallback((questionId: string, value: any) => {
    onResponseChange(questionId, value);
    // エラー状態をクリア
    if (errors[questionId]) {
      onErrorClear(questionId);
    }
  }, [onResponseChange, onErrorClear, errors]);

  return (
    <QuestionBox 
      className={className}
      data-question={questionCard.id}
    >
      <div className="space-y-6">
        {/* 質問ヘッダー */}
        <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
          <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
            <LucideIcons.MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 whitespace-normal text-wrap">
              {questionCard.title}
              {questionCard.required && (
                <RequiredBadge className="inline-block ml-1.5" />
              )}
            </h3>
            {questionCard.description && (
              <p className="text-sm text-gray-500 mt-1">
                {questionCard.description}
              </p>
            )}
          </div>
        </div>

        {/* 質問カード内容 */}
        {getQuestionRenderer(questionCard, responses, errors, handleResponseChange, surveyConfig)}
      </div>
    </QuestionBox>
  );
};

export default DynamicQuestionRenderer;