// Interaction check for the catalog: page-type tabs, category/industry/function filters, search,
// list view, language switch and keyboard reachability.
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
  await page.evaluateOnNewDocument(() => localStorage.removeItem('showcase_lang'))
  await page.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'domcontentloaded', timeout: 30000 })
  await wait(3500)
  const visible = (sel) => page.$$eval(sel, (els) => els.filter((e) => !e.hidden && e.offsetParent !== null).length)
  const count = (sel) => page.$$eval(sel, (els) => els.length)
  const out = { total: await count('#grid .card'), landing: await visible('#grid .card') }
  out.landingAllAreLanding = await page.$$eval('#grid .card', (els) => els.filter((e) => !e.hidden).every((e) => e.dataset.type === 'landing'))
  await page.click('#types [data-type="admin"]'); await wait(700)
  out.admin = await visible('#grid .card')
  out.adminAllAreAdmin = await page.$$eval('#grid .card', (els) => els.filter((e) => !e.hidden).every((e) => e.dataset.type === 'admin'))
  out.catChipsHiddenOnAdmin = await page.$eval('#filters', (e) => e.hidden)
  await page.click('#types [data-type="all"]'); await wait(700)
  out.all = await visible('#grid .card')
  await page.click('#types [data-type="landing"]'); await wait(700)
  await page.click('#filters [data-cat="AI"]'); await wait(700)
  out.afterAI = await visible('#grid .card')
  await page.click('#filters [data-cat="All"]'); await wait(700)
  // Industry
  const firstField = await page.$eval('#field', (s) => (s.options[1] ? s.options[1].value : ''))
  if (firstField) {
    await page.select('#field', firstField); await wait(700)
    out.field = { name: firstField, cards: await visible('#grid .card'), expected: await page.$$eval('#grid .card', (c, f) => c.filter((e) => e.dataset.field === f && e.dataset.type === 'landing').length, firstField) }
    await page.select('#field', ''); await wait(500)
  }
  // Function chips
  const firstFunc = await page.$eval('#funcs [data-func]:not([data-func=""])', (b) => b.dataset.func).catch(() => '')
  if (firstFunc) {
    await page.click(`#funcs [data-func="${firstFunc}"]`); await wait(700)
    out.func = { id: firstFunc, cards: await visible('#grid .card'), expected: await page.$$eval('#grid .card', (c, f) => c.filter((e) => e.dataset.type === 'landing' && e.dataset.func.split(' ').includes(f)).length, firstFunc) }
    await page.click('#funcs [data-func=""]'); await wait(500)
  }
  // Search
  await page.type('#q', 'spa'); await wait(700)
  out.searchSpa = await visible('#grid .card')
  await page.click('#clear'); await wait(600)
  out.afterClear = await visible('#grid .card')
  // List view
  await page.click('[data-view="list"]'); await wait(700)
  out.listRows = await visible('.row')
  out.gridHidden = await page.$eval('#grid', (g) => getComputedStyle(g).display === 'none')
  await page.click('[data-view="grid"]'); await wait(500)
  // Language
  await page.click('#lang-toggle'); await wait(600)
  out.en = await page.evaluate(() => ({ lang: document.documentElement.lang, h1: document.querySelector('.hero h1').innerText.replace(/\s+/g, ' '), firstHref: document.querySelector('.card:not([hidden]) a').getAttribute('href'), tab: document.querySelector('#types [data-type="admin"]').textContent.trim() }))
  await page.click('#lang-toggle'); await wait(400)
  out.links = (await page.$$eval('.card a', (as) => as.map((a) => a.getAttribute('href')))).length
  // Keyboard: a card link must be reachable with Tab
  await page.evaluate(() => window.scrollTo(0, 0))
  let reached = 0
  for (let i = 1; i <= 80; i++) {
    await page.keyboard.press('Tab')
    if (await page.evaluate(() => !!document.activeElement.closest('.card'))) { reached = i; break }
  }
  out.cardReachedAfterTabs = reached
  out.errors = errors
  console.log(JSON.stringify(out, null, 1))
  await browser.close()
})()
