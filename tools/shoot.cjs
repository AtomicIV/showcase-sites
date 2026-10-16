// Visual QA for one site: scroll through it in headless Chrome and screenshot each step.
// usage: node tools/shoot.cjs <site-folder> [desktop|mobile] [stepVh=1] [--reduced]
// Sites must expose `window.lenis` when they use Lenis (programmatic scrolling).
const puppeteer = require('puppeteer-core')
const path = require('path')
const fs = require('fs')

const args = process.argv.slice(2)
const reduced = args.includes('--reduced')
const [site, mode = 'desktop', stepVh = '1'] = args.filter((a) => !a.startsWith('--'))
const file = path.resolve(__dirname, '..', site.includes('/') || site.includes('\\') ? site : `sites/${site}`, 'index.html')
if (!fs.existsSync(file)) { console.error('missing', file); process.exit(1) }
const vp = mode === 'mobile'
  ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }
  : { width: 1440, height: 900, deviceScaleFactor: 1 }
const out = path.join(__dirname, 'shots')
const name = path.basename(path.dirname(file))
fs.mkdirSync(out, { recursive: true })
for (const f of fs.readdirSync(out)) if (f.startsWith(`${name}-${mode}`)) fs.unlinkSync(path.join(out, f))

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars', '--allow-file-access-from-files'],
  })
  const page = await browser.newPage()
  await page.setViewport(vp)
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const logs = []
  page.on('console', (m) => { if (['error', 'warn'].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`) })
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))
  page.on('requestfailed', (r) => logs.push(`requestfailed: ${r.url()}`))
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`http ${r.status()}: ${r.url()}`) })
  await page.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 2500))
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  // Compare against the requested width: on mobile emulation a too-wide element widens the
  // layout viewport itself, so scrollWidth - innerWidth would still read 0.
  const overflow = await page.evaluate((w) => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - w, vp.width)
  const step = Math.round(vp.height * Number(stepVh))
  // Step through the page, and always include the very bottom (short pages used to miss it).
  const maxY = Math.max(0, total - vp.height)
  const stops = []
  for (let y = 0; y < maxY && stops.length < 39; y += step) stops.push(y)
  stops.push(maxY)
  let i = 0
  for (const y of stops) {
    await page.evaluate((yy) => (window.lenis ? window.lenis.scrollTo(yy, { immediate: true, force: true }) : window.scrollTo(0, yy)), y)
    await new Promise((r) => setTimeout(r, 1400))
    // Plain viewport capture: a document-space clip dropped fixed elements (navs, backdrops).
    await page.screenshot({ path: path.join(out, `${name}-${mode}-${String(i).padStart(2, '0')}.png`) })
    i++
  }
  console.log(`${name} ${mode}${reduced ? ' (reduced motion)' : ''}: ${i} shots, page height ${total}, horizontal overflow ${overflow}px`)
  console.log(logs.length ? logs.slice(0, 20).join('\n') : 'console: clean')
  await browser.close()
})()
