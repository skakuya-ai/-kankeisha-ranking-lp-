import { NextResponse } from 'next/server';

interface RankingItem {
  name: string;
  count: number;
}

// モックデータ
const mockData: RankingItem[] = [
  { name: '山田太郎', count: 150 },
  { name: '鈴木花子', count: 120 },
  { name: '佐藤次郎', count: 100 },
  { name: '田中一郎', count: 80 },
  { name: '高橋美咲', count: 70 },
  { name: '中村健太', count: 60 },
  { name: '小林さくら', count: 50 },
  { name: '伊藤大輔', count: 40 },
  { name: '渡辺愛', count: 30 },
  { name: '加藤勇気', count: 20 },
];

function parseCSV(csvText: string): RankingItem[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  // 1行目はヘッダーなのでスキップ
  const countByName: Record<string, number> = {};
  
  lines.slice(1).forEach((line) => {
    const cells = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    const nameColumn = parseInt(process.env.NAME_COLUMN || '4', 10);
    const name = cells[nameColumn]?.trim();

    if (name && name.length > 0) {
      countByName[name] = (countByName[name] || 0) + 1;
    }
  });

  const data: RankingItem[] = Object.entries(countByName)
    .map(([name, count]) => ({ name, count }))
    .filter(item => item.name && item.count > 0);

  // 数値が大きい順にソート
  data.sort((a, b) => b.count - a.count);

  return data;
}

async function getSheetData(): Promise<RankingItem[]> {
  const csvUrl = process.env.CSV_EXPORT_URL;

  if (!csvUrl) {
    console.log('環境変数が未設定のため、モックデータを返します');
    return mockData;
  }

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      console.error(`CSV取得HTTP エラー: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    console.log('CSV取得成功。サイズ:', csvText.length, 'バイト');
    const data = parseCSV(csvText);
    console.log('パース後のデータ:', data.length, '件');
    return data.length > 0 ? data : mockData;
  } catch (error) {
    console.error('CSV取得エラー:', error);
    return mockData;
  }
}

export async function GET() {
  const data = await getSheetData();
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const lastUpdated = new Date().toISOString();

  return NextResponse.json({
    rankings: data,
    totalCount,
    lastUpdated,
  });
}