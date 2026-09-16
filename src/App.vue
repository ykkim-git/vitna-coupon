<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import TabBar from './components/TabBar.vue'
import ToastHost from './components/ToastHost.vue'
import GateScreen from './components/GateScreen.vue'
import { isUnlocked } from './lib/gate'

// 한 번 열면 그 기기에서는 계속 열려 있다.
const opened = ref(isUnlocked())
</script>

<template>
  <div class="shell" :class="{ hidden: !opened }" :inert="!opened">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <TabBar />
    <ToastHost />
  </div>

  <Transition name="gate">
    <GateScreen v-if="!opened" @unlocked="opened = true" />
  </Transition>
</template>

<style scoped>
.shell {
  padding-bottom: calc(78px + env(safe-area-inset-bottom));
}
/* 잠겨 있는 동안에는 뒤 내용을 못 읽게 가린다. */
.shell.hidden {
  filter: blur(9px);
  pointer-events: none;
  user-select: none;
}

.gate-leave-active {
  transition: opacity 0.35s ease;
}
.gate-leave-to {
  opacity: 0;
}
</style>
