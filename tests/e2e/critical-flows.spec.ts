import { expect, test, type Locator, type Page, type Route } from '@playwright/test'

const accessToken = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.signature'

const corsHeaders = {
  'access-control-allow-origin': 'http://127.0.0.1:3100',
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': 'authorization,content-type,x-csrf-token,ngrok-skip-browser-warning',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
}

const json = (route: Route, body: unknown, status = 200, headers: Record<string, string> = {}) =>
  route.fulfill({ status, contentType: 'application/json', headers: { ...corsHeaders, ...headers }, body: JSON.stringify(body) })

const minimalPdf = () => {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    '<< /Length 42 >>\nstream\nBT /F1 24 Tf 72 720 Td (Chatra) Tj ET\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let content = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(content))
    content += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = Buffer.byteLength(content)
  content += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  content += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  content += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(content)
}

async function mockApi(page: Page, options: { authenticated?: boolean; role?: 'student' | 'teacher' | 'admin'; withPdf?: boolean; withClass?: boolean; withDeadlines?: boolean } = {}) {
  const authenticated = options.authenticated ?? true
  const role = options.role ?? 'student'
  let nextSubmission: { id: number; assignment_id: number; student_id: number; status: string; submitted_at: string } | null = null
  await page.addInitScript(() => localStorage.setItem('org_type', 'university'))
  await page.route('http://localhost:8000/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: corsHeaders })
    if (path === '/api/test.pdf') {
      return route.fulfill({ status: 200, contentType: 'application/pdf', headers: corsHeaders, body: minimalPdf() })
    }
    if (path.endsWith('/auth/csrf')) return json(route, { csrf_token: 'e2e-csrf' })
    if (path.endsWith('/auth/refresh')) {
      return authenticated
        ? json(route, { access_token: accessToken, token_type: 'bearer', csrf_token: 'e2e-csrf-2' })
        : json(route, { detail: 'Refresh token required' }, 401)
    }
    if (path.endsWith('/auth/me')) {
      return json(route, { id: 1, email: `${role}@example.test`, is_active: true, is_verified: true, role, org_type: 'university', full_name: 'E2E User' })
    }
    if (path.endsWith('/auth/logout')) return route.fulfill({ status: 204, headers: corsHeaders })
    if (path.endsWith('/classes/cover/options')) return json(route, {})
    const e2eClass = {
      id: 1, name: 'E2E Course', description: 'Browser test course', created_by: 1,
      created_at: '2026-10-10T10:00:00', is_active: true, rotation_mode: 'manual',
      is_archived_for_user: false, member_count: 1,
    }
    if (path.endsWith('/classes/1')) return json(route, options.withClass ? e2eClass : { detail: 'Not found' }, options.withClass ? 200 : 404)
    if (path.endsWith('/classes/')) return json(route, options.withClass ? [e2eClass] : [])
    if (path.endsWith('/posts/')) {
      return json(route, options.withPdf ? [{
        id: 10,
        title: '[LECTURE][1] PDF performance',
        created_at: '2026-10-10T10:00:00',
        body: 'Document\n\n📎 [sample.pdf](http://localhost:8000/api/test.pdf)',
      }] : [])
    }
    if (path.includes('/annotations')) return json(route, [])
    const assignment = {
      id: 20, class_id: 1, title: 'E2E Assignment', description: 'Verified assignment list',
      criteria: '[{"name":"Quality","weight":100}]', max_score: 100,
      created_at: '2026-10-10T10:00:00', is_active: true, created_by: 1,
    }
    if (path.endsWith('/assignments/') && options.withDeadlines) {
      const due = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString()
      return json(route, [
        { ...assignment, id: 20, title: 'Later assignment', deadline: due(48) },
        { ...assignment, id: 21, title: 'Next assignment', deadline: due(24) },
        { ...assignment, id: 22, title: 'Already submitted', deadline: due(12) },
        { ...assignment, id: 23, title: 'Expired assignment', deadline: due(-1) },
      ])
    }
    if (path.endsWith('/assignments/')) return json(route, options.withClass ? [assignment] : [])
    if (path.endsWith('/assignments/student/my-submissions') && options.withDeadlines) {
      const submitted = { id: 1, assignment_id: '22', student_id: 1, status: 'submitted' }
      return json(route, nextSubmission ? [submitted, nextSubmission] : [submitted])
    }
    if (path.endsWith('/assignments/21/submit') && options.withDeadlines) {
      nextSubmission = { id: 2, assignment_id: 21, student_id: 1, status: 'submitted', submitted_at: new Date().toISOString() }
      return json(route, nextSubmission)
    }
    if (path.endsWith('/submissions/2') && request.method() === 'DELETE' && options.withDeadlines) {
      nextSubmission = null
      return route.fulfill({ status: 204, headers: corsHeaders })
    }
    if (path.includes('/assignments')) return json(route, [])
    if (path.includes('/notifications')) return json(route, [])
    return json(route, request.method() === 'GET' ? [] : {})
  })
}

async function expectFullDialogWidth(page: Page, dialog: Locator, desktopWidth: number) {
  const viewport = page.viewportSize()
  expect(viewport).not.toBeNull()
  if (!viewport) return
  await expect(dialog).toHaveCSS('max-width', viewport.width > 768 ? `${desktopWidth}px` : '100%')
}

test('protected routes reject an unauthenticated browser session', async ({ page }) => {
  await mockApi(page, { authenticated: false })
  await page.goto('/calendar')
  await expect(page).toHaveURL(/\/login$/)
})

