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

  // serviceKey -> label を返すヘルパー
  const getLabelFromKey = (key: string): string => {
    if (!state?.usagePurposeLabels) return key;
    const index = state.usagePurpose.indexOf(key);
    return index !== -1 ? state.usagePurposeLabels[index] : key;
  };

  const handleBack = () => {
    navigate('/reviewform', { state });
  };

  const handleSubmit = async (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }

    // 既に送信中の場合は処理をスキップ
    if (isSubmitting) return;

    // APIエンドポイントを環境変数から取得
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    if (!apiEndpoint) {
      alert('APIエンドポイントが設定されていません。');
      return;
    }

    // 送信開始
    setIsSubmitting(true);

    try {
      await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      });
      
      // 送信成功時は完了画面へ
      navigate('/complete', { state });
    } catch (error) {
      console.error('データ送信中にエラーが発生しました:', error);
      alert('データの送信に失敗しました。もう一度お試しください。');
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
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}>
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
            {state.isNewCustomer && state.heardFrom.length > 0 && (
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

            {/* ご利用日時 */}
            <ConfirmationItem
              icon={<CalendarDays className="h-5 w-5" />}
              title="ご利用日時"
              content={
                <div className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-[14px] text-gray-700">
                    {state.visitDate.year}年 {state.visitDate.month}月 {state.visitDate.day}日
                  </div>
                </div>
              }
            />

            {/* ご利用サービス */}
            <ConfirmationItem
              icon={<MessageSquare className="h-5 w-5" />}
              title="ご利用いただいたサービス"
              content={
                <div className="space-y-6">
                  {state.usagePurpose.map((key: string) => {
            const label = getLabelFromKey(key);
            return (
                      <div key={key} className="rounded-lg bg-gray-50/80 p-4">
                        <div className="font-medium text-[15px] text-primary/90 mb-3 pb-2 border-b border-gray-200">
                          {label}
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          {/* 満足点 */}
                          <div className="bg-white rounded-lg border border-green-100 shadow-sm p-3 space-y-3">
                            <div className="flex items-center gap-2 text-green-600">
                              <div className="p-1 rounded-full bg-green-50">
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[13px] font-medium">満足いただいた点</span>
                            </div>
                            <div className="space-y-2">
                              {state.satisfiedPoints[key]?.map((point: string) => (
                                <div key={point} className="flex items-start gap-2">
                                  <Check className="h-3.5 w-3.5 text-green-500 mt-0.5" />
                                  <div className="text-[13px] text-gray-600">{point}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 改善点 */}
                          <div className="bg-white rounded-lg border border-amber-100 shadow-sm p-3 space-y-3">
                            <div className="flex items-center gap-2 text-amber-600">
                              <div className="p-1 rounded-full bg-amber-50">
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[13px] font-medium">改善してほしい点</span>
                            </div>
                            <div className="space-y-2">
                              {state.improvementPoints[key]?.map((point: string) => (
                                <div key={point} className="flex items-start gap-2">
                                  <Check className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                                  <div className="text-[13px] text-gray-600">{point}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
            );
          })}
                </div>
              }
            />

            {/* ご感想 */}
            {state.feedback && (
              <ConfirmationItem
                icon={<Send className="h-5 w-5" />}
                title="ご感想"
                content={
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-lg border border-gray-100 shadow-inner">
                    <p className="text-[14px] leading-relaxed text-gray-700 whitespace-pre-wrap">
                      {state.feedback}
                    </p>
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
    </form>
  );
};

export default Confirmation;
