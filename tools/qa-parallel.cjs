// Run fast-qa.cjs over every site in N parallel chunks, collecting a summary.
// usage: node tools/qa-parallel.cjs [chunks=4]
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const sites = fs.readdirSync(path.join(root, 'sites'))
  .filter((d) => /^(qt-)?\d{2,3}-/.test(d) && fs.existsSync(path.join(root, 'sites', d, 'index.html')))
  .sort((a, b) => a.startsWith('qt-') - b.startsWith('qt-') || parseInt(a.replace(/^qt-/, ''), 10) - parseInt(b.replace(/^qt-/, ''), 10))
const N = +(process.argv[2] || 4)
const outDir = path.join(__dirname, '_scratch')
fs.mkdirSync(outDir, { recursive: true })
const chunks = Array.from({ length: N }, () => [])
sites.forEach((s, i) => chunks[i % N].push(s))

let done = 0
const t0 = Date.now()
chunks.forEach((list, k) => {
  const log = fs.createWriteStream(path.join(outDir, `qa-chunk-${k}.log`))
  const p = spawn(process.execPath, [path.join(__dirname, 'fast-qa.cjs'), ...list], { cwd: root })
  p.stdout.pipe(log)
  p.stderr.pipe(log)
  p.on('close', () => {
    done++
    if (done === N) {
      let pass = 0
      const fails = []
      for (let j = 0; j < N; j++) {
        const txt = fs.readFileSync(path.join(outDir, `qa-chunk-${j}.log`), 'utf8')
        for (const line of txt.split(/\r?\n/)) {
          if (line.startsWith('PASS ')) pass++
          else if (line.startsWith('FAIL ')) fails.push(line)
        }
        // keep issue detail lines that follow FAIL entries
      }
      const summary = `PASS ${pass} / ${sites.length}\nFAIL ${fails.length}\n${fails.join('\n')}\nTime ${((Date.now() - t0) / 60000).toFixed(1)} min\n`
      fs.writeFileSync(path.join(outDir, 'qa-summary.txt'), summary)
      console.log(summary)
    }
  })
})
