// Validate translator output: tools/_i18n/en/<slug>.json must contain every key from
// tools/_i18n/src/<slug>.json with matching {n} placeholders and no leftover Vietnamese words
// (proper names are allowed, so leftovers are only reported as warnings).
// usage: node tools/i18n-check.cjs [slug ...]   (no args = all)
const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, '_i18n')
const VI = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i
let slugs = process.argv.slice(2)
if (!slugs.length) slugs = fs.readdirSync(path.join(dir, 'src')).map((f) => f.replace(/\.json$/, ''))
let ok = 0
const bad = []
for (const s of slugs) {
  const src = JSON.parse(fs.readFileSync(path.join(dir, 'src', `${s}.json`), 'utf8'))
  const f = path.join(dir, 'en', `${s}.json`)
  if (!fs.existsSync(f)) {
    bad.push(`${s}: MISSING FILE (${src.length} strings)`)
    continue
  }
  let en
  try {
    en = JSON.parse(fs.readFileSync(f, 'utf8'))
  } catch (e) {
    bad.push(`${s}: INVALID JSON ${e.message}`)
    continue
  }
  const missing = src.filter((k) => typeof en[k] !== 'string' || !en[k].trim())
  const ph = src.filter((k) => typeof en[k] === 'string' && (k.match(/\{\d+\}/g) || []).sort().join() !== (en[k].match(/\{\d+\}/g) || []).sort().join())
  const leftovers = src.filter((k) => typeof en[k] === 'string' && en[k] === k && k.split(' ').length > 2 && VI.test(k))
  if (missing.length || ph.length || leftovers.length > src.length * 0.15) {
    bad.push(`${s}: missing ${missing.length}, placeholder mismatch ${ph.length}, untranslated ${leftovers.length}/${src.length}` + (missing.length ? ` e.g. ${JSON.stringify(missing.slice(0, 2))}` : ''))
  } else ok++
}
console.log(`OK ${ok}/${slugs.length}`)
bad.forEach((b) => console.log(' - ' + b))
