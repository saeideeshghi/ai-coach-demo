import assert from 'node:assert/strict'

export async function verifyActionRevision(browser, origin) {
  const page = await browser.newPage({ viewport: { width: 320, height: 693 }, reducedMotion: 'reduce' })
  try {
    await page.goto(origin + '/home')
    await page.evaluate(() => sessionStorage.setItem('raya-demo-package-order', JSON.stringify({
      id: 'revision-demo', status: 'paid', outcome: 'paid', readyAt: Date.now() - 1,
    })))
    await page.goto(origin + '/actions/compare-roles')
    await page.getByRole('button', { name: 'اعلام انجام' }).click()
    await page.getByRole('button', { name: 'بازگشت به برنامه' }).click()
    await page.clock.install()
    await page.clock.fastForward(25000)
    await page.getByRole('button', { name: 'مشاهدهٔ وضعیت' }).click()
    await page.getByRole('dialog', { name: 'نیازمند اصلاح' }).waitFor({ timeout: 5000 })
    await page.getByRole('button', { name: 'بعداً اصلاح می‌کنم' }).click()
    await page.waitForURL('**/followup')
    const home = page.getByRole('button', { name: 'بازگشت به خانه', exact: true })
    const placement = await home.evaluate(button => {
      const label = document.createRange()
      const text = [...button.childNodes].find(node => node.textContent.trim() && node.nodeType === Node.TEXT_NODE)
      if (text) label.selectNode(text)
      else label.selectNodeContents(button.querySelector('span'))
      const icon = button.querySelector('svg').getBoundingClientRect()
      return { arrowRight: icon.right, textLeft: label.getBoundingClientRect().left }
    })
    assert.ok(placement.arrowRight + 3 <= placement.textLeft, 'back-to-home arrow belongs on the left of the label')
    await home.click()
    await page.waitForURL('**/home')
    await page.getByRole('button', { name: 'مشاهدهٔ بازخورد کوچ' }).click()
    await page.getByRole('button', { name: 'مشاهدهٔ بازخورد کوچ' }).click()
    const field = page.getByRole('textbox', { name: 'خلاصهٔ اصلاحات' })
    const submit = page.getByRole('button', { name: 'ارسال اصلاحیه' })
    const submitBounds = await submit.boundingBox()
    const navBounds = await page.getByRole('navigation', { name: 'نوار اصلی' }).boundingBox()
    assert.ok(submitBounds.y + submitBounds.height <= navBounds.y, 'revision submit remains above the navigation')
    await field.fill('مسئول اصلی نقش‌های مشترک تعیین شد.')
    assert.equal(await field.evaluate(el => getComputedStyle(el).outlineStyle), 'none')
    await page.getByRole('button', { name: 'ارسال اصلاحیه' }).click()
    await page.getByRole('dialog', { name: 'اصلاحیه ثبت شد' }).waitFor()
    await page.getByRole('button', { name: 'بازگشت به برنامه' }).click()
    await page.clock.fastForward(25000)
    await page.getByRole('button', { name: 'مشاهدهٔ وضعیت' }).click()
    await page.getByRole('dialog', { name: 'تأیید موفق اقدام' }).waitFor()
    await page.getByRole('button', { name: 'مشاهدهٔ اقدام بعدی' }).click()
    await page.waitForURL('**/actions/performance-indicators')
    await page.getByRole('heading', { name: 'تعیین شاخص‌های ارزیابی عملکرد' }).waitFor()
    await page.getByRole('button', { name: 'بازگشت به پیگیری' }).click()
    await page.waitForURL('**/followup')
    await page.getByRole('button', { name: 'گفت‌وگو با کوچ', exact: true }).click()
    await page.getByText('برای هر نقش، یک شاخص قابل اندازه‌گیری تعریف کنیم.', { exact: false }).waitFor()
  } finally {
    await page.close()
  }
  console.log('Coach feedback, revision and next action verified')
}
