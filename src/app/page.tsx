'use client';

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center" role="status" aria-label="読み込み中">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400 mx-auto mb-4" aria-hidden="true"></div>
          <div className="text-white text-xl font-semibold">🏁 レーススタート中...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-xl" role="alert">データ取得に失敗しました</div>
      </div>
    );
  }

  const { rankings, totalCount, lastUpdated } = data;
  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 rounded-full blur-2xl"></div>
      </div>

      {/* レーストラック風のライン */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" aria-hidden="true"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* エラー通知（データ表示中の一時エラー） */}
        {error && (
          <div
            className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 mb-6 text-center text-red-200 text-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
            <span aria-hidden="true">🏁</span> 関係者招待ランキング <span aria-hidden="true">🏁</span>
          </h1>
          <p className="text-lg md:text-xl text-pink-200 font-medium">
            誰が一番の招待王になるか？ 熱いバトルが今始まる！
          </p>
        </header>

        {/* 合計招待数 */}
        <div
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-center border border-white/20 shadow-2xl"
          aria-live="polite"
          aria-label={`総招待数: ${totalCount.toLocaleString()}`}
        >
          <div className="text-sm text-pink-200 uppercase tracking-wide font-semibold mb-2">総招待数</div>
          <div className="text-5xl md:text-7xl font-bold text-yellow-300 drop-shadow-lg animate-pulse" aria-hidden="true">
            {totalCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-300 mt-2">
            最終更新: {new Date(lastUpdated).toLocaleString('ja-JP')}
          </div>
        </div>

        {/* トップ3 */}
        <section aria-label="トップ3" className="grid md:grid-cols-3 gap-6 mb-8">
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
          <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10" aria-label="4位以下のランキング">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
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
        <footer className="text-center mt-8 text-gray-400 text-sm">
          <p><span aria-hidden="true">💨</span> リアルタイムで順位が変動中！ 応援よろしくお願いします！</p>
        </footer>
      </div>
    </div>
  );
}

function TopRacerCard({ item, rank, isNew }: { item: RankingItem; rank: number; isNew: boolean }) {
  const podiumColors = [
    'from-yellow-400 to-yellow-600 border-yellow-300',
    'from-gray-300 to-gray-500 border-gray-200',
    'from-orange-400 to-orange-600 border-orange-300',
  ];

  const trophyIcons = ['🏆', '🥈', '🥉'];

  return (
    <article
      className={`bg-gradient-to-br ${podiumColors[rank - 1]} rounded-2xl p-6 text-center shadow-2xl border-2 transform hover:scale-105 transition-all duration-300 ${isNew ? 'animate-bounce' : ''}`}
      aria-label={`${rank}位: ${item.name}, 招待数: ${item.count.toLocaleString()}`}
    >
      <div className="text-6xl mb-4" aria-hidden="true">{trophyIcons[rank - 1]}</div>
      <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg" aria-hidden="true">#{rank}</div>
      <div className="text-xl font-semibold text-white mb-1">{item.name}</div>
      <div className="text-3xl font-bold text-white drop-shadow-lg">{item.count.toLocaleString()}</div>
      <div className="text-sm text-white/80 mt-2" aria-hidden="true">招待数</div>
    </article>
  );
}

function RacerCard({ item, rank, isNew }: { item: RankingItem; rank: number; isNew: boolean }) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-white/20 hover:bg-white/15 transition-all duration-300 ${isNew ? 'animate-pulse' : ''}`}
      role="listitem"
      aria-label={`${rank}位: ${item.name}, 招待数: ${item.count}`}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-4" aria-hidden="true">
          {rank}
        </div>
        <div>
          <div className="font-semibold text-white">{item.name}</div>
          <div className="text-sm text-gray-300" aria-hidden="true">招待数</div>
        </div>
      </div>
      <div className="text-2xl font-bold text-yellow-300" aria-hidden="true">{item.count}</div>
    </div>
  );
}

function getRankChange(previous: RankingItem[], name: string, current: RankingItem[]): number {
  const prevIndex = previous.findIndex(item => item.name === name);
  const currIndex = current.findIndex(item => item.name === name);
  if (prevIndex === -1) return 0;
  return prevIndex - currIndex;
}
