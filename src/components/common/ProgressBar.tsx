import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description?: string }[];
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, steps, className }) => {
  return (
    <div className={cn("w-full mb-8", className)}>
      {/* 進行状況のテキスト */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">進行状況</h3>
        <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
          {`${currentStep} / ${totalSteps}`}
        </span>
      </div>

      {/* ステップインジケーター */}
      <div className="relative">
        {/* プログレスライン */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        {/* ステップマーカー */}
        <div className="relative z-10 flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index + 1 < currentStep;
            const isCurrent = index + 1 === currentStep;
            
            return (
              <div
                key={index}
                className="flex flex-col items-center"
              >
                {/* ステップサークル */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                    isCompleted ? "bg-primary shadow-lg shadow-primary/30" :
                    isCurrent ? "bg-primary animate-pulse" : "bg-gray-200",
                  )}
                >
                  <span className={cn(
                    "text-sm font-semibold",
                    isCompleted || isCurrent ? "text-white" : "text-gray-600"
                  )}>
                    {index + 1}
                  </span>
                </div>

                {/* ステップタイトル */}
                <div className="mt-3 text-center">
                  <p className={cn(
                    "text-sm font-medium mb-1",
                    isCurrent ? "text-primary" : "text-gray-600"
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { ProgressBar }; 