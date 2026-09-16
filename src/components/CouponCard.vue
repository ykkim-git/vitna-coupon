<script setup>
import { computed } from 'vue'
import { isAvailable, isExpired, isLocked, isUsed } from '../store/couponStore'

const props = defineProps({
  coupon: { type: Object, required: true },
  admin: { type: Boolean, default: false },
})
defineEmits(['use', 'unlock', 'cancel'])

const available = computed(() => isAvailable(props.coupon))
const expired = computed(() => isExpired(props.coupon))
const locked = computed(() => isLocked(props.coupon))
const used = computed(() => isUsed(props.coupon.id))

// 관리자 모드에서는 되돌리기 버튼이 도장 자리를 차지하므로,
// 도장을 감추는 대신 왼쪽에 문구로 상태를 보여준다.
const showStamp = computed(() => (used.value || expired.value) && !(props.admin && used.value))

const statusText = computed(() => {
  if (expired.value) return '기간 만료'
  if (used.value) return props.admin ? '사용 완료' : ''
  if (locked.value) return '🔒 잠긴 쿠폰'
  return '사용 가능'
})

// 잠겨 있는 동안에는 쿠폰 이름도 가린다.
const displayTitle = computed(() => (locked.value ? '스페셜 쿠폰' : props.coupon.title))
</script>

<template>
  <article
    class="card"
    :class="[`t-${coupon.theme || 'rose'}`, { off: used || expired, locked }]"
  >
    <div class="stub">
      <span class="emoji">{{ locked ? '🎁' : coupon.emoji }}</span>
    </div>

    <div class="perf" aria-hidden="true"></div>

    <div class="body">
      <!-- 잠긴 스페셜 쿠폰은 이름과 내용을 모두 가려둔다. 미션을 완료해야 열린다. -->
      <h3 class="title serif">{{ displayTitle }}</h3>
      <p v-if="locked" class="desc teaser">미션을 완료하면 열리는 쿠폰이에요.</p>
      <p v-else class="desc">{{ coupon.desc }}</p>

      <div class="foot">
        <span v-if="statusText" class="status" :class="{ warn: used || expired }">
          {{ statusText }}
        </span>
        <span v-else></span>

        <button v-if="locked" class="use btn open" @click="$emit('unlock', coupon)">
          열어보기
        </button>
        <button v-else-if="available" class="use btn" @click="$emit('use', coupon)">
          사용하기
        </button>
        <!-- 관리자 모드에서만 되돌리기가 보인다. -->
        <button v-else-if="admin && used" class="undo btn" @click="$emit('cancel', coupon)">
          되돌리기
        </button>
      </div>
    </div>

    <div v-if="showStamp" class="stamp serif">{{ expired ? 'EXPIRED' : 'USED' }}</div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: opacity 0.2s ease;
}
.card.off {
  opacity: 0.62;
}
.card.locked {
  box-shadow: 0 6px 22px rgba(214, 170, 60, 0.28);
}

.stub {
  flex: 0 0 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, var(--c1), var(--c2));
  padding: 18px 8px;
}
.emoji {
  font-size: 32px;
  line-height: 1;
}
.card.locked .emoji {
  animation: bob 2.4s ease-in-out infinite;
}
@keyframes bob {
  50% {
    transform: translateY(-4px) rotate(-6deg);
  }
}

/* 절취선 */
.perf {
  width: 0;
  border-left: 2px dashed var(--line);
  margin: 10px 0;
}

.body {
  flex: 1;
  min-width: 0;
  padding: 16px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.title {
  margin: 0;
  font-size: 16.5px;
  font-weight: 700;
  letter-spacing: -0.2px;
}
.desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--ink-soft);
  /* desc에 넣은 줄바꿈(\n)을 그대로 보여준다. */
  white-space: pre-line;
}
.desc.teaser {
  font-style: italic;
}
.foot {
  margin-top: auto;
  padding-top: 10px;
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.status {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--accent-deep);
}
.status.warn {
  color: var(--ink-soft);
}
.use {
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 13px;
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
  color: #fff;
  box-shadow: 0 3px 10px rgba(224, 107, 139, 0.3);
}
.use.open {
  background: linear-gradient(135deg, #e8bf5d, #c99a2c);
  box-shadow: 0 3px 10px rgba(201, 154, 44, 0.35);
}
.undo {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  background: #f5eef1;
  color: var(--ink-soft);
  position: relative;
  z-index: 1;
}

.stamp {
  position: absolute;
  right: 14px;
  bottom: 14px;
  transform: rotate(-9deg);
  border: 3px solid rgba(155, 74, 74, 0.35);
  color: rgba(155, 74, 74, 0.38);
  border-radius: 8px;
  padding: 3px 10px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 2px;
  pointer-events: none;
}

.t-rose {
  --c1: var(--t-rose-1);
  --c2: var(--t-rose-2);
}
.t-peach {
  --c1: var(--t-peach-1);
  --c2: var(--t-peach-2);
}
.t-lilac {
  --c1: var(--t-lilac-1);
  --c2: var(--t-lilac-2);
}
.t-mint {
  --c1: var(--t-mint-1);
  --c2: var(--t-mint-2);
}
.t-sky {
  --c1: var(--t-sky-1);
  --c2: var(--t-sky-2);
}
.t-gold {
  --c1: var(--t-gold-1);
  --c2: var(--t-gold-2);
}
</style>
