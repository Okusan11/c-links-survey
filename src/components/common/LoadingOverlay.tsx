import React from 'react';
import { cn } from '../../lib/utils';
import { Check, Send } from 'lucide-react';

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
        "fixed inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90 z-50 flex flex-col items-center justify-center backdrop-blur-md",
        "animate-in fade-in-0 duration-300",
        className
      )}
    >
      <div className="relative bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 max-w-md w-full mx-4 sm:mx-0 text-center overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        {/* 背景のグラデーション装飾 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 rounded-2xl"></div>
        
        {/* 上部のフローティングアクセント */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
        
        <div className="relative flex flex-col items-center">
          {/* 送信中アニメーション */}
          <div className="relative mb-8">
            {/* 外側のパルスリング */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 to-indigo-400/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 animate-pulse delay-75"></div>
            
            {/* メインのスピナー */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center animate-spin">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <Send className="h-6 w-6 text-indigo-600 animate-pulse" />
              </div>
            </div>
            
            {/* 内側の装飾点 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2">
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-0 animate-ping delay-150"></div>
            </div>
          </div>
          
          {/* メッセージ部分 */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-800 tracking-wide">
              {message}
            </h3>
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-sm font-medium">処理中です</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              アンケートを送信しています<br />
              しばらくお待ちください
            </p>
          </div>
          
          {/* 下部の装飾バー */}
          <div className="mt-6 w-24 h-0.5 bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
        </div>
        
        {/* 右下の装飾要素 */}
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-xl"></div>
        
        {/* 左上の装飾要素 */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-lg"></div>
      </div>
      
      {/* 背景のアニメーション要素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute top-3/4 left-3/4 w-16 h-16 bg-purple-500/5 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 