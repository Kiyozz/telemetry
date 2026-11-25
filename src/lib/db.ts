import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/generated/prisma/client'
import { databaseUrl } from '@/lib/database-url'

/**
 * node-postgres reads `sslmode` itself, but only knows the libpq values: the old
 * `preferred` spelling turned SSL on with certificate checks. `prefer` and `allow`
 * keep SSL without checks, `disable` turns it off.
 */
function createAdapter() {
  const url = new URL(databaseUrl())
  const sslmode = url.searchParams.get('sslmode')

  // Prisma-only parameters that node-postgres doesn't know
  for (const name of [
    'sslmode',
    'schema',
    'pgbouncer',
    'connection_limit',
    'pool_timeout',
    'connect_timeout',
    'socket_timeout',
  ]) {
    url.searchParams.delete(name)
  }

  let ssl: boolean | { rejectUnauthorized: boolean } = false

  if (sslmode === 'require' || sslmode === 'verify-ca' || sslmode === 'verify-full') {
    ssl = { rejectUnauthorized: sslmode !== 'require' }
  } else if (sslmode === 'prefer' || sslmode === 'preferred' || sslmode === 'allow') {
    ssl = { rejectUnauthorized: false }
  }

  return new PrismaPg({ connectionString: url.toString(), ssl })
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function client(): PrismaClient {
  globalForPrisma.prisma ??= new PrismaClient({ adapter: createAdapter() })
  return globalForPrisma.prisma
}

// Created on first use, so that building without database variables works.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const value = Reflect.get(client(), property)
    return typeof value === 'function' ? value.bind(client()) : value
  },
})
