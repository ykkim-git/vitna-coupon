<script setup>
import { ref } from 'vue'
import ConfirmSheet from '../components/ConfirmSheet.vue'
import { cancelUsage, couponMap, usageList } from '../store/couponStore'
import { toast } from '../composables/useToast'

const target = ref(null)
const busy = ref(false)

function fmt(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0',
  )}`
}

async function confirmCancel() {
  const u = target.value
  if (!u) return
  busy.value = true
  await cancelUsage(u.id)
  busy.value = false
  target.value = null
  toast('사용처리를 되돌렸어요.')
}
</script>

<template>
  <main class="page">
    <header class="head">
      <h1 class="serif">사용 내역</h1>
      <p class="sub">{{ usageList.length }}번 사용했어요</p>
    </header>

    <ol v-if="usageList.length" class="timeline">
      <li v-for="u in usageList" :key="u.id" class="item">
        <span class="emoji">{{ couponMap[u.couponId]?.emoji || '🎟️' }}</span>
        <div class="info">
          <p class="name">{{ couponMap[u.couponId]?.title || u.couponId }}</p>
          <p class="when">{{ fmt(u.usedAt) }} <span v-if="u.usedBy">· {{ u.usedBy }}</span></p>
        </div>
        <button class="undo" @click="target = u">되돌리기</button>
      </li>
    </ol>

    <p v-else class="empty">아직 사용한 쿠폰이 없어요.<br />마음껏 써주세요 🎁</p>

    <ConfirmSheet
      :open="!!target"
      title="사용처리를 되돌릴까요?"
      :message="target ? couponMap[target.couponId]?.title : ''"
      detail="쿠폰이 다시 사용 가능 상태로 돌아가요."
      confirm-text="네, 되돌릴게요"
      :busy="busy"
      @confirm="confirmCancel"
      @cancel="target = null"
    />
  </main>
</template>

<style scoped>
.page {
  padding: 0 18px 20px;
}
.head {
  padding: 34px 4px 22px;
  text-align: center;
}
.head h1 {
  margin: 0 0 4px;
  font-size: 25px;
}
.sub {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink-soft);
}
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  display: flex;
  align-items: center;
  gap: 13px;
  background: var(--surface);
  border-radius: 16px;
  padding: 14px 15px;
  box-shadow: var(--shadow);
}
.emoji {
  font-size: 22px;
  flex: 0 0 auto;
}
.info {
  flex: 1;
  min-width: 0;
}
.name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.when {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: var(--ink-soft);
}
.undo {
  flex: 0 0 auto;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink-soft);
  background: #f5eef1;
  padding: 7px 11px;
  border-radius: 999px;
}
.empty {
  text-align: center;
  color: var(--ink-soft);
  font-size: 13.5px;
  line-height: 1.8;
  padding: 60px 0;
}
</style>
