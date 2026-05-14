import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import handler from './dist/server/server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const clientDist = path.join(__dirname, 'dist/client')

const mimeTypes = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

const port = process.env.PORT || 3000

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  // Serve static assets
  if (
    url.pathname.startsWith('/assets') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/robots.txt'
  ) {
    const filePath = path.join(clientDist, url.pathname)

    if (existsSync(filePath)) {
      const ext = path.extname(filePath)

      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      })

      createReadStream(filePath).pipe(res)
      return
    }
  }

  // SSR handling
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
    duplex: 'half',
  })

  try {
    const response = await handler.fetch(request)

    res.writeHead(
      response.status,
      Object.fromEntries(response.headers.entries()),
    )

    if (response.body) {
      const reader = response.body.getReader()

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        res.write(value)
      }
    }

    res.end()
  } catch (err) {
    console.error(err)
    res.writeHead(500)
    res.end('Internal Server Error')
  }
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
