<script setup>
import { RouterLink } from 'vue-router'

const tabs = [
  { to: '/', icon: '🎟️', label: '쿠폰' },
  { to: '/history', icon: '📜', label: '사용내역' },
  { to: '/qr', icon: '📱', label: 'QR' },
]
</script>

<template>
  <nav class="tabbar">
    <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab" active-class="on">
      <span class="icon">{{ t.icon }}</span>
      <span class="label">{{ t.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: 480px;
  display: flex;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--line);
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  z-index: 40;
}
.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--ink-soft);
  padding: 4px 0;
}
.icon {
  font-size: 20px;
  line-height: 1;
  filter: grayscale(0.7);
  opacity: 0.6;
  transition: all 0.15s ease;
}
.label {
  font-size: 11px;
  font-weight: 600;
}
.tab.on {
  color: var(--accent-deep);
}
.tab.on .icon {
  filter: none;
  opacity: 1;
  transform: translateY(-1px);
}
</style>
