import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  MessageCircle,
  ExternalLink,
  ArrowRight,
  Star,
  Share2,
  Instagram,
  Users,
  Phone,
  Camera,
  Youtube,
  Twitter
} from 'lucide-react';

// SNS設定の型定義
interface SnsConfig {
  type: 'LINE' | 'Instagram' | 'Twitter' | 'YouTube' | 'Facebook' | 'TikTok';
  url: string;
  displayName: string;
  description?: string;
}

// SNSタイプに応じたアイコンとスタイルを返す関数
const getSnsStyles = (type: string) => {
  switch (type.toLowerCase()) {
    case 'line':
      return {
        icon: <MessageCircle className="w-5 h-5" />,
        bgGradient: 'from-green-500 to-green-600',
        hoverGradient: 'hover:from-green-600 hover:to-green-700',
        borderColor: 'border-green-400',
        emoji: '💬'
      };
    case 'instagram':
      return {
        icon: <Instagram className="w-5 h-5" />,
        bgGradient: 'from-pink-500 via-purple-500 to-indigo-500',
        hoverGradient: 'hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600',
        borderColor: 'border-pink-400',
        emoji: '📷'
      };
    case 'twitter':
      return {
        icon: <Twitter className="w-5 h-5" />,
        bgGradient: 'from-blue-400 to-blue-500',
        hoverGradient: 'hover:from-blue-500 hover:to-blue-600',
        borderColor: 'border-blue-300',
        emoji: '🐦'
      };
    case 'youtube':
      return {
        icon: <Youtube className="w-5 h-5" />,
        bgGradient: 'from-red-500 to-red-600',
        hoverGradient: 'hover:from-red-600 hover:to-red-700',
        borderColor: 'border-red-400',
        emoji: '📺'
      };
    case 'facebook':
      return {
        icon: <Users className="w-5 h-5" />,
        bgGradient: 'from-blue-600 to-blue-700',
        hoverGradient: 'hover:from-blue-700 hover:to-blue-800',
        borderColor: 'border-blue-500',
        emoji: '👥'
      };
    case 'tiktok':
      return {
        icon: <Camera className="w-5 h-5" />,
        bgGradient: 'from-gray-800 to-black',
        hoverGradient: 'hover:from-gray-900 hover:to-black',
        borderColor: 'border-gray-600',
        emoji: '🎵'
      };
    default:
      return {
        icon: <ExternalLink className="w-5 h-5" />,
        bgGradient: 'from-gray-600 to-gray-700',
        hoverGradient: 'hover:from-gray-700 hover:to-gray-800',
        borderColor: 'border-gray-500',
        emoji: '🔗'
      };
  }
};

