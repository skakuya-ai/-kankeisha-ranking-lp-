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

// 入力された名前をSTAFF_NAMESの表記に統一する
// - 完全一致 → そのまま返す
// - 入力が登録名の前方一致（苗字のみ入力）→ 1件のみの場合に変換
// - 登録名が入力の前方一致（フルネーム入力、苗字のみ登録）→ 1件のみの場合に変換
// - マッチなし → 入力値をそのまま返す
export function resolveName(raw: string): string {
  const normalized = raw.trim().normalize('NFKC').replace(/\s+/g, '');

  if (STAFF_NAMES.includes(normalized)) return normalized;

  // 苗字のみ入力 → フルネーム登録にマッチ
  const prefixOfStaff = STAFF_NAMES.filter(name => name.startsWith(normalized));
  if (prefixOfStaff.length === 1) return prefixOfStaff[0];

  // フルネーム入力 → 苗字のみ登録にマッチ
  const staffPrefixOfInput = STAFF_NAMES.filter(name => normalized.startsWith(name));
  if (staffPrefixOfInput.length === 1) return staffPrefixOfInput[0];

  return normalized;
}
