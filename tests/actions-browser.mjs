import assert from 'node:assert/strict'

export async function verifyActions(browser, origin) {
  for (const [width, height] of [[320, 693], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
    try {
      await page.goto(origin + '/followup')
      await page.getByRole('heading', { name: 'برنامه هنوز فعال نشده' }).waitFor()
      await page.getByRole('button', { name: 'بازگشت به خانه' }).click()
      await page.waitForURL('**/home')
      await page.evaluate(() => document.fonts.ready)
      const intro = page.getByRole('button', { name: 'شروع جلسهٔ رایگان با کوچ' })
      assert.equal(await intro.locator('span').last().evaluate(label => {
        const text = document.createRange()
        text.selectNodeContents(label)
        return text.getClientRects().length
      }), 1, 'the home CTA label fits on one line')
      await page.evaluate(() => sessionStorage.setItem('raya-demo-package-order', JSON.stringify({
        id: 'action-demo', status: 'paid', outcome: 'paid', readyAt: Date.now() - 1,
      })))
      await page.reload()
      const nav = page.getByRole('navigation', { name: 'نوار اصلی' })
      const homeNav = await nav.boundingBox()
      if (width === 390) {
        const cta = page.getByRole('button', { name: 'ادامهٔ اقدام' })
        assert.deepEqual(await cta.boundingBox(), { x: 175, y: 235, width: 180, height: 44 })
        assert.equal(await cta.evaluate(button => getComputedStyle(button).borderColor), 'rgb(105, 64, 49)')
      }
      await nav.getByRole('button', { name: 'کوچینگ' }).click()
      await nav.getByRole('button', { name: 'کوچینگ' }).waitFor()
      assert.deepEqual(await nav.boundingBox(), homeNav)
      await nav.getByRole('button', { name: 'پیگیری' }).click()
      await page.waitForURL('**/followup')
      assert.deepEqual(await nav.boundingBox(), homeNav)
      await page.getByRole('button', { name: 'ادامهٔ اقدام' }).click()
      await page.getByRole('heading', { name: 'جزئیات اقدام' }).waitFor()
      const submit = page.getByRole('button', { name: 'اعلام انجام' })
      const beforeNotes = await submit.boundingBox()
      await page.getByText('نکات تکمیلی', { exact: true }).click()
      assert.ok(await page.getByText('مسئول اصلی', { exact: false }).isVisible())
      assert.deepEqual(await submit.boundingBox(), beforeNotes)
      assert.deepEqual(await nav.boundingBox(), homeNav)
      await page.getByRole('button', { name: 'گفت‌وگو با کوچ' }).click()
      await page.getByRole('textbox', { name: 'پیام' }).fill('چطور شروع کنم؟')
      await page.getByRole('button', { name: 'ارسال پیام' }).click()
      await page.getByText('چطور شروع کنم؟', { exact: true }).waitFor()
      await page.getByRole('button', { name: 'درخواست فایل نمونه' }).click()
      const attachment = page.getByRole('link', { name: /الگوی مقایسه نقش‌ها/ })
      await attachment.waitFor()
      const pdf = await page.request.get(new URL(await attachment.getAttribute('href'), origin).href)
      assert.ok(pdf.ok())
      assert.equal((await pdf.body()).subarray(0, 4).toString(), '%PDF')
      await page.getByRole('button', { name: 'بازگشت', exact: true }).click()
      await page.getByRole('button', { name: 'اعلام انجام' }).click()
      await page.getByRole('dialog', { name: 'اعلام انجام ثبت شد' }).waitFor()
      await page.getByRole('button', { name: 'مشاهدهٔ وضعیت' }).click()
      await page.getByRole('dialog', { name: 'در انتظار تأیید کوچ' }).waitFor()
      await page.reload()
      await page.getByRole('button', { name: 'بازگشت به برنامه' }).click()
      await page.getByRole('heading', { name: 'در انتظار تأیید کوچ' }).waitFor()
      await nav.getByRole('button', { name: 'خانه' }).click()
      await page.getByRole('button', { name: 'مشاهدهٔ وضعیت' }).click()
      await page.getByRole('dialog', { name: 'در انتظار تأیید کوچ' }).waitFor()
    } finally {
      await page.close()
    }
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  try {
    await page.goto(origin + '/home')
    await page.evaluate(() => sessionStorage.setItem('raya-demo-package-order', JSON.stringify({
      id: 'action-motion', status: 'paid', outcome: 'paid', readyAt: Date.now() - 1,
    })))
    await page.goto(origin + '/actions/compare-roles')
    await page.getByRole('button', { name: 'اعلام انجام' }).click()
    const submitted = page.getByRole('dialog', { name: 'اعلام انجام ثبت شد' })
    assert.ok(await submitted.locator('[data-action-glyph=check]').evaluate(path =>
      path.getAnimations().some(animation => parseFloat(animation.effect.getKeyframes().at(-1).strokeDashoffset) === 0)))
    const motion = await submitted.evaluate(panel => {
      const slide = panel.getAnimations()[0]
      const scrim = panel.previousElementSibling
      const fade = scrim.getAnimations()[0]
      slide.pause()
      fade.pause()
      slide.currentTime = fade.currentTime = 0
      const from = panel.getBoundingClientRect().top
      slide.currentTime = 240
      fade.currentTime = 190
      const halfway = panel.getBoundingClientRect().top
      const opacity = Number(getComputedStyle(scrim).opacity)
      slide.finish()
      fade.finish()
      window.rayaTestStatus = { panel, scrim, slide, fade }
      return { from, halfway, atRest: panel.getBoundingClientRect().top, opacity }
    })
    assert.ok(motion.from >= 840 && motion.halfway > motion.atRest && motion.halfway < motion.from)
    assert.ok(motion.atRest >= 411 && motion.atRest <= 413)
    assert.ok(motion.opacity > 0 && motion.opacity < 1)
    const swap = await submitted.evaluate(panel => {
      panel.querySelector('button').click()
      return Array.from(panel.querySelectorAll('[data-sheet-copy]')).some(element =>
        element.getAnimations().some(animation => Number(animation.effect.getKeyframes().at(-1).opacity) === 0))
    })
    assert.ok(swap, 'the outgoing status copy fades before the replacement appears')
    const review = page.getByRole('dialog', { name: 'در انتظار تأیید کوچ' })
    assert.ok(await review.evaluate(panel => {
      const before = window.rayaTestStatus
      return panel === before.panel && panel.previousElementSibling === before.scrim
        && panel.getAnimations().includes(before.slide) && before.scrim.getAnimations().includes(before.fade)
    }))
    const ring = review.locator('[data-action-ring=waiting]')
    assert.deepEqual(await ring.evaluate(node => [
      getComputedStyle(node).animationDuration, getComputedStyle(node).animationIterationCount,
    ]), ['2.4s', 'infinite'])
    assert.equal(await review.evaluate(node => node.getBoundingClientRect().top), motion.atRest)
    await review.getByRole('button', { name: 'بازگشت به برنامه' }).click()
    await page.waitForURL('**/followup')
    assert.equal(await page.getByRole('dialog').count(), 0)
    await page.evaluate(() => sessionStorage.setItem('raya-demo-action:compare-roles:review',
      JSON.stringify({ status: 'approved', revised: true })))
    await page.goto(origin + '/actions/compare-roles/review')
    const approved = page.getByRole('dialog', { name: 'تأیید موفق اقدام' })
    const exit = await approved.evaluate(panel => {
      panel.getAnimations()[0].finish()
      panel.previousElementSibling.getAnimations()[0].finish()
      Array.from(panel.querySelectorAll('button')).find(button => button.textContent.includes('بازگشت به برنامه')).click()
      const fade = panel.getAnimations().at(-1)
      const scrimFade = panel.previousElementSibling.getAnimations().at(-1)
      return [fade, scrimFade].map(animation => {
        const last = animation.effect.getKeyframes().at(-1)
        return [last.opacity, last.transform ?? null]
      })
    })
    assert.deepEqual(exit, [['0', null], ['0', null]], 'approval fades in place instead of sliding')
    await page.waitForURL('**/followup')
  } finally {
    await page.close()
  }
  console.log('Shared navigation, action tracking, PDF, and action status motion verified')
}