test('role navigation, calendar, language, dialog keyboard behavior, and logout', async ({ page }) => {
  await mockApi(page, { role: 'student' })
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Дедлайны' })).toBeVisible()
  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Қазақша' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'kk')
  await page.getByRole('radio', { name: 'English' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.goto('/calendar')
  await expect(page).toHaveURL(/\/calendar$/)
  await expect(page.getByRole('heading', { name: 'Дедлайны' })).toBeVisible()
  // Settings exposes logout at every breakpoint; the desktop sidebar's
  // secondary controls intentionally collapse into the mobile tab bar.
  await page.goto('/settings')
  await page.getByRole('main').getByRole('button', { name: 'Logout' }).click()
  await expect(page).toHaveURL(/\/org$/)
})

test('sidebar shows saved subjects above the nearest outstanding deadline', async ({ page }) => {
  await mockApi(page, { withClass: true, withDeadlines: true })
  await page.goto('/')

  const sidebar = page.getByRole('complementary')
  const pinned = sidebar.getByRole('region', { name: 'Закреплённые предметы' })
  const deadline = sidebar.getByRole('region', { name: 'Ближайший дедлайн' })
  const pin = page.getByRole('button', { name: 'Закрепить предмет: E2E Course' })
  await expect(sidebar.getByRole('button', { name: /тёмная тема|светлая тема/i })).toHaveCount(0)

  if (page.viewportSize()!.width <= 768) {
    await expect(sidebar.getByRole('link', { name: 'Предметы' })).toBeVisible()
    await expect(pinned).toHaveCount(0)
    await expect(deadline).toHaveCount(0)
    await expect(pin).toHaveCount(0)
    return
  }

  await expect(sidebar.getByRole('heading')).toHaveText(['Закреплённые предметы', 'Ближайший дедлайн'])
  await expect(deadline.getByRole('link', { name: /Next assignment/ }))
    .toHaveAttribute('href', '/classes/1/assignments/21')
  await pin.click()
  await expect(page).toHaveURL(/\/$/)
  await expect(pinned.getByRole('link', { name: 'E2E Course' })).toHaveAttribute('href', '/classes/1')

  await sidebar.getByRole('button', { name: 'Свернуть панель' }).click()
  await page.reload()
  await expect(pin).toHaveAttribute('aria-pressed', 'true')
  await expect(sidebar).toHaveClass(/collapsed/)
  await expect(pinned.getByRole('link', { name: 'E2E Course' })).toBeVisible()
  await expect(deadline.getByRole('link', { name: /Next assignment/ }))
    .toHaveAttribute('href', '/classes/1/assignments/21')
  await sidebar.getByRole('button', { name: 'Развернуть панель' }).click()
  await expect(pinned.getByRole('link', { name: 'E2E Course' })).toBeVisible()
  await pin.click()
  await expect(pinned.getByRole('link', { name: 'E2E Course' })).toHaveCount(0)

  await deadline.getByRole('link', { name: /Next assignment/ }).click()
  await expect(page).toHaveURL(/\/classes\/1\/assignments\/21$/)
  await page.getByPlaceholder('Напишите ваш ответ...').fill('Sample answer')
  await page.getByRole('button', { name: 'Сдать работу', exact: true }).click()
  await expect(deadline.getByRole('link', { name: /Later assignment/ })).toBeVisible()
  await page.getByRole('button', { name: 'Отозвать и сдать заново' }).click()
  await expect(deadline.getByRole('link', { name: /Next assignment/ })).toBeVisible()
})

test('teacher create-class dialog traps focus, closes with Escape, and restores focus', async ({ page }) => {
  await mockApi(page, { role: 'teacher' })
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Создать предмет' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: 'Создать предмет' })
  await expect(dialog).toBeVisible()
  await expectFullDialogWidth(page, dialog, 720)
  await expect(dialog.locator('#create-class-name')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
  await expect(page.getByRole('link', { name: 'Дедлайны' })).toHaveCount(0)
})

test('teacher can access a class and open the assignment workflow', async ({ page }) => {
  await mockApi(page, { role: 'teacher', withClass: true })
  await page.goto('/classes/1?tab=assignments')
  await expect(page.getByRole('heading', { name: 'E2E Course' })).toBeVisible()
  await expect(page.getByText('E2E Assignment', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Задание', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Новое задание' })
  await expect(dialog).toBeVisible()
  await expectFullDialogWidth(page, dialog, 880)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('public shell does not fetch the PDF worker', async ({ page }) => {
  await mockApi(page, { authenticated: false })
  const fetched: string[] = []
  page.on('request', request => fetched.push(request.url()))
  await page.goto('/landing')
  await page.waitForLoadState('networkidle')
  expect(fetched.some(url => url.includes('pdf.worker'))).toBe(false)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('authenticated shell does not fetch the PDF worker', async ({ page }) => {
  await mockApi(page, { role: 'student' })
  const fetched: string[] = []
  page.on('request', request => fetched.push(request.url()))
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect(fetched.some(url => url.includes('pdf.worker'))).toBe(false)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('PDF worker is fetched only after navigating to a PDF viewer route', async ({ page }) => {
  await mockApi(page, { role: 'student', withPdf: true })
  const workerRequest = page.waitForRequest(request => request.url().includes('pdf.worker'))
  await page.goto('/classes/1/lecture/10/file/0')
  const request = await workerRequest
  expect(request.url()).toContain('pdf.worker')
  await expect(page.locator('.dvs-title', { hasText: 'sample.pdf' })).toBeVisible()
})
