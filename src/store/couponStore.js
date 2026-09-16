import { computed, reactive, readonly } from 'vue'
import { coupons, couponMap } from '../data/coupons'
import * as remote from '../lib/remote'

const STORAGE_KEY = 'coupon-book.v1'
const DEVICE_KEY = 'coupon-book.device'

/**
 * 사용 기록은 "이벤트 목록"이다. 각 기록은 고유 id를 가지므로
 * 두 기기의 목록을 합칠 때 id 기준 합집합만 하면 충돌이 없다.
 * 사용 취소는 tombstone(삭제된 id 목록)으로 처리해서, 동기화 때 되살아나지 않게 한다.
 *
 * state.usages  : { [usageId]: { id, couponId, usedAt, usedBy } }
 * state.deleted : usageId[]  (취소된 기록)
 */
const state = reactive({
  usages: {},
  deleted: [],
  syncStatus: remote.isRemoteEnabled ? 'idle' : 'off', // off | idle | syncing | synced | error
  syncError: null,
  loaded: false,
})

// ---------------------------------------------------------------- 로컬 저장소

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    state.usages = parsed.usages || {}
    state.deleted = parsed.deleted || []
  } catch {
    // 저장소가 깨졌으면 그냥 빈 상태로 시작한다.
  }
}

function saveLocal() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ usages: state.usages, deleted: state.deleted }),
    )
  } catch {
    // 사파리 시크릿 모드 등에서 실패할 수 있다. 화면 동작은 계속되어야 한다.
  }
}

function deviceName() {
  let name = localStorage.getItem(DEVICE_KEY)
  if (!name) {
    name = /iPhone|iPad|Android/i.test(navigator.userAgent) ? '📱' : '💻'
    localStorage.setItem(DEVICE_KEY, name)
  }
  return name
}

function newId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

// ------------------------------------------------------------------- 동기화

let syncing = false

async function sync() {
  if (!remote.isRemoteEnabled || syncing) return
  syncing = true
  state.syncStatus = 'syncing'
  try {
    const remoteUsages = await remote.fetchUsages()
    const remoteIds = new Set(remoteUsages.map((u) => u.id))

    // 1) 원격에만 있는 기록을 로컬로 (단, 취소된 건 제외)
    const deleted = new Set(state.deleted)
    for (const u of remoteUsages) {
      if (!deleted.has(u.id)) state.usages[u.id] = u
    }

    // 2) 로컬에만 있는 기록을 원격으로
    const toPush = Object.values(state.usages).filter((u) => !remoteIds.has(u.id))
    if (toPush.length) await remote.pushUsages(toPush)

    // 3) 로컬에서 취소한 기록을 원격에서도 삭제
    const toDelete = state.deleted.filter((id) => remoteIds.has(id))
    if (toDelete.length) await remote.deleteUsages(toDelete)

    saveLocal()
    state.syncStatus = 'synced'
    state.syncError = null
  } catch (err) {
    state.syncStatus = 'error'
    state.syncError = err?.message || String(err)
  } finally {
    syncing = false
  }
}

let unsubscribe = null

export async function initStore() {
  if (state.loaded) return
  loadLocal()
  state.loaded = true

  if (remote.isRemoteEnabled) {
    await sync()
    unsubscribe = remote.subscribeUsages(() => sync())
    // 앱을 다시 켰을 때(백그라운드 → 포그라운드) 한 번 더 맞춰준다.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') sync()
    })
    window.addEventListener('online', () => sync())
  }
}

export function disposeStore() {
  unsubscribe?.()
  unsubscribe = null
}

export { sync as syncNow }

// ---------------------------------------------------------------- 조회 / 액션

export const usageList = computed(() =>
  Object.values(state.usages).sort((a, b) => b.usedAt.localeCompare(a.usedAt)),
)

export function usagesOf(couponId) {
  return usageList.value.filter((u) => u.couponId === couponId)
}

export function usedCount(couponId) {
  return usagesOf(couponId).length
}

export function remainingOf(coupon) {
  if (coupon.unlimited) return Infinity
  return Math.max(0, (coupon.limit ?? 1) - usedCount(coupon.id))
}

export function isExpired(coupon) {
  if (!coupon.expires) return false
  return new Date(coupon.expires + 'T23:59:59') < new Date()
}

export function isAvailable(coupon) {
  return !isExpired(coupon) && remainingOf(coupon) > 0
}

/** 쿠폰 1회 사용 처리. 성공하면 만들어진 기록을 반환. */
export async function useCoupon(couponId) {
  const coupon = couponMap[couponId]
  if (!coupon || !isAvailable(coupon)) return null

  const usage = {
    id: newId(),
    couponId,
    usedAt: new Date().toISOString(),
    usedBy: deviceName(),
  }
  state.usages[usage.id] = usage
  saveLocal()

  if (remote.isRemoteEnabled) {
    try {
      await remote.pushUsages([usage])
      state.syncStatus = 'synced'
    } catch (err) {
      // 오프라인이어도 로컬에는 남는다. 다음 동기화 때 올라간다.
      state.syncStatus = 'error'
      state.syncError = err?.message || String(err)
    }
  }
  return usage
}

/** 실수로 사용처리한 걸 되돌린다. */
export async function cancelUsage(usageId) {
  if (!state.usages[usageId]) return
  delete state.usages[usageId]
  if (!state.deleted.includes(usageId)) state.deleted.push(usageId)
  saveLocal()

  if (remote.isRemoteEnabled) {
    try {
      await remote.deleteUsages([usageId])
      state.syncStatus = 'synced'
    } catch (err) {
      state.syncStatus = 'error'
      state.syncError = err?.message || String(err)
    }
  }
}

export const stats = computed(() => {
  const total = coupons.reduce((sum, c) => sum + (c.unlimited ? 0 : (c.limit ?? 1)), 0)
  const used = usageList.value.length
  return { total, used, left: Math.max(0, total - used) }
})

export const store = readonly(state)
export { coupons, couponMap }
export const remoteEnabled = remote.isRemoteEnabled
