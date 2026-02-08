import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn, scrollToFirstError, hasErrors } from '../lib/utils';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import RequiredBadge from './common/RequiredBadge';
import { ProgressBar } from './common/ProgressBar';

// アイコン
import { Info, AlertCircle, X } from 'lucide-react';

// 型とデータのインポート
import { getSurveyConfig } from '../config/surveyConfig';
import { SurveyConfig, ServiceKey } from '../types';

const GoogleAccount: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 環境変数からURL/エンドポイントを取得
  const googleReviewUrl =
    process.env.REACT_APP_GMAP_REVIEW_URL || 'https://www.google.com/maps';
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';

  // SurveyConfigを読み込み（stateから優先取得、フォールバック対応）
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(state?.surveyConfig || null);
  const [hasGoogleAccount, setHasGoogleAccount] = useState<string>(state?.hasGoogleAccount || '');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'back' | 'next' | null>(null);
  const actionTypeRef = useRef<'back' | 'next' | null>(null);

  useEffect(() => {
    // stateからsurveyConfigが渡されていない場合のみ読み込み
    if (!surveyConfig) {
      getSurveyConfig().then(config => {
        setSurveyConfig(config);
      });
    }
  }, [surveyConfig]);

  // serviceKey -> label を返すヘルパー
  const getLabelFromKey = useCallback((key: ServiceKey): string => {
    if (!surveyConfig) return '';
    const found = surveyConfig.serviceDefinitions.find((item: any) => item.key === key);
    return found ? found.label : '';
  }, [surveyConfig]);

  // 新しい形式と従来形式の両方をサポート
  const usagePurposeKeys: ServiceKey[] = useMemo(() => {
    // 新しい形式（UnifiedSurveyから渡される）
    if (state?.usagePurpose) {
      return state.usagePurpose;
    }
    // 従来形式のフォールバック
    return [];
  }, [state?.usagePurpose]);

  // usagePurposeKeys をラベルに変換した配列（新しい形式優先）
  const usagePurposeLabels = useMemo(() => {
    // 新しい形式で既にラベルが渡されている場合はそれを使用
    if (state?.usagePurposeLabels && Array.isArray(state.usagePurposeLabels)) {
      return state.usagePurposeLabels;
    }
    // キーからラベルに変換
    return usagePurposeKeys.map((key) => getLabelFromKey(key));
  }, [usagePurposeKeys, state?.usagePurposeLabels, getLabelFromKey]);

  // 必要であればデストラクチャリングしておく
  const {
    customerType,
    heardFrom,
    otherHeardFrom,
    satisfiedPoints,
    improvementPoints,
    impressionRatings,
    willReturn,
    satisfaction,
    feedback,
    returnReasons,
    otherReturnReasons,
    otherSatisfaction,
    otherWillReturn,
    otherSatisfiedPoints,
    otherImprovementPoints
  } = state || {};

  // 戻るボタン - スマホフレンドリーに改善
  const handleBack = useCallback((event?: React.MouseEvent | React.TouchEvent) => {
    // 即座にrefを更新（同期的）
    actionTypeRef.current = 'back';

    // 既にナビゲーション中の場合は処理しない
    if (isNavigating) {
      console.log('Navigation already in progress, ignoring back button');
      return;
    }

    // イベントの伝播とデフォルト動作を防ぐ
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      // ネイティブイベントの場合のみstopImmediatePropagationを呼び出し
      if ('stopImmediatePropagation' in event.nativeEvent) {
        event.nativeEvent.stopImmediatePropagation();
      }
    }

    console.log('Back button clicked, navigating to survey');

    // 戻るボタンが押されたことを即座に明示
    setActionType('back');
    setIsNavigating(true);

    // 即座にナビゲーションを実行（遅延を削除）
    try {
      // 統合アンケート画面に戻る（全ての顧客タイプで共通）
      // ルートパスに遷移（basename相対）
      navigate('/', {
        state: {
          ...state, // 全ての状態を保持
          hasGoogleAccount,
          feedback,
          // responsesが存在する場合は明示的に保持
          responses: state?.responses || {},
        },
        replace: true, // ブラウザの戻るボタンでこの画面に戻らないようにする
      });
    } catch (error) {
      console.error('ナビゲーションエラー:', error);
      // エラーが発生した場合はフラグをリセット
      setIsNavigating(false);
      setActionType(null);
      actionTypeRef.current = null;
    }
  }, [navigate, state, hasGoogleAccount, feedback, isNavigating]);
  
  // ポップアップを閉じる
  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setHasGoogleAccount('yes-confirmed');
  }, []);

  // 次へボタン - スマホフレンドリーに改善
  const handleNext = useCallback((event?: React.FormEvent | React.MouseEvent | React.TouchEvent) => {
    // refで即座にチェック（同期的）
    if (actionTypeRef.current === 'back' || isNavigating) {
      return;
    }

    // イベントがある場合はpreventDefaultを呼び出す
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // エラー状態をリセット
    const newErrors = {
      hasGoogleAccount: false
    };

    // バリデーション: Googleアカウントの選択状況をチェック
    if (!hasGoogleAccount) {
      newErrors.hasGoogleAccount = true;
    }

    // 「はい、持っています」を選択したが確認していない場合のエラー
    if (hasGoogleAccount === 'yes') {
      newErrors.hasGoogleAccount = true;
    }

    // エラーがあれば最初のエラー項目にスクロール
    if (hasErrors(newErrors)) {
      setError(true);
      scrollToFirstError(newErrors, {
        hasGoogleAccount: '[data-question="google-account"]'
      });
      return;
    }

    // 次へボタンが押されたことを明示（refも更新）
    actionTypeRef.current = 'next';
    setActionType('next');
    setIsNavigating(true);

    const data = {
      // 新しい形式のデータを優先
      ...state, // 全ての状態を引き継ぎ
      hasGoogleAccount,
      // 従来形式も保持（後方互換性）
      customerType,
      heardFrom,
      otherHeardFrom,
      impressionRatings,
      willReturn,
      otherWillReturn,
      satisfaction,
      otherSatisfaction,
      feedback,
      isNewCustomer: state?.customerType === 'new',
      isSecondVisit: state?.customerType === 'second-visit',
      isRepeater: state?.customerType === 'repeater',
      returnReasons,
      otherReturnReasons,
      usagePurpose: usagePurposeKeys,
      usagePurposeLabels,
      satisfiedPoints: satisfiedPoints || {},
      improvementPoints: improvementPoints || {},
      otherSatisfiedPoints: otherSatisfiedPoints || {},
      otherImprovementPoints: otherImprovementPoints || {},
    };

    // 送信データの確認
    //console.log('送信するstateの中身', data);

    try {
      if (hasGoogleAccount === 'yes-confirmed') {
        // API Gateway へデータを送信するが、レスポンスを待たずに画面遷移
        if (!apiEndpoint) {
          alert('APIエンドポイントが設定されていません。AWS SSMパラメータ「/c-links-survey/api-endpoint-url」を確認してください。');
          setIsNavigating(false);
          setActionType(null);
          return;
        }

        // AWS SESバックエンド（Lambda）のためにデータ構造を整える
        const submitData = {
          ...data,
          // バックエンドがusagePurposeKeysとusagePurposeLabelsを期待している（後方互換性）
          usagePurposeKeys: data.usagePurpose,
          usagePurposeLabels: data.usagePurposeLabels,
          // GoogleMapの口コミとしての投稿であることを示す
          isGoogleReview: true
        };

        // --- fetchは投げるがawaitしない ---
        fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        }).catch((error) => {
          // 失敗した場合も、一旦はコンソールエラーのみ表示
          console.error('データ送信中にエラーが発生しました:', error);
        });

        // 非同期のAPI送信を待たずに、すぐにGoogleMapへ
        window.location.href = googleReviewUrl;
      } else {
        // Googleアカウントがない場合は感想入力画面へ遷移
        navigate('/reviewform', {
          state: data,
          replace: true, // ブラウザの戻るボタンでこの画面に戻らないようにする
        });
      }
    } catch (error) {
      console.error('ナビゲーションエラー:', error);
      setIsNavigating(false);
      setActionType(null);
    }
  }, [
    isNavigating,
    hasGoogleAccount,
    apiEndpoint,
    navigate,
    googleReviewUrl,
    customerType,
    heardFrom,
    otherHeardFrom,
    impressionRatings,
    willReturn,
    satisfaction,
    feedback,
    usagePurposeKeys,
    usagePurposeLabels,
    satisfiedPoints,
    improvementPoints,
    otherImprovementPoints,
    otherReturnReasons,
    otherSatisfaction,
    otherSatisfiedPoints,
    otherWillReturn,
    returnReasons,
    state
  ]);

  if (!surveyConfig) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-destructive">データを読み込んでいます...</p>
      </div>
    );
  }

  const subtitle = '当サロンのサービスをご利用いただいた際の感想をぜひGoogle Mapの口コミとして投稿していただけますと幸いです！';

  const progressSteps = [
    {
      title: "アンケート入力",
      description: "ご利用に関する質問"
    },
    {
      title: "Google確認",
      description: "アカウントの確認"
    },
    {
      title: "感想入力",
      description: "最終ステップ"
    }
  ];

  // 選択肢のレンダリング用コンポーネント
  const SelectOption: React.FC<{
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon?: React.ReactNode;
    description?: string;
  }> = ({ selected, onClick, children, icon, description }) => (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 p-4 sm:p-5 rounded-xl cursor-pointer touch-target",
        "border shadow-soft",
        selected 
          ? "border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent" 
          : "border-gray-100 hover:border-gray-200"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center self-center",
        selected ? "border-primary" : "border-gray-300"
      )}>
        {selected && (
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn(
              "flex-shrink-0 text-primary-text/80",
              selected ? "scale-105" : ""
            )}>
              {icon}
            </div>
          )}
          <span className={cn(
            "text-[16px] sm:text-[17px] leading-tight font-medium",
            selected ? "text-primary-text" : "text-gray-700"
          )}>
            {children}
          </span>
        </div>
        {description && (
          <p className="text-[14px] text-gray-500 pl-0.5 mt-1">
            {description}
          </p>
        )}
      </div>
      {selected && (
        <div className="absolute top-0 right-0 w-5 h-5 bg-primary rounded-bl-xl rounded-tr-xl flex items-center justify-center">
          <svg 
            viewBox="0 0 24 24"
            width="12" 
            height="12" 
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

    return (
    <>
      {/* ポップアップ */}
      {showPopup && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClosePopup}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg mt-1 flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    ご確認をお願いいたします
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    お客様のGoogleアカウント名での投稿となります。<br/>
                    もし、アカウント名を公開したくない場合は「いいえ、持っていません」を選択し、感想はアンケート内にご記入いただけますと幸いです。
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClosePopup}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        // refで即座にチェック（同期的）
        if (actionTypeRef.current === 'back' || isNavigating) {
          console.log('Form submit ignored due to back action or navigation in progress');
          return;
        }
        // フォーカスされた要素が戻るボタンの場合もsubmitを無視
        const activeElement = document.activeElement;
        if (activeElement && activeElement.textContent?.includes('戻る')) {
          console.log('Form submit ignored due to back button focus');
          return;
        }
        handleNext(e);
      }}>
        <PageLayout
          title="Google Map口コミ投稿のご依頼"
          subtitle={subtitle}
        >
          <ProgressBar 
            currentStep={2} 
            totalSteps={3} 
            steps={progressSteps}
          />
          
          <QuestionBox>
            <div className="space-y-8">
                          <div className="flex items-start gap-2.5 pb-3 border-b border-gray-100" data-question="google-account">
              <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                <Info className="h-5 w-5 text-primary-text" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide whitespace-normal text-wrap">
                  Googleアカウントをお持ちですか？
                  <RequiredBadge className="inline-block ml-1.5" />
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">口コミを投稿するにはGoogleアカウントが必要です</p>
              </div>
            </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectOption
                  selected={hasGoogleAccount === 'yes' || hasGoogleAccount === 'yes-confirmed'}
                  onClick={() => {
                    setHasGoogleAccount('yes');
                    setShowPopup(true);
                    setError(false);
                  }}
                >
                  はい、持っています
                </SelectOption>
                <SelectOption
                  selected={hasGoogleAccount === 'no'}
                  onClick={() => {
                    setHasGoogleAccount('no');
                    setShowPopup(false);
                    setError(false);
                  }}
                >
                  いいえ、持っていません
                </SelectOption>
              </div>

   
              
              {error && (
                <div className="flex items-center gap-2 text-destructive mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-[14px]">
                    {hasGoogleAccount === 'yes' ? 'ご確認をお願いいたします' : '選択してください'}
                  </p>
                </div>
              )}
            </div>
          </QuestionBox>

          <FormButtons 
            onBack={handleBack} 
            onNext={handleNext} 
            backButtonText={
              isNavigating && actionType === 'back' ? '処理中...' : '戻る'
            }
            nextButtonText={
              isNavigating && actionType === 'next'
                ? '処理中...' 
                : hasGoogleAccount === 'yes-confirmed' 
                  ? 'Google Mapへ' 
                  : '感想入力画面へ'
            }
            disabled={isNavigating}
          />
        </PageLayout>
      </form>
    </>
  );
};

export default GoogleAccount;
