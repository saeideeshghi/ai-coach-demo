import assert from 'node:assert/strict'
import { chromium, firefox } from 'playwright'
import { preview } from 'vite'

const server = await preview({ preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const devices = [
  { name: 'chrome-phone', width: 411, height: 750, dpr: 2.625 },
  { name: 'firefox-phone', width: 522, height: 942, dpr: 2.0689655172413794 },
]

try {
  for (const [name, engine] of [['chromium', chromium], ['firefox', firefox]]) {
    const browser = await engine.launch(name === 'chromium' ? { channel: 'msedge' } : {})
    try {
      const results = []
      for (const device of devices) {
        const page = await browser.newPage({ viewport: { width: device.width, height: device.height }, deviceScaleFactor: device.dpr, reducedMotion: 'reduce' })
        await page.goto(origin + '/courses')
        await page.evaluate(() => document.fonts.ready)
        const measure = await page.evaluate(() => {
          const frame = document.querySelector('[data-variant]')
          const nav = document.querySelector('nav')
          const title = document.querySelector('h1')
          const card = document.querySelector('[aria-label="دورهٔ منتخب"]')
          const action = [...document.querySelectorAll('button')].find(e => e.textContent.includes('شروع دوره'))
          const width = frame.getBoundingClientRect().width
          return {
            logicalWidth: frame.clientWidth,
            frameHeight: frame.getBoundingClientRect().height,
            documentHeight: document.scrollingElement.scrollHeight,
            ratios: [nav, title, card, action].flatMap(e => {
              const r = e.getBoundingClientRect()
              return [r.width / width, r.height / width]
            }),
          }
        })
        assert.equal(measure.frameHeight, device.height, 'surface fills the actual browser height')
        assert.equal(measure.documentHeight, device.height, 'no outer document scroll')
        assert.ok(measure.logicalWidth <= 412, 'mobile composition retains the approved density')
        results.push(measure)

        // Drag to the end using rendered pointer coordinates, including CSS layout zoom.
        const track = page.locator('[data-scrollbar]').first()
        const thumb = track.locator('div')
        const trackRect = await track.boundingBox()
        const thumbRect = await thumb.boundingBox()
        await page.mouse.move(thumbRect.x + thumbRect.width / 2, thumbRect.y + thumbRect.height / 2)
        await page.mouse.down()
        await page.mouse.move(trackRect.x + trackRect.width / 2, trackRect.y + trackRect.height - thumbRect.height / 2)
        await page.mouse.up()
        const port = page.locator('[data-raya-scroll]').first()
        assert.ok(await port.evaluate(e => Math.abs(e.scrollHeight - e.clientHeight - e.scrollTop) < 3), 'drag reaches the last card at every density')
        for (const route of ['/welcome', '/onboarding', '/signup', '/profile/1', '/coach/session/demo', '/home', '/history']) {
          await page.goto(origin + route)
          await page.locator('[data-variant] > *').first().waitFor()
          const size = await page.locator('[data-variant]').boundingBox()
          assert.ok(Math.abs(size.height - device.height) < 1, `${route}: fills browser height`)
          assert.ok(Math.abs(size.width - device.width) < 1, `${route}: fills browser width`)
          assert.equal(await page.evaluate(() => document.scrollingElement.scrollHeight), device.height, `${route}: no outer scrolling`)
          if (route === '/onboarding') measure.introTop = (await page.locator('h1').boundingBox()).y / device.width
        }
        if (device.name === 'firefox-phone') {
          await page.evaluate(() => document.documentElement.style.setProperty('--raya-bottom-safe-area', '34px'))
          const nav = await page.locator('nav').boundingBox()
          assert.ok(Math.abs(device.height - nav.y - nav.height - (14 * device.width / 412 + 34)) < 1, 'native safe area is not magnified with the composition')
          await page.goto(origin + '/coach/session/demo')
          await page.getByRole('button', { name: 'صفحه چت', exact: true }).click()
          // Keyboard-driven viewport shrink must resize the surface without changing density.
          await page.evaluate(() => {
            Object.defineProperty(visualViewport, 'height', { configurable: true, value: 450 })
            visualViewport.dispatchEvent(new Event('resize'))
          })
          assert.ok(Math.abs((await page.locator('[data-variant]').boundingBox()).height - 450) < 1)
          const log = await page.getByRole('log').boundingBox()
          const back = await page.getByRole('button', { name: 'بازگشت', exact: true }).boundingBox()
          assert.ok(log.y > back.y + back.height, 'keyboard leaves the chat history below the room header')
          const input = page.getByRole('textbox', { name: 'متن پیام' })
          await input.fill('بررسی نمایش در ارتفاع کوتاه')
          const composer = await input.boundingBox()
          assert.ok(composer.y + composer.height <= 450, 'message composer remains reachable above the keyboard')
          const density = await page.locator('[data-variant]').evaluate(e => getComputedStyle(e).zoom)
          await page.evaluate(() => {
            Object.defineProperty(visualViewport, 'scale', { configurable: true, value: 2 })
            Object.defineProperty(visualViewport, 'height', { value: 225 })
            visualViewport.dispatchEvent(new Event('resize'))
          })
          assert.ok(Math.abs((await page.locator('[data-variant]').boundingBox()).height - 450) < 1, 'pinch zoom does not reset the layout')
          assert.equal(await page.locator('[data-variant]').evaluate(e => getComputedStyle(e).zoom), density)
        }
        await page.close()
      }
      results[0].ratios.forEach((value, index) => assert.ok(Math.abs(value - results[1].ratios[index]) < 0.004, `${name}: composition ratio ${index} differs`))
      assert.ok(Math.abs(results[0].introTop - results[1].introTop) < 0.02, 'onboarding composition uses the local viewport height')
      const lesson = await browser.newPage({ viewport: { width: 522, height: 942 }, reducedMotion: 'reduce' })
      await lesson.goto(origin + '/courses')
      await lesson.evaluate(() => sessionStorage.setItem('raya-demo-package-order', JSON.stringify({
        id: 'density-test', status: 'paid', outcome: 'paid', readyAt: Date.now() - 1,
      })))
      await lesson.reload()
      await lesson.getByRole('button', { name: 'شروع دوره' }).click()
      const mediaBounds = await lesson.locator('video').boundingBox()
      await lesson.getByRole('button', { name: 'پخش ویدیو', exact: true }).first().click()
      await lesson.waitForFunction(() => document.querySelector('video')?.currentTime > 0.1)
      assert.deepEqual(await lesson.locator('video').boundingBox(), mediaBounds)
      await lesson.getByRole('button', { name: 'تمام‌صفحه' }).click()
      await lesson.waitForFunction(() => document.fullscreenElement?.getBoundingClientRect().width > 0, undefined, { timeout: 5000 })
      // Firefox enters fullscreen at the real desktop screen width (1366 here).
      // Chromium keeps the emulated viewport, so explicitly cross its breakpoint.
      // Resizing Firefox's emulation while fullscreen makes that browser exit it.
      if (await lesson.evaluate(() => innerWidth < 600)) await lesson.setViewportSize({ width: 1440, height: 900 })
      await lesson.waitForFunction(() => document.fullscreenElement?.getBoundingClientRect().width >= 600)
      await lesson.getByRole('heading', { name: 'نسخهٔ دسکتاپ هنوز آماده نیست' }).waitFor({ state: 'hidden' })
      assert.ok(await lesson.evaluate(() => Math.abs(document.fullscreenElement.getBoundingClientRect().width - innerWidth) < 1), 'fullscreen media fills the browser even after a desktop-width resize')
      await lesson.evaluate(() => document.exitFullscreen())
      await lesson.waitForFunction(() => !document.fullscreenElement)
      await lesson.close()
      const short = await browser.newPage({ viewport: { width: 522, height: 350 }, reducedMotion: 'reduce' })
      await short.goto(origin + '/home')
      await short.evaluate(() => sessionStorage.setItem('raya-demo-package-order', JSON.stringify({ id: 'density-test', status: 'incomplete', outcome: 'incomplete' })))
      await short.goto(origin + '/orders/density-test')
      const billing = short.getByRole('dialog', { name: 'پرداخت کامل نشد' })
      await billing.waitFor()
      async function checkShortSheet(panel) {
        const bounds = await panel.boundingBox()
        assert.ok(bounds.y >= -1 && bounds.height <= 351, 'short-viewport sheet remains within the mobile surface')
        const lastButton = panel.getByRole('button').last()
        await lastButton.scrollIntoViewIfNeeded()
        const button = await lastButton.boundingBox()
        assert.ok(button.y >= 0 && button.y + button.height <= 351, 'sheet actions remain reachable through internal scrolling')
      }
      await checkShortSheet(billing)
      await short.evaluate(() => sessionStorage.setItem('raya-demo-package-order', JSON.stringify({ id: 'density-test', status: 'paid', outcome: 'paid', readyAt: Date.now() - 1 })))
      await short.goto(origin + '/actions/compare-roles')
      await short.getByRole('button', { name: 'اعلام انجام', exact: true }).click()
      const submitted = short.getByRole('dialog', { name: 'اعلام انجام ثبت شد' })
      await submitted.waitFor()
      await checkShortSheet(submitted)
      await short.close()
      const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      await desktop.goto(origin)
      await desktop.getByRole('heading', { name: 'نسخهٔ دسکتاپ هنوز آماده نیست' }).waitFor()
      await desktop.locator('[data-variant]').waitFor({ state: 'hidden' })
      await desktop.close()
      console.log(`${name}: supplied phone densities, viewport fill and scrollbar verified`)
    } finally { await browser.close() }
  }
} finally { await server.close() }
