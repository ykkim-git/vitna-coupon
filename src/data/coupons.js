/**
 * 쿠폰 목록.
 *
 * id      : 절대 바꾸지 말 것. 사용 기록이 이 id로 저장된다.
 *           (id를 바꾸면 이미 사용한 쿠폰이 미사용으로 되돌아온다)
 * title   : 쿠폰 이름
 * desc    : 설명 / 조건
 * emoji   : 카드에 크게 보이는 아이콘
 * theme   : 'rose' | 'peach' | 'lilac' | 'mint' | 'sky' | 'gold'
 * limit   : 사용 가능 횟수 (기본 1). Infinity 대신 큰 숫자를 쓰거나 unlimited: true
 * unlimited: true 면 횟수 제한 없음
 * expires : 'YYYY-MM-DD' 유효기간 (없으면 무기한)
 */
export const coupons = [
  {
    id: 'massage-30',
    title: '어깨 안마 30분 이용권',
    desc: '군말 없이, 폰 안 보고, 진심을 담아 30분.',
    emoji: '💆‍♀️',
    theme: 'rose',
    limit: 3,
  },
  {
    id: 'chore-free-day',
    title: '집안일 올프리 데이',
    desc: '하루 종일 설거지·빨래·청소 전부 내가 함. 아무것도 안 해도 되는 날.',
    emoji: '🧹',
    theme: 'mint',
    limit: 2,
  },
  {
    id: 'late-sleep',
    title: '늦잠 자도 되는 쿠폰',
    desc: '아침은 내가 준비할게. 알람 꺼두고 푹 자기.',
    emoji: '😴',
    theme: 'lilac',
    limit: 3,
  },
  {
    id: 'dinner-anywhere',
    title: '먹고 싶은 거 아무거나',
    desc: '가격·거리·메뉴 불문. "아무거나"는 금지, 진짜 먹고 싶은 걸로.',
    emoji: '🍽️',
    theme: 'peach',
    limit: 2,
  },
  {
    id: 'movie-night',
    title: '영화 고르기 독점권',
    desc: '내 취향 1도 반영 안 해도 됨. 중간에 잠들어도 아무 말 안 함.',
    emoji: '🍿',
    theme: 'sky',
    limit: 3,
  },
  {
    id: 'cafe-date',
    title: '카페 데이트권',
    desc: '디저트 두 개까지 무조건 OK.',
    emoji: '☕',
    theme: 'gold',
    limit: 3,
  },
  {
    id: 'no-question-shopping',
    title: '묻지도 따지지도 않는 쇼핑권',
    desc: '"이거 또 샀어?" 금지. 표정 관리까지 포함.',
    emoji: '🛍️',
    theme: 'rose',
    limit: 1,
  },
  {
    id: 'solo-time',
    title: '혼자만의 시간 3시간',
    desc: '나는 조용히 사라짐. 연락도 안 함.',
    emoji: '🫧',
    theme: 'lilac',
    limit: 2,
  },
  {
    id: 'drive-anywhere',
    title: '어디든 드라이브권',
    desc: '가고 싶다고 말만 해. 거리 상관없이 운전은 내가.',
    emoji: '🚗',
    theme: 'mint',
    limit: 2,
  },
  {
    id: 'wish-card',
    title: '소원권 (만능)',
    desc: '위에 없는 아무거나. 단, 합법적이고 실현 가능한 것으로.',
    emoji: '⭐',
    theme: 'gold',
    limit: 1,
  },
]

export const couponMap = Object.fromEntries(coupons.map((c) => [c.id, c]))
