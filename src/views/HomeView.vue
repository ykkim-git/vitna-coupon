<script setup>
import { computed, ref } from "vue";
import CouponCard from "../components/CouponCard.vue";
import ConfirmSheet from "../components/ConfirmSheet.vue";
import PasswordSheet from "../components/PasswordSheet.vue";
import { toast } from "../composables/useToast";
import { useAdmin } from "../composables/useAdmin";
import {
  cancelUsage,
  coupons,
  isUnspent,
  relockCoupon,
  stats,
  unlockCoupon,
  useCoupon,
} from "../store/couponStore";

const { isAdmin, login, logout } = useAdmin();

const filter = ref("all"); // all | available | used
const busy = ref(false);

// 열려 있는 시트 하나만 관리한다. { kind, coupon }
const sheet = ref(null);
const passwordOpen = ref(false);
const passwordSheet = ref(null);

const visible = computed(() => {
  // '사용 가능'에는 아직 안 쓴 쿠폰이 모두 들어간다 (잠긴 스페셜 쿠폰 포함).
  if (filter.value === "available") return coupons.filter((c) => isUnspent(c));
  if (filter.value === "used") return coupons.filter((c) => !isUnspent(c));
  return coupons;
});

function askUse(coupon) {
  sheet.value = { kind: "use", coupon };
}

function askUnlock(coupon) {
  sheet.value = { kind: "unlock", coupon };
}

function askCancel(coupon) {
  sheet.value = { kind: "cancel", coupon };
}

// 되돌리기 쉬운 동작이라 확인 시트 없이 바로 처리한다.
function onRelock(coupon) {
  relockCoupon(coupon.id);
  toast("스페셜 쿠폰을 다시 잠갔어요. 🔒");
}

async function confirm() {
  const s = sheet.value;
  if (!s) return;

  if (s.kind === "unlock") {
    unlockCoupon(s.coupon.id);
    sheet.value = null;
    toast(`${s.coupon.title} 쿠폰이 열렸어요! 🎉`, "success");
    return;
  }

  busy.value = true;
  if (s.kind === "use") {
    const usage = await useCoupon(s.coupon.id);
    busy.value = false;
    sheet.value = null;
    toast(
      usage
        ? `${s.coupon.title} 사용 완료! 🎉`
        : "이미 사용한 쿠폰이에요.",
      usage ? "success" : "error",
    );
    return;
  }

  if (s.kind === "cancel") {
    const result = await cancelUsage(s.coupon.id);
    busy.value = false;
    sheet.value = null;
    if (result.ok) {
      toast(`${s.coupon.title} 사용처리를 되돌렸어요.`);
    } else {
      toast("되돌리기에 실패했어요. 잠시 후 다시 시도해주세요.", "error");
    }
  }
}

function onAdminClick() {
  if (isAdmin.value) {
    logout();
    toast("관리자 모드를 껐어요.");
  } else {
    passwordOpen.value = true;
  }
}

function onPasswordSubmit(password) {
  if (login(password)) {
    passwordOpen.value = false;
    toast("관리자 모드가 켜졌어요. 🔑");
  } else {
    passwordSheet.value?.reject();
  }
}

const sheetProps = computed(() => {
  const s = sheet.value;
  if (!s) return {};
  if (s.kind === "unlock") {
    return {
      title: "🎁 스페셜 쿠폰",
      message: s.coupon.unlockMessage,
      detail: "",
      confirmText: "확인",
      cancelText: "나중에",
    };
  }
  if (s.kind === "cancel") {
    return {
      title: "사용처리를 되돌릴까요?",
      message: s.coupon.title,
      detail: "쿠폰이 다시 사용 가능 상태로 돌아가요.",
      confirmText: "네, 되돌릴게요",
      cancelText: "아니요",
    };
  }
  return {
    title: "정말 사용할까요?",
    message: s.coupon.title,
    detail: "한 번 사용하면 되돌릴 수 없어요.",
    confirmText: "네, 사용할게요",
    cancelText: "아니요",
  };
});
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

      <button
        class="chip admin"
        :class="{ on: isAdmin }"
        :title="isAdmin ? '관리자 모드 끄기' : '관리자 모드'"
        @click="onAdminClick"
      >
        {{ isAdmin ? "🔑" : "🔒" }}
      </button>
    </nav>

    <section class="list">
      <CouponCard
        v-for="c in visible"
        :key="c.id"
        :coupon="c"
        :admin="isAdmin"
        @use="askUse"
        @unlock="askUnlock"
        @cancel="askCancel"
        @relock="onRelock"
      />
      <p v-if="!visible.length" class="empty">해당하는 쿠폰이 없어요.</p>
    </section>

    <ConfirmSheet
      :open="!!sheet"
      v-bind="sheetProps"
      :busy="busy"
      @confirm="confirm"
      @cancel="sheet = null"
    />

    <PasswordSheet
      ref="passwordSheet"
      :open="passwordOpen"
      @submit="onPasswordSubmit"
      @cancel="passwordOpen = false"
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
.chip.admin {
  margin-left: auto;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1;
}
.chip.admin.on {
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
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
