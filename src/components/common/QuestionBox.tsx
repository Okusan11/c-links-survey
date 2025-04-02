import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface QuestionBoxProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({ children, className, accent = true }) => {
  return (
    <Card className={cn(
      "mb-8 rounded-xl shadow-card border",
      accent ? "border-l-4 border-l-primary border-t-0 border-r-0 border-b-0" : "border-gray-100",
      className
    )}>
      <CardContent className="p-5 md:p-7 pt-5 md:pt-7">
        {children}
      </CardContent>
    </Card>
  );
};

export default QuestionBox; 