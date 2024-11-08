import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';

type PurposeType = 'デイケア' | 'リハビリテーション' | 'ショートステイ' | '長期入居';

type SatisfactionData = {
  [key in PurposeType]?: string[];
};

const Confirmation: React.FC = () => {
  const { state } = useLocation(); // SurveyFormとReviewFormからのデータ
  const navigate = useNavigate();
  const [apiEndpoint, setApiEndpoint] = useState<string>('');

  useEffect(() => {
    const fetchApiEndpoint = async () => {
      try {
        // SSM Parameter Storeからエンドポイントを取得
        const response = await fetch('/get-parameter?name=/shisetsu-review-form/api-endpoint');
        if (response.ok) {
          const data = await response.json();
          setApiEndpoint(data.parameterValue);
        } else {
          console.error('Failed to fetch API endpoint from SSM');
        }
      } catch (error) {
        console.error('Error fetching API endpoint:', error);
      }
    };

    fetchApiEndpoint();
  }, []);

  const handleSubmit = () => {
    if (!apiEndpoint) {
      alert('APIエンドポイントが取得されていません。しばらく待ってから再度お試しください。');
      return;
    }

    // 送信データの作成
    const data = {
      visitDate: state.visitDate,
      heardFrom: state.heardFrom,
      usagePurpose: state.usagePurpose,
      satisfiedPoints: state.satisfiedPoints,
      improvementPoints: state.improvementPoints,
      satisfaction: state.satisfaction,
      feedback: state.Feedback || '', // Feedbackがない場合は空文字列
    };

    // APIリクエストの送信
    fetch(`${apiEndpoint}review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          // 成功時の処理（例：サンクスページへの遷移）
          alert('フォームが送信されました。ご協力ありがとうございました。');
          navigate('/thankyou');
        } else {
          // エラー時の処理
          alert('フォームの送信中にエラーが発生しました。');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('ネットワークエラーが発生しました。');
      });
  };

  const formatArrayAsLines = (array: string[]) =>
    array.map((item, index) => (
      <span key={index}>
        {item}
        {index < array.length - 1 && <br />} {/* 改行 */}
      </span>
    ));

  const tableCellStyle = {
    width: '200px', // 1列目の幅を固定
    fontWeight: 'bold',
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

      {/* ご利用情報 */}
      <Card sx={{ marginBottom: 2, backgroundColor: '#f9f9f9' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <HomeIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
            ご利用情報
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={tableCellStyle}>当施設ご利用日</TableCell>
                  <TableCell align="left">
                    {state.visitDate.year}年 {state.visitDate.month}月 {state.visitDate.day}日
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={tableCellStyle}>当施設を知ったきっかけ</TableCell>
                  <TableCell align="left">
                    {formatArrayAsLines(state.heardFrom)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={tableCellStyle}>当施設ご利用目的</TableCell>
                  <TableCell align="left">
                    {formatArrayAsLines(state.usagePurpose)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 施設ご利用後の感想 */}
      <Card sx={{ marginBottom: 2, backgroundColor: '#f9f9f9' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <StarIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
            施設利用後のご感想
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />

          {/* ご利用目的ごとに表示 */}
          {state.usagePurpose.map((purpose: PurposeType) => (
            <Box key={purpose} sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                【{purpose}】
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={tableCellStyle}>ご満足いただいた点</TableCell>
                      <TableCell align="left">
                        {state.satisfiedPoints[purpose]
                          ? formatArrayAsLines(state.satisfiedPoints[purpose])
                          : '選択なし'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={tableCellStyle}>改善してほしい点</TableCell>
                      <TableCell align="left">
                        {state.improvementPoints[purpose]
                          ? formatArrayAsLines(state.improvementPoints[purpose])
                          : '選択なし'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}

          {/* 満足度とご感想 */}
          <Divider sx={{ marginY: 2 }} />
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={tableCellStyle}>満足度</TableCell>
                  <TableCell align="left">{state.satisfaction}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={tableCellStyle}>ご感想</TableCell>
                  <TableCell align="left">{state.Feedback || 'なし'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
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
