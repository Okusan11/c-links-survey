import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import RequiredFormLabel from './common/RequiredFormLabel';
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
            <RequiredFormLabel label="当サロンのご利用に関する感想をご自由にお書きください" />
            
            <Textarea
              value={feedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setFeedback(e.target.value);
                setError(false);
              }}
              placeholder="サービスの感想や、改善点などをご自由にお書きください。"
              className={error ? "border-destructive" : ""}
              rows={6}
            />
            
            {error && (
              <p className="text-destructive text-sm">感想を入力してください。</p>
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
