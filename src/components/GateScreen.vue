<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { isSupported, tryUnlock } from '../lib/gate'

const emit = defineEmits(['unlocked'])

const password = ref('')
const error = ref('')
const busy = ref(false)
const shake = ref(false)
const input = ref(null)

onMounted(async () => {
  await nextTick()
  input.value?.focus()
})

async function submit() {
  if (!password.value || busy.value) return

  if (!isSupported) {
    error.value = '이 브라우저에서는 열 수 없어요. 다른 브라우저로 열어주세요.'
    return
  }

  busy.value = true
  const ok = await tryUnlock(password.value)
  busy.value = false

  if (ok) {
    emit('unlocked')
    return
  }

  error.value = '비밀번호가 맞지 않아요.'
  password.value = ''
  shake.value = true
  setTimeout(() => (shake.value = false), 450)
  input.value?.focus()
}
</script>

<template>
  <div class="gate">
    <div class="card" :class="{ shake }">
      <div class="seal">🎁</div>
      <h1 class="serif">빛나의 쿠폰북</h1>
      <p class="sub">힌트: 우리 결혼기념일</p>

      <form @submit.prevent="submit">
        <input
          ref="input"
          v-model="password"
          type="password"
          inputmode="numeric"
          class="input"
          :class="{ bad: error }"
          placeholder="• • • • • •"
          autocomplete="off"
          @input="error = ''"
        />
        <p class="error" :class="{ show: error }">{{ error || ' ' }}</p>

        <button type="submit" class="btn btn-primary open" :disabled="!password || busy">
          {{ busy ? '여는 중…' : '열기' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.gate {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(59, 48, 56, 0.34);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.card {
  width: 100%;
  max-width: 340px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 26px;
  padding: 34px 26px 28px;
  text-align: center;
  box-shadow: 0 18px 50px rgba(120, 70, 90, 0.28);
}
.seal {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 14px;
  animation: bob 2.6s ease-in-out infinite;
}
@keyframes bob {
  50% {
    transform: translateY(-5px) rotate(-5deg);
  }
}
h1 {
  margin: 0 0 6px;
  font-size: 23px;
  letter-spacing: -0.3px;
}
.sub {
  margin: 0 0 20px;
  font-size: 12.5px;
  color: var(--ink-soft);
}
.input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #fbf7f9;
  font-size: 16px;
  font-family: inherit;
  color: var(--ink);
  text-align: center;
  letter-spacing: 4px;
}
.input:focus {
  outline: none;
  border-color: var(--accent);
  background: #fff;
}
.input.bad {
  border-color: #c96a6a;
}
.error {
  margin: 8px 0 0;
  min-height: 17px;
  font-size: 12px;
  font-weight: 600;
  color: #9b4a4a;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.error.show {
  opacity: 1;
}
.open {
  width: 100%;
  margin-top: 10px;
}

.shake {
  animation: shake 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
@keyframes shake {
  10%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  80% {
    transform: translateX(4px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-7px);
  }
  40%,
  60% {
    transform: translateX(7px);
  }
}
</style>
