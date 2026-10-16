// Build the catalog: read every sites/*/meta.json, screenshot each hero as a thumbnail,
// and write ../index.html from catalog.template.html.
// usage: node tools/build-catalog.cjs [--no-thumbs]
const puppeteer = require('puppeteer-core')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const sitesDir = path.join(root, 'sites')
const thumbsDir = path.join(root, 'thumbs')
const skipThumbs = process.argv.includes('--no-thumbs')
fs.mkdirSync(thumbsDir, { recursive: true })

const slugs = fs.readdirSync(sitesDir)
  // meta.json is written last, once a site passes QA — so a site still being built stays out.
  .filter((d) => /^\d\d-/.test(d) && fs.existsSync(path.join(sitesDir, d, 'index.html')) && fs.existsSync(path.join(sitesDir, d, 'meta.json')))
  .sort()

;(async () => {
  const sites = []
  const browser = skipThumbs ? null : await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars', '--allow-file-access-from-files'],
  })
  for (const slug of slugs) {
    const metaFile = path.join(sitesDir, slug, 'meta.json')
    let meta = {}
    try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')) } catch { console.warn(`! ${slug}: missing or invalid meta.json`) }
    const thumb = `thumbs/${slug}.jpg`
    if (browser) {
      const page = await browser.newPage()
      await page.setViewport({ width: 1440, height: 900 })
      try {
        await page.goto('file:///' + path.join(sitesDir, slug, 'index.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 })
        await new Promise((r) => setTimeout(r, 4000)) // let intro sequences finish
        await page.screenshot({ path: path.join(root, thumb), type: 'jpeg', quality: 72, clip: { x: 0, y: 0, width: 1440, height: 900, scale: 0.5 } })
      } catch (e) {
        console.warn(`! ${slug}: thumbnail failed — ${e.message}`)
      }
      await page.close()
    }
    sites.push({
      slug,
      href: `sites/${slug}/index.html`,
      thumb: fs.existsSync(path.join(root, thumb)) ? thumb : '',
      title: meta.title || slug.replace(/^\d\d-/, ''),
      sector: meta.sector || '',
      category: meta.category || 'Landing',
      field: meta.field || '',
      tagline: meta.tagline || '',
      palette: Array.isArray(meta.palette) && meta.palette.length ? meta.palette : ['#f2ff5e'],
      fonts: Array.isArray(meta.fonts) ? meta.fonts : [],
    })
    console.log(`✓ ${slug}`)
  }
  if (browser) await browser.close()

  const template = fs.readFileSync(path.join(__dirname, 'catalog.template.html'), 'utf8')
  // Escape "<" so a value like "</script>" in meta.json can't break out of the script tag.
  const data = JSON.stringify(sites, null, 2).replace(/</g, '\\u003c')
  fs.writeFileSync(path.join(root, 'index.html'), template.replace('/*SITES*/[]', data))
  console.log(`index.html written with ${sites.length} sites`)
})()
