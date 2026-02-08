import React, { useRef, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FormButtonsProps {
  onBack?: (event?: React.MouseEvent | React.TouchEvent) => void;
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
  // 戻るボタンが押されたかどうかを追跡（イベント競合防止）
  const backButtonPressedRef = useRef(false);
  // タッチイベントが処理されたかどうかを追跡
  const touchHandledRef = useRef(false);

  // 戻るボタンのハンドラー
  const handleBackClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // タッチイベントで既に処理された場合はクリックイベントを無視
    if (touchHandledRef.current && e.type === 'click') {
      touchHandledRef.current = false;
      return;
    }

    // 既に処理中または無効化されている場合は無視
    if (backButtonPressedRef.current || disabled) {
      return;
    }

    // イベントの伝播を完全に停止
    e.preventDefault();
    e.stopPropagation();
    if ('nativeEvent' in e && e.nativeEvent.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }

    // 戻るボタンが押されたことをマーク
    backButtonPressedRef.current = true;

    // タッチイベントの場合はフラグを設定
    if (e.type === 'touchend') {
      touchHandledRef.current = true;
    }

    // コールバックを実行
    onBack?.(e);

    // 少し遅れてフラグをリセット（連打防止）
    setTimeout(() => {
      backButtonPressedRef.current = false;
    }, 500);
  }, [onBack, disabled]);

  // 次へボタンのハンドラー
  const handleNextClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // 戻るボタンが押された場合は次へボタンを無視
    if (backButtonPressedRef.current || disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    onNext(e);
  }, [onNext, disabled]);

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
          type="button"
          onClick={handleBackClick}
          onTouchEnd={handleBackClick}
          disabled={disabled}
          className={cn(
            "group relative flex-1 sm:flex-none px-8 sm:px-10 py-5 sm:py-6 text-sm sm:text-base font-medium rounded-2xl touch-target",
            "bg-gradient-to-r from-gray-50 to-gray-100/80 text-gray-700",
            "border border-gray-200/80 shadow-soft",
            !disabled && "hover:from-gray-100 hover:to-gray-150/80 hover:shadow-medium hover:border-gray-300/80 hover:-translate-y-0.5",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
            "transition-all duration-300 ease-out",
            !disabled && "active:scale-[0.98] active:translate-y-0",
            disabled && "opacity-60 cursor-not-allowed"
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
        type="button"
        onClick={handleNextClick}
        disabled={disabled || backButtonPressedRef.current}
        className={cn(
          "group relative flex-1 sm:flex-none px-8 sm:px-10 py-5 sm:py-6 text-sm sm:text-base font-semibold rounded-2xl touch-target",
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