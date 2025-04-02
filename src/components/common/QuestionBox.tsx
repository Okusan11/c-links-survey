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
      "mb-8 rounded-xl shadow-card border transition-all duration-300 stagger-item",
      accent ? "border-l-4 border-l-primary border-t-0 border-r-0 border-b-0" : "border-gray-100",
      className
    )}>
      <CardContent className="p-5 md:p-7 pt-5 md:pt-7 relative overflow-hidden">
        {/* 装飾的な背景要素 */}
        <div 
          className="absolute -right-20 -bottom-24 w-40 h-40 bg-primary/3 rounded-full blur-xl" 
          aria-hidden="true"
        />
        <div className="relative z-10">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionBox; 