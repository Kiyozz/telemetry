import { connect } from 'node:net'

/**
 * libpq's `sslmode=prefer` tries SSL and falls back to plain TCP when the server
 * doesn't offer it. node-postgres can't fall back, so the server is asked once,
 * with the SSLRequest message of the PostgreSQL protocol: it answers S or N.
 */
export function serverSupportsSsl(host: string, port: number, timeout = 3000): Promise<boolean> {
  return new Promise(resolve => {
    const socket = connect({ host, port })
    const done = (supported: boolean) => {
      socket.destroy()
      resolve(supported)
    }

    socket.setTimeout(timeout, () => done(false))
    socket.once('error', () => done(false))
    socket.once('connect', () => {
      const request = Buffer.alloc(8)
      request.writeInt32BE(8, 0)
      request.writeInt32BE(80877103, 4)
      socket.write(request)
    })
    socket.once('data', data => done(data[0] === 0x53))
  })
}
