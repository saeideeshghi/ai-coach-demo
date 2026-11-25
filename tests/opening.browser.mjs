import { verifyRecords } from './records-browser.mjs'
import { verifyActionRevision } from './action-revision-browser.mjs'
import { verifyLearning } from './learning-browser.mjs'
import { verifyActions } from './actions-browser.mjs'
import { verifyProgramMotion } from './program-motion.mjs'
import { verifyProgram } from './program-browser.mjs'
import { chromium } from 'playwright'
import { preview } from 'vite'
import assert from 'node:assert/strict'
import { verifyCoach } from './coach-demo.mjs'
import { verifyBeforeCoach } from './before-coach.mjs'

const server = await preview({
  preview: { host: '127.0.0.1', port: 0, strictPort: true },
})
const address = server.httpServer.address()
assert.ok(address && typeof address === 'object')
const origin = `http://127.0.0.1:${address.port}`
let browser

try {
  browser = await chromium.launch({
    ...(process.env.RAYA_BROWSER_PATH
      ? { executablePath: process.env.RAYA_BROWSER_PATH }
      : { channel: 'msedge' }),
  })

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await desktop.goto(origin)
  await desktop.getByRole('heading', { name: 'نسخهٔ دسکتاپ هنوز آماده نیست' }).waitFor()
  await desktop.locator('[data-variant=opening]').waitFor({ state: 'hidden' })
  await desktop.close()

  for (const [width, height] of [[320, 693], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } })
    const now = new Date('2026-01-01T00:00:00Z')
    await page.clock.install({ time: now })
    await page.clock.pauseAt(new Date(now.getTime() + 100))
    await page.goto(origin)
    const splash = page.getByRole('region', { name: 'شروع Ai Coach' })
    await splash.waitFor()
    const openingFrame = page.locator('[data-variant=opening]')
    assert.equal(await openingFrame.evaluate(frame => getComputedStyle(frame).borderRadius), '0px')
    assert.equal(await openingFrame.locator(':scope > img').count(), 0)
    await splash.locator('img').evaluateAll((images) =>
      Promise.all(images.map((image) => image.decode())),
    )
    assert.ok(await splash.evaluate((element) => element.getAnimations({ subtree: true }).length > 0))
    await page.clock.fastForward(4900)
    assert.ok(await splash.isVisible(), 'opening is still visible just before five seconds')
    await page.clock.fastForward(100)
    await page.waitForURL('**/onboarding')
    const heading = page.getByRole('heading', { name: 'همراه هوشمند شما در مسیر رشد' })
    await heading.waitFor()
    assert.ok(await heading.evaluate((el) => el === document.activeElement))
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready
      return [...document.querySelectorAll('h1, [data-onboarding-copy], [data-onboarding-skip], [data-onboarding-next]')]
        .filter((el) => el.getClientRects().length > 0)
        .map((el) => getComputedStyle(el).fontSize)
    })
    assert.deepEqual(fonts, ['12px', '24px', '13px', '16px'])
    async function verifyFrame(step) {
      const frame = page.getByRole('region', { name: 'معرفی Ai Coach' })
      assert.equal(await frame.getAttribute('data-slide'), String(step))
      assert.equal(await frame.locator('[aria-current=step]').getAttribute('aria-label'),
        `اسلاید ${step.toLocaleString('fa-IR')}`)
      await frame.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
      if (width >= 390) {
        const bounds = await frame.boundingBox()
        assert.deepEqual([bounds.width, bounds.height], [390, 844])
      }
      const { scrollWidth, scrollHeight } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
      }))
      assert.ok(scrollWidth <= width && scrollHeight <= height,
        `slide ${step} overflows ${width}×${height}`)
    }

    await verifyFrame(1)
    await page.getByRole('button', { name: 'بعدی', exact: true }).click({ timeout: 5000 })
    await page.waitForURL('**/onboarding?slide=2', { timeout: 5000 })
    const second = page.getByRole('heading', { name: 'گفت‌وگو با کوچ هوشمند و شخصی‌سازی‌شده' })
    await second.waitFor()
    assert.ok(await second.evaluate(el => el === document.activeElement))
    await verifyFrame(2)
    await page.getByRole('button', { name: 'بعدی', exact: true }).click()
    await page.waitForURL('**/onboarding?slide=3')
    await page.getByRole('heading', { name: 'قدم‌به‌قدم تا آینده‌ای بزرگ‌تر' }).waitFor()
    await verifyFrame(3)
    await page.goBack()
    await second.waitFor()
    await page.getByRole('button', { name: 'اسلاید ۱' }).click()
    await heading.waitFor()
    await page.getByRole('button', { name: 'اسلاید ۳' }).click()
    await page.reload()
    await page.getByRole('heading', { name: 'قدم‌به‌قدم تا آینده‌ای بزرگ‌تر' }).waitFor()
    await verifyFrame(3)
    await page.getByRole('button', { name: 'شروع کنید' }).click({ timeout: 5000 })
    await page.waitForURL('**/welcome')
    const welcome = page.getByRole('heading', { name: 'خوش آمدید' })
    await welcome.waitFor()
    assert.ok(await welcome.evaluate(el => el === document.activeElement))
    const welcomeFrame = page.getByRole('region', { name: 'خوش آمدید' })
    await welcomeFrame.locator('img').evaluateAll(images =>
      Promise.all(images.map(image => image.decode())),
    )
    await page.evaluate(() => document.fonts.ready)
    const welcomeBounds = await welcomeFrame.boundingBox()
    assert.ok(welcomeBounds.width <= width && welcomeBounds.height <= height)
    if (width === 390) {
      const match = async (name, y, height, fontSize) => {
        const button = welcomeFrame.getByRole('button', { name, exact: true })
        assert.deepEqual(await button.boundingBox(), { x: 41, y, width: 308, height })
        assert.equal(await button.evaluate(el => getComputedStyle(el).fontSize), fontSize)
      }
      await match('ورود به حساب', 476, 51, '14.8px')
      await match('ثبت نام', 541, 49, '14.5px')
    }
    await page.goBack()
    await verifyFrame(3)
    for (const step of [1, 2, 3]) {
      await page.getByRole('button', { name: `اسلاید ${step.toLocaleString('fa-IR')}` }).click()
      await page.getByRole('button', { name: 'رد کردن' }).click()
      await page.waitForURL('**/welcome')
      await page.goBack()
      await verifyFrame(step)
    }
    await page.close()
    console.log(`Opening, onboarding, and welcome verified at ${width}×${height}`)
  }

  const direct = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await direct.goto(origin + '/onboarding')
  await direct.getByRole('heading', { name: 'همراه هوشمند شما در مسیر رشد' }).waitFor()
  await direct.goto(origin + '/welcome')
  await direct.getByRole('heading', { name: 'خوش آمدید' }).waitFor()
  await direct.getByRole('button', { name: 'ثبت نام', exact: true }).click({ timeout: 5000 })
  await direct.waitForURL('**/signup')
  const signup = direct.getByRole('heading', { name: 'ساخت حساب کاربری' })
  await signup.waitFor()
  await direct.setViewportSize({ width: 390, height: 844 })
  await direct.evaluate(() => document.fonts.ready)
  const typography = await direct.evaluate(() => {
    const selectors = ['h1', 'header p', '[name=email]', '[type=submit]']
    return selectors.map(selector => {
      const style = getComputedStyle(document.querySelector(selector))
      return [style.fontFamily, style.fontSize]
    })
  })
  assert.deepEqual(typography, ['24px', '15.955px', '15.068px', '14.5px'].map(size =>
    ['Kahroba, sans-serif', size]))
  const submit = direct.getByRole('button', { name: 'ساخت حساب کاربری' })
  await submit.click()
  const givenName = direct.getByRole('textbox', { name: 'نام', exact: true })
  assert.ok(await givenName.evaluate(el => el === document.activeElement))
  const alignment = el => {
    const { direction, textAlign } = getComputedStyle(el)
    return [direction, textAlign, el === document.activeElement]
  }
  await givenName.fill('Saman')
  assert.deepEqual(await givenName.evaluate(alignment), ['rtl', 'right', true])
  await givenName.fill('سامان')
  const familyName = direct.getByRole('textbox', { name: 'نام خانوادگی' })
  await familyName.fill('Rezaei')
  assert.deepEqual(await familyName.evaluate(alignment), ['rtl', 'right', true])
  await familyName.fill('رضایی')
  const email = direct.getByRole('textbox', { name: 'ایمیل' })
  await email.fill('signup@example.com')
  assert.deepEqual(await email.evaluate(alignment), ['ltr', 'right', true])
  const password = direct.getByLabel('رمز عبور', { exact: true })
  await password.fill('RayaDemo123')
  await direct.getByRole('button', { name: 'نمایش رمز عبور', exact: true }).click()
  assert.equal(await password.getAttribute('type'), 'text')
  await password.focus()
  assert.deepEqual(await password.evaluate(alignment), ['ltr', 'right', true])
  await direct.getByLabel('تکرار رمز عبور', { exact: true }).fill('RayaDemo123')
  await direct.getByRole('checkbox').check()
  await direct.setViewportSize({ width: 320, height: 693 })
  assert.equal(await givenName.inputValue(), 'سامان')
  await submit.click()
  await direct.waitForURL('**/account-created', { timeout: 5000 })
  const sheet = direct.getByRole('dialog', { name: 'حساب شما با موفقیت ایجاد شد.' })
  await sheet.waitFor()
  const modalTitle = sheet.getByRole('heading')
  assert.ok(await modalTitle.evaluate(el => el === document.activeElement))
  assert.equal(await modalTitle.evaluate(el => getComputedStyle(el).fontSize), '20px')
  assert.equal(await direct.evaluate(() => document.documentElement.scrollWidth), 320)
  assert.equal(await direct.locator('form').evaluate(el => Boolean(el.closest('[inert]'))), true)
  await direct.keyboard.press('Tab')
  assert.ok(await sheet.getByRole('button', { name: 'شروع تکمیل اطلاعات' }).evaluate(el => el === document.activeElement))
  await direct.keyboard.press('Escape')
  await direct.waitForURL('**/signup')
  assert.equal(await givenName.inputValue(), 'سامان')
  assert.ok(await givenName.isVisible())
  await direct.goForward()
  await sheet.getByRole('button', { name: 'شروع تکمیل اطلاعات' }).click()
  await direct.waitForURL('**/profile/1')
  await direct.goBack()
  await sheet.waitFor()
  await direct.keyboard.press('Escape')
  await direct.waitForURL('**/signup')
  await direct.getByRole('button', { name: 'بازگشت', exact: true }).click()
  await direct.waitForURL('**/welcome')
  await direct.goto(origin + '/signup')
  await signup.waitFor()

  const manifestLink = await direct.locator('link[rel=manifest]').getAttribute('href')
  assert.ok(manifestLink)
  const manifestUrl = new URL(manifestLink, origin)
  const manifest = await (await direct.request.get(manifestUrl.href)).json()
  assert.equal(manifest.display, 'standalone')
  assert.equal(new URL(manifest.start_url, manifestUrl).pathname, '/')
  for (const size of ['192x192', '512x512']) {
    const icon = manifest.icons.find(icon => icon.sizes === size)
    assert.ok(icon)
    const dimensions = await direct.evaluate(async (src) => {
      const img = new Image()
      img.src = src
      await img.decode()
      return `${img.naturalWidth}x${img.naturalHeight}`
    }, new URL(icon.src, manifestUrl).href)
    assert.equal(dimensions, size)
  }
  await direct.close()
  console.log('Signup alignment, account confirmation and manifest verified')

  await verifyBeforeCoach(browser, origin)
  await verifyCoach(browser, origin)
  await verifyProgram(browser, origin)
  await verifyProgramMotion(browser, origin)
  await verifyActions(browser, origin)
  await verifyActionRevision(browser, origin)
  await verifyLearning(browser, origin)
  await verifyRecords(browser, origin)

  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await page.goto(origin)
  const splash = page.getByRole('region', { name: 'شروع Ai Coach' })
  await splash.waitFor()
  assert.equal(await splash.evaluate((element) => element.getAnimations({ subtree: true }).length), 0)
  console.log('Reduced-motion opening verified')
} finally {
  await browser?.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
