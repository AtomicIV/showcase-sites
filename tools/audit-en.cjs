// EN-mode audit: open sites with ?lang=en and measure leftover Vietnamese text.
// usage: node tools/audit-en.cjs [slug ...]   (no args = all sites)
const puppeteer = require('puppeteer-core')
const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '..')
let slugs = process.argv.slice(2)
if (!slugs.length) slugs = fs.readdirSync(path.join(root, 'sites')).filter((d) => /^(qt-)?\d{2,3}-/.test(d))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
;(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] })
  const rows = []
  for (const s of slugs) {
    const page = await browser.newPage()
    const errs = []
    page.on('pageerror', (e) => errs.push(e.message))
    await page.setViewport({ width: 1440, height: 900 })
    const url = 'file:///' + path.join(root, 'sites', s, 'index.html').replace(/\\/g, '/') + '?lang=en'
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await wait(1800)
      const r = await page.evaluate(() => {
        const VI = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        let total = 0, vi = 0
        const samples = []
        let n
        while ((n = w.nextNode())) {
          const p = n.parentElement
          if (!p || /SCRIPT|STYLE|NOSCRIPT/.test(p.tagName)) continue
          const t = n.nodeValue.replace(/\s+/g, ' ').trim()
          if (!t) continue
          total += t.length
          const words = t.replace(/\(.*?\)/g, '').split(' ').filter(Boolean)
          const nameLike = words.length <= 5 && words.every((w) => /\d/.test(w[0]) || (w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase()))
          if (VI.test(t) && !nameLike) {
            vi += t.length
            if (samples.length < 6) samples.push(t.slice(0, 90))
          }
        }
        return { lang: document.documentElement.lang, total, vi, samples }
      })
      rows.push({ s, ...r, pct: r.total ? Math.round((r.vi / r.total) * 100) : 0, errs: errs.length })
    } catch (e) {
      rows.push({ s, err: e.message })
    }
    await page.close()
  }
  await browser.close()
  fs.writeFileSync(path.join(__dirname, '_scratch', process.env.AUDIT_OUT || 'en-audit.json'), JSON.stringify(rows, null, 1))
  const avg = rows.reduce((a, r) => a + (r.pct || 0), 0) / rows.length
  console.log(`sites ${rows.length}, avg leftover Vietnamese ${avg.toFixed(1)}%`)
  for (const r of rows.slice(0, 30)) console.log(r.s, r.lang, `${r.pct}%`, r.errs ? `errs ${r.errs}` : '', '|', (r.samples || []).slice(0, 3).join(' ‖ '))
})()


