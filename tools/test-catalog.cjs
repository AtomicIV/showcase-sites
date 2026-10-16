// Interaction check for the catalog: filters, list view, keyboard reachability.
// usage: node tools/test-catalog.cjs [path-to-index.html]
const puppeteer = require('puppeteer-core')
const path = require('path')
const file = path.resolve(process.argv[2] || path.join(__dirname, '..', 'index.html'))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'networkidle0' })
  await wait(3500)
  const visible = (sel) => page.$$eval(sel, (els) => els.filter((e) => !e.hidden && e.offsetParent !== null).length)
  const out = { cards: await visible('.card') }
  await page.click('#filters [data-cat="AI"]'); await wait(800)
  out.afterAI = await visible('.card')
  await page.click('#filters [data-cat="All"]'); await wait(800)
  out.afterAll = await visible('.card')
  // Field dropdown: pick the first real field, then combine with a category that may leave nothing.
  const firstField = await page.$eval('#field', (s) => (s.options[1] ? s.options[1].value : ''))
  if (firstField) {
    await page.select('#field', firstField); await wait(800)
    out.field = { name: firstField, cards: await visible('.card'), expected: await page.$$eval('.card', (c, f) => c.filter((e) => e.dataset.field === f).length, firstField) }
    await page.click('#filters [data-cat="Landing"]'); await wait(800)
    out.field.withLanding = await visible('.card')
    out.field.emptyShown = await page.$eval('#empty', (e) => !e.hidden)
    await page.click('#filters [data-cat="All"]'); await page.select('#field', ''); await wait(800)
    out.field.reset = await visible('.card')
  }
  await page.click('[data-view="list"]'); await wait(800)
  out.listRows = await visible('.row')
  out.gridHidden = await page.$eval('#grid', (g) => getComputedStyle(g).display === 'none')
  await page.click('[data-view="grid"]'); await wait(500)
  out.links = await page.$$eval('.card a', (as) => as.map((a) => a.getAttribute('href')))
  // Tab through: the first card link must be focusable.
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
  out.focused = await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName)
  out.errors = errors
  console.log(JSON.stringify(out, null, 1))
  await browser.close()
})()
