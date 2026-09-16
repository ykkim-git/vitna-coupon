<script setup>
import { toasts } from '../composables/useToast'
</script>

<template>
  <div class="host">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.tone">
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.host {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(96px + env(safe-area-inset-bottom));
  width: 100%;
  max-width: 480px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  z-index: 60;
}
.toast {
  background: rgba(59, 48, 56, 0.92);
  color: #fff;
  padding: 11px 18px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  max-width: 100%;
  text-align: center;
}
.toast.success {
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
}
.toast.error {
  background: #9b4a4a;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
