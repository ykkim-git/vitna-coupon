import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** 쿠폰북 식별자. 여러 쿠폰북을 한 프로젝트에서 쓰고 싶을 때 구분용. */
export const BOOK_ID = import.meta.env.VITE_BOOK_ID || 'default'

export const isRemoteEnabled = Boolean(url && anonKey)

export const supabase = isRemoteEnabled ? createClient(url, anonKey) : null

const TABLE = 'coupon_usages'

/**
 * 사용 기록의 기본키. 쿠폰 하나당 한 행뿐이므로
 * 두 폰이 동시에 눌러도 upsert가 같은 행으로 합쳐진다 = 중복 사용 불가.
 */
export function usageId(couponId) {
  return `${BOOK_ID}:${couponId}`
}

/** 원격에 저장된 모든 사용 기록을 가져온다. */
export async function fetchUsages() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, coupon_id, used_at, used_by')
    .eq('book_id', BOOK_ID)
  if (error) throw error
  return data.map(rowToUsage)
}

/** 사용 기록을 원격에 올린다 (이미 있으면 덮어쓰기). */
export async function pushUsages(usages) {
  if (!usages.length) return
  const rows = usages.map((u) => ({
    id: u.id,
    book_id: BOOK_ID,
    coupon_id: u.couponId,
    used_at: u.usedAt,
    used_by: u.usedBy ?? null,
  }))
  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'id' })
  if (error) throw error
}

/**
 * 실시간 구독. 다른 폰에서 사용처리하면 바로 콜백이 불린다.
 * @returns {() => void} 구독 해제 함수
 */
export function subscribeUsages(onChange) {
  const channel = supabase
    .channel(`coupon-usages-${BOOK_ID}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE, filter: `book_id=eq.${BOOK_ID}` },
      () => onChange(),
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}

function rowToUsage(row) {
  return {
    id: row.id,
    couponId: row.coupon_id,
    usedAt: row.used_at,
    usedBy: row.used_by || undefined,
  }
}
