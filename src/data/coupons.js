/**
 * 쿠폰 목록. 모든 쿠폰은 1회용이며, 한 번 사용하면 되돌릴 수 없다.
 *
 * id      : 절대 바꾸지 말 것. 사용 여부가 이 id로 저장된다.
 *           (id를 바꾸면 이미 사용한 쿠폰이 미사용으로 되돌아온다)
 * title   : 쿠폰 이름
 * desc    : 설명 / 조건
 * emoji   : 카드에 크게 보이는 아이콘
 * theme   : 'rose' | 'peach' | 'lilac' | 'mint' | 'sky' | 'gold'
 * expires : 'YYYY-MM-DD' 유효기간 (없으면 무기한)
 */
export const coupons = [
  {
    id: "trip-1n2d",
    title: "1박 2일",
    desc: "가고 싶은 곳으로 떠나는 1박 2일. 일정도 숙소도 빛나 마음대로.",
    emoji: "🧳",
    theme: "rose",
  },
  {
    id: "weekend-late-sleep",
    title: "주말 늦잠 쿠폰",
    desc: "오전 10시까지 아무도 깨우지 않아요.",
    emoji: "😴",
    theme: "lilac",
  },
  {
    id: "no-chores",
    title: "집안일 하기싫어",
    desc: "설거지·빨래·청소 전부 맡겨주세요!",
    emoji: "🧹",
    theme: "mint",
  },
  {
    id: "private-chef",
    title: "나만의 쉐프",
    desc: "우리 가족의 식사를 항상 챙겨준 당신, 오늘 만큼은 아빠에게 맡겨주세요.",
    emoji: "👨‍🍳",
    theme: "peach",
  },
  {
    id: "half-day-out",
    title: "반나절 외출 쿠폰",
    desc: `반나절 동안 자유. 어디서 뭘 하든 연락 안 합니다. \n 기준 (리호 아침밥 ~ 리호 저녁밥)`,
    emoji: "🚪",
    theme: "sky",
  },
  {
    id: "skin-care",
    title: "피부미용권",
    desc: "30만원 상당. 묻지도 따지지도 않는다!.",
    emoji: "✨",
    theme: "gold",
  },
];

export const couponMap = Object.fromEntries(coupons.map((c) => [c.id, c]));
