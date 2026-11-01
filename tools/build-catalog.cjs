// Build the catalog: read every sites/*/meta.json, screenshot each hero as a thumbnail,
// and write ../index.html from catalog.template.html.
// usage: node tools/build-catalog.cjs [--no-thumbs] [--force-thumbs]
const puppeteer = require('puppeteer-core')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const sitesDir = path.join(root, 'sites')
const thumbsDir = path.join(root, 'thumbs')
const skipThumbs = process.argv.includes('--no-thumbs')
const forceThumbs = process.argv.includes('--force-thumbs')
fs.mkdirSync(thumbsDir, { recursive: true })

const slugs = fs.readdirSync(sitesDir)
  // meta.json is written last, once a site passes QA — so a site still being built stays out.
  // Landing pages are NN-slug; admin dashboards have their own numbering, qt-NN-slug.
  .filter((d) => /^(qt-)?\d{2,3}-/.test(d) && fs.existsSync(path.join(sitesDir, d, 'index.html')) && fs.existsSync(path.join(sitesDir, d, 'meta.json')))
  // Numeric order, so 100-… comes after 99-… rather than after 10-…; admin (qt-) after all landing pages.
  .sort((a, b) => a.startsWith('qt-') - b.startsWith('qt-') || parseInt(a.replace(/^qt-/, ''), 10) - parseInt(b.replace(/^qt-/, ''), 10))

;(async () => {
  const browser = skipThumbs ? null : await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars', '--allow-file-access-from-files'],
  })

  const results = new Array(slugs.length)
  const CONCURRENCY = 8

  async function build(idx, introMs) {
    const slug = slugs[idx]
    const metaFile = path.join(sitesDir, slug, 'meta.json')
    let meta = {}
    try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')) } catch { console.warn(`! ${slug}: missing or invalid meta.json`) }
    const thumb = `thumbs/${slug}.jpg`
    const thumbPath = path.join(root, thumb)
    const htmlPath = path.join(sitesDir, slug, 'index.html')
    const needThumb = forceThumbs || !fs.existsSync(thumbPath) || fs.statSync(htmlPath).mtimeMs > fs.statSync(thumbPath).mtimeMs
    if (browser && needThumb) {
      const page = await browser.newPage()
      await page.setViewport({ width: 1440, height: 900 })
      try {
        await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'domcontentloaded', timeout: 15000 })
        await Promise.race([page.evaluate(() => document.fonts && document.fonts.ready), new Promise((r) => setTimeout(r, 3000))])
        await new Promise((r) => setTimeout(r, introMs)) // let intro sequences finish
        await page.screenshot({ path: thumbPath, type: 'jpeg', quality: 72, clip: { x: 0, y: 0, width: 1440, height: 900, scale: 0.5 } })
      } catch (e) {
        console.warn(`! ${slug}: thumbnail failed — ${e.message}`)
      }
      await page.close().catch(() => {})
    }
    results[idx] = {
      slug,
      href: `sites/${slug}/index.html`,
      thumb: fs.existsSync(thumbPath) ? thumb : '',
      title: meta.title || meta.brand || meta.Title || slug.replace(/^(qt-)?\d{2,3}-/, ''),
      title_en: meta.title_en || meta.title || meta.brand || meta.Title || slug.replace(/^(qt-)?\d{2,3}-/, ''),
      sector: meta.sector || '',
      sector_en: meta.sector_en || meta.sector || '',
      category: meta.category || 'Landing',
      field: meta.field || '',
      tagline: meta.tagline || '',
      tagline_en: meta.tagline_en || meta.tagline || meta.sector_en || meta.sector || '',
      palette: Array.isArray(meta.palette) && meta.palette.length ? meta.palette : [meta.bg, meta.accent].filter(Boolean).length ? [meta.bg, meta.accent].filter(Boolean) : ['#f2ff5e'],
      fonts: Array.isArray(meta.fonts) ? meta.fonts : [],
      functions: Array.isArray(meta.functions) ? meta.functions : [],
    }
    console.log(`✓ ${slug}`)
  }

  const landing = [], admin = []
  slugs.forEach((s, i) => (s.startsWith('qt-') ? admin : landing).push(i))
  let next = 0
  async function worker() {
    while (next < landing.length) await build(landing[next++], 1600)
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  // Admin dashboards have heavy intros that stall when 8 pages share the CPU (thumbnails came out
  // blank or half-drawn), so shoot them one at a time with a longer wait.
  for (const idx of admin) await build(idx, 3000)

  const template = fs.readFileSync(path.join(__dirname, 'catalog.template.html'), 'utf8')
  // Escape "<" so a value like "</script>" in meta.json can't break out of the script tag.
  const data = JSON.stringify(results, null, 2).replace(/</g, '\\u003c')
  const funcs = JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname, 'functions.json'), 'utf8')).map(({ id, vi, en, icon }) => ({ id, vi, en, icon }))).replace(/</g, '\\u003c')
  fs.writeFileSync(path.join(root, 'index.html'), template.replace('/*SITES*/[]', () => data).replace('/*FUNCS*/[]', () => funcs))
  console.log(`index.html written with ${results.length} sites`)
  if (browser) await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 2000))])
  process.exit(0)
})()
