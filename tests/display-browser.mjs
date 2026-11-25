import assert from 'node:assert/strict'
import { chromium, firefox } from 'playwright'
import { preview } from 'vite'

const server = await preview({ preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const measurements = []
try {
  for (const [name, engine] of [['chromium', chromium], ['firefox', firefox]]) {
    const browser = await engine.launch(name === 'chromium' ? { channel: 'msedge' } : {})
    try {
      for (const width of [360, 390, 430, 480]) {
        const page = await browser.newPage({ viewport: { width, height: 780 } })
        await page.goto(origin + '/courses')
        await page.evaluate(() => document.fonts.ready)
        assert.equal(await page.locator('[data-display-diagnostics]').count(), 0)
        const geometry = await page.locator('h1').evaluate(e => {
          const rect = e.getBoundingClientRect()
          return [rect.x, rect.y, rect.width, rect.height, parseFloat(getComputedStyle(e).fontSize)]
        })
        measurements.push({ name, width, geometry })
        await page.goto(origin + '/courses?display-debug=1')
        await page.locator('[data-display-diagnostics]').waitFor()
        await page.waitForFunction(() => document.querySelector('[data-display-diagnostics] pre')?.textContent.includes('viewport'))
        assert.match(await page.locator('[data-display-diagnostics]').innerText(), /viewport/)
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width)
        await page.close()
      }
    } finally { await browser.close() }
  }
  for (const first of measurements.filter(item => item.name === 'chromium')) {
    const second = measurements.find(item => item.name === 'firefox' && item.width === first.width)
    first.geometry.forEach((value, index) => assert.ok(Math.abs(value - second.geometry[index]) < 1, `${first.width}: geometry ${index}`))
  }
  console.log('Display diagnostics and cross-engine geometry: passed at 360, 390, 430, 480px')
} finally { await server.close() }