const ThankYou: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [visibleElements, setVisibleElements] = useState(0);

  // ビルド時に埋め込まれた環境変数からSNS設定を読み込み
  const snsConfigs: SnsConfig[] = React.useMemo(() => {
    try {
      const configJson = process.env.REACT_APP_SNS_CONFIG;
      if (!configJson) {
        console.log('REACT_APP_SNS_CONFIG not found, using empty array');
        return [];
      }
      
      const configs: SnsConfig[] = JSON.parse(configJson);
      // 最大3つまでに制限
      const limitedConfigs = configs.slice(0, 3);
      console.log('SNS configs loaded from build-time environment:', limitedConfigs);
      return limitedConfigs;
    } catch (error) {
      console.error('Failed to parse SNS configs from environment variable:', error);
      console.log('Raw REACT_APP_SNS_CONFIG:', process.env.REACT_APP_SNS_CONFIG);
      return [];
    }
  }, []);

  // 要素を段階的に表示するアニメーション
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleElements(prev => prev < 5 ? prev + 1 : prev);
    }, 200);

    // 5秒後にconfettiを非表示
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  const handleClose = () => {
    // アプリケーションを終了（ホームページに戻る）
    window.location.href = '/';
  };

  const handleGoogleReview = () => {
    // Google レビューページを新しいタブで開く（実際のURLは環境変数から取得）
    const googleReviewUrl = process.env.REACT_APP_GMAP_REVIEW_URL || '#';
    window.open(googleReviewUrl, '_blank');
  };

  const handleSnsClick = (snsConfig: SnsConfig) => {
    // SNSページを新しいタブで開く
    window.open(snsConfig.url, '_blank');
  };

  // SNSボタンコンポーネント
  const SnsButton: React.FC<{ config: SnsConfig; index: number }> = ({ config, index }) => {
    const styles = getSnsStyles(config.type);
    
    return (
      <button
        onClick={() => handleSnsClick(config)}
        className={cn(
          "group w-full bg-gradient-to-r text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border",
          `${styles.bgGradient} ${styles.hoverGradient} ${styles.borderColor}`
        )}
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-xl">{styles.emoji}</span>
          {styles.icon}
          <span className="font-semibold text-lg">{config.displayName}</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
        {config.description && (
          <p className="text-white/90 text-sm mt-1">
            {config.description}
          </p>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/8 via-white to-accent/8 relative overflow-hidden">
      {/* 背景装飾要素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Confetti効果 */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-3 h-3 rounded-full animate-bounce opacity-70",
                i % 4 === 0 ? "bg-primary" : 
                i % 4 === 1 ? "bg-accent" : 
                i % 4 === 2 ? "bg-green-400" : "bg-blue-400"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-20 flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {/* メインカード */}
          <div className="relative group">
            {/* カード背景のグラデーション */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-primary/5 rounded-3xl shadow-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* カードコンテンツ */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              {/* トップアクセント */}
              <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
              
              <div className="p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
                {/* 成功アイコン */}
                <div 
                  className={cn(
                    "mx-auto transition-all duration-500 transform",
                    visibleElements >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  )}
                >
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full blur-lg opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-green-400 to-green-500 p-4 rounded-full shadow-2xl border-4 border-white">
                      <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-lg" />
                    </div>
                    {/* 周りのキラキラ */}
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-primary animate-pulse" style={{ animationDelay: '1.5s' }} />
                  </div>
                </div>

                {/* メインメッセージ */}
                <div 
                  className={cn(
                    "space-y-2 sm:space-y-3 transition-all duration-700 delay-200",
                    visibleElements >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-primary to-gray-800 bg-clip-text text-transparent leading-tight">
                    送信完了！
                  </h1>
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                    <p className="text-lg sm:text-xl text-gray-600 font-medium">
                      ご協力ありがとうございました
                    </p>
                    <Heart className="w-5 h-5 text-red-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>

                {/* 詳細メッセージ */}
                <div 
                  className={cn(
                    "transition-all duration-700 delay-400",
                    visibleElements >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                >
                  <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-4 sm:p-6 border border-primary/10">
                    <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-700 text-lg leading-relaxed">
                      頂いたご意見は、当サロンの
                      <span className="inline-block mx-2 px-3 py-1 bg-gradient-to-r from-primary to-accent text-white rounded-full text-sm font-semibold shadow-md">
                        サービス向上
                      </span>
                      のために大切に活用させていただきます。
                    </p>
                  </div>
                </div>

                {/* SNSフォローセクション */}
                <div 
                  className={cn(
                    "transition-all duration-700 delay-600",
                    visibleElements >= 4 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                >
                  {snsConfigs.length > 0 && (
                    <div className="relative">
                      {/* 魅力的な背景カード */}
                      <div className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-3xl p-8 border-2 border-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 shadow-xl overflow-hidden">
                        {/* キラキラ背景エフェクト */}
                        <div className="absolute inset-0 overflow-hidden">
                          {[...Array(12)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "absolute w-2 h-2 rounded-full animate-pulse opacity-40",
                                i % 4 === 0 ? "bg-pink-400" : 
                                i % 4 === 1 ? "bg-purple-400" : 
                                i % 4 === 2 ? "bg-indigo-400" : "bg-yellow-400"
                              )}
                              style={{
                                left: `${10 + Math.random() * 80}%`,
                                top: `${10 + Math.random() * 80}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                              }}
                            />
                          ))}
                        </div>

                        {/* 上部装飾ライン */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-pulse"></div>

                        <div className="relative space-y-6">
                          {/* SNSセクションタイトル - より魅力的に */}
                          <div className="text-center space-y-3">
                            <div className="relative inline-block">
                              {/* タイトル周りのオーラ */}
                              <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                              
                              <div className="relative flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/50 shadow-lg">
                                <div className="relative">
                                  <Heart className="w-8 h-8 text-red-500 animate-bounce" />
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                                </div>
                                
                                <h3 className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                  フォローしてサービスをよりお得にご利用ください！
                                </h3>
                                
                                <div className="relative">
                                  <Sparkles className="w-8 h-8 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
                                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <p className="text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
                                🎁 限定特典やお得な情報をいち早くお届けします 🎁
                              </p>
                              {/* サブタイトル装飾 */}
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full"></div>
                            </div>
                          </div>

                          {/* SNSボタン群 - より魅力的なレイアウト */}
                          <div className={cn(
                            "grid gap-6",
                            snsConfigs.length === 1 ? "grid-cols-1" :
                            snsConfigs.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
                            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                          )}>
                            {snsConfigs.map((config, index) => (
                              <div key={index} className="relative group">
                                {/* ボタン周りのグロー効果 */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                
                                <SnsButton config={config} index={index} />
                                
                                {/* ホバー時のキラキラ */}
                                <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                              </div>
                            ))}
                          </div>


                        </div>

                        {/* 右下装飾 */}
                        <div className="absolute bottom-4 right-4 flex gap-1">
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 装飾的な波紋効果 */}
              <div className="absolute bottom-4 right-4 w-4 h-4 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full animate-ping" />
              <div className="absolute bottom-4 right-4 w-4 h-4 bg-gradient-to-br from-primary/50 to-accent/50 rounded-full" />
            </div>

            {/* カード周りのグロー効果 */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </div>

          {/* 下部の小さなメッセージ */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              またのご来店を心よりお待ちしております
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
