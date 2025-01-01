import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  TableContainer,
  Paper,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';

type PurposeType = '児童発達支援事業所' | '放課後等デイサービス' | '生活介護' ;

type SatisfactionData = {
  [key in PurposeType]?: string[];
};

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

const Confirmation: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';

  const handleSubmit = () => {
    if (!apiEndpoint) {
      alert('APIエンドポイントが取得されていません。しばらく待ってから再度お試しください。');
      return;
    }

    const data = {
      visitDate: state.visitDate,
      heardFrom: state.heardFrom,
      usagePurpose: state.usagePurpose,
      satisfiedPoints: state.satisfiedPoints,
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
          <QuestionAnswer question="当施設を知ったきっかけ" answer={state.heardFrom} />
          <QuestionAnswer question="当施設ご利用目的" answer={state.usagePurpose} />
        </CardContent>
      </Card>

      <Card sx={{ marginBottom: 2, backgroundColor: '#f9f9f9' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <StarIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
            施設利用後のご感想
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />

          {state.usagePurpose.map((purpose: PurposeType) => (
            <Box key={purpose} sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                【{purpose}】
              </Typography>
              <QuestionAnswer
                question="ご満足いただいた点"
                answer={state.satisfiedPoints[purpose] || '選択なし'}
              />
              <QuestionAnswer
                question="改善してほしい点"
                answer={state.improvementPoints[purpose] || '選択なし'}
              />
            </Box>
          ))}

          <Divider sx={{ marginY: 2 }} />
          <QuestionAnswer question="満足度" answer={state.satisfaction} />
          <QuestionAnswer question="ご感想" answer={state.Feedback || 'なし'} />
        </CardContent>
      </Card>

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
