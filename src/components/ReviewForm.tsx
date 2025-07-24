import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';
import { cn } from '../lib/utils';
import { AlertCircle } from 'lucide-react';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import RequiredBadge from './common/RequiredBadge';
import { ProgressBar } from './common/ProgressBar';

// UI コンポーネント
import { Textarea } from '../ui/textarea';

const ReviewForm: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [feedback, setFeedback] = useState<string>(state?.feedback || '');
  const [error, setError] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'back' | 'next' | null>(null);

  // 戻るボタン - スマホフレンドリーに改善
  const handleBack = useCallback((event?: React.MouseEvent | React.TouchEvent) => {
    // 既にナビゲーション中の場合は処理しない
    if (isNavigating) {
      return;
    }

    // イベントの伝播とデフォルト動作を防ぐ
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // 戻るボタンが押されたことを明示
    setActionType('back');
    setIsNavigating(true);

    try {
      // Google確認画面に戻る際に、現在のフィードバックを含めて状態を保持
      navigate('/googleaccount', {
        state: {
          ...state,
          feedback,
        },
        replace: true, // ブラウザの戻るボタンでこの画面に戻らないようにする
      });
    } catch (error) {
      console.error('ナビゲーションエラー:', error);
      // エラーが発生した場合はフラグをリセット
      setIsNavigating(false);
      setActionType(null);
    }
  }, [isNavigating, navigate, state, feedback]);

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

    if (!feedback.trim()) {
      setError(true);
      return;
    }

    // 次へボタンが押されたことを明示
    setActionType('next');
    setIsNavigating(true);

    try {
      // 確認画面へ遷移
      navigate('/confirmation', {
        state: {
          ...state,
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
      // 戻るボタンが押された場合はsubmitを無視
      if (actionType === 'back') {
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
            <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100">
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
