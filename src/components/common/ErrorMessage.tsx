import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
  size?: 'sm' | 'md';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: "text-[12px]",
    md: "text-[14px]"
  };

  return (
    <div className={cn(
      "flex items-center gap-2 text-destructive mt-2",
      className
    )}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <p className={sizeClasses[size]}>{message}</p>
    </div>
  );
};

export default ErrorMessage;