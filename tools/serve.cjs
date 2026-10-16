// Tiny static server for the showcase (no dependencies).
// usage: node tools/serve.cjs [port=5500]
const http = require('http')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const port = Number(process.argv[2] || process.env.PORT || 5500)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.cjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
}

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0])
  if (rel.endsWith('/')) rel += 'index.html'
  const file = path.join(root, rel)
  // Stay inside the showcase folder.
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden') }
  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) { res.writeHead(301, { Location: rel + '/' }); return res.end() }
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found') }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
    fs.createReadStream(file).pipe(res)
  })
}).listen(port, () => console.log(`Showcase running at http://localhost:${port}/`))
