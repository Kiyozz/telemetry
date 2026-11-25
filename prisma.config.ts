import nextEnv from '@next/env'
import { defineConfig, env } from 'prisma/config'

// same .env files and ${VAR} expansion as Next.js
nextEnv.loadEnvConfig(process.cwd())

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
})
