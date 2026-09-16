<script setup>
import { RouterView } from 'vue-router'
import TabBar from './components/TabBar.vue'
import ToastHost from './components/ToastHost.vue'
</script>

<template>
  <div class="shell">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <TabBar />
    <ToastHost />
  </div>
</template>

<style scoped>
.shell {
  padding-bottom: calc(78px + env(safe-area-inset-bottom));
}
</style>
