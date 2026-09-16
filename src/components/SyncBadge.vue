<script setup>
import { computed } from 'vue'
import { remoteEnabled, store, syncNow } from '../store/couponStore'

const label = computed(() => {
  if (!remoteEnabled) return '이 기기에만 저장 중'
  switch (store.syncStatus) {
    case 'syncing':
      return '동기화 중…'
    case 'synced':
      return '두 기기 동기화됨'
    case 'error':
      return '동기화 실패 · 눌러서 재시도'
    default:
      return '연결 대기 중'
  }
})

const tone = computed(() => {
  if (!remoteEnabled) return 'local'
  return store.syncStatus === 'error' ? 'error' : store.syncStatus
})
</script>

<template>
  <button class="badge" :class="tone" :disabled="!remoteEnabled" @click="syncNow()">
    <span class="dot"></span>{{ label }}
  </button>
</template>

<style scoped>
.badge {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.72);
  color: var(--ink-soft);
}
.badge:disabled {
  cursor: default;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c3b4bb;
}
.badge.synced .dot {
  background: #57bb8a;
}
.badge.syncing .dot {
  background: #f0b429;
  animation: pulse 1s ease-in-out infinite;
}
.badge.error {
  color: #9b4a4a;
}
.badge.error .dot {
  background: #9b4a4a;
}
@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}
</style>
