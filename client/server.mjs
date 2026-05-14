import { createServer } from 'node:http'
import handler from './dist/server/server.js'

const port = process.env.PORT || 3000

const server = createServer(async (req, res) => {
  const url = `http://${req.headers.host}${req.url}`

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
