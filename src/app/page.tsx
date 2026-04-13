'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useRef, useState } from 'react';

interface RankingItem {
  name: string;
  count: number;
}

interface ApiResponse {
  rankings: RankingItem[];
  totalCount: number;
  lastUpdated: string;
}

// カウントアップアニメーション用コンポーネント
function CountUpNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return <>{count.toLocaleString()}</>;
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousRankingsRef = useRef<RankingItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/ranking', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: ApiResponse = await response.json();
      setData(prev => {
        previousRankingsRef.current = prev?.rankings ?? [];
        return result;
      });
      setError(null);
    } catch (err) {
      console.error('データ取得エラー:', err);
      setError('データ取得に失敗しました。ページを再読み込みしてください。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center" role="status" aria-label="読み込み中">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4" aria-hidden="true"></div>
          <div className="text-purple-900 text-xl font-semibold">🏁 レーススタート中...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-xl text-purple-900" role="alert">データ取得に失敗しました</div>
      </div>
    );
  }

  const { rankings, totalCount, lastUpdated } = data;
  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-100 to-purple-100 relative overflow-hidden">
      {/* 背景装飾 - ビビッド化 */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        {/* キラキラ星 */}
        <div className="absolute top-1/4 right-1/4 text-3xl opacity-40 animate-bounce">✨</div>
        <div className="absolute top-3/4 left-1/4 text-2xl opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }}>🌟</div>
      </div>

      {/* 虹色のライン */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-60" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-60" aria-hidden="true"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* エラー通知 */}
        {error && (
          <div
            className="bg-red-400/30 border-2 border-red-400 rounded-xl px-4 py-3 mb-6 text-center text-red-700 text-sm font-bold"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-3 drop-shadow-lg leading-tight">
            <span aria-hidden="true">🎉</span> 関係者<br />招待ランキング <span aria-hidden="true">🎉</span>
          </h1>
          <p className="mx-auto max-w-sm text-sm md:text-2xl text-purple-700 font-bold leading-tight md:leading-snug">
            スタッフみんなの力を合わせて<br />東京ドームシティホールを満員にしよう！
          </p>
        </header>

        {/* 合計招待数 - ポップデザイン */}
        <div
          className="relative bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-3xl p-8 mb-8 text-center shadow-2xl border-4 border-white/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
          style={{
            boxShadow: '0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(168, 85, 247, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.3)',
          }}
          aria-live="polite"
          aria-label={`総招待数: ${totalCount.toLocaleString()}`}
        >
          <div className="text-base text-white uppercase tracking-widest font-black mb-3" aria-hidden="true">✨ 総招待数 ✨</div>
          <div className="text-7xl md:text-8xl font-black text-white drop-shadow-2xl animate-bounce" aria-hidden="true">
            <CountUpNumber target={totalCount} />
          </div>
          <div className="text-sm text-white/90 mt-4 font-semibold" aria-hidden="true">
            🕐 最終更新: {new Date(lastUpdated).toLocaleString('ja-JP')}
          </div>
        </div>

        {/* トップ3 - ポップなカードデザイン */}
        <section aria-label="トップ3" className="grid grid-cols-3 gap-2 md:gap-6 mb-8">
          {top3.map((item, index) => (
            <TopRacerCard
              key={item.name}
              item={item}
              rank={index + 1}
              isNew={getRankChange(previousRankingsRef.current, item.name, rankings) !== 0}
            />
          ))}
        </section>

        {/* 4位以下 */}
        {others.length > 0 && (
          <section className="bg-white/40 backdrop-blur-md rounded-3xl p-8 border-4 border-white/60 shadow-xl" aria-label="4位以下のランキング">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6 text-center">
              <span aria-hidden="true">🏃‍♂️</span> チャレンジャーたち
            </h2>
            <div className="space-y-3" role="list">
              {others.map((item, index) => (
                <RacerCard
                  key={item.name}
                  item={item}
                  rank={index + 4}
                  isNew={getRankChange(previousRankingsRef.current, item.name, rankings) !== 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* フッター */}
        <footer className="text-center mt-8 text-purple-700 text-base font-bold">
          <p><span aria-hidden="true">💨</span> リアルタイムで順位が変動中！ 応援よろしくお願いします！</p>
        </footer>
      </div>
    </div>
  );
}

function TopRacerCard({ item, rank, isNew }: { item: RankingItem; rank: number; isNew: boolean }) {
  const podiumConfig = [
    {
      colors: 'from-yellow-300 to-yellow-500',
      borderColor: 'border-yellow-400',
      shadowColor: 'rgba(250, 204, 21, 0.8)',
      emoji: '🥇',
    },
    {
      colors: 'from-gray-200 to-gray-400',
      borderColor: 'border-gray-300',
      shadowColor: 'rgba(209, 213, 219, 0.8)',
      emoji: '🥈',
    },
    {
      colors: 'from-orange-300 to-orange-500',
      borderColor: 'border-orange-400',
      shadowColor: 'rgba(249, 115, 22, 0.8)',
      emoji: '🥉',
    },
  ];

  const config = podiumConfig[rank - 1];

  return (
    <article
      className={`bg-gradient-to-br ${config.colors} rounded-2xl p-4 md:p-8 text-center shadow-2xl ${config.borderColor} border-4 transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer ${isNew ? 'animate-bounce' : ''}`}
      style={{
        boxShadow: `0 0 40px ${config.shadowColor}, 0 0 80px ${config.shadowColor}CC, inset 0 0 20px rgba(255, 255, 255, 0.4)`,
      }}
      aria-label={`${rank}位: ${item.name}, 招待数: ${item.count.toLocaleString()}`}
    >
      <div className="text-6xl md:text-8xl mb-2 md:mb-4" aria-hidden="true">{config.emoji}</div>
      <div className="text-4xl md:text-6xl font-black text-white drop-shadow-xl mb-1 md:mb-2" aria-hidden="true">#{rank}</div>
      <div className="text-lg md:text-2xl font-bold text-white drop-shadow-lg mb-1 md:mb-2">{item.name}</div>
      <div className="text-3xl md:text-5xl font-black text-white drop-shadow-xl">{item.count.toLocaleString()}</div>
      <div className="text-xs md:text-sm font-bold text-white/90 mt-2 md:mt-3" aria-hidden="true">招待数</div>
    </article>
  );
}

function RacerCard({ item, rank, isNew }: { item: RankingItem; rank: number; isNew: boolean }) {
  const colors = [
    'bg-gradient-to-r from-pink-300 to-pink-400',
    'bg-gradient-to-r from-purple-300 to-purple-400',
    'bg-gradient-to-r from-blue-300 to-blue-400',
    'bg-gradient-to-r from-yellow-200 to-yellow-300',
  ];

  const colorClass = colors[(rank - 4) % colors.length];

  return (
    <div
      className={`${colorClass} rounded-2xl p-5 flex items-center justify-between border-3 border-white/60 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 ${isNew ? 'animate-pulse' : ''}`}
      role="listitem"
      aria-label={`${rank}位: ${item.name}, 招待数: ${item.count}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-lg font-black text-purple-600 shadow-md" aria-hidden="true">
          {rank}
        </div>
        <div>
          <div className="font-bold text-white text-lg drop-shadow-md">{item.name}</div>
          <div className="text-sm text-white/80 font-semibold" aria-hidden="true">招待数</div>
        </div>
      </div>
      <div className="text-4xl font-black text-white drop-shadow-lg">{item.count}</div>
    </div>
  );
}

function getRankChange(previous: RankingItem[], name: string, current: RankingItem[]): number {
  const prevIndex = previous.findIndex(item => item.name === name);
  const currIndex = current.findIndex(item => item.name === name);
  if (prevIndex === -1) return 0;
  return prevIndex - currIndex;
}
