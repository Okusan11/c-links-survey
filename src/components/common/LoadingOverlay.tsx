import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = '送信中...',
  className
}) => {
  if (!visible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center",
        className
      )}
    >
      <div className="bg-white/95 shadow-xl rounded-lg p-8 max-w-sm w-full mx-4 sm:mx-0 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1">
          <div className="bg-gradient-to-r from-primary/80 via-primary to-primary/80 h-full w-full"></div>
        </div>
        
        <div className="relative flex flex-col items-center">
          {/* スピナー */}
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary mb-6"></div>
          
          {/* メッセージ */}
          <p className="text-lg font-medium text-gray-800">{message}</p>
          <p className="text-gray-500 mt-2 text-sm">しばらくお待ちください...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 