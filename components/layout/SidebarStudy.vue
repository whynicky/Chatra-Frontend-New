<template>
  <section class="study-section" :class="{ 'study-compact': collapsed }" aria-labelledby="sidebar-pinned-heading">
    <h2 id="sidebar-pinned-heading" class="study-heading">{{ t('sidebar.pinned_subjects') }}</h2>
    <NuxtLink v-for="subject in pinnedSubjects" :key="subject.id" :to="`/classes/${subject.id}`"
              class="study-link study-subject" :class="{ 'study-current': activeClassId === subject.id }" :title="subject.name">
      <span v-if="subject.glowColor || subject.glowImage" class="study-subject-glow"
            :style="{ '--study-cover-color': subject.glowColor }" aria-hidden="true">
        <img v-if="subject.glowImage" :src="subject.glowImage" alt="" loading="lazy" decoding="async" />
      </span>
      <span class="study-mark study-initial" aria-hidden="true">{{ Array.from(subject.name.trim())[0]?.toLocaleUpperCase(lang) }}</span>
      <span class="study-name study-copy">{{ subject.name }}</span>
    </NuxtLink>
    <NuxtLink v-if="!pinnedSubjects.length && (classesStore.loaded || !classesStore.pinnedIds.length)"
              to="/" class="study-link study-secondary" :title="t('sidebar.pins_empty')">
      <span class="study-mark" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 4h10v16l-5-3.5L7 20z"/></svg>
      </span>
      <span class="study-name study-copy">{{ t('sidebar.pins_empty') }}</span>
    </NuxtLink>
  </section>

  <section v-if="isStudent" class="study-section" :class="{ 'study-compact': collapsed }" aria-labelledby="sidebar-deadline-heading">
    <h2 id="sidebar-deadline-heading" class="study-heading">{{ t('sidebar.next_deadline') }}</h2>
    <NuxtLink v-if="nextDeadline" :to="`/classes/${nextDeadline.classId}/assignments/${nextDeadline.id}`"
              class="study-link study-deadline"
              :title="collapsed ? `${nextDeadline.title} · ${deadlineLabel}` : nextDeadline.title">
      <span class="study-mark" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
      </span>
      <span class="study-copy">
        <time :datetime="nextDeadline.date.toISOString()" class="study-time">{{ deadlineLabel }}</time>
        <span class="study-name">{{ nextDeadline.title }}</span>
        <span class="study-name study-meta">{{ nextDeadline.className }}</span>
      </span>
    </NuxtLink>
    <div v-else class="study-status">
      <p v-if="status === 'error' || (catalogError && !classesStore.loaded)" class="study-meta">{{ t('sidebar.deadlines_error') }}</p>
      <p v-else-if="status === 'ready'" class="study-meta">{{ t('sidebar.no_deadlines') }}</p>
      <span v-else-if="status === 'loading'" class="study-skeleton" aria-hidden="true"></span>
    </div>
    <NuxtLink to="/calendar" class="study-link study-secondary" :class="{ 'study-calendar-extra': nextDeadline }"
              :inert="collapsed && !!nextDeadline" :title="t('sidebar.open_calendar')">
      <span class="study-mark" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></svg>
      </span>
      <span class="study-name study-copy">{{ t('sidebar.open_calendar') }}</span>
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from '#app'
import { useCoverArt } from '~/composables/useCoverArt'
import { parseUtc, useDeadlineSubmissionRevision } from '~/composables/useDeadline'
import { fixFileUrl } from '~/composables/useFileUrl'
import { useI18n } from '~/composables/useI18n'
import { useAssignmentsSvc } from '~/services/assignments'
import { useAuthStore } from '~/stores/auth.store'
import { useClassesStore } from '~/stores/classes.store'

defineProps<{ collapsed: boolean }>()

const auth = useAuthStore()
const classesStore = useClassesStore()
const assignments = useAssignmentsSvc()
const submissionRevision = useDeadlineSubmissionRevision()
const route = useRoute()
const { t, lang } = useI18n()
const coverArt = useCoverArt()

const activeClassId = computed(() => Number(route.params.classId ?? route.params.id))
const isStudent = computed(() => auth.user?.role === 'student')
const subjects = computed(() => classesStore.list.filter(subject => !subject.is_archived_for_user))
const subjectIds = computed(() => subjects.value.map(subject => subject.id).sort((a, b) => a - b).join(','))
const pinnedSubjects = computed(() => {
  const byId = new Map(subjects.value.map(subject => [subject.id, subject]))
  return classesStore.pinnedIds.flatMap(id => {
    const subject = byId.get(id)
    if (!subject) return []
    const glowColor = subject.cover_color ? coverArt.colorBase(subject.cover_color) : undefined
    return [{
      id: subject.id,
      name: subject.name,
      glowColor,
      // Covers uploaded before the palette was introduced have no saved color.
      glowImage: glowColor ? '' : fixFileUrl(subject.cover_thumbnail || subject.cover_image),
    }]
  })
})

const catalogError = ref(false)
// The catalog page loads the shared class list itself. Deep links need it too.
watch(() => route.path === '/', async (onCatalog) => {
  if (onCatalog || classesStore.loaded) return
  catalogError.value = false
  try { await classesStore.ensure() }
  catch { catalogError.value = !classesStore.loaded }
}, { immediate: true })

const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const deadlines = ref<{ id: number; classId: number; title: string; date: Date }[]>([])
const now = ref(Date.now())
const refresh = ref(0)
let lastLoadedAt = 0

