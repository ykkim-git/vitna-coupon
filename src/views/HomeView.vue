<script setup>
import { computed, ref } from "vue";
import CouponCard from "../components/CouponCard.vue";
import ConfirmSheet from "../components/ConfirmSheet.vue";
import { toast } from "../composables/useToast";
import { coupons, isAvailable, stats, useCoupon } from "../store/couponStore";

const filter = ref("all"); // all | available | used
const target = ref(null);
const busy = ref(false);

const visible = computed(() => {
  if (filter.value === "available")
    return coupons.filter((c) => isAvailable(c));
  if (filter.value === "used") return coupons.filter((c) => !isAvailable(c));
  return coupons;
});

function askUse(coupon) {
  target.value = coupon;
}

async function confirmUse() {
  const c = target.value;
  if (!c) return;
  busy.value = true;
  const usage = await useCoupon(c.id);
  busy.value = false;
  target.value = null;
  if (usage) {
    toast(`${c.title} 사용 완료! 🎉`, "success");
  } else {
    toast("이미 사용한 쿠폰이에요.", "error");
  }
}
</script>

<template>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">FOR MY LOVE</p>
      <h1 class="serif">빛나의 쿠폰북</h1>
      <p class="sub">2026년 09월 17일 생일을 축하합니다!</p>

      <div class="gauge">
        <div class="bar">
          <div
            class="fill"
            :style="{
              width: stats.total
                ? (stats.used / stats.total) * 100 + '%'
                : '0%',
            }"
          ></div>
        </div>
        <span class="gauge-text"
          >{{ stats.left }}장 남음 · 총 {{ stats.total }}장</span
        >
      </div>
    </header>

    <nav class="filters">
      <button
        v-for="f in [
          { key: 'all', label: '전체' },
          { key: 'available', label: '사용 가능' },
          { key: 'used', label: '사용 완료' },
        ]"
        :key="f.key"
        class="chip"
        :class="{ on: filter === f.key }"
        @click="filter = f.key"
      >
        {{ f.label }}
      </button>
    </nav>

    <section class="list">
      <CouponCard v-for="c in visible" :key="c.id" :coupon="c" @use="askUse" />
      <p v-if="!visible.length" class="empty">해당하는 쿠폰이 없어요.</p>
    </section>

    <ConfirmSheet
      :open="!!target"
      title="정말 사용할까요?"
      :message="target?.title"
      detail="한 번 사용하면 되돌릴 수 없어요."
      :busy="busy"
      @confirm="confirmUse"
      @cancel="target = null"
    />
  </main>
</template>

<style scoped>
.page {
  padding: 0 18px 20px;
}
.hero {
  padding: 34px 4px 20px;
  text-align: center;
}
.eyebrow {
  margin: 0;
  font-size: 10.5px;
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--accent);
  opacity: 0.8;
}
.hero h1 {
  margin: 6px 0 4px;
  font-size: 30px;
  letter-spacing: -0.5px;
}
.sub {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink-soft);
}
.gauge {
  margin-top: 18px;
}
.bar {
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(180, 120, 145, 0.16);
}
.fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--t-rose-2), var(--accent));
  transition: width 0.45s cubic-bezier(0.32, 0.72, 0, 1);
}
.gauge-text {
  display: inline-block;
  margin-top: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink-soft);
}

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}
.chip {
  padding: 8px 15px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.72);
  color: var(--ink-soft);
  transition: all 0.15s ease;
}
.chip.on {
  background: var(--ink);
  color: #fff;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.empty {
  text-align: center;
  color: var(--ink-soft);
  font-size: 13px;
  padding: 40px 0;
}
</style>
