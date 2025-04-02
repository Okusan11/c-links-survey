import React, { useState } from 'react';
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

  // 戻るボタン
  const handleBack = () => {
    navigate('/googleaccount', {
      state: {
        ...state,
        feedback,
      },
    });
  };

  // 送信ボタン
  const handleNext = (event?: React.MouseEvent | React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (!feedback.trim()) {
      setError(true);
      return;
    }

    // 確認画面へ遷移
    navigate('/confirmation', {
      state: {
        ...state,
        feedback,
      },
    });
  };

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
      handleNext();
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
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide">
                  ご意見・ご感想を自由にお書きください
                  <RequiredBadge />
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
          nextButtonText="確認画面へ" 
        />
      </PageLayout>
    </form>
  );
};

export default ReviewForm;
