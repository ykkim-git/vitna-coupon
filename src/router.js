import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import HistoryView from './views/HistoryView.vue'
import QrView from './views/QrView.vue'

// 해시 라우터: 정적 호스팅(GitHub Pages 등)에서 새로고침해도 404가 안 난다.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/history', name: 'history', component: HistoryView },
    { path: '/qr', name: 'qr', component: QrView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
