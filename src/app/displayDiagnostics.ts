/** Opt-in, local-only measurements for comparing a physical phone's browsers. */
export function showDisplayDiagnostics() {
  if (new URLSearchParams(location.search).get('display-debug') !== '1') return
  const panel = document.createElement('aside')
  panel.dataset.displayDiagnostics = ''
  panel.dir = 'ltr'
  panel.setAttribute('aria-label', 'Display diagnostics')
  panel.style.cssText = 'position:fixed;z-index:2147483647;inset:auto 8px 8px;max-height:65dvh;overflow:auto;padding:12px;background:#fff;color:#111;border:2px solid #ff641f;font:12px/1.5 monospace;box-sizing:border-box;white-space:pre-wrap;overflow-wrap:anywhere'
  const output = document.createElement('pre')
  output.style.cssText = 'font:inherit;margin:0;white-space:pre-wrap;overflow-wrap:anywhere'
  const close = document.createElement('button')
  close.textContent = 'بستن گزارش'
  close.onclick = () => { panel.remove(); clearInterval(refresh); window.removeEventListener('resize', update) }
  panel.append(close, output)
  document.body.append(panel)
  function update() {
    const heading = document.querySelector('main h1')
    output.textContent = JSON.stringify({
      viewport: { width: innerWidth, height: innerHeight },
      screen: { width: screen.width, height: screen.height, dpr: devicePixelRatio },
      visualViewport: window.visualViewport && { width: visualViewport!.width, height: visualViewport!.height, scale: visualViewport!.scale },
      heading: heading && { text: heading.textContent, font: getComputedStyle(heading).font, width: heading.getBoundingClientRect().width },
      fontLoaded: document.fonts.check('16px Kahroba'),
      bundle: document.querySelector<HTMLScriptElement>('script[type="module"]')?.src.split('/').pop(),
      browser: navigator.userAgent,
    }, null, 2)
  }
  window.addEventListener('resize', update)
  void document.fonts.ready.then(() => requestAnimationFrame(update))
  const refresh = setInterval(update, 1000)
}
