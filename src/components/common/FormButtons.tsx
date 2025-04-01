import React from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface FormButtonsProps {
  onBack?: () => void;
  onNext: (...args: any[]) => void;
  nextButtonText?: string;
  backButtonText?: string;
  showBackButton?: boolean;
  rightAligned?: boolean;
  className?: string;
}

const FormButtons: React.FC<FormButtonsProps> = ({
  onBack,
  onNext,
  nextButtonText = '次へ',
  backButtonText = '戻る',
  showBackButton = true,
  rightAligned = false,
  className,
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
          className="flex-1 sm:flex-none py-6 px-6 h-auto text-base"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          {backButtonText}
        </Button>
      )}
      <Button 
        onClick={() => onNext()}
        className={cn(
          "flex-1 sm:flex-none py-6 px-6 h-auto text-base",
          !showBackButton || !onBack ? "max-w-md" : ""
        )}
      >
        {nextButtonText}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 ml-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </Button>
    </div>
  );
};

export default FormButtons; 