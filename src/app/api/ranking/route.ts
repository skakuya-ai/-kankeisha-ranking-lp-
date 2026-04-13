import { NextResponse } from 'next/server';

// 常に最新データを取得するよう指定
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RankingItem {
  name: string;
  count: number;
}


function parseCSV(csvText: string): RankingItem[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  console.log('=== CSV パース情報 ===');
  console.log('総行数:', lines.length);
  console.log('最初の行（ヘッダー）:', lines[0]);
  console.log('2行目:', lines[1]);

  // 1行目はヘッダーなのでスキップ
  const countByName: Record<string, number> = {};
  let processedCount = 0;
  
  lines.slice(1).forEach((line) => {
    if (!line.trim()) return; // 空行はスキップ
    
    const cells = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    const nameColumn = parseInt(process.env.NAME_COLUMN || '4', 10);
    const name = cells[nameColumn]?.trim();

    if (name && name.length > 0) {
      countByName[name] = (countByName[name] || 0) + 1;
      processedCount++;
    }
  });

  console.log('処理行数:', processedCount);
  console.log('集計結果:', countByName);

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
    throw new Error('CSV_EXPORT_URL is not set');
  }

  console.log('CSV取得開始。URL:', csvUrl);
  const response = await fetch(csvUrl, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const csvText = await response.text();
  console.log('CSV取得成功。サイズ:', csvText.length, 'バイト');
  const data = parseCSV(csvText);
  console.log('パース後のデータ:', data.length, '件');
  return data;
}

export async function GET() {
  try {
    const data = await getSheetData();
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    const lastUpdated = new Date().toISOString();

    return NextResponse.json(
      { rankings: data, totalCount, lastUpdated },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
  } catch (error) {
    console.error('データ取得エラー:', error);
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}