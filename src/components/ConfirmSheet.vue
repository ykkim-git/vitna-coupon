<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '정말 사용할까요?' },
  message: { type: String, default: '' },
  detail: { type: String, default: '' },
  confirmText: { type: String, default: '네, 사용할게요' },
  cancelText: { type: String, default: '아니요' },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="backdrop" @click.self="!busy && emit('cancel')">
        <div class="sheet" role="dialog" aria-modal="true">
          <div class="grip" aria-hidden="true"></div>
          <h2 class="title serif">{{ title }}</h2>
          <p v-if="message" class="message">{{ message }}</p>
          <p v-if="detail" class="detail">{{ detail }}</p>
          <div class="actions">
            <button class="btn btn-ghost" :disabled="busy" @click="emit('cancel')">
              {{ cancelText }}
            </button>
            <button class="btn btn-primary" :disabled="busy" @click="emit('confirm')">
              {{ busy ? '처리 중…' : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(45, 35, 42, 0.42);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}
.sheet {
  width: 100%;
  max-width: 480px;
  background: var(--surface);
  border-radius: 26px 26px 0 0;
  padding: 10px 22px calc(22px + env(safe-area-inset-bottom));
  text-align: center;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.14);
}
.grip {
  width: 38px;
  height: 4px;
  border-radius: 999px;
  background: var(--line);
  margin: 0 auto 16px;
}
.title {
  margin: 0 0 8px;
  font-size: 19px;
  font-weight: 700;
}
.message {
  margin: 0 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--accent-deep);
  line-height: 1.5;
}
.detail {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink-soft);
  line-height: 1.6;
}
.actions {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.22s ease;
}
.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}
</style>
