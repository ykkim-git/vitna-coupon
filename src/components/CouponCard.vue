<script setup>
import { computed } from 'vue'
import { isAvailable, isExpired } from '../store/couponStore'

const props = defineProps({
  coupon: { type: Object, required: true },
})
defineEmits(['use'])

const available = computed(() => isAvailable(props.coupon))
const expired = computed(() => isExpired(props.coupon))

// 사용한 쿠폰은 USED 도장과 비활성 버튼이 이미 말해주므로 상태 문구를 비운다.
const statusText = computed(() => {
  if (expired.value) return '기간 만료'
  return available.value ? '사용 가능' : ''
})
</script>

<template>
  <article class="card" :class="[`t-${coupon.theme || 'rose'}`, { off: !available }]">
    <div class="stub">
      <span class="emoji">{{ coupon.emoji }}</span>
    </div>

    <div class="perf" aria-hidden="true"></div>

    <div class="body">
      <h3 class="title serif">{{ coupon.title }}</h3>
      <p class="desc">{{ coupon.desc }}</p>

      <div class="foot">
        <span v-if="statusText" class="status" :class="{ warn: !available }">{{ statusText }}</span>
        <span v-else></span>
        <!-- 사용한 쿠폰은 누를 것이 없다. USED 도장이 자리를 대신한다. -->
        <button v-if="available" class="use btn" @click="$emit('use', coupon)">사용하기</button>
      </div>
    </div>

    <div v-if="!available" class="stamp serif">{{ expired ? 'EXPIRED' : 'USED' }}</div>
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
.use:disabled {
  background: #ece2e6;
  color: #b3a3aa;
  box-shadow: none;
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
