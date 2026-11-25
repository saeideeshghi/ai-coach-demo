import assert from 'node:assert/strict'

export async function verifyLearning(browser, origin) {
  for (const [width, height] of [[320, 693], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', acceptDownloads: true })
    try {
      await page.goto(origin + '/home')
      await page.getByRole('button', { name: 'آموزش', exact: true }).click({ timeout: 5000 })
      await page.waitForURL('**/courses')
      const list = page.locator('[data-raya-scroll]').first()
      const scrollbar = page.locator('[data-scrollbar]')
      await scrollbar.waitFor({ state: 'visible' })
      assert.ok(await list.evaluate(element => element.scrollHeight > element.clientHeight))
      const marker = scrollbar.locator('div')
      const atTop = await marker.boundingBox()
      await page.mouse.move(atTop.x + 2, atTop.y + 12)
      await page.mouse.down()
      await page.mouse.move(atTop.x + 2, atTop.y + 75)
      await page.mouse.up()
      await page.waitForFunction(y => document.querySelector('[data-scrollbar] > div').getBoundingClientRect().top > y, atTop.y)
      assert.ok(await list.evaluate(element => element.scrollTop > 0))
      await list.evaluate(element => { element.scrollTop = 0 })
      await page.getByRole('button', { name: 'شروع دوره' }).click()
      await page.getByRole('heading', { name: 'پیش‌نمایش سرفصل‌ها' }).waitFor()
      await page.getByRole('button', { name: 'بازگشت', exact: true }).click()
      await page.waitForURL('**/courses')
      await page.evaluate(() => sessionStorage.setItem('raya-demo-package-order', JSON.stringify({
        id: 'learning-demo', status: 'paid', outcome: 'paid', readyAt: Date.now() - 1,
      })))
      await page.reload()
      await page.getByRole('button', { name: 'شروع دوره' }).click()
      const video = page.locator('video')
      const videoBounds = await video.boundingBox()
      const title = page.getByRole('heading', { name: 'شناسایی و تعیین استانداردهای عملکرد' })
      const titleBounds = await title.boundingBox()
      await page.getByRole('button', { name: 'پخش ویدیو' }).first().click()
      await page.waitForFunction(() => {
        const video = document.querySelector('video')
        const saved = sessionStorage.getItem('raya-lesson:business-management:performance-standards')
        return video && !video.paused && saved && JSON.parse(saved).seconds > 0.1
      })
      assert.deepEqual(await video.boundingBox(), videoBounds, 'playing keeps the same media surface')
      const mediaRatio = await video.evaluate(media => media.videoWidth / media.videoHeight)
      assert.ok(Math.abs(mediaRatio - videoBounds.width / videoBounds.height) < 0.1, 'sample preserves the lesson framing')
      assert.deepEqual(await title.boundingBox(), titleBounds, 'playing keeps the lesson title in place')
      await page.getByRole('button', { name: 'توقف ویدیو' }).click()
      assert.deepEqual(await video.boundingBox(), videoBounds, 'pausing keeps the same media surface')
      const lesson = page.url()
      await page.reload()
      await page.waitForFunction(() => document.querySelector('video')?.currentTime > 0.05)
      await video.evaluate(video => {
        video.currentTime = video.duration - 0.12
        return video.play()
      })
      await page.getByText('۱ از ۹ تکمیل شده').waitFor()
      await page.getByRole('button', { name: /درس بعدی/ }).click()
      assert.notEqual(page.url(), lesson)
      await page.getByRole('button', { name: 'بازگشت', exact: true }).click()
      await page.waitForURL('**/courses')
      await page.getByRole('button', { name: 'ادامهٔ یادگیری' }).waitFor()
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      await page.evaluate(() => {
        for (const id of ['organizational-structure', 'role-agreements', 'growth-meetings',
          'working-relationships', 'company-meeting', 'systemize-operations', 'operations-guide', 'document-processes']) {
          sessionStorage.setItem('raya-lesson:business-management:' + id, JSON.stringify({ seconds: 5, completed: true }))
        }
      })
      await page.reload()
      await page.getByRole('button', { name: 'مرور دوره' }).click()
      await page.getByText('۹ از ۹ تکمیل شده').waitFor()
      assert.equal(await page.getByRole('button', { name: 'درس بعدی' }).count(), 0)

      await page.goto(origin + '/actions/compare-roles/chat')
      const composer = page.getByRole('textbox', { name: 'پیام' })
      await composer.click()
      await composer.fill('بررسی فوکوس و تایپ')
      assert.equal(await composer.evaluate(el => getComputedStyle(el).outlineStyle), 'none')
    } finally {
      await page.close()
    }
  }
  console.log('Learning routes, playable sample, saved progress, scroll and text focus verified')
}
