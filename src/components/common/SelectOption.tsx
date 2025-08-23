import React from 'react';
import { cn } from '../../lib/utils';

interface SelectOptionProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  variant?: 'default' | 'enhanced' | 'checkbox';
  className?: string;
}

const SelectOption: React.FC<SelectOptionProps> = ({ 
  selected, 
  onClick, 
  children, 
  icon, 
  description,
  variant = 'default',
  className 
}) => {
  const baseClasses = "group relative flex items-center cursor-pointer touch-target border transition-all duration-300";
  
  const variantClasses = {
    default: {
      container: "gap-3 p-4 sm:p-5 rounded-xl shadow-soft",
      selected: "border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent",
      unselected: "border-gray-100 hover:border-gray-200",
      indicator: "flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center self-center",
      indicatorSelected: "border-primary",
      indicatorUnselected: "border-gray-300",
      indicatorDot: "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary",
      text: "text-[16px] sm:text-[17px] leading-tight font-medium",
      textSelected: "text-primary",
      textUnselected: "text-gray-700",
      iconSelected: "text-primary/80 scale-105",
      iconUnselected: "text-primary/80",
      checkmark: "absolute top-0 right-0 w-5 h-5 bg-primary rounded-bl-xl rounded-tr-xl flex items-center justify-center",
      checkmarkIcon: "w-3 h-3"
    },
    enhanced: {
      container: "gap-4 p-5 sm:p-6 rounded-2xl stagger-item hover-lift mobile-touch-feedback",
      selected: "border-primary/30 bg-gradient-to-br from-primary/8 via-primary/4 to-accent/5 shadow-card-hover selected-glow",
      unselected: "border-gray-100/80 hover:border-primary/20 hover:bg-gradient-to-br hover:from-primary/2 hover:to-accent/2 shadow-soft hover:shadow-medium",
      indicator: "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
      indicatorSelected: "border-primary bg-gradient-to-br from-primary to-primary/80 shadow-medium",
      indicatorUnselected: "border-gray-300 group-hover:border-primary/40",
      indicatorDot: "w-3 h-3 rounded-full bg-white animate-scale-in",
      text: "text-base sm:text-lg leading-tight font-medium transition-colors duration-300",
      textSelected: "text-primary",
      textUnselected: "text-gray-700 group-hover:text-gray-900",
      iconSelected: "text-primary scale-110",
      iconUnselected: "text-primary/60 group-hover:text-primary/80",
      checkmark: "absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-medium animate-scale-in",
      checkmarkIcon: "w-3.5 h-3.5"
    },
    checkbox: {
      container: "gap-3 p-3 rounded-lg border-2 transition-all",
      selected: "border-primary bg-primary/5",
      unselected: "border-transparent hover:border-gray-200 hover:bg-accent/10",
      indicator: "flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center",
      indicatorSelected: "border-primary bg-primary",
      indicatorUnselected: "border-gray-300",
      indicatorDot: "w-2 h-2",
      text: "text-base leading-normal cursor-pointer",
      textSelected: "text-gray-900",
      textUnselected: "text-gray-700",
      iconSelected: "text-primary",
      iconUnselected: "text-gray-500",
      checkmark: "hidden",
      checkmarkIcon: "w-2.5 h-2.5"
    }
  };

  const styles = variantClasses[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        baseClasses,
        styles.container,
        selected ? styles.selected : styles.unselected,
        className
      )}
    >
      {/* 選択インジケーター */}
      <div className={cn(
        styles.indicator,
        selected ? styles.indicatorSelected : styles.indicatorUnselected
      )}>
        {selected && variant === 'checkbox' ? (
          <svg 
            viewBox="0 0 24 24"
            width="10"
            height="10"
            stroke="currentColor" 
            strokeWidth="3" 
            fill="none" 
            className="text-white"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : selected && (
          <div className={styles.indicatorDot} />
        )}
      </div>
      
      {/* コンテンツ */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn(
              "flex-shrink-0 transition-all duration-300",
              selected ? styles.iconSelected : styles.iconUnselected
            )}>
              {icon}
            </div>
          )}
          <span className={cn(
            styles.text,
            selected ? styles.textSelected : styles.textUnselected
          )}>
            {children}
          </span>
        </div>
        {description && (
          <p className={cn(
            "text-[14px] pl-0.5 mt-1 transition-colors duration-300",
            variant === 'enhanced' 
              ? (selected ? "text-primary/70" : "text-gray-500 group-hover:text-gray-600")
              : "text-gray-500"
          )}>
            {description}
          </p>
        )}
      </div>
      
      {/* 選択時のチェックマーク */}
      {selected && variant !== 'checkbox' && (
        <div className={styles.checkmark}>
          <svg 
            viewBox="0 0 24 24"
            width={styles.checkmarkIcon.includes('3.5') ? '14' : '12'}
            height={styles.checkmarkIcon.includes('3.5') ? '14' : '12'}
            stroke="currentColor" 
            strokeWidth="3" 
            fill="none" 
            className="text-white"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      )}
    </div>
  );
};

export default SelectOption;