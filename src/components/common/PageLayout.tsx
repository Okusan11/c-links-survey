import React from 'react';
import { cn } from '../../lib/utils';
import { Sparkles, Clock, Star } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={cn("max-w-4xl mx-auto pb-6 md:pb-8 lg:pb-12 px-4 md:px-6 lg:px-8 relative", className)}>
      {/* 全体背景グラデーション - 画面最下部まで */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 -z-20" />
      
      {/* ヒーローセクション - モバイルでコンパクト、横スクロール防止 */}
      <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/85 px-4 py-8 sm:px-6 sm:py-12 md:py-20 md:px-10 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden rounded-b-2xl sm:rounded-b-3xl">
        {/* 背景装飾要素 */}
        <div className="absolute inset-0">
          {/* メイングラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-accent/30" />
          
          {/* フローティング要素 - モバイルで小さく/非表示 */}
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-xl sm:blur-2xl animate-float" />
          <div className="hidden sm:block absolute bottom-8 left-8 w-24 h-24 bg-accent/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="hidden sm:block absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full blur-lg animate-float" style={{ animationDelay: '4s' }} />
          
          {/* グリッドパターン - モバイルで控えめ */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] sm:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] sm:bg-[size:20px_20px] md:bg-[size:32px_32px]" />
          
          {/* グラスモーフィズム効果 - モバイルで非表示 */}
          <div className="hidden md:block absolute right-0 top-1/4 w-80 h-80 glass rounded-full" />
          <div className="hidden md:block absolute left-0 bottom-1/4 w-64 h-64 glass rounded-full" />
        </div>

        {/* コンテンツ */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* アイコン装飾 - モバイルで小さく */}
          <div className="mb-3 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
            <div className="p-2 sm:p-3 glass-card rounded-xl sm:rounded-2xl animate-scale-in">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white/90" />
            </div>
            <div className="accent-line w-8 sm:w-12" />
            <div className="p-2 sm:p-3 glass-card rounded-xl sm:rounded-2xl animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <Star className="w-4 h-4 sm:w-6 sm:h-6 text-white/90" />
            </div>
          </div>

          {/* タイトル - モバイルで小さく */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight max-w-4xl animate-fade-in-up">
              {title.split('\n').map((line, index) => (
                <div key={index} className="block">
                  {line}
                  {index < title.split('\n').length - 1 && <br />}
                </div>
              ))}
            </h1>
            
            {/* アクセント装飾 - モバイルで小さく */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-br from-accent to-accent/80 rounded-full" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-br from-accent to-accent/80 rounded-full" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-br from-accent to-accent/80 rounded-full" />
            </div>
          </div>

          {/* サブタイトル - モバイルでコンパクト */}
          {subtitle && (
            <div className="mt-4 sm:mt-8 md:mt-12 space-y-3 sm:space-y-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-sm sm:text-lg md:text-2xl text-white/95 max-w-3xl leading-relaxed px-2 sm:px-0">
                {subtitle.split('\n').map((line, index) => (
                  <p key={index} className="mb-2 sm:mb-3 font-medium tracking-wide">
                    {line}
                  </p>
                ))}
              </div>
              
              {/* 所要時間インジケーター - モバイルでコンパクト */}
              <div className="mt-4 sm:mt-8 sm:mt-10 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 sm:gap-3 glass-card px-4 py-2.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                  <div className="text-xs sm:text-sm md:text-base font-medium text-white/90">
                    約1分で完了
                  </div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="relative overflow-hidden min-h-screen">
        {/* 子コンポーネント */}
        <div className="space-y-6 sm:space-y-8 md:space-y-10 mt-6 sm:mt-8 md:mt-12 relative z-10">
          {children}
        </div>

        {/* フローティング装飾要素 - モバイルで非表示 */}
        <div className="hidden sm:block absolute top-20 right-8 w-4 h-4 bg-primary/10 rounded-full animate-float" />
        <div className="hidden sm:block absolute top-40 left-8 w-3 h-3 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

export default PageLayout; 