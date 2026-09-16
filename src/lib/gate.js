/**
 * 첫 진입 비밀번호 잠금.
 *
 * ⚠️ 진짜 보안이 아니다. 정적 사이트라서 마음먹고 보는 사람은 우회할 수 있다.
 *    주소를 우연히 알게 된 사람이 그냥 들어오는 것을 막는 수준의 문이다.
 *    비밀번호 자체는 넣지 않고 SHA-256 해시만 둔다 — 번들을 열어도
 *    비밀번호가 그대로 보이지는 않는다.
 *
 * 비밀번호를 바꾸려면:
 *   npm run gate-hash -- 새비밀번호
 * 출력된 해시를 아래 PASSWORD_SHA256에 붙여넣으면 된다.
 */
const PASSWORD_SHA256 = 'ecb270f58c549eeecb4f6169596450879cf2fa57d925b64f9cc1fdf710798ae5'

const STORAGE_KEY = 'coupon-book.gate'

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** 이미 통과한 적이 있는지. 한 번 열면 그 기기에서는 계속 열려 있다. */
export function isUnlocked() {
  try {
    return localStorage.getItem(STORAGE_KEY) === PASSWORD_SHA256
  } catch {
    return false
  }
}

/**
 * 비밀번호를 확인하고, 맞으면 통과 상태를 저장한다.
 * @returns {Promise<boolean>}
 */
export async function tryUnlock(password) {
  const hex = await sha256Hex(password)
  if (hex !== PASSWORD_SHA256) return false
  try {
    localStorage.setItem(STORAGE_KEY, PASSWORD_SHA256)
  } catch {
    // 저장에 실패해도 이번 방문 동안은 열린다.
  }
  return true
}

/** 잠금 화면을 다시 보고 싶을 때 (테스트용). */
export function relock() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 무시
  }
}

/** crypto.subtle은 https나 localhost에서만 쓸 수 있다. */
export const isSupported =
  typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
