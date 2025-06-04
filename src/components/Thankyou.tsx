import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { containerStyle } from '../styles/theme';

const ThankYou: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: { xs: 3, sm: 5 },
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          maxWidth: '90%',
          width: { xs: '100%', sm: '500px' },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #4CAF50, #81C784)',
          },
          ...containerStyle,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(76, 175, 80, 0.08)',
            borderRadius: '50%',
            padding: 3,
            mb: 4,
            border: '2px solid rgba(76, 175, 80, 0.1)',
          }}
        >
          <CheckCircleOutlineIcon
            sx={{
              fontSize: { xs: 60, sm: 80 },
              color: '#4CAF50',
              filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.2))',
            }}
          />
        </Box>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            fontWeight: 700,
            color: '#2C3E50',
            textAlign: 'center',
            mb: 3,
            letterSpacing: '-0.02em',
          }}
        >
          フォームが送信されました！
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: '#5D6D7E',
            fontSize: { xs: '1.1rem', sm: '1.2rem' },
            lineHeight: 1.8,
            maxWidth: '90%',
          }}
        >
          ご協力ありがとうございました。
          <Box component="span" sx={{ display: 'block', mt: 2 }}>
            ご回答いただいた内容は、
            <br />
            <Box
              component="span"
              sx={{
                color: '#2C3E50',
                fontWeight: 600,
                borderBottom: '2px solid rgba(76, 175, 80, 0.3)',
                px: 0.5,
              }}
            >
              当サロンの改善
            </Box>
            のために活用させていただきます。
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default ThankYou;
