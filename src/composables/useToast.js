import { ref } from 'vue'

export const toasts = ref([])

let seq = 0

export function toast(message, tone = 'default') {
  const id = ++seq
  toasts.value.push({ id, message, tone })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 2600)
}
