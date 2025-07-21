import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { 
  Gift, 
  Sparkles, 
  Star,
  Coffee,
  Scissors,
  Heart,
  Crown,
  Gem,
  Zap,
  RefreshCw,
  ArrowRight,
  Trophy,
  Smile,
  Copy,
  Check,
  PartyPopper,
  Wand2,
  Music,
  Volume2,
  Home,
  X
} from 'lucide-react';

// 賞品データの型定義
interface Prize {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
  color: string;
  bgColor: string;
  value: string;
  couponCode: string;
  message: string;
}

// 豪華な賞品データ
const prizes: Prize[] = [
  {
    id: 'legendary1',
    name: 'プレミアム全身ケア',
    description: '全メニュー50%OFF + VIP特典',
    icon: <Crown className="w-8 h-8" />,
    rarity: 'legendary',
    color: 'text-yellow-500',
    bgColor: 'from-yellow-400 via-orange-400 to-red-500',
    value: '¥25,000相当',
    couponCode: 'LEGEND50',
    message: '🏆 超レア！あなたは選ばれしお客様です！'
  },
  {
    id: 'legendary2',
    name: 'ダイヤモンド会員権',
    description: '1年間の最上級会員資格',
    icon: <Gem className="w-8 h-8" />,
    rarity: 'legendary',
    color: 'text-cyan-400',
    bgColor: 'from-cyan-400 via-blue-500 to-purple-600',
    value: '¥50,000相当',
    couponCode: 'DIAMOND',
    message: '💎 奇跡的確率！ダイヤモンド級の特典です！'
  },
  {
    id: 'epic1',
    name: '美容エステフルコース',
    description: 'プロ仕様の本格エステ体験',
    icon: <Wand2 className="w-8 h-8" />,
    rarity: 'epic',
    color: 'text-purple-500',
    bgColor: 'from-purple-400 via-pink-500 to-rose-500',
    value: '¥15,000相当',
    couponCode: 'BEAUTY30',
    message: '✨ 素晴らしい！美のフルコースをお楽しみください！'
  },
  {
    id: 'epic2',
    name: 'リラクゼーション三昧',
    description: 'ヘッドスパ + アロマ + マッサージ',
    icon: <Star className="w-8 h-8" />,
    rarity: 'epic',
    color: 'text-indigo-500',
    bgColor: 'from-indigo-400 via-purple-500 to-pink-500',
    value: '¥12,000相当',
    couponCode: 'RELAX25',
    message: '🌟 エピック級！至福のひとときをプレゼント！'
  },
  {
    id: 'rare1',
    name: 'プレミアムヘアケア',
    description: '髪質改善トリートメント付き',
    icon: <Sparkles className="w-8 h-8" />,
    rarity: 'rare',
    color: 'text-blue-500',
    bgColor: 'from-blue-400 via-cyan-400 to-teal-500',
    value: '¥8,000相当',
    couponCode: 'HAIR20',
    message: '💫 レア！美髪への第一歩です！'
  },
  {
    id: 'rare2',
    name: 'カラーリング特別価格',
    description: '人気カラーメニューが特価',
    icon: <Scissors className="w-8 h-8" />,
    rarity: 'rare',
    color: 'text-green-500',
    bgColor: 'from-green-400 via-emerald-400 to-teal-500',
    value: '¥5,000相当',
    couponCode: 'COLOR15',
    message: '🎨 当たり！新しいあなたを発見しましょう！'
  },
  {
    id: 'common1',
    name: 'オリジナル美容ドリンク',
    description: '内側から美しく輝くドリンク',
    icon: <Coffee className="w-8 h-8" />,
    rarity: 'common',
    color: 'text-amber-500',
    bgColor: 'from-amber-400 via-orange-400 to-yellow-500',
    value: '¥1,200相当',
    couponCode: 'DRINK',
    message: '☕ 美容は内側から！体の中から綺麗になりましょう！'
  },
  {
    id: 'common2',
    name: 'パーソナル美容相談',
    description: 'あなた専用のカウンセリング',
    icon: <Heart className="w-8 h-8" />,
    rarity: 'common',
    color: 'text-pink-500',
    bgColor: 'from-pink-400 via-rose-400 to-red-400',
    value: '¥2,000相当',
    couponCode: 'CONSUL',
    message: '💕 あなたに最適な美容法をお教えします！'
  }
];

