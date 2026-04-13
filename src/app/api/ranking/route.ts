import { NextResponse } from 'next/server';
import { resolveName } from '@/config/staff';

export const dynamic = 'force-dynamic';

interface RankingItem {
  name: string;
  count: number;
}

function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseCSV(csvText: string): RankingItem[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const nameColumn = parseInt(process.env.NAME_COLUMN || '4', 10);
  const countByName: Record<string, number> = {};

  lines.slice(1).forEach((line) => {
    if (!line.trim()) return;
    const cells = parseCSVLine(line);
    const raw = cells[nameColumn]?.trim();
    const name = raw ? resolveName(raw) : undefined;
    if (name) {
      countByName[name] = (countByName[name] || 0) + 1;
    }
  });

  return Object.entries(countByName)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

async function getSheetData(): Promise<RankingItem[]> {
  const csvUrl = process.env.CSV_EXPORT_URL;
  if (!csvUrl) throw new Error('CSV_EXPORT_URL is not set');

  const response = await fetch(csvUrl, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const csvText = await response.text();
  return parseCSV(csvText);
}

export async function GET() {
  try {
    const data = await getSheetData();
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    return NextResponse.json(
      { rankings: data, totalCount, lastUpdated: new Date().toISOString() },
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
