import http from 'node:http'

const port = Number(process.env.PROJECTVITE_SYNC_PORT ?? 3210)
let revision = 0
let latest = null

const server = http.createServer(async (request, response) => {
  response.setHeader('access-control-allow-origin', '*')
  response.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS')
  response.setHeader('access-control-allow-headers', 'content-type')
  if (request.method === 'OPTIONS') return finish(response, 204, '')
  if (request.method === 'GET' && request.url?.startsWith('/v1/updates')) {
    return finish(response, 200, JSON.stringify({ protocol: 'projectvite.studio-sync.v1', revision, bundle: latest }))
  }
  if (request.method === 'POST' && request.url === '/v1/sync') {
    try {
      const body = await readBody(request)
      if (body.protocol !== 'projectvite.studio-sync.v1' || typeof body.projectId !== 'string') throw new Error('Invalid sync bundle')
      revision += 1
      latest = { ...body, revision }
      return finish(response, 200, JSON.stringify({ protocol: 'projectvite.studio-sync.v1', accepted: true, revision, operationCount: body.operations?.length ?? 0 }))
    } catch (error) {
      return finish(response, 400, JSON.stringify({ protocol: 'projectvite.studio-sync.v1', accepted: false, revision, operationCount: 0, error: String(error) }))
    }
  }
  finish(response, 404, JSON.stringify({ error: 'Not found' }))
})

server.listen(port, '127.0.0.1', () => console.log(`ProjectVite Studio bridge listening on http://127.0.0.1:${port}`))

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk) => { body += chunk })
    request.on('end', () => {
      try { resolve(JSON.parse(body)) } catch (error) { reject(error) }
    })
    request.on('error', reject)
  })
}

function finish(response, status, body) {
  response.statusCode = status
  response.setHeader('content-type', 'application/json')
  response.end(body)
}
