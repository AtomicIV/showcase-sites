// Fast, comprehensive QA for one or more sites in a single headless Chrome instance:
// 1. Static checks: lang="vi", title, favicon, dead #anchors, img alt, named buttons/links,
//    labelled inputs, duplicate IDs, Vietnamese-supported Google Fonts only, no English boilerplate.
// 2. Viewport overflow check at Desktop (1440x900), Tablet (820x1180), and Mobile (390x844).
// 3. Scroll & interaction smoke check: scrolls through the page, fills inputs, clicks controls,
//    checks for console errors / pageerrors / HTTP>=400 / post-click overflow.
// usage: node tools/fast-qa.cjs <slug1> [slug2 ...]
const puppeteer = require('puppeteer-core')
const path = require('path')
const fs = require('fs')
const { FONT_MAP } = require('./fix-fonts-vi.cjs')

const slugs = process.argv.slice(2)
if (!slugs.length) {
  console.error('Usage: node tools/fast-qa.cjs <slug1> [slug2 ...]')
  process.exit(1)
}

const BAD_FONTS = Object.keys(FONT_MAP)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function runStaticChecks(badFonts) {
  const issues = []
  if (document.documentElement.lang !== 'vi') issues.push(`html lang="${document.documentElement.lang}" (expected "vi")`)
  if (!document.title.trim()) issues.push('empty <title>')
  if (!document.querySelector('link[rel~="icon"]')) issues.push('no favicon')
  for (const l of document.querySelectorAll('link[href*="fonts.googleapis.com"]')) {
    const h = decodeURIComponent(l.href).replace(/\+/g, ' ')
    for (const bf of badFonts) {
      if (new RegExp(`family=${bf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[:&]|$)`, 'i').test(h)) {
        issues.push(`non-VI font in <link>: ${bf}`)
      }
    }
  }
  for (const a of document.querySelectorAll('a[href^="#"]')) {
    const id = decodeURIComponent(a.getAttribute('href').slice(1))
    if (id && id !== 'top' && !document.getElementById(id)) issues.push(`dead anchor #${id}`)
  }
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) issues.push(`img without alt: ${img.src.slice(-40)}`)
  }
  const named = (el) => (
    el.getAttribute('aria-label') ||
    el.getAttribute('aria-labelledby') ||
    el.getAttribute('title') ||
    el.textContent.trim() ||
    el.querySelector('img[alt]:not([alt=""]), svg title')
  )
  for (const el of document.querySelectorAll('button, a[href], [role="button"]')) {
    if (!named(el)) issues.push(`unnamed ${el.tagName.toLowerCase()} .${String(el.className.baseVal ?? el.className).split(' ')[0]}`)
  }
  for (const el of document.querySelectorAll('input:not([type=hidden]), textarea, select')) {
    const ok = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.closest('label') || (el.id && document.querySelector(`label[for="${el.id}"]`))
    if (!ok) issues.push(`unlabelled ${el.tagName.toLowerCase()}[${el.type || ''}] ${el.name || el.id || ''}`)
  }
  const ids = {}
  for (const el of document.querySelectorAll('[id]')) ids[el.id] = (ids[el.id] || 0) + 1
  for (const [id, n] of Object.entries(ids)) if (n > 1) issues.push(`duplicate id #${id} ×${n}`)

  // Check for untranslated English boilerplate & verify Vietnamese text presence
  const bodyText = document.body.innerText || ''
  if (/Concept design\s*[—–-]\s*fictional brand/i.test(bodyText)) issues.push('untranslated footer: "Concept design — fictional brand"')
  if (/Skip to content/i.test(bodyText)) issues.push('untranslated skip link: "Skip to content"')
  const viChars = (bodyText.match(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi) || []).length
  if (viChars < 40) issues.push(`too few Vietnamese accented characters in body (${viChars})`)
  return [...new Set(issues)]
}

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars', '--allow-file-access-from-files'],
  })
  let hasFailure = false

  for (const slug of slugs) {
    const siteDir = path.resolve(__dirname, '..', 'sites', slug)
    const htmlFile = path.join(siteDir, 'index.html')
    const metaFile = path.join(siteDir, 'meta.json')
    if (!fs.existsSync(htmlFile)) {
      console.log(`FAIL ${slug}: missing index.html`)
      hasFailure = true
      continue
    }
    const metaIssues = []
    if (!fs.existsSync(metaFile)) {
      metaIssues.push('missing meta.json')
    } else {
      try {
        const m = JSON.parse(fs.readFileSync(metaFile, 'utf8'))
        if (!m.title || !m.sector || !m.category || !m.field || !m.tagline || !Array.isArray(m.palette) || !Array.isArray(m.fonts)) {
          metaIssues.push('incomplete meta.json keys')
        }
        if (!/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(m.tagline || '')) {
          metaIssues.push('meta.json tagline not translated to Vietnamese')
        }
        for (const f of m.fonts || []) {
          if (BAD_FONTS.includes(f)) metaIssues.push(`non-VI font in meta.json: ${f}`)
        }
      } catch (e) {
        metaIssues.push(`invalid meta.json: ${e.message}`)
      }
    }

    const page = await browser.newPage()
    const logs = []
    page.on('console', (m) => { if (m.type() === 'error') logs.push(`console.error: ${m.text()}`) })
    page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))
    page.on('requestfailed', (r) => logs.push(`requestfailed: ${r.url()}`))
    page.on('response', (r) => { if (r.status() >= 400) logs.push(`http ${r.status()}: ${r.url()}`) })
    page.on('dialog', (d) => d.dismiss())

    const url = 'file:///' + htmlFile.replace(/\\/g, '/')
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
    await wait(1200)

    const staticIssues = await page.evaluate(runStaticChecks, BAD_FONTS)
    const deskOverflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - 1440)

    // Scroll through desktop stops
    const maxH = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight))
    for (const f of [0.25, 0.5, 0.75, 1]) {
      await page.evaluate((y) => (window.lenis ? window.lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), Math.round(maxH * f))
      await wait(200)
    }

    // Smoke test interactive elements
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('input, textarea')) {
        const t = (el.type || '').toLowerCase()
        if (['hidden', 'file', 'submit', 'button', 'checkbox', 'radio', 'range', 'color'].includes(t)) continue
        el.value = t === 'email' ? 'khachhang@congty.vn' : t === 'number' ? '3' : t === 'date' ? '2026-11-20' : 'Xin chào Việt Nam'
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    const SEL = 'button, [role="button"], input[type="range"], input[type="checkbox"], input[type="radio"], select'
    const count = await page.evaluate((s) => document.querySelectorAll(s).length, SEL)
    for (let i = 0; i < Math.min(count, 40); i++) {
      await page.evaluate((idx, sel) => {
        const el = document.querySelectorAll(sel)[idx]
        if (!el) return
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') return
        if (el.tagName === 'SELECT') {
          el.selectedIndex = Math.min(1, el.options.length - 1)
          el.dispatchEvent(new Event('change', { bubbles: true }))
        } else if (el.type === 'range') {
          el.value = String((Number(el.min || 0) + Number(el.max || 100)) / 2)
          el.dispatchEvent(new Event('input', { bubbles: true }))
          el.dispatchEvent(new Event('change', { bubbles: true }))
        } else if (typeof el.click === 'function') {
          el.click()
        }
      }, i, SEL)
      await wait(40)
      if (!page.url().startsWith(url)) {
        await page.goto(url, { waitUntil: 'networkidle0' })
        await wait(500)
      }
    }
    await page.keyboard.press('Escape')
    await wait(150)

    // Tablet overflow
    await page.setViewport({ width: 820, height: 1180, isMobile: true, hasTouch: true, deviceScaleFactor: 1 })
    await wait(250)
    const tabOverflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - 820)

    // Mobile overflow
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 })
    await wait(250)
    const mobOverflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - 390)

    await page.close()

    const allIssues = [
      ...metaIssues,
      ...staticIssues,
      ...(deskOverflow > 0 ? [`desktop overflow ${deskOverflow}px`] : []),
      ...(tabOverflow > 0 ? [`tablet overflow ${tabOverflow}px`] : []),
      ...(mobOverflow > 0 ? [`mobile overflow ${mobOverflow}px`] : []),
      ...[...new Set(logs)],
    ]
    if (allIssues.length) {
      console.log(`FAIL ${slug}: ${allIssues.join(' | ')}`)
      hasFailure = true
    } else {
      console.log(`PASS ${slug} (desk:0px, tab:0px, mob:0px, static:ok, errors:0)`)
    }
  }

  await browser.close()
  if (hasFailure) process.exit(1)
})()
