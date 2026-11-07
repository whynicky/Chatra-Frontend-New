<template>
  <div class="auth-card">
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

    <h1 class="auth-title">{{ t('login.welcome') }}</h1>
    <p class="auth-sub">{{ t('login.sub') }}</p>
    <form @submit.prevent="sub" class="auth-form">
      <div class="frow">
        <label class="flabel" for="login-email">Email</label>
        <input id="login-email" v-model="email" type="email" class="input" :class="{'input-err':errorMsg}" placeholder="you@example.com" required autocomplete="email" :aria-invalid="!!errorMsg" :aria-describedby="errorMsg ? 'login-error' : undefined" @input="errorMsg=''"/>
      </div>
      <div class="frow">
        <label class="flabel" for="login-password">{{ t('login.password') }}</label>
        <div class="password-field">
          <input id="login-password" v-model="pw" :type="show?'text':'password'" class="input" :class="{'input-err':errorMsg}" placeholder="••••••••" required autocomplete="current-password" :aria-invalid="!!errorMsg" :aria-describedby="errorMsg ? 'login-error' : undefined" @input="errorMsg=''"/>
          <button type="button" @click="show=!show" class="pw-eye" :aria-label="passwordToggleLabel" :title="passwordToggleLabel" :aria-pressed="show">
            <svg v-if="!show" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>
      <div v-if="errorMsg" id="login-error" class="login-error" role="alert">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorMsg }}
      </div>
      <div class="forgot-row">
        <NuxtLink to="/forgot-password" class="forgot-link">{{ t('login.forgot') }}</NuxtLink>
      </div>
      <button type="submit" class="auth-submit" :aria-busy="loading" :disabled="loading">
        <span v-if="loading" class="spinner" aria-hidden="true"/>
        <span>{{ t('login.submit') }}</span>
      </button>
    </form>
    <p class="auth-link-row">{{ t('login.no_account') }} <NuxtLink to="/register" class="auth-link">{{ t('login.register') }}</NuxtLink></p>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
import { useOrgStore } from '~/stores/org.store'
definePageMeta({ layout: 'auth' })
const { login } = useAuth()
const { t, lang } = useI18n()
const org = useOrgStore()
const email = ref(''); const pw = ref(''); const show = ref(false); const loading = ref(false); const errorMsg = ref('')
const passwordToggleLabel = computed(() => show.value
  ? (lang.value === 'ru' ? 'Скрыть пароль' : lang.value === 'kk' ? 'Құпиясөзді жасыру' : 'Hide password')
  : (lang.value === 'ru' ? 'Показать пароль' : lang.value === 'kk' ? 'Құпиясөзді көрсету' : 'Show password'))
const switchOrg = () => { org.clear(); if (import.meta.client) window.location.href = '/org' }
const sub = async () => {
  errorMsg.value = ''
  loading.value = true
  const r = await login(email.value, pw.value)
  loading.value = false
  if (r.ok) { await navigateTo('/'); return }
  // Не подтверждён email — ведём на ввод кода (там сразу вышлем свежий).
  if (r.reason === 'email_not_verified') {
    // send=1 — на этом пути код ещё не высылался, verify-экран вышлет свежий.
    await navigateTo(`/verify-email?email=${encodeURIComponent(email.value.trim())}&send=1`)
    return
  }
  errorMsg.value = r.reason === 'blocked' ? t('login.error_blocked')
    : r.reason === 'rate_limited' ? t('login.error_rate')
    : t('login.error')
}
</script>
<style scoped src="../assets/css/auth-entry.css"></style>
<style scoped>
.login-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: #fff1f1;
  color: #9d3030;
  font-size: 14px;
  line-height: 20px;
}
.login-error svg { flex: none; margin-top: 3px; }
.forgot-row { display: flex; justify-content: flex-end; margin-top: -8px; }
.forgot-link { display: inline-flex; align-items: center; min-height: 32px; font-size: 14px; }
</style>
