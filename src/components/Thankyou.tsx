import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ThankYou: React.FC = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        padding: { xs: 2, sm: 4 },
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'inline-block',
          padding: { xs: 2, sm: 3 },
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: 3,
          mt: { xs: 6, sm: 8 },
          maxWidth: '90%',
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <CheckCircleOutlineIcon
          sx={{
            fontSize: { xs: 50, sm: 60 },
            color: 'green',
            mb: 2,
          }}
        />
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          フォームが送信されました！
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: { xs: '1rem', sm: '1.125rem' },
            lineHeight: 1.6,
          }}
        >
          ご協力ありがとうございました。<br />
          ご回答いただいた内容は<b>当施設の改善</b>のために活用させていただきます。
        </Typography>
      </Box>
    </Box>
  );
};

export default ThankYou;
