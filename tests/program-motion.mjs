import assert from 'node:assert/strict'

export async function verifyProgramMotion(browser, origin) {
  for (const [width, height] of [[320, 568], [390, 844]]) {
    const compact = await browser.newPage({ viewport: { width, height } })
    await compact.goto(origin + '/home')
    const action = compact.getByRole('button', { name: 'شروع جلسهٔ رایگان با کوچ' })
    const frames = await action.evaluate(button => new Promise(resolve => {
      const samples = []
      let start
      const deadline = performance.now() + 1800
      const before = scrollY
      button.click()
      function sample() {
        const panel = document.querySelector('[role=dialog]')
        if (panel) {
          start ??= performance.now()
          const overlay = panel.parentElement
          const box = panel.getBoundingClientRect()
          const transform = getComputedStyle(panel).transform
          const shift = transform === 'none' ? 0 : new DOMMatrix(transform).m42
          overlay.scrollTop = 1
          const extraScroll = overlay.scrollTop
          overlay.scrollTop = 0
          samples.push({ viewportBottom: box.bottom - shift, scroll: scrollY - before, extraScroll })
        }
        const now = performance.now()
        if (start ? now - start < 410 : now < deadline) requestAnimationFrame(sample)
        else resolve(samples)
      }
      requestAnimationFrame(sample)
    }))
    assert.ok(frames.length > 4)
    assert.ok(frames.every(frame => frame.extraScroll === 0), 'the animated panel cannot create a temporary scroll range')
    assert.ok(frames.every(frame => Math.abs(frame.scroll) < 1 && frame.viewportBottom <= height + 1),
      'opening keeps the backdrop stationary and anchors the panel to the visible bottom')
    await compact.close()
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const button = name => page.getByRole('button', { name, exact: true })
  await page.goto(origin + '/home')
  await page.evaluate(() => {
    window.rayaMotionEvents = []
    document.addEventListener('animationstart', event => {
      if (event.target instanceof HTMLElement && event.target.matches('[role=dialog]')) {
        window.rayaMotionEvents.push(event.animationName)
      }
    })
  })
  await button('شروع جلسهٔ رایگان با کوچ').click()
  const sheet = page.getByRole('dialog')
  await sheet.waitFor()
  await page.waitForFunction(() => window.rayaMotionEvents.length > 0, null, { timeout: 1000 })
  const pose = await sheet.evaluate(element => element.getAnimations()[0]?.effect.getKeyframes()[0].transform)
  assert.match(pose, /translate/)
  await page.keyboard.press('Escape')
  const closing = page.locator('[data-motion="closing"]')
  await closing.waitFor({ timeout: 1500 })
  await page.waitForURL('**/home')
  await sheet.waitFor({ state: 'hidden' })
  await button('شروع جلسهٔ رایگان با کوچ').click()
  await page.goBack()
  await sheet.waitFor({ state: 'hidden' })

  await page.goto(origin + '/program/package')
  await button('ادامه و پرداخت').click()
  assert.match(page.url(), /\/checkout$/)
  await page.getByRole('heading', { name: 'بررسی سفارش و پرداخت' }).waitFor()
  await button('پرداخت آزمایشی').click()
  const progress = page.locator('[data-payment-progress]')
  await progress.waitFor()
  await page.locator('[data-checkout-review][inert]').waitFor()
  assert.equal(await progress.evaluate(element => getComputedStyle(element).animationName), 'none',
    'the gateway line is static in the reference')
  assert.ok(await page.locator('[data-sheet=redirecting] [data-sheet-copy]').first().evaluate(element =>
    element.getAnimations().some(animation => animation.effect.getKeyframes()[0].opacity === '0')))
  const panels = await page.evaluate(() => {
    const history = []
    const initial = document.querySelector('[data-sheet=redirecting]')
    const scrim = initial.previousElementSibling
    const changes = []
    const observe = () => {
      const current = document.querySelector('[data-sheet]:not([inert])')?.dataset.sheet
      if (current && !history.includes(current)) {
        history.push(current)
        const panel = document.querySelector('[data-sheet]:not([inert])')
        changes.push(panel === initial && panel.previousElementSibling === scrim)
      }
    }
    const observer = new MutationObserver(observe)
    observer.observe(document.body, { childList: true, attributes: true, attributeFilter: ['data-sheet'], subtree: true })
    observe()
    return new Promise(resolve => setTimeout(() => { observer.disconnect(); resolve({ history, changes }) }, 3200))
  })
  assert.deepEqual(panels, { history: ['redirecting', 'paid'], changes: [true, true] },
    'payment updates the anchored panel and backdrop together')
  await page.getByRole('heading', { name: 'پرداخت با موفقیت انجام شد' }).waitFor()
  await button('بازگشت به خانه').click()
  const preparation = page.getByRole('status', { name: 'آماده‌سازی برنامه' })
  await preparation.waitFor()
  await page.locator('[data-active=true][inert]').waitFor()
  const timing = await preparation.evaluate(element => [...element.querySelectorAll('i')].map(dot => [
    getComputedStyle(dot).animationDuration, getComputedStyle(dot).animationDelay,
  ]))
  assert.deepEqual(timing, [['0.7s', '-0.234s'], ['0.7s', '0s'], ['0.7s', '-0.467s']])
  await preparation.waitFor({ state: 'hidden' })
  await page.waitForURL('**/home')
  await page.getByRole('heading', { name: 'سیستم جاری' }).waitFor()
  await page.close()

  const reduced = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 320, height: 693 } })
  await reduced.goto(origin + '/home/start-session')
  assert.equal(await reduced.getByRole('dialog').evaluate(element => element.getAnimations({ subtree: true }).length), 0)
  await reduced.getByRole('button', { name: 'بعداً ادامه می‌دهم' }).click()
  await reduced.waitForURL('**/home')
  await reduced.goto(origin + '/program/package')
  await reduced.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).click()
  await reduced.getByRole('button', { name: 'پرداخت آزمایشی', exact: true }).click()
  assert.equal(await reduced.locator('[data-payment-progress]').evaluate(element => getComputedStyle(element).animationName), 'none')
  await reduced.getByRole('heading', { name: 'پرداخت با موفقیت انجام شد' }).waitFor()
  await reduced.getByRole('button', { name: 'بازگشت به خانه', exact: true }).click()
  await reduced.waitForURL('**/home')
  await reduced.getByRole('heading', { name: 'سیستم جاری' }).waitFor()
  assert.equal(await reduced.getByRole('status', { name: 'آماده‌سازی برنامه' }).count(), 0)
  await reduced.close()
  console.log('Sheet entrance and exit, payment indicators, preparation transition and reduced motion verified')
}
