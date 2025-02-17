import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';

// ------------------------------
// 1. SurveyForm.tsx と同じ型定義を用意 (serviceKeyとconfig)
// ------------------------------
type ServiceKey = 'cut' | 'color' | 'perm' | 'straightPerm' | 'treatment' | 'headSpa' | 'hairSet';

interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  satisfiedOptions: string[];
  improvementOptions: string[];
}

interface SurveyConfig {
  heardFromOptions: string[];
  serviceDefinitions: ServiceDefinition[];
}

const GoogleAccount: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

  useEffect(() => {
    const rawConfig = process.env.REACT_APP_SURVEY_CONFIG;
    if (!rawConfig) {
      console.error('REACT_APP_SURVEY_CONFIG is not defined!');
      return;
    }
    try {
      const parsed = JSON.parse(rawConfig) as SurveyConfig;
      setSurveyConfig(parsed);
    } catch (err) {
      console.error('Failed to parse REACT_APP_SURVEY_CONFIG:', err);
    }
  }, []);

  // serviceKey -> label を返すヘルパー
  const getLabelFromKey = (key: ServiceKey): string => {
    if (!surveyConfig) return '';
    const found = surveyConfig.serviceDefinitions.find((item) => item.key === key);
    return found ? found.label : '';
  };

  // 受け取ったstateを必要な形にバラす
  const {
    visitDate,
    heardFrom,
    usagePurpose = [],
    satisfiedPoints,
    improvementPoints,
  } = state || {};

  // usagePurposeKeys をラベルに変換した配列
  const usagePurposeLabels = usagePurpose.map((key: ServiceKey) => getLabelFromKey(key));

  // Googleアカウントを持っているかどうか
  const [hasGoogleAccount, setHasGoogleAccount] = useState<string>('');

  // 戻るボタン
  const handleBack = () => {
    // SurveyForm に戻り、入力内容を保持しておく
    navigate('/surveyform', {
      state: {
        visitDate,
        heardFrom,
        usagePurpose,
        satisfiedPoints,
        improvementPoints,
      },
    });
  };

  // 次へボタン
  const handleNext = () => {
    if (!hasGoogleAccount) {
      alert('Googleアカウントをお持ちですか？の質問に回答してください。');
      return;
    }

    // 送信データの確認
    const data = {
      visitDate,
      heardFrom,
      usagePurpose,
      usagePurposeLabels,
      satisfiedPoints,
      improvementPoints,
      hasGoogleAccount,
    };
    console.log('送信するstateの中身', data);

    // 感想入力画面へ遷移
    navigate('/reviewform', {
      state: data,
    });
  };

  return (
    <Box
      // ↓フォームとしての見た目にするため component="form" だけ残し、onSubmitは削除
      component="form"
      sx={{
        maxWidth: 600,
        margin: '0 auto',
        backgroundColor: '#e0f7fa',
        padding: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h1" textAlign="center" mb={4} className="text">
        {'Google Map口コミ\n投稿のご依頼'}
      </Typography>

      <Typography variant="body1" textAlign="left" mb={4}>
        <div>
          当サロンのサービスをご利用いただいた際の感想をぜひGoogle Mapの口コミとして投稿していただけますと幸いです！
        </div>
      </Typography>

      <Box
        sx={{
          backgroundColor: '#fff',
          padding: 2,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: 3,
        }}
      >
        <FormControl component="fieldset" fullWidth margin="normal" required>
          <FormLabel component="legend">
            Googleアカウントをお持ちですか？
            <Typography
              component="span"
              sx={{
                color: 'white',
                backgroundColor: 'red',
                borderRadius: 1,
                padding: '0 4px',
                marginLeft: 1,
                display: 'inline-block',
                fontSize: '0.8rem',
              }}
            >
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
      </Box>

      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="outlined" color="secondary" onClick={handleBack}>
          戻る
        </Button>
        <Button variant="contained" color="primary" onClick={handleNext}>
          次へ
        </Button>
      </Box>
    </Box>
  );
};

export default GoogleAccount;
