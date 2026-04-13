export const STAFF_NAMES: string[] = [
  // 同姓がいない場合は苗字だけでOK
  // 例: '山田',
  //
  // 同姓がいる場合はフルネームで区別する
  // 例: '鈴木太郎',
  //     '鈴木花子',
  '角屋',
  '八木',
  '高橋',
  '小木田',
  '藤村',
  
];

// 入力された名前をスタッフのフルネームに解決する
// - 完全一致 → そのまま返す
// - 前方一致が1人だけ → そのスタッフ名を返す（同姓がいる場合は変換しない）
// - マッチなし → 入力値をそのまま返す
export function resolveName(raw: string): string {
  const normalized = raw.trim().normalize('NFKC').replace(/\s+/g, '');

  if (STAFF_NAMES.includes(normalized)) return normalized;

  const matches = STAFF_NAMES.filter(name => name.startsWith(normalized));
  if (matches.length === 1) return matches[0];

  return normalized;
}
