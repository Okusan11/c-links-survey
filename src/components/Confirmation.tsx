import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// 共通コンポーネントのインポート
import PageLayout from './common/PageLayout';
import QuestionBox from './common/QuestionBox';
import FormButtons from './common/FormButtons';
import { ProgressBar } from './common/ProgressBar';
import LoadingOverlay from './common/LoadingOverlay';

// アイコン
import {
  CalendarDays,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Info,
  Send,
  Check,
  ChevronRight
} from 'lucide-react';

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 環境変数からAPIエンドポイントを取得
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';

  // serviceKey -> label を返すヘルパー
  const getLabelFromKey = (key: string): string => {
    if (!state?.usagePurposeLabels) return key;
    const index = state.usagePurpose.indexOf(key);
    return index !== -1 ? state.usagePurposeLabels[index] : key;
  };

  const handleBack = () => {
    // ReviewForm画面へ戻る際に現在のステートを引き継ぐ
    navigate('/reviewform', { state });
  };

  const handleSubmit = async () => {
    // 既に送信中の場合は処理をスキップ
    if (isSubmitting) return;
    
    // 送信開始
    setIsSubmitting(true);

    // 送信APIがある場合は、送信処理
    if (!apiEndpoint) {
      alert('APIエンドポイントが設定されていません。AWS SSMパラメータ「/c-links-survey/api-endpoint-url」を確認してください。');
      setIsSubmitting(false);
      return;
    }

    // AWS SESバックエンド（Lambda）のためにデータ構造を整える
    const submitData = {
      // バックエンドがusagePurposeKeysとusagePurposeLabelsを期待している
      ...state,
      ...(state.isNewCustomer ? {} : {
        usagePurposeKeys: state.usagePurpose,
        usagePurposeLabels: state.usagePurposeLabels,
      }),
      // 通常の投稿である
      isGoogleReview: false
    };

    try {
      // POST送信
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        throw new Error('APIからエラーレスポンスが返されました');
      }
      
      const data = await response.json();
      navigate('/thankyou');
    } catch (error) {
      console.error('データ送信中にエラーが発生しました:', error);
      alert(`送信中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // 確認項目のレンダリング用コンポーネント
  const ConfirmationItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
    className?: string;
    accent?: 'primary' | 'green' | 'amber';
  }> = ({ icon, title, content, className, accent = 'primary' }) => {
    const accentColors = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      green: 'bg-green-50 text-green-600 border-green-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200'
    };
    
    return (
      <div className={cn("rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md", className)}>
        <div className={cn("flex items-center gap-3 p-4 border-b", accentColors[accent])}>
          <div className={cn("p-2 rounded-full bg-white/80 backdrop-blur-sm")}>
            {icon}
          </div>
          <h3 className="font-semibold tracking-wide">{title}</h3>
        </div>
        <div className="p-5 bg-white">{content}</div>
      </div>
    );
  };

  return (
    <div>
      <PageLayout
        title="入力内容の確認"
        subtitle="入力内容をご確認ください。問題がなければ「送信する」ボタンを押してください。"
      >
        {/* ローディングオーバーレイ */}
        <LoadingOverlay visible={isSubmitting} message="データを送信中..." />
        
        <div className="sm:mb-8 mb-4 -mt-2">
          <ProgressBar 
            currentStep={3} 
            totalSteps={3} 
            steps={progressSteps}
            className="scale-90 origin-top sm:scale-100"
          />
        </div>

        <div className="max-w-2xl mx-auto sm:mt-0 -mt-2">
          <div className="grid grid-cols-1 gap-6">
            {/* 新規・リピーター */}
            <ConfirmationItem
              icon={<Info className="h-5 w-5" />}
              title="ご利用状況"
              content={
                <div className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-[14px] text-gray-700">
                    {state.isNewCustomer ? "初めてのご利用" : "2回目以降のご利用"}
                  </div>
                </div>
              }
            />

            {/* 認知経路（新規のお客様のみ表示） */}
            {state.isNewCustomer && state.heardFrom && state.heardFrom.length > 0 && (
              <ConfirmationItem
                icon={<Info className="h-5 w-5" />}
                title="当サロンを知ったきっかけ"
                content={
                  <div className="space-y-1.5">
                    {state.heardFrom.map((item: string) => (
                      <div key={item} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-[14px] text-gray-700">
                          {item}
                          {item === 'その他' && state.otherHeardFrom && (
                            <span className="ml-1 text-gray-500 font-light italic">
                              （{state.otherHeardFrom}）
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              />
            )}

            {/* 印象評価（新規のお客様のみ表示） */}
            {state.isNewCustomer && state.impressionRatings && state.impressionRatings.length > 0 && (
              <ConfirmationItem
                icon={<Info className="h-5 w-5" />}
                title="印象評価"
                content={
                  <div className="space-y-3">
                    {state.impressionRatings.map((rating: {category: string, rating: string}) => (
                      <div key={rating.category} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-[14px] text-gray-700">
                          <span className="font-medium">{rating.category}:</span>
                          <span className={cn(
                            "ml-2 px-2 py-0.5 rounded text-xs",
                            rating.rating === "良い" && "bg-green-100 text-green-700",
                            rating.rating === "普通" && "bg-gray-100 text-gray-700", 
                            rating.rating === "要改善" && "bg-amber-100 text-amber-700"
                          )}>
                            {rating.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              />
            )}

            {/* また来たいと思うか（新規のお客様のみ表示） */}
            {state.isNewCustomer && state.willReturn && (
              <ConfirmationItem
                icon={<Info className="h-5 w-5" />}
                title="また来店したいと思いますか？"
                content={
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-[14px] text-gray-700">{state.willReturn}</div>
                  </div>
                }
              />
            )}

            {/* 満足度（リピーターのお客様のみ表示） */}
            {!state.isNewCustomer && state.satisfaction && (
              <ConfirmationItem
                icon={<Info className="h-5 w-5" />}
                title="前回と比べた満足度"
                content={
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-[14px] text-gray-700">{state.satisfaction}</div>
                  </div>
                }
              />
            )}

            {/* サービス/利用目的（リピーターのお客様のみ表示） */}
            {!state.isNewCustomer && state.usagePurpose && state.usagePurpose.length > 0 && (
              <ConfirmationItem
                icon={<Info className="h-5 w-5" />}
                title="ご利用いただいたサービス"
                content={
                  <div className="space-y-1.5">
                    {state.usagePurpose.map((serviceKey: string) => (
                      <div key={serviceKey} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-[14px] text-gray-700">
                          {getLabelFromKey(serviceKey)}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              />
            )}

            {/* サービスごとの満足点/改善点（リピーターのお客様のみ表示） */}
            {!state.isNewCustomer && state.satisfiedPoints && state.improvementPoints && (
              <ConfirmationItem
                icon={<Info className="h-5 w-5" />}
                title="サービスの評価"
                content={
                  <div className="space-y-4">
                    {Object.entries(state.satisfiedPoints).map(([serviceKey, points]) => (
                      <div key={`satisfied-${serviceKey}`} className="space-y-2">
                        <div className="font-medium text-[15px] text-gray-800">
                          {getLabelFromKey(serviceKey)}
                        </div>
                        
                        {/* 満足点 */}
                        {Array.isArray(points) && points.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                              <span className="text-[14px] font-medium text-gray-700">満足した点</span>
                            </div>
                            {(points as string[]).map((item: string, index: number) => (
                              <div key={`${serviceKey}-sat-${index}`} className="flex items-start gap-2 pl-6">
                                <ChevronRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div className="text-[14px] text-gray-700">{item}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* 改善点 */}
                        {state.improvementPoints[serviceKey] && state.improvementPoints[serviceKey].length > 0 && (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <ThumbsDown className="h-4 w-4 text-rose-500" />
                              <span className="text-[14px] font-medium text-gray-700">改善してほしい点</span>
                            </div>
                            {(state.improvementPoints[serviceKey] as string[]).map((item: string, index: number) => (
                              <div key={`${serviceKey}-imp-${index}`} className="flex items-start gap-2 pl-6">
                                <ChevronRight className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                <div className="text-[14px] text-gray-700">{item}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                }
              />
            )}

            {/* Googleアカウントを持っているか */}
            {state.hasGoogleAccount && (
              <ConfirmationItem
                icon={<Info className="h-5 w-5" />}
                title="Googleアカウント"
                content={
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-[14px] text-gray-700">
                      {state.hasGoogleAccount === 'yes' ? 'アカウントを持っている' : 'アカウントを持っていない'}
                    </div>
                  </div>
                }
              />
            )}

            {/* 感想・フィードバック */}
            {state.feedback && (
              <ConfirmationItem
                icon={<MessageSquare className="h-5 w-5" />}
                title="ご感想"
                content={
                  <div className="whitespace-pre-wrap text-[14px] text-gray-700 leading-relaxed">
                    {state.feedback}
                  </div>
                }
              />
            )}
          </div>
        </div>

        <div className="mt-10">
      <FormButtons 
        onBack={handleBack} 
        onNext={handleSubmit}
        nextButtonText="送信する" 
        disabled={isSubmitting}
      />
        </div>
    </PageLayout>
    </div>
  );
};

export default Confirmation;
