// Tile the screenshots of one site into contact sheets so many shots can be reviewed at once.
// usage: node tools/sheet.cjs <site-folder> [desktop|mobile]
// Writes tools/shots/_sheet-<site>-<mode>-N.png (8 desktop or 12 mobile shots per sheet).
const puppeteer = require('puppeteer-core')
const fs = require('fs')
const path = require('path')

const [site, mode = 'desktop'] = process.argv.slice(2)
const dir = path.join(__dirname, 'shots')
const prefix = `${site}-${mode}-`
const files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.png')).sort()
const per = mode === 'mobile' ? 12 : 8
const cols = mode === 'mobile' ? 6 : 4
const tile = mode === 'mobile' ? 230 : 360

;(async () => {
  if (!files.length) { console.error('no shots for', prefix); process.exit(1) }
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 2200, height: 2000 })
  for (let s = 0; s * per < files.length; s++) {
    const chunk = files.slice(s * per, (s + 1) * per)
    const html = `<html><body style="margin:0;background:#444;display:grid;grid-template-columns:repeat(${cols},${tile}px);gap:6px;padding:6px;width:max-content;font:12px sans-serif;color:#fff">${chunk
      .map((f) => `<div><img src="file:///${path.join(dir, f).replace(/\\/g, '/')}" style="width:${tile}px;display:block"><div>${f.replace('.png', '')}</div></div>`)
      .join('')}</body></html>`
    const tmp = path.join(dir, `_tmp-${site}.html`)
    fs.writeFileSync(tmp, html)
    await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'load' })
    const out = path.join(dir, `_sheet-${site}-${mode}-${s}.png`)
    await (await page.$('body')).screenshot({ path: out })
    fs.unlinkSync(tmp)
    console.log(out)
  }
  await browser.close()
})()
