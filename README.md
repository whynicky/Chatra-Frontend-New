<div align="center">

<img src="public/favicon-icon.png" alt="Логотип Chatra" width="76">

# Chatra

**Учиться. Создавать. Развиваться.**

Образовательная платформа для студентов и преподавателей.<br>
Предметы, материалы, задания и ИИ-помощник — в одном пространстве.

<p>
  <img alt="Nuxt 3" src="https://img.shields.io/badge/Nuxt_3-092C34?style=flat-square&amp;logo=nuxt&amp;logoColor=00DC82">
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue_3-092C34?style=flat-square&amp;logo=vuedotjs&amp;logoColor=4FC08D">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-092C34?style=flat-square&amp;logo=typescript&amp;logoColor=70E5ED">
  <img alt="Pinia" src="https://img.shields.io/badge/Pinia-092C34?style=flat-square&amp;logo=pinia&amp;logoColor=FFD859">
</p>

[Интерфейс](#интерфейс) · [Возможности](#возможности) · [Быстрый старт](#быстрый-старт) · [Команды](#команды)

</div>

![Chatra — место, где учёба яснее](docs/images/cover.svg)

## Интерфейс

**01 / Первое знакомство**<br>
Спокойная типографика, бирюзовые акценты и фокус на учебном процессе.

![Главная страница Chatra на компьютере](docs/images/landing-desktop.png)

**02 / Внутри предмета**<br>
Материалы курса собраны вместе: лекции, документы и презентации.

![Превью материалов предмета на лендинге Chatra](docs/images/course-preview.png)

<table>
  <tr>
    <td width="50%"><strong>03 / Задания</strong><br>Сроки и статусы — рядом с работой.</td>
    <td width="50%"><strong>04 / ИИ-помощник</strong><br>Отдельная вкладка для вопросов по предмету.</td>
  </tr>
  <tr>
    <td><img src="docs/images/assignments-preview.png" alt="Демонстрационная вкладка заданий" width="100%"></td>
    <td><img src="docs/images/assistant-preview.png" alt="Демонстрационная вкладка ИИ-чата" width="100%"></td>
  </tr>
</table>

<details>
<summary><strong>05 / На небольшом экране — мобильная версия</strong></summary>

<p align="center">
  <img src="docs/images/landing-mobile.png" alt="Главная страница Chatra на экране шириной 390 пикселей" width="300">
</p>

</details>

<sub>Скриншоты сделаны из локально запущенной веб-версии. Карточки курса, заданий и ИИ-чата — интерактивные демонстрационные блоки страницы /landing.</sub>

## Возможности

| Учебный процесс | В Chatra |
| :--- | :--- |
| **Предметы и материалы** | Курсы, лекции и документы в контексте предмета |
| **Задания и обратная связь** | Сдача работ, сроки и результаты |
| **ИИ-помощник** | Работа с вопросами по учебным материалам |
| **Два сценария** | Интерфейсы для студентов и преподавателей |
| **Три языка** | Русский, қазақша, English |
| **Разные экраны** | Адаптивная веб-версия для компьютера и телефона |

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

**Chatra** · Learn. Create. Grow.

<sub>© 2026 Chatra. All rights reserved.</sub>

</div>
