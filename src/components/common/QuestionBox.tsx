import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface QuestionBoxProps {
  children: React.ReactNode;
  className?: string;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({ children, className }) => {
  return (
    <Card className={cn(
      "mb-8 shadow-lg border-l-4 border-l-primary transition-all hover:shadow-xl", 
      className
    )}>
      <CardContent className="p-4 md:p-6 pt-5 md:pt-7">
        {children}
      </CardContent>
    </Card>
  );
};

export default QuestionBox; 