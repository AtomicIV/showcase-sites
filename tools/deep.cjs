// Deeper QA for one site: static a11y/structure checks, tablet overflow, and a scroll-consistency
// test — each test position is reached once by scrolling down normally and once after a burst of
// random jumps; the visible text in both states should match (catches stuck/half-run animations).
// usage: node tools/deep.cjs <site-folder>
const puppeteer = require('puppeteer-core')
const path = require('path')
const fs = require('fs')

const site = process.argv[2]
const file = path.resolve(__dirname, '..', 'sites', site, 'index.html')
if (!fs.existsSync(file)) { console.error('missing', file); process.exit(1) }
const url = 'file:///' + file.replace(/\\/g, '/')
const out = path.join(__dirname, 'shots', 'deep')
fs.mkdirSync(out, { recursive: true })
for (const f of fs.readdirSync(out)) if (f.startsWith(site + '-')) fs.unlinkSync(path.join(out, f))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const VPS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  tablet: { width: 820, height: 1180, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
}

// Visible text in the viewport: elements with their own text, centre on screen, effective opacity ≥ 0.5.
function signature() {
  const vw = innerWidth, vh = innerHeight
  const seen = new Set()
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'svg'].includes(el.tagName)) continue
    let own = ''
    for (const n of el.childNodes) if (n.nodeType === 3) own += n.textContent
    own = own.replace(/\s+/g, ' ').trim()
    if (own.length < 3 || /^[\d\s:.,%+\-−–€$£°×/]+$/.test(own)) continue // skip pure numbers (counters, clocks)
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    const cy = r.top + r.height / 2
    // Fully inside horizontally (skips marquee words sliding past the edges).
    if (r.left < -1 || r.right > vw + 1 || cy < 0 || cy > vh) continue
    let op = 1, vis = true
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p)
      op *= Number(cs.opacity)
      if (cs.visibility === 'hidden' || cs.display === 'none') vis = false
    }
    // Prefix "low:" marks text in the bottom 30% — a reveal that hasn't fired yet is normal there.
    if (vis && op >= 0.5) seen.add((cy > vh * 0.7 ? 'low:' : '') + own.slice(0, 50))
  }
  return [...seen]
}

function staticChecks() {
  const issues = []
  if (!document.documentElement.lang) issues.push('html has no lang')
  if (!document.title.trim()) issues.push('empty <title>')
  if (!document.querySelector('link[rel~="icon"]')) issues.push('no favicon')
  for (const a of document.querySelectorAll('a[href^="#"]')) {
    const id = decodeURIComponent(a.getAttribute('href').slice(1))
    if (id && id !== 'top' && !document.getElementById(id)) issues.push(`dead anchor #${id}`)
  }
  for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt')) issues.push(`img without alt: ${img.src.slice(-40)}`)
  const named = (el) => (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || el.textContent.trim() || el.querySelector('img[alt]:not([alt=""]), svg title'))
  for (const el of document.querySelectorAll('button, a[href], [role="button"]')) if (!named(el)) issues.push(`unnamed ${el.tagName.toLowerCase()} .${String(el.className.baseVal ?? el.className).split(' ')[0]}`)
  for (const el of document.querySelectorAll('input:not([type=hidden]), textarea, select')) {
    const ok = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.closest('label') || (el.id && document.querySelector(`label[for="${el.id}"]`))
    if (!ok) issues.push(`unlabelled ${el.tagName.toLowerCase()}[${el.type || ''}] ${el.name || el.id || ''}`)
  }
  const ids = {}
  for (const el of document.querySelectorAll('[id]')) ids[el.id] = (ids[el.id] || 0) + 1
  for (const [id, n] of Object.entries(ids)) if (n > 1) issues.push(`duplicate id #${id} ×${n}`)
  return [...new Set(issues)]
}

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars', '--allow-file-access-from-files'],
  })
  const report = []
  for (const [vpName, vp] of Object.entries(VPS)) {
    const page = await browser.newPage()
    await page.setViewport(vp)
    const errs = []
    page.on('pageerror', (e) => errs.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
    await wait(2500)
    if (vpName === 'desktop') {
      const s = await page.evaluate(staticChecks)
      report.push(s.length ? `static: ${s.slice(0, 12).join(' | ')}` : 'static: ok')
    }
    const overflow = await page.evaluate((w) => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - w, vp.width)
    const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
    const to = (y) => page.evaluate((yy) => (window.lenis ? window.lenis.scrollTo(yy, { immediate: true, force: true }) : window.scrollTo(0, yy)), y)
    const stops = [0.12, 0.27, 0.42, 0.57, 0.72, 0.87].map((f) => Math.round(H * f))

    // Pass A: natural scroll from the top, settling at each stop.
    const natural = []
    let y = 0
    for (const stop of stops) {
      while (y < stop) { y = Math.min(stop, y + 220); await to(y); await wait(35) }
      await wait(2600)
      natural.push(await page.evaluate(signature))
    }
    // Pass B: chaos — random jumps, then land on each stop (in shuffled order) and settle.
    const order = stops.map((_, i) => i).sort(() => Math.random() - 0.5)
    const bad = []
    for (const i of order) {
      for (let k = 0; k < 8; k++) { await to(Math.random() * H); await wait(40 + Math.random() * 250) }
      await to(stops[i]); await wait(2600)
      const sig = await page.evaluate(signature)
      // Compare on text alone; "extra" only counts above the bottom 30% (see signature()).
      const bare = (a) => a.map((t) => t.replace(/^low:/, ''))
      const missing = natural[i].filter((t) => !bare(sig).includes(t.replace(/^low:/, '')))
      const extra = sig.filter((t) => !t.startsWith('low:') && !bare(natural[i]).includes(t))
      if (missing.length + extra.length > 2) {
        const shot = `${site}-${vpName}-stop${i}.png`
        await page.screenshot({ path: path.join(out, shot) })
        bad.push(`stop${i}@${stops[i]} missing[${missing.slice(0, 4).join(' / ')}] extra[${extra.slice(0, 4).join(' / ')}] → deep/${shot}`)
      }
    }
    report.push(`${vpName}: overflow ${overflow}px, ${bad.length ? 'INCONSISTENT ' + bad.join(' ;; ') : `scroll consistent (texts/stop ${natural.map((s) => s.length).join(',')})`}${errs.length ? ' ERRORS ' + [...new Set(errs)].slice(0, 4).join(' | ') : ''}`)
    await page.close()
  }
  console.log(`== ${site}\n` + report.join('\n'))
  await browser.close()
})().catch((e) => { console.log(`== ${site}\nCRASH ${e.message}`); process.exit(1) })
