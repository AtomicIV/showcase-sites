// VI → EN → VI round-trip: real clicks on the switcher, text must return exactly to the original.
const puppeteer = require('puppeteer-core')
const path = require('path')
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
;(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] })
  for (const s of process.argv.slice(2)) {
    const p = await b.newPage()
    const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    await p.setViewport({ width: 1440, height: 900 })
    await p.goto('file:///' + path.resolve(__dirname, '..', 'sites', s, 'index.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' })
    await wait(1500)
    const snap = () => p.evaluate(() => [...document.querySelectorAll('h1,h2,h3,p,button,a,label,li')].slice(0, 400).map((e) => e.innerText).join('\n'))
    const vi = await snap()
    await p.click('#agy-lang-btn'); await wait(800)
    const en = await snap()
    const lang = await p.evaluate(() => document.documentElement.lang)
    await p.click('#agy-lang-btn'); await wait(800)
    const back = await snap()
    const lang2 = await p.evaluate(() => document.documentElement.lang)
    const changed = vi.split('\n').filter((l, i) => l !== en.split('\n')[i]).length
    console.log(`${s}: en=${lang} changedLines=${changed} restoredExactly=${back === vi} vi=${lang2} errors=${errs.length}`)
    await p.close()
  }
  await b.close()
})()

