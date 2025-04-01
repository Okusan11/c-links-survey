import React from 'react';
import { Box, Typography } from '@mui/material';

interface QuestionAnswerProps {
  question: string;
  answer: string | string[];
}

const QuestionAnswer: React.FC<QuestionAnswerProps> = ({ question, answer }) => {
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

export default QuestionAnswer; 