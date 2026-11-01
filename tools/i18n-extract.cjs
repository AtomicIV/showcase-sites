// Extract every Vietnamese display string per site (HTML text, attributes, JS literals)
// into tools/_i18n/src/<slug>.json, pre-filling known translations.
// usage: node tools/i18n-extract.cjs
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const sitesDir = path.join(root, 'sites')
const outSrc = path.join(__dirname, '_i18n', 'src')
const outKnown = path.join(__dirname, '_i18n', 'known')
fs.mkdirSync(outSrc, { recursive: true })
fs.mkdirSync(outKnown, { recursive: true })
const VI = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i

function decode(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&times;/g, '×')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
}
const norm = (s) => decode(s).replace(/\s+/g, ' ').trim()

// Split a chunk of markup-ish text into text segments between tags.
function segments(s) {
  return s
    .split(/<[^>]*>/)
    .map(norm)
    .filter((t) => t && VI.test(t))
}

function extract(html) {
  const out = []
  const seen = new Set()
  const add = (t) => {
    t = t.trim()
    if (!t || !VI.test(t) || t.length > 600 || seen.has(t)) return
    seen.add(t)
    out.push(t)
  }
  const scripts = []
  let body = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_, js) => {
    scripts.push(js)
    return ' '
  })
  body = body.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
  for (const m of body.matchAll(/>([^<]+)</g)) segments(m[1]).forEach(add)
  for (const m of body.matchAll(/\s(?:placeholder|aria-label|title|alt|data-tip|data-label|content)="([^"]*)"/g)) {
    const t = norm(m[1])
    if (VI.test(t)) add(t)
  }
  for (const js of scripts) {
    // string & template literals
    const re = /(`)((?:\\[\s\S]|\$\{(?:[^{}]|\{[^{}]*\})*\}|(?!`)[^\\])*)`|(['"])((?:\\.|(?!\3)[^\\\n])*)\3/g
    let m
    while ((m = re.exec(js))) {
      let s = m[2] !== undefined ? m[2] : m[4]
      if (!s || !VI.test(s)) continue
      if (m[1]) {
        // template literal: replace ${...} with {0}, {1}...
        let k = 0
        s = s.replace(/\$\{(?:[^{}]|\{[^{}]*\})*\}/g, () => `{${k++}}`)
      }
      s = s.replace(/\\n/g, ' ').replace(/\\(['"`\\])/g, '$1')
      for (const seg of segments(s)) {
        // renumber placeholders within each segment so {0} starts per segment
        let i = 0
        const map = {}
        const t = seg.replace(/\{(\d+)\}/g, (_, d) => `{${map[d] ?? (map[d] = i++)}}`)
        add(t)
      }
    }
  }
  return out
}

// Known translations: global exact pairs (sites 01-70 from git) + meta titles
let known = {}
try {
  const src = fs.readFileSync(path.join(__dirname, 'i18n-dict.js'), 'utf8').replace(/^window\.__AGY_I18N_DICT = /, '').replace(/;\s*$/, '')
  known = JSON.parse(src).exact || {}
} catch {}

const slugs = fs.readdirSync(sitesDir).filter((d) => /^(qt-)?\d{2,3}-/.test(d) && fs.existsSync(path.join(sitesDir, d, 'index.html')))
let totalStrings = 0
let totalMissing = 0
let totalChars = 0
const stats = []
for (const s of slugs) {
  const html = fs.readFileSync(path.join(sitesDir, s, 'index.html'), 'utf8')
  const strings = extract(html)
  const meta = JSON.parse(fs.readFileSync(path.join(sitesDir, s, 'meta.json'), 'utf8'))
  const pre = {}
  if (meta.title && meta.title_en && meta.title !== meta.title_en) pre[meta.title.trim()] = meta.title_en.trim()
  if (meta.sector && meta.sector_en) pre[meta.sector.trim()] = meta.sector_en.trim()
  if (meta.tagline && meta.tagline_en) pre[meta.tagline.trim()] = meta.tagline_en.trim()
  const knownHere = {}
  const missing = []
  for (const t of strings) {
    const k = pre[t] || (s.match(/^(\d+)-/) && parseInt(s, 10) <= 70 ? known[t] : null)
    if (k) knownHere[t] = k
    else missing.push(t)
  }
  fs.writeFileSync(path.join(outSrc, `${s}.json`), JSON.stringify(missing, null, 1))
  fs.writeFileSync(path.join(outKnown, `${s}.json`), JSON.stringify(knownHere, null, 1))
  totalStrings += strings.length
  totalMissing += missing.length
  const chars = missing.reduce((a, t) => a + t.length, 0)
  totalChars += chars
  stats.push({ s, n: missing.length, chars })
}
fs.writeFileSync(path.join(__dirname, '_i18n', 'stats.json'), JSON.stringify(stats, null, 1))
console.log({ sites: slugs.length, totalStrings, totalMissing, totalChars })

