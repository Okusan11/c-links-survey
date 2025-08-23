import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn, scrollToFirstError, hasErrors } from '../lib/utils';
import { AlertCircle } from 'lucide-react';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import RequiredBadge from './common/RequiredBadge';
import { ProgressBar } from './common/ProgressBar';

const ReviewForm: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  
  // 新しいSurveyConfig形式に対応（state内の全ての値を適切に受け取り、引き継ぎ）
  const [feedback, setFeedback] = useState<string>(state?.feedback || '');
  const [error, setError] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'back' | 'next' | null>(null);

  // 戻るボタン - スマホフレンドリーに改善
  const handleBack = useCallback((event?: React.MouseEvent | React.TouchEvent) => {
    // 既にナビゲーション中の場合は処理しない
    if (isNavigating) {
      console.log('Navigation already in progress, ignoring back button');
      return;
    }

    // イベントの伝播とデフォルト動作を防ぐ
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      // ネイティブイベントの場合のみstopImmediatePropagationを呼び出し
      if ('stopImmediatePropagation' in event.nativeEvent) {
        event.nativeEvent.stopImmediatePropagation();
      }
    }

    console.log('Back button clicked, navigating to google account');

    // 戻るボタンが押されたことを即座に明示
    setActionType('back');
    setIsNavigating(true);

    // 即座にナビゲーションを実行（遅延を削除）
    try {
      // Google確認画面に戻る際に、現在のフィードバックを含めて状態を保持
      // 新しいSurveyConfig形式の全ての状態を適切に引き継ぎ
      navigate('/googleaccount', {
        state: {
          ...state, // responses、surveyConfig、その他全ての状態を保持
          feedback,
          // responsesが存在する場合は明示的に保持
          responses: state?.responses || {},
        },
        replace: true, // ブラウザの戻るボタンでこの画面に戻らないようにする
      });
    } catch (error) {
      console.error('ナビゲーションエラー:', error);
      // エラーが発生した場合はフラグをリセット
      setIsNavigating(false);
      setActionType(null);
    }
  }, [navigate, state, feedback, isNavigating]);

  // 次へボタン - スマホフレンドリーに改善
  const handleNext = useCallback((event?: React.MouseEvent | React.FormEvent | React.TouchEvent) => {
    // 既にナビゲーション中、または戻るボタンが押された場合は処理しない
    if (isNavigating || actionType === 'back') {
      return;
    }

    // イベントの伝播とデフォルト動作を防ぐ
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // エラー状態をリセット
    const newErrors = {
      feedback: false
    };

    if (!feedback.trim()) {
      newErrors.feedback = true;
    }

    // エラーがあれば最初のエラー項目にスクロール
    if (hasErrors(newErrors)) {
      setError(true);
      scrollToFirstError(newErrors, {
        feedback: '[data-question="feedback"]'
      });
      return;
    }

    // 次へボタンが押されたことを明示
    setActionType('next');
    setIsNavigating(true);

    try {
      // 確認画面へ遷移（新しいSurveyConfig形式の全ての状態を引き継ぎ）
      navigate('/confirmation', {
        state: {
          ...state, // responses、surveyConfig、その他全ての状態を保持
          feedback,
        },
        replace: true, // ブラウザの戻るボタンでこの画面に戻らないようにする
      });
    } catch (error) {
      console.error('ナビゲーションエラー:', error);
      setIsNavigating(false);
      setActionType(null);
    }
  }, [isNavigating, actionType, feedback, navigate, state]);

  const subtitle = 'ご利用いただいた際の感想をお聞かせください。今後のサービス向上に活用させていただきます。';

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
      // 戻るボタンが押された場合またはナビゲーション中の場合はsubmitを無視
      if (actionType === 'back' || isNavigating) {
        console.log('Form submit ignored due to back action or navigation in progress');
        return;
      }
      // フォーカスされた要素が戻るボタンの場合もsubmitを無視
      const activeElement = document.activeElement;
      if (activeElement && activeElement.textContent?.includes('戻る')) {
        console.log('Form submit ignored due to back button focus');
        return;
      }
      handleNext(e);
    }}>
      <PageLayout
        title="ご感想の入力をお願いします"
        subtitle={subtitle}
      >
        <ProgressBar 
          currentStep={3} 
          totalSteps={3} 
          steps={progressSteps}
        />

        <QuestionBox>
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100" data-question="feedback">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                  ご意見・ご感想を自由にお書きください
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">サービスの感想や改善点などをご自由にお書きください</p>
              </div>
            </div>
            
            <textarea
              id="feedback"
              rows={6}
              className={cn(
                "mt-4 block w-full rounded-xl border shadow-sm focus:border-primary focus:ring-primary focus:ring-2 resize-none p-4 text-base",
                error ? "border-rose-500 ring-1 ring-rose-500" : "border-gray-300"
              )}
              placeholder="ご感想をお聞かせください..."
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setError(false);
              }}
            />
            
            {error && (
              <div className="text-rose-500 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                感想を入力してください
              </div>
            )}
          </div>
        </QuestionBox>

        <FormButtons 
          onBack={handleBack} 
          onNext={handleNext}
          backButtonText={
            isNavigating && actionType === 'back' ? '処理中...' : '戻る'
          }
          nextButtonText={
            isNavigating && actionType === 'next' ? '処理中...' : '確認画面へ'
          }
          disabled={isNavigating}
        />
      </PageLayout>
    </form>
  );
};

export default ReviewForm;
