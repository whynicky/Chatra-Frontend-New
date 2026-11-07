<template>
  <div class="auth-shell">
    <LandingGlow class="auth-glow"/>
    <header class="auth-header">
      <NuxtLink to="/landing" class="auth-brand">
        <span class="auth-logo-mark" aria-hidden="true"/>
        Chatra
      </NuxtLink>

      <div class="lang-switcher" role="group" :aria-label="copy.language">
        <span class="lang-thumb" :style="{ transform: `translateX(${langIndex * 100}%)` }"/>
        <button v-for="item in langs" :key="item.code" type="button" class="lang-btn"
          :aria-label="item.name" :aria-pressed="lang === item.code" @click="setLang(item.code)">
          {{ item.label }}
        </button>
      </div>
    </header>

    <main class="auth-stage" :class="{ 'is-entry': showIntro }">
      <div v-if="showIntro" class="auth-intro">
        <p class="auth-intro-title">{{ copy.title }}</p>
        <p>{{ copy.description }}</p>
      </div>
      <div class="auth-form-area"><slot/></div>
    </main>
    <ToastContainer/>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#app'
import { useI18n } from '~/composables/useI18n'

const route = useRoute()
const { lang, setLang } = useI18n()
const langs = [
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'kk', label: 'KZ', name: 'Қазақша' },
] as const
const introCopy = {
  ru: { language: 'Язык интерфейса', title: 'Весь курс в\u00a0одном месте', description: 'Открывайте лекции, сдавайте задания и задавайте вопросы по материалам курса.' },
  en: { language: 'Interface language', title: 'Your whole course in one place', description: 'Open lectures, submit assignments and ask questions about your course materials.' },
  kk: { language: 'Интерфейс тілі', title: 'Бүкіл курс бір жерде', description: 'Дәрістерді ашыңыз, тапсырмаларды тапсырыңыз және курс материалдары бойынша сұрақ қойыңыз.' },
} as const
const copy = computed(() => introCopy[lang.value])
const langIndex = computed(() => langs.findIndex(item => item.code === lang.value))
const showIntro = computed(() => route.name === 'login' || route.name === 'register')

onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>

<style scoped>
.auth-shell {
  --glow-play-state: running;
  position: fixed;
  inset: 0;
  isolation: isolate;
  overflow: hidden auto;
  overscroll-behavior: contain;
  background: #f5f5f7;
}
.auth-glow { inset: 0 0 auto; height: min(100%, 880px); }
.auth-header, .auth-stage { width: min(1160px, calc(100% - 64px)); margin-inline: auto; }
.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 76px;
  padding-top: env(safe-area-inset-top, 0px);
}
.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  color: #f8fafb;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -.02em;
}
.auth-logo-mark {
  width: 27px;
  height: 29px;
  background: #00b1c9;
  mask: url('/logo-icon.png') center / contain no-repeat;
}
.lang-switcher {
  position: relative;
  display: flex;
  padding: 3px;
  border: 1px solid #ffffff35;
  border-radius: 999px;
  background: #ffffff0c;
}
.lang-thumb {
  position: absolute;
  inset: 3px auto 3px 3px;
  width: calc((100% - 6px) / 3);
  border-radius: 999px;
  background: #f8fafb;
  transition: transform .28s cubic-bezier(.22,1,.36,1);
}
.lang-btn {
  position: relative;
  width: 44px;
  min-height: 38px;
  border-radius: 999px;
  color: #e5edf0;
  font-size: 12px;
  font-weight: 600;
}
.lang-btn:hover { color: #fff; }
.lang-btn[aria-pressed="true"] { color: #13262d; }
.auth-stage {
  display: grid;
  align-items: center;
  min-height: calc(100dvh - 76px);
  padding: 48px 0 calc(64px + env(safe-area-inset-bottom, 0px));
}
.auth-stage.is-entry { grid-template-columns: minmax(0, 1fr) minmax(0, 448px); gap: 80px; }
.auth-form-area { width: min(100%, 448px); min-width: 0; justify-self: center; }
.auth-intro { align-self: start; max-width: 560px; padding-top: 64px; color: #f8fafb; }
.auth-intro-title { font-size: 60px; line-height: 1.05; font-weight: 600; letter-spacing: -.048em; text-wrap: balance; }
.auth-intro p + p { max-width: 390px; margin-top: 16px; color: #d9e4e8; font-size: 16px; line-height: 24px; text-wrap: pretty; }

@media (max-width: 980px) {
  .auth-stage.is-entry { grid-template-columns: minmax(0, 1fr) minmax(0, 400px); gap: 40px; }
  .auth-intro-title { font-size: 48px; }
}
@media (max-width: 720px) {
  .auth-header, .auth-stage { width: calc(100% - 32px); }
  .auth-header { min-height: 64px; }
  .auth-stage, .auth-stage.is-entry { grid-template-columns: minmax(0, 1fr); min-height: 0; padding-top: 32px; }
  .auth-intro { display: none; }
  .auth-glow { height: min(100%, 720px); }
}
@media (prefers-reduced-motion: no-preference) {
  .auth-intro, .auth-form-area { animation: auth-enter .6s cubic-bezier(.22,1,.36,1) both; }
  .auth-form-area { animation-delay: .07s; }
  .auth-form-area:focus-within { animation: none; }
}
@media (prefers-reduced-motion: reduce) {
  .lang-thumb { transition: none; }
}
@keyframes auth-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
</style>
