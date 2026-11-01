// Authoritative Vietnamese font audit:
// 1) collect every Google Font family referenced by sites/*/index.html (<link> + @import)
// 2) ask Google Fonts which ones ship a `vietnamese` subset
// 3) find CSS font-family names used but never loaded (silent fallback)
// usage: node tools/audit-fonts.cjs
const fs = require('fs')
const path = require('path')
const https = require('https')

const root = path.resolve(__dirname, '..')
const sitesDir = path.join(root, 'sites')
const cacheFile = path.join(__dirname, '_scratch', 'gf-vi-cache.json')
fs.mkdirSync(path.dirname(cacheFile), { recursive: true })
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {}

const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-monospace', 'ui-sans-serif', 'ui-serif', 'inherit', 'initial', 'unset', 'emoji', 'math', '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'roboto', 'helvetica', 'helvetica neue', 'arial', 'georgia', 'times new roman', 'times', 'courier new', 'courier', 'menlo', 'monaco', 'consolas', 'sf mono', 'segoe ui emoji', 'apple color emoji', 'noto color emoji', 'verdana', 'tahoma', 'trebuchet ms', 'garamond', 'palatino', 'impact', 'liberation mono', 'var', 'arial black', 'sf pro display', 'sf pro text', 'segoe ui symbol', 'noto sans', 'ui-rounded', 'lucida console', 'cambria', 'book antiqua', 'didot', 'baskerville', 'optima', 'futura', 'gill sans', 'avenir', 'avenir next', 'american typewriter', 'andale mono', 'courier prime fallback', 'none'])

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' } }, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => resolve({ status: res.statusCode, body: d }))
      })
      .on('error', reject)
  })
}

function familiesFromUrl(u) {
  const out = []
  const dec = decodeURIComponent(u.replace(/&amp;/g, '&'))
  for (const m of dec.matchAll(/family=([^&:]+)/g)) out.push(m[1].replace(/\+/g, ' ').trim())
  // css v1 syntax: family=A|B
  return out.flatMap((f) => f.split('|')).map((f) => f.trim()).filter(Boolean)
}

;(async () => {
  const slugs = fs.readdirSync(sitesDir).filter((d) => /^(qt-)?\d{2,3}-/.test(d) && fs.existsSync(path.join(sitesDir, d, 'index.html')))
  const perSite = {}
  const all = new Set()
  for (const s of slugs) {
    const html = fs.readFileSync(path.join(sitesDir, s, 'index.html'), 'utf8')
    const urls = [...html.matchAll(/https:\/\/fonts\.googleapis\.com\/css2?\?[^"')\s]+/g)].map((m) => m[0])
    const loaded = new Set(urls.flatMap(familiesFromUrl))
    // font-family declarations
    const used = new Set()
    for (const m of html.matchAll(/font-family\s*:\s*([^;}"]+)/gi)) {
      for (let f of m[1].split(',')) {
        f = f.trim().replace(/^['"]|['"]$/g, '').trim()
        if (!f || f.startsWith('var(') || GENERIC.has(f.toLowerCase())) continue
        used.add(f)
      }
    }
    for (const m of html.matchAll(/--[\w-]*(?:font|display|body|serif|sans|mono|heading|ui)[\w-]*\s*:\s*([^;}]+)/gi)) {
      for (let f of m[1].split(',')) {
        f = f.trim().replace(/^['"]|['"]$/g, '').trim()
        if (!f || /^\d|^var\(|px|rem|em$|^#|^rgb|^hsl/i.test(f) || GENERIC.has(f.toLowerCase())) continue
        if (/^[A-Z][\w ]+$/.test(f)) used.add(f)
      }
    }
    // @font-face local families count as loaded
    for (const m of html.matchAll(/@font-face\s*{[^}]*font-family\s*:\s*['"]?([^;'"]+)/gi)) loaded.add(m[1].trim())
    perSite[s] = { loaded: [...loaded], used: [...used] }
    loaded.forEach((f) => all.add(f))
  }

  const fams = [...all].sort()
  let fetched = 0
  for (const f of fams) {
    if (cache[f] !== undefined) continue
    try {
      const r = await get(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(f).replace(/%20/g, '+')}`)
      cache[f] = r.status === 200 ? (/\/\* vietnamese \*\//.test(r.body) ? 'vi' : 'novi') : `http${r.status}`
      fetched++
    } catch (e) {
      cache[f] = 'err'
    }
  }
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2))

  const bad = fams.filter((f) => cache[f] !== 'vi')
  const report = { families: fams.length, fetched, nonVietnamese: bad.map((f) => `${f} (${cache[f]})`), sites: {} }
  for (const [s, { loaded, used }] of Object.entries(perSite)) {
    const issues = []
    for (const f of loaded) if (cache[f] && cache[f] !== 'vi') issues.push(`loads non-VI font "${f}" (${cache[f]})`)
    const loadedLower = new Set(loaded.map((x) => x.toLowerCase()))
    for (const f of used) if (!loadedLower.has(f.toLowerCase())) issues.push(`uses unloaded font "${f}"`)
    if (issues.length) report.sites[s] = issues
  }
  fs.writeFileSync(path.join(__dirname, '_scratch', 'font-audit.json'), JSON.stringify(report, null, 2))
  console.log(`families=${fams.length} fetched=${fetched} nonVI=${bad.length}: ${bad.join(', ')}`)
  console.log(`sites with font issues: ${Object.keys(report.sites).length}`)
  for (const [s, iss] of Object.entries(report.sites).slice(0, 40)) console.log(` - ${s}: ${iss.join('; ')}`)
})()
