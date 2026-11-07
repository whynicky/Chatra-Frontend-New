import { defineStore } from 'pinia'
import { useClassesSvc, type ClassResponse } from '~/services/classes'
import { usePostsSvc } from '~/services/posts'
import { sameFilePath } from '~/composables/useFileUrl'

// Не чаще раза в минуту — молчаливое обновление в фоне, а не при каждом
// заходе на страницу.
const STALE_MS = 60_000

const pinnedKey = (userId: number) => `_pinned_subjects_${userId}`

function readLegacyPins(userId: number) {
  try {
    const raw = localStorage.getItem(pinnedKey(userId))
    if (raw == null) return null
    const saved = JSON.parse(raw)
    const ids = Array.isArray(saved)
      ? [...new Set<number>(saved.filter(id => Number.isInteger(id) && id > 0 && id <= 2_147_483_647))]
      : []
    return { raw, ids }
  } catch {
    return null
  }
}

export const useClassesStore = defineStore('classes', {
  state: () => ({
    list: [] as ClassResponse[],
    posts: [] as any[],
    loaded: false,
    lastFetch: 0,
    pinnedUserId: null as number | null,
    pinnedIds: [] as number[],
    pinsLoaded: false,
    pinsBusy: false,
    pinsSession: 0,
  }),

  getters: {
    byId: (s) => (id: number) => s.list.find(c => c.id === id) || null,
  },

  actions: {
    async loadPins(userId: number | null) {
      if (this.pinnedUserId !== userId) {
        this.pinnedUserId = userId
        this.pinnedIds = userId == null ? [] : readLegacyPins(userId)?.ids ?? []
        this.pinsLoaded = false
        this.pinsBusy = false
        this.pinsSession++
      }
      if (userId == null || this.pinsBusy) return

      const session = this.pinsSession
      const svc = useClassesSvc()
      const legacy = readLegacyPins(userId)
      this.pinsBusy = true
      try {
        if (legacy) {
          for (let offset = 0; offset < legacy.ids.length; offset += 500) {
            if (session !== this.pinsSession) return
            await svc.importPins(legacy.ids.slice(offset, offset + 500))
          }
        }
        if (session !== this.pinsSession) return
        const ids = await svc.listPins()
        if (session !== this.pinsSession) return
        this.pinnedIds = ids
        this.pinsLoaded = true
        if (legacy) {
          try {
            if (localStorage.getItem(pinnedKey(userId)) === legacy.raw) localStorage.removeItem(pinnedKey(userId))
          } catch { /* Import is idempotent if storage cannot be cleared. */ }
        }
      } finally {
        if (session === this.pinsSession) this.pinsBusy = false
      }
    },

    async togglePin(userId: number, classId: number) {
      if (this.pinnedUserId !== userId || !this.pinsLoaded || this.pinsBusy) return

      const session = this.pinsSession
      const pinned = !this.pinnedIds.includes(classId)
      this.pinsBusy = true
      try {
        await useClassesSvc().setPin(classId, pinned)
        if (session !== this.pinsSession) return
        this.pinnedIds = pinned ? [...this.pinnedIds, classId] : this.pinnedIds.filter(id => id !== classId)
      } finally {
        if (session === this.pinsSession) this.pinsBusy = false
      }
    },

    // Список классов живёт в сторе, а не в локальном state страницы — Nuxt
    // полностью пересоздаёт компонент страницы при каждой навигации, и без
    // общего кэша каталог (со всеми обложками) гонял бы GET /classes/ и
    // перерисовывал сетку с нуля при каждом возврате на главную (отсюда
    // и повторные скачивания обложек, и мигание). Если данные уже есть и
    // не устарели — отдаём их сразу, без сети и без сброса списка.
    async ensure(force = false) {
      const stale = Date.now() - this.lastFetch > STALE_MS
      if (this.loaded && !force && !stale) return
      const classesSvc = useClassesSvc()
      const postsSvc = usePostsSvc()
      const [classes, posts] = await Promise.all([classesSvc.list(), postsSvc.list()])
      // Подписи (exp/sig) в cover_image/cover_thumbnail пересчитываются бэкендом
      // при каждом запросе, даже если сам файл не менялся — если подставлять их
      // как есть, каждое фоновое обновление каталога заставляло бы браузер
      // перекачивать те же обложки заново. Оставляем прежний URL, пока путь
      // файла совпадает.
      this.list = classes.map(c => {
        const prev = this.list.find(p => p.id === c.id)
        if (!prev) return c
        return {
          ...c,
          cover_image: sameFilePath(prev.cover_image, c.cover_image) ? prev.cover_image : c.cover_image,
          cover_thumbnail: sameFilePath(prev.cover_thumbnail, c.cover_thumbnail) ? prev.cover_thumbnail : c.cover_thumbnail,
        }
      })
      this.posts = posts
      this.loaded = true
      this.lastFetch = Date.now()
    },

    upsert(cls: ClassResponse) {
      const idx = this.list.findIndex(c => c.id === cls.id)
      if (idx !== -1) {
        const prev = this.list[idx]
        this.list[idx] = {
          ...prev,
          ...cls,
          cover_image: sameFilePath(prev.cover_image, cls.cover_image) ? prev.cover_image : cls.cover_image,
          cover_thumbnail: sameFilePath(prev.cover_thumbnail, cls.cover_thumbnail) ? prev.cover_thumbnail : cls.cover_thumbnail,
        }
      } else {
        this.list.push(cls)
      }
    },

    remove(id: number) {
      this.list = this.list.filter(c => c.id !== id)
    },
  },
})
