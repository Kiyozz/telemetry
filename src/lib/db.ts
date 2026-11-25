import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/generated/prisma/client'
import { databaseUrl } from '@/lib/database-url'
import { serverSupportsSsl } from '@/lib/ssl-probe'

const PREFER = ['prefer', 'preferred', 'allow']

/** Resolves `prefer` the way libpq does: SSL when the server offers it, plain TCP otherwise. */
async function preferredSsl(): Promise<boolean | null> {
  try {
    const url = new URL(databaseUrl())

    if (!PREFER.includes(url.searchParams.get('sslmode') ?? '')) {
      return null
    }

    return await serverSupportsSsl(url.hostname, Number(url.port || 5432))
  } catch {
    return null
  }
}

const sslOffered = await preferredSsl()

// node-postgres only knows the libpq values, and would turn the old `preferred` spelling into a verified SSL connection
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
  } else if (PREFER.includes(sslmode ?? '') && sslOffered) {
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
