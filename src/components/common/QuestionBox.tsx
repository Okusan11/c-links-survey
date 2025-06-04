import React from 'react';
import { cn } from '../../lib/utils';

interface QuestionBoxProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({ children, className, accent = true }) => {
  return (
    <div className={cn(
      "group relative mb-10 rounded-2xl bg-gradient-to-br from-white via-white/95 to-gray-50/30",
      "border border-gray-100/80 shadow-soft hover:shadow-medium",
      "transition-all duration-300 ease-out stagger-item",
      "hover:-translate-y-1 hover:border-gray-200/80",
      className
    )}>
      {/* アクセントライン */}
      {accent && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/80 to-accent rounded-l-2xl" />
      )}
      
      {/* 背景装飾 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/2 via-transparent to-accent/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* コンテンツ */}
      <div className="relative p-6 md:p-8">
        {children}
      </div>
      
      {/* フローティング装飾ドット */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full opacity-60 group-hover:scale-125 transition-transform duration-300" />
      
      {/* ホバー時のシマー効果 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
    </div>
  );
};

export default QuestionBox; 