import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';

// ------------------------------
// 1. SurveyForm.tsx と同じ型定義を用意 (serviceKeyとconfig)
// ------------------------------
type ServiceKey = 'childDevelopmentSupport' | 'afterSchoolDayService' | 'lifeCare';

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

// ------------------------------
// 2. 質問 + 回答表示用のコンポーネント
// ------------------------------
const QuestionAnswer: React.FC<{ question: string; answer: string | string[] }> = ({
  question,
  answer,
}) => {
  return (
    <Box sx={{ mb: 2, p: 2, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        {question}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        {Array.isArray(answer)
          ? answer.map((item, index) => (
              <span key={index}>
                {item}
                <br />
              </span>
            ))
          : answer}
      </Typography>
    </Box>
  );
};

// ------------------------------
// 3. メインコンポーネント
// ------------------------------
const Confirmation: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';

  // SurveyConfig を読み込み（SSMパラメータをビルド時に埋め込んだもの）
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

  // マウント時に REACT_APP_SURVEY_CONFIG をパース
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

  /**
   * serviceKey -> label を返すヘルパー
   */
  const getLabelFromKey = (key: ServiceKey): string => {
    if (!surveyConfig) return ''; // 読み込み前などは空で返す
    const found = surveyConfig.serviceDefinitions.find((item) => item.key === key);
    return found ? found.label : '';
  };

  // usagePurpose は serviceKey[] (SurveyForm.tsx でそう送ってきた想定)
  const usagePurposeKeys: ServiceKey[] = state?.usagePurpose || [];

  // usagePurposeKeys をラベルに変換した配列を作る (「ご利用目的」でまとめて表示する用)
  const usagePurposeLabels = usagePurposeKeys.map((key) => getLabelFromKey(key));

  // ------------------------------
  // フォーム送信
  // ------------------------------
  const handleSubmit = () => {
    if (!apiEndpoint) {
      alert('APIエンドポイントが取得されていません。しばらく待ってから再度お試しください。');
      return;
    }

    // 送信データはキーのまま投げてもよいですし、ラベルに変換して投げてもよい
    // 今回は例として「キーのまま」送る
    const data = {
      visitDate: state.visitDate,
      heardFrom: state.heardFrom,
      usagePurposeKeys: usagePurposeKeys,          // Labelで送信
      usagePurposeLabels: usagePurposeLabels,          // Labelで送信
      satisfiedPoints: state.satisfiedPoints,  // keyとオプションの紐付け
      improvementPoints: state.improvementPoints,
      satisfaction: state.satisfaction,
      feedback: state.Feedback || '',
    };

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          navigate('/thankyou');
        } else {
          alert('フォームの送信中にエラーが発生しました。');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('ネットワークエラーが発生しました。');
      });
  };

  // ------------------------------
  // レンダリング
  // ------------------------------
  // surveyConfig の読み込み前に表示する内容
  if (!surveyConfig) {
    return (
      <Box
        sx={{
          maxWidth: 600,
          margin: '0 auto',
          padding: 3,
          textAlign: 'center',
        }}
      >
        <Typography>データを読み込んでいます...</Typography>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      sx={{
        maxWidth: 600,
        margin: '0 auto',
        backgroundColor: '#e0f7fa',
        padding: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
        <CheckCircleIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
        入力内容確認
      </Typography>

      {/* --- ご利用情報 --- */}
      <Card sx={{ marginBottom: 2, backgroundColor: '#f9f9f9' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <HomeIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
            ご利用情報
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />

          <QuestionAnswer
            question="当施設ご利用日"
            answer={`${state.visitDate.year}年 ${state.visitDate.month}月 ${state.visitDate.day}日`}
          />

          <QuestionAnswer
            question="当施設を知ったきっかけ"
            answer={state.heardFrom || []}
          />

          {/* 当施設ご利用目的 → label配列へ変換して表示 */}
          <QuestionAnswer
            question="当施設ご利用目的"
            answer={usagePurposeLabels}
          />
        </CardContent>
      </Card>

      {/* --- 施設利用後のご感想 --- */}
      <Card sx={{ marginBottom: 2, backgroundColor: '#f9f9f9' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <StarIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
            施設利用後のご感想
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />

          {/* サービスごとに満足点/改善点を表示するときは、serviceKeyからラベルを取得 */}
          {usagePurposeKeys.map((key) => {
            const label = getLabelFromKey(key);
            return (
              <Box key={key} sx={{ marginBottom: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {/* 例: 【児童発達支援事業所】 */}
                  【{label}】
                </Typography>
                <QuestionAnswer
                  question="ご満足いただいた点"
                  answer={state.satisfiedPoints[key] || '選択なし'}
                />
                <QuestionAnswer
                  question="改善してほしい点"
                  answer={state.improvementPoints[key] || '選択なし'}
                />
              </Box>
            );
          })}

          <Divider sx={{ marginY: 2 }} />
          <QuestionAnswer question="満足度" answer={String(state.satisfaction)} />
          <QuestionAnswer question="ご感想" answer={state.Feedback || 'なし'} />
        </CardContent>
      </Card>

      {/* ボタン */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
          戻る
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          startIcon={<SendIcon />}
        >
          送信する
        </Button>
      </Box>
    </Box>
  );
};

export default Confirmation;
