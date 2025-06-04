import React from 'react';
import { cn } from '../../lib/utils';
import { Check, Sparkles } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description?: string }[];
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, steps, className }) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={cn("w-full mb-8 sm:mb-12 stagger-item", className)}>
      {/* ヘッダー - モバイルでコンパクト */}
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg sm:rounded-xl">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold gradient-text">進行状況</h3>
        </div>
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-xl sm:rounded-2xl border border-primary/20">
          <span className="text-xs sm:text-sm font-semibold text-primary">
            {`${currentStep} / ${totalSteps}`}
          </span>
        </div>
      </div>

      {/* プログレスコンテナ - モバイルでコンパクト */}
      <div className="relative bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-100/80 shadow-soft">
        {/* 背景装飾 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-accent/2 rounded-2xl sm:rounded-3xl" />
        
        {/* ステップインジケーター */}
        <div className="relative">
          {/* プログレスライン */}
          <div className="absolute top-4 sm:top-6 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full">
            <div
              className={cn(
                "h-full bg-gradient-to-r from-primary via-primary/90 to-accent rounded-full transition-all duration-700 ease-out progress-glow",
                currentStep > 1 && "animate-shimmer"
              )}
              style={{ width: `${Math.max(0, progressPercentage)}%` }}
            />
          </div>

          {/* ステップマーカー */}
          <div className="relative z-10 flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index + 1 < currentStep;
              const isCurrent = index + 1 === currentStep;
              const stepNumber = index + 1;
              
              return (
                <div
                  key={index}
                  className="flex flex-col items-center animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* ステップサークル - モバイルで小さく */}
                  <div className="relative">
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 relative overflow-hidden",
                        "border-2 shadow-medium",
                        isCompleted 
                          ? "bg-gradient-to-br from-primary to-primary/80 border-primary/30 shadow-card-hover" 
                          : isCurrent 
                            ? "bg-gradient-to-br from-primary to-primary/90 border-primary/40 shadow-card-hover animate-pulse" 
                            : "bg-gradient-to-br from-gray-200 to-gray-300 border-gray-300"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <span className={cn(
                          "text-xs sm:text-sm font-bold z-10",
                          isCurrent || isCompleted ? "text-white" : "text-gray-600"
                        )}>
                          {stepNumber}
                        </span>
                      )}
                      
                      {/* グロー効果 */}
                      {(isCurrent || isCompleted) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/20 rounded-full blur-sm animate-pulse" />
                      )}
                    </div>
                    
                    {/* アクティブ時のリング - モバイルで小さく */}
                    {isCurrent && (
                      <div className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-primary/30 animate-ping" />
                    )}
                  </div>

                  {/* ステップタイトル - 1行ずつ表示できるように調整 */}
                  <div className="mt-2 sm:mt-4 text-center w-21 sm:w-28">
                    <p className={cn(
                      "text-xs sm:text-sm font-semibold mb-1 transition-colors duration-300 leading-tight",
                      isCurrent ? "text-primary" : isCompleted ? "text-primary/80" : "text-gray-600"
                    )}>
                      {step.title}
                    </p>
                    {step.description && (
                      <p className={cn(
                        "text-xs transition-colors duration-300 leading-tight",
                        isCurrent ? "text-primary/70" : "text-gray-500"
                      )}>
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* フローティング装飾要素 - モバイルで非表示 */}
        <div className="hidden sm:block absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-accent/30 to-primary/20 rounded-full animate-float" />
        <div className="hidden sm:block absolute bottom-2 left-2 w-2 h-2 bg-gradient-to-br from-primary/20 to-accent/30 rounded-full animate-float" style={{ animationDelay: '3s' }} />
      </div>
    </div>
  );
};

export { ProgressBar }; 