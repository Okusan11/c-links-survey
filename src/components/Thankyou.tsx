import React from 'react';
import { Box, Typography } from '@mui/material';

const ThankYou: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        ご協力ありがとうございました！
      </Typography>
      <Typography variant="body1">
        アンケートへのご協力、誠にありがとうございました！
      </Typography>
    </Box>
  );
};

export default ThankYou;
