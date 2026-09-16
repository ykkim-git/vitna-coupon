import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 해시 라우터를 쓰기 때문에 base를 './'로 두면
// GitHub Pages(프로젝트 페이지), Netlify, Vercel 어디에 올려도 그대로 동작한다.
export default defineConfig({
  base: './',
  plugins: [vue()],
})
