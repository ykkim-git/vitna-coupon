<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'cancel'])

const password = ref('')
const error = ref('')
const input = ref(null)

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    password.value = ''
    error.value = ''
    await nextTick()
    input.value?.focus()
  },
)

function submit() {
  if (!password.value) return
  emit('submit', password.value)
}

/** 비밀번호가 틀렸을 때 부모가 호출한다. */
function reject(message = '비밀번호가 맞지 않아요.') {
  error.value = message
  password.value = ''
  input.value?.focus()
}

defineExpose({ reject })
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="backdrop" @click.self="emit('cancel')">
        <div class="sheet" role="dialog" aria-modal="true">
          <div class="grip" aria-hidden="true"></div>
          <h2 class="title serif">관리자 모드</h2>
          <p class="detail">비밀번호를 입력하면 사용한 쿠폰을 되돌릴 수 있어요.</p>

          <form @submit.prevent="submit">
            <input
              ref="input"
              v-model="password"
              type="password"
              class="input"
              :class="{ bad: error }"
              placeholder="비밀번호"
              autocomplete="current-password"
              @input="error = ''"
            />
            <p v-if="error" class="error">{{ error }}</p>

            <div class="actions">
              <button type="button" class="btn btn-ghost" @click="emit('cancel')">닫기</button>
              <button type="submit" class="btn btn-primary" :disabled="!password">확인</button>
            </div>
          </form>
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
.detail {
  margin: 0 0 16px;
  font-size: 12.5px;
  color: var(--ink-soft);
  line-height: 1.6;
}
.input {
  width: 100%;
  padding: 13px 15px;
  border-radius: 13px;
  border: 1px solid var(--line);
  background: #fbf7f9;
  font-size: 15px;
  font-family: inherit;
  color: var(--ink);
  text-align: center;
  letter-spacing: 2px;
}
.input:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--surface);
}
.input.bad {
  border-color: #c96a6a;
}
.error {
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #9b4a4a;
}
.actions {
  margin-top: 18px;
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