const DigitalGacha: React.FC = () => {
  // ガチャの状態管理
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [gachaRotation, setGachaRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [visibleElements, setVisibleElements] = useState(0);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // 段階的表示アニメーション
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleElements(prev => prev < 5 ? prev + 1 : prev);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // ガチャを回す確率設定（楽しめる設定）
  const getRarityWeights = () => ({
    legendary: 10,  // 10%（高確率で嬉しい体験）
    epic: 25,       // 25%
    rare: 35,       // 35%
    common: 30      // 30%
  });

  // 加重ランダム選択
  const getRandomPrize = (): Prize => {
    const weights = getRarityWeights();
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const [rarity, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        const rarityPrizes = prizes.filter(p => p.rarity === rarity);
        return rarityPrizes[Math.floor(Math.random() * rarityPrizes.length)];
      }
    }
    
    return prizes[prizes.length - 1];
  };

  // ガチャを回す処理
  const spinGacha = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    // ドラマチックな回転アニメーション
    const spins = 8 + Math.random() * 4;
    const finalRotation = gachaRotation + (spins * 360);
    setGachaRotation(finalRotation);

    // 3秒間のサスペンス
    setTimeout(() => {
      const prize = getRandomPrize();
      setResult(prize);
      setIsSpinning(false);
      setShowResult(true);
      
      // 豪華演出
      if (prize.rarity === 'legendary') {
        setShowFireworks(true);
        setShowConfetti(true);
        setTimeout(() => {
          setShowFireworks(false);
          setShowConfetti(false);
        }, 6000);
      } else if (prize.rarity === 'epic') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }, 3000);
  };

  // クーポンコードをコピー
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // ページを閉じる・ホームに戻る
  const handleClose = () => {
    // ブラウザの履歴に戻る、またはページを閉じる
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // 新しいタブで開かれた場合はタブを閉じる
      window.close();
    }
  };

  // ページを更新してリセット
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/8 via-white to-accent/8 relative overflow-hidden">
      {/* 背景装飾要素（アンケートと統一） */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-2xl animate-pulse" />
        
        {/* キラキラエフェクト */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-50 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* 花火エフェクト */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-6 h-6 rounded-full animate-ping opacity-80"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 60}%`,
                background: `radial-gradient(circle, ${
                  ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#32CD32'][i % 5]
                }, transparent)`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      )}

      {/* Confetti効果 */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-3 h-3 rounded-full animate-bounce opacity-80",
                i % 6 === 0 ? "bg-yellow-400" : 
                i % 6 === 1 ? "bg-purple-400" : 
                i % 6 === 2 ? "bg-pink-400" : 
                i % 6 === 3 ? "bg-blue-400" : 
                i % 6 === 4 ? "bg-green-400" : "bg-red-400"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* 閉じるボタン（右上） */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        title="ページを閉じる"
      >
        <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
      </button>

      <div className="relative z-30 flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          {!showResult ? (
            // ガチャマシン画面
            <div className="relative group">
              {/* メインカード（アンケートデザインと統一） */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-primary/5 rounded-3xl shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                {/* アクセントライン（アンケートと統一） */}
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
                
                <div className="p-8 sm:p-12 text-center space-y-10">
                  {/* タイトルエリア */}
                  <div 
                    className={cn(
                      "space-y-6 transition-all duration-1000 stagger-item",
                      visibleElements >= 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    )}
                  >
                    <div className="relative">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Gift className="w-10 h-10 text-primary animate-bounce" />
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                          プレゼントガチャ
                        </h1>
                        <PartyPopper className="w-10 h-10 text-accent animate-pulse" />
                      </div>
                      
                      {/* キラキラ装飾 */}
                      <Sparkles className="absolute -top-4 -right-8 w-8 h-8 text-primary animate-pulse" />
                      <Star className="absolute -bottom-2 -left-8 w-6 h-6 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <Zap className="absolute top-1/2 -right-12 w-7 h-7 text-primary animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xl sm:text-2xl font-semibold text-gray-800">
                        🎊 ようこそ！デジタルガチャへ
                      </p>
                      <p className="text-lg text-gray-600 font-medium">
                        今だけの
                        <span className="inline-block mx-2 px-3 py-1 bg-gradient-to-r from-primary to-accent text-white rounded-full text-sm font-semibold shadow-md">
                          特別なプレゼント
                        </span>
                        をお楽しみください ✨
                      </p>
                    </div>
                  </div>

                  {/* パズドラ風ガチャ画面 */}
                  <div 
                    className={cn(
                      "relative mx-auto transition-all duration-1000 delay-300 stagger-item",
                      visibleElements >= 2 ? "scale-100 opacity-100" : "scale-95 opacity-0"
                    )}
                  >
                    {/* 魔法陣背景 */}
                    <div className="relative max-w-2xl mx-auto">
                      {/* 外側の魔法円 */}
                      <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-30 animate-pulse">
                        <div className="w-full h-full rounded-full border-2 border-dashed border-white/50 animate-spin" style={{ animationDuration: '20s' }}></div>
                      </div>
                      
                      {/* 内側の装飾円 */}
                      <div className="absolute inset-4 rounded-full border-2 border-gradient-to-r from-blue-400 via-green-400 to-cyan-400 opacity-40 animate-pulse" style={{ animationDelay: '1s' }}>
                        <div className="w-full h-full rounded-full border border-dashed border-white/40 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                      </div>

                      {/* メインルーレット */}
                      <div className="relative p-8">
                        <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto">
                          {/* ルーレット盤 */}
                          <div className="relative w-full h-full">
                            {/* 回転するルーレット */}
                            <div 
                              className={cn(
                                "relative w-full h-full rounded-full shadow-2xl border-8 border-white overflow-hidden transition-transform ease-out",
                                isSpinning ? "duration-3000" : "duration-1000"
                              )}
                              style={{ 
                                transform: `rotate(${gachaRotation}deg)`,
                                filter: isSpinning ? 'blur(1px)' : 'blur(0px)',
                                boxShadow: '0 0 50px rgba(255, 255, 255, 0.5), 0 0 100px rgba(255, 215, 0, 0.3)'
                              }}
                            >
                              {/* レジェンダリー 10% */}
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{ 
                                  background: `conic-gradient(from 0deg, #fbbf24 0deg, #f59e0b 18deg, #dc2626 36deg, transparent 36deg)`,
                                }}
                              >
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 transform">
                                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">🏆</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* エピック 25% */}
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{ 
                                  background: `conic-gradient(from 36deg, #a855f7 36deg, #ec4899 81deg, #f43f5e 126deg, transparent 126deg)`,
                                }}
                              >
                                <div className="absolute top-12 right-6 transform rotate-45">
                                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-xl">✨</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* レア 35% */}
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{ 
                                  background: `conic-gradient(from 126deg, #3b82f6 126deg, #06b6d4 189deg, #14b8a6 252deg, transparent 252deg)`,
                                }}
                              >
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform">
                                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-xl">💫</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* コモン 30% */}
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{ 
                                  background: `conic-gradient(from 252deg, #22c55e 252deg, #10b981 306deg, #14b8a6 360deg, transparent 360deg)`,
                                }}
                              >
                                <div className="absolute top-12 left-6 transform -rotate-45">
                                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-xl">⭐</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* セクション境界線 */}
                              <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
                              
                              {/* 中央の円 - パズドラ風 */}
                              <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 shadow-2xl border-4 border-white flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-inner">
                                  <span className="text-2xl animate-bounce">🎯</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* 固定された針 - より華やかに */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                              <div className="relative">
                                {/* 針の装飾 */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg border-2 border-white animate-pulse"></div>
                                {/* 針の本体 */}
                                <div 
                                  className="w-0 h-0 border-l-4 border-r-4 border-b-12 border-l-transparent border-r-transparent border-b-red-600"
                                  style={{ 
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 周囲のキラキラエフェクト - パズドラ風 */}
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "absolute w-3 h-3 rounded-full animate-pulse opacity-70",
                              i % 5 === 0 ? "bg-yellow-400" :
                              i % 5 === 1 ? "bg-pink-500" : 
                              i % 5 === 2 ? "bg-purple-500" :
                              i % 5 === 3 ? "bg-blue-400" : "bg-green-400"
                            )}
                            style={{
                              left: `${10 + Math.random() * 80}%`,
                              top: `${10 + Math.random() * 80}%`,
                              animationDelay: `${Math.random() * 4}s`,
                              animationDuration: `${2 + Math.random() * 3}s`,
                              transform: `rotate(${Math.random() * 360}deg)`
                            }}
                          >
                            <div className="w-full h-full rounded-full bg-white/50 animate-ping"></div>
                          </div>
                        ))}

                        {/* 魔法陣の文様 */}
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-2 h-8 bg-gradient-to-t from-white/20 to-transparent rounded-full"
                              style={{
                                top: '50%',
                                left: '50%',
                                transformOrigin: '1px 0px',
                                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-180px)`,
                                animation: `pulse 3s ease-in-out infinite`,
                                animationDelay: `${i * 0.2}s`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 確率・賞品表示 */}
                  <div 
                    className={cn(
                      "transition-all duration-1000 delay-600 stagger-item",
                      visibleElements >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    )}
                  >
                    <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-medium">
                      <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center justify-center gap-2">
                        <Trophy className="w-6 h-6 text-primary" />
                        豪華賞品ラインナップ
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full shadow-lg"></div>
                          <span className="text-yellow-600 font-semibold">🏆 レジェンダリー 10%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg"></div>
                          <span className="text-purple-600 font-semibold">✨ エピック 25%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg"></div>
                          <span className="text-blue-600 font-semibold">💫 レア 35%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-teal-400 rounded-full shadow-lg"></div>
                          <span className="text-green-600 font-semibold">⭐ コモン 30%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* サウンド切り替えボタン */}
                  <div 
                    className={cn(
                      "transition-all duration-1000 delay-800 stagger-item",
                      visibleElements >= 4 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    )}
                  >
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={cn(
                        "flex items-center gap-2 mx-auto px-4 py-2 rounded-full text-sm transition-all duration-300",
                        soundEnabled 
                          ? "bg-primary text-white shadow-lg" 
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      )}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{soundEnabled ? 'サウンドON' : 'サウンドOFF'}</span>
                      <Music className="w-4 h-4" />
                    </button>
                  </div>

                  {/* スピンボタン */}
                  <div 
                    className={cn(
                      "transition-all duration-1000 delay-1000 stagger-item",
                      visibleElements >= 5 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    )}
                  >
                    <button
                      onClick={spinGacha}
                      disabled={isSpinning}
                      className={cn(
                        "group relative w-full max-w-md mx-auto py-6 px-12 text-2xl font-bold rounded-2xl transition-all duration-300 transform",
                        isSpinning 
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed scale-95" 
                          : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-2xl hover:scale-105 active:scale-95 shadow-xl",
                        "border-4 border-white/50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-4">
                        {isSpinning ? (
                          <>
                            <RefreshCw className="w-8 h-8 animate-spin" />
                            <span>ドキドキ中...</span>
                          </>
                        ) : (
                          <>
                            <Gift className="w-8 h-8 group-hover:animate-bounce" />
                            <span>ガチャを回す！</span>
                            <Sparkles className="w-8 h-8 group-hover:animate-pulse" />
                          </>
                        )}
                      </div>
                      
                      {!isSpinning && (
                        <>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                        </>
                      )}
                    </button>

                    {isSpinning && (
                      <div className="mt-4 text-gray-600 text-sm animate-pulse flex items-center justify-center gap-2">
                        <Music className="w-4 h-4" />
                        <span>何が出るかな？何が出るかな？</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-4">
                      ※ 当たった特典は次回ご来店時にご利用いただけます
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 結果表示画面
            <div className="relative group animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-primary/5 rounded-3xl shadow-2xl" />
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                {/* 結果に応じたトップアクセント */}
                <div className={cn(
                  "h-3 animate-pulse",
                  result?.rarity === 'legendary' ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500" :
                  result?.rarity === 'epic' ? "bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500" :
                  result?.rarity === 'rare' ? "bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500" :
                  "bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500"
                )} />
                
                <div className="p-8 sm:p-12 text-center space-y-10">
                  {/* 結果アナウンス */}
                  <div className="space-y-4">
                    {result?.rarity === 'legendary' && (
                      <div className="animate-bounce">
                        <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg mb-4">
                          🎊 LEGENDARY！！！
                        </h2>
                        <div className="text-yellow-600 text-xl font-bold">
                          {result.message}
                        </div>
                      </div>
                    )}

                    {result?.rarity === 'epic' && (
                      <div className="animate-pulse">
                        <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg mb-4">
                          ✨ EPIC！！
                        </h2>
                        <div className="text-purple-600 text-lg font-bold">
                          {result.message}
                        </div>
                      </div>
                    )}

                    {result?.rarity === 'rare' && (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-lg mb-4">
                          💫 RARE！
                        </h2>
                        <div className="text-blue-600 text-lg font-bold">
                          {result.message}
                        </div>
                      </div>
                    )}

                    {result?.rarity === 'common' && (
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-800 drop-shadow-lg mb-4">
                          🎁 おめでとうございます！
                        </h2>
                        <div className="text-green-600 text-lg font-bold">
                          {result.message}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 豪華賞品カード */}
                  {result && (
                    <div className="relative mx-auto max-w-lg">
                      <div className={cn(
                        "relative p-10 rounded-3xl text-white shadow-2xl border-4 border-white/50 transform hover:scale-105 transition-all duration-500",
                        `bg-gradient-to-br ${result.bgColor}`
                      )}>
                        {/* カード内キラキラ */}
                        <div className="absolute inset-0 overflow-hidden rounded-3xl">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-60"
                              style={{
                                left: `${20 + (i % 3) * 30}%`,
                                top: `${20 + Math.floor(i / 3) * 30}%`,
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: `${2 + (i % 2)}s`
                              }}
                            />
                          ))}
                        </div>

                        <div className="relative text-center space-y-6">
                          {/* アイコン */}
                          <div className="mx-auto w-28 h-28 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 shadow-2xl">
                            {result.icon}
                          </div>

                          {/* 賞品情報 */}
                          <div className="space-y-4">
                            <h3 className="text-3xl font-black">{result.name}</h3>
                            <p className="text-white/90 text-lg leading-relaxed">{result.description}</p>
                            
                            {/* 価値表示 */}
                            <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30">
                              <span className="font-bold text-xl">{result.value}</span>
                            </div>

                            {/* クーポンコード */}
                            <div className="bg-white/90 text-gray-800 p-4 rounded-xl border-4 border-white shadow-xl">
                              <p className="text-sm font-semibold mb-2 text-gray-600">🎫 クーポンコード</p>
                              <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl font-black tracking-widest">{result.couponCode}</span>
                                <button
                                  onClick={() => copyToClipboard(result.couponCode)}
                                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                                >
                                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                              {copied && (
                                <p className="text-xs text-green-600 mt-1 animate-pulse">📋 コピーしました！</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* カード装飾 */}
                        <div className="absolute top-4 right-4">
                          <Star className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <Sparkles className="w-5 h-5 animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                        <div className="absolute top-4 left-4">
                          <Zap className="w-4 h-4 animate-bounce" style={{ animationDelay: '0.5s' }} />
                        </div>
                      </div>

                      {/* カード周りのグロー */}
                      <div className={cn(
                        "absolute inset-0 rounded-3xl blur-xl opacity-30 animate-pulse -z-10",
                        result.rarity === 'legendary' ? "bg-gradient-to-r from-yellow-400 to-red-500" :
                        result.rarity === 'epic' ? "bg-gradient-to-r from-purple-400 to-pink-500" :
                        result.rarity === 'rare' ? "bg-gradient-to-r from-blue-400 to-cyan-400" :
                        "bg-gradient-to-r from-green-400 to-teal-400"
                      )} />
                    </div>
                  )}

                  {/* ご利用案内 */}
                  <div className="bg-gradient-to-r from-green-50 via-white to-green-50 border border-green-200 rounded-2xl p-6 shadow-medium">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Smile className="w-6 h-6 text-green-600" />
                      <span className="font-bold text-green-800 text-lg">特典のご利用について</span>
                    </div>
                    <div className="text-green-700 space-y-2 text-sm">
                      <p>📞 次回ご予約時にクーポンコードをお伝えください</p>
                      <p>⏰ 有効期限：発行から3ヶ月間</p>
                      <p>💝 他の特典との併用はできません</p>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={handleClose}
                        className="group flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <Home className="w-5 h-5" />
                        <span className="font-bold text-lg">完了</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => {
                          setShowResult(false);
                          setResult(null);
                          setShowConfetti(false);
                          setShowFireworks(false);
                        }}
                        className="group flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="font-bold text-lg">もう一度挑戦</span>
                      </button>
                    </div>

                    <p className="text-gray-500 text-sm">
                      🎊 素敵な特典をお楽しみください
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalGacha;
