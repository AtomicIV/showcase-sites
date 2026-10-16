// Interaction smoke test: fill every input, click every visible button, report JS errors.
// usage: node tools/smoke.cjs <site-folder> [desktop|mobile]
const puppeteer = require('puppeteer-core')
const path = require('path')
const fs = require('fs')

const [site, mode = 'desktop'] = process.argv.slice(2)
const file = path.resolve(__dirname, '..', 'sites', site, 'index.html')
if (!fs.existsSync(file)) { console.error('missing', file); process.exit(1) }
const vp = mode === 'mobile'
  ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }
  : { width: 1440, height: 900, deviceScaleFactor: 1 }
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars', '--allow-file-access-from-files'],
  })
  const page = await browser.newPage()
  await page.setViewport(vp)
  const logs = []
  page.on('console', (m) => { if (m.type() === 'error') logs.push(`error: ${m.text()}`) })
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))
  // Stop real navigation away from the page (external links, form posts) without failing.
  page.on('dialog', (d) => d.dismiss())
  const url = 'file:///' + file.replace(/\\/g, '/')
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await wait(2500)

  // Fill text-like fields so submit handlers have something to work with.
  const filled = await page.evaluate(() => {
    let n = 0
    for (const el of document.querySelectorAll('input, textarea')) {
      const t = (el.type || '').toLowerCase()
      if (['hidden', 'file', 'submit', 'button', 'checkbox', 'radio', 'range', 'color'].includes(t)) continue
      el.value = t === 'email' ? 'test@example.com' : t === 'number' ? '3' : t === 'date' ? '2026-11-20' : 'hello world'
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
      n++
    }
    return n
  })

  const count = await page.evaluate(() => document.querySelectorAll('button, [role="button"], input[type="range"], input[type="checkbox"], input[type="radio"], select').length)
  let clicked = 0
  const SEL = 'button, [role="button"], input[type="range"], input[type="checkbox"], input[type="radio"], select'
  for (let i = 0; i < count && clicked < 120; i++) {
    // Scroll first: many controls fade in (visibility:hidden) only once their section is on screen.
    const near = await page.evaluate((idx, sel) => {
      const el = document.querySelectorAll(sel)[idx]
      if (!el) return false
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return false
      const y = r.top + window.scrollY - innerHeight / 2
      window.lenis ? window.lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)
      return true
    }, i, SEL)
    if (!near) continue
    await wait(500)
    const ok = await page.evaluate((idx, sel) => {
      const el = document.querySelectorAll(sel)[idx]
      if (!el) return false
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') return false
      if (el.tagName === 'SELECT') {
        el.selectedIndex = Math.min(1, el.options.length - 1)
        el.dispatchEvent(new Event('change', { bubbles: true }))
      } else if (el.type === 'range') {
        el.value = String((Number(el.min || 0) + Number(el.max || 100)) / 2)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      } else if (typeof el.click === 'function') {
        el.click()
      } else {
        // SVG elements with role="button" have no .click()
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
      return true
    }, i, SEL)
    if (ok) { clicked++; await wait(120) }
    // A click may have opened a modal or navigated; come back to the page if so.
    if (!page.url().startsWith(url)) { await page.goto(url, { waitUntil: 'networkidle0' }); await wait(1500) }
  }
  await page.keyboard.press('Escape')
  await wait(800)
  const overflow = await page.evaluate((w) => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - w, vp.width)
  console.log(`${site} ${mode}: filled ${filled}, clicked ${clicked}/${count}, overflow after ${overflow}px`)
  console.log(logs.length ? [...new Set(logs)].slice(0, 15).join('\n') : 'errors: none')
  await browser.close()
})().catch((e) => { console.log(`${site} ${mode}: CRASH ${e.message}`); process.exit(1) })
