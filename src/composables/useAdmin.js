import { readonly, ref } from 'vue'

/**
 * 관리자 모드 — 사용 처리된 쿠폰을 되돌리기 위한 잠금장치.
 *
 * ⚠️ 비밀번호는 브라우저로 내려가는 코드 안에 있다. 개발자 도구를 열거나
 *    번들 파일을 뒤지면 누구나 볼 수 있다. 진짜 보안이 아니라, 실수로 누르거나
 *    호기심에 눌러보는 것을 막는 수준의 잠금이다. (백엔드가 없으니 이게 한계)
 */
const PASSWORD = 'dudrnjs2@@##'
const SESSION_KEY = 'coupon-book.admin'

// sessionStorage: 탭을 닫으면 자동으로 풀린다.
const isAdmin = ref(sessionStorage.getItem(SESSION_KEY) === '1')

export function useAdmin() {
  function login(password) {
    if (password !== PASSWORD) return false
    isAdmin.value = true
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // 저장에 실패해도 이번 세션 동안은 동작한다.
    }
    return true
  }

  function logout() {
    isAdmin.value = false
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // 무시
    }
  }

  return { isAdmin: readonly(isAdmin), login, logout }
}
