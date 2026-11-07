<template>
  <div class="auth-card">
    <h1 class="auth-title">{{ t('register.title') }}</h1>
    <p class="auth-sub">{{ description }}</p>

    <div class="org-badge-row">
      <button :class="['org-pill', { school: org.isSchool }]" :title="lang === 'ru' ? 'Сменить организацию' : lang === 'kk' ? 'Ұйымды ауыстыру' : 'Change organization'" type="button" @click="switchOrg">
        <span class="org-pill-icon">
          <svg v-if="org.isSchool" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
          <span v-else class="uni-glyph-sm"></span>
        </span>
        <span class="org-pill-label">{{ org.isSchool ? (lang==='ru'?'Школа':lang==='kk'?'Мектеп':'School') : (lang==='ru'?'Университет':lang==='kk'?'Университет':'University') }}</span>
        <svg class="org-pill-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
      </button>
    </div>

    <form @submit.prevent="sub" class="auth-form">
      <div class="frow">
        <label class="flabel" for="register-fullname">{{ t('register.fullname') }} <span aria-hidden="true" style="color:var(--red)">*</span></label>
        <input id="register-fullname" v-model="fullname" class="input" :placeholder="t('register.fullname_placeholder')" maxlength="80" autocomplete="name" required/>
        <div v-if="fullname && fullname.trim().split(' ').filter(Boolean).length < 2" class="nick-hint err">{{ t('register.fullname_err') }}</div>
      </div>

      <div class="frow">
        <label class="flabel" for="register-email">Email</label>
        <input id="register-email" v-model="email" type="email" class="input" placeholder="you@example.com" autocomplete="email" required @input="onEmailInput" @blur="emailTouched=true"/>
        <div v-if="emailTouched && email" :class="['nick-hint', emailOk?'ok':'err']">
          <span v-if="!emailOk">{{ t('register.email_invalid') }}</span>
          <span v-else>{{ t('register.email_ok') }}</span>
        </div>
        <div v-if="emailTouched && !email" class="nick-hint err">{{ t('register.email_required') }}</div>
      </div>

      <div class="frow">
        <label class="flabel" for="register-password">{{ t('login.password') }}</label>
        <div class="password-field">
          <input id="register-password" v-model="pw" :type="show?'text':'password'" class="input" :placeholder="t('auth.pw_min8')" required minlength="8" autocomplete="new-password"/>
          <button type="button" @click="show=!show" class="pw-eye" :aria-label="passwordToggleLabel" :title="passwordToggleLabel" :aria-pressed="show">
            <svg v-if="!show" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
        <div v-if="pw" class="str-row">
          <div class="str-bar"><div :style="{width:score+'%',background:scoreColor}" class="str-fill"></div></div>
          <span class="str-lbl">{{scoreLabel}}</span>
        </div>
      </div>

      <button type="submit" class="auth-submit" :aria-busy="loading" :disabled="loading||!canSubmit">
        <span v-if="loading" class="spinner" aria-hidden="true"/>
        <span>{{ t('register.submit') }}</span>
      </button>
    </form>
    <p class="auth-legal"><NuxtLink to="/rules" class="reg-foot-link">{{ t('common.rules') }}</NuxtLink> · <NuxtLink to="/privacy" class="reg-foot-link">{{ t('common.privacy') }}</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useOrgStore } from '~/stores/org.store'
definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const toast = useToast()
const { t, lang } = useI18n()
const org = useOrgStore()
const description = computed(() => ({
  ru: 'Отправим код подтверждения на вашу почту.',
  en: 'We’ll email you a confirmation code.',
  kk: 'Электрондық поштаңызға растау кодын жібереміз.',
})[lang.value])

const switchOrg = () => { org.clear(); if (import.meta.client) window.location.href = '/org' }

const nick = ref(''); const fullname = ref(''); const email = ref(''); const pw = ref(''); const show = ref(false)
const role = ref('student'); const loading = ref(false)
const emailTouched = ref(false)
const passwordToggleLabel = computed(() => show.value
  ? (lang.value === 'ru' ? 'Скрыть пароль' : lang.value === 'kk' ? 'Құпиясөзді жасыру' : 'Hide password')
  : (lang.value === 'ru' ? 'Показать пароль' : lang.value === 'kk' ? 'Құпиясөзді көрсету' : 'Show password'))

// Любой корректный email — подтверждение всё равно идёт кодом на почту.
const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const onEmailInput = () => { emailTouched.value = true }
const fullnameOk = computed(() => fullname.value.trim().split(' ').filter(Boolean).length >= 2)
const canSubmit = computed(() => fullnameOk.value && emailOk.value && pw.value.length >= 8)

const pwScore = computed(() => {
  const p = pw.value; if (!p) return 0; let s = 0
  if (p.length>=6) s+=20; if (p.length>=10) s+=20
  if (/[A-Z]/.test(p)) s+=20; if (/[0-9]/.test(p)) s+=20; if (/[^A-Za-z0-9]/.test(p)) s+=20
  return s
})
const score = computed(() => pwScore.value)
const scoreColor = computed(() => score.value<=40?'var(--red)':score.value<=60?'var(--yellow)':'var(--green)')
const scoreLabel = computed(() => score.value<=40?t('register.pw_weak'):score.value<=60?t('register.pw_medium'):t('register.pw_strong'))

const sub = async () => {
  if (!canSubmit.value) return
  loading.value = true
  const r = await register(email.value, pw.value, role.value, fullname.value.trim())
  loading.value = false
  if (r.ok) {
    localStorage.setItem('_pending_fullname', fullname.value.trim())
    // Бэкенд уже выслал код — ведём на его ввод, после подтверждения авто-вход.
    await navigateTo(`/verify-email?email=${encodeURIComponent(email.value.trim())}`)
  } else {
    toast.err(r.taken ? t('register.taken') : t('register.error'))
  }
}
</script>

<style scoped src="../assets/css/auth-entry.css"></style>
<style scoped>
.nick-hint { font-size: 12px; line-height: 16px; }
.nick-hint.ok { color: #187146; }
.nick-hint.err { color: #9d3030; }
.str-row { display: flex; align-items: center; gap: 8px; }
.str-bar { width: 96px; height: 4px; overflow: hidden; border-radius: 999px; background: #dce8ea; }
.str-fill { height: 100%; border-radius: inherit; }
.str-lbl { color: #51636d; font-size: 12px; }
.auth-legal { margin-top: 16px; color: #51636d; font-size: 12px; line-height: 20px; text-align: center; }
</style>