watch([isStudent, () => classesStore.loaded, subjectIds, submissionRevision, refresh],
  async ([student, loaded, ids], _, onCleanup) => {
    deadlines.value = []
    status.value = 'idle'
    if (!student || !loaded) return
    if (!ids) {
      status.value = 'ready'
      return
    }

    let current = true
    onCleanup(() => { current = false })
    status.value = 'loading'
    try {
      const [items, submissions] = await Promise.all([assignments.list(), assignments.mySubmissions()])
      if (!current) return
      const submittedIds = new Set(submissions.map(submission => String(submission.assignment_id)))
      const activeIds = new Set(subjects.value.map(subject => subject.id))
      const fetchedAt = Date.now()
      deadlines.value = items.flatMap(item => {
        const date = parseUtc(item.deadline)
        if (!item.is_active || !activeIds.has(item.class_id) || submittedIds.has(String(item.id)) || !(date.getTime() > fetchedAt)) return []
        return [{ id: item.id, classId: item.class_id, title: item.title, date }]
      }).sort((a, b) => a.date.getTime() - b.date.getTime())
      now.value = fetchedAt
      lastLoadedAt = fetchedAt
      status.value = 'ready'
    } catch {
      if (current) status.value = 'error'
    }
  }, { immediate: true },
)

const nextDeadline = computed(() => {
  const next = deadlines.value.find(item => item.date.getTime() > now.value)
  if (!next) return null
  return { ...next, className: subjects.value.find(subject => subject.id === next.classId)?.name }
})

const deadlineLabel = computed(() => {
  const date = nextDeadline.value?.date
  if (!date) return ''
  const time = date.toLocaleTimeString(lang.value, { hour: '2-digit', minute: '2-digit' })
  if (date.toDateString() === new Date(now.value).toDateString()) {
    const today = t('general.today').toLocaleLowerCase(lang.value)
    return `${today.charAt(0).toLocaleUpperCase(lang.value)}${today.slice(1)}, ${time}`
  }
  return `${date.toLocaleDateString(lang.value, { day: 'numeric', month: 'short' })}, ${time}`
})

const refreshOnFocus = () => {
  now.value = Date.now()
  if (status.value !== 'loading' && now.value - lastLoadedAt >= 60_000) refresh.value++
}
let clock: ReturnType<typeof setInterval>
onMounted(() => {
  clock = setInterval(() => { now.value = Date.now() }, 30_000)
  window.addEventListener('focus', refreshOnFocus)
})
onUnmounted(() => {
  clearInterval(clock)
  window.removeEventListener('focus', refreshOnFocus)
})
</script>

<style scoped>
.study-section{margin:8px 0 0;padding:8px 0 0;border-top:1px solid var(--border)}
.study-heading{height:20px;margin:0 10px;overflow:hidden;white-space:nowrap;color:var(--text2);font-size:12px;font-weight:600;line-height:16px;transition:height var(--sb-resize),opacity var(--sb-fade)}
.study-link{display:flex;align-items:center;gap:8px;height:36px;padding:6px 10px;overflow:hidden;border-radius:8px;color:var(--text2);font-size:14px;line-height:20px;text-decoration:none}
.study-link:hover,.study-current{background:var(--surface2);color:var(--text1)}
.study-link:focus-visible{outline:2px solid var(--teal);outline-offset:-2px}
.study-subject{position:relative;isolation:isolate;color:var(--text1)}
.study-subject + .study-subject{margin-top:4px}
.study-subject-glow{position:absolute;inset:0;z-index:-1;pointer-events:none;background:var(--study-cover-color,transparent);mask-image:radial-gradient(ellipse 176px 60px at 24px 50%,#000 12%,transparent);opacity:.34;transition:opacity var(--sb-fade)}
.study-subject:is(:hover,:focus-visible,.study-current) .study-subject-glow{opacity:.46}
.study-subject-glow img{width:100%;height:100%;object-fit:cover;transform:scale(1.5);filter:blur(12px) saturate(1.15)}
html.dark .study-subject-glow img{filter:blur(12px) saturate(1.15) brightness(.7)}
.study-mark{display:grid;place-items:center;width:24px;height:24px;flex:none}
.study-initial{border-radius:6px;background:var(--surface2);color:var(--text2);font-size:12px;font-weight:600}
.study-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.study-secondary{color:var(--text3);font-size:12px;line-height:16px}
.study-deadline{align-items:flex-start;height:64px;transition:height var(--sb-resize)}
.study-deadline .study-mark{color:var(--text3)}
.study-copy{flex:1;min-width:0;transition:opacity var(--sb-fade)}
.study-time,.study-meta{display:block;font-size:12px;line-height:16px;color:var(--text3)}
.study-time{font-weight:600;white-space:nowrap}
.study-status{height:24px;padding:4px 10px;overflow:hidden;white-space:nowrap;transition:height var(--sb-resize),padding var(--sb-resize),opacity var(--sb-fade)}
.study-status:empty{height:0;padding-block:0}
.study-skeleton{display:block;width:64%;height:16px;border-radius:4px;background:var(--surface2)}
.study-calendar-extra{transition:height var(--sb-resize),padding var(--sb-resize),opacity var(--sb-fade)}
.study-compact .study-deadline{height:36px}
.study-compact :is(.study-heading,.study-status,.study-calendar-extra){height:0;padding-block:0;opacity:0}
.study-compact .study-copy{opacity:0}
</style>
