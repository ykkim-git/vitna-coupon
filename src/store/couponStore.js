import { computed, reactive, readonly } from 'vue'
import { coupons, couponMap } from '../data/coupons'
import * as remote from '../lib/remote'

const STORAGE_KEY = 'coupon-book.v1'
const DEVICE_KEY = 'coupon-book.device'

/**
 * 모든 쿠폰은 1회용이라 사용 기록은 쿠폰당 최대 하나다.
 * 기록의 id를 쿠폰 id에서 만들어 쓰기 때문에, 두 기기가 각자 사용처리해도
 * 같은 행으로 합쳐진다 = 병합 충돌이 없고 중복 사용도 생기지 않는다.
 * 사용 취소는 없다 (한 번 쓰면 끝).
 *
 * state.usages : { [couponId]: { id, couponId, usedAt, usedBy } }
 */
const state = reactive({
  usages: {},
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
  } catch {
    // 저장소가 깨졌으면 그냥 빈 상태로 시작한다.
  }
}

function saveLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ usages: state.usages }))
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

// ------------------------------------------------------------------- 동기화

let syncing = false

async function sync() {
  if (!remote.isRemoteEnabled || syncing) return
  syncing = true
  state.syncStatus = 'syncing'
  try {
    const remoteUsages = await remote.fetchUsages()
    const remoteIds = new Set(remoteUsages.map((u) => u.id))

    // 1) 원격에만 있는 기록을 로컬로
    for (const u of remoteUsages) {
      state.usages[u.couponId] = u
    }

    // 2) 로컬에만 있는 기록을 원격으로
    const toPush = Object.values(state.usages).filter((u) => !remoteIds.has(u.id))
    if (toPush.length) await remote.pushUsages(toPush)

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

export function usageOf(couponId) {
  return state.usages[couponId] || null
}

export function isUsed(couponId) {
  return Boolean(state.usages[couponId])
}

export function isExpired(coupon) {
  if (!coupon.expires) return false
  return new Date(coupon.expires + 'T23:59:59') < new Date()
}

export function isAvailable(coupon) {
  return !isExpired(coupon) && !isUsed(coupon.id)
}

/** 쿠폰 사용 처리. 되돌릴 수 없다. 성공하면 만들어진 기록을 반환. */
export async function useCoupon(couponId) {
  const coupon = couponMap[couponId]
  if (!coupon || !isAvailable(coupon)) return null

  const usage = {
    id: remote.usageId(couponId),
    couponId,
    usedAt: new Date().toISOString(),
    usedBy: deviceName(),
  }
  state.usages[couponId] = usage
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

export const stats = computed(() => {
  const total = coupons.length
  const used = coupons.filter((c) => isUsed(c.id)).length
  return { total, used, left: total - used }
})

export const store = readonly(state)
export { coupons, couponMap }
export const remoteEnabled = remote.isRemoteEnabled
