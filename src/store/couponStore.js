import { computed, reactive, readonly } from 'vue'
import { coupons, couponMap } from '../data/coupons'
import * as remote from '../lib/remote'

const STORAGE_KEY = 'coupon-book.v1'
const DEVICE_KEY = 'coupon-book.device'
const UNLOCK_KEY = 'coupon-book.unlocked'

/**
 * 모든 쿠폰은 1회용이라 사용 기록은 쿠폰당 최대 하나다.
 * 기록의 id를 쿠폰 id에서 만들어 쓰기 때문에, 두 기기가 각자 사용처리해도
 * 같은 행으로 합쳐진다 = 병합 충돌이 없고 중복 사용도 생기지 않는다.
 *
 * 사용 취소는 관리자 모드에서만 가능하다.
 *
 * state.usages   : { [couponId]: { id, couponId, usedAt, usedBy, pending? } }
 *   pending: 이 기기에서 만들었지만 아직 원격에 올리지 못한 기록 (오프라인 등)
 * state.unlocked : 잠금 해제한 스페셜 쿠폰 id 목록 (이 기기에만 저장)
 */
const state = reactive({
  usages: {},
  unlocked: [],
  syncStatus: remote.isRemoteEnabled ? 'idle' : 'off', // off | idle | syncing | synced | error
  syncError: null,
  loaded: false,
})

// ---------------------------------------------------------------- 로컬 저장소

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) state.usages = JSON.parse(raw).usages || {}
  } catch {
    // 저장소가 깨졌으면 그냥 빈 상태로 시작한다.
  }
  try {
    const raw = localStorage.getItem(UNLOCK_KEY)
    if (raw) state.unlocked = JSON.parse(raw) || []
  } catch {
    state.unlocked = []
  }
}

function saveLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ usages: state.usages }))
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(state.unlocked))
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

    // 1) 원격에 있는 기록을 로컬로
    for (const u of remoteUsages) state.usages[u.couponId] = u

    // 2) 원격에 없는 로컬 기록 처리
    //    - pending: 아직 못 올린 것 → 올린다
    //    - 그 외: 관리자가 다른 기기에서 되돌린 것 → 로컬에서도 지운다
    const toPush = []
    for (const u of Object.values(state.usages)) {
      if (remoteIds.has(u.id)) continue
      if (u.pending) toPush.push(u)
      else delete state.usages[u.couponId]
    }
    if (toPush.length) {
      await remote.pushUsages(toPush)
      for (const u of toPush) delete state.usages[u.couponId].pending
    }

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

/** 스페셜 쿠폰인데 아직 미션을 완료하지 않은 상태. */
export function isLocked(coupon) {
  return Boolean(coupon.special) && !state.unlocked.includes(coupon.id)
}

/** 지금 바로 '사용하기'를 누를 수 있는 상태. */
export function isAvailable(coupon) {
  return !isExpired(coupon) && !isUsed(coupon.id) && !isLocked(coupon)
}

/** 아직 쓰지 않은 쿠폰 (잠긴 스페셜 쿠폰도 포함). */
export function isUnspent(coupon) {
  return !isExpired(coupon) && !isUsed(coupon.id)
}

/** 스페셜 쿠폰의 잠금을 푼다. 이 기기에만 저장된다. */
export function unlockCoupon(couponId) {
  if (state.unlocked.includes(couponId)) return
  state.unlocked.push(couponId)
  saveLocal()
}

/** 스페셜 쿠폰을 다시 잠근다. 관리자 모드 전용 (테스트 후 되돌리기용). */
export function relockCoupon(couponId) {
  state.unlocked = state.unlocked.filter((id) => id !== couponId)
  saveLocal()
}

/** 쿠폰 사용 처리. 관리자 모드가 아니면 되돌릴 수 없다. */
export async function useCoupon(couponId) {
  const coupon = couponMap[couponId]
  if (!coupon || !isAvailable(coupon)) return null

  const usage = {
    id: remote.usageId(couponId),
    couponId,
    usedAt: new Date().toISOString(),
    usedBy: deviceName(),
    pending: true,
  }
  state.usages[couponId] = usage
  saveLocal()

  if (remote.isRemoteEnabled) {
    try {
      await remote.pushUsages([usage])
      delete state.usages[couponId].pending
      saveLocal()
      state.syncStatus = 'synced'
    } catch (err) {
      // 오프라인이어도 로컬에는 pending으로 남는다. 다음 동기화 때 올라간다.
      state.syncStatus = 'error'
      state.syncError = err?.message || String(err)
    }
  } else {
    delete state.usages[couponId].pending
    saveLocal()
  }
  return usage
}

/**
 * 사용 처리를 되돌린다. 관리자 모드 전용.
 * 원격 삭제에 실패하면 로컬도 건드리지 않는다 — 한쪽만 지워지면
 * 다른 폰에서 다시 동기화되어 되살아나기 때문이다.
 */
export async function cancelUsage(couponId) {
  const usage = state.usages[couponId]
  if (!usage) return { ok: true }

  if (remote.isRemoteEnabled) {
    try {
      await remote.deleteUsages([usage.id])
      state.syncStatus = 'synced'
    } catch (err) {
      state.syncStatus = 'error'
      state.syncError = err?.message || String(err)
      return { ok: false, error: err?.message || String(err) }
    }
  }

  delete state.usages[couponId]
  saveLocal()
  return { ok: true }
}

export const stats = computed(() => {
  const total = coupons.length
  const used = coupons.filter((c) => isUsed(c.id)).length
  return { total, used, left: total - used }
})

export const store = readonly(state)
export { coupons, couponMap }
export const remoteEnabled = remote.isRemoteEnabled
