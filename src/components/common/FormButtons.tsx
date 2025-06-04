import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FormButtonsProps {
  onBack?: () => void;
  onNext: (...args: any[]) => void;
  nextButtonText?: string;
  backButtonText?: string;
  showBackButton?: boolean;
  rightAligned?: boolean;
  className?: string;
  disabled?: boolean;
}

const FormButtons: React.FC<FormButtonsProps> = ({
  onBack,
  onNext,
  nextButtonText = '次へ',
  backButtonText = '戻る',
  showBackButton = true,
  rightAligned = false,
  className,
  disabled = false,
}) => {
  return (
    <div 
      className={cn(
        "flex mt-12 gap-4 sm:gap-6 stagger-item", 
        rightAligned ? "justify-end" : "justify-between",
        showBackButton && onBack ? "flex-row" : "justify-center",
        className
      )}
    >
      {showBackButton && onBack && (
        <button
          onClick={onBack}
          className={cn(
            "group relative flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-2xl touch-target",
            "bg-gradient-to-r from-gray-50 to-gray-100/80 text-gray-700",
            "border border-gray-200/80 shadow-soft",
            "hover:from-gray-100 hover:to-gray-150/80 hover:shadow-medium hover:border-gray-300/80 hover:-translate-y-0.5",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
            "transition-all duration-300 ease-out",
            "active:scale-[0.98] active:translate-y-0"
          )}
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span className="whitespace-nowrap">{backButtonText}</span>
          </div>
          
          {/* ホバー時のシマー効果 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
        </button>
      )}
      
      <button
        onClick={() => onNext()}
        disabled={disabled}
        className={cn(
          "group relative flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-2xl touch-target",
          "bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground",
          "shadow-soft border border-primary/20",
          !disabled && "hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 hover:shadow-card-hover hover:-translate-y-1",
          !disabled && "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
          "transition-all duration-300 ease-out",
          !disabled && "active:scale-[0.98] active:translate-y-0",
          !showBackButton || !onBack ? "max-w-md mx-auto" : "",
          disabled ? "opacity-60 cursor-not-allowed" : ""
        )}
      >
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <span className="whitespace-nowrap">{nextButtonText}</span>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
        
        {/* プログレス効果 */}
        {!disabled && (
          <>
            {/* グロー効果 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-lg group-hover:blur-xl transition-all duration-300 -z-10" />
            
            {/* ホバー時のシマー効果 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
            
            {/* アクセント装飾 */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full opacity-80 group-hover:scale-125 transition-transform duration-300" />
          </>
        )}
      </button>
    </div>
  );
};

export default FormButtons; 