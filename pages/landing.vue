<template>
  <div ref="landingRoot" class="landing" @scroll.passive="onScroll">
    <a class="skip-link" href="#landing-content">{{ tx('skipToContent') }}</a>
    <header :class="['site-nav', { scrolled }]">
      <div class="nav-inner">
        <button class="brand" type="button" :aria-label="tx('toTop')" @click="toTop"><span class="brand-mark"/>Chatra</button>
        <nav>
          <a href="#features">{{ tx('navFeatures') }}</a>
          <a href="#about">{{ tx('navAbout') }}</a>
          <a href="#roles">{{ tx('navRoles') }}</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div class="nav-actions">
          <details ref="langMenu" class="language-picker">
            <summary :aria-label="tx('language')">{{ currentLanguageShort }}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary>
            <div class="language-menu">
              <button v-for="item in languages" :key="item.code" type="button" :class="{ active: lang === item.code }" @click="chooseLanguage(item.code)"><span>{{ item.short }}</span>{{ item.label }}<b v-if="lang === item.code">✓</b></button>
            </div>
          </details>
          <NuxtLink class="sign-in" to="/login">{{ tx('signIn') }}</NuxtLink><NuxtLink class="button button-small" to="/org">{{ tx('start') }}</NuxtLink>
        </div>
      </div>
    </header>

    <main id="landing-content" tabindex="-1">
      <section class="hero" data-ambient-glow aria-labelledby="hero-title">
        <LandingGlow class="hero-glow"/>
        <div class="shell hero-inner">
          <div class="hero-copy">
            <h1 id="hero-title">{{ tx('heroTitle') }}</h1>
            <p class="hero-text">{{ tx('heroText') }}</p>
            <div class="hero-actions">
              <NuxtLink class="button button-large button-light" to="/org">{{ tx('tryChatra') }}</NuxtLink>
              <a class="hero-preview-link" href="#course-preview">{{ tx('viewCatalog') }} <span aria-hidden="true">↓</span></a>
            </div>
          </div>

          <picture id="course-preview" class="hero-preview">
            <source media="(max-width: 720px)" :srcset="previewSrc('catalog-mobile-v2')" width="780" height="1688">
            <img :src="previewSrc('catalog-desktop-v3')" :alt="tx('catalogAlt')"
              width="2160" height="1272" fetchpriority="high" decoding="async">
          </picture>
        </div>
      </section>

      <section id="features" class="features-section reveal" aria-labelledby="features-title">
        <div class="shell">
          <header class="section-heading">
            <p class="eyebrow">{{ tx('navFeatures') }}</p>
            <h2 id="features-title">{{ tx('featuresTitle') }}</h2>
            <p>{{ tx('featuresText') }}</p>
          </header>

          <div class="feature-grid">
            <article v-for="(card, index) in featureCards" :key="card.screen" class="feature-card reveal"
              :style="{ '--reveal-delay': `${index * 130}ms` }">
              <h3>{{ tx(card.title) }}</h3>
              <p>{{ tx(card.text) }}</p>
              <picture class="feature-shot" :class="{ 'calendar-shot': card.screen === 'deadlines', 'assistant-shot': card.screen === 'assistant-v2' }">
                <source v-if="card.screen === 'assistant-v2'" media="(max-width: 720px)" :srcset="previewSrc('assistant-mobile-v2')">
                <img :src="previewSrc(card.screen)" alt="" loading="lazy" decoding="async">
              </picture>
            </article>
          </div>
        </div>
      </section>

      <section class="tagline-section reveal">
        <h2 class="shell" :aria-label="tagline.join(' ')">
          <span v-for="(line, lineIndex) in tagline" :key="line" class="tagline-line" aria-hidden="true">
            <span v-for="(word, wordIndex) in line.split(' ')" :key="wordIndex"
              :style="{ '--word-delay': `${(wordIndex + (lineIndex ? tagline[0].split(' ').length : 0)) * 65}ms` }">
              {{ word }}{{ ' ' }}
            </span>
          </span>
        </h2>
      </section>

      <section class="course-section reveal" aria-labelledby="course-title">
        <div class="shell">
          <header class="section-heading">
            <p class="eyebrow">{{ tx('courseEyebrow') }}</p>
            <h2 id="course-title">{{ tx('courseTitle') }}</h2>
            <p>{{ tx('courseText') }}</p>
          </header>
          <picture class="course-shot reveal">
            <source media="(max-width: 720px)" :srcset="previewSrc('course-mobile')" width="780" height="1240">
            <img :src="previewSrc('course-desktop')" :alt="tx('courseAlt')" width="2160" height="1020"
              loading="lazy" decoding="async">
          </picture>
          <ol class="numbered-steps step-grid reveal">
            <li v-for="(step, index) in courseSteps" :key="step.title">
              <span aria-hidden="true">{{ index + 1 }}</span>
              <div>
                <h3>{{ tx(step.title) }}</h3>
                <p>{{ tx(step.text) }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section id="about" class="review-section reveal" aria-labelledby="review-title">
        <div class="shell">
          <header class="section-heading">
            <p class="eyebrow">{{ tx('navAbout') }}</p>
            <h2 id="review-title">{{ tx('reviewTitle') }}</h2>
            <p>{{ tx('reviewText') }}</p>
          </header>

          <div class="review-dashboard">
            <div class="review-summary">
              <p class="eyebrow">{{ tx('reviewExampleLabel') }}</p>
              <h3>{{ tx('reviewExampleTitle') }}</h3>
              <dl class="review-kpis">
                <div v-for="metric in reviewMetrics" :key="metric.label" :class="metric.style">
                  <dt>{{ tx(metric.label) }}</dt>
                  <dd><strong>{{ metric.minutes }}</strong> <span>{{ tx('minuteUnit') }}</span></dd>
                </div>
              </dl>
              <p class="review-note">{{ tx('reviewExampleNote') }}</p>
            </div>

            <figure class="review-chart reveal">
              <figcaption><strong>−{{ reviewPercent }}</strong> {{ tx('reviewChartNote') }}</figcaption>
              <div class="review-bars">
                <div v-for="bar in reviewBars" :key="bar.label" class="review-bar" :class="bar.style">
                  <p><span>{{ tx(bar.label) }}</span><strong>{{ minuteFormat.format(bar.minutes) }}</strong></p>
                  <div class="review-track" aria-hidden="true"><span :style="{ width: bar.width }"/></div>
                </div>
              </div>
              <div class="review-axis" aria-hidden="true"><span v-for="tick in reviewTicks" :key="tick">{{ tick }}</span></div>
            </figure>
          </div>

          <ol class="numbered-steps step-grid reveal">
            <li v-for="(step, index) in reviewSteps" :key="step.title">
              <span aria-hidden="true">{{ index + 1 }}</span>
              <div>
                <h3>{{ tx(step.title) }}</h3>
                <p>{{ tx(step.text) }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section id="roles" class="roles shell reveal" aria-labelledby="roles-title">
        <header class="section-heading">
          <p class="eyebrow">{{ tx('navRoles') }}</p>
          <h2 id="roles-title">{{ tx('rolesTitle') }}</h2>
        </header>

        <div class="role-grid">
          <article v-for="(role, index) in roleCards" :key="role.screen" class="role-card reveal"
            :style="{ '--reveal-delay': `${index * 130}ms` }">
            <p class="eyebrow">{{ tx(role.label) }}</p>
            <h3>{{ tx(role.title) }}</h3>
            <p>{{ tx(role.text) }}</p>
            <div class="role-shot">
              <img :src="previewSrc(role.screen)" alt="" loading="lazy" decoding="async">
            </div>
          </article>
        </div>
      </section>

      <section id="faq" class="faq shell reveal" aria-labelledby="faq-title">
        <header class="section-heading">
          <p class="eyebrow">FAQ</p>
          <h2 id="faq-title">{{ tx('faqTitle') }}</h2>
        </header>

        <div class="faq-list">
          <details v-for="item in faqItems" :key="item.question">
            <summary>{{ tx(item.question) }} <span aria-hidden="true"/></summary>
            <p>{{ tx(item.answer) }}</p>
          </details>
        </div>
      </section>
    </main>

    <footer class="landing-footer" data-ambient-glow>
      <LandingGlow class="footer-glow" mirrored/>
      <section class="closing reveal" aria-labelledby="closing-title">
        <div class="shell">
          <span class="closing-mark" aria-hidden="true"/>
          <h2 id="closing-title">{{ tx('closingTitle') }}</h2>
          <p>{{ tx('closingText') }}</p>
          <NuxtLink class="button button-large button-light" to="/org">{{ tx('tryChatra') }}</NuxtLink>
        </div>
      </section>

      <div class="shell footer-inner">
        <div>
          <span class="brand"><span class="small-mark"/>Chatra</span>
          <p>{{ tx('footerText') }}</p>
        </div>
        <nav>
          <NuxtLink to="/privacy">{{ tx('privacy') }}</NuxtLink>
          <NuxtLink to="/terms">{{ tx('terms') }}</NuxtLink>
          <NuxtLink to="/rules">{{ tx('rules') }}</NuxtLink>
        </nav>
        <small>© {{ year }} Chatra</small>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
definePageMeta({ layout:false })
type LandingLang = 'ru' | 'en' | 'kk'
const { lang, setLang } = useI18n()
const languages: { code: LandingLang; short: string; label: string }[] = [
  { code: 'ru', short: 'RU', label: 'Русский' },
  { code: 'kk', short: 'KZ', label: 'Қазақша' },
  { code: 'en', short: 'EN', label: 'English' },
]
const copy = {
  toTop: ['Наверх', 'Back to top', 'Жоғарыға'], language: ['Выбрать язык', 'Choose language', 'Тілді таңдау'],
  navAbout: ['Проверка работ', 'Grading', 'Жұмыстарды тексеру'], navFeatures: ['Возможности', 'Features', 'Мүмкіндіктер'], navRoles: ['Для кого', 'For whom', 'Кімге арналған'],
  skipToContent: ['Перейти к содержанию', 'Skip to content', 'Мазмұнға өту'],
  signIn: ['Войти', 'Sign in', 'Кіру'], start: ['Начать', 'Get started', 'Бастау'],
  heroTitle: ['Весь курс в\u00a0одном месте', 'Your whole course in one place', 'Бүкіл курс бір жерде'],
  heroText: ['Открывайте лекции, сдавайте задания и задавайте вопросы по материалам курса в Chatra.', 'Open lectures, submit assignments and ask questions about your course materials in Chatra.', 'Chatra-да дәрістерді ашыңыз, тапсырмаларды тапсырыңыз және курс материалдары бойынша сұрақ қойыңыз.'],
  tryChatra: ['Попробовать Chatra', 'Try Chatra', 'Chatra-ны қолданып көру'],
  viewCatalog: ['Посмотреть интерфейс', 'See the interface', 'Интерфейсті көру'],
  catalogAlt: ['Каталог предметов Chatra и навигация студента', 'Chatra’s subject catalog and student navigation', 'Chatra пәндер каталогы мен студент мәзірі'],
  featuresTitle: ['Что можно делать в Chatra', 'What you can do in Chatra', 'Chatra ішінде не істей аласыз'],
  featuresText: ['Откройте предмет, чтобы увидеть его материалы и задания. Общий календарь помогает следить за сроками по всем курсам.', 'Open a subject to find its materials and assignments. A shared calendar brings deadlines from all your courses together.', 'Пәнді ашып, оның материалдары мен тапсырмаларын көріңіз. Ортақ күнтізбе барлық курс бойынша мерзімдерді бақылауға көмектеседі.'],
  materialsTitle: ['Открывайте материалы курса', 'Open your course materials', 'Курс материалдарын ашыңыз'],
  materialsText: ['Лекции, конспекты и презентации собраны внутри предмета. К нужному материалу легко вернуться перед занятием.', 'Find lectures, notes and slides inside each subject. Return to the material you need before class.', 'Дәрістер, конспектілер мен презентациялар пән ішінде жиналған. Сабақ алдында қажет материалды оңай таба аласыз.'],
  assignmentsTitle: ['Сдавайте задания и смотрите результат', 'Submit work and see your results', 'Тапсырмаларды тапсырып, нәтижесін көріңіз'],
  assignmentsText: ['Условия, критерии и статус работы видны до сдачи. После проверки оценка и комментарий остаются рядом с заданием.', 'See the instructions, criteria and status before submitting. After review, find your grade and feedback beside the assignment.', 'Тапсырма шарттары, бағалау критерийлері мен күйі алдын ала көрінеді. Тексеруден кейін баға мен пікір сол тапсырманың ішінде қалады.'],
  deadlinesTitle: ['Смотрите сроки в одном календаре', 'See deadlines in one calendar', 'Мерзімдерді бір күнтізбеден қараңыз'],
  deadlinesText: ['Выберите дату и посмотрите, какие работы нужно сдать. В календаре видно, какие задания уже отправлены.', 'Pick a date to see what is due. The calendar also shows which assignments you have already submitted.', 'Күнді таңдап, қандай жұмыстарды тапсыру керегін көріңіз. Тапсырылған жұмыстар да күнтізбеде көрінеді.'],
  assistantTitle: ['Задавайте вопросы по материалам', 'Ask questions about course materials', 'Материалдар бойынша сұрақ қойыңыз'],
  assistantText: ['Откройте ИИ в предмете, чтобы разобрать тему лекции или уточнить условие задания с учётом материалов курса.', 'Open the course assistant to work through a lecture topic or clarify an assignment using the course materials.', 'Дәріс тақырыбын түсіну немесе тапсырма шартын нақтылау үшін пәндегі ЖИ көмекшісіне жүгініңіз. Ол курс материалдарын ескереді.'],
  taglineFirst: ['Материалы под рукой.', 'Materials within reach.', 'Материалдар қол астыңызда.'],
  taglineSecond: ['Следующий шаг виден сразу.', 'Your next step is clear.', 'Келесі қадам бірден көрінеді.'],
  courseEyebrow: ['Внутри предмета', 'Inside a subject', 'Пән ішінде'],
  courseTitle: ['От лекции до сдачи работы', 'From lecture to submission', 'Дәрістен жұмыс тапсыруға дейін'],
  courseText: ['На примере курса «Основы физики» видно, как связаны материалы, вопросы и задания.', 'See how materials, questions and assignments connect in Physics Fundamentals.', '«Физика негіздері» курсынан материалдар, сұрақтар мен тапсырмалардың байланысын көріңіз.'],
  courseRead: ['Откройте лекцию', 'Open a lecture', 'Дәрісті ашыңыз'],
  courseReadText: ['Найдите законы Ньютона во вкладке с лекциями.', 'Find Newton’s laws in the Lectures tab.', '«Дәрістер» қойындысынан Ньютон заңдарын табыңыз.'],
  courseAsk: ['Задайте вопрос по теме', 'Ask about the topic', 'Тақырып бойынша сұрақ қойыңыз'],
  courseAskText: ['Попросите помощника объяснить, как сила влияет на ускорение.', 'Ask the course assistant how force affects acceleration.', 'Көмекшіден күштің үдеуге қалай әсер ететінін түсіндіруді сұраңыз.'],
  courseSubmit: ['Сдайте лабораторную', 'Submit the lab report', 'Зертханалық жұмысты тапсырыңыз'],
  courseSubmitText: ['Проверьте условия и срок, затем отправьте отчёт в задании.', 'Check the instructions and deadline, then submit your report in the assignment.', 'Шарттар мен мерзімді қарап, есепті тапсырма ішінде жіберіңіз.'],
  courseAlt: ['Курс «Основы физики» в Chatra со списком лекций и вкладками заданий и ИИ.', 'Physics Fundamentals in Chatra with the lecture list, Assignments tab and AI Chat tab.', 'Chatra ішіндегі «Физика негіздері» пәні, дәрістер тізімі, тапсырмалар және ЖИ қойындылары.'],
  reviewTitle: ['Проверка работ по вашим критериям', 'Grade work using your own criteria', 'Жұмыстарды критерий бойынша бағалау'],
  reviewText: ['В списке сдач видно, какие работы уже оценены и какие ещё ждут проверки.', 'See which submissions have been graded and which still need review.', 'Тапсырылған жұмыстар тізімінен қайсысы бағаланғанын, қайсысы әлі тексеруді күтіп тұрғанын көріңіз.'],
  reviewCriteria: ['Задайте критерии', 'Set your criteria', 'Критерийлерді белгілеңіз'],
  reviewCriteriaText: ['Укажите, за что начислять баллы в этом задании.', 'Decide what earns points on this assignment.', 'Бұл тапсырмада қандай талаптарға балл берілетінін көрсетіңіз.'],
  reviewBatch: ['Запустите проверку работ', 'Start a batch review', 'Жұмыстарды топтап тексеріңіз'],
  reviewBatchText: ['ИИ оценит ожидающие работы по критериям задания.', 'AI evaluates pending submissions against your assignment criteria.', 'ЖИ тексеруді күтіп тұрған жұмыстарды тапсырма критерийлерімен бағалайды.'],
  reviewConfirm: ['Проверьте спорные оценки', 'Review flagged grades', 'Күмәнді бағаларды қарап шығыңыз'],
  reviewConfirmText: ['Подтвердите или измените балл и комментарий там, где нужна ручная проверка.', 'Confirm or revise the score and feedback when a submission needs your review.', 'Қолмен тексеру қажет болса, балл мен пікірді растаңыз немесе өзгертіңіз.'],
  reviewExampleLabel: ['Пример расчёта', 'Illustrative calculation', 'Есептеу мысалы'],
  reviewExampleTitle: ['Проверка 24 работ', 'Grading 24 submissions', '24 жұмысты тексеру'],
  reviewExampleNote: ['На одну работу в примере отводим 6 минут вручную и 2 минуты с Chatra. Для проверки с ИИ берём верхнюю границу оценки в 1–2 минуты.', 'The example uses 6 minutes per submission manually and 2 minutes with Chatra, the upper end of the 1–2 minute estimate for grading with AI.', 'Мысалда бір жұмысты қолмен тексеруге 6 минут, ал Chatra арқылы тексеруге 2 минут алынды. Бұл ЖИ көмегімен тексеруге кететін 1–2 минуттық болжамның жоғарғы шегі.'],
  reviewManual: ['Вручную', 'Manual', 'Қолмен'],
  reviewChatra: ['С Chatra', 'With Chatra', 'Chatra арқылы'],
  reviewSaved: ['Экономия', 'Time saved', 'Үнем'],
  reviewChartNote: ['времени в этом примере', 'time in this example', 'уақыт осы мысалда'],
  minuteUnit: ['мин', 'min', 'мин'],
  rolesTitle: ['Один предмет, две роли', 'One subject, two roles', 'Бір пән, екі рөл'],
  students: ['Студентам', 'For students', 'Студенттерге'],
  studentTitle: ['Знайте, что сдавать дальше', 'Know what to submit next', 'Келесі тапсырманы біліңіз'],
  studentText: ['Открывайте материалы, проверяйте сроки и отправляйте работы. Оценки и комментарии можно найти в том же предмете.', 'Open materials, check deadlines and submit work. Find grades and feedback in the same subject.', 'Материалдарды ашыңыз, мерзімдерді тексеріңіз және жұмысыңызды жіберіңіз. Баға мен пікірді сол пәннен табасыз.'],
  teachers: ['Преподавателям', 'For teachers', 'Оқытушыларға'],
  teacherTitle: ['Ведите курс и проверяйте работы', 'Manage your course and review work', 'Курсты жүргізіп, жұмыстарды тексеріңіз'],
  teacherText: ['Публикуйте лекции и задания с критериями. В списке работ видно, кто уже сдал задание и какие ответы ещё ждут проверки.', 'Publish lectures and assignments with criteria. The submissions list shows who has turned in work and what still needs review.', 'Дәрістер мен бағалау критерийлері бар тапсырмаларды жариялаңыз. Жұмыстар тізімінен кім тапсырғанын және нені әлі тексеру керегін көріңіз.'],
  faqTitle: ['Частые вопросы', 'Frequently asked questions', 'Жиі қойылатын сұрақтар'],
  faqStartQuestion: ['Как начать пользоваться Chatra?', 'How do I get started with Chatra?', 'Chatra қолдануды қалай бастаймын?'],
  faqStartAnswer: ['Нажмите «Попробовать Chatra», выберите тип организации и войдите в аккаунт или зарегистрируйтесь.', 'Select “Try Chatra”, choose your organization type and sign in or create an account.', '«Chatra-ны қолданып көру» түймесін басыңыз, ұйым түрін таңдап, аккаунтқа кіріңіз немесе тіркеліңіз.'],
  faqCodeQuestion: ['Как войти в предмет по коду?', 'How do I join a subject by code?', 'Пәнге код арқылы қалай кіремін?'],
  faqCodeAnswer: ['Попросите шестизначный код у преподавателя. В каталоге предметов нажмите «Войти по коду» и введите его.', 'Ask your teacher for the six-character code. In the subject catalog, choose “Join by code” and enter it.', 'Оқытушыдан алты таңбалы код сұраңыз. Пәндер каталогында «Кодпен кіру» түймесін басып, кодты енгізіңіз.'],
  faqPinQuestion: ['Как закрепить предмет?', 'How do I pin a subject?', 'Пәнді қалай бекітемін?'],
  faqPinAnswer: ['На компьютере нажмите значок закладки на карточке в каталоге. Предмет появится в боковом меню, а закрепление сохранится в этом браузере.', 'On desktop, select the bookmark icon on a subject card. The subject appears in the sidebar, and your choice is saved in this browser.', 'Компьютерде пән карточкасындағы бетбелгіні басыңыз. Пән бүйірлік мәзірде көрінеді, ал таңдауыңыз осы браузерде сақталады.'],
  faqFilesQuestion: ['Какие форматы материалов поддерживаются?', 'Which file formats are supported?', 'Қандай файл пішімдері қолдау табады?'],
  faqFilesAnswer: ['В Chatra можно открывать учебные материалы в форматах PDF, DOCX и PPTX.', 'You can open course materials in PDF, DOCX and PPTX formats in Chatra.', 'Chatra ішінде PDF, DOCX және PPTX пішімдеріндегі оқу материалдарын ашуға болады.'],
  faqAiQuestion: ['Чем помогает ИИ внутри предмета?', 'How does the course assistant help?', 'Пән ішіндегі ЖИ қалай көмектеседі?'],
  faqAiAnswer: ['Помощник учитывает материалы и задания предмета. Его можно попросить объяснить формулу, разобрать пример или уточнить условие работы.', 'The assistant takes the subject’s materials and assignments into account. Ask it to explain a formula, work through an example or clarify a task.', 'Көмекші пән материалдары мен тапсырмаларын ескереді. Одан формуланы түсіндіруді, мысалды талдауды немесе тапсырма шартын нақтылауды сұрай аласыз.'],
  faqPhoneQuestion: ['Можно ли пользоваться Chatra с телефона?', 'Can I use Chatra on my phone?', 'Chatra-ны телефоннан қолдануға бола ма?'],
  faqPhoneAnswer: ['Да. В браузере телефона уже доступны каталог, материалы, задания и ИИ-помощник. Скоро выйдут приложения Chatra для iOS и Android.', 'Yes. You can already use the catalog, materials, assignments and AI assistant in your phone’s browser. Chatra apps for iOS and Android are coming soon.', 'Иә. Пәндер каталогы, материалдар, тапсырмалар мен ЖИ көмекшісі телефон браузерінде қолжетімді. Жақында iOS және Android жүйелеріне арналған Chatra қолданбалары шығады.'],
  faqLanguageQuestion: ['На каких языках доступна Chatra?', 'Which languages does Chatra support?', 'Chatra қай тілдерде қолжетімді?'],
  faqLanguageAnswer: ['Язык интерфейса можно переключить на русский, казахский или английский.', 'You can switch the interface between Russian, Kazakh and English.', 'Интерфейсті қазақ, орыс немесе ағылшын тіліне ауыстыруға болады.'],
  closingTitle: ['Начните с первого предмета', 'Start with your first subject', 'Алғашқы пәніңізден бастаңыз'],
  closingText: ['Войдите по коду преподавателя или создайте курс для своей группы.', 'Join with a code from your teacher or create a course for your group.', 'Оқытушы берген кодпен кіріңіз немесе тобыңызға курс жасаңыз.'],
  footerText: ['Цифровое пространство для учёбы.', 'A digital space for learning.', 'Оқуға арналған цифрлық кеңістік.'], privacy: ['Конфиденциальность', 'Privacy', 'Құпиялылық'], terms: ['Условия', 'Terms', 'Шарттар'], rules: ['Правила', 'Guidelines', 'Ережелер'],
} as const
const languageIndex = computed(() => lang.value === 'en' ? 1 : lang.value === 'kk' ? 2 : 0)
const currentLanguageShort = computed(() => languages.find(item => item.code === lang.value)?.short || 'RU')
const tx = (key: keyof typeof copy) => copy[key][languageIndex.value]
const previewSrc = (screen: string) => `/catalog-previews/${screen}-${lang.value}.webp`
const tagline = computed(() => [tx('taglineFirst'), tx('taglineSecond')])
const featureCards = [
  { screen: 'materials', title: 'materialsTitle', text: 'materialsText' },
  { screen: 'assignments', title: 'assignmentsTitle', text: 'assignmentsText' },
  { screen: 'deadlines', title: 'deadlinesTitle', text: 'deadlinesText' },
  { screen: 'assistant-v2', title: 'assistantTitle', text: 'assistantText' },
] as const
const courseSteps = [
  { title: 'courseRead', text: 'courseReadText' },
  { title: 'courseAsk', text: 'courseAskText' },
  { title: 'courseSubmit', text: 'courseSubmitText' },
] as const
const reviewSteps = [
  { title: 'reviewCriteria', text: 'reviewCriteriaText' },
  { title: 'reviewBatch', text: 'reviewBatchText' },
  { title: 'reviewConfirm', text: 'reviewConfirmText' },
] as const
const reviewExample = { submissions: 24, manualMinutes: 6, chatraMinutes: 2 }
const manualTotal = reviewExample.submissions * reviewExample.manualMinutes
const chatraTotal = reviewExample.submissions * reviewExample.chatraMinutes
const savedTotal = manualTotal - chatraTotal
const reviewMetrics = [
  { label: 'reviewManual', style: 'is-manual', minutes: manualTotal },
  { label: 'reviewChatra', style: 'is-chatra', minutes: chatraTotal },
  { label: 'reviewSaved', style: 'is-saved', minutes: savedTotal },
] as const
const reviewBars = reviewMetrics.slice(0, 2).map(metric => ({
  ...metric,
  width: `${metric.minutes / manualTotal * 100}%`,
}))
const reviewTicks = [0, manualTotal / 3, manualTotal * 2 / 3, manualTotal]
const reviewPercent = computed(() => new Intl.NumberFormat(lang.value, {
  style: 'percent',
}).format(savedTotal / manualTotal))
const minuteFormat = computed(() => new Intl.NumberFormat(lang.value, {
  style: 'unit',
  unit: 'minute',
  unitDisplay: 'short',
}))
const roleCards = [
  { screen: 'student-v2', label: 'students', title: 'studentTitle', text: 'studentText' },
  { screen: 'teacher-v2', label: 'teachers', title: 'teacherTitle', text: 'teacherText' },
] as const
const faqItems = [
  { question: 'faqStartQuestion', answer: 'faqStartAnswer' },
  { question: 'faqCodeQuestion', answer: 'faqCodeAnswer' },
  { question: 'faqPinQuestion', answer: 'faqPinAnswer' },
  { question: 'faqFilesQuestion', answer: 'faqFilesAnswer' },
  { question: 'faqAiQuestion', answer: 'faqAiAnswer' },
  { question: 'faqPhoneQuestion', answer: 'faqPhoneAnswer' },
  { question: 'faqLanguageQuestion', answer: 'faqLanguageAnswer' },
] as const
const langMenu = ref<HTMLDetailsElement | null>(null)
const chooseLanguage = (next: LandingLang) => { setLang(next); if (langMenu.value) langMenu.value.open = false }
useHead(computed(() => ({
  htmlAttrs: { lang: lang.value === 'kk' ? 'kk' : lang.value },
  title: lang.value === 'en' ? 'Chatra — everything for learning in one place' : lang.value === 'kk' ? 'Chatra — оқу үшін бәрі бір жерде' : 'Chatra — всё для учёбы в одном месте',
  meta: [{ name:'description', content: lang.value === 'en' ? 'Chatra brings subjects, materials, assignments and feedback together in one place.' : lang.value === 'kk' ? 'Chatra пәндерді, материалдарды, тапсырмалар мен кері байланысты бір кеңістікте біріктіреді.' : 'Chatra объединяет предметы, материалы, задания и обратную связь в одном пространстве.' }],
})))
const scrolled = ref(false)
const year = new Date().getFullYear()
const landingRoot = ref<HTMLElement | null>(null)
const toTop = () => landingRoot.value?.scrollTo({
  top: 0,
  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
})
const onScroll = () => { scrolled.value = (landingRoot.value?.scrollTop ?? 0) > 16 }
let observer: IntersectionObserver | null = null
onMounted(() => {
  document.documentElement.style.overflow = 'auto'
  document.body.style.overflow = 'auto'
  observer = new IntersectionObserver((entries, activeObserver) => {
    for (const entry of entries) {
      if (entry.target.hasAttribute('data-ambient-glow')) {
        entry.target.toggleAttribute('data-glow-visible', entry.isIntersecting)
        continue
      }
      if (!entry.isIntersecting) continue
      entry.target.classList.add('visible')
      activeObserver.unobserve(entry.target)
    }
  }, { threshold: .1 })
  landingRoot.value?.querySelectorAll('.reveal, [data-ambient-glow]').forEach(section => observer?.observe(section))
})
onUnmounted(() => {
  observer?.disconnect()
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>

<style scoped>
.landing{--page:#f5f5f7;--ink:#1d1d1f;--muted:#6e6e73;--line:rgba(60,60,67,.11);--teal:#00b1c9;min-height:100vh;background:var(--page);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif;overflow-x:hidden}.shell{width:min(1160px,calc(100% - 48px));margin-inline:auto}.site-nav{position:fixed;z-index:30;inset:0 0 auto;height:76px;display:flex;align-items:center;transition:height .3s cubic-bezier(.22,1,.36,1),background .25s,border-color .25s}.site-nav.scrolled{height:60px;background:rgba(245,245,247,.78);border-bottom:1px solid rgba(29,29,31,.06);-webkit-backdrop-filter:blur(22px) saturate(180%);backdrop-filter:blur(22px) saturate(180%)}.nav-inner{width:min(1160px,calc(100% - 48px));margin:auto;display:flex;align-items:center;gap:32px}.brand{display:flex;align-items:center;gap:9px;color:var(--ink);font-size:17px;font-weight:750;letter-spacing:-.02em}.brand-mark,.small-mark,.closing-mark{display:block;background:var(--teal);-webkit-mask:url('/logo-icon.png') center/contain no-repeat;mask:url('/logo-icon.png') center/contain no-repeat}.brand-mark{width:27px;height:29px}.small-mark{width:22px;height:23px}.nav-inner nav{display:flex;gap:30px;margin-left:auto}.nav-inner nav a,.sign-in{color:#515154;font-size:13px;font-weight:560}.nav-inner nav a:hover,.sign-in:hover{color:#000}.nav-actions{display:flex;align-items:center;gap:17px}.language-picker{position:relative}.language-picker summary{display:flex;align-items:center;gap:4px;min-height:34px;padding:0 10px;border:1px solid rgba(60,60,67,.13);border-radius:999px;background:rgba(255,255,255,.55);color:#515154;font-size:11px;font-weight:720;letter-spacing:.04em;cursor:pointer;list-style:none;transition:background .16s,transform .1s}.language-picker summary::-webkit-details-marker{display:none}.language-picker summary:hover{background:#fff}.language-picker summary:active{transform:scale(.96)}.language-picker summary svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.6;transition:transform .2s}.language-picker[open] summary svg{transform:rotate(180deg)}.language-menu{position:absolute;top:calc(100% + 9px);right:0;width:180px;padding:6px;border:1px solid rgba(60,60,67,.12);border-radius:15px;background:rgba(255,255,255,.92);box-shadow:0 16px 42px rgba(29,29,31,.16);-webkit-backdrop-filter:blur(22px) saturate(180%);backdrop-filter:blur(22px) saturate(180%);transform-origin:top right;animation:language-menu-in .18s cubic-bezier(.22,1,.36,1)}@keyframes language-menu-in{from{opacity:0;transform:scale(.96) translateY(-3px)}to{opacity:1;transform:none}}.language-menu button{width:100%;min-height:39px;display:grid;grid-template-columns:29px 1fr auto;align-items:center;padding:0 10px;border-radius:10px;color:#3a3a3c;text-align:left;font-size:12px}.language-menu button:hover,.language-menu button.active{background:#f2f2f7}.language-menu button span{color:#8e8e93;font-size:9px;font-weight:760;letter-spacing:.06em}.language-menu button b{color:#00899c}.button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 24px;border-radius:999px;background:var(--teal);color:#fff;font-size:14px;font-weight:650;letter-spacing:-.01em;transition:transform .12s,background .18s,box-shadow .2s}.button:hover{background:#009aaf;box-shadow:0 8px 22px rgba(0,132,150,.16)}.button:active{transform:scale(.97)}.button-small{min-height:38px;padding:0 18px;font-size:13px}.button-large{min-height:52px;font-size:15px}.button-light{background:#fff;color:#111113}.button-light:hover{background:#f2f2f7}
.skip-link {
  position: fixed;
  z-index: 40;
  top: 80px;
  left: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #fff;
  color: #10191d;
  transform: translateY(calc(-100% - 88px));
}
.skip-link:focus { transform: none; }
main > section[id] { scroll-margin-top: 72px; }

.eyebrow {
  color: #087383;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: .09em;
  text-transform: uppercase;
}
.section-heading {
  max-width: 680px;
  margin-inline: auto;
  text-align: center;
}
.section-heading h2,
.tagline-section h2,
.closing h2 {
  font-size: 48px;
  line-height: 1.05;
  font-weight: 600;
  letter-spacing: -.045em;
  text-wrap: balance;
}
.section-heading h2 { margin-top: 16px; }
.section-heading > p:last-child:not(.eyebrow) {
  max-width: 540px;
  margin: 16px auto 0;
  color: #535860;
  font-size: 16px;
  line-height: 24px;
  text-wrap: pretty;
}

.features-section { padding: 96px 0 64px; background: #fff; }
.feature-grid, .role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 48px;
}
.feature-card, .role-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 24px;
  border-radius: 24px;
}
.feature-card { background: #f5f6f7; }
.feature-card h3, .role-card h3 {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  letter-spacing: -.02em;
  text-wrap: balance;
}
.feature-card > p, .role-card > p:not(.eyebrow) {
  margin: 8px 0 24px;
  color: #535860;
  font-size: 16px;
  line-height: 24px;
  text-wrap: pretty;
}
.feature-shot {
  display: block;
  position: relative;
  aspect-ratio: 2 / 1;
  margin-top: auto;
  overflow: hidden;
  border: 1px solid #e2e5e9;
  border-radius: 12px;
  background: #f2f2f7;
}
.feature-shot img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.calendar-shot, .assistant-shot { aspect-ratio: 3 / 2; }
.calendar-shot img { padding: 8px; }

.tagline-section {
  padding: 64px 0 96px;
  background: #fff;
  color: #13262d;
  text-align: center;
}
.tagline-line { display: block; }
.tagline-line > span {
  opacity: .34;
  transition: opacity .5s cubic-bezier(.22,1,.36,1);
  transition-delay: var(--word-delay);
}
.tagline-section.visible .tagline-line > span { opacity: 1; }

.course-section, .review-section { padding-block: 96px; }
.course-section { background: #fff; }
.course-shot {
  display: block;
  margin: 40px auto 0;
  overflow: hidden;
  border: 1px solid #d7e3e6;
  border-radius: 16px;
  background: #f2f2f7;
  box-shadow: 0 16px 40px #123c481c;
}
.course-shot img { width: 100%; height: auto; }

.numbered-steps {
  display: grid;
  gap: 16px;
  margin-top: 32px;
  list-style: none;
}
.numbered-steps li { display: flex; align-items: flex-start; gap: 12px; }
.numbered-steps li > span {
  display: grid;
  place-items: center;
  flex: 0 0 32px;
  height: 32px;
  border: 1px solid #aacbd0;
  border-radius: 50%;
  color: #0b6b7b;
  font-size: 14px;
  font-weight: 600;
}
.numbered-steps h3 { font-size: 16px; line-height: 24px; font-weight: 600; }
.numbered-steps p { margin-top: 4px; color: #465861; font-size: 14px; line-height: 20px; }
.step-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }

.review-section { background: #edf4f5; }
.review-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  align-items: center;
  gap: 32px;
  margin-top: 40px;
  padding: 32px;
  border: 1px solid #cedfe3;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 12px 40px #133a4310;
}
.review-summary h3 {
  margin-top: 8px;
  font-size: 30px;
  line-height: 36px;
  font-weight: 600;
  letter-spacing: -.03em;
}
.review-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 24px;
}
.review-kpis > div {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e3eaed;
  border-radius: 12px;
  background: #f7f9fa;
}
.review-kpis .is-saved { border-color: #c8e8e9; background: #e1f5f5; color: #075d69; }
.review-kpis dt { font-size: 14px; line-height: 20px; font-weight: 500; }
.review-kpis dd { font-variant-numeric: tabular-nums; }
.review-kpis dd strong { font-size: 36px; line-height: 40px; font-weight: 650; letter-spacing: -.05em; }
.review-kpis dd span { font-size: 14px; white-space: nowrap; }
.review-note { margin-top: 16px; color: #465861; font-size: 14px; line-height: 20px; text-wrap: pretty; }
.review-chart {
  padding: 24px;
  border: 1px solid #e3eaed;
  border-radius: 16px;
  background: #f7f9fa;
}
.review-chart figcaption {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 8px;
  color: #465861;
  font-size: 14px;
}
.review-chart figcaption strong { color: #075d69; font-size: 24px; line-height: 32px; letter-spacing: -.025em; }
.review-bars { display: grid; gap: 16px; margin-top: 20px; }
.review-bar p { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; line-height: 20px; }
.review-bar strong { font-variant-numeric: tabular-nums; white-space: nowrap; }
.review-track { height: 24px; margin-top: 8px; overflow: hidden; border-radius: 6px; background: #e9eef0; }
.review-track span { display: block; height: 100%; border-radius: inherit; background: #78919b; }
.review-bar.is-chatra .review-track span { background: #00879a; }
.review-axis { display: flex; justify-content: space-between; margin-top: 8px; color: #526570; font-size: 12px; font-variant-numeric: tabular-nums; }

.roles { padding: 96px 0 64px; }
.role-card { border: 1px solid #dfe4e7; background: #fff; text-align: center; }
.role-card h3 { margin-top: 12px; }
.role-shot {
  position: relative;
  aspect-ratio: 16 / 9;
  margin-top: auto;
  overflow: hidden;
  border: 1px solid #e2e5e9;
  border-radius: 12px;
  background: #f2f2f7;
}
.role-shot img { position: absolute; inset: 0; width: 100%; height: 100%; padding: 12px; object-fit: contain; }

.faq { padding: 64px 0 96px; }
.faq-list { max-width: 760px; margin: 40px auto 0; }
.faq-list details { border-bottom: 1px solid #d9dfe3; }
.faq-list details:first-child { border-top: 1px solid #d9dfe3; }
.faq-list summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;
  padding: 16px 4px;
  cursor: pointer;
  list-style: none;
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
}
.faq-list summary::-webkit-details-marker { display: none; }
.faq-list summary:hover { color: #087383; }
.faq-list summary span { position: relative; flex: 0 0 16px; height: 16px; color: #087383; }
.faq-list summary span::before, .faq-list summary span::after {
  content: '';
  position: absolute;
  top: 7px;
  left: 2px;
  width: 12px;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
}
.faq-list summary span::after { transform: rotate(90deg); }
.faq-list details[open] summary span::after { transform: none; }
.faq-list details p { max-width: 660px; padding: 0 4px 16px; color: #535860; font-size: 16px; line-height: 24px; }

.landing-footer {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--page);
  color: #f8fafb;
}
.footer-glow { inset: 0 0 -1px; }
[data-glow-visible] { --glow-play-state: running; }
.closing { padding: 168px 0 64px; text-align: center; }
.closing-mark { width: 44px; height: 46px; margin: 0 auto 24px; background: #f8fafb; }
.closing p { max-width: 560px; margin: 16px auto 0; color: #d3e2e6; font-size: 16px; line-height: 24px; }
.closing .button { margin-top: 24px; }

.footer-inner {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 32px;
  padding: 32px 0;
  border-top: 1px solid #93b8c43b;
}
.footer-inner .brand { color: #f8fafb; }
.footer-inner > div p { margin-top: 8px; color: #c1d4dc; font-size: 12px; }
.footer-inner nav { display: flex; flex-wrap: wrap; gap: 16px; color: #c1d4dc; font-size: 12px; }
.footer-inner nav a:hover { text-decoration: underline; }
.footer-inner > small { color: #c1d4dc; font-size: 12px; }

.reveal { opacity: 0; transform: translateY(20px); transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
.reveal.visible, .reveal:focus-within { opacity: 1; transform: none; }
.reveal.visible { transition-delay: var(--reveal-delay, 0s); }
.reveal:focus-within { transition-delay: 0s; }

@media (max-width: 980px) {
  .review-dashboard { grid-template-columns: minmax(0, 1fr); gap: 24px; }
}
@media (max-width: 720px) {
  .shell, .nav-inner { width: calc(100% - 32px); }
  .site-nav { height: 64px; }
  .site-nav.scrolled { height: 56px; }
  .nav-inner nav, .sign-in { display: none; }
  .nav-actions { margin-left: auto; gap: 9px; }
  .language-picker summary { min-height: 36px; }
  .features-section, .roles { padding-top: 64px; padding-bottom: 40px; }
  .course-section, .review-section { padding-block: 64px; }
  .course-shot { width: min(100%, 440px); margin-top: 32px; }
  .review-dashboard { padding: 24px; }
  .step-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .closing { padding-block: 144px 48px; }
  .tagline-section, .faq { padding-block: 40px 64px; }
  .section-heading h2, .tagline-section h2, .closing h2 {
    font-size: 36px;
    line-height: 40px;
  }
  .feature-grid, .role-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; margin-top: 32px; }
  .feature-card, .role-card { padding: 16px; }
  .calendar-shot { aspect-ratio: 1; }
  .assistant-shot { aspect-ratio: 6 / 7; }
  .footer-inner { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; padding-block: 32px; }
}
@media (max-width: 480px) {
  .review-dashboard, .review-chart { padding: 16px; }
  .review-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .review-kpis .is-saved { grid-column: 1 / -1; }
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; }
  .reveal, .site-nav, .tagline-line > span { transition: none; }
  .tagline-line > span { opacity: 1; }
  .button:active { transform: none; }
}
@media (prefers-reduced-transparency: reduce) {
  .site-nav.scrolled { background: #f5f5f7; backdrop-filter: none; }
}

@media (min-width: 721px) {
  .nav-inner { display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; }
  .nav-inner .brand { justify-self: start; }
  .nav-inner nav { margin-left: 0; }
  .nav-actions { justify-self: end; }
}
.site-nav:not(.scrolled) .brand { color: #f8fafb; }
.site-nav:not(.scrolled) .nav-inner nav a,
.site-nav:not(.scrolled) .sign-in { color: #c1ccd1; }
.site-nav:not(.scrolled) .nav-inner nav a:hover,
.site-nav:not(.scrolled) .sign-in:hover { color: #fff; }
.site-nav:not(.scrolled) .language-picker summary {
  background: #ffffff0a;
  border-color: #ffffff38;
  color: #e5edf0;
}
.site-nav:not(.scrolled) .language-picker summary:hover { background: #ffffff1a; }
.site-nav:not(.scrolled) .button-small { background: #f8fafb; color: #10191d; }
.site-nav:not(.scrolled) .button-small:hover { background: #dff2f5; }

.hero {
  position: relative;
  isolation: isolate;
  padding: 168px 0 32px;
  background: #fff;
}
.hero-glow {
  inset: 0 0 auto;
  height: min(100%, 920px);
}
.hero-copy { color: #f8fafb; }
.hero h1 {
  max-width: 640px;
  font-size: 60px;
  line-height: 1.05;
  font-weight: 600;
  letter-spacing: -.048em;
  text-wrap: balance;
}
.hero-text {
  max-width: 520px;
  margin-top: 16px;
  color: #d9e4e8;
  font-size: 16px;
  line-height: 24px;
  text-wrap: pretty;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;
  margin-top: 32px;
}
.hero-actions .button { min-height: 48px; padding-inline: 24px; }
.hero-preview-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  color: #f8fafb;
  font-weight: 500;
}
.hero-preview-link:hover { text-decoration: underline; text-underline-offset: 4px; }

.hero-preview {
  display: block;
  margin-top: 64px;
  overflow: hidden;
  border: 1px solid #cfdae0;
  border-radius: 16px;
  background: #f2f2f7;
  box-shadow: 0 16px 48px #123c4826, 0 2px 8px #122c3514;
  scroll-margin-top: 88px;
}
.hero-preview img { width: 100%; height: auto; }

@media (min-width: 721px) {
  .hero-preview { mask-image: linear-gradient(#000 76%, #000d 87%, transparent); }
}
@media (max-width: 980px) {
  .hero { padding-top: 144px; }
}
@media (max-width: 720px) {
  .hero { padding-top: 104px; }
  .hero-glow { height: min(100%, 780px); }
  .hero h1 { max-width: 520px; font-size: 48px; }
  .hero-actions { margin-top: 24px; }
  .hero-preview { max-width: 440px; margin: 40px auto 0; scroll-margin-top: 72px; }
}
@media (max-width: 480px) {
  .hero h1 { font-size: 36px; line-height: 40px; }
  .hero-actions { gap: 4px 16px; }
  .hero-actions .button { padding-inline: 16px; }
}

@media (prefers-reduced-motion: no-preference) {
  .hero-copy, .hero-preview { animation: landing-enter .75s cubic-bezier(.22,1,.36,1) both; }
  .hero-preview { animation-delay: .14s; }
  .hero-copy:focus-within { animation: none; }
  .numbered-steps.visible li { animation: landing-enter .65s cubic-bezier(.22,1,.36,1) both; }
  .numbered-steps.visible li:nth-child(2) { animation-delay: .08s; }
  .numbered-steps.visible li:nth-child(3) { animation-delay: .16s; }
  .review-chart.visible .review-track span {
    transform-origin: left;
    animation: chart-fill .8s cubic-bezier(.22,1,.36,1) both;
  }
  .faq-list summary span::after { transition: transform .22s cubic-bezier(.22,1,.36,1); }
  .faq-list details[open] p { animation: landing-enter .28s cubic-bezier(.22,1,.36,1) both; }
}

@keyframes landing-enter {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
@keyframes chart-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
</style>
