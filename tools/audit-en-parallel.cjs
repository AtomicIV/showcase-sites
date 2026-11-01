// Run audit-en.cjs in N parallel chunks and merge results.
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '..')
const sites = fs.readdirSync(path.join(root, 'sites')).filter((d) => /^(qt-)?\d{2,3}-/.test(d))
const N = +(process.argv[2] || 6)
const chunks = Array.from({ length: N }, () => [])
sites.forEach((s, i) => chunks[i % N].push(s))
let done = 0
const all = []
chunks.forEach((list, k) => {
  const p = spawn(process.execPath, [path.join(__dirname, 'audit-en.cjs'), ...list], { cwd: root, env: { ...process.env, AUDIT_OUT: `en-audit-${k}.json` } })
  p.stdout.on('data', () => {})
  p.on('close', () => {
    all.push(...JSON.parse(fs.readFileSync(path.join(__dirname, '_scratch', `en-audit-${k}.json`), 'utf8')))
    if (++done < N) return
    all.sort((a, b) => (b.pct || 0) - (a.pct || 0))
    fs.writeFileSync(path.join(__dirname, '_scratch', 'en-audit.json'), JSON.stringify(all, null, 1))
    const avg = all.reduce((a, r) => a + (r.pct || 0), 0) / all.length
    const errs = all.filter((r) => r.errs || r.err)
    console.log(`sites ${all.length}, avg leftover Vietnamese ${avg.toFixed(2)}%, >5%: ${all.filter((r) => r.pct > 5).length}, >15%: ${all.filter((r) => r.pct > 15).length}, pageerrors: ${errs.length}, not-en: ${all.filter((r) => r.lang !== 'en').length}`)
    for (const r of all.slice(0, 25)) console.log(r.s, r.lang, `${r.pct}%`, r.errs ? `errs ${r.errs}` : '', '|', (r.samples || []).slice(0, 3).join(' ‖ '))
    for (const r of errs.slice(0, 10)) console.log('ERR', r.s, r.err || r.errs)
  })
})
