<div align="center">

# Chatra

**Web frontend**

Веб-интерфейс образовательной платформы Chatra.

<p>
  <img alt="Nuxt 3" src="https://img.shields.io/badge/Nuxt-3-00DC82?style=flat-square">
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square">
  <img alt="Pinia" src="https://img.shields.io/badge/Pinia-F7D336?style=flat-square">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square">
</p>

<p><a href="#быстрый-старт">Быстрый старт</a> · <a href="#команды">Команды</a> · <a href="#конфигурация">Конфигурация</a></p>

</div>

---

## Быстрый старт

### 1. Настройте окружение

Создайте файл `.env` в корне фронтенда:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Запустите приложение

```bash
npm run dev
```

Откройте [localhost:3000](http://localhost:3000). Бэкенд должен быть запущен отдельно.

---

## Команды

| Команда | Назначение |
| :--- | :--- |
| `npm run dev` | Сервер разработки |
| `npm run build` | Сборка для продакшена |
| `npm run preview` | Предпросмотр сборки |
| `npm run typecheck` | Проверка типов |
| `npm run lint` | Проверка стиля кода |
| `npm test` | Модульные и компонентные тесты |
| `npm run test:e2e` | Сквозные тесты Playwright |

---

## Конфигурация

| Переменная | Назначение | Значение для разработки |
| :--- | :--- | :--- |
| `NUXT_PUBLIC_API_BASE` | Базовый URL API | `http://localhost:8000/api` |

Для продакшена укажите HTTPS-адрес вашего API с суффиксом `/api`.

Основные настройки приложения находятся в [`nuxt.config.ts`](nuxt.config.ts),
команды и зависимости — в [`package.json`](package.json).

---

<div align="center">
  <sub>© 2026 Chatra. All rights reserved.</sub>
</div>
