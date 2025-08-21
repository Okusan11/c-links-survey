import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import FormButtons from './common/FormButtons';
import { ProgressBar } from './common/ProgressBar';

// 型とローカル設定のインポート
import { getSurveyConfig } from '../config/surveyConfig';
import { 
  QuestionCard,
  CustomerType,
  SurveyConfig
} from '../types';

// 動的質問レンダラー
import DynamicQuestionRenderer, { QuestionResponse, QuestionErrors } from './common/DynamicQuestionRenderer';

// ユーティリティ関数
import { saveStateToLocalStorage, loadStateFromLocalStorage } from '../lib/utils';


const UnifiedSurvey: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // アンケート設定
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);
  
  // 質問システム用の状態
  const [responses, setResponses] = useState<QuestionResponse>({});
  const [errors, setErrors] = useState<QuestionErrors>({});
  const [currentQuestionFlow, setCurrentQuestionFlow] = useState<string[]>([]);
  const [shouldScrollToError, setShouldScrollToError] = useState<string | null>(null);

  useEffect(() => {
    getSurveyConfig().then(config => {
      setSurveyConfig(config);
      console.log('✓ アンケート設定を読み込みました');
      
      // 状態復元処理（優先順位: state > localStorage）
      let restoredState = null;
      
      if (state?.responses) {
        console.log('✓ ナビゲーションstateから回答を復元中...', state.responses);
        restoredState = state;
      } else {
        // stateにresponsesがない場合はセッションストレージから復元を試行
        const sessionStorageState = loadStateFromLocalStorage();
        if (sessionStorageState?.responses) {
          console.log('✓ セッションストレージから回答を復元中...', sessionStorageState.responses);
          restoredState = sessionStorageState;
        }
      }
      
      if (restoredState?.responses) {
        setResponses(restoredState.responses);
        
        // 顧客タイプに基づいて質問フローを復元
        const customerType = restoredState.responses['customer-type'];
        if (customerType && config.questionFlow[customerType as CustomerType]) {
          const restoredFlow = ['customer-type', ...config.questionFlow[customerType as CustomerType]];
          setCurrentQuestionFlow(restoredFlow);
          console.log(`✓ 質問フローを復元: ${customerType} ->`, restoredFlow);
        } else {
          setCurrentQuestionFlow(['customer-type']);
        }
      } else {
        // 初期の質問フローを設定（顧客タイプ選択前）
        setCurrentQuestionFlow(['customer-type']);
      }
    });
  }, [state]);

  // エラー状態が更新された際の自動スクロール処理
  useEffect(() => {
    if (shouldScrollToError && surveyConfig) {
      console.log('=== useEffect AUTO SCROLL TRIGGER ===');
      console.log('Scrolling to error question:', shouldScrollToError);
      
      const scrollToElement = () => {
        const selectors = [
          `[data-question="${shouldScrollToError}"]`,
          `*[data-question="${shouldScrollToError}"]`,
          `div[data-question="${shouldScrollToError}"]`
        ];
        
        let element = null;
        for (const selector of selectors) {
          element = document.querySelector(selector);
          console.log(`useEffect trying selector "${selector}":`, element ? 'Found' : 'Not found');
          if (element) break;
        }
        
        if (element) {
          console.log('useEffect found element, scrolling...');
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
          
          // スクロール完了後にリセット
          setTimeout(() => {
            setShouldScrollToError(null);
          }, 1000);
        } else {
          console.warn('useEffect could not find element for:', shouldScrollToError);
          // 要素が見つからない場合は少し待ってリトライ
          setTimeout(scrollToElement, 100);
        }
      };
      
      // 少し遅延を入れてDOMの更新を待つ
      setTimeout(scrollToElement, 100);
    }
  }, [shouldScrollToError, errors, surveyConfig]);


  // GoogleAccountから戻ってきた場合のstate
  const [hasGoogleAccount] = useState<string>(state?.hasGoogleAccount || '');
  const [feedback] = useState<string>(state?.feedback || '');



  // 質問システム用のレスポンス処理
  const handleResponseChange = (questionId: string, value: any) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
    
    // セッションストレージに自動保存（ページリロード時は自動クリア）
    saveStateToLocalStorage({
      responses: newResponses,
      timestamp: new Date().toISOString()
    });
    
    // 顧客タイプが変更された場合、質問フローを更新
    if (questionId === 'customer-type' && surveyConfig) {
      const customerType = value as CustomerType;
      const newFlow = ['customer-type', ...surveyConfig.questionFlow[customerType]];
      setCurrentQuestionFlow(newFlow);
      console.log(`質問フローを更新: ${customerType} ->`, newFlow);
      
      // 新しい顧客タイプに関連しない回答をクリア
      const filteredResponses: QuestionResponse = {};
      
      // customer-type の回答は保持
      filteredResponses['customer-type'] = value;
      
      // 新しい質問フローに含まれる質問の既存回答のみを保持
      for (const flowQuestionId of newFlow) {
        if (flowQuestionId !== 'customer-type' && responses[flowQuestionId] !== undefined) {
          filteredResponses[flowQuestionId] = responses[flowQuestionId];
        }
      }
      
      console.log(`顧客タイプ変更により回答をフィルタリング:`, {
        before: Object.keys(responses).length,
        after: Object.keys(filteredResponses).length,
        customerType,
        newFlow,
        removedQuestions: Object.keys(responses).filter(key => !Object.keys(filteredResponses).includes(key))
      });
      
      // フィルタリングされた回答でstateを更新
      setResponses(filteredResponses);
      
      // フィルタリング後の状態でセッションストレージも更新
      saveStateToLocalStorage({
        responses: filteredResponses,
        timestamp: new Date().toISOString()
      });
      
      // エラー状態もクリア
      setErrors({});
    }
  };

  // 質問システム用のエラークリア処理
  const handleErrorClear = (questionId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  };

  // 質問システム用の条件表示チェック
  const shouldShowQuestion = (questionCard: QuestionCard): boolean => {
    if (!questionCard.conditionalDisplay) {
      return true; // 条件がない場合は常に表示
    }
    
    const { dependsOn, showWhen } = questionCard.conditionalDisplay;
    const dependentResponse = responses[dependsOn];
    
    // 依存する質問の回答を正規化
    let dependentValue: string | string[] | null = null;
    
    if (!dependentResponse) {
      return false;
    }
    
    // レスポンス形式に応じて値を抽出
    if (typeof dependentResponse === 'string') {
      dependentValue = dependentResponse;
    } else if (Array.isArray(dependentResponse)) {
      dependentValue = dependentResponse;
    } else if (typeof dependentResponse === 'object') {
      // SingleChoiceResponse または MultipleChoiceResponse の場合
      if ('value' in dependentResponse) {
        dependentValue = dependentResponse.value;
      } else if ('values' in dependentResponse) {
        dependentValue = dependentResponse.values;
      }
    }
    
    if (!dependentValue) {
      return false;
    }
    
    // 条件チェック（デバッグ情報付き）
    console.log(`[条件表示] 質問: ${questionCard.id}, 依存: ${dependsOn}, 条件: ${JSON.stringify(showWhen)}, 値: ${JSON.stringify(dependentValue)}`);
    
    let shouldShow = false;
    if (Array.isArray(showWhen)) {
      // showWhenが配列の場合 - dependentValueがいずれかの値を含むかチェック
      if (Array.isArray(dependentValue)) {
        shouldShow = showWhen.some(condition => dependentValue.includes(condition));
      } else {
        shouldShow = showWhen.includes(dependentValue);
      }
    } else {
      // showWhenが単一値の場合
      if (Array.isArray(dependentValue)) {
        shouldShow = dependentValue.includes(showWhen);
      } else {
        shouldShow = dependentValue === showWhen;
      }
    }
    
    console.log(`[条件表示] 質問: ${questionCard.id}, 表示: ${shouldShow}`);
    return shouldShow;
  };

  // 後方互換性のためのデータ抽出関数群
  const extractUsagePurposeKeys = (responses: QuestionResponse, config: SurveyConfig): string[] => {
    // service-usage タイプの質問から利用サービスを抽出
    const serviceUsageQuestions = config.questionCards.filter(card => card.type === 'service-usage');
    for (const question of serviceUsageQuestions) {
      const response = responses[question.id];
      // 新しいMultipleChoiceResponse形式と後方互換性をサポート
      if (Array.isArray(response)) {
        return response;
      } else if (typeof response === 'object' && 'values' in response && Array.isArray(response.values)) {
        return response.values;
      }
    }
    return [];
  };

  const extractUsagePurposeLabels = (responses: QuestionResponse, config: SurveyConfig): string[] => {
    const keys = extractUsagePurposeKeys(responses, config);
    return keys.map(key => {
      const serviceDef = config.serviceDefinitions.find(s => s.key === key);
      return serviceDef ? serviceDef.label : key;
    });
  };

  const extractHeardFrom = (responses: QuestionResponse): string[] => {
    const heardFromResponse = responses['heard-from'];
    // 新しいMultipleChoiceResponse形式と後方互換性をサポート
    if (Array.isArray(heardFromResponse)) {
      return heardFromResponse;
    } else if (typeof heardFromResponse === 'object' && 'values' in heardFromResponse && Array.isArray(heardFromResponse.values)) {
      return heardFromResponse.values;
    }
    return [];
  };

  const extractImpressionRatings = (responses: QuestionResponse): Array<{category: string; rating: string}> => {
    const impressionsResponse = responses['impressions'];
    if (typeof impressionsResponse === 'object' && impressionsResponse !== null) {
      return Object.entries(impressionsResponse).map(([category, rating]) => ({
        category,
        rating: String(rating)
      }));
    }
    return [];
  };

  const extractWillReturn = (responses: QuestionResponse): string => {
    const willReturnResponse = responses['will-return'];
    // 新しいSingleChoiceResponse形式と後方互換性をサポート
    if (typeof willReturnResponse === 'string') {
      return willReturnResponse;
    } else if (typeof willReturnResponse === 'object' && 'value' in willReturnResponse) {
      return willReturnResponse.value || '';
    }
    return '';
  };

  const extractReturnReasons = (responses: QuestionResponse): string[] => {
    const returnReasonsResponse = responses['return-reasons'];
    // 新しいMultipleChoiceResponse形式と後方互換性をサポート
    if (Array.isArray(returnReasonsResponse)) {
      return returnReasonsResponse;
    } else if (typeof returnReasonsResponse === 'object' && 'values' in returnReasonsResponse && Array.isArray(returnReasonsResponse.values)) {
      return returnReasonsResponse.values;
    }
    return [];
  };

  const extractSatisfiedPoints = (responses: QuestionResponse, config: SurveyConfig): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    const serviceEvalQuestions = config.questionCards.filter(card => 
      card.type === 'service-evaluation' && 
      (card.options as any)?.evaluationType?.includes('satisfaction')
    );
    
    for (const question of serviceEvalQuestions) {
      const response = responses[question.id];
      const serviceKey = (question.options as any).serviceKey;
      if (serviceKey) {
        // 新しいサービス評価形式をサポート
        if (Array.isArray(response)) {
          // 後方互換性: 配列形式の場合
          result[serviceKey] = response;
        } else if (typeof response === 'object' && response !== null) {
          if ('satisfied' in response && Array.isArray(response.satisfied)) {
            // 新しい形式: { satisfied: [], improvement: [] }
            result[serviceKey] = response.satisfied;
          } else if ('values' in response && Array.isArray(response.values)) {
            // MultipleChoiceResponse形式
            result[serviceKey] = response.values;
          }
        }
      }
    }
    return result;
  };

  const extractImprovementPoints = (responses: QuestionResponse, config: SurveyConfig): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    const serviceEvalQuestions = config.questionCards.filter(card => 
      card.type === 'service-evaluation' && 
      (card.options as any)?.evaluationType?.includes('improvement')
    );
    
    for (const question of serviceEvalQuestions) {
      const response = responses[question.id];
      const serviceKey = (question.options as any).serviceKey;
      if (serviceKey) {
        // 新しいサービス評価形式をサポート
        if (Array.isArray(response)) {
          // 後方互換性: 配列形式の場合
          result[serviceKey] = response;
        } else if (typeof response === 'object' && response !== null) {
          if ('improvement' in response && Array.isArray(response.improvement)) {
            // 新しい形式: { satisfied: [], improvement: [] }
            result[serviceKey] = response.improvement;
          } else if ('values' in response && Array.isArray(response.values)) {
            // MultipleChoiceResponse形式
            result[serviceKey] = response.values;
          }
        }
      }
    }
    return result;
  };

  const extractSatisfaction = (responses: QuestionResponse): string => {
    const satisfactionResponse = responses['satisfaction-repeater'] || responses['satisfaction-second'];
    // 新しいSingleChoiceResponse形式と後方互換性をサポート
    if (typeof satisfactionResponse === 'string') {
      return satisfactionResponse;
    } else if (typeof satisfactionResponse === 'object' && 'value' in satisfactionResponse) {
      return satisfactionResponse.value || '';
    }
    return '';
  };

  // 質問システム用のバリデーション
  const validateResponses = (): { isValid: boolean; errors: QuestionErrors } => {
    if (!surveyConfig) return { isValid: false, errors: {} };
    
    const newErrors: QuestionErrors = {};
    let hasErrors = false;
    
    // 現在の質問フローで表示される質問のみをバリデーション
    const visibleQuestions = surveyConfig.questionCards.filter(card => 
      currentQuestionFlow.includes(card.id) && shouldShowQuestion(card)
    );
    
    for (const questionCard of visibleQuestions) {
      const response = responses[questionCard.id];
      
      if (questionCard.required) {
        // 必須チェック - 新しいレスポンス形式に対応
        let isEmpty = false;
        
        if (!response) {
          isEmpty = true;
        } else if (questionCard.type === 'single-choice') {
          // SingleChoiceResponse または string をチェック
          const value = typeof response === 'object' && 'value' in response ? response.value : response;
          isEmpty = !value || (typeof value === 'string' && value.trim() === '');
          
          // 「その他」が選択されている場合、otherTextもチェック
          if (!isEmpty && typeof response === 'object' && 'otherText' in response) {
            const otherChoice = (questionCard.options as any)?.choices?.find((choice: any) => 
              choice.isOther || choice.value === 'その他' || choice.label === 'その他'
            );
            if (otherChoice && response.value === otherChoice.value) {
              isEmpty = !response.otherText || response.otherText.trim() === '';
            }
          }
        } else if (questionCard.type === 'multiple-choice') {
          // MultipleChoiceResponse または string[] をチェック
          const values = typeof response === 'object' && 'values' in response ? response.values : response;
          isEmpty = !Array.isArray(values) || values.length === 0;
          
          // 「その他」が選択されている場合、otherTextもチェック
          if (!isEmpty && typeof response === 'object' && 'otherText' in response && Array.isArray(values)) {
            const otherChoice = (questionCard.options as any)?.choices?.find((choice: any) => 
              choice.isOther || choice.value === 'その他' || choice.label === 'その他'
            );
            if (otherChoice && values.includes(otherChoice.value)) {
              isEmpty = !response.otherText || response.otherText.trim() === '';
            }
          }
        } else if (Array.isArray(response)) {
          isEmpty = response.length === 0;
        } else if (typeof response === 'string') {
          isEmpty = response.trim() === '';
        } else if (questionCard.type === 'service-evaluation' && typeof response === 'object') {
          // サービス評価の特別処理 - satisfied と improvement のどちらか一方でも選択されていればOK
          const hasSelections = (response.satisfied && response.satisfied.length > 0) || 
                              (response.improvement && response.improvement.length > 0);
          isEmpty = !hasSelections;
        }
        
        if (isEmpty) {
          newErrors[questionCard.id] = true;
          hasErrors = true;
        }
      }
      
      // バリデーションルールチェック - 新しいレスポンス形式に対応
      if (questionCard.validation && response) {
        const { minSelections, maxSelections, minLength, maxLength, pattern } = questionCard.validation;
        
        // 配列値の処理 (multiple-choice, service-evaluation)
        let arrayValue: string[] | null = null;
        if (Array.isArray(response)) {
          arrayValue = response;
        } else if (typeof response === 'object' && 'values' in response && Array.isArray(response.values)) {
          arrayValue = response.values;
        } else if (questionCard.type === 'service-evaluation' && typeof response === 'object') {
          // サービス評価の場合は satisfied と improvement の合計をチェック
          const totalSelections = (response.satisfied || []).length + (response.improvement || []).length;
          arrayValue = Array(totalSelections).fill(''); // ダミー配列で数をチェック
        }
        
        if (arrayValue) {
          if (minSelections && arrayValue.length < minSelections) {
            newErrors[questionCard.id] = true;
            hasErrors = true;
          }
          if (maxSelections && arrayValue.length > maxSelections) {
            newErrors[questionCard.id] = true;
            hasErrors = true;
          }
        }
        
        // 文字列値の処理 (single-choice, text-input)
        let stringValue: string | null = null;
        if (typeof response === 'string') {
          stringValue = response;
        } else if (typeof response === 'object' && 'value' in response && typeof response.value === 'string') {
          stringValue = response.value;
        }
        
        if (stringValue) {
          if (minLength && stringValue.length < minLength) {
            newErrors[questionCard.id] = true;
            hasErrors = true;
          }
          if (maxLength && stringValue.length > maxLength) {
            newErrors[questionCard.id] = true;
            hasErrors = true;
          }
          if (pattern && !new RegExp(pattern).test(stringValue)) {
            newErrors[questionCard.id] = true;
            hasErrors = true;
          }
        }
      }
    }
    
    setErrors(newErrors);
    return { isValid: !hasErrors, errors: newErrors };
  };


  /**
   * フォーム送信
   */
  const handleNext = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }

    // surveyConfigが読み込まれていない場合は処理を停止
    if (!surveyConfig) {
      console.error('surveyConfig is not loaded. Cannot proceed with form submission.');
      return;
    }

    // 質問システムのバリデーション
    const validationResult = validateResponses();
    if (!validationResult.isValid) {
      console.log('=== AUTO SCROLL DEBUG START ===');
      console.log('Validation failed, attempting auto-scroll');
      console.log('Validation errors:', validationResult.errors);
      console.log('Current question flow:', currentQuestionFlow);
      
      // エラーがある場合、最初のエラー項目にスクロール
      setTimeout(() => {
        console.log('Executing scroll timeout...');
        
        // 現在表示されている質問の中でエラーがあるものを見つける
        const visibleQuestions = surveyConfig!.questionCards.filter(card => 
          currentQuestionFlow.includes(card.id) && shouldShowQuestion(card)
        );
        console.log('Visible questions:', visibleQuestions.map(q => ({ id: q.id, title: q.title })));
        
        // DOM内の全data-question要素を確認
        const allDataQuestionElements = Array.from(document.querySelectorAll('[data-question]'));
        console.log('All data-question elements in DOM:', allDataQuestionElements.map(el => ({
          id: el.getAttribute('data-question'),
          tagName: el.tagName,
          className: el.className
        })));
        
        // エラーがある最初の質問を見つける
        const firstErrorQuestion = visibleQuestions.find(card => validationResult.errors[card.id]);
        console.log('First error question:', firstErrorQuestion ? { id: firstErrorQuestion.id, title: firstErrorQuestion.title } : 'None found');
        
        if (firstErrorQuestion) {
          console.log(`Attempting to scroll to question: ${firstErrorQuestion.id}`);
          
          // より広範囲なセレクターを試す
          const selectors = [
            `[data-question="${firstErrorQuestion.id}"]`,
            `*[data-question="${firstErrorQuestion.id}"]`,
            `div[data-question="${firstErrorQuestion.id}"]`
          ];
          
          let element = null;
          for (const selector of selectors) {
            element = document.querySelector(selector);
            console.log(`Trying selector "${selector}":`, element ? 'Found' : 'Not found');
            if (element) break;
          }
          
          if (element) {
            console.log(`Found element with selector, scrolling to: ${firstErrorQuestion.id}`);
            console.log('Element details:', {
              tagName: element.tagName,
              className: element.className,
              offsetTop: (element as HTMLElement).offsetTop,
              scrollTop: document.documentElement.scrollTop
            });
            
            // 複数の方法でスクロールを試行
            try {
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
              console.log('scrollIntoView executed successfully');
            } catch (error) {
              console.error('scrollIntoView failed:', error);
              
              // フォールバック: 直接スクロール
              try {
                const elementTop = (element as HTMLElement).offsetTop;
                window.scrollTo({ top: elementTop - 100, behavior: 'smooth' });
                console.log('Fallback window.scrollTo executed');
              } catch (fallbackError) {
                console.error('Fallback scroll also failed:', fallbackError);
              }
            }
          } else {
            console.warn(`Element not found for question: ${firstErrorQuestion.id}`);
            console.warn(`Tried selectors:`, selectors);
          }
        } else {
          console.warn('No error questions found in visible questions');
          console.log('All errors in validationResult:', Object.entries(validationResult.errors));
          console.log('Visible question IDs:', visibleQuestions.map(q => q.id));
        }
        
        console.log('=== AUTO SCROLL DEBUG END ===');
      }, 300); // タイムアウトをさらに延長
      
      // useEffectベースの自動スクロールもトリガー
      const visibleQuestions = surveyConfig ? surveyConfig.questionCards.filter(card => 
        currentQuestionFlow.includes(card.id) && shouldShowQuestion(card)
      ) : [];
      const firstErrorQuestion = visibleQuestions.find(card => validationResult.errors[card.id]);
      
      if (firstErrorQuestion) {
        console.log('Setting shouldScrollToError for useEffect trigger:', firstErrorQuestion.id);
        setShouldScrollToError(firstErrorQuestion.id);
      } else {
        // エラーがある最初の質問をIDから探す
        const errorQuestionId = Object.keys(validationResult.errors).find(id => validationResult.errors[id]);
        if (errorQuestionId) {
          console.log('Setting shouldScrollToError from error keys:', errorQuestionId);
          setShouldScrollToError(errorQuestionId);
        }
      }
      
      return;
    }
    
    // セーフティネット: 現在の顧客タイプに関連する回答のみをフィルタリング
    const currentCustomerType = responses['customer-type'] as CustomerType;
    const currentQuestionFlowForType = currentCustomerType && surveyConfig
      ? ['customer-type', ...surveyConfig.questionFlow[currentCustomerType]]
      : ['customer-type'];
    
    const filteredResponses: QuestionResponse = {};
    for (const questionId of currentQuestionFlowForType) {
      if (responses[questionId] !== undefined) {
        filteredResponses[questionId] = responses[questionId];
      }
    }
    
    console.log('ナビゲーション前の回答フィルタリング:', {
      customerType: currentCustomerType,
      allResponses: Object.keys(responses).length,
      filteredResponses: Object.keys(filteredResponses).length,
      questionFlow: currentQuestionFlowForType
    });
    
    // 質問システムのナビゲーション用状態構築
    const navigationState = {
      responses: filteredResponses, // フィルタリングされた回答のみを渡す
      customerType: currentCustomerType,
      surveyConfig, // 完全な設定情報を渡す
      hasGoogleAccount,
      feedback,
      // 後方互換性のため従来形式も生成（フィルタリング済みデータを使用）
      usagePurpose: surveyConfig ? extractUsagePurposeKeys(filteredResponses, surveyConfig) : [],
      usagePurposeLabels: surveyConfig ? extractUsagePurposeLabels(filteredResponses, surveyConfig) : [],
      // その他の従来フィールドも必要に応じて生成
      heardFrom: extractHeardFrom(filteredResponses),
      impressionRatings: extractImpressionRatings(filteredResponses),
      willReturn: extractWillReturn(filteredResponses),
      returnReasons: extractReturnReasons(filteredResponses),
      satisfiedPoints: surveyConfig ? extractSatisfiedPoints(filteredResponses, surveyConfig) : {},
      improvementPoints: surveyConfig ? extractImprovementPoints(filteredResponses, surveyConfig) : {},
      satisfaction: extractSatisfaction(filteredResponses)
    };
    
    navigate('/googleaccount', { state: navigationState });
  };


  if (!surveyConfig) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-destructive">アンケートを読み込んでいます...</p>
      </div>
    );
  }

  // 質問システムでのレンダリング
  const renderQuestions = () => {
    if (!surveyConfig) return null;
    
    // 現在の質問フローに基づいて表示する質問カードを取得
    const visibleQuestions = surveyConfig.questionCards.filter(card => 
      currentQuestionFlow.includes(card.id) && shouldShowQuestion(card)
    );
    
    return visibleQuestions.map(questionCard => (
      <DynamicQuestionRenderer
        key={questionCard.id}
        questionCard={questionCard}
        responses={responses}
        errors={errors}
        onResponseChange={handleResponseChange}
        onErrorClear={handleErrorClear}
        surveyConfig={surveyConfig}
      />
    ));
  };

  const subtitle = `当サロンをご利用いただきありがとうございます。お客様に最適なアンケートをご案内いたしますので、まずはご来店回数をお選びください。`;

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

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleNext();
    }}>
      <PageLayout
        title="アンケートにご協力ください"
        subtitle={subtitle}
      >
        <ProgressBar 
          currentStep={1} 
          totalSteps={3} 
          steps={progressSteps}
        />

        {/* 動的質問レンダリング */}
        {renderQuestions()}
        {/* 顧客タイプが選択されている場合に次へボタンを表示 */}
        {responses['customer-type'] && (
          <FormButtons 
            onNext={handleNext}
            rightAligned={true} 
            showBackButton={false}
            nextButtonText="次のステップへ"
          />
        )}
      </PageLayout>
    </form>
  );
};

export default UnifiedSurvey;