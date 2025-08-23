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

// セッションストレージヘルパー関数（画面リロード時に自動クリア）
const STORAGE_KEY = 'c-links-survey-state';

export const saveStateToLocalStorage = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem(STORAGE_KEY, serializedState);
    console.log('✓ 状態をセッションストレージに保存しました');
  } catch (error) {
    console.warn('セッションストレージへの保存に失敗:', error);
  }
};

export const loadStateFromLocalStorage = (): any => {
  try {
    const serializedState = sessionStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    const state = JSON.parse(serializedState);
    console.log('✓ セッションストレージから状態を復元しました');
    return state;
  } catch (error) {
    console.warn('セッションストレージからの復元に失敗:', error);
    return null;
  }
};

export const clearStateFromLocalStorage = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('✓ セッションストレージの状態をクリアしました');
  } catch (error) {
    console.warn('セッションストレージのクリアに失敗:', error);
  }
}; 