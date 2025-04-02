import React from 'react';
import { cn } from '../../lib/utils';

interface RequiredBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * モバイルフレンドリーな必須マークコンポーネント
 */
const RequiredBadge: React.FC<RequiredBadgeProps> = ({
  className,
  size = 'sm'
}) => {
  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center rounded-md font-bold bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-sm",
        size === 'sm' 
          ? "text-[10px] sm:text-[11px] px-1.5 py-0.5 ml-1.5" 
          : "text-[11px] sm:text-[12px] px-2 py-0.5 ml-2",
        className
      )}
      aria-label="必須項目"
    >
      必須
    </span>
  );
};

export default RequiredBadge; 