import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';

const GoogleAccount: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [hasGoogleAccount, setHasGoogleAccount] = useState<string>('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!hasGoogleAccount) {
      alert('Googleアカウントをお持ちですか？の質問に回答してください。');
      return;
    }

    // 回答に応じて次の画面へ遷移
    if (hasGoogleAccount === 'yes') {
      // Googleアカウントを持っている場合、Googleレビュー投稿URLに直接遷移
      window.location.href = 'https://g.page/r/CQLC84E_YkSTEBM/review';
    } else {
      // 持っていない場合、感想入力画面へ
      navigate('/previewform', {
        state: {
          ...state,
          hasGoogleAccount,
        },
      });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        margin: '0 auto',
        backgroundColor: '#e0f7fa',
        padding: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h1" textAlign="center" mb={4} className="text">
        {"Google Map口コミ\n投稿のご依頼"}
      </Typography>

      <Typography variant="body1" textAlign="left" mb={4}>
        <div>
          当施設のサービスをご利用いただいた際の感想をぜひGoogle Mapの口コミとして投稿していただけますと幸いです！
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
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
          戻る
        </Button>
        <Button variant="contained" color="primary" type="submit">
          感想入力画面へ
        </Button>
      </Box>
    </Box>
  );
};

export default GoogleAccount;
