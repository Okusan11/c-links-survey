import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import FormButtons from './common/FormButtons';
import { ProgressBar } from './common/ProgressBar';
import LoadingOverlay from './common/LoadingOverlay';

// 型定義のインポート
import { SurveyConfig, QuestionCard, CustomerType } from '../types';

// アイコン
import {
  CalendarDays,
  MessageSquare,
  ThumbsUp,
  Info,
  Check,
  ChevronRight
} from 'lucide-react';

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'back' | 'submit' | null>(null);
  const actionTypeRef = useRef<'back' | 'submit' | null>(null);
  
  // 環境変数からAPIエンドポイントを取得
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';

  // 新しいSurveyConfig形式に対応
  const surveyConfig: SurveyConfig | null = state?.surveyConfig || null;
  const responses = state?.responses || {};
  const customerType: CustomerType = state?.customerType || 'new';

  // デバッグ情報を出力（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('[Confirmation] 確認画面の初期化:', {
      surveyConfigExists: !!surveyConfig,
      serviceDefinitionsCount: surveyConfig?.serviceDefinitions?.length || 0,
      responsesKeys: Object.keys(responses),
      customerType: customerType
    });
  }

  // serviceKey -> label を返すヘルパー（新しい形式対応）
  const getLabelFromKey = useCallback((key: string): string => {
    try {
      console.log(`[getLabelFromKey] 変換を開始: ${key}`, {
        surveyConfigExists: !!surveyConfig,
        serviceDefinitionsCount: surveyConfig?.serviceDefinitions?.length || 0,
        usagePurposeLabelsExists: !!state?.usagePurposeLabels,
        usagePurposeExists: !!state?.usagePurpose
      });

      // 新しい形式：surveyConfigのserviceDefinitionsから検索
      if (surveyConfig && surveyConfig.serviceDefinitions) {
        const serviceDef = surveyConfig.serviceDefinitions.find(s => s.key === key);
        if (serviceDef) {
          console.log(`[getLabelFromKey] serviceDefinitionsから見つかりました: ${key} -> ${serviceDef.label}`);
          return serviceDef.label;
        }
        console.log(`[getLabelFromKey] serviceDefinitionsで見つからず: ${key}`);
      }
      
      // フォールバック：従来形式
      if (state?.usagePurposeLabels && state?.usagePurpose) {
        const index = state.usagePurpose.indexOf(key);
        if (index !== -1 && state.usagePurposeLabels[index]) {
          console.log(`[getLabelFromKey] usagePurposeLabelsから見つかりました: ${key} -> ${state.usagePurposeLabels[index]}`);
          return state.usagePurposeLabels[index];
        }
        console.log(`[getLabelFromKey] usagePurposeLabelsで見つからず: ${key}, index: ${index}`);
      }
      
      console.warn(`[getLabelFromKey] ラベルが見つからないためキーをそのまま返却: ${key}`);
      return key;
    } catch (error) {
      console.error(`[getLabelFromKey] エラーが発生: ${key}`, error);
      return key;
    }
  }, [surveyConfig, state?.usagePurposeLabels, state?.usagePurpose]);

  // 共通の選択肢表示コンポーネント
  const ChoiceItem: React.FC<{
    label: string;
    theme?: 'default' | 'primary' | 'green' | 'amber';
    size?: 'sm' | 'md';
  }> = ({ label, theme = 'default', size = 'md' }) => {
    const themeStyles = {
      default: {
        container: 'bg-white/90 border-gray-100',
        icon: 'bg-gray-400'
      },
      primary: {
        container: 'bg-white/90 border-gray-100',
        icon: 'bg-primary'
      },
      green: {
        container: 'bg-white/90 border-emerald-100',
        icon: 'bg-emerald-500'
      },
      amber: {
        container: 'bg-white/90 border-amber-100',
        icon: 'bg-amber-500'
      }
    };

    const sizeStyles = {
      sm: {
        container: 'px-3 py-2 md:px-4 md:py-2.5',
        icon: 'w-4 h-4 md:w-5 md:h-5',
        checkIcon: 'w-2.5 h-2.5 md:w-3 md:h-3',
        text: 'text-xs md:text-sm'
      },
      md: {
        container: 'px-3 py-2 md:px-4 md:py-2.5',
        icon: 'w-5 h-5 md:w-6 md:h-6',
        checkIcon: 'w-3 h-3 md:w-3.5 md:h-3.5',
        text: 'text-xs md:text-sm'
      }
    };

    const themeStyle = themeStyles[theme];
    const sizeStyle = sizeStyles[size];

    return (
      <div className={cn(
        "flex items-center gap-2.5 md:gap-3 rounded-lg md:rounded-xl border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200",
        sizeStyle.container,
        themeStyle.container
      )}>
        <div className={cn(
          "rounded-full flex items-center justify-center",
          sizeStyle.icon,
          themeStyle.icon
        )}>
          <Check className={cn("text-white", sizeStyle.checkIcon)} />
        </div>
        <span className={cn("text-gray-800 font-medium", sizeStyle.text)}>{label}</span>
      </div>
    );
  };

  // セクションカードコンポーネント
  const SectionCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    theme: 'primary' | 'green' | 'amber';
    children: React.ReactNode;
  }> = ({ title, icon, theme, children }) => {
    const themeStyles = {
      primary: {
        container: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/15',
        header: 'bg-primary/10 border-primary/20',
        titleColor: 'text-primary-text',
        iconBg: 'bg-primary'
      },
      green: {
        container: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100',
        header: 'bg-emerald-100/50 border-emerald-200',
        titleColor: 'text-emerald-800',
        iconBg: 'bg-emerald-500'
      },
      amber: {
        container: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100',
        header: 'bg-amber-100/50 border-amber-200',
        titleColor: 'text-amber-800',
        iconBg: 'bg-amber-500'
      }
    };

    const style = themeStyles[theme];

    return (
      <div className={cn("rounded-xl border-2 shadow-sm overflow-hidden", style.container)}>
        <div className={cn("px-5 py-3 border-b", style.header)}>
          <h5 className={cn("font-bold text-sm flex items-center gap-3", style.titleColor)}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", style.iconBg)}>
              {icon}
            </div>
            {title}
          </h5>
        </div>
        <div className="p-3 md:p-4">
          {children}
        </div>
      </div>
    );
  };

  // 条件表示のチェック（UnifiedSurveyと同じロジック、新しいレスポンス形式対応）
  const shouldShowQuestion = useCallback((questionCard: QuestionCard, responses: Record<string, any>): boolean => {
    console.log(`[shouldShowQuestion] 条件表示チェック開始: ${questionCard.id}`);
    
    if (!questionCard.conditionalDisplay) {
      console.log(`[shouldShowQuestion] ${questionCard.id}: 条件なし -> 表示`);
      return true;
    }
    
    const { dependsOn, showWhen } = questionCard.conditionalDisplay;
    const dependentResponse = responses[dependsOn];
    
    console.log(`[shouldShowQuestion] ${questionCard.id}:`, {
      dependsOn,
      showWhen,
      dependentResponse,
      responseType: typeof dependentResponse
    });
    
    // 依存する質問の回答を正規化
    let dependentValue: string | string[] | null = null;
    
    if (!dependentResponse) {
      console.log(`[shouldShowQuestion] ${questionCard.id}: 依存する回答がない -> 非表示`);
      return false;
    }
    
    // レスポンス形式に応じて値を抽出
    if (typeof dependentResponse === 'string') {
      dependentValue = dependentResponse;
    } else if (Array.isArray(dependentResponse)) {
      dependentValue = dependentResponse;
    } else if (typeof dependentResponse === 'object') {
      // SingleChoiceResponse または MultipleChoiceResponse の場合
      if ('value' in dependentResponse) {
        dependentValue = dependentResponse.value;
      } else if ('values' in dependentResponse) {
        dependentValue = dependentResponse.values;
      }
    }
    
    console.log(`[shouldShowQuestion] ${questionCard.id}: 正規化された値:`, dependentValue);
    
    if (!dependentValue) {
      console.log(`[shouldShowQuestion] ${questionCard.id}: 正規化後の値がない -> 非表示`);
      return false;
    }
    
    let shouldShow = false;
    
    // 条件チェック
    if (Array.isArray(showWhen)) {
      // showWhenが配列の場合 - dependentValueがいずれかの値を含むかチェック
      if (Array.isArray(dependentValue)) {
        shouldShow = showWhen.some(condition => dependentValue.includes(condition));
      } else {
        shouldShow = showWhen.includes(dependentValue);
      }
    } else {
      // showWhenが単一値の場合
      if (Array.isArray(dependentValue)) {
        shouldShow = dependentValue.includes(showWhen);
      } else {
        shouldShow = dependentValue === showWhen;
      }
    }
    
    console.log(`[shouldShowQuestion] ${questionCard.id}: 結果 -> ${shouldShow ? '表示' : '非表示'}`);
    return shouldShow;
  }, []);

  // 質問タイプに応じたアイコンの取得
  const getQuestionIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'customer-type':
        return <CalendarDays className="w-5 h-5" />;
      case 'multiple-choice':
      case 'single-choice':
        return <Check className="w-5 h-5" />;
      case 'rating-scale':
        return <ThumbsUp className="w-5 h-5" />;
      case 'text-input':
        return <MessageSquare className="w-5 h-5" />;
      case 'service-evaluation':
      case 'service-usage':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  // 質問タイプに応じたアクセントカラーの取得
  const getQuestionAccent = (type: string): 'primary' | 'green' | 'amber' => {
    switch (type) {
      case 'customer-type':
        return 'primary'; // ピンク（primary）
      case 'service-evaluation':
      case 'service-usage':
        return 'primary'; // 緑からピンクに変更
      default:
        return 'primary';
    }
  };

  // 質問応答のレンダリング - 洗練されたUIデザイン
  const renderQuestionResponse = useCallback((questionCard: QuestionCard, response: any): React.ReactNode => {
    if (!response) return (
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/60 rounded-xl border border-gray-100">
        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
        <span className="text-gray-500 text-sm italic">未回答</span>
      </div>
    );

    switch (questionCard.type) {
      case 'customer-type':
        const customerTypeLabels = {
          'new': '初回ご利用のお客様',
          'second-visit': '2回目ご利用のお客様',
          'repeater': '3回以上ご利用のお客様'
        };
        const typeIcons = {
          'new': '🆕',
          'second-visit': '🔄', 
          'repeater': '👑'
        };
        return (
          <div className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/15 shadow-sm">
            <span className="text-lg md:text-xl">{typeIcons[response as keyof typeof typeIcons] || '👤'}</span>
            <span className="font-semibold text-primary-text text-sm md:text-base">{customerTypeLabels[response as keyof typeof customerTypeLabels] || response}</span>
          </div>
        );
      
      case 'single-choice':
        // 新しいSingleChoiceResponse形式のサポート
        if (typeof response === 'object' && response !== null && 'value' in response) {
          const singleResponse = response as { value: string; otherText?: string };
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 md:gap-3 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-white to-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                </div>
                <span className="font-medium text-gray-800 text-xs md:text-sm">{singleResponse.value}</span>
              </div>
              {singleResponse.otherText && (
                <div className="ml-6 md:ml-8 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-lg border-l-3 md:border-l-4 border-primary/40 shadow-sm">
                  <div className="flex items-start gap-1.5 md:gap-2">
                    <span className="text-primary-text text-xs md:text-sm font-medium">その他:</span>
                    <span className="text-gray-700 text-xs md:text-sm leading-relaxed italic font-medium">"{singleResponse.otherText}"</span>
                  </div>
                </div>
              )}
            </div>
          );
        }
        // 後方互換性のための従来形式
        return (
          <div className="flex items-center gap-2.5 md:gap-3 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-white to-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
            </div>
            <span className="font-medium text-gray-800 text-xs md:text-sm">{response}</span>
          </div>
        );
      
      case 'multiple-choice':
        // 新しいMultipleChoiceResponse形式のサポート
        if (typeof response === 'object' && response !== null && 'values' in response) {
          const multiResponse = response as { values: string[]; otherText?: string };
          return (
            <div className="space-y-2 md:space-y-3">
              <div className="grid gap-1.5 md:gap-2">
                {multiResponse.values.map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5 md:gap-3 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-white to-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                    </div>
                    <span className="text-gray-800 text-xs md:text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              {multiResponse.otherText && (
                <div className="ml-6 md:ml-8 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-lg border-l-3 md:border-l-4 border-primary/40 shadow-sm">
                  <div className="flex items-start gap-1.5 md:gap-2">
                    <span className="text-primary-text text-xs md:text-sm font-medium">その他:</span>
                    <span className="text-gray-700 text-xs md:text-sm leading-relaxed italic font-medium">"{multiResponse.otherText}"</span>
                  </div>
                </div>
              )}
            </div>
          );
        }
        // 後方互換性のための従来形式
        if (Array.isArray(response)) {
          return (
            <div className="grid gap-1.5 md:gap-2">
              {response.map((item, index) => (
                <div key={index} className="flex items-center gap-2.5 md:gap-3 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-white to-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                  </div>
                  <span className="text-gray-800 text-xs md:text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          );
        }
        return <span>{response}</span>;
      
      case 'rating-scale':
        // レーティング評価は Array<{ category: string; rating: string }> 形式で保存されている
        if (Array.isArray(response)) {
          return (
            <div className="space-y-2 md:space-y-3">
              {response.map((rating, index) => {
                const getRatingColor = (ratingValue: string) => {
                  if (ratingValue === '良い' || ratingValue === 'とても良い') {
                    return {
                      bg: 'bg-emerald-50',
                      border: 'border-emerald-200',
                      text: 'text-emerald-700',
                      emoji: '😊'
                    };
                  }
                  if (ratingValue === '普通') {
                    return {
                      bg: 'bg-gray-50',
                      border: 'border-gray-200', 
                      text: 'text-gray-700',
                      emoji: '😐'
                    };
                  }
                  if (ratingValue === '要改善' || ratingValue === '大幅に要改善') {
                    return {
                      bg: 'bg-amber-50',
                      border: 'border-amber-200',
                      text: 'text-amber-700',
                      emoji: '😞'
                    };
                  }
                  return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-700',
                    emoji: '📊'
                  };
                };
                
                const colorScheme = getRatingColor(rating.rating);
                
                return (
                  <div key={`${rating.category}-${index}`} 
                       className={cn(
                         "flex justify-between items-center px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl border md:border-2 shadow-sm hover:shadow-md transition-all duration-200",
                         colorScheme.bg,
                         colorScheme.border
                       )}>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-br from-primary/60 to-primary opacity-80"></div>
                      <span className="font-medium text-gray-800 text-xs md:text-sm">{rating.category}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 md:gap-3 min-w-[80px] md:min-w-[100px]">
                      <span className="text-lg md:text-xl flex-shrink-0">{colorScheme.emoji}</span>
                      <span className={cn("font-semibold text-xs md:text-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full text-center flex-shrink-0", colorScheme.text, colorScheme.bg.replace('50', '100'))}>{rating.rating}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
        // 後方互換性：オブジェクト形式の場合
        if (typeof response === 'object' && response !== null) {
          return (
            <div className="space-y-2">
              {Object.entries(response).map(([category, rating]) => (
                <div key={category} className="flex justify-between items-center px-4 py-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <span className="text-sm font-medium text-gray-700">{category}:</span>
                  <span className="font-semibold text-primary-text">{String(rating)}</span>
                </div>
              ))}
            </div>
          );
        }
        return <span>{response}</span>;
      
      case 'text-input':
        return (
          <div className="px-3 py-2.5 md:px-4 md:py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg md:rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-start gap-2 md:gap-3">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-800 leading-relaxed text-xs md:text-sm font-medium italic">{response}</p>
            </div>
          </div>
        );
      
      case 'service-usage':
        console.log(`[service-usage] レンダリング開始:`, {
          responseType: typeof response,
          isArray: Array.isArray(response),
          hasValues: response && typeof response === 'object' && 'values' in response,
          response: response
        });

        // 配列形式を最初にチェック（現在の実装で使用されている形式）
        if (Array.isArray(response)) {
          console.log(`[service-usage] 配列形式で処理:`, response);
          
          return (
            <div className="grid gap-1.5 md:gap-2">
              {response.map((serviceKey, index) => {
                const label = getLabelFromKey(serviceKey);
                return <ChoiceItem key={index} label={label} theme="primary" size="md" />;
              })}
            </div>
          );
        }

        // MultipleChoiceResponse形式のサポート（将来的な拡張用）
        if (typeof response === 'object' && response !== null && 'values' in response) {
          const multiResponse = response as { values: string[]; otherText?: string };
          console.log(`[service-usage] MultipleChoiceResponse形式で処理:`, multiResponse);
          
          return (
            <div className="space-y-2 md:space-y-3">
              <div className="grid gap-1.5 md:gap-2">
                {multiResponse.values.map((serviceKey, index) => {
                  const label = getLabelFromKey(serviceKey);
                  return <ChoiceItem key={index} label={label} theme="primary" size="md" />;
                })}
              </div>
              {multiResponse.otherText && (
                <div className="ml-6 md:ml-8 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-lg border-l-3 md:border-l-4 border-primary/40 shadow-sm">
                  <div className="flex items-start gap-1.5 md:gap-2">
                    <span className="text-primary-text text-xs md:text-sm font-medium">その他:</span>
                    <span className="text-gray-700 text-xs md:text-sm leading-relaxed italic font-medium">"{multiResponse.otherText}"</span>
                  </div>
                </div>
              )}
            </div>
          );
        }

        console.warn(`[service-usage] 予期しない形式:`, response);
        return <span className="text-red-500">表示エラー: 予期しない形式</span>;
      
      case 'service-evaluation':
        // 新しいサービス評価形式の対応 ({ satisfied: [], improvement: [], otherSatisfied: '', otherImprovement: '' })
        if (typeof response === 'object' && response !== null) {
          // 新しい構造化形式
          if ('satisfied' in response || 'improvement' in response) {
            const evaluationResponse = response as { 
              satisfied?: string[]; 
              improvement?: string[]; 
              otherSatisfied?: string; 
              otherImprovement?: string;
            };
            
            return (
              <div className="space-y-6">
                {/* 満足点セクション */}
                {evaluationResponse.satisfied && evaluationResponse.satisfied.length > 0 && (
                  <SectionCard title="良かった点" icon={<ThumbsUp className="w-4 h-4 text-white" />} theme="green">
                    <div className="space-y-1.5 md:space-y-2">
                      {evaluationResponse.satisfied.map((item, index) => (
                        <ChoiceItem key={`satisfied-${index}`} label={item} theme="green" size="sm" />
                      ))}
                      {/* 満足点の「その他」 */}
                      {evaluationResponse.otherSatisfied && (
                        <div className="mt-4 px-4 py-3 bg-emerald-100/30 rounded-lg border-l-4 border-emerald-400">
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-700 text-sm font-semibold">その他:</span>
                            <span className="text-gray-700 text-sm leading-relaxed italic">{evaluationResponse.otherSatisfied}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionCard>
                )}
                
                {/* 改善点セクション */}
                {evaluationResponse.improvement && evaluationResponse.improvement.length > 0 && (
                  <SectionCard title="改善してほしい点" icon={<Info className="w-4 h-4 text-white" />} theme="amber">
                    <div className="space-y-1.5 md:space-y-2">
                      {evaluationResponse.improvement.map((item, index) => (
                        <ChoiceItem key={`improvement-${index}`} label={item} theme="amber" size="sm" />
                      ))}
                      {/* 改善点の「その他」 */}
                      {evaluationResponse.otherImprovement && (
                        <div className="mt-4 px-4 py-3 bg-amber-100/30 rounded-lg border-l-4 border-amber-400">
                          <div className="flex items-start gap-2">
                            <span className="text-amber-700 text-sm font-semibold">その他:</span>
                            <span className="text-gray-700 text-sm leading-relaxed italic">{evaluationResponse.otherImprovement}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionCard>
                )}
                
                {/* 何も選択されていない場合 */}
                {(!evaluationResponse.satisfied || evaluationResponse.satisfied.length === 0) &&
                 (!evaluationResponse.improvement || evaluationResponse.improvement.length === 0) && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/60 rounded-xl border border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    <span className="text-gray-500 text-sm italic">未選択</span>
                  </div>
                )}
              </div>
            );
          }
          
          // 旧式のMultipleChoiceResponse形式
          if ('values' in response) {
            const multiResponse = response as { values: string[]; otherText?: string };
            return (
              <div className="space-y-2">
                <div className="grid gap-1.5 md:gap-2">
                  {multiResponse.values.map((item, index) => (
                    <ChoiceItem key={index} label={item} theme="default" size="sm" />
                  ))}
                </div>
                {multiResponse.otherText && (
                  <div className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                    <span className="text-gray-500">その他: </span>
                    <span className="italic">{multiResponse.otherText}</span>
                  </div>
                )}
              </div>
            );
          }
        }
        
        // 後方互換性のための従来形式
        if (Array.isArray(response)) {
          return (
            <div className="grid gap-1.5 md:gap-2">
              {response.map((item, index) => (
                <ChoiceItem key={index} label={item} theme="default" size="sm" />
              ))}
            </div>
          );
        }
        return <span>{response}</span>;
      
      default:
        return <span>{String(response)}</span>;
    }
  }, [getLabelFromKey]);

  // 動的確認項目の生成
  const dynamicConfirmationItems = useMemo(() => {
    if (!surveyConfig || !responses) return [];

    const items: Array<{
      id: string;
      icon: React.ReactNode;
      title: string;
      content: React.ReactNode;
      accent?: 'primary' | 'green' | 'amber';
    }> = [];

    // customer-type質問のIDを動的に検出
    const customerTypeQuestion = surveyConfig.questionCards.find(q => q.type === 'customer-type')
    const customerTypeQuestionId = customerTypeQuestion?.id || 'customer-type'
    
    // 質問モードを取得（デフォルト: customer-type-based）
    const questionMode = surveyConfig.questionMode || 'customer-type-based'
    
    // ユーザーが回答した順序（質問フロー順）で表示
    let questionFlow: string[] = []
    let orderedQuestionIds: string[] = []
    
    if (questionMode === 'unified') {
      // 共通質問モード: customer-type質問なし
      const firstCustomerType = surveyConfig.customerTypes[0] || Object.keys(surveyConfig.questionFlow)[0] || 'new'
      questionFlow = surveyConfig.questionFlow[firstCustomerType] || []
      orderedQuestionIds = questionFlow
    } else {
      // 顧客タイプ別モード
      questionFlow = surveyConfig.questionFlow[customerType] || []
      orderedQuestionIds = [customerTypeQuestionId, ...questionFlow]
    }
    
    // 現在の顧客タイプに関連する回答のみをフィルタリング
    const filteredResponses: Record<string, any> = {};
    
    console.log('[確認画面] フィルタリング開始:', {
      customerType,
      questionFlow,
      orderedQuestionIds,
      allResponsesKeys: Object.keys(responses),
      allResponses: responses
    });
    
    for (const questionId of orderedQuestionIds) {
      if (responses[questionId] !== undefined) {
        filteredResponses[questionId] = responses[questionId];
        console.log(`[確認画面] フィルタリング保持: ${questionId}`, responses[questionId]);
      } else {
        console.log(`[確認画面] フィルタリング除外: ${questionId} (回答なし)`);
      }
    }
    
    console.log('[確認画面] フィルタリング完了:', {
      customerType,
      questionFlow,
      orderedQuestionIds,
      availableResponses: Object.keys(responses),
      filteredResponses: Object.keys(filteredResponses),
      filteredResponsesData: filteredResponses,
      removedResponses: Object.keys(responses).filter(key => !Object.keys(filteredResponses).includes(key))
    });

    // 質問フロー順に処理
    for (const questionId of orderedQuestionIds) {
      const questionCard = surveyConfig.questionCards.find(card => card.id === questionId);
      
      if (!questionCard) {
        console.warn(`質問カードが見つかりません: ${questionId}`);
        continue;
      }
      
      // 条件表示チェック（フィルタリングされた回答を使用）
      try {
        if (!shouldShowQuestion(questionCard, filteredResponses)) {
          console.log(`条件により非表示: ${questionId}`);
          continue;
        }
      } catch (error) {
        console.error(`条件表示チェックでエラーが発生: ${questionId}`, error);
        // エラーが発生した場合はデフォルトで表示する
        console.log(`エラーのため表示を続行: ${questionId}`);
      }
      
      const response = filteredResponses[questionCard.id];
      
      console.log(`[確認画面] 質問 ${questionId} の処理:`, {
        questionType: questionCard.type,
        required: questionCard.required,
        hasResponse: !!response,
        response: response,
        responseType: typeof response,
        isArray: Array.isArray(response)
      });
      
      // 未回答の任意質問はスキップ
      if (!response && !questionCard.required) {
        console.log(`未回答の任意質問をスキップ: ${questionId}`);
        continue;
      }
      
      // 未回答の必須質問も警告を出力
      if (!response && questionCard.required) {
        console.warn(`必須質問 ${questionId} に回答がありません`);
      }

      let content;
      try {
        content = renderQuestionResponse(questionCard, response);
      } catch (error) {
        console.error(`回答内容のレンダリングでエラーが発生: ${questionId}`, error);
        content = <span className="text-red-500">表示エラー</span>;
      }
      
      if (content) {
        console.log(`確認項目に追加: ${questionId} - ${questionCard.title}`);
        items.push({
          id: questionCard.id,
          icon: getQuestionIcon(questionCard.type),
          title: questionCard.title,
          content,
          accent: getQuestionAccent(questionCard.type)
        });
      } else {
        console.warn(`コンテンツが生成されませんでした: ${questionId}`);
      }
    }

    console.log('生成された確認項目:', items.map(item => ({ id: item.id, title: item.title })));
    return items;
  }, [surveyConfig, responses, customerType, renderQuestionResponse, shouldShowQuestion]);

  // 戻るボタン - スマホフレンドリーに改善
  const handleBack = useCallback((event?: React.MouseEvent | React.TouchEvent) => {
    // 即座にrefを更新（同期的）- 最優先で設定
    actionTypeRef.current = 'back';

    // 既にナビゲーション中または送信中の場合は処理しない
    if (isNavigating || isSubmitting) {
      console.log('Navigation or submission already in progress, ignoring back button');
      return;
    }

    // イベントの伝播とデフォルト動作を防ぐ
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      // ネイティブイベントの場合のみstopImmediatePropagationを呼び出し
      if ('nativeEvent' in event && 'stopImmediatePropagation' in event.nativeEvent) {
        (event.nativeEvent as Event).stopImmediatePropagation();
      }
    }

    console.log('Back button clicked, navigating to review form');

    // 戻るボタンが押されたことを即座に明示
    setActionType('back');
    setIsNavigating(true);

    // 即座にナビゲーションを実行（遅延を削除）
    try {
      // ReviewForm画面へ戻る際に現在のステートを引き継ぐ
      navigate('/reviewform', {
        state: {
          ...state,
          // 現在のフィードバック内容も含めて渡す
          feedback: state?.feedback || '',
        },
        replace: true, // ブラウザの戻るボタンでこの画面に戻らないようにする
      });
    } catch (error) {
      console.error('ナビゲーションエラー:', error);
      // エラーが発生した場合はフラグをリセット
      setIsNavigating(false);
      setActionType(null);
      actionTypeRef.current = null;
    }
  }, [navigate, state, isNavigating, isSubmitting]);

  // 送信ボタン - スマホフレンドリーに改善
  const handleSubmit = useCallback(async (event?: React.MouseEvent | React.FormEvent | React.TouchEvent) => {
    // refで即座にチェック（同期的）
    if (actionTypeRef.current === 'back' || isNavigating || isSubmitting) {
      return;
    }

    // イベントの伝播とデフォルト動作を防ぐ
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // 送信ボタンが押されたことを明示（refも更新）
    actionTypeRef.current = 'submit';
    setActionType('submit');
    setIsSubmitting(true);

    // 送信APIがある場合は、送信処理
    if (!apiEndpoint) {
      alert('APIエンドポイントが設定されていません。AWS SSMパラメータ「/c-links-survey/api-endpoint-url」を確認してください。');
      setIsSubmitting(false);
      setActionType(null);
      return;
    }

    // AWS SESバックエンド（Lambda）のためにデータ構造を整える（新しい形式対応）
    const submitData = {
      // 新しい形式の全てのデータを含む
      ...state,
      // 後方互換性のため従来形式も生成
      usagePurposeKeys: state.usagePurpose,
      usagePurposeLabels: state.usagePurposeLabels,
      // 顧客タイプ別のフラグ（従来互換）
      isNewCustomer: state.customerType === 'new',
      isSecondVisit: state.customerType === 'second-visit',
      isRepeater: state.customerType === 'repeater',
      // 通常の投稿である
      isGoogleReview: false
    };

    try {
      // POST送信
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        throw new Error('APIからエラーレスポンスが返されました');
      }
      
      navigate('/thankyou');
    } catch (error) {
      console.error('データ送信中にエラーが発生しました:', error);
      alert(`送信中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSubmitting(false);
      setActionType(null);
    }
  }, [isNavigating, isSubmitting, apiEndpoint, state, navigate]);

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

  // 確認項目のレンダリング用コンポーネント - プレミアムデザイン
  const ConfirmationItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
    className?: string;
    accent?: 'primary' | 'green' | 'amber';
  }> = ({ icon, title, content, className, accent = 'primary' }) => {
    const accentStyles = {
      primary: {
        gradient: 'bg-gradient-to-br from-primary/8 via-primary/5 to-primary/12',
        border: 'border-primary/25',
        headerBg: 'bg-gradient-to-r from-primary/15 to-primary/20',
        iconBg: 'bg-primary text-primary-foreground shadow-primary/25',
        titleColor: 'text-primary-text'
      },
      green: {
        gradient: 'bg-gradient-to-br from-emerald-50 via-green-50/80 to-emerald-100/60',
        border: 'border-emerald-200/80',
        headerBg: 'bg-gradient-to-r from-emerald-100/70 to-green-100/70',
        iconBg: 'bg-emerald-500 text-white shadow-emerald-300/40',
        titleColor: 'text-emerald-700'
      },
      amber: {
        gradient: 'bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/60',
        border: 'border-amber-200/80',
        headerBg: 'bg-gradient-to-r from-amber-100/70 to-orange-100/70',
        iconBg: 'bg-amber-500 text-white shadow-amber-300/40',
        titleColor: 'text-amber-700'
      }
    };
    
    const styles = accentStyles[accent];
    
    return (
      <div className={cn(
        "rounded-2xl border-2 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm",
        styles.gradient,
        styles.border,
        className
      )}>
        <div className={cn(
          "flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 border-b-2 border-white/40",
          styles.headerBg
        )}>
          <div className={cn(
            "p-2 md:p-3 rounded-lg md:rounded-xl shadow-lg transition-transform duration-300 hover:scale-110",
            styles.iconBg
          )}>
            {React.cloneElement(icon as React.ReactElement, { 
              className: "w-5 h-5 md:w-6 md:h-6" 
            })}
          </div>
          <h3 className={cn(
            "font-bold text-sm md:text-lg tracking-wide leading-tight",
            styles.titleColor
          )}>
            {title}
          </h3>
        </div>
        <div className="p-4 md:p-6 bg-white/90 backdrop-blur-sm">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        // refで即座にチェック（同期的）
        if (actionTypeRef.current === 'back' || isNavigating || isSubmitting) {
          return;
        }
        handleSubmit(e);
      }}>
        <PageLayout
          title="入力内容の確認"
          subtitle="入力内容をご確認ください。問題がなければ「送信する」ボタンを押してください。"
        >
          {/* ローディングオーバーレイ */}
          <LoadingOverlay visible={isSubmitting} message="データを送信中..." />
          
          <div className="sm:mb-8 mb-4 -mt-2">
            <ProgressBar 
              currentStep={3} 
              totalSteps={3} 
              steps={progressSteps}
              className="scale-90 origin-top sm:scale-100"
            />
          </div>

          <div className="max-w-3xl mx-auto sm:mt-0 -mt-2">
            <div className="grid grid-cols-1 gap-5 md:gap-6">
              {/* 動的確認項目の表示 */}
              {dynamicConfirmationItems.length > 0 ? (
                dynamicConfirmationItems.map((item) => (
                  <ConfirmationItem
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    content={item.content}
                    accent={item.accent}
                  />
                ))
              ) : (
                /* フォールバック：従来の静的表示 */
                <>
                  {/* ご利用状況 */}
                  <ConfirmationItem
                    icon={<Info className="h-5 w-5" />}
                    title="ご利用状況"
                    content={
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary-text mt-0.5 flex-shrink-0" />
                        <div className="text-[14px] text-gray-700">
                          {state.isNewCustomer && "🆕 初めてのご利用"}
                          {state.isSecondVisit && "🔄 2回目のご利用"}
                          {state.isRepeater && "👑 3回以上のご利用"}
                        </div>
                      </div>
                    }
                  />
                </>
              )}

              {/* 感想・フィードバック（常に表示、新旧両形式対応） */}
              {state.feedback && (
                <ConfirmationItem
                  icon={<MessageSquare className="h-5 w-5" />}
                  title="ご感想・コメント"
                  content={
                    <div className="px-3 py-2.5 md:px-4 md:py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg md:rounded-xl border border-blue-100 shadow-sm">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed text-xs md:text-sm font-medium whitespace-pre-wrap italic">
                            "{state.feedback}"
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                  accent="primary"
                />
              )}

            </div>
          </div>

          <div className="mt-10">
            <FormButtons 
              onBack={handleBack} 
              onNext={handleSubmit}
              backButtonText={
                isNavigating && actionType === 'back' ? '処理中...' : '戻る'
              }
              nextButtonText={
                isSubmitting ? 'データ送信中...' : '送信する'
              }
              disabled={isNavigating || isSubmitting}
            />
          </div>
        </PageLayout>
      </form>
    </div>
  );
};

export default Confirmation;
