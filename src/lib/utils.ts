import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// スクロール機能のユーティリティ関数
export const scrollToFirstError = (errors: Record<string, boolean>, questionSelectors: Record<string, string>) => {
  setTimeout(() => {
    // エラーがある最初の質問を見つける
    const firstErrorKey = Object.keys(errors).find(key => errors[key]);
    
    if (firstErrorKey && questionSelectors[firstErrorKey]) {
      const element = document.querySelector(questionSelectors[firstErrorKey]);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  }, 100);
};

// エラーの存在チェック
export const hasErrors = (errors: Record<string, boolean>): boolean => {
  return Object.values(errors).some(error => error);
}; 