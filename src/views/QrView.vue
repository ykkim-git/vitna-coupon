<script setup>
import { onMounted, ref, watch } from "vue";
import QRCode from "qrcode";
import { toast } from "../composables/useToast";

// 해시(#/qr)를 뺀 사이트 기본 주소. 이걸 QR로 만든다.
const siteUrl = ref(window.location.href.split("#")[0]);
const dataUrl = ref("");

async function render() {
  try {
    dataUrl.value = await QRCode.toDataURL(siteUrl.value, {
      width: 640,
      margin: 2,
      color: { dark: "#3b3038", light: "#ffffff" },
      errorCorrectionLevel: "M",
    });
  } catch {
    toast("QR 코드를 만들지 못했어요.", "error");
  }
}

onMounted(render);
watch(siteUrl, render);

async function copy() {
  try {
    await navigator.clipboard.writeText(siteUrl.value);
    toast("주소를 복사했어요.");
  } catch {
    toast("복사에 실패했어요. 주소를 길게 눌러 복사해주세요.", "error");
  }
}

function download() {
  const a = document.createElement("a");
  a.href = dataUrl.value;
  a.download = "coupon-book-qr.png";
  a.click();
}
</script>

<template>
  <main class="page">
    <header class="head">
      <h1 class="serif">쿠폰북 QR</h1>
    </header>

    <div class="qr-card">
      <img v-if="dataUrl" :src="dataUrl" alt="쿠폰북 QR 코드" class="qr" />
      <div v-else class="qr skeleton"></div>
      <p class="url">{{ siteUrl }}</p>
    </div>

    <div class="actions">
      <button class="btn btn-ghost" @click="copy">주소 복사</button>
      <button class="btn btn-primary" :disabled="!dataUrl" @click="download">
        QR 이미지 저장
      </button>
    </div>
  </main>
</template>

<style scoped>
.page {
  padding: 0 18px 20px;
}
.head {
  padding: 34px 4px 22px;
  text-align: center;
}
.head h1 {
  margin: 0 0 6px;
  font-size: 25px;
}
.sub {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--ink-soft);
}
.qr-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 22px;
  text-align: center;
}
.qr {
  width: 100%;
  max-width: 250px;
  aspect-ratio: 1;
  display: block;
  margin: 0 auto;
  border-radius: 12px;
}
.skeleton {
  background: #f5eef1;
}
.url {
  margin: 16px 0 0;
  font-size: 11.5px;
  color: var(--ink-soft);
  word-break: break-all;
  user-select: all;
}
.actions {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 10px;
}
.tip {
  margin-top: 22px;
  font-size: 12.5px;
  color: var(--ink-soft);
}
.tip summary {
  cursor: pointer;
  font-weight: 600;
  padding: 6px 0;
}
.input {
  width: 100%;
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  font-size: 13px;
  font-family: inherit;
  background: var(--surface);
  color: var(--ink);
}
.tip-text {
  margin: 8px 0 0;
  font-size: 11.5px;
  line-height: 1.6;
}
</style>
