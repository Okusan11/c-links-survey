import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface DateTimeSelectionCardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const DateTimeSelectionCard: React.FC<DateTimeSelectionCardProps> = ({
  title = "日時選択",
  description = "ご希望の日時を選択してください。",
  children,
  className
}) => {
  return (
    <Card className={cn("relative p-0 overflow-hidden rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all", className)}>
      {/* 背景のグラデーションレイヤー */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 opacity-20"></div>
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-full shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export { DateTimeSelectionCard }; 