import nextEnv from '@next/env'
import { defineConfig } from 'prisma/config'

import { databaseUrl } from './src/lib/database-url'

// same .env files as Next.js
nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production')

function url() {
  try {
    return databaseUrl()
  } catch {
    // `prisma generate` doesn't connect: it must work without database variables
    return 'postgresql://localhost/unset'
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: url() },
})
