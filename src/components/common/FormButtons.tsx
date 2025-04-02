import React from 'react';
import { Button } from '../ui/button';
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
        "flex mt-10 gap-4 sm:gap-6", 
        rightAligned ? "justify-end" : "justify-between",
        showBackButton && onBack ? "flex-row" : "justify-center",
        className
      )}
    >
      {showBackButton && onBack && (
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 sm:flex-none py-6 px-6 h-auto text-base rounded-xl touch-target border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-soft"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          {backButtonText}
        </Button>
      )}
      <Button 
        onClick={() => onNext()}
        className={cn(
          "flex-1 sm:flex-none py-6 px-6 h-auto text-base rounded-xl touch-target transition-all shadow-button",
          !showBackButton || !onBack ? "max-w-md" : "",
          disabled ? "opacity-70" : "hover:scale-[1.02]"
        )}
        disabled={disabled}
      >
        {nextButtonText}
        <ChevronRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
};

export default FormButtons; 