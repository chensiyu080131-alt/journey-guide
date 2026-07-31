/**
 * 静态导出产物预览服务（模拟线上 nginx 行为）
 * - try_files $uri $uri.html $uri/index.html
 * - 未命中 -> 返回 404 状态码 + out/404.html（品牌 404 页）
 * 用法：node scripts/static-preview.js [port]  （默认 8081）
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'out')
const PORT = Number(process.argv[2]) || 8081

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
}

function safeJoin(root, urlPath) {
  const p = path.normalize(path.join(root, urlPath))
  return p.startsWith(root) ? p : null
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const base = safeJoin(ROOT, urlPath)
    if (!base) {
      res.writeHead(400)
      return res.end('bad request')
    }
    // try_files: $uri, $uri.html, $uri/index.html
    const candidates = [base, `${base.replace(/[\\/]+$/, '')}.html`, path.join(base, 'index.html')]
    for (const file of candidates) {
      try {
        const stat = fs.statSync(file)
        if (stat.isFile()) {
          res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
          return fs.createReadStream(file).pipe(res)
        }
      } catch {
        /* try next */
      }
    }
    // error_page 404 /404.html
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    try {
      fs.createReadStream(path.join(ROOT, '404.html')).pipe(res)
    } catch {
      res.end('404 Not Found')
    }
  })
  .listen(PORT, () => console.log(`static preview ready: http://localhost:${PORT}/ (root=${ROOT})`))
