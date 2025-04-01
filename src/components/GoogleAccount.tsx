import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import { requiredLabelStyle } from '../styles/theme';
import { ProgressBar } from './common/ProgressBar';

// 型とデータのインポート
import { getSurveyConfig } from '../config/surveyConfig';
import { SurveyConfig, ServiceKey } from '../types';

const GoogleAccount: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 環境変数からURL/エンドポイントを取得
  const googleReviewUrl =
    process.env.REACT_APP_GMAP_REVIEW_URL || 'https://www.google.com/maps';
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';

  // SurveyConfigを読み込み
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

  useEffect(() => {
    getSurveyConfig().then(config => {
      setSurveyConfig(config);
    });
  }, []);

  // serviceKey -> label を返すヘルパー
  const getLabelFromKey = (key: ServiceKey): string => {
    if (!surveyConfig) return '';
    const found = surveyConfig.serviceDefinitions.find((item) => item.key === key);
    return found ? found.label : '';
  };

  // usagePurpose は serviceKey[] (SurveyForm.tsx でそう送ってきた想定)
  const usagePurposeKeys: ServiceKey[] = state?.usagePurpose || [];

  // usagePurposeKeys をラベルに変換した配列
  const usagePurposeLabels = usagePurposeKeys.map((key) => getLabelFromKey(key));

  const [hasGoogleAccount, setHasGoogleAccount] = useState<string>(state?.hasGoogleAccount || '');

  // 必要であればデストラクチャリングしておく
  const {
    visitDate,
    heardFrom,
    otherHeardFrom,
    satisfiedPoints,
    improvementPoints,
    feedback,
    isNewCustomer
  } = state || {};

  // 戻るボタン
  const handleBack = () => {
    // SurveyFormに戻り、入力内容を保持しておく
    navigate('/surveyform', {
      state: {
        visitDate,
        heardFrom,
        otherHeardFrom,
        usagePurpose: usagePurposeKeys,
        usagePurposeLabels,
        satisfiedPoints,
        improvementPoints,
        hasGoogleAccount,
        feedback,
        isNewCustomer
      },
    });
  };
  
  // 次へボタン
  const handleNext = (event?: React.FormEvent) => {
    // イベントがある場合はpreventDefaultを呼び出す
    if (event) {
      event.preventDefault();
    }

    if (!hasGoogleAccount) {
      alert('Googleアカウントをお持ちですか？の質問に回答してください。');
      return;
    }

    const data = {
      visitDate,
      heardFrom,
      otherHeardFrom,
      usagePurpose: usagePurposeKeys,
      usagePurposeLabels,
      satisfiedPoints,
      improvementPoints,
      hasGoogleAccount,
      feedback,
      isNewCustomer
    };

    // 送信データの確認
    console.log('送信するstateの中身', data);

    if (hasGoogleAccount === 'yes') {
      // API Gateway へデータを送信するが、レスポンスを待たずに画面遷移
      if (!apiEndpoint) {
        alert('APIエンドポイントが設定されていません。');
        return;
      }

      // --- fetchは投げるがawaitしない ---
      fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch((error) => {
        // 失敗した場合も、一旦はコンソールエラーのみ表示
        console.error('データ送信中にエラーが発生しました:', error);
      });

      // 非同期のAPI送信を待たずに、すぐにGoogleMapへ
      window.location.href = googleReviewUrl;
    } else {
      // Googleアカウントがない場合は感想入力画面へ遷移
      navigate('/reviewform', {
        state: data,
      });
    }
  };

  if (!surveyConfig) {
    return (
      <Typography variant="h6" color="error" textAlign="center" mt={10}>
        データを読み込んでいます...
      </Typography>
    );
  }

  const subtitle = '当サロンのサービスをご利用いただいた際の感想をぜひGoogle Mapの口コミとして投稿していただけますと幸いです！';

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
    <form onSubmit={handleNext}>
      <PageLayout
        title="Google Map口コミ\n投稿のご依頼"
        subtitle={subtitle}
      >
        <ProgressBar 
          currentStep={2} 
          totalSteps={3} 
          steps={progressSteps}
        />
        
        <QuestionBox>
          <FormControl component="fieldset" fullWidth margin="normal" required>
            <FormLabel component="legend">
              Googleアカウントをお持ちですか？
              <Typography component="span" sx={requiredLabelStyle}>
                必須
              </Typography>
            </FormLabel>
            <RadioGroup
              value={hasGoogleAccount}
              onChange={(e) => setHasGoogleAccount(e.target.value)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="はい" />
              <FormControlLabel value="no" control={<Radio />} label="いいえ" />
            </RadioGroup>
          </FormControl>
        </QuestionBox>

        <FormButtons 
          onBack={handleBack} 
          onNext={handleNext} 
          nextButtonText={hasGoogleAccount === 'yes' ? 'Google Mapへ' : '感想入力画面へ'} 
        />
      </PageLayout>
    </form>
  );
};

export default GoogleAccount;
