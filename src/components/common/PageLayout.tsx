import React from 'react';
import { cn } from '../../lib/utils';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={cn("max-w-3xl mx-auto pb-4 md:pb-6 lg:pb-8 px-4 md:px-6 lg:px-8", className)}>
      <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 px-4 py-6 sm:py-10 md:py-12 md:px-8 -mx-4 md:-mx-6 lg:-mx-8 overflow-hidden">
        {/* デコレーティブな背景パターン */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),rgba(255,255,255,0)_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:14px_14px] sm:bg-[size:24px_24px]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute left-0 top-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* タイトル */}
        <div className="flex flex-col items-center">
          <h1 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-center text-white tracking-tight leading-tight max-w-2xl">
            {title.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>

          {/* サブタイトル */}
          {subtitle && (
            <div className="mt-4 sm:mt-6 md:mt-8 text-base sm:text-lg md:text-xl text-center text-white/90 max-w-2xl">
              {subtitle.split('\n').map((line, index) => (
                <p key={index} className="mb-2 sm:mb-2.5 leading-relaxed tracking-wide">{line}</p>
              ))}
              
              {/* 所要時間インジケーター */}
              <div className="mt-4 sm:mt-6 md:mt-8 flex items-center justify-center">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/[0.08] backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-white/[0.08]">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/80"
                  >
                    <path d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" />
                  </svg>
                  <p className="text-[12px] sm:text-[14px] font-medium text-white/80">
                    アンケートは約1分で完了します。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 子コンポーネント */}
      <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
        {children}
      </div>
    </div>
  );
};

export default PageLayout; 