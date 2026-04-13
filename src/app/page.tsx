'use client';

import { useEffect, useState } from 'react';

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
  const [previousRankings, setPreviousRankings] = useState<RankingItem[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/ranking', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: ApiResponse = await response.json();
      setPreviousRankings(data?.rankings || []);
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error('データ取得エラー:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // 1秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">🏁 レーススタート中...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-xl">データ取得に失敗しました</div>
      </div>
    );
  }

  const { rankings, totalCount, lastUpdated } = data;
  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 rounded-full blur-2xl"></div>
      </div>

      {/* レーストラック風のライン */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
            🏁 関係者招待ランキング 🏁
          </h1>
          <p className="text-lg md:text-xl text-pink-200 font-medium">
            誰が一番の招待王になるか？ 熱いバトルが今始まる！
          </p>
        </header>

        {/* 合計招待数 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-center border border-white/20 shadow-2xl">
          <div className="text-sm text-pink-200 uppercase tracking-wide font-semibold mb-2">総招待数</div>
          <div className="text-5xl md:text-7xl font-bold text-yellow-300 drop-shadow-lg animate-pulse">
            {totalCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-300 mt-2">
            最終更新: {new Date(lastUpdated).toLocaleString('ja-JP')}
          </div>
        </div>

        {/* トップ3 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {top3.map((item, index) => (
            <TopRacerCard
              key={item.name}
              item={item}
              rank={index + 1}
              isNew={getRankChange(previousRankings, item.name, rankings) !== 0}
            />
          ))}
        </div>

        {/* 4位以下 */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">🏃‍♂️ チャレンジャーたち</h2>
          <div className="space-y-3">
            {others.map((item, index) => (
              <RacerCard
                key={item.name}
                item={item}
                rank={index + 4}
                isNew={getRankChange(previousRankings, item.name, rankings) !== 0}
              />
            ))}
          </div>
        </div>

        {/* フッター */}
        <footer className="text-center mt-8 text-gray-400 text-sm">
          <p>💨 リアルタイムで順位が変動中！ 応援よろしくお願いします！</p>
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
    <div className={`bg-gradient-to-br ${podiumColors[rank - 1]} rounded-2xl p-6 text-center shadow-2xl border-2 transform hover:scale-105 transition-all duration-300 ${isNew ? 'animate-bounce' : ''}`}>
      <div className="text-6xl mb-4">{trophyIcons[rank - 1]}</div>
      <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">#{rank}</div>
      <div className="text-xl font-semibold text-white mb-1">{item.name}</div>
      <div className="text-3xl font-bold text-white drop-shadow-lg">{item.count.toLocaleString()}</div>
      <div className="text-sm text-white/80 mt-2">招待数</div>
    </div>
  );
}

function RacerCard({ item, rank, isNew }: { item: RankingItem; rank: number; isNew: boolean }) {
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-white/20 hover:bg-white/15 transition-all duration-300 ${isNew ? 'animate-pulse' : ''}`}>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-4">
          {rank}
        </div>
        <div>
          <div className="font-semibold text-white">{item.name}</div>
          <div className="text-sm text-gray-300">招待数</div>
        </div>
      </div>
      <div className="text-2xl font-bold text-yellow-300">{item.count}</div>
    </div>
  );
}

function getRankChange(previous: RankingItem[], name: string, current: RankingItem[]): number {
  const prevIndex = previous.findIndex(item => item.name === name);
  const currIndex = current.findIndex(item => item.name === name);
  if (prevIndex === -1) return 0;
  return prevIndex - currIndex;
}
